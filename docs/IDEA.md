# UK Ligament Registry: the idea

Proposed redraft of the UK National Ligament Registry. Name: UK Ligament Registry. Mock-up only. No real patient data anywhere.

## The request

- From Mr Gupte, consultant knee surgeon.
- Build a UK national knee ligament registry website.
- Model it on the New Zealand ACL Registry (aclregistry.nz).
- Start as a clickable mock-up on GitHub Pages.

## What the NZ registry does (reference model)

Checked against aclregistry.nz on 2026-11-22. Points marked (unchecked) are from public knowledge only.

- An initiative of the New Zealand Knee Society, part of the New Zealand Orthopaedic Association.
- Committed to in October 2013. Pilot with 5 surgeons over 3 months. Nationwide registration from November 2014.
- Now the national standard for reporting ACL surgery. About 3,000 reconstructions a year.
- Aims: who is most at risk, which techniques work best, who is at risk of reinjury, what patients can expect.
- Top menu: About, Patients, Health Professionals, Find a Surgeon, Research & Reports, Contact.
- Records every primary and revision ACL reconstruction. (unchecked)
- Surgeon fills a short form at surgery: graft type, fixation, meniscus and cartilage findings. (unchecked)
- Patients fill outcome scores before surgery and at 1, 2, 5 and 10 years. (unchecked)
- Scores used: KOOS and an activity scale. (unchecked)
- Main outcome tracked: revision surgery. (unchecked)
- Publishes annual reports so surgeons can compare results. (unchecked)

Ideas to borrow for the UK site: a "Find a surgeon" page and a "Research and reports" page.

## Outcome scores for the UK version

Asked for by the clinical lead. Details from mykneescore.com.

- **IKDC Subjective Knee Evaluation Form.** 18 questions. One score from 0 to 100. Higher is better. Bands: normal 90 or more, near normal 80 to 89, abnormal 70 to 79, severely abnormal under 70. https://www.mykneescore.com/advanced/ikdc.html
- **KOOS.** 42 questions. Five subscales, each 0 to 100, higher is better: pain, symptoms, daily living (ADL), sport and recreation, quality of life. https://www.mykneescore.com/advanced/koos.html
- **Short form pain score.** Shown in the mock-up as a 0 to 10 pain rating: 0 is no pain, 10 is the worst pain imaginable. Lower is better. The exact instrument is still to be confirmed. All its wording and logic sits in `REG.painScore` in `assets/js/data.js`, so it can be swapped in one place. https://www.mykneescore.com/advanced/index.html
- **SANE (Single Assessment Numeric Evaluation).** One question: "How would you rate your knee today, as a percentage of normal?" 0 to 100%. Higher is better. https://www.mykneescore.com/advanced/sane.html

Collected before surgery and at 1, 2, 5 and 10 years.

## What the UK version adds

Mr Gupte wants three groups served, not just surgeons.

### Patients
- One place for their own knee record.
- Scans, letters, operation notes, outcome scores.
- Reminders when a follow-up score is due.
- Control over who can see their record.

### Clinicians
- Fast view of a patient's full knee history.
- Imaging, op notes and scores side by side.
- Personal outcome data against the national picture.
- Short surgical form at the end of a case.

### Administrators
- A back-office dashboard, separate from the public site.
- Register new patients: name, date of birth, NHS number, contact details.
- Take a short triage history before the consultant sees the patient.
- Track consent, missing data and overdue follow-ups.

## Feedback from Mr Gupte, 2026-11-24

Access by role:
- Patient: own record and the patient area only.
- Clinician: own patients and own clinician area only.
- Administrator: all patients and all data.

Patient scores:
- Clear call to action to score the knee.
- One question at a time. Auto-advance on answer. Back button. Forward button only after going back.
- Results shown straight away as the reward: table, bar charts, percentage scores.
- Clear call to action to see trends over time.
- Disclaimer: "This is for guidance only. Your clinician will need to interpret these scores."

Admin analytics:
- Scores by time point for the whole cohort.
- Scores for one patient across their timeline.
- Score trends by graft, fixation and other procedures (meniscus repair, LET), plus age and sex.

Also: trust signals on data security, and calmer landing pages.

## Security model (to be designed properly later)

Sensitive data is meant to live in an encrypted vault built on the sgit architecture by Dinis Cruz (sgit.ai).

Points taken from sgit.ai that shape the design:
- Data is encrypted on the device before upload. AES-256-GCM.
- The server never sees contents, filenames or keys.
- One vault key opens a vault. Losing it means losing the data. No password reset.
- Public key messaging exists for sending data vault to vault.
- sgit is still in beta. Some key splitting is a design in progress.

What this means for us:
- Each patient record could be its own vault.
- Key handling and recovery are the hard part for a clinical system. We need a clear answer before anything real is stored.
- The mock-up only shows the idea. It has no real crypto.

## Site map for the mock-up

Top ribbon:
1. Home: what the registry is and does
2. Patients
3. Clinicians
4. Administrators
5. Security
6. Try it out

Try it out opens a demo with three role views:
- Patient portal
- Clinician workspace
- Admin dashboard

Every button in the demo leads somewhere. Data is made up.

## Out of scope for now

- Real login, real encryption, real storage
- NHS integration (Spine, PDS, PACS)
- Ethics, DPIA, Caldicott and DSPT work
- Any real patient data

## Open points

- Resolved 2026-11-22: the UK National Ligament Registry (set up by BASK in 2013) is not active. It is being revised, and Mr Gupte is officially leading the revision. This site is a proposed redraft for that work.
- Name agreed 2026-11-22: UK Ligament Registry. Branding still open.
- Who owns the data and who funds it.
