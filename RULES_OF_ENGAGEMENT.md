# Rules of Engagement — Developer / AI Collaboration

This project uses a small set of agreed rules that the developer and the AI assistant must follow. The rules below make expectations explicit so we avoid accidental commits, unexpected builds, or missed verification steps.

These rules are intended for the working branch `development` (and not `main`) unless otherwise approved by the repo owner.

## Core Rule — The Sequence (must follow)

1. Test (unit / integration) — run the project's test runner (vitest, jest, etc.). If there are no tests, report that none were found. Do not skip this step for any non-trivial change.
2. Build — run a production build and confirm it completes successfully (for Next.js: `npm run build` or `next build`).
3. Commit (and push) — only after tests and build succeed. Commits should be focused and follow the commit message guide below.

If any step fails: stop and report the failure. Do not proceed to the next step without explicit confirmation from the human collaborator.

## Commit & Push Policy

- Only commit once tests and build have passed (see Core Rule).
- When unsure or making risky changes, open a feature branch and push the branch for a PR, ask for review before merging to `development` or `main`.
- Use conventional, descriptive commit messages. Prefixes we use include `fix`, `feat`, `refactor`, `chore`, `docs`.

## Interaction Rules (AI-specific)

- Always show the short plan of actions before performing edits when a change involves multiple steps.
- Use the repository's TODO tracker for multi-step work and update it as you progress. Only one in-progress todo allowed at a time.
- Ask for explicit human approval before pushing commits to the remote repository or opening PRs unless user explicitly asked to proceed.
- Do not make silent global refactors — present proposed changes and get confirmation for broad or risky edits.

## Local Verification Checklist

Before committing, the AI should always run (when applicable):

- TypeScript typecheck: `npx tsc --noEmit`
- Linter: `npm run lint`
- Tests: `npx vitest run` or repository test script
- Production build: `npm run build`

If the project contains visual UI components, the AI should recommend running the dev server and doing a quick manual smoke test in the browser before pushing.

## Emergency / Rollback

- If a bad commit was pushed by mistake, stop further pushes and propose one of these options:
  - revert the commit locally and force update a feature branch (NOT main) — only with approval
  - open a revert PR and ask for reviewer approvals if other team members should confirm the change

## Commit Message Guide (examples)

- fix(epic): add missing handleAddLink handler
- refactor(team): extract TeamMembers shared component
- chore(types): add next-env.d.ts (generated)

## Final behavior for the assistant

- When the developer says “test, then build, then commit” the assistant MUST run tests, run build, then commit — in that order — and obtain approval before pushing to remote.

---

If you want any of these rules modified, we can change the file now. Tell me which lines to tweak and I’ll update it (and follow the test→build→commit flow when making that change).
