/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Radio, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '../contexts/WalletContext';

interface FloatingUIProps {
  count: number;
  onReportClick: () => void;
  onConnectClick: () => void;
}

export default function FloatingUI({ count, onReportClick, onConnectClick }: FloatingUIProps) {
  const { wallet } = useWallet();

  return (
    <div className="fixed inset-0 z-40 pointer-events-none p-8">
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card px-4 h-12 rounded-2xl flex items-center gap-3"
        >
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {count} Active Incidents Nearby
          </span>
        </motion.div>
      </div>

      <div className="absolute bottom-8 right-8 pointer-events-auto flex flex-col items-end gap-4">
        <AnimatePresence>
          {!wallet.isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="glass-card p-5 rounded-2xl max-w-[220px] text-center"
            >
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Radio size={18} className="text-slate-500" />
              </div>
              <p className="text-xs font-semibold mb-4 text-slate-600 dark:text-slate-400">Connect wallet to report or validate local incidents.</p>
              <button 
                onClick={onConnectClick}
                className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
              >
                Connect Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReportClick}
          className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl transition-transform"
        >
          <Plus size={32} strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
}
