# MiZona Backend - Gas Sponsorship Service

This backend service handles incident report submissions to the blockchain while sponsoring gas fees for users. Users can report incidents without needing to hold any MON tokens.

## How It Works

1. **Frontend** sends incident report data to the backend API
2. **Backend** validates the request and prepares the contract call
3. **Backend wallet** (configured with `MONAD_PRIVATE_KEY`) submits the transaction on-chain
4. **Backend wallet** pays the gas fees
5. **Frontend** receives the transaction hash and displays success

## Setup

### Prerequisites

- Node.js 18+
- A funded Monad testnet wallet (stored in `.env`)

### Installation

```bash
npm install
```

### Environment Configuration

Update `.env` with:

```env
# Backend wallet (deployer from initial setup)
MONAD_DEPLOYER_ADDRESS=0x260BBAF7097c9a42bc0E3125429fE512De01b571
MONAD_PRIVATE_KEY=0x9a3f959d34ed2b82b208c1468317d3010265ff0c53c67d298ae611ce87ddd901

# Contract address
VITE_INCIDENT_REGISTRY_ADDRESS=0x02CB5a9DFeaC92560de4a8C1dc82e5686B130ed6

# Backend server config
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Running the Backend

**Single process** (backend only):
```bash
npm run dev:backend
```

**Both frontend and backend** (recommended for development):
```bash
npm run dev:all
```

The backend will start on `http://localhost:3001`

### API Endpoints

#### POST `/api/incidents/report`

Submit a new incident report (backend pays gas).

**Request:**
```json
{
  "type": "robbery",
  "severity": "high",
  "description": "A wallet was stolen on Main Street",
  "lat": 20.6736,
  "lng": -103.344,
  "language": "en"
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "incidentId": "blockchain-..."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

#### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-25T10:30:00.000Z"
}
```

## Wallet Management

### Funding the Backend Wallet

To ensure the backend can continue sponsoring gas, keep the wallet funded. On testnet, use the Monad faucet:

```bash
curl -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"wallet":"0x260BBAF7097c9a42bc0E3125429fE512De01b571"}'
```

### Security Notes

⚠️ **Never commit `.env` to version control** - it contains the private key

For production:
- Use environment variables managed by your deployment platform
- Consider using a dedicated backend wallet with restricted permissions
- Implement rate limiting to prevent abuse
- Add authentication/authorization checks
- Monitor gas spending and set spending limits

## Troubleshooting

### Backend starts but fails to process reports

1. Check `.env` has correct `MONAD_PRIVATE_KEY`
2. Verify wallet is funded: `curl https://testnet-rpc.monad.xyz` (use block explorer or cast to check balance)
3. Check `VITE_INCIDENT_REGISTRY_ADDRESS` is correct
4. Look at backend console logs for detailed error

### Frontend can't connect to backend

1. Ensure backend is running on port 3001
2. Check `VITE_BACKEND_URL` in frontend `.env` is set to `http://localhost:3001`
3. Verify CORS is not blocked (backend has CORS enabled)
4. Check browser console for network errors

### Gas estimation or transaction fails

1. Wallet may be out of gas - fund it via faucet
2. Contract address might be wrong - verify deployment
3. Network might have changed - verify RPC endpoint is correct

## Performance Considerations

- Each report submission is ~300-400 gas on Monad
- On testnet, gas costs are negligible
- On mainnet, consider implementing transaction batching for efficiency
