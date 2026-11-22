# Synthetic user review of the five design concepts

> **Synthetic personas, not real people.** These reviews were written by an AI playing five made-up users. They are a quick sense check, not user research. Test the chosen design with real surgeons, patients, clinic staff, physios and IG leads before building anything real.

Scope: home page (A) and clinician view (B) for each concept in `DESIGNS.md`. Scores are out of 10.

## Persona 1: Consultant knee surgeon

52. NHS and private practice. About 150 ACL reconstructions a year. Has four minutes between cases.

- **C1 Clear Ward: 8.** Everything I need sits on one screen. The missing Marx score is flagged in amber with one button. Charts are small but the table underneath does the work.
- **C2 Night Theatre: 8.** The densest view and the fastest to read. The data status checklist is excellent. Dark theme is fine in my office but not on a ward PC under strip lights.
- **C3 Home Straight: 5.** Lovely for patients. The timeline makes me scroll to find the graft and fixation. I would not use it between cases.
- **C4 Match Fit: 6.** The scoreboard header is quick to read. Bars of year 2 against baseline are a smart idea. Too loud for a clinical record, and the Marx bar shows year 1, which confused me.
- **C5 Annual Report: 7.** Reads like a good case report and carries academic weight. Prose injury history is slow when I want facts. Ideal for the annual report pages.

Top 3 concerns:
1. Speed. The key facts must fit above the fold on a 1366 wide trust laptop.
2. No view of my own outcomes against the national picture in any concept yet.
3. The surgical form at the end of a case is not drawn. It must take under two minutes.

Must-haves: patient search by NHS number; key facts strip; data status checklist; short op form with graft, fixation, meniscus and cartilage; "my outcomes vs national" chart with revision rate.

## Persona 2: Patient

24. Amateur footballer. Four months after ACL reconstruction. Does everything on a phone.

- **C1 Clear Ward: 6.** Clean and trustworthy, like a good NHS app. A bit plain. The example record card helped me get what the site is for.
- **C2 Night Theatre: 4.** Looks like it is for doctors, not me. Lots of codes and small text. I would not know where to start.
- **C3 Home Straight: 9.** Feels like it is talking to me. "One short form is waiting, about two minutes" is exactly what would get me to fill it in. The timeline tells my story.
- **C4 Match Fit: 8.** Love the scoreboard. Seeing my KOOS Sport go 35, 70, 85 would keep me going. Capital letters everywhere get tiring to read.
- **C5 Annual Report: 4.** Looks like a journal. Serious and clever, but not for me on a bus.

Top 3 concerns:
1. None of the screens shows a phone layout or the patient portal itself.
2. I need to know what my scores mean. "85" means nothing without "higher is better" and a plain label.
3. Who can see my record, and can I change that easily?

Must-haves: mobile patient portal; "form due" reminder with time estimate; my progress chart in plain words; sharing controls with a clear list of who has access; my scans and letters.

## Persona 3: Clinic administrator / medical secretary

45. Enters registrations and triage histories all day. Uses the keyboard, not the mouse.

- **C1 Clear Ward: 8.** Calm, readable, good contrast for a long day. The home page promises keyboard entry and errors that say what to fix. I want to see that admin screen.
- **C2 Night Theatre: 7.** The status list and patient search are what I need. Monospace NHS numbers are easy to check digit by digit. Dark screens all day would tire my eyes.
- **C3 Home Straight: 5.** Friendly, but a lot of white space and scrolling. "Send Megan a reminder" is a nice touch.
- **C4 Match Fit: 6.** "Chase Marx score" is clear. The bold headings and bright yellow would be hard work for eight hours.
- **C5 Annual Report: 4.** Nice to read. Not a place to type fifty registrations. Serif labels slow me down.

Top 3 concerns:
1. The admin dashboard is not drawn in any concept. It is my whole job.
2. Registration form needs tab order, NHS number check digit and date format help.
3. I need worklists: missing consent, overdue scores, incomplete op forms.

Must-haves: register patient form with validation; triage history form; worklists with filters and counts; bulk reminder action; clear saved or error messages.

## Persona 4: Musculoskeletal physiotherapist

Runs ACL rehab and collects KOOS and Marx at set points.

- **C1 Clear Ward: 8.** Shows all KOOS subscales and Marx in one table. The chart legend is a bit small. Missing data is easy to spot.
- **C2 Night Theatre: 7.** Plotting Pain, Sport and QoL together is useful. Good for audit. Hard to show a patient on screen in clinic.
- **C3 Home Straight: 6.** Lovely to show a patient. Only KOOS Sport is charted, and Marx at year 2 is not obvious.
- **C4 Match Fit: 8.** Year 2 against baseline bars are the best rehab view here. Patients would respond to it. Needs a fix so Marx shows the right time point.
- **C5 Annual Report: 6.** Small multiples are clear. Good for teaching. Too slow for clinic.

Top 3 concerns:
1. No rehab milestones or return to sport date anywhere.
2. Score entry by the physio in clinic, on a tablet, is not shown.
3. Scores need context: baseline, change, and the national range at that time point.

Must-haves: score entry on tablet; all KOOS subscales plus Marx; change from baseline view; national comparison band; physio notes or milestones on the timeline.

## Persona 5: Information governance lead / Caldicott guardian

NHS trust. Cares how trust, privacy and security are explained to staff and patients.

- **C1 Clear Ward: 8.** "Locked on your device" is calm and honest. It says the mock-up has no encryption and key recovery is open. The mock-up banner is clear on every screen.
- **C2 Night Theatre: 6.** Security gets a card, which is good. Mock-up label is small and orange in a corner. Dark styling feels like a developer tool, not a care record.
- **C3 Home Straight: 7.** "Only the people you choose can read it" is the right message for patients. Must not overpromise while key recovery is unsolved.
- **C4 Match Fit: 5.** "Locked before it leaves your phone" is catchy but loose. The sporty tone undercuts trust with boards and the public.
- **C5 Annual Report: 8.** Most sober and accurate. The note on vault keys and data loss is exactly right. Reads like a governance document.

Top 3 concerns:
1. Any real NHS number pattern in the demo. Use the 999 test range only, as done here.
2. Security claims must not run ahead of the design. Key recovery and access in an emergency must be named as open.
3. Consent and access must be visible: who opened a record, when, and why.

Must-haves: Security page that states plainly what is real and what is not; access log on each record; consent status and history; persistent mock-up banner; privacy notice draft; link to BASK relationship once known.

## Synthesis

### Ranking

| Rank | Concept | Surgeon | Patient | Admin | Physio | IG | Average |
|---|---|---|---|---|---|---|---|
| 1 | C1 Clear Ward | 8 | 6 | 8 | 8 | 8 | **7.6** |
| 2 | C4 Match Fit | 6 | 8 | 6 | 8 | 5 | 6.6 |
| 3= | C2 Night Theatre | 8 | 4 | 7 | 7 | 6 | 6.4 |
| 3= | C3 Home Straight | 5 | 9 | 5 | 6 | 7 | 6.4 |
| 5 | C5 Annual Report | 7 | 4 | 4 | 6 | 8 | 5.8 |

C1 has no low score. Every other concept has at least one persona at 5 or below.

### Recommendation

Build the first clickable mock-up on **Concept 1, Clear Ward**. It works for all three user groups, reads as a clinical service, and is the easiest base to extend into the admin and patient screens.

### Changes to adopt from other concepts

- **From C2:** the key facts strip under the patient name; the data status checklist; patient search by NHS number beside the role switcher; monospace digits for NHS numbers and dates.
- **From C2:** offer a dark theme later as an option, not the default.
- **From C3:** the warm patient voice and "one short form is waiting, about two minutes" reminder for the patient portal; the injury to next check-in timeline as a patient view; "Send a reminder" wording.
- **From C4:** the year 2 against baseline bars for physios and patients; the score summary row (35, 70, 85, Due) in the clinician header. Keep C1 colours, not volt.
- **From C5:** numbered figures with captions and the ruled outcome table for public and annual report pages; the honest vault key note on the Security page; small multiples for each score.
- **Fix in all:** the Marx bar in C4 points at year 1 while year 2 is missing. Charts must always label the time point shown.

### Top 10 must-haves for the site build

1. A mock-up banner on every page and every demo screen, with only made-up data and 999 range NHS numbers.
2. Admin dashboard: worklists for missing consent, overdue scores and incomplete op forms, with counts and filters.
3. Register patient and triage history forms, keyboard first, with NHS number check and errors that say what to fix.
4. Clinician workspace: key facts strip, data status checklist, injury, surgery, scores and scans on one screen at 1366 wide.
5. Short surgical form at the end of a case: graft, fixation, meniscus, cartilage. Under two minutes.
6. Patient portal built mobile first: form due reminder, progress chart in plain words, scans and letters.
7. Sharing controls for patients, plus an access log and consent history on each record.
8. Score views with all KOOS subscales and Marx, change from baseline, and clear labels for each time point.
9. "My outcomes vs national" page for surgeons, led by revision rate, using made-up figures.
10. A Security page that says what the sgit vault design plans, what the mock-up does not do, and that key recovery is unsolved.

Every button in the demo must lead somewhere, even if to a simple "not built yet" page.
