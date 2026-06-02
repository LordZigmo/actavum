"use client";

import { useCallback, useReducer, useState } from "react";
import type {
  Action,
  Entity,
  EntityType,
  Point,
  Relationship,
  TimelineEvent,
  Toast,
  WorkspaceState,
} from "@/lib/types";
import {
  BASE_EDGES,
  ENTITIES,
  INITIAL_POSITIONS,
  PROBABLE_EDGES,
  TIMELINE,
} from "@/lib/case-data";
import { ENTITY_CONFIG, ENTITY_TYPE_ORDER } from "@/lib/entity-config";
import { zoomAround } from "@/lib/geometry";
import { TopCommandBar } from "./TopCommandBar";
import { Sidebar } from "./Sidebar";
import { Inspector } from "./Inspector";
import { BottomPanel } from "./BottomPanel";
import { ToastStack } from "./ToastStack";
import { GraphCanvas } from "./graph/GraphCanvas";
import { AddEntityModal, ImportEvidenceModal } from "./CommandModals";

// --- reducer helpers (module scope) -----------------------------------------

let toastSeq = 0;
let addSeq = 0;
let relSeq = 0;

function pushToast(
  toasts: Toast[],
  message: string,
  variant: Toast["variant"] = "info",
): Toast[] {
  return [...toasts, { id: `toast-${++toastSeq}`, message, variant }].slice(-4);
}

function sortTimeline(list: TimelineEvent[]): TimelineEvent[] {
  return [...list].sort((a, b) => a.iso.localeCompare(b.iso));
}

function relatedEvidenceIds(state: WorkspaceState, entityId: string): string[] {
  const ids = new Set<string>();
  const ent = state.entities.find((e) => e.id === entityId);
  ent?.evidenceIds.forEach((d) => ids.add(d));
  state.entities.forEach((e) => {
    if (e.type === "document" && e.mentions?.includes(entityId)) ids.add(e.id);
  });
  return [...ids].filter((id) =>
    state.entities.some((e) => e.id === id && e.type === "document"),
  );
}

function nearCentroid(positions: Record<string, Point>): Point {
  const pts = Object.values(positions);
  if (pts.length === 0) return { x: 560, y: 420 };
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const jitter = () => (Math.random() - 0.5) * 130;
  return { x: cx + jitter(), y: cy + jitter() };
}

// --- initial state -----------------------------------------------------------

function initialState(): WorkspaceState {
  const visibleTypes = ENTITY_TYPE_ORDER.reduce(
    (acc, t) => {
      acc[t] = true;
      return acc;
    },
    {} as Record<EntityType, boolean>,
  );
  return {
    entities: ENTITIES,
    relationships: BASE_EDGES,
    timeline: sortTimeline(TIMELINE),
    positions: { ...INITIAL_POSITIONS },
    selection: { kind: "entity", id: "evan" },
    transform: { panX: 0, panY: 0, zoom: 1 },
    autoLinkRevealed: false,
    gridStyle: "dots",
    activeSection: "entities",
    bottomPanel: { open: false, tab: "timeline" },
    visibleTypes,
    search: "",
    reportGenerated: false,
    reportItemIds: [],
    highlightIds: [],
    toasts: [],
  };
}

// --- reducer -----------------------------------------------------------------

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case "SELECT_ENTITY":
      return { ...state, selection: { kind: "entity", id: action.id }, highlightIds: [] };
    case "SELECT_RELATIONSHIP":
      return {
        ...state,
        selection: { kind: "relationship", id: action.id },
        highlightIds: [],
      };
    case "CLEAR_SELECTION":
      return { ...state, selection: { kind: "none" }, highlightIds: [] };

    case "MOVE_NODE_BY": {
      const p = state.positions[action.id];
      if (!p) return state;
      return {
        ...state,
        positions: {
          ...state.positions,
          [action.id]: { x: p.x + action.dx, y: p.y + action.dy },
        },
      };
    }
    case "PAN_BY":
      return {
        ...state,
        transform: {
          ...state.transform,
          panX: state.transform.panX + action.dx,
          panY: state.transform.panY + action.dy,
        },
      };
    case "ZOOM_AT":
      return {
        ...state,
        transform: zoomAround(state.transform, action.cx, action.cy, action.factor),
      };
    case "SET_TRANSFORM":
      return { ...state, transform: action.transform };
    case "RESET_LAYOUT":
      return { ...state, positions: { ...INITIAL_POSITIONS } };

    case "SET_SECTION": {
      let bottomPanel = state.bottomPanel;
      if (action.section === "timeline") bottomPanel = { open: true, tab: "timeline" };
      else if (action.section === "reports") bottomPanel = { open: true, tab: "report" };
      else if (action.section === "leads") bottomPanel = { open: true, tab: "questions" };
      return { ...state, activeSection: action.section, bottomPanel };
    }
    case "TOGGLE_BOTTOM":
      return {
        ...state,
        bottomPanel: { ...state.bottomPanel, open: !state.bottomPanel.open },
      };
    case "OPEN_BOTTOM":
      return {
        ...state,
        bottomPanel: { open: true, tab: action.tab ?? state.bottomPanel.tab },
      };
    case "SET_BOTTOM_TAB":
      return { ...state, bottomPanel: { open: true, tab: action.tab } };

    case "GENERATE_REPORT":
      return {
        ...state,
        reportGenerated: true,
        activeSection: "reports",
        bottomPanel: { open: true, tab: "report" },
        toasts: pushToast(
          state.toasts,
          "Report draft generated from 8 entities, 7 relationships, and 3 evidence sources.",
          "success",
        ),
      };

    case "AUTO_LINK":
      if (state.autoLinkRevealed)
        return {
          ...state,
          toasts: pushToast(state.toasts, "No new probable relationships found.", "info"),
        };
      return {
        ...state,
        autoLinkRevealed: true,
        relationships: [...state.relationships, ...PROBABLE_EDGES],
        toasts: pushToast(state.toasts, "2 probable relationships found.", "success"),
      };

    case "TOGGLE_TYPE": {
      const visibleTypes = {
        ...state.visibleTypes,
        [action.entityType]: !state.visibleTypes[action.entityType],
      };
      let selection = state.selection;
      if (selection.kind === "entity") {
        const selId = selection.id;
        const ent = state.entities.find((e) => e.id === selId);
        if (ent && !visibleTypes[ent.type]) selection = { kind: "none" };
      }
      return { ...state, visibleTypes, selection };
    }
    case "SET_SEARCH":
      return { ...state, search: action.value };

    case "SET_GRID_STYLE":
      return { ...state, gridStyle: action.style };

    case "ADD_RELATIONSHIP": {
      const s = state.entities.find((e) => e.id === action.sourceId);
      const t = state.entities.find((e) => e.id === action.targetId);
      const exists = state.relationships.some(
        (r) =>
          r.category !== "evidence" &&
          ((r.sourceId === action.sourceId && r.targetId === action.targetId) ||
            (r.sourceId === action.targetId && r.targetId === action.sourceId)),
      );
      if (exists) {
        return {
          ...state,
          toasts: pushToast(
            state.toasts,
            `${s?.label} and ${t?.label} are already linked.`,
            "info",
          ),
        };
      }
      const rel: Relationship = {
        id: `usr-rel-${++relSeq}`,
        label: "linked to",
        category: "relationship",
        sourceId: action.sourceId,
        targetId: action.targetId,
        confidence: "medium",
        evidenceIds: [],
        notes: "Link created on the board — hover the line to rename or reclassify it.",
      };
      return {
        ...state,
        relationships: [...state.relationships, rel],
        selection: { kind: "relationship", id: rel.id },
        toasts: pushToast(
          state.toasts,
          `Linked ${s?.label} → ${t?.label}. Hover the line to rename it.`,
          "success",
        ),
      };
    }
    case "UPDATE_RELATIONSHIP":
      return {
        ...state,
        relationships: state.relationships.map((r) =>
          r.id === action.id ? { ...r, ...action.patch } : r,
        ),
      };
    case "DELETE_RELATIONSHIP": {
      const selection =
        state.selection.kind === "relationship" && state.selection.id === action.id
          ? { kind: "none" as const }
          : state.selection;
      return {
        ...state,
        relationships: state.relationships.filter((r) => r.id !== action.id),
        selection,
        toasts: pushToast(state.toasts, "Link removed.", "info"),
      };
    }

    case "ADD_ENTITY":
      return {
        ...state,
        entities: [...state.entities, action.entity],
        positions: { ...state.positions, [action.entity.id]: action.pos },
        selection: { kind: "entity", id: action.entity.id },
        visibleTypes: { ...state.visibleTypes, [action.entity.type]: true },
        toasts: pushToast(
          state.toasts,
          `Added ${ENTITY_CONFIG[action.entity.type].label.toLowerCase()} “${action.entity.label}” to the board.`,
          "success",
        ),
      };
    case "IMPORT_EVIDENCE":
      return {
        ...state,
        entities: [...state.entities, action.doc],
        positions: { ...state.positions, [action.doc.id]: action.pos },
        timeline: sortTimeline([...state.timeline, action.event]),
        selection: { kind: "entity", id: action.doc.id },
        visibleTypes: { ...state.visibleTypes, document: true },
        toasts: pushToast(
          state.toasts,
          `Imported “${action.doc.label}” · 1 timeline event extracted.`,
          "success",
        ),
      };
    case "ADD_TIMELINE_EVENT":
      return {
        ...state,
        timeline: sortTimeline([...state.timeline, action.event]),
        bottomPanel: { open: true, tab: "timeline" },
        toasts: pushToast(state.toasts, "Timeline event created.", "success"),
      };

    case "ADD_TO_REPORT": {
      const already = state.reportItemIds.includes(action.id);
      const name = state.entities.find((e) => e.id === action.id)?.label ?? "item";
      return {
        ...state,
        reportItemIds: already
          ? state.reportItemIds
          : [...state.reportItemIds, action.id],
        toasts: pushToast(
          state.toasts,
          already
            ? `“${name}” is already in the report.`
            : `Added “${name}” to the report draft.`,
          "success",
        ),
      };
    }
    case "FIND_RELATED_EVIDENCE": {
      const docIds = relatedEvidenceIds(state, action.id);
      return {
        ...state,
        highlightIds: docIds,
        toasts: pushToast(
          state.toasts,
          docIds.length
            ? `Highlighted ${docIds.length} related evidence ${docIds.length === 1 ? "source" : "sources"} on the board.`
            : "No related evidence found.",
          docIds.length ? "success" : "info",
        ),
      };
    }

    case "PUSH_TOAST":
      return { ...state, toasts: pushToast(state.toasts, action.message, action.variant) };
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    default:
      return state;
  }
}

// --- component ---------------------------------------------------------------

export function Workspace() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [modal, setModal] = useState<null | "entity" | "evidence">(null);

  const handleAddEntity = useCallback(
    (type: EntityType, label: string) => {
      const id = `n-${++addSeq}`;
      const entity: Entity = {
        id,
        type,
        label: label.trim() || `New ${ENTITY_CONFIG[type].label}`,
        subtitle: "Added this session",
        confidence: "medium",
        tags: ["Added"],
        aliases: [],
        notes: "Entity added during the session — enrich with sources and links.",
        evidenceIds: [],
      };
      dispatch({ type: "ADD_ENTITY", entity, pos: nearCentroid(state.positions) });
      setModal(null);
    },
    [state.positions],
  );

  const handleImportEvidence = useCallback(
    (label: string) => {
      const id = `n-doc-${++addSeq}`;
      const title = label.trim() || "Imported Evidence.pdf";
      const doc: Entity = {
        id,
        type: "document",
        label: title,
        subtitle: "Imported file",
        date: "May 28, 2026",
        confidence: "medium",
        tags: ["Source", "Imported"],
        aliases: [],
        notes: "Imported during the session. Link to the entities it references.",
        evidenceIds: [],
        mentions: [],
      };
      const event: TimelineEvent = {
        id: `te-${++addSeq}`,
        date: "May 28, 2026",
        iso: "2026-05-28",
        title: `Evidence imported: ${title}`,
        description: "Document added to the case file and queued for review.",
        evidenceId: id,
      };
      dispatch({ type: "IMPORT_EVIDENCE", doc, pos: nearCentroid(state.positions), event });
      setModal(null);
    },
    [state.positions],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-ink-950 text-[color:var(--foreground)]">
      <TopCommandBar
        search={state.search}
        reportGenerated={state.reportGenerated}
        onSearch={(v) => dispatch({ type: "SET_SEARCH", value: v })}
        onAddEntity={() => setModal("entity")}
        onImport={() => setModal("evidence")}
        onAutoLink={() => dispatch({ type: "AUTO_LINK" })}
        onGenerateReport={() => dispatch({ type: "GENERATE_REPORT" })}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          activeSection={state.activeSection}
          counts={{
            entities: state.entities.filter((e) => e.type !== "document").length,
            evidence: state.entities.filter((e) => e.type === "document").length,
            relationships: state.relationships.filter((r) => r.category === "relationship")
              .length,
            timeline: state.timeline.length,
            leads: 4,
          }}
          onSelectSection={(section) => dispatch({ type: "SET_SECTION", section })}
        />

        <main className="flex min-h-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <GraphCanvas state={state} dispatch={dispatch} />
          </div>
          <BottomPanel state={state} dispatch={dispatch} />
        </main>

        <Inspector state={state} dispatch={dispatch} />
      </div>

      <ToastStack toasts={state.toasts} dispatch={dispatch} />

      {modal === "entity" && (
        <AddEntityModal onClose={() => setModal(null)} onSubmit={handleAddEntity} />
      )}
      {modal === "evidence" && (
        <ImportEvidenceModal onClose={() => setModal(null)} onSubmit={handleImportEvidence} />
      )}
    </div>
  );
}
