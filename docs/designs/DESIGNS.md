# Design concepts

Five visual concepts for the OMKH Ligament Registry mock-up. Each has a home page (A) and a "Try it out" clinician view (B) of the same made-up patient, Megan Lloyd (NHS 999 042 1187). Mock-up. Not real patient data.

Files: `concept-N.html` (both screens stacked) and `concept-N.png` (full page at 1440 wide). All five also sit on one Claude Design canvas.

Each concept uses one Google Font plus a system stack, as the brief allows.

## Concept 1: Clear Ward
- Palette: ground #F6F9F8, surface #FFFFFF, ink #12302B, muted #4A625D, teal #0F6E66, mint #E2F0EC, line #D3E2DE, amber note #FFF1D6 / #7A4A00.
- Fonts: Inter for everything, system-ui fallback.
- Layout: calm clinical light. Hero with an "example record" card showing what is saved, done and missing. Clinician view has a patient sidebar with the one primary action, and cards for injury, surgery, charts and scans.
- Suits: a safe first build. Works for all three user groups. Closest to what a hospital board expects.

## Concept 2: Night Theatre
- Palette: ground #0D1117, panel #161B22, line #2A313C, text #E6EDF3, muted #9DA7B3, cyan #56C8E0, orange #F2A65A, green #6CD39A.
- Fonts: IBM Plex Sans, with ui-monospace for NHS numbers, dates and scores.
- Layout: dark and data-dense. Key facts in a strip, then a grid of panels with a data-status checklist, small charts and compact tables. Patient search sits beside the role switcher.
- Suits: consultants and registry analysts who live in the data. Too stark for patients on its own; would need a light theme for the patient portal.

## Concept 3: Home Straight
- Palette: ground #FFF8F1, surface #FFFFFF, ink #2B211C, muted #5E4E44, terracotta #A2471F, sage #3F5E3A, sand #F3E3D3, soft amber #FFF4D9.
- Fonts: Nunito, system-ui fallback.
- Layout: warm and patient-first. Centred hero, pill navigation, a friendly "one short form is waiting" reminder. Clinician view tells the knee's story as a vertical timeline from injury to the next check-in.
- Suits: patients, many on phones. Clinicians may find the timeline slower to scan than a grid.

## Concept 4: Match Fit
- Palette: navy #0B1533, panel navy #16224A, volt #D7FF3F (only behind navy text or on navy), cool grey #F2F4F8, slate #46506A, warning #C2410C / #FFE4D6.
- Fonts: Barlow Condensed (uppercase headings and big numbers), system-ui body.
- Layout: sport and athletic. Diagonal volt band, scoreboard of KOOS Sport over time, "ten-year season" strip. Clinician view uses a scoreboard header and bars showing year 2 against before surgery.
- Suits: young, sporty patients and sports medicine clinics. Risk of feeling less clinical to older patients and to boards.

## Concept 5: Annual Report
- Palette: paper #FBFAF7, ink #1A1A1A, oxblood #7A1F2B, rule #CFCAC0, muted #5B5750, note #EFE9DD.
- Fonts: Source Serif 4 for text and headings, system sans for labels and navigation.
- Layout: editorial. Masthead with double rule, numbered chapters, numbered figures with captions, ruled tables. Clinician view reads as a case report with a side column for details and the one action.
- Suits: surgeons, researchers and the annual report itself. Gives the registry academic weight. Less suited to fast admin data entry.

## Open questions
- Each concept is shown in one mode only. Dark or light counterparts still need designing.
- Admin dashboard and patient portal screens are not drawn yet.
- Name and logo are placeholders until branding is agreed.
