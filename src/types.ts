/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IncidentType = 'robbery' | 'weapon' | 'suspicious' | 'lighting' | 'other';
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
  description: string;
  lat: number;
  lng: number;
  timestamp: number;
  reporter: Reporter;
  confirmations: number;
  similarNearby: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  reputation: number;
}
