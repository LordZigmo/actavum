"use client";

import { useState } from "react";
import {
  ChevronDown,
  Filter,
  Grid3x3,
  Grip,
  LayoutGrid,
  Maximize,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { EntityType } from "@/lib/types";
import { ENTITY_CONFIG, ENTITY_TYPE_ORDER, entityColor } from "@/lib/entity-config";
import { cn } from "@/lib/cn";

interface CanvasToolbarProps {
  zoom: number;
  visibleTypes: Record<EntityType, boolean>;
  gridStyle: "dots" | "lines";
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
  onToggleType: (type: EntityType) => void;
  onSetGridStyle: (style: "dots" | "lines") => void;
}

const iconBtn =
  "flex size-8 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-800 hover:text-white";

export function CanvasToolbar({
  zoom,
  visibleTypes,
  gridStyle,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
  onToggleType,
  onSetGridStyle,
}: CanvasToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const hiddenCount = ENTITY_TYPE_ORDER.filter((t) => !visibleTypes[t]).length;

  return (
    <>
      {/* Filters — top-left */}
      <div
        className="pointer-events-auto absolute left-3 top-3 z-50"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border border-ink-700/70 bg-ink-900/90 px-2.5 py-1.5 text-xs font-medium text-ink-400 backdrop-blur-md transition-colors hover:text-white",
            filterOpen && "text-white border-ink-600",
          )}
        >
          <Filter size={13} />
          Filters
          {hiddenCount > 0 && (
            <span className="rounded-full bg-accent/20 px-1.5 text-[10px] font-semibold text-accent-bright">
              {hiddenCount} off
            </span>
          )}
          <ChevronDown
            size={13}
            className={cn("transition-transform", filterOpen && "rotate-180")}
          />
        </button>

        {filterOpen && (
          <div className="animate-fade-in mt-1.5 w-56 rounded-xl border border-ink-700/70 bg-ink-900/95 p-1.5 shadow-2xl backdrop-blur-md">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              Entity types
            </p>
            {ENTITY_TYPE_ORDER.map((type) => {
              const on = visibleTypes[type];
              const Icon = ENTITY_CONFIG[type].icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onToggleType(type)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors hover:bg-ink-800",
                    on ? "text-white" : "text-ink-500",
                  )}
                >
                  <span
                    className="flex size-5 items-center justify-center rounded"
                    style={{
                      background: on
                        ? `color-mix(in oklch, ${entityColor(type)} 22%, transparent)`
                        : "transparent",
                      color: on ? entityColor(type) : "var(--color-ink-600)",
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${entityColor(type)} ${on ? 36 : 16}%, transparent)`,
                    }}
                  >
                    <Icon size={12} />
                  </span>
                  <span className="flex-1">{ENTITY_CONFIG[type].label}</span>
                  <span
                    className={cn(
                      "h-3.5 w-6 rounded-full p-0.5 transition-colors",
                      on ? "bg-accent/70" : "bg-ink-700",
                    )}
                  >
                    <span
                      className={cn(
                        "block size-2.5 rounded-full bg-white transition-transform",
                        on && "translate-x-2.5",
                      )}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Zoom / view — bottom-left */}
      <div
        className="pointer-events-auto absolute bottom-3 left-3 z-50 flex items-center gap-1 rounded-xl border border-ink-700/70 bg-ink-900/90 p-1 backdrop-blur-md"
        onPointerDown={(e) => e.stopPropagation()}
      >

        <button type="button" className={iconBtn} onClick={onZoomOut} title="Zoom out">
          <ZoomOut size={15} />
        </button>
        <span className="w-11 text-center font-mono text-[11px] text-ink-400">
          {Math.round(zoom * 100)}%
        </span>
        <button type="button" className={iconBtn} onClick={onZoomIn} title="Zoom in">
          <ZoomIn size={15} />
        </button>
        <span className="mx-0.5 h-5 w-px bg-ink-700" />
        <button type="button" className={iconBtn} onClick={onFit} title="Fit to view">
          <Maximize size={15} />
        </button>
        <button type="button" className={iconBtn} onClick={onReset} title="Reset layout">
          <LayoutGrid size={15} />
        </button>
        <span className="mx-0.5 h-5 w-px bg-ink-700" />
        <button
          type="button"
          className={iconBtn}
          onClick={() => onSetGridStyle(gridStyle === "dots" ? "lines" : "dots")}
          title={
            gridStyle === "dots"
              ? "Background: dots — switch to lines"
              : "Background: lines — switch to dots"
          }
        >
          {gridStyle === "dots" ? <Grip size={15} /> : <Grid3x3 size={15} />}
        </button>
      </div>
    </>
  );
}
