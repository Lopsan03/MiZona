/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains';

dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests from frontend
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
      FRONTEND_URL,
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Types
interface ReportIncidentRequest {
  type: string;
  severity: string;
  description: string;
  lat: number;
  lng: number;
  language: string;
  userAddress: string;
}

interface ReportIncidentResponse {
  success: boolean;
  incidentId?: string;
  transactionHash?: string;
  error?: string;
}

// Smart Contract ABI (reportIncident function only)
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

// Backend wallet for sponsoring gas
const BACKEND_PRIVATE_KEY = process.env.MONAD_PRIVATE_KEY as `0x${string}`;
const INCIDENT_REGISTRY_ADDRESS = process.env.VITE_INCIDENT_REGISTRY_ADDRESS as Address;
const MONAD_CHAIN_ID_HEX = '0x279f';

// Helper to convert coordinates
const toScaledCoordinate = (value: number): bigint => BigInt(Math.round(value * 1_000_000));

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Report incident endpoint (backend sponsors gas)
 * POST /api/incidents/report
 */
app.post('/api/incidents/report', async (req: Request, res: Response) => {
  try {
    const { type, severity, description, lat, lng, language, userAddress } = req.body as ReportIncidentRequest;

    // Validate input
    if (!type || !severity || !description || typeof lat !== 'number' || typeof lng !== 'number' || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid required fields',
      } as ReportIncidentResponse);
    }

    if (!BACKEND_PRIVATE_KEY || !INCIDENT_REGISTRY_ADDRESS) {
      return res.status(500).json({
        success: false,
        error: 'Backend not configured for blockchain transactions',
      } as ReportIncidentResponse);
    }

    // Create wallet and public clients
    const account = privateKeyToAccount(BACKEND_PRIVATE_KEY);
    
    const walletClient = createWalletClient({
      chain: monadTestnet,
      transport: http(monadTestnet.rpcUrls.default.http[0]),
      account,
    });

    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(monadTestnet.rpcUrls.default.http[0]),
    });

    // Simulate the contract call
    const { request } = await publicClient.simulateContract({
      account,
      address: INCIDENT_REGISTRY_ADDRESS,
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

    // Write the transaction (backend pays gas)
    const hash = await walletClient.writeContract(request);

    // Wait for receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log(`✅ Incident reported successfully. Tx: ${hash}`);

    return res.status(200).json({
      success: true,
      transactionHash: hash,
      incidentId: `blockchain-${receipt.blockNumber}-${receipt.transactionIndex}`,
    } as ReportIncidentResponse);
  } catch (error) {
    console.error('Error reporting incident:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({
      success: false,
      error: errorMessage,
    } as ReportIncidentResponse);
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`🚀 MiZona backend running on port ${PORT}`);
  console.log(`📍 Monad Testnet Chain ID: ${monadTestnet.id}`);
  console.log(`📝 Contract Address: ${INCIDENT_REGISTRY_ADDRESS}`);
});
