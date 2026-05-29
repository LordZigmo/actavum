// Pure coordinate-transform math for the canvas. No React here — keeps the
// canvas logic testable and the components legible.
//
// Coordinate model: node positions live in a fixed "world" space. The scene is
// rendered with a single CSS transform `translate(panX,panY) scale(zoom)` and
// `transform-origin: 0 0`, so:
//   screen = world * zoom + pan      (pan is in screen pixels)
//   world  = (screen - pan) / zoom

import type { Point, Transform } from "./types";

export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 2.2;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function worldToScreen(p: Point, t: Transform): Point {
  return { x: p.x * t.zoom + t.panX, y: p.y * t.zoom + t.panY };
}

export function screenToWorld(p: Point, t: Transform): Point {
  return { x: (p.x - t.panX) / t.zoom, y: (p.y - t.panY) / t.zoom };
}

/**
 * Zoom by `factor` while keeping the screen point (cx, cy) fixed. For button
 * zoom pass the viewport center; for wheel zoom pass the cursor position.
 */
export function zoomAround(
  t: Transform,
  cx: number,
  cy: number,
  factor: number,
): Transform {
  const zoom = clamp(t.zoom * factor, ZOOM_MIN, ZOOM_MAX);
  // World point currently under (cx, cy).
  const wx = (cx - t.panX) / t.zoom;
  const wy = (cy - t.panY) / t.zoom;
  // Solve new pan so that world point maps back to (cx, cy) at the new zoom.
  return { zoom, panX: cx - wx * zoom, panY: cy - wy * zoom };
}

/** Frame the given world points within a viewport, with screen-pixel padding. */
export function fitTransform(
  points: Point[],
  viewportW: number,
  viewportH: number,
  pad = 96,
): Transform {
  if (points.length === 0 || viewportW <= 0 || viewportH <= 0) {
    return { panX: 0, panY: 0, zoom: 1 };
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const boxW = Math.max(maxX - minX, 1);
  const boxH = Math.max(maxY - minY, 1);
  const zoom = clamp(
    Math.min((viewportW - pad * 2) / boxW, (viewportH - pad * 2) / boxH),
    ZOOM_MIN,
    ZOOM_MAX,
  );
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return {
    zoom,
    panX: viewportW / 2 - cx * zoom,
    panY: viewportH / 2 - cy * zoom,
  };
}

/** Smooth horizontal-handle cubic bezier between two node centers (world coords). */
export function bezierPath(a: Point, b: Point): string {
  const dx = b.x - a.x;
  const handle = Math.max(40, Math.abs(dx) * 0.5);
  const c1x = a.x + handle;
  const c2x = b.x - handle;
  return `M ${a.x} ${a.y} C ${c1x} ${a.y} ${c2x} ${b.y} ${b.x} ${b.y}`;
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}
