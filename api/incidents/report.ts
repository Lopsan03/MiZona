import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains';

interface ReportIncidentRequest {
  type: string;
  severity: string;
  description: string;
  lat: number;
  lng: number;
  language: string;
}

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
] as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const toScaledCoordinate = (value: number): bigint => BigInt(Math.round(value * 1_000_000));

const json = (body: unknown, init?: ResponseInit) => {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
};

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { type, severity, description, lat, lng, language } = (await request.json()) as ReportIncidentRequest;

    if (!type || !severity || !description || typeof lat !== 'number' || typeof lng !== 'number' || !language) {
      return json({ success: false, error: 'Missing or invalid required fields' }, { status: 400 });
    }

    const privateKey = process.env.MONAD_PRIVATE_KEY as `0x${string}` | undefined;
    const contractAddress = process.env.VITE_INCIDENT_REGISTRY_ADDRESS as Address | undefined;

    if (!privateKey || !contractAddress) {
      return json({ success: false, error: 'Server is missing blockchain environment variables' }, { status: 500 });
    }

    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      chain: monadTestnet,
      transport: http(monadTestnet.rpcUrls.default.http[0]),
      account,
    });

    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(monadTestnet.rpcUrls.default.http[0]),
    });

    const { request: contractRequest } = await publicClient.simulateContract({
      account,
      address: contractAddress,
      abi: INCIDENT_REGISTRY_ABI,
      functionName: 'reportIncident',
      args: [
        type,
        severity,
        description,
        toScaledCoordinate(lat),
        toScaledCoordinate(lng),
        language,
      ],
    });

    const hash = await walletClient.writeContract(contractRequest);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return json({
      success: true,
      transactionHash: hash,
      incidentId: `blockchain-${receipt.blockNumber}-${receipt.transactionIndex}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return json({ success: false, error: message }, { status: 500 });
  }
}