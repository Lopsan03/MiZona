/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
} from 'viem';
import { monadTestnet } from 'viem/chains';
import { IncidentType, Severity, Incident } from '../types';
import { Language } from '../i18n';

const INCIDENT_REGISTRY_ABI = [
  {
    type: 'function',
    stateMutability: 'nonpayable',
    name: 'reportIncident',
    inputs: [
      { name: 'incidentType', type: 'string' },
      { name: 'severity', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'latE6', type: 'int256' },
      { name: 'lngE6', type: 'int256' },
      { name: 'sourceLanguage', type: 'string' },
    ],
    outputs: [{ name: 'incidentId', type: 'uint256' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'getIncident',
    inputs: [{ name: 'incidentId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'reporter', type: 'address' },
          { name: 'incidentType', type: 'string' },
          { name: 'severity', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'latE6', type: 'int256' },
          { name: 'lngE6', type: 'int256' },
          { name: 'reportedAt', type: 'uint256' },
          { name: 'sourceLanguage', type: 'string' },
          { name: 'confirmations', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'nextIncidentId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const MONAD_CHAIN_ID_HEX = '0x279f';

export interface PublishIncidentInput {
  type: IncidentType;
  severity: Severity;
  description: string;
  lat: number;
  lng: number;
  language: Language;
}

export const MONAD_INCIDENT_REGISTRY_ADDRESS = import.meta.env.VITE_INCIDENT_REGISTRY_ADDRESS as Address | undefined;

const toScaledCoordinate = (value: number): bigint => BigInt(Math.round(value * 1_000_000));

const ensureMonadTestnet = async (provider: NonNullable<typeof window.ethereum>) => {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_CHAIN_ID_HEX }],
    });
  } catch (error) {
    const walletError = error as { code?: number };
    if (walletError.code !== 4902) {
      throw error;
    }

    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: MONAD_CHAIN_ID_HEX,
        chainName: monadTestnet.name,
        nativeCurrency: monadTestnet.nativeCurrency,
        rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
        blockExplorerUrls: [monadTestnet.blockExplorers?.default.url ?? 'https://testnet.monadscan.com'],
      }],
    });
  }
};

export const isMonadReportingConfigured = (): boolean => Boolean(MONAD_INCIDENT_REGISTRY_ADDRESS);

export const publishIncidentToMonad = async (input: PublishIncidentInput): Promise<`0x${string}` | null> => {
  if (!MONAD_INCIDENT_REGISTRY_ADDRESS) {
    return null;
  }

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || '/api').replace(/\/$/, '');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 150000); // 2.5 minute timeout
    
    const response = await fetch(`${backendUrl}/incidents/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: input.type,
        severity: input.severity,
        description: input.description,
        lat: input.lat,
        lng: input.lng,
        language: input.language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Backend service error');
    }

    const result = await response.json();
    return result.transactionHash || null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Report submission timed out. Please try again or check your internet connection.');
    }
    const message = error instanceof Error ? error.message : 'Failed to submit report';
    throw new Error(message);
  }
};

export const fetchBlockchainIncidents = async (): Promise<any[]> => {
  if (!MONAD_INCIDENT_REGISTRY_ADDRESS) {
    return [];
  }

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(monadTestnet.rpcUrls.default.http[0]),
  });

  try {
    // Fetch nextIncidentId to know the range
    const nextId = (await publicClient.readContract({
      address: MONAD_INCIDENT_REGISTRY_ADDRESS,
      abi: INCIDENT_REGISTRY_ABI,
      functionName: 'nextIncidentId',
    } as any)) as bigint;

    const incidents = [];
    for (let i = 0n; i < nextId; i++) {
      try {
        const incident = (await publicClient.readContract({
          address: MONAD_INCIDENT_REGISTRY_ADDRESS,
          abi: INCIDENT_REGISTRY_ABI,
          functionName: 'getIncident',
          args: [i],
        } as any)) as any;

        incidents.push(incident);
      } catch (error) {
        // Skip any incidents that fail to fetch
        console.error(`Failed to fetch incident ${i}:`, error);
      }
    }

    return incidents;
  } catch (error) {
    console.error('Error fetching blockchain incidents:', error);
    return [];
  }
};

export const convertBlockchainIncidentsToApp = (blockchainIncidents: any[]): Incident[] => {
  return blockchainIncidents.map((incident: any) => {
    const latE6 = typeof incident.latE6 === 'bigint' ? Number(incident.latE6) : incident.latE6;
    const lngE6 = typeof incident.lngE6 === 'bigint' ? Number(incident.lngE6) : incident.lngE6;
    const reportedAt = typeof incident.reportedAt === 'bigint' ? Number(incident.reportedAt) : incident.reportedAt;
    const confirmations = typeof incident.confirmations === 'bigint' ? Number(incident.confirmations) : incident.confirmations;
    const id = typeof incident.id === 'bigint' ? incident.id.toString() : incident.id.toString();

    return {
      id: `blockchain-${id}`,
      type: incident.incidentType as IncidentType,
      severity: incident.severity as Severity,
      confidence: confirmations > 0 ? 'confirmed' : 'pending',
      description: incident.description,
      lat: latE6 / 1_000_000,
      lng: lngE6 / 1_000_000,
      timestamp: reportedAt * 1000, // Convert seconds to milliseconds
      reporter: {
        address: incident.reporter,
        reputation: 0,
      },
      confirmations,
      similarNearby: 0,
    };
  });
};
