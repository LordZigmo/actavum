"use client";

import { memo, useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { Entity, Point } from "@/lib/types";
import { ENTITY_CONFIG, entityColor } from "@/lib/entity-config";
import { cn } from "@/lib/cn";

interface GraphNodeProps {
  entity: Entity;
  pos: Point;
  selected: boolean;
  dimmed: boolean;
  highlighted: boolean;
  /** Current zoom — drag deltas are divided by this to convert screen→world. */
  zoom: number;
  onSelect: (id: string) => void;
  onMoveBy: (id: string, dx: number, dy: number) => void;
}

function GraphNodeImpl({
  entity,
  pos,
  selected,
  dimmed,
  highlighted,
  zoom,
  onSelect,
  onMoveBy,
}: GraphNodeProps) {
  const Icon = ENTITY_CONFIG[entity.type].icon;
  const color = entityColor(entity.type);
  const isDoc = entity.type === "document";

  const dragging = useRef(false);
  const last = useRef<Point | null>(null);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    e.stopPropagation(); // don't let the canvas start a pan
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    onSelect(entity.id);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current || !last.current) return;
    const dx = (e.clientX - last.current.x) / zoom;
    const dy = (e.clientY - last.current.y) / zoom;
    last.current = { x: e.clientX, y: e.clientY };
    onMoveBy(entity.id, dx, dy);
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = false;
    last.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  }

  return (
    // Wrapper carries position (no transition) so drag tracks the cursor 1:1.
    <div
      className="absolute select-none"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)", touchAction: "none" }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(entity.id);
          }
        }}
        className={cn(
          "group relative flex w-[188px] cursor-grab items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left backdrop-blur-sm transition-[transform,box-shadow,border-color,opacity] duration-150 active:cursor-grabbing",
          "bg-ink-900/85 hover:-translate-y-0.5",
          isDoc && "border-dashed",
          selected ? "border-transparent animate-node-pulse" : "hover:shadow-lg",
          highlighted && !selected && "animate-highlight",
          dimmed && "opacity-35 hover:opacity-100",
        )}
        style={{
          // Used by the node-pulse keyframes and the resting border/glow.
          ["--node-color" as string]: color,
          borderColor: selected
            ? "transparent"
            : `color-mix(in oklch, ${color} 42%, transparent)`,
          boxShadow: selected
            ? undefined
            : `0 1px 0 0 color-mix(in oklch, ${color} 10%, transparent), 0 8px 22px -16px ${color}`,
        }}
      >
        {/* icon tile */}
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: `color-mix(in oklch, ${color} 20%, transparent)`,
            color,
            boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${color} 34%, transparent)`,
          }}
        >
          <Icon size={18} strokeWidth={2} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold leading-tight text-[color:var(--foreground)]">
            {entity.label}
          </span>
          <span
            className="mt-0.5 block truncate text-[10.5px] font-medium uppercase tracking-wide"
            style={{ color: `color-mix(in oklch, ${color} 78%, white 10%)` }}
          >
            {ENTITY_CONFIG[entity.type].label}
          </span>
        </span>
      </div>
    </div>
  );
}

export const GraphNode = memo(GraphNodeImpl);
