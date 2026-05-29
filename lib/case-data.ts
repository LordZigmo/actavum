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
  name: "Brooks / Northline Fraud Inquiry",
  number: "ACT-2026-0142",
  client: "First Harbor Bank — SIU",
  investigator: "Z. Davis",
  status: "Active",
  opened: "Feb 24, 2026",
};

// --- Entities (8) + evidence documents (3, modeled as type "document") -------

export const ENTITIES: Entity[] = [
  {
    id: "evan",
    type: "person",
    label: "Evan Brooks",
    subtitle: "Subject · sole signatory",
    riskScore: 87,
    confidence: "high",
    tags: ["Subject", "Beneficial owner?", "Prior fraud flag"],
    aliases: ["E. Brooks", "Evan M. Brooks", "“Van” Brooks"],
    notes:
      "Primary subject. Listed as sole signatory on Northline filings. Residence and shell company share 44 Waverly Ave. Soft hit on a 2021 small-claims fraud matter (unconfirmed).",
    evidenceIds: ["doc_invoice", "doc_dmv"],
  },
  {
    id: "northline",
    type: "company",
    label: "Northline Consulting LLC",
    subtitle: "Suspected shell entity",
    riskScore: 79,
    confidence: "high",
    tags: ["Shell?", "No web presence", "Single member"],
    aliases: ["Northline Consulting", "Northline LLC"],
    notes:
      "Registered Feb 18, 2026. No verifiable client work or web presence. Receives large round-dollar wires. Registered agent address matches the subject's residence.",
    evidenceIds: ["doc_invoice", "doc_bank"],
  },
  {
    id: "addr",
    type: "address",
    label: "44 Waverly Ave",
    subtitle: "Syracuse, NY 13205",
    riskScore: 64,
    confidence: "medium",
    tags: ["Co-location", "Zoning unconfirmed"],
    aliases: ["44 Waverly Avenue"],
    notes:
      "Used simultaneously as the subject's residence, Northline's registered business address, and the vehicle registration address. Residential vs. commercial zoning not yet confirmed.",
    evidenceIds: ["doc_dmv"],
  },
  {
    id: "phone",
    type: "phone",
    label: "(315) 555-0198",
    subtitle: "Mobile · VoIP suspected",
    riskScore: 41,
    confidence: "medium",
    tags: ["Contact", "VoIP?"],
    aliases: ["+1 315-555-0198"],
    notes:
      "Listed as the contact number on Invoice #8841. Carrier lookup pending; pattern is consistent with a VoIP provider.",
    evidenceIds: ["doc_invoice"],
  },
  {
    id: "email",
    type: "email",
    label: "evan.b@northline.co",
    subtitle: "Sender of Invoice #8841",
    riskScore: 55,
    confidence: "high",
    tags: ["Sender", "Custom domain"],
    aliases: ["evanb@northline.co"],
    notes:
      "Domain northline.co was registered the same week as the LLC. Used to send Invoice #8841. Headers not yet obtained.",
    evidenceIds: ["doc_invoice"],
  },
  {
    id: "bank",
    type: "bankAccount",
    label: "First Harbor ∗∗∗∗4821",
    subtitle: "Business checking",
    riskScore: 72,
    confidence: "high",
    tags: ["Receiving account", "Round-dollar wires"],
    aliases: ["Acct ending 4821"],
    notes:
      "Business checking opened in Northline's name on Feb 27. Received an $18,400 inbound wire on Mar 2; a near-full withdrawal followed on Mar 9.",
    evidenceIds: ["doc_bank"],
  },
  {
    id: "vehicle",
    type: "vehicle",
    label: "Black Ford F-150",
    subtitle: "2024 · Plate NY GHL-4821",
    riskScore: 38,
    confidence: "medium",
    tags: ["Asset", "Recently registered"],
    aliases: ["Ford F-150 (black)"],
    notes:
      "Registered to 44 Waverly Ave on Mar 4 — two days after the $18,400 wire cleared. Possible asset purchase using diverted funds.",
    evidenceIds: ["doc_dmv"],
  },
  {
    id: "wire",
    type: "event",
    label: "$18,400 Wire Transfer",
    subtitle: "Mar 2, 2026 · inbound",
    date: "Mar 2, 2026",
    riskScore: 83,
    confidence: "high",
    tags: ["Suspicious", "Round-dollar", "Inbound"],
    aliases: ["$18,400.00 wire"],
    notes:
      "Inbound wire to ∗∗∗∗4821 from an originator that has not been identified. Round-dollar amount with no invoice predating it.",
    evidenceIds: ["doc_bank"],
  },

  // --- Evidence documents ---------------------------------------------------
  {
    id: "doc_bank",
    type: "document",
    label: "Bank Statement March.pdf",
    subtitle: "PDF · 6 pages",
    date: "Mar 2026",
    riskScore: 90,
    confidence: "high",
    tags: ["Source", "Bank record"],
    aliases: [],
    notes:
      "First Harbor statement for account ∗∗∗∗4821 covering March 2026. Documents the inbound wire and subsequent withdrawal.",
    evidenceIds: [],
    mentions: ["wire", "bank"],
  },
  {
    id: "doc_dmv",
    type: "document",
    label: "DMV Search Result",
    subtitle: "Public record",
    date: "Mar 4, 2026",
    riskScore: 70,
    confidence: "high",
    tags: ["Source", "Public record"],
    aliases: [],
    notes:
      "NY DMV registration record for the Black Ford F-150, tying the vehicle to 44 Waverly Ave.",
    evidenceIds: [],
    mentions: ["vehicle", "addr"],
  },
  {
    id: "doc_invoice",
    type: "document",
    label: "Invoice #8841",
    subtitle: "Invoice · $18,400.00",
    date: "Mar 6, 2026",
    riskScore: 76,
    confidence: "high",
    tags: ["Source", "Questioned doc"],
    aliases: [],
    notes:
      "Invoice from Northline Consulting for “advisory services” in the exact amount of the wire. Sent from evan.b@northline.co four days after funds were received.",
    evidenceIds: [],
    mentions: ["northline", "email"],
  },
];

// --- Relationships -----------------------------------------------------------
// 7 confirmed entity-to-entity relationships (these are the "7" in the report),
// plus evidence "mentioned in" links derived below. Probable edges are added by
// the Auto-Link action and live in PROBABLE_EDGES.

export const RELATIONSHIPS: Relationship[] = [
  {
    id: "r_owns",
    label: "owns",
    category: "relationship",
    sourceId: "evan",
    targetId: "northline",
    confidence: "high",
    evidenceIds: ["doc_invoice"],
    dateRange: { start: "Feb 18, 2026" },
    notes: "Subject is the sole listed member/signatory of the LLC.",
  },
  {
    id: "r_resides",
    label: "shares address",
    category: "relationship",
    sourceId: "evan",
    targetId: "addr",
    confidence: "high",
    evidenceIds: ["doc_dmv"],
    notes: "Subject's residence of record.",
  },
  {
    id: "r_registered_co",
    label: "registered to",
    category: "relationship",
    sourceId: "northline",
    targetId: "addr",
    confidence: "medium",
    evidenceIds: ["doc_invoice"],
    notes:
      "LLC's registered business address is the subject's residence — a co-location red flag.",
  },
  {
    id: "r_registered_veh",
    label: "registered to",
    category: "relationship",
    sourceId: "vehicle",
    targetId: "addr",
    confidence: "medium",
    evidenceIds: ["doc_dmv"],
    dateRange: { start: "Mar 4, 2026" },
    notes: "Vehicle registration ties the truck to the same address.",
  },
  {
    id: "r_uses_phone",
    label: "uses",
    category: "relationship",
    sourceId: "evan",
    targetId: "phone",
    confidence: "medium",
    evidenceIds: ["doc_invoice"],
    notes: "Contact number on Invoice #8841.",
  },
  {
    id: "r_uses_email",
    label: "uses",
    category: "relationship",
    sourceId: "evan",
    targetId: "email",
    confidence: "high",
    evidenceIds: ["doc_invoice"],
    notes: "Sending address for the questioned invoice.",
  },
  {
    id: "r_owns_acct",
    label: "owns",
    category: "relationship",
    sourceId: "northline",
    targetId: "bank",
    confidence: "high",
    evidenceIds: ["doc_bank"],
    notes: "Business checking held in the LLC's name.",
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
    id: "p_controls_acct",
    label: "possibly controls",
    category: "probable",
    sourceId: "evan",
    targetId: "bank",
    confidence: "low",
    evidenceIds: ["doc_bank", "doc_invoice"],
    notes:
      "Inferred: subject owns Northline, which owns ∗∗∗∗4821. Direct control is probable but unconfirmed.",
  },
  {
    id: "p_funded_vehicle",
    label: "possibly funded",
    category: "probable",
    sourceId: "wire",
    targetId: "vehicle",
    confidence: "low",
    evidenceIds: ["doc_bank", "doc_dmv"],
    notes:
      "Inferred from timing: $18,400 wire cleared Mar 2; the F-150 was registered Mar 4.",
  },
];

export const BASE_EDGES: Relationship[] = [...RELATIONSHIPS, ...EVIDENCE_LINKS];

// --- Initial node layout (world coordinates) ---------------------------------

export const INITIAL_POSITIONS: Record<string, Point> = {
  evan: { x: 450, y: 390 },
  northline: { x: 760, y: 250 },
  addr: { x: 560, y: 590 },
  phone: { x: 150, y: 470 },
  email: { x: 250, y: 150 },
  bank: { x: 1030, y: 330 },
  vehicle: { x: 720, y: 690 },
  wire: { x: 1050, y: 560 },
  doc_bank: { x: 1090, y: 150 },
  doc_dmv: { x: 430, y: 740 },
  doc_invoice: { x: 500, y: 110 },
};

// --- Timeline ----------------------------------------------------------------

export const TIMELINE: TimelineEvent[] = [
  {
    id: "t_open",
    date: "Feb 27, 2026",
    iso: "2026-02-27",
    title: "First Harbor account ∗∗∗∗4821 opened under Northline",
    description:
      "Business checking opened in the LLC's name nine days after the entity was registered.",
    evidenceId: "doc_bank",
    entityIds: ["bank", "northline"],
  },
  {
    id: "t_wire",
    date: "Mar 2, 2026",
    iso: "2026-03-02",
    title: "Northline Consulting receives $18,400 wire transfer",
    description:
      "Round-dollar inbound wire from an unidentified originator credited to ∗∗∗∗4821.",
    evidenceId: "doc_bank",
    entityIds: ["wire", "bank", "northline"],
  },
  {
    id: "t_dmv",
    date: "Mar 4, 2026",
    iso: "2026-03-04",
    title: "Black Ford F-150 registered to 44 Waverly Ave",
    description:
      "Vehicle registered two days after the wire cleared, to the same address as the subject and the LLC.",
    evidenceId: "doc_dmv",
    entityIds: ["vehicle", "addr"],
  },
  {
    id: "t_invoice",
    date: "Mar 6, 2026",
    iso: "2026-03-06",
    title: "Invoice #8841 sent from evan.b@northline.co",
    description:
      "Invoice for “advisory services” in the exact amount of the wire, dated after funds were received.",
    evidenceId: "doc_invoice",
    entityIds: ["email", "northline"],
  },
  {
    id: "t_withdraw",
    date: "Mar 9, 2026",
    iso: "2026-03-09",
    title: "$18,400 transferred out of ∗∗∗∗4821",
    description:
      "Near-full withdrawal leaves the account effectively emptied within a week of funding.",
    evidenceId: "doc_bank",
    entityIds: ["bank", "wire"],
  },
];

// --- Open questions / leads --------------------------------------------------

export const OPEN_QUESTIONS: OpenQuestion[] = [
  {
    id: "q_ownership",
    question: "Confirm beneficial ownership of Northline Consulting LLC.",
    status: "inProgress",
    priority: "high",
    rationale:
      "Subject is the listed agent, but the ownership chain behind the LLC is unverified.",
  },
  {
    id: "q_zoning",
    question: "Verify whether 44 Waverly Ave is residential or commercial.",
    status: "open",
    priority: "medium",
    rationale:
      "Residence, LLC, and vehicle all register to one address — zoning clarifies intent.",
  },
  {
    id: "q_subpoena",
    question:
      "Subpoena or request additional bank records for account ending 4821.",
    status: "open",
    priority: "high",
    rationale: "Only a single month of statements has been obtained so far.",
  },
  {
    id: "q_calllogs",
    question: "Cross-reference phone number with call logs.",
    status: "open",
    priority: "low",
    rationale:
      "(315) 555-0198 is possibly VoIP; call records would establish the contact network.",
  },
];

// --- Report draft narrative --------------------------------------------------

export const REPORT_NARRATIVE = {
  executiveSummary: [
    "This report summarizes findings to date in the Brooks / Northline inquiry. The evidence describes a closed loop in which subject Evan Brooks controls Northline Consulting LLC, a thinly-documented entity that received an $18,400 round-dollar wire and rapidly converted the funds.",
    "The subject's residence, the LLC's registered address, and a newly-registered vehicle all resolve to 44 Waverly Ave — a co-location pattern consistent with the use of a shell entity to move and shelter funds. An invoice issued after the funds arrived appears constructed to paper the transfer.",
  ],
  relationshipFindings: [
    "Brooks → Northline Consulting LLC (owns, High): subject is the sole signatory on filings.",
    "Northline + Brooks + Black Ford F-150 → 44 Waverly Ave (co-location, High/Medium): three roles registered to a single address.",
    "Northline → First Harbor ∗∗∗∗4821 (owns, High): receiving account for the inbound wire.",
    "∗∗∗∗4821 → $18,400 Wire Transfer (received, High): round-dollar credit, withdrawn within a week.",
  ],
};
