# Token ledger

Sub-agent figures come from the platform's usage report. Conductor figures are estimates.

| # | Agent | Task | Tokens | Note |
|---|-------|------|--------|------|
| 1 | Web fetch | NZ registry, sgit, ABP sources (3 rounds) | ~45k | 3 hosts blocked |
| 2 | Conductor | Planning docs, ABP v1, brief | ~40k | estimate |
| 3 | ABP reviewer | ABP v1 to v2 | 73k | |
| 4 | UI/UX agent | 5 concepts in Claude Design + repo copies | 180k | |
| 5 | Synthetic users | 5 personas review concepts | 82k | one agent, 5 roles |
| 6 | UI/UX agent | Build full clickable site and tests | 278k | **over the 250k per-agent cap** |
| 7 | Conductor | Coordination, checks, deploy | ~90k | estimate |
| 8 | Web fetch | NZ and riskmandate retry (WebFetch blocked, used curl) | ~7k | |
| 9 | Conductor | Rename, safeguards, CI, docs | ~60k | estimate |
| 10 | Conductor | Find a surgeon and Research pages, tests | ~45k | estimate |
| 11 | Conductor | Palette, mykneescore research, checks | ~40k | estimate |
| 12 | Scores agent | Swap scores to IKDC, KOOS, pain, SANE | 145k | |

**Phase 1 total: about 1.09M of 1.2M budget (91%, over the 80% warning line).**

Lesson: the site build should have been split into two agent runs (public pages, then demo app).

Budget for phase 1: about 1.2M tokens. See ABP section 6.

## Phase 2

Budget: 1M tokens (set by the user, 2026-11-23). Warn at 800k.

| # | Agent | Task | Tokens | Note |
|---|-------|------|--------|------|
| 1 | UI/UX agent | Less blocky redesign, serif titles, self-hosted fonts | 146k | |
| 2 | Conductor | Brief, review, deploy | ~25k | estimate |
| 3 | UI/UX agent A | One-question score flow, results, trends, roles, trust, landing | 155k | |
| 4 | UI/UX agent B | Admin analytics and invented cohort | 156k | |
| 5 | Conductor | Briefs, review, tests | ~40k | estimate |

Phase 2 so far: about 520k of 1M.
