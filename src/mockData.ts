/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Incident, IncidentType, Severity, Confidence } from './types';

const reporters = [
  { address: "0xABCD...1234", reputation: 72 },
  { address: "0x88EE...9921", reputation: 45 },
  { address: "0x22FF...3310", reputation: 98 },
  { address: "0x99AA...BB11", reputation: 12 },
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'robbery',
    severity: 'high',
    confidence: 'confirmed',
    description: 'Street robbery reported near Times Square. Suspect fled east.',
    lat: 40.7580,
    lng: -73.9855,
    timestamp: Date.now() - 15 * 60000,
    reporter: reporters[0],
    confirmations: 12,
    similarNearby: 2
  },
  {
    id: '2',
    type: 'weapon',
    severity: 'high',
    confidence: 'pending',
    description: 'Argument involving a sharp object. Police en route.',
    lat: 40.7549,
    lng: -73.9840,
    timestamp: Date.now() - 5 * 60000,
    reporter: reporters[1],
    confirmations: 3,
    similarNearby: 0
  },
  {
    id: '3',
    type: 'suspicious',
    severity: 'medium',
    confidence: 'confirmed',
    description: 'Multiple individuals checking car door handles.',
    lat: 40.7520,
    lng: -73.9770,
    timestamp: Date.now() - 45 * 60000,
    reporter: reporters[2],
    confirmations: 8,
    similarNearby: 1
  },
  {
    id: '4',
    type: 'lighting',
    severity: 'medium',
    confidence: 'confirmed',
    description: 'Street lights out for two blocks. Very low visibility.',
    lat: 40.7480,
    lng: -73.9820,
    timestamp: Date.now() - 120 * 60000,
    reporter: reporters[3],
    confirmations: 24,
    similarNearby: 0
  },
  {
    id: '5',
    type: 'other',
    severity: 'medium',
    confidence: 'disputed',
    description: 'Unusual noise from construction site after hours.',
    lat: 40.7620,
    lng: -73.9910,
    timestamp: Date.now() - 10 * 60000,
    reporter: { address: "0x33BB...CC22", reputation: 5 },
    confirmations: 1,
    similarNearby: 0
  },
  {
    id: '6',
    type: 'robbery',
    severity: 'high',
    confidence: 'confirmed',
    description: 'Phone snatching at subway entrance.',
    lat: 40.7410,
    lng: -73.9890,
    timestamp: Date.now() - 30 * 60000,
    reporter: reporters[0],
    confirmations: 15,
    similarNearby: 1
  },
  {
    id: '7',
    type: 'suspicious',
    severity: 'medium',
    confidence: 'pending',
    description: 'Unattended bag left near park entrance.',
    lat: 40.7650,
    lng: -73.9730,
    timestamp: Date.now() - 20 * 60000,
    reporter: reporters[1],
    confirmations: 2,
    similarNearby: 0
  },
  {
    id: '8',
    type: 'weapon',
    severity: 'high',
    confidence: 'confirmed',
    description: 'Shots reported in the alleyway.',
    lat: 40.7450,
    lng: -73.9750,
    timestamp: Date.now() - 2 * 60000,
    reporter: reporters[2],
    confirmations: 9,
    similarNearby: 4
  }
];

export const generateRandomIncident = (): Incident => {
  const types: IncidentType[] = ['robbery', 'weapon', 'suspicious', 'lighting', 'other'];
  const severities: Severity[] = ['high', 'medium'];
  const baseLat = 40.75;
  const baseLng = -73.98;
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    confidence: 'pending',
    description: 'Automatically detected potential safety incident.',
    lat: baseLat + (Math.random() - 0.5) * 0.05,
    lng: baseLng + (Math.random() - 0.5) * 0.05,
    timestamp: Date.now(),
    reporter: { address: '0xAI...GENERATED', reputation: 50 },
    confirmations: 0,
    similarNearby: 0
  };
};
