/**
 * Trust-score helpers for Mi Zona incidents.
 *
 * Government CSV incidents start at 100 (alta confianza).
 * User-reported incidents start at a base determined by incident type,
 * then gain +8 points per community confirmation, capped at 99.
 *
 * Score → Confidence mapping:
 *   70 – 100  →  'confirmed'   (alta confianza)
 *   35 – 69   →  'disputed'    (media confianza)
 *   0  – 34   →  'pending'     (baja confianza)
 */

import { Confidence, IncidentType } from './types';

/** Points gained per community confirmation. */
export const POINTS_PER_CONFIRMATION = 8;

/** Starting trust points for user-reported incidents, by type. */
export const BASE_POINTS: Record<IncidentType, number> = {
  // Very serious crimes need many confirmations before trust is high.
  homicide:     10,
  kidnapping:   10,
  sexualCrime:  10,
  // Serious but more commonly reported.
  assault:      20,
  robbery:      22,
  // Activity-type reports.
  drugActivity: 18,
  other:        15,
};

/** Clamp to [0, 100]. */
export const clampPoints = (value: number): number => Math.max(0, Math.min(100, value));

/**
 * Calculate total trust points for a user-reported incident.
 * Does NOT apply to government/CSV incidents — those are always 100.
 */
export const calcPoints = (type: IncidentType, confirmations: number): number =>
  clampPoints(BASE_POINTS[type] + confirmations * POINTS_PER_CONFIRMATION);

/**
 * Derive a Confidence level from a numeric points value.
 *  70+  → confirmed   (alta confianza)
 *  35+  → disputed    (media confianza)
 *  else → pending     (baja confianza)
 */
export const pointsToConfidence = (points: number): Confidence => {
  if (points >= 70) return 'confirmed';
  if (points >= 35) return 'disputed';
  return 'pending';
};

/** Human-readable trust label. */
export const confidenceLabel = {
  en: {
    confirmed: 'Alta Confianza',
    disputed:  'Media Confianza',
    pending:   'Baja Confianza',
  },
  es: {
    confirmed: 'Alta Confianza',
    disputed:  'Media Confianza',
    pending:   'Baja Confianza',
  },
} as const;
