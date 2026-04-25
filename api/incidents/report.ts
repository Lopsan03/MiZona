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
      const missingVars = [];
      if (!privateKey) missingVars.push('MONAD_PRIVATE_KEY');
      if (!contractAddress) missingVars.push('VITE_INCIDENT_REGISTRY_ADDRESS');
      console.error('Missing environment variables:', missingVars);
      return json({ success: false, error: `Server configuration error: Missing ${missingVars.join(', ')}` }, { status: 500 });
    }

    console.log('Processing incident report:', { type, severity, lat, lng });

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

    console.log('Simulating contract call...');
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

    console.log('Writing contract...');
    const hash = await walletClient.writeContract(contractRequest);
    console.log('Transaction hash:', hash);
    
    // Wait for transaction receipt with a 120-second timeout
    console.log('Waiting for transaction confirmation (max 120 seconds)...');
    const receipt = await Promise.race([
      publicClient.waitForTransactionReceipt({ hash }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction confirmation timeout: The transaction was submitted but took too long to confirm. Please check the explorer.')), 120000)
      )
    ]);

    console.log('Transaction confirmed:', receipt.transactionHash);
    return json({
      success: true,
      transactionHash: hash,
      incidentId: `blockchain-${receipt.blockNumber}-${receipt.transactionIndex}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Incident report error:', message, error);
    return json({ success: false, error: message }, { status: 500 });
  }
}