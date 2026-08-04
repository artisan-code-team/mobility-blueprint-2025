# Agent instructions — mobility-blueprint-2025

## Git workflow

**Always start new work from a fresh branch off `main`, never from whatever happens to be checked out.**

This repo runs many parallel agent worktrees and feature branches at once (`git branch -vv` routinely shows a dozen+, several with unpushed or in-flight commits). The branch that's checked out when a session starts is frequently mid-flight, unrelated work — not a safe base.

Before writing or editing any code:

1. Run `git status` and `git log --oneline -5` (or `git branch -vv`) to see what's currently checked out and whether it's already ahead of `origin/main` with commits unrelated to the task at hand.
2. If it is, don't build on top of it. Create a new branch from `main` first:
   ```
   git fetch origin main
   git checkout -b <descriptive-branch-name> origin/main
   ```
3. One concern per branch/PR. Don't let an unrelated fix ride along on an existing feature branch's history just because it was the one already checked out — it bundles unrelated changes into the same Vercel preview/PR and makes review and rollback harder.
4. Before pushing, re-check the branch's commit log (`git log --oneline main..HEAD`) and confirm every commit on it is relevant to the change being shipped.

## Push access

`git push` over the configured SSH remote may fail here (no publickey access in this environment). If so, push over HTTPS using the already-authenticated `gh` CLI credentials instead of changing the remote:
```
git push -u https://github.com/artisan-code-team/mobility-blueprint-2025.git <branch>
```

## Other conventions

Stack/style/architecture conventions for this codebase live in `.cursorrc` in this same directory — read that too.
