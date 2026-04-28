#!/usr/bin/env node

import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function parseArgs(argv) {
  const parsed = {
    baseUrl: "",
    label: "happy-path",
    keepTmp: false,
    allowLocalhost: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--base-url" && argv[i + 1]) {
      parsed.baseUrl = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--label" && argv[i + 1]) {
      parsed.label = argv[i + 1].trim() || parsed.label;
      i += 1;
      continue;
    }
    if (arg === "--keep-tmp") {
      parsed.keepTmp = true;
    }
    if (arg === "--allow-localhost") {
      parsed.allowLocalhost = true;
    }
  }

  return parsed;
}

function normalizeUrl(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isLocalUrl(value) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function resolveBaseUrl(args) {
  const candidates = [
    args.baseUrl,
    process.env.QA_BASE_URL,
    process.env.QA_VERCEL_PREVIEW_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeUrl(candidate);
    if (normalized) return normalized;
  }

  return "http://127.0.0.1:3000";
}

function runCommand(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env,
      stdio: "inherit",
      shell: false,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code ?? "unknown"}`));
      }
    });

    child.on("error", reject);
  });
}

function buildSpecSource(baseUrl) {
  const safeBaseUrl = JSON.stringify(baseUrl);
  return `import { test, expect } from "@playwright/test";

test("home happy path", async ({ page }) => {
  await page.goto(${safeBaseUrl});
  await expect(page.getByText("Mobility Blueprint")).toBeVisible();

  await page.getByRole("link", { name: "Live classes" }).click();
  await expect(page.getByText("LIVE CLASSES")).toBeVisible();

  await page.getByRole("link", { name: "LEARN MORE ABOUT SATURDAY VINYASA →" }).click();
  await expect(page).toHaveURL(/\\/saturday-vinyasa/);
});
`;
}

function buildPlaywrightConfigSource(baseUrl, videoDir) {
  const safeBaseUrl = JSON.stringify(baseUrl);
  const safeVideoDir = JSON.stringify(videoDir);
  return `import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 45_000,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: ${safeBaseUrl},
    browserName: "chromium",
    video: "on",
    trace: "off",
    screenshot: "off",
    viewport: { width: 1440, height: 900 },
  },
  outputDir: ${safeVideoDir},
});
`;
}

async function postArtifacts(videoPath, label) {
  const absoluteVideoPath = path.resolve(videoPath);
  const metadata = {
    label,
    videoPath: absoluteVideoPath,
    generatedAt: new Date().toISOString(),
  };

  const uploadCommand = process.env.QA_VIDEO_UPLOAD_COMMAND;
  let uploadedUrl = "";
  if (uploadCommand) {
    const uploadResultPath = path.join(projectRoot, "qa-video-upload-result.json");
    const command = `VIDEO_PATH="${absoluteVideoPath}" OUTPUT_JSON="${uploadResultPath}" ${uploadCommand}`;
    await runCommand(process.platform === "win32" ? "cmd" : "sh", process.platform === "win32" ? ["/c", command] : ["-c", command]);

    try {
      const raw = await readFile(uploadResultPath, "utf8");
      const parsed = JSON.parse(raw);
      uploadedUrl = parsed.url || "";
    } catch (error) {
      console.warn("Upload command ran, but no valid OUTPUT_JSON url was found.");
    }
  }

  const commentBody = uploadedUrl
    ? `QA video (${label}): ${uploadedUrl}`
    : `QA video (${label}) generated locally at: ${absoluteVideoPath}`;

  if (process.env.QA_POST_GH_PR_COMMENT === "1") {
    await runCommand("gh", ["pr", "comment", "--body", commentBody]);
  }

  if (process.env.QA_JIRA_COMMENT_ENDPOINT) {
    await fetch(process.env.QA_JIRA_COMMENT_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: commentBody,
        label,
      }),
    });
  }

  metadata.uploadedUrl = uploadedUrl;
  await writeFile(
    path.join(projectRoot, `qa-video-result-${timestamp()}.json`),
    JSON.stringify(metadata, null, 2),
    "utf8"
  );

  return { uploadedUrl, commentBody };
}

async function findNewestWebm(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const videos = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const childPath = path.join(directory, entry.name);
      const nested = await findNewestWebm(childPath);
      if (nested) videos.push(nested);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".webm")) {
      const fullPath = path.join(directory, entry.name);
      const info = await stat(fullPath);
      videos.push({ path: fullPath, mtimeMs: info.mtimeMs });
    }
  }

  if (!videos.length) return null;
  videos.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return videos[0];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  args.baseUrl = resolveBaseUrl(args);
  if (isLocalUrl(args.baseUrl) && !args.allowLocalhost) {
    throw new Error(
      `Resolved QA base URL is local (${args.baseUrl}). ` +
        "Set QA_BASE_URL/QA_VERCEL_PREVIEW_URL (or pass --base-url) to your Vercel preview URL. " +
        "Use --allow-localhost only for intentional local debugging."
    );
  }

  const tmpRoot = await mkdtemp(path.join(tmpdir(), "qa-video-"));
  const tmpSpecPath = path.join(tmpRoot, "happy-path.spec.ts");
  const tmpConfigPath = path.join(tmpRoot, "playwright.temp.config.ts");
  const artifactsDir = path.join(projectRoot, "artifacts", "qa-videos", `${timestamp()}-${args.label}`);

  await mkdir(artifactsDir, { recursive: true });
  await writeFile(tmpSpecPath, buildSpecSource(args.baseUrl), "utf8");
  await writeFile(tmpConfigPath, buildPlaywrightConfigSource(args.baseUrl, artifactsDir), "utf8");

  const testEnv = {
    ...process.env,
    CI: process.env.CI || "1",
  };

  try {
    await runCommand("npx", ["playwright", "test", tmpSpecPath, "--config", tmpConfigPath], testEnv);
  } catch (error) {
    console.error("Playwright happy-path run failed.");
    throw error;
  } finally {
    if (!args.keepTmp) {
      await rm(tmpRoot, { recursive: true, force: true });
    }
  }

  const newest = await findNewestWebm(artifactsDir);
  if (!newest) {
    throw new Error("No .webm video found in Playwright output.");
  }

  const { uploadedUrl, commentBody } = await postArtifacts(newest.path, args.label);
  console.log("");
  console.log("QA video workflow complete.");
  console.log(`- Video: ${newest.path}`);
  if (uploadedUrl) {
    console.log(`- Uploaded URL: ${uploadedUrl}`);
  }
  console.log(`- Comment text: ${commentBody}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
