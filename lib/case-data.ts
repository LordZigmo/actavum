// The mock investigation. Everything the prototype shows is derived from here.
// IDs are short and stable so positions, edges, evidence, and timeline can
// reference each other.

import type {
  Entity,
  OpenQuestion,
  Point,
  Relationship,
  TimelineEvent,
} from "./types";

export const CASE_META = {
  name: "Mallory Workers' Comp Inquiry",
  number: "ACT-2026-0207",
  client: "Keystone Mutual Insurance — SIU",
  investigator: "Z. Davis",
  status: "Active",
  opened: "May 12, 2026",
};

// --- Entities (10) + evidence documents (4, modeled as type "document") ------

export const ENTITIES: Entity[] = [
  {
    id: "claimant",
    type: "person",
    label: "Travis Mallory",
    subtitle: "Claimant · indemnity benefits",
    confidence: "high",
    tags: ["Subject", "Total-disability claim", "Surveillance hits"],
    aliases: ["T. Mallory", "Travis J. Mallory", "“TJ” Mallory"],
    notes:
      "Primary subject. Collecting weekly total-disability indemnity on a claimed lifting injury at Apex. Filmed performing roofing labor inconsistent with his certified restrictions.",
    evidenceIds: ["doc_surv", "doc_ime"],
  },
  {
    id: "doctor",
    type: "person",
    label: "Dr. Paul Whitfield",
    subtitle: "Treating physician · pain mgmt",
    confidence: "medium",
    tags: ["Treating provider", "Keeps claimant out of work", "High visit volume"],
    aliases: ["P. Whitfield, MD"],
    notes:
      "Pain-management physician certifying continued total disability. Findings conflict with the independent medical exam; office-visit frequency and billing flagged for review.",
    evidenceIds: ["doc_ime"],
  },
  {
    id: "apex",
    type: "company",
    label: "Apex Warehousing & Logistics",
    subtitle: "Insured employer",
    confidence: "high",
    tags: ["Employer", "Policyholder", "Injury site"],
    aliases: ["Apex Warehousing", "Apex W&L"],
    notes:
      "Claimant's employer of record and the insured under the comp policy. Site of the alleged lifting injury at the loading dock.",
    evidenceIds: ["doc_claim"],
  },
  {
    id: "ridgeline",
    type: "company",
    label: "Ridgeline Roofing & Exteriors",
    subtitle: "Undisclosed employer?",
    confidence: "high",
    tags: ["Undisclosed work", "Cash payroll?", "Key lead"],
    aliases: ["Ridgeline Roofing", "Ridgeline Exteriors"],
    notes:
      "Claimant observed performing roofing work for Ridgeline during the benefit period and appears on its online listing. Undisclosed income suspected.",
    evidenceIds: ["doc_surv", "doc_bank"],
  },
  {
    id: "addr",
    type: "address",
    label: "117 Drumlin Rd",
    subtitle: "Camillus, NY 13031",
    confidence: "medium",
    tags: ["Residence", "Staging site"],
    aliases: ["117 Drumlin Road"],
    notes:
      "Claimant's residence of record. Surveillance shows ladders and roofing materials loaded here; the pickup is registered to this address.",
    evidenceIds: ["doc_surv", "doc_claim"],
  },
  {
    id: "phone",
    type: "phone",
    label: "(315) 555-0147",
    subtitle: "Mobile · on roofing ad",
    confidence: "medium",
    tags: ["Contact", "Listed on ad"],
    aliases: ["+1 315-555-0147"],
    notes:
      "Number listed on the Ridgeline roofing listing and answered by the claimant during a pretext call to schedule an estimate.",
    evidenceIds: ["doc_surv"],
  },
  {
    id: "email",
    type: "email",
    label: "tjmallory.roofs@gmail.com",
    subtitle: "Contact on listing",
    confidence: "medium",
    tags: ["Sender", "Free webmail"],
    aliases: ["tjmallory.roofs@gmail.com"],
    notes:
      "Contact address on the online roofing listing, used to arrange a covert estimate appointment. Headers not yet obtained.",
    evidenceIds: ["doc_surv"],
  },
  {
    id: "bank",
    type: "bankAccount",
    label: "Solvay CU ∗∗∗∗3390",
    subtitle: "Personal checking",
    confidence: "medium",
    tags: ["Deposits", "Undisclosed income?"],
    aliases: ["Acct ending 3390"],
    notes:
      "Claimant's personal checking. Deposit records show recurring checks drawn on Ridgeline during weeks indemnity benefits were paid.",
    evidenceIds: ["doc_bank"],
  },
  {
    id: "vehicle",
    type: "vehicle",
    label: "White Chevy Silverado",
    subtitle: "Plate NY JKR-7720 · ladder rack",
    confidence: "medium",
    tags: ["Asset", "Ladder rack", "On surveillance"],
    aliases: ["Chevrolet Silverado 2500"],
    notes:
      "Pickup fitted with a roof-mounted ladder rack, filmed at two Ridgeline job sites. Registered to 117 Drumlin Rd.",
    evidenceIds: ["doc_surv"],
  },
  {
    id: "injury",
    type: "event",
    label: "Alleged Lifting Injury",
    subtitle: "Mar 3, 2026 · Apex dock",
    date: "Mar 3, 2026",
    confidence: "medium",
    tags: ["Claimed", "Unwitnessed", "Lumbar"],
    aliases: ["DOI 03/03/2026"],
    notes:
      "Claimant reports a lower-back injury lifting a pallet at the Apex loading dock. No direct witness. Basis for the indemnity claim.",
    evidenceIds: ["doc_claim"],
  },

  // --- Evidence documents ---------------------------------------------------
  {
    id: "doc_surv",
    type: "document",
    label: "Surveillance Summary 05-28.pdf",
    subtitle: "PDF · 9 pages",
    date: "May 28, 2026",
    confidence: "high",
    tags: ["Source", "Field report"],
    aliases: [],
    notes:
      "Three days of covert observation. Claimant filmed carrying shingle bundles, climbing a ladder, and operating a nail gun at a Ridgeline job.",
    evidenceIds: [],
    mentions: ["claimant", "ridgeline", "vehicle"],
  },
  {
    id: "doc_ime",
    type: "document",
    label: "IME Report — Dr. Sandoval.pdf",
    subtitle: "Independent medical exam",
    date: "May 20, 2026",
    confidence: "high",
    tags: ["Source", "Medical"],
    aliases: [],
    notes:
      "Independent exam finds full functional capacity with no objective lumbar deficit — directly contradicting the treating physician's total-disability certification.",
    evidenceIds: [],
    mentions: ["claimant", "doctor"],
  },
  {
    id: "doc_claim",
    type: "document",
    label: "Claim File C-7731 (FROI)",
    subtitle: "First report of injury",
    date: "Mar 5, 2026",
    confidence: "high",
    tags: ["Source", "Claim record"],
    aliases: [],
    notes:
      "First report of injury and wage statement establishing the indemnity claim against Apex. Lists the claimant's address and treating provider.",
    evidenceIds: [],
    mentions: ["claimant", "apex", "injury"],
  },
  {
    id: "doc_bank",
    type: "document",
    label: "Deposit Records ∗∗∗∗3390.pdf",
    subtitle: "PDF · 4 pages",
    date: "May 2026",
    confidence: "high",
    tags: ["Source", "Bank record"],
    aliases: [],
    notes:
      "Deposit history for the claimant's checking account showing recurring Ridgeline checks during indemnity-payment weeks.",
    evidenceIds: [],
    mentions: ["bank", "ridgeline"],
  },
];

// --- Relationships -----------------------------------------------------------
// 7 confirmed entity-to-entity relationships (these are the "7" in the report),
// plus evidence "mentioned in" links derived below. Probable edges are added by
// the Auto-Link action and live in PROBABLE_EDGES.

export const RELATIONSHIPS: Relationship[] = [
  {
    id: "r_treats",
    label: "treated by",
    category: "relationship",
    sourceId: "claimant",
    targetId: "doctor",
    confidence: "high",
    evidenceIds: ["doc_ime"],
    notes: "Treating physician of record certifying continued total disability.",
  },
  {
    id: "r_employed",
    label: "employed by",
    category: "relationship",
    sourceId: "claimant",
    targetId: "apex",
    confidence: "high",
    evidenceIds: ["doc_claim"],
    dateRange: { start: "Mar 3, 2026" },
    notes: "Employer of record and insured; site of the alleged injury.",
  },
  {
    id: "r_works",
    label: "appears working for",
    category: "relationship",
    sourceId: "claimant",
    targetId: "ridgeline",
    confidence: "medium",
    evidenceIds: ["doc_surv"],
    notes:
      "Filmed performing roofing labor for Ridgeline during the benefit period — the central red flag.",
  },
  {
    id: "r_resides",
    label: "resides at",
    category: "relationship",
    sourceId: "claimant",
    targetId: "addr",
    confidence: "high",
    evidenceIds: ["doc_claim"],
    notes: "Address of record; also the surveillance staging point.",
  },
  {
    id: "r_registered_veh",
    label: "registered to",
    category: "relationship",
    sourceId: "vehicle",
    targetId: "addr",
    confidence: "medium",
    evidenceIds: ["doc_surv"],
    notes: "The ladder-rack pickup ties to the claimant's address.",
  },
  {
    id: "r_uses_phone",
    label: "uses",
    category: "relationship",
    sourceId: "claimant",
    targetId: "phone",
    confidence: "medium",
    evidenceIds: ["doc_surv"],
    notes: "Number on the roofing listing; answered during the pretext call.",
  },
  {
    id: "r_uses_email",
    label: "uses",
    category: "relationship",
    sourceId: "claimant",
    targetId: "email",
    confidence: "medium",
    evidenceIds: ["doc_surv"],
    notes: "Contact address on the online roofing listing.",
  },
];

// Evidence "mentioned in" links generated from each document's `mentions`.
export const EVIDENCE_LINKS: Relationship[] = ENTITIES.filter(
  (e) => e.type === "document" && e.mentions && e.mentions.length > 0,
).flatMap((doc) =>
  (doc.mentions ?? []).map((entityId) => ({
    id: `ev_${doc.id}_${entityId}`,
    label: "mentioned in",
    category: "evidence" as const,
    sourceId: entityId,
    targetId: doc.id,
    confidence: "high" as const,
    evidenceIds: [doc.id],
    notes: `Referenced in ${doc.label}.`,
  })),
);

// Two probable relationships surfaced by Auto-Link (dashed, low confidence).
export const PROBABLE_EDGES: Relationship[] = [
  {
    id: "p_undisclosed_pay",
    label: "possibly pays",
    category: "probable",
    sourceId: "ridgeline",
    targetId: "bank",
    confidence: "low",
    evidenceIds: ["doc_surv", "doc_bank"],
    notes:
      "Inferred: the claimant works for Ridgeline and holds ∗∗∗∗3390; recurring deposits suggest undisclosed wages during the benefit period.",
  },
  {
    id: "p_vehicle_used",
    label: "possibly used for",
    category: "probable",
    sourceId: "vehicle",
    targetId: "ridgeline",
    confidence: "low",
    evidenceIds: ["doc_surv"],
    notes:
      "Inferred from timing and location: the ladder-rack pickup appears at Ridgeline job sites; likely used for the undisclosed work.",
  },
];

export const BASE_EDGES: Relationship[] = [...RELATIONSHIPS, ...EVIDENCE_LINKS];

// --- Initial node layout (world coordinates) ---------------------------------

export const INITIAL_POSITIONS: Record<string, Point> = {
  claimant: { x: 520, y: 400 },
  doctor: { x: 600, y: 150 },
  apex: { x: 240, y: 170 },
  ridgeline: { x: 850, y: 380 },
  addr: { x: 520, y: 650 },
  phone: { x: 360, y: 620 },
  email: { x: 180, y: 470 },
  bank: { x: 1090, y: 400 },
  vehicle: { x: 720, y: 620 },
  injury: { x: 300, y: 360 },
  doc_surv: { x: 980, y: 590 },
  doc_ime: { x: 820, y: 130 },
  doc_claim: { x: 110, y: 320 },
  doc_bank: { x: 1110, y: 600 },
};

// --- Timeline ----------------------------------------------------------------

export const TIMELINE: TimelineEvent[] = [
  {
    id: "t_injury",
    date: "Mar 3, 2026",
    iso: "2026-03-03",
    title: "Claimant reports a lifting injury at the Apex dock",
    description:
      "Unwitnessed lower-back injury reported while lifting a pallet — the basis for the indemnity claim.",
    evidenceId: "doc_claim",
    entityIds: ["injury", "apex", "claimant"],
  },
  {
    id: "t_claim",
    date: "Mar 5, 2026",
    iso: "2026-03-05",
    title: "Claim C-7731 opened; weekly indemnity benefits begin",
    description:
      "First report of injury filed against Apex; Keystone Mutual begins paying total-disability indemnity.",
    evidenceId: "doc_claim",
    entityIds: ["claimant", "apex"],
  },
  {
    id: "t_ime",
    date: "May 20, 2026",
    iso: "2026-05-20",
    title: "Independent medical exam finds full work capacity",
    description:
      "IME reports no objective lumbar deficit, contradicting the treating physician's total-disability certification.",
    evidenceId: "doc_ime",
    entityIds: ["claimant", "doctor"],
  },
  {
    id: "t_surv",
    date: "May 28, 2026",
    iso: "2026-05-28",
    title: "Surveillance films the claimant roofing for Ridgeline",
    description:
      "Claimant recorded carrying shingle bundles, climbing a ladder, and operating tools at a Ridgeline job site.",
    evidenceId: "doc_surv",
    entityIds: ["claimant", "ridgeline", "vehicle"],
  },
  {
    id: "t_bank",
    date: "May 31, 2026",
    iso: "2026-05-31",
    title: "Deposit records show Ridgeline checks during benefit weeks",
    description:
      "Recurring deposits drawn on Ridgeline land in account ∗∗∗∗3390 in the same weeks indemnity was paid.",
    evidenceId: "doc_bank",
    entityIds: ["bank", "ridgeline"],
  },
];

// --- Open questions / leads --------------------------------------------------

export const OPEN_QUESTIONS: OpenQuestion[] = [
  {
    id: "q_payroll",
    question: "Confirm whether Ridgeline Roofing paid the claimant during the benefit period.",
    status: "inProgress",
    priority: "high",
    rationale:
      "Surveillance places him on the job and deposit records suggest wages, but the employment itself is undocumented.",
  },
  {
    id: "q_med_records",
    question: "Request the treating physician's full billing and visit records.",
    status: "open",
    priority: "high",
    rationale:
      "Visit frequency and continued total-disability certs conflict with the IME — possible over-treatment.",
  },
  {
    id: "q_jobsites",
    question: "Identify and date each Ridgeline job site captured on surveillance.",
    status: "open",
    priority: "medium",
    rationale:
      "Pinning sites to dates ties the work to specific indemnity-payment weeks.",
  },
  {
    id: "q_listing",
    question: "Archive the full online roofing listing, phone, and email before it is removed.",
    status: "open",
    priority: "low",
    rationale:
      "The listing ties the claimant to active solicitation of work and may be taken down once he is on notice.",
  },
];

// --- Report draft narrative --------------------------------------------------

// Every report statement carries the document-entity ids that back it, so the
// draft can render numbered, clickable citations (citation-first).
export interface ReportClaim {
  text: string;
  cites: string[];
}

export const REPORT: { summary: ReportClaim[]; findings: ReportClaim[] } = {
  summary: [
    {
      text: "Claimant Travis Mallory is collecting total-disability indemnity on a claim against Apex Warehousing while being filmed performing roofing labor for Ridgeline Roofing — activity squarely inconsistent with his certified restrictions.",
      cites: ["doc_surv", "doc_claim"],
    },
    {
      text: "An independent medical exam found full functional capacity, contradicting the treating physician's continued total-disability findings, and deposit records show recurring Ridgeline checks during weeks indemnity was paid — a pattern consistent with concealed employment and income.",
      cites: ["doc_ime", "doc_bank"],
    },
  ],
  findings: [
    {
      text: "Mallory filed an unwitnessed lower-back injury claim against his employer of record, Apex Warehousing & Logistics.",
      cites: ["doc_claim"],
    },
    {
      text: "Surveillance filmed Mallory carrying shingle bundles, climbing ladders, and operating tools at a Ridgeline job site, using a ladder-rack pickup registered to his residence.",
      cites: ["doc_surv"],
    },
    {
      text: "An independent medical examination found no objective lumbar deficit and full work capacity, conflicting with Dr. Whitfield's disability certification.",
      cites: ["doc_ime"],
    },
    {
      text: "Deposit records for the claimant's account ∗∗∗∗3390 show recurring checks drawn on Ridgeline during weeks indemnity benefits were paid.",
      cites: ["doc_bank"],
    },
  ],
};
