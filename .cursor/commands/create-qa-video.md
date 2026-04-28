Run the PR-preview QA video workflow for the current branch.

Steps:
1. Execute:
   `npm run qa:video:pr -- $ARGUMENTS`
2. Share:
   - PR URL detected
   - Preview URL used
   - Final `.webm` artifact path
3. If no Vercel preview URL is found in PR comments, instruct the user to wait for the Vercel PR comment or provide `QA_BASE_URL` manually.
