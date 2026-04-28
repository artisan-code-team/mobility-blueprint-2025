#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function runAndCapture(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code}\n${stderr}`));
      }
    });
  });
}

function runInherit(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: false,
      env: process.env,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function extractPreviewUrl(comments) {
  const vercelComments = (comments || []).filter((comment) => comment?.author?.login === "vercel");
  for (let i = vercelComments.length - 1; i >= 0; i -= 1) {
    const body = vercelComments[i]?.body || "";
    const previewMarkdownMatch = body.match(/\[Preview\]\((https:\/\/[^\s)]+\.vercel\.app)\)/i);
    if (previewMarkdownMatch?.[1]) {
      return previewMarkdownMatch[1];
    }

    const genericMatch = body.match(/https:\/\/[a-z0-9.-]+\.vercel\.app/gi);
    if (genericMatch?.length) {
      const preferred = genericMatch.find((url) => url.includes("-git-"));
      return preferred || genericMatch[0];
    }
  }
  return "";
}

function parseForwardArgs(argv) {
  const passthrough = [...argv];
  const hasLabel = passthrough.includes("--label");
  return { passthrough, hasLabel };
}

async function main() {
  const { stdout: prRaw } = await runAndCapture("gh", [
    "pr",
    "view",
    "--json",
    "number,url,comments,headRefName",
  ]);

  const pr = JSON.parse(prRaw);
  const previewUrl = extractPreviewUrl(pr.comments);
  if (!previewUrl) {
    throw new Error(
      `No Vercel preview URL found in PR comments for branch "${pr.headRefName}". ` +
        "Wait for the Vercel PR comment, or set QA_BASE_URL manually."
    );
  }

  const { passthrough, hasLabel } = parseForwardArgs(process.argv.slice(2));
  const labelParts = [`pr-${pr.number}`, "preview"];
  if (pr.headRefName) {
    labelParts.push(pr.headRefName.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 32));
  }
  const defaultLabel = labelParts.join("-");

  const qaArgs = ["scripts/qa-video.mjs", "--base-url", previewUrl];
  if (!hasLabel) {
    qaArgs.push("--label", defaultLabel);
  }
  qaArgs.push(...passthrough);

  console.log(`PR: ${pr.url}`);
  console.log(`Using Vercel preview URL: ${previewUrl}`);
  await runInherit("node", qaArgs);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
