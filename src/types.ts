/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IncidentType = 'robbery' | 'assault' | 'homicide' | 'kidnapping' | 'sexualCrime' | 'drugActivity' | 'other';
export type Severity = 'high' | 'medium';
export type Confidence = 'confirmed' | 'pending' | 'disputed';

export interface Reporter {
  address: string;
  reputation: number;
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: Severity;
  confidence: Confidence;
  /** Trust score 0-100. Government CSV = 100. User reports start lower, grow with confirmations. */
  points: number;
  description: string;
  lat: number;
  lng: number;
  timestamp: number;
  reporter: Reporter;
  confirmations: number;
  similarNearby: number;
}

export interface RouteOption {
  id: string;
  geometry: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  riskScore: number;
  blockedHighCount: number;
  cautionCount: number;
}

export interface SafeRoutePlan {
  destinationName: string;
  destination: [number, number];
  selectedRouteId: string;
  routes: RouteOption[];
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  reputation: number;
}
