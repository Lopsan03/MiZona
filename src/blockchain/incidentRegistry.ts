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
import { calcPoints, pointsToConfidence } from '../trustScore';

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
  reporterAddress: Address;
  ethereumProvider: NonNullable<typeof window.ethereum>;
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

  try {
    await ensureMonadTestnet(input.ethereumProvider);

    const walletClient = createWalletClient({
      account: input.reporterAddress,
      chain: monadTestnet,
      transport: custom(input.ethereumProvider),
    });

    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(monadTestnet.rpcUrls.default.http[0]),
    });

    const { request } = await publicClient.simulateContract({
      account: input.reporterAddress,
      address: MONAD_INCIDENT_REGISTRY_ADDRESS,
      abi: INCIDENT_REGISTRY_ABI,
      functionName: 'reportIncident',
      args: [
        input.type,
        input.severity,
        input.description,
        toScaledCoordinate(input.lat),
        toScaledCoordinate(input.lng),
        input.language,
      ],
    });

    const hash = await walletClient.writeContract(request);

    await Promise.race([
      publicClient.waitForTransactionReceipt({ hash }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Transaction confirmation timeout. Your wallet submitted the transaction, but Monad took too long to confirm it.'));
        }, 120000);
      }),
    ]);

    return hash;
  } catch (error) {
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
      points: calcPoints(incident.incidentType as IncidentType, confirmations),
      confidence: pointsToConfidence(calcPoints(incident.incidentType as IncidentType, confirmations)),
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
