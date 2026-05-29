// Single source of truth mapping entity types and confidence levels to their
// label, icon, and color token. Colors reference CSS variables defined in
// app/globals.css so they work in both className and inline SVG contexts.

import {
  Building2,
  Car,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Confidence, EntityType } from "./types";

export interface EntityTypeConfig {
  label: string;
  icon: LucideIcon;
  /** CSS variable holding the type's accent color. */
  colorVar: string;
}

export const ENTITY_CONFIG: Record<EntityType, EntityTypeConfig> = {
  person: { label: "Person", icon: User, colorVar: "--color-entity-person" },
  company: { label: "Company", icon: Building2, colorVar: "--color-entity-company" },
  address: { label: "Address", icon: MapPin, colorVar: "--color-entity-address" },
  phone: { label: "Phone", icon: Phone, colorVar: "--color-entity-phone" },
  email: { label: "Email", icon: Mail, colorVar: "--color-entity-email" },
  bankAccount: { label: "Bank Account", icon: Landmark, colorVar: "--color-entity-bank" },
  vehicle: { label: "Vehicle", icon: Car, colorVar: "--color-entity-vehicle" },
  document: { label: "Document", icon: FileText, colorVar: "--color-entity-document" },
  event: { label: "Event", icon: Zap, colorVar: "--color-entity-event" },
};

/** Order used by filter toolbars and legends. */
export const ENTITY_TYPE_ORDER: EntityType[] = [
  "person",
  "company",
  "address",
  "phone",
  "email",
  "bankAccount",
  "vehicle",
  "document",
  "event",
];

export const CONFIDENCE_CONFIG: Record<
  Confidence,
  { label: string; colorVar: string }
> = {
  high: { label: "High", colorVar: "--color-conf-high" },
  medium: { label: "Medium", colorVar: "--color-conf-medium" },
  low: { label: "Low", colorVar: "--color-conf-low" },
};

export function entityColor(type: EntityType): string {
  return `var(${ENTITY_CONFIG[type].colorVar})`;
}

export function confidenceColor(confidence: Confidence): string {
  return `var(${CONFIDENCE_CONFIG[confidence].colorVar})`;
}
