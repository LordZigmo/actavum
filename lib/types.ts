// Core domain types for the Actavum investigation workspace.
// No runtime code lives here — types only.

export type EntityType =
  | "person"
  | "company"
  | "address"
  | "phone"
  | "email"
  | "bankAccount"
  | "vehicle"
  | "document"
  | "event";

export type Confidence = "high" | "medium" | "low";

export interface Point {
  x: number;
  y: number;
}

export interface Transform {
  panX: number;
  panY: number;
  zoom: number;
}

/**
 * A node on the board. Evidence documents are modeled as entities of
 * `type: "document"` so the canvas, inspector, and filters share one code path.
 */
export interface Entity {
  id: string;
  type: EntityType;
  label: string;
  subtitle?: string;
  confidence: Confidence;
  tags: string[];
  aliases: string[];
  notes: string;
  /** Document-entity ids cited as the source evidence for this node. */
  evidenceIds: string[];
  /** Display date for events / documents. */
  date?: string;
  /** Documents only: entity ids this document mentions. */
  mentions?: string[];
}

export type RelationshipCategory = "relationship" | "evidence" | "probable";

export interface Relationship {
  id: string;
  /** Edge label, e.g. "owns", "registered to", "mentioned in", "possibly controls". */
  label: string;
  category: RelationshipCategory;
  sourceId: string;
  targetId: string;
  confidence: Confidence;
  /** Supporting evidence (document-entity ids). */
  evidenceIds: string[];
  dateRange?: { start: string; end?: string };
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  /** Display date, e.g. "Mar 2, 2026". */
  date: string;
  /** ISO date for sorting, e.g. "2026-03-02". */
  iso: string;
  title: string;
  description: string;
  /** Cited source — a document-entity id. */
  evidenceId: string;
  entityIds?: string[];
}

export interface OpenQuestion {
  id: string;
  question: string;
  status: "open" | "inProgress";
  priority: "high" | "medium" | "low";
  rationale?: string;
}

export interface Toast {
  id: string;
  message: string;
  variant?: "info" | "success";
}

export type SidebarSection =
  | "overview"
  | "entities"
  | "evidence"
  | "timeline"
  | "reports"
  | "leads";

export type BottomTab = "timeline" | "report" | "questions";

export type Selection =
  | { kind: "none" }
  | { kind: "entity"; id: string }
  | { kind: "relationship"; id: string };

export interface BottomPanelState {
  open: boolean;
  tab: BottomTab;
}

export interface WorkspaceState {
  entities: Entity[];
  relationships: Relationship[];
  timeline: TimelineEvent[];
  positions: Record<string, Point>;
  selection: Selection;
  transform: Transform;
  autoLinkRevealed: boolean;
  activeSection: SidebarSection;
  bottomPanel: BottomPanelState;
  visibleTypes: Record<EntityType, boolean>;
  search: string;
  reportGenerated: boolean;
  /** Entity ids the investigator explicitly pinned into the report. */
  reportItemIds: string[];
  /** Transient highlight set (e.g. "Find Related Evidence"). */
  highlightIds: string[];
  toasts: Toast[];
}

export type Action =
  | { type: "SELECT_ENTITY"; id: string }
  | { type: "SELECT_RELATIONSHIP"; id: string }
  | { type: "CLEAR_SELECTION" }
  // Relative mutations — computed against current state to avoid stale reads
  // during high-frequency pointer streams (drag / pan).
  | { type: "MOVE_NODE_BY"; id: string; dx: number; dy: number }
  | { type: "PAN_BY"; dx: number; dy: number }
  | { type: "ZOOM_AT"; cx: number; cy: number; factor: number }
  | { type: "SET_TRANSFORM"; transform: Transform }
  | { type: "RESET_LAYOUT" }
  | { type: "SET_SECTION"; section: SidebarSection }
  | { type: "TOGGLE_BOTTOM" }
  | { type: "OPEN_BOTTOM"; tab?: BottomTab }
  | { type: "SET_BOTTOM_TAB"; tab: BottomTab }
  | { type: "GENERATE_REPORT" }
  | { type: "AUTO_LINK" }
  | { type: "TOGGLE_TYPE"; entityType: EntityType }
  | { type: "SET_SEARCH"; value: string }
  | { type: "ADD_ENTITY"; entity: Entity; pos: Point }
  | { type: "IMPORT_EVIDENCE"; doc: Entity; pos: Point; event: TimelineEvent }
  | { type: "ADD_TIMELINE_EVENT"; event: TimelineEvent }
  | { type: "ADD_TO_REPORT"; id: string }
  | { type: "FIND_RELATED_EVIDENCE"; id: string }
  | { type: "PUSH_TOAST"; message: string; variant?: Toast["variant"] }
  | { type: "DISMISS_TOAST"; id: string };
