# Status

Last updated: 2026-11-22

## Stage

Phase 1 built and on main. Waiting for GitHub Pages to be switched on, then Mr Gupte's review.

## Done

- Project idea written up (docs/IDEA.md).
- ABP v1 written, reviewed by a separate agent, now v2 (docs/ABP.md).
- UI/UX agent brief written (docs/agents/UI-UX-AGENT-PROMPT.md).
- 5 design concepts on a Claude Design canvas, with copies in docs/designs/.
- 5 synthetic users reviewed the concepts (docs/designs/REVIEWS.md). Concept 1, Clear Ward, ranked first at 7.6.
- Clickable site built in Concept 1. 11 pages. Patient, clinician and admin demos.
- Tests: 81 views crawled, 109 buttons clicked, 28 of 28 flows passed, no axe violations (WCAG 2.2 AA).
- Pushed to main. GitHub Pages must be switched on once in repo Settings, source GitHub Actions (API blocked from the build environment).

## Next

- Mr Gupte reviews the concepts and the live site.
- Restyle if a different concept is picked.
- Review the ABP again (phase 1 review).

## Blockers

- sgsend.ai still not reachable. aclregistry.nz and riskmandate.ai now open.
- Pages and safeguards P1 to P7 need the owner (docs/SAFEGUARDS.md).

## Change log

| Date | Change |
|------|--------|
| 2026-11-22 | Repo set up. Planning docs, ABP v1 and agent brief added. |
| 2026-11-22 | ABP v2 after review. 5 design concepts. Synthetic user review. |
| 2026-11-22 | Clickable mock-up built and pushed to main. |
| 2026-11-22 | Site and docs reframed as a proposed redraft of the UK National Ligament Registry. |
| 2026-11-22 | Renamed to UK Ligament Registry. Mr Chinmay Gupte named as clinical lead. NZ facts checked. ABP v2.1. CI checks C1 to C5 and deploy gate added. |
| 2026-11-22 | Added Find a surgeon and Research pages. Two-row desktop header. Repo stays public (owner decision, ABP P7). |
| 2026-11-22 | Bronze and green palette. Scores changed to IKDC, KOOS, short form pain score and SANE (from mykneescore.com). Marx removed. |
