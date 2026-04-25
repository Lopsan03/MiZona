/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { WalletState } from '../types';

interface WalletContextType {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    reputation: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate connection time
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            setWallet({
              isConnected: true,
              address: accounts[0],
              reputation: 72, // Mock reputation for real wallet
            });
            return;
          }
        } catch (err) {
          console.error("MetaMask connection failed", err);
        }
      }

      // Fallback to mock wallet
      setWallet({
        isConnected: true,
        address: '0xMOCK' + Math.random().toString(16).slice(2, 10).toUpperCase() + '...XXXX',
        reputation: 42,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      reputation: 0,
    });
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect, isLoading }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
