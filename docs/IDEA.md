# OMKH Ligament Registry: the idea

Proposed redraft of the UK National Ligament Registry. Working name. Mock-up only. No real patient data anywhere.

## The request

- From Mr Gupte, consultant knee surgeon.
- Build a UK national knee ligament registry website.
- Model it on the New Zealand ACL Registry (aclregistry.nz).
- Start as a clickable mock-up on GitHub Pages.

## What the NZ registry does (reference model)

The NZ site could not be reached from our build environment. These points come from public knowledge and need checking against the live site.

- Started in 2014. Run by surgeons, funded through the national accident scheme.
- Records every primary and revision ACL reconstruction.
- Surgeon fills a short form at surgery: graft type, fixation, meniscus and cartilage findings.
- Patients fill outcome scores before surgery and at 1, 2, 5 and 10 years.
- Scores used: KOOS and the Marx activity scale.
- Main outcome tracked: revision surgery.
- Publishes annual reports so surgeons can compare results.

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
- Final name and branding.
- Who owns the data and who funds it.
