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
- Scores used: KOOS and the Marx activity scale. (unchecked)
- Main outcome tracked: revision surgery. (unchecked)
- Publishes annual reports so surgeons can compare results. (unchecked)

Ideas to borrow for the UK site: a "Find a surgeon" page and a "Research and reports" page.

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
