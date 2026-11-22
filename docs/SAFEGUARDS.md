# Safeguards (ABP P1 to P7)

Approved by the user on 2026-11-22. Some are done in the repo. The rest need a few clicks from the repo or account owner, because agents cannot reach those settings.

## Done by the agent

| ID | What | Where |
|----|------|-------|
| C1 to C3 | Content checks: no dashes or banned words, NHS numbers only in the 999 range, inert forms, no third-party scripts, banner and noindex on every page | `scripts/checks.sh` |
| C4 | Accessibility check (axe, WCAG 2.2 AA), light and dark | `scripts/a11y.mjs` |
| C5 | Secret scan (gitleaks) | workflow |
| Deploy gate | Pages only deploys from main after every check passes | `.github/workflows/checks-and-deploy.yml` |
| P2 (part) | CODEOWNERS for `.github/`, `.claude/`, `scripts/` and the ABP | `.github/CODEOWNERS` |

## Needs the owner (in this order)

1. **Turn on Pages.** Repo Settings, Pages, Source: **GitHub Actions**. Then re-run the latest "Checks and deploy" run, or push any change.
2. **P1 Branch ruleset on main.** Settings, Rules, Rulesets, New branch ruleset. Target: `main`. Tick "Restrict deletions" and "Block force pushes". Leave the bypass list empty.
3. **P2 Required checks.** In the same ruleset tick "Require status checks to pass" and add `checks`. Agents then push to their branch, wait for green, and push the same commit to main. Direct push to main still works for tested commits.
   - Optional, stricter: also tick "Require a pull request" with "Require review from Code Owners". This ends direct push to main by agents. You merge each change.
4. **P3 Secret scanning.** Settings, Code security. Turn on Secret scanning and Push protection.
5. **P4 Workflow permission.** GitHub, Settings, Applications, Claude, Configure. Remove the "Workflows" write permission. Agents then cannot change CI. Grant it again only when you want CI changed.
6. **P5 Google Drive.** claude.ai, Settings, Connectors. Disconnect Google Drive, or keep it off for this project's sessions.
7. **P6 Spend cap.** claude.ai, Settings, Usage or Billing. Set a monthly limit you are comfortable with.
8. **P7 Repo visibility.** Your call. The repo is public. It holds only invented data. A private repo with a public Pages site needs a paid GitHub plan. Recommendation: stay public while it is a mock-up.

Tell the conductor when each is done so the ABP barrier tags can be updated.
