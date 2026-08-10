# Agent instructions — mobility-blueprint-2025

## Git workflow

**Every new feature starts in its own isolated worktree, on a fresh branch off `main` — never in this shared checkout, and never from whatever happens to be checked out here.**

This repo runs many parallel agent worktrees and feature branches at once (`git branch -vv` routinely shows a dozen+, several with unpushed or in-flight commits). The branch checked out in this directory when a session starts is frequently mid-flight, unrelated work — not a safe base to build on, and not a safe place to build a new feature in either (parallel work landing here can collide with it).

Before writing or editing any code:

1. Use the `EnterWorktree` tool to create an isolated worktree for the feature (it branches off `origin/main` by default — that's what we want here). If `EnterWorktree` isn't available for some reason, create one by hand instead:
   ```
   git fetch origin main
   git worktree add ../mobility-blueprint-2025-<name> -b <descriptive-branch-name> origin/main
   ```
2. Do all the work for the feature inside that worktree — code, migrations, scripts, everything.
3. One concern per branch/PR. Don't let an unrelated fix ride along on an existing feature branch's history just because it was the one already checked out — it bundles unrelated changes into the same Vercel preview/PR and makes review and rollback harder.
4. Before pushing, re-check the branch's commit log (`git log --oneline main..HEAD`) and confirm every commit on it is relevant to the change being shipped.
5. Every feature ends in a PR for human review — never a direct push to `main`. Commit, push (see "Push access" below), then open the PR (see "Opening a PR" below).

## Push access

`git push` over the configured SSH remote may fail here (no publickey access in this environment). If so, push over HTTPS using the already-authenticated `gh` CLI credentials instead of changing the remote:
```
git push -u https://github.com/artisan-code-team/mobility-blueprint-2025.git <branch>
```
Because that push isn't associated with the `origin` remote, the branch won't have an upstream tracking ref — `gh pr create` can't infer the head branch on its own and will error with "you must first push the current branch to a remote". Pass the repo and branch explicitly instead:
```
gh pr create --repo artisan-code-team/mobility-blueprint-2025 --head <branch> --base main --title "..." --body "..."
```

**Never push directly to `main`, even for trivial changes, and never pass `--admin` or otherwise use bypass privileges to skip review.** `main` has branch protection requiring PRs; the `gh` credentials available in this environment can bypass it, and GitHub will silently allow the push with a `Bypassed rule violations` notice rather than rejecting it outright — that "success" is not permission. If a push to `main` ever succeeds without a PR, treat it as a mistake to fix (revert + reapply via a proper PR), not a shortcut to reuse.

## Other conventions

Stack/style/architecture conventions for this codebase live in `.cursorrc` in this same directory — read that too.
