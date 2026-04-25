/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Globe, Loader2 } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, isLoading } = useWallet();

  const handleConnect = async () => {
    await connect();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md glass-card rounded-[40px] p-8 pointer-events-auto overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold">Connect Identity</h3>
                  <p className="text-sm text-slate-400 font-medium">Verify your citizenship on Sentinel</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="w-full p-5 glass-card bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/20 text-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <Globe size={28} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">Browser Extension</p>
                      <p className="text-xs text-slate-400 font-medium">MetaMask, Rabby, or Brave Wallet</p>
                    </div>
                  </div>
                  {isLoading ? <Loader2 size={20} className="animate-spin text-slate-300" /> : <div className="text-slate-300 group-hover:text-slate-500 transition-colors">→</div>}
                </button>

                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="w-full p-5 glass-card bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <Smartphone size={28} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">Mobile App</p>
                      <p className="text-xs text-slate-400 font-medium">WalletConnect or Coinbase Wallet</p>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-slate-500 transition-colors">→</div>
                </button>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
                  Your wallet is your identity. Building reputation<br />unlocks higher governance power.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
