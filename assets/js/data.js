/* Made-up demo data. Every person, hospital, surgeon and number here is invented.
   NHS numbers use the 999 test range. All dates sit in a fixed demo world where today is 12 June 2030. */
window.REG = {
  today: "2030-06-12",

  /* ===== SHORT FORM PAIN SCORE: the only place it is defined. =====
     The exact instrument is still to be confirmed. To swap it, change this object only.
     Everything on the site (labels, scale, demo questions, charts and wording) reads from here. */
  painScore: {
    key: "pain",
    label: "Short form pain score",
    short: "Pain score",
    min: 0, max: 10, step: 1, lowerBetter: true,
    question: "How bad has your knee pain been in the last week?",
    anchors: ["0 = no pain", "10 = worst pain imaginable"],
    scaleText: "0 to 10. 0 means no pain and 10 means the worst pain imaginable. Lower is better.",
    // Demo item: one 0 to 10 rating. Options are the numbers 0 to 10.
    options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    score: function (answer) { return answer; },
    words: function (v) { return v === 0 ? "no pain" : v <= 3 ? "mild pain" : v <= 6 ? "moderate pain" : "severe pain"; }
  },

  user: {
    clinician: "Ms Rachel Example",
    admin: "Test Administrator B",
    patient: "p1"
  },
  hospitals: ["Northfield Demo Hospital", "Riverside Test Clinic", "Eastgate Sample Infirmary"],
  surgeons: ["Ms Rachel Example", "Mr Kofi Sampleton", "Mr Dan Mockley"],
  // Score order in each "v" array follows REG.measures below:
  // IKDC, KOOS pain, symptoms, daily living, sport, quality of life, short form pain score, SANE. null = not returned.
  patients: [
    { id: "p1", name: "Megan Sample", sex: "Female", dob: "2006-03-14", nhs: "999 526 0182", phone: "07700 900101",
      hospital: "Northfield Demo Hospital", surgeon: "Ms Rachel Example", knee: "Right",
      injury: { date: "2028-02-11", how: "Netball. Landed from a jump, no contact.", findings: "Complete ACL tear. Medial meniscus tear, posterior horn." },
      surgery: { date: "2028-06-01", type: "Primary ACL reconstruction", graft: "Hamstring autograft, 4-strand, 8.5 mm", femFix: "Suspensory button", tibFix: "Interference screw", meniscus: "Medial repair, all-inside", cartilage: "No damage above grade 2", signed: true },
      scores: { pre: { date: "2028-05-10", v: [48, 64, 57, 78, 35, 31, 6, 40] }, y1: { date: "2029-06-05", v: [82, 86, 79, 94, 70, 62, 2, 80] } },
      consent: { status: "given", date: "2028-03-01", research: true },
      scans: [["2028-02-20", "MRI, right knee", "Complete ACL tear. Medial meniscus tear."], ["2028-06-01", "X-ray, right knee", "After surgery. Fixation in place."], ["2029-08-03", "MRI, right knee", "Graft intact."]],
      letters: [["2028-03-01", "Clinic letter after first visit", "Ms Rachel Example"], ["2028-06-02", "Operation note", "Ms Rachel Example"], ["2029-06-12", "1-year review letter", "Ms Rachel Example"]],
      rehab: [["2028-09-20", "Running on the flat"], ["2029-02-14", "Cleared for netball training"], ["2029-04-03", "Back to full netball matches"]],
      access: [["2030-06-02", "Ms Rachel Example", "Clinic review"], ["2029-06-12", "Test Physio C", "Rehab check"], ["2029-06-05", "Megan Sample", "Filled in 1-year scores"]] },

    { id: "p2", name: "Ravi Example", sex: "Male", dob: "1998-07-02", nhs: "999 159 0838", phone: "07700 900102",
      hospital: "Northfield Demo Hospital", surgeon: "Ms Rachel Example", knee: "Left",
      injury: { date: "2028-06-30", how: "Football. Twisted when tackled.", findings: "Complete ACL tear. Bone bruising." },
      surgery: { date: "2028-09-14", type: "Primary ACL reconstruction", graft: "Patellar tendon (BTB), 10 mm", femFix: "Interference screw", tibFix: "Interference screw", meniscus: "No tear", cartilage: "Grade 1 change, lateral femoral condyle", signed: true },
      scores: { pre: { date: "2028-08-20", v: [52, 70, 64, 82, 40, 38, 5, 45] }, y1: { date: "2029-09-20", v: [84, 88, 82, 95, 75, 69, 2, null] } },
      consent: { status: "given", date: "2028-08-20", research: true },
      scans: [["2028-07-08", "MRI, left knee", "Complete ACL tear. Bone bruising."]],
      letters: [["2028-09-15", "Operation note", "Ms Rachel Example"]],
      rehab: [["2029-03-01", "Running on the flat"]],
      access: [["2029-09-21", "Ms Rachel Example", "1-year review"]] },

    { id: "p3", name: "Chloe Demo", sex: "Female", dob: "2010-11-20", nhs: "999 016 6137", phone: "07700 900103",
      hospital: "Riverside Test Clinic", surgeon: "Mr Kofi Sampleton", knee: "Right",
      injury: { date: "2029-09-12", how: "Skiing. Fell with the ski twisted.", findings: "Complete ACL tear." },
      surgery: { date: "2029-11-03", type: "Primary ACL reconstruction", graft: "Hamstring autograft, 4-strand, 8 mm", femFix: "Suspensory button", tibFix: "Interference screw", meniscus: "", cartilage: "", signed: false },
      scores: { pre: { date: "2029-10-20", v: [46, 68, 60, 80, 30, 25, 6, 35] } },
      consent: { status: "given", date: "2029-10-20", research: false },
      scans: [["2029-09-20", "MRI, right knee", "Complete ACL tear."]],
      letters: [],
      rehab: [["2030-03-10", "Full range of movement"]],
      access: [["2030-05-14", "Mr Kofi Sampleton", "Post-op review"]] },

    { id: "p4", name: "Tom Testwell", sex: "Male", dob: "1985-01-09", nhs: "999 186 0916", phone: "07700 900104",
      hospital: "Eastgate Sample Infirmary", surgeon: "Mr Dan Mockley", knee: "Left",
      injury: { date: "2027-10-02", how: "Five-a-side football. Graft gave way on a turn.", findings: "Re-tear of earlier ACL graft." },
      surgery: { date: "2028-02-10", type: "Revision ACL reconstruction", graft: "Quadriceps tendon autograft, 9 mm", femFix: "Suspensory button", tibFix: "Interference screw", meniscus: "Lateral partial meniscectomy", cartilage: "Grade 3, medial femoral condyle", signed: true },
      scores: { pre: { date: "2028-01-20", v: [38, 55, 50, 70, 20, 19, 7, 30] } },
      consent: { status: "given", date: "2028-01-20", research: true },
      scans: [["2027-10-15", "MRI, left knee", "Graft rupture."], ["2028-02-10", "X-ray, left knee", "After revision surgery."]],
      letters: [["2028-02-11", "Operation note", "Mr Dan Mockley"]],
      rehab: [],
      access: [["2028-02-11", "Mr Dan Mockley", "Operation note"]] },

    { id: "p5", name: "Aisha Mockford", sex: "Female", dob: "1994-05-30", nhs: "999 390 9963", phone: "07700 900105",
      hospital: "Northfield Demo Hospital", surgeon: "Ms Rachel Example", knee: "Right",
      injury: { date: "2030-02-18", how: "Netball. Sudden stop and turn.", findings: "Complete ACL tear. Lateral meniscus tear." },
      surgery: { date: "2030-05-20", type: "Primary ACL reconstruction", graft: "Hamstring autograft, 5-strand, 9 mm", femFix: "", tibFix: "", meniscus: "", cartilage: "", signed: false },
      scores: { pre: { date: "2030-05-01", v: [42, 60, 55, 74, 28, 25, 6, 35] } },
      consent: { status: "pending", date: "", research: false },
      scans: [["2030-02-26", "MRI, right knee", "Complete ACL tear. Lateral meniscus tear."]],
      letters: [],
      rehab: [],
      access: [["2030-05-20", "Ms Rachel Example", "Surgery"]] },

    { id: "p6", name: "Owen Placeholder", sex: "Male", dob: "2003-08-17", nhs: "999 030 8241", phone: "07700 900106",
      hospital: "Northfield Demo Hospital", surgeon: "Ms Rachel Example", knee: "Right",
      injury: { date: "2030-04-02", how: "Rugby. Hit on the outside of the knee.", findings: "Awaiting MRI report." },
      surgery: null,
      scores: {},
      consent: { status: "pending", date: "", research: false },
      scans: [],
      letters: [],
      rehab: [],
      access: [] },

    { id: "p7", name: "Grace Fakely", sex: "Female", dob: "1979-12-01", nhs: "999 628 1949", phone: "07700 900107",
      hospital: "Riverside Test Clinic", surgeon: "Mr Kofi Sampleton", knee: "Left",
      injury: { date: "2025-03-15", how: "Skiing. Fell backwards.", findings: "Complete ACL tear." },
      surgery: { date: "2025-06-11", type: "Primary ACL reconstruction", graft: "Hamstring autograft, 4-strand, 8 mm", femFix: "Suspensory button", tibFix: "Suspensory button", meniscus: "No tear", cartilage: "Grade 2, patella", signed: true },
      scores: { pre: { date: "2025-05-20", v: [44, 62, 60, 76, 30, 28, 6, 40] }, y1: { date: "2026-06-15", v: [78, 84, 80, 92, 65, 60, 3, 75] }, y2: { date: "2027-06-20", v: [86, 90, 85, 95, 72, 70, 1, 85] } },
      consent: { status: "given", date: "2025-05-20", research: false },
      scans: [["2025-03-25", "MRI, left knee", "Complete ACL tear."]],
      letters: [["2027-07-01", "2-year review letter", "Mr Kofi Sampleton"]],
      rehab: [["2026-01-10", "Back to hill walking"]],
      access: [["2027-06-21", "Mr Kofi Sampleton", "2-year review"]] },

    { id: "p8", name: "Sam Specimen", sex: "Male", dob: "2000-02-22", nhs: "999 821 9930", phone: "07700 900108",
      hospital: "Eastgate Sample Infirmary", surgeon: "Mr Dan Mockley", knee: "Right",
      injury: { date: "2026-08-01", how: "Basketball. Landed on another player's foot.", findings: "Complete ACL tear. Medial meniscus tear." },
      surgery: { date: "2026-10-05", type: "Primary ACL reconstruction", graft: "Hamstring autograft, 4-strand, 8 mm", femFix: "Suspensory button", tibFix: "Interference screw", meniscus: "Medial repair", cartilage: "No damage above grade 2", signed: true },
      scores: { pre: { date: "2026-09-10", v: [47, 66, 58, 80, 32, 30, 5, 40] }, y1: { date: "2027-10-10", v: [80, 85, 78, 93, 68, 60, 2, 80] }, y2: { date: "2028-10-12", v: [68, 80, 72, 90, 55, 50, 4, 60] } },
      consent: { status: "given", date: "2026-09-10", research: true },
      revision: { date: "2029-03-14", reason: "Graft re-rupture playing basketball" },
      scans: [["2029-02-20", "MRI, right knee", "Graft rupture."]],
      letters: [["2029-03-15", "Revision operation note", "Mr Dan Mockley"]],
      rehab: [],
      access: [["2029-03-15", "Mr Dan Mockley", "Revision surgery"]] },

    { id: "p9", name: "Jordan Trial", sex: "Not stated", dob: "1996-04-04", nhs: "999 518 1908", phone: "07700 900109",
      hospital: "Riverside Test Clinic", surgeon: "Mr Kofi Sampleton", knee: "Left",
      injury: { date: "2028-11-10", how: "Climbing. Fell from a bouldering wall.", findings: "Complete ACL tear." },
      surgery: { date: "2029-01-15", type: "Primary ACL reconstruction", graft: "Quadriceps tendon autograft, 9 mm", femFix: "Suspensory button", tibFix: "Suspensory button", meniscus: "No tear", cartilage: "No damage above grade 2", signed: true },
      scores: { pre: { date: "2028-12-20", v: [55, 72, 66, 84, 42, 35, 4, 50] } },
      consent: { status: "given", date: "2028-12-20", research: true },
      scans: [["2028-11-20", "MRI, left knee", "Complete ACL tear."]],
      letters: [],
      rehab: [],
      access: [] },

    { id: "p10", name: "Priya Pretend", sex: "Female", dob: "1990-09-09", nhs: "999 231 9488", phone: "07700 900110",
      hospital: "Northfield Demo Hospital", surgeon: "Ms Rachel Example", knee: "Right",
      injury: { date: "2029-04-22", how: "Hockey. Turned sharply.", findings: "Complete ACL tear." },
      surgery: { date: "2029-06-30", type: "Primary ACL reconstruction", graft: "Hamstring autograft, 4-strand, 8.5 mm", femFix: "Suspensory button", tibFix: "Interference screw", meniscus: "No tear", cartilage: "No damage above grade 2", signed: true },
      scores: { pre: { date: "2029-06-01", v: [45, 63, 59, 79, 33, 30, 6, 40] } },
      consent: { status: "withdrawn", date: "2030-01-08", research: false },
      scans: [["2029-05-02", "MRI, right knee", "Complete ACL tear."]],
      letters: [],
      rehab: [],
      access: [] }
  ],
  // Today's clinic at Northfield Demo Hospital.
  clinic: [
    { time: "09:00", id: "p6", reason: "New patient. Triage before consultant." },
    { time: "09:30", id: "p5", reason: "3 weeks after surgery." },
    { time: "10:15", id: "p1", reason: "Routine review." },
    { time: "11:00", id: "p10", reason: "Pre-op scores check." },
    { time: "11:30", id: "p2", reason: "Rehab check." }
  ],
  // Invented figures. Not from any real registry, surgeon or hospital.
  national: {
    ikdc2yMine: 84, ikdc2yNat: 81, pain2yMine: 1, pain2yNat: 2, sane2yMine: 85, sane2yNat: 80,
    revisionMine: 2.9, revisionNat: 4.1, casesMine: 140, casesNat: 9800,
    sport2yMine: 81, sport2yNat: 77, returnRateMine: 71, returnRateNat: 66,
    perYear: [[2026, 31, 3.4], [2027, 35, 3.0], [2028, 38, 2.8], [2029, 36, 2.6]]
  }
};

/* Outcome measures, in the order of each "v" array. The pain entry comes from REG.painScore. */
window.REG.measures = [
  { key: "ikdc", name: "IKDC", long: "IKDC Subjective Knee Evaluation", short: "IKDC", min: 0, max: 100, lowerBetter: false },
  { key: "koosPain", name: "KOOS Pain", short: "KOOS Pain", min: 0, max: 100, lowerBetter: false },
  { key: "koosSym", name: "KOOS Symptoms", short: "KOOS Sym", min: 0, max: 100, lowerBetter: false },
  { key: "koosAdl", name: "KOOS Daily living", short: "KOOS ADL", min: 0, max: 100, lowerBetter: false },
  { key: "koosSport", name: "KOOS Sport and recreation", short: "KOOS Sport", min: 0, max: 100, lowerBetter: false },
  { key: "koosQol", name: "KOOS Quality of life", short: "KOOS QoL", min: 0, max: 100, lowerBetter: false },
  { key: window.REG.painScore.key, name: window.REG.painScore.label, short: window.REG.painScore.short, min: window.REG.painScore.min, max: window.REG.painScore.max, lowerBetter: window.REG.painScore.lowerBetter },
  { key: "sane", name: "SANE", long: "Single Assessment Numeric Evaluation", short: "SANE", min: 0, max: 100, unit: "%", lowerBetter: false }
];
window.REG.M = {}; window.REG.measures.forEach(function (m, i) { window.REG.M[m.key] = i; });
// IKDC bands, from mykneescore.com.
window.REG.ikdcBand = function (v) { return v >= 90 ? "Normal" : v >= 80 ? "Near normal" : v >= 70 ? "Abnormal" : "Severely abnormal"; };
