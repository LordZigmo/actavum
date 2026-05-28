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
import type { Action, WorkspaceState } from "@/lib/types";
import { fitTransform } from "@/lib/geometry";
import { GraphNode } from "./GraphNode";
import { EdgeLayer } from "./EdgeLayer";
import { EdgeLabels } from "./EdgeLabels";
import { CanvasToolbar } from "./CanvasToolbar";

interface GraphCanvasProps {
  state: WorkspaceState;
  dispatch: Dispatch<Action>;
}

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

  // --- view helpers --------------------------------------------------------
  // Latest visible-node positions, so fit() stays correct even when called via
  // requestAnimationFrame right after a dispatch (e.g. reset layout).
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

  // --- pan + background click ---------------------------------------------
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
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

  return (
    <div
      ref={viewportRef}
      className="relative h-full w-full cursor-grab overflow-hidden bg-ink-950 active:cursor-grabbing graph-grid"
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
      {/* edge fade at borders for depth */}
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
          onSelectEdge={onSelectEdge}
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
              onSelect={onSelect}
              onMoveBy={onMoveBy}
            />
          ))}
        </div>
      </div>

      <CanvasToolbar
        zoom={transform.zoom}
        visibleTypes={visibleTypes}
        onZoomIn={() => zoomByCenter(1.2)}
        onZoomOut={() => zoomByCenter(1 / 1.2)}
        onFit={fit}
        onReset={() => {
          dispatch({ type: "RESET_LAYOUT" });
          requestAnimationFrame(fit);
        }}
        onToggleType={(type) => dispatch({ type: "TOGGLE_TYPE", entityType: type })}
      />
    </div>
  );
}
