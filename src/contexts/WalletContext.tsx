/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { WalletState } from '../types';

interface WalletContextType {
  wallet: WalletState;
  connect: () => void;
  disconnect: () => void;
  isLoading: boolean;
}

// WalletProvider is kept as a passthrough so the component tree stays unchanged.
// The real provider is PrivyProvider in App.tsx.
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useWallet(): WalletContextType {
  const { ready, authenticated, user, login, logout } = usePrivy();

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

  return {
    wallet,
    connect: login,
    disconnect: logout,
    isLoading: !ready,
  };
}
