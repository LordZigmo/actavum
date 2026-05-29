"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Trash2 } from "lucide-react";
import type { Action, Confidence, Point, WorkspaceState } from "@/lib/types";
import { fitTransform, midpoint, screenToWorld, worldToScreen } from "@/lib/geometry";
import { cn } from "@/lib/cn";
import { GraphNode } from "./GraphNode";
import { EdgeLayer } from "./EdgeLayer";
import { EdgeLabels } from "./EdgeLabels";
import { CanvasToolbar } from "./CanvasToolbar";

interface GraphCanvasProps {
  state: WorkspaceState;
  dispatch: Dispatch<Action>;
}

// Approx. half-extents of a node card in world units, for drop hit-testing.
const NODE_HALF_W = 100;
const NODE_HALF_H = 34;

export function GraphCanvas({ state, dispatch }: GraphCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pan = useRef<{ last: { x: number; y: number }; moved: boolean } | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { transform, positions, visibleTypes, selection, search } = state;

  // --- derived data --------------------------------------------------------
  const visibleEntities = useMemo(
    () => state.entities.filter((e) => visibleTypes[e.type]),
    [state.entities, visibleTypes],
  );
  const visibleIds = useMemo(
    () => new Set(visibleEntities.map((e) => e.id)),
    [visibleEntities],
  );
  const renderEdges = useMemo(
    () =>
      state.relationships.filter(
        (r) => visibleIds.has(r.sourceId) && visibleIds.has(r.targetId),
      ),
    [state.relationships, visibleIds],
  );

  const searchActive = search.trim().length > 0;
  const matchedIds = useMemo(() => {
    if (!searchActive) return new Set<string>();
    const q = search.trim().toLowerCase();
    return new Set(
      state.entities
        .filter(
          (e) =>
            e.label.toLowerCase().includes(q) ||
            e.subtitle?.toLowerCase().includes(q) ||
            e.aliases.some((a) => a.toLowerCase().includes(q)) ||
            e.tags.some((t) => t.toLowerCase().includes(q)),
        )
        .map((e) => e.id),
    );
  }, [search, searchActive, state.entities]);

  // Refs kept in sync for use inside window-level pointer handlers.
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const positionsRef = useRef(positions);
  positionsRef.current = positions;
  const visibleRef = useRef(visibleEntities);
  visibleRef.current = visibleEntities;

  // --- view helpers --------------------------------------------------------
  const fitDataRef = useRef<{ x: number; y: number }[]>([]);
  fitDataRef.current = visibleEntities.map((e) => positions[e.id]).filter(Boolean);

  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dispatch({
      type: "SET_TRANSFORM",
      transform: fitTransform(fitDataRef.current, rect.width, rect.height),
    });
  }, [dispatch]);

  // Fit once on mount (after measuring), then reveal the scene.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pts = Object.values(positions);
    dispatch({
      type: "SET_TRANSFORM",
      transform: fitTransform(pts, rect.width, rect.height),
    });
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Non-passive wheel zoom (React's onWheel is passive → preventDefault no-ops).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      dispatch({
        type: "ZOOM_AT",
        cx: e.clientX - rect.left,
        cy: e.clientY - rect.top,
        factor: e.deltaY < 0 ? 1.1 : 1 / 1.1,
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [dispatch]);

  const zoomByCenter = useCallback(
    (factor: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dispatch({ type: "ZOOM_AT", cx: rect.width / 2, cy: rect.height / 2, factor });
    },
    [dispatch],
  );

  // --- drag-to-connect -----------------------------------------------------
  const [connecting, setConnecting] = useState<{ sourceId: string; cursor: Point } | null>(
    null,
  );
  const [connectTarget, setConnectTarget] = useState<string | null>(null);
  const connectingRef = useRef(connecting);
  connectingRef.current = connecting;
  const connectTargetRef = useRef(connectTarget);
  connectTargetRef.current = connectTarget;

  const startConnect = useCallback(
    (sourceId: string, clientX: number, clientY: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cursor = screenToWorld(
        { x: clientX - rect.left, y: clientY - rect.top },
        transformRef.current,
      );
      setConnecting({ sourceId, cursor });
      setConnectTarget(null);
    },
    [],
  );

  const isConnecting = connecting !== null;
  useEffect(() => {
    if (!isConnecting) return;
    const el = viewportRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cursor = screenToWorld(
        { x: e.clientX - rect.left, y: e.clientY - rect.top },
        transformRef.current,
      );
      const src = connectingRef.current?.sourceId;
      let target: string | null = null;
      if (src) {
        const ents = visibleRef.current;
        const pos = positionsRef.current;
        for (let i = ents.length - 1; i >= 0; i--) {
          const en = ents[i];
          if (en.id === src) continue;
          const c = pos[en.id];
          if (!c) continue;
          if (Math.abs(cursor.x - c.x) <= NODE_HALF_W && Math.abs(cursor.y - c.y) <= NODE_HALF_H) {
            target = en.id;
            break;
          }
        }
      }
      setConnecting((c) => (c ? { ...c, cursor } : c));
      setConnectTarget(target);
    };
    const onUp = () => {
      const src = connectingRef.current?.sourceId;
      const tgt = connectTargetRef.current;
      if (src && tgt && tgt !== src) {
        dispatch({ type: "ADD_RELATIONSHIP", sourceId: src, targetId: tgt });
      }
      setConnecting(null);
      setConnectTarget(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isConnecting, dispatch]);

  // --- edge hover (reveals the inline editor) ------------------------------
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const hoverTimeout = useRef<number | undefined>(undefined);
  const onEdgeHover = useCallback((id: string | null) => {
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
    if (id !== null) setHoveredEdgeId(id);
    else hoverTimeout.current = window.setTimeout(() => setHoveredEdgeId(null), 240);
  }, []);

  // --- pan + background click ---------------------------------------------
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Only pan when the press lands on the canvas background itself. Nodes and
    // edges stop propagation; overlay controls (toolbar, editor) sit on top.
    if (e.target !== e.currentTarget) return;
    viewportRef.current?.setPointerCapture(e.pointerId);
    pan.current = { last: { x: e.clientX, y: e.clientY }, moved: false };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pan.current) return;
    const dx = e.clientX - pan.current.last.x;
    const dy = e.clientY - pan.current.last.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) pan.current.moved = true;
    pan.current.last = { x: e.clientX, y: e.clientY };
    dispatch({ type: "PAN_BY", dx, dy });
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const wasClick = pan.current && !pan.current.moved;
    pan.current = null;
    try {
      viewportRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    if (wasClick) dispatch({ type: "CLEAR_SELECTION" });
  };

  // --- stable child callbacks ---------------------------------------------
  const onSelect = useCallback(
    (id: string) => dispatch({ type: "SELECT_ENTITY", id }),
    [dispatch],
  );
  const onMoveBy = useCallback(
    (id: string, dx: number, dy: number) =>
      dispatch({ type: "MOVE_NODE_BY", id, dx, dy }),
    [dispatch],
  );
  const onSelectEdge = useCallback(
    (id: string) => dispatch({ type: "SELECT_RELATIONSHIP", id }),
    [dispatch],
  );

  const selectedEntityId = selection.kind === "entity" ? selection.id : null;
  const highlightSet = useMemo(() => new Set(state.highlightIds), [state.highlightIds]);

  const sceneTransform = `translate(${transform.panX}px, ${transform.panY}px) scale(${transform.zoom})`;
  const gridSize = 26 * transform.zoom;
  const gridClass = state.gridStyle === "lines" ? "graph-grid-lines" : "graph-grid";

  const pending =
    connecting && positions[connecting.sourceId]
      ? { from: positions[connecting.sourceId], to: connecting.cursor }
      : null;

  // The inline edge editor follows hover, falling back to the current selection.
  const editEdgeId =
    hoveredEdgeId ?? (selection.kind === "relationship" ? selection.id : null);
  const editRel = editEdgeId
    ? state.relationships.find((r) => r.id === editEdgeId)
    : undefined;
  const editable = !!editRel && editRel.category !== "evidence" && !connecting;
  const editorScreen =
    editable && editRel && positions[editRel.sourceId] && positions[editRel.targetId]
      ? worldToScreen(
          midpoint(positions[editRel.sourceId], positions[editRel.targetId]),
          transform,
        )
      : null;

  return (
    <div
      ref={viewportRef}
      className={cn(
        "relative h-full w-full overflow-hidden bg-ink-950",
        gridClass,
        connecting ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing",
      )}
      style={{
        touchAction: "none",
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${transform.panX}px ${transform.panY}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* vignette for depth */}
      <div className="pointer-events-none absolute inset-0 z-0 [background:radial-gradient(120%_120%_at_50%_30%,transparent_55%,color-mix(in_oklch,var(--color-ink-950)_85%,transparent))]" />

      {/* transformed scene — zero-size anchor at viewport origin */}
      <div
        className="absolute left-0 top-0 select-none transition-opacity duration-500"
        style={{
          transform: sceneTransform,
          transformOrigin: "0 0",
          opacity: initialized ? 1 : 0,
        }}
      >
        <EdgeLayer
          edges={renderEdges}
          positions={positions}
          selection={selection}
          searchActive={searchActive}
          matchedIds={matchedIds}
          pending={pending}
          onSelectEdge={onSelectEdge}
          onEdgeHover={onEdgeHover}
        />

        <div className="relative z-20">
          <EdgeLabels
            edges={renderEdges}
            positions={positions}
            selection={selection}
            searchActive={searchActive}
            matchedIds={matchedIds}
            onSelectEdge={onSelectEdge}
          />
        </div>

        <div className="relative z-30">
          {visibleEntities.map((entity) => (
            <GraphNode
              key={entity.id}
              entity={entity}
              pos={positions[entity.id]}
              selected={selectedEntityId === entity.id}
              dimmed={searchActive && !matchedIds.has(entity.id)}
              highlighted={highlightSet.has(entity.id)}
              zoom={transform.zoom}
              connecting={connecting !== null}
              isConnectSource={connecting?.sourceId === entity.id}
              isConnectTarget={connectTarget === entity.id}
              onSelect={onSelect}
              onMoveBy={onMoveBy}
              onStartConnect={startConnect}
            />
          ))}
        </div>
      </div>

      {/* inline edge editor — screen space so it stays crisp at any zoom */}
      {editable && editRel && editorScreen && (
        <div
          className="pointer-events-auto absolute z-40"
          style={{
            left: editorScreen.x,
            top: editorScreen.y,
            transform: "translate(-50%, calc(-100% - 12px))",
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            dispatch({ type: "SELECT_RELATIONSHIP", id: editRel.id });
          }}
          onPointerEnter={() => onEdgeHover(editRel.id)}
          onPointerLeave={() => onEdgeHover(null)}
        >
          <div className="w-56 rounded-xl border border-ink-700/70 bg-ink-900/95 p-2.5 shadow-2xl backdrop-blur-md">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Edit link
              </span>
              <button
                type="button"
                title="Remove link"
                onClick={() => {
                  dispatch({ type: "DELETE_RELATIONSHIP", id: editRel.id });
                  onEdgeHover(null);
                }}
                className="text-ink-600 transition-colors hover:text-conf-low"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <input
              value={editRel.label}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_RELATIONSHIP",
                  id: editRel.id,
                  patch: { label: e.target.value },
                })
              }
              placeholder="Relationship label…"
              className="w-full rounded-md border border-ink-800 bg-ink-950/60 px-2 py-1.5 text-[12.5px] text-white placeholder:text-ink-600 outline-none focus:border-accent/60"
            />
            <div className="mt-2 flex items-center gap-1">
              <span className="mr-1 text-[10px] uppercase tracking-wide text-ink-600">
                Conf
              </span>
              {(["high", "medium", "low"] as Confidence[]).map((c) => {
                const on = editRel.confidence === c;
                return (
                  <button
                    key={c}
                    type="button"
                    title={`${c} confidence`}
                    onClick={() =>
                      dispatch({
                        type: "UPDATE_RELATIONSHIP",
                        id: editRel.id,
                        patch: { confidence: c },
                      })
                    }
                    className={cn(
                      "flex-1 rounded-md px-1 py-1 text-[11px] font-semibold capitalize transition-colors",
                      on ? "text-ink-950" : "border border-ink-800 text-ink-400 hover:text-white",
                    )}
                    style={on ? { background: `var(--color-conf-${c})` } : undefined}
                  >
                    {c[0].toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <CanvasToolbar
        zoom={transform.zoom}
        visibleTypes={visibleTypes}
        gridStyle={state.gridStyle}
        onZoomIn={() => zoomByCenter(1.2)}
        onZoomOut={() => zoomByCenter(1 / 1.2)}
        onFit={fit}
        onReset={() => {
          dispatch({ type: "RESET_LAYOUT" });
          requestAnimationFrame(fit);
        }}
        onToggleType={(type) => dispatch({ type: "TOGGLE_TYPE", entityType: type })}
        onSetGridStyle={(style) => dispatch({ type: "SET_GRID_STYLE", style })}
      />
    </div>
  );
}
