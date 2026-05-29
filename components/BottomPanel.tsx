"use client";

import { type Dispatch } from "react";
import {
  ChevronDown,
  Clock,
  FileBarChart,
  FileText,
  Lightbulb,
  Link2,
  type LucideIcon,
} from "lucide-react";
import type { Action, BottomTab, WorkspaceState } from "@/lib/types";
import { CASE_META, OPEN_QUESTIONS, REPORT } from "@/lib/case-data";
import { cn } from "@/lib/cn";

interface BottomPanelProps {
  state: WorkspaceState;
  dispatch: Dispatch<Action>;
}

const TABS: { id: BottomTab; label: string; icon: LucideIcon }[] = [
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "report", label: "Report Draft", icon: FileBarChart },
  { id: "questions", label: "Open Questions", icon: Lightbulb },
];

const PRIORITY: Record<string, { label: string; color: string }> = {
  high: { label: "High", color: "var(--color-conf-low)" },
  medium: { label: "Medium", color: "var(--color-conf-medium)" },
  low: { label: "Low", color: "var(--color-ink-500)" },
};

// --- Timeline ---------------------------------------------------------------

function TimelineTab({ state, dispatch }: BottomPanelProps) {
  return (
    <ol className="relative ml-1 border-l border-ink-800 pl-6">
      {state.timeline.map((ev) => {
        const doc = state.entities.find((e) => e.id === ev.evidenceId);
        return (
          <li key={ev.id} className="relative pb-5 last:pb-1">
            <span className="absolute -left-[1.72rem] top-1 size-3 rounded-full border-2 border-ink-950 bg-accent shadow-[0_0_8px_var(--color-accent)]" />
            <span className="font-mono text-[11px] tracking-tight text-accent-bright">
              {ev.date}
            </span>
            <p className="mt-0.5 text-[13px] font-semibold text-white">{ev.title}</p>
            <p className="mt-0.5 max-w-2xl text-[12px] leading-relaxed text-ink-400">
              {ev.description}
            </p>
            {doc && (
              <button
                type="button"
                onClick={() => dispatch({ type: "SELECT_ENTITY", id: doc.id })}
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-ink-800 bg-ink-900/60 px-2 py-1 text-[11px] text-ink-400 transition-colors hover:border-ink-600 hover:text-white"
              >
                <FileText size={11} />
                Source: {doc.label}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// --- Report draft -----------------------------------------------------------

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-ink-800/80 pt-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-accent-bright">
        {title}
      </h4>
      <div className="mt-2 text-[12.5px] leading-relaxed text-ink-300">{children}</div>
    </section>
  );
}

// Numbered, clickable citation chip → opens the cited source on the board.
function Cite({
  n,
  docId,
  dispatch,
}: {
  n: number;
  docId: string;
  dispatch: Dispatch<Action>;
}) {
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "SELECT_ENTITY", id: docId })}
      title="Open cited source"
      className="mx-0.5 inline-flex items-center rounded bg-accent/15 px-1 align-super text-[9.5px] font-bold text-accent-bright transition-colors hover:bg-accent/35"
    >
      {n}
    </button>
  );
}

function ReportDraftTab({ state, dispatch }: BottomPanelProps) {
  if (!state.reportGenerated) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <span className="flex size-12 items-center justify-center rounded-xl border border-ink-800 bg-ink-900/60 text-ink-600">
          <FileBarChart size={22} />
        </span>
        <p className="mt-4 text-[13px] font-medium text-ink-400">No report drafted yet</p>
        <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-ink-600">
          Add your evidence and build the timeline, then generate a clean, citation-first
          report — every statement linked to a source.
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: "GENERATE_REPORT" })}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-ink-950 shadow-[0_0_18px_-6px_var(--color-accent)] transition-colors hover:bg-accent-bright"
        >
          <FileBarChart size={15} />
          Generate Report
        </button>
      </div>
    );
  }

  const docs = state.entities.filter((e) => e.type === "document");
  const entities = state.entities.filter((e) => e.type !== "document");
  const citeIndex = new Map(docs.map((d, i) => [d.id, i + 1] as const));

  // Most-connected entities (excludes evidence links) — investigatively useful.
  const degree = (id: string) =>
    state.relationships.filter(
      (r) => r.category !== "evidence" && (r.sourceId === id || r.targetId === id),
    ).length;
  const keyEntities = [...entities].sort((a, b) => degree(b.id) - degree(a.id)).slice(0, 5);

  const pinned = state.reportItemIds
    .map((id) => state.entities.find((e) => e.id === id))
    .filter(Boolean);

  const cites = (ids: string[]) =>
    ids.map((id) => {
      const n = citeIndex.get(id);
      return n ? <Cite key={id} n={n} docId={id} dispatch={dispatch} /> : null;
    });

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-ink-800 bg-ink-950/50 p-6">
      {/* doc header */}
      <div className="flex items-start justify-between gap-4 border-b border-ink-800 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-ink-600">
            Confidential · Investigative Report
          </p>
          <h3 className="mt-1 text-[18px] font-semibold text-white">{CASE_META.name}</h3>
          <p className="mt-0.5 font-mono text-[11.5px] text-ink-500">
            {CASE_META.number} · prepared by {CASE_META.investigator}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent-bright">
          <span className="size-1.5 rounded-full bg-accent-bright" />
          Editable draft
        </span>
      </div>

      {/* citation-first banner */}
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/[0.07] px-3 py-2 text-[11.5px] text-accent-bright">
        <Link2 size={13} className="shrink-0" />
        Citation-first draft — every statement links to a numbered source. Click any
        citation to open it on the board.
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <ReportSection title="Executive Summary">
          <div className="flex flex-col gap-2">
            {REPORT.summary.map((claim, i) => (
              <p key={i}>
                {claim.text} {cites(claim.cites)}
              </p>
            ))}
          </div>
        </ReportSection>

        <ReportSection title="Key Entities">
          <ul className="flex flex-col gap-1.5">
            {keyEntities.map((e) => (
              <li key={e.id} className="flex items-baseline gap-2">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SELECT_ENTITY", id: e.id })}
                  className="font-medium text-white underline-offset-2 hover:underline"
                >
                  {e.label}
                </button>
                <span className="truncate text-ink-500">— {e.subtitle ?? e.type}</span>
                <span className="ml-auto shrink-0">{cites(e.evidenceIds)}</span>
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Relationship Findings">
          <ul className="flex list-disc flex-col gap-1.5 pl-4 marker:text-ink-600">
            {REPORT.findings.map((claim, i) => (
              <li key={i}>
                {claim.text} {cites(claim.cites)}
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Timeline of Events">
          <ul className="flex flex-col gap-1.5">
            {state.timeline.map((ev) => (
              <li key={ev.id} className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-mono text-[11px] text-ink-500">{ev.date}</span>
                <span className="text-white">{ev.title}</span>
                <span>{cites([ev.evidenceId])}</span>
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Evidence Appendix">
          <ol className="flex flex-col gap-1.5">
            {docs.map((d) => (
              <li key={d.id} className="flex gap-2">
                <span className="font-mono text-[11px] font-bold text-accent-bright">
                  [{citeIndex.get(d.id)}]
                </span>
                <span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SELECT_ENTITY", id: d.id })}
                    className="font-medium text-white underline-offset-2 hover:underline"
                  >
                    {d.label}
                  </button>
                  <span className="text-ink-500"> — {d.notes}</span>
                </span>
              </li>
            ))}
          </ol>
        </ReportSection>

        {pinned.length > 0 && (
          <ReportSection title="Investigator-pinned items">
            <div className="flex flex-wrap gap-1.5">
              {pinned.map(
                (e) =>
                  e && (
                    <span
                      key={e.id}
                      className="rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent-bright"
                    >
                      {e.label}
                    </span>
                  ),
              )}
            </div>
          </ReportSection>
        )}
      </div>
    </div>
  );
}

// --- Open questions ---------------------------------------------------------

function OpenQuestionsTab({ dispatch }: BottomPanelProps) {
  return (
    <div className="grid max-w-4xl grid-cols-1 gap-2.5 lg:grid-cols-2">
      {OPEN_QUESTIONS.map((q, i) => {
        const p = PRIORITY[q.priority];
        return (
          <div
            key={q.id}
            className="flex flex-col rounded-xl border border-ink-800 bg-ink-900/50 p-3.5"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-ink-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                style={{
                  color: p.color,
                  background: `color-mix(in oklch, ${p.color} 14%, transparent)`,
                }}
              >
                {p.label} priority
              </span>
              {q.status === "inProgress" && (
                <span className="ml-auto text-[10.5px] font-medium text-accent-bright">
                  In progress
                </span>
              )}
            </div>
            <p className="mt-2 text-[13px] font-medium leading-snug text-white">
              {q.question}
            </p>
            {q.rationale && (
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
                {q.rationale}
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "PUSH_TOAST",
                  message: "Lead assigned and added to the working queue.",
                  variant: "success",
                })
              }
              className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-md border border-ink-700/70 bg-ink-900/60 px-2.5 py-1 text-[11.5px] font-medium text-ink-400 transition-colors hover:border-ink-600 hover:text-white"
            >
              Assign lead
            </button>
          </div>
        );
      })}
    </div>
  );
}

// --- Panel shell ------------------------------------------------------------

export function BottomPanel({ state, dispatch }: BottomPanelProps) {
  const { open, tab } = state.bottomPanel;

  return (
    <section className="shrink-0 border-t border-ink-800 bg-ink-900/60 backdrop-blur-sm">
      <div className="flex h-11 items-center gap-1 px-3">
        {TABS.map((t) => {
          const active = open && tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => dispatch({ type: "SET_BOTTOM_TAB", tab: t.id })}
              className={cn(
                "relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                active ? "text-white" : "text-ink-500 hover:text-ink-300",
              )}
            >
              <Icon size={14} className={active ? "text-accent-bright" : undefined} />
              {t.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-[7px] h-0.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => dispatch({ type: "TOGGLE_BOTTOM" })}
          className="ml-auto flex size-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-800 hover:text-white"
          title={open ? "Collapse panel" : "Expand panel"}
        >
          <ChevronDown size={16} className={cn("transition-transform", !open && "rotate-180")} />
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-[height] duration-300",
          open ? "h-[300px]" : "h-0",
        )}
      >
        <div className="h-[300px] overflow-y-auto border-t border-ink-800 px-5 py-4">
          {tab === "timeline" && <TimelineTab state={state} dispatch={dispatch} />}
          {tab === "report" && <ReportDraftTab state={state} dispatch={dispatch} />}
          {tab === "questions" && <OpenQuestionsTab state={state} dispatch={dispatch} />}
        </div>
      </div>
    </section>
  );
}
