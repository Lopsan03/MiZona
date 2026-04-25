/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { WalletState } from '../types';

interface WalletContextType {
  wallet: WalletState;
  connect: () => void;
  disconnect: () => void;
  isLoading: boolean;
  getEthereumProvider: () => Promise<any | null>;
}

// WalletProvider is kept as a passthrough so the component tree stays unchanged.
// The real provider is PrivyProvider in App.tsx.
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useWallet(): WalletContextType {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  // Resolve address from wallet or any linked wallet account.
  const address =
    user?.wallet?.address ??
    (user?.linkedAccounts?.find((a) => a.type === 'wallet') as any)?.address ??
    null;

  const wallet: WalletState = {
    isConnected: authenticated,
    address,
    reputation: 42,
  };

  const getEthereumProvider = async () => {
    const normalizedAddress = address?.toLowerCase();
    const connectedWallet = wallets.find(
      (candidate) =>
        candidate.type === 'ethereum' &&
        candidate.address?.toLowerCase() === normalizedAddress,
    ) ?? wallets.find((candidate) => candidate.type === 'ethereum');

    if (connectedWallet) {
      return connectedWallet.getEthereumProvider();
    }

    if (typeof window !== 'undefined' && window.ethereum) {
      return window.ethereum;
    }

    return null;
  };

  return {
    wallet,
    connect: login,
    disconnect: logout,
    isLoading: !ready || !walletsReady,
    getEthereumProvider,
  };
}
