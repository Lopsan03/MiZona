/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Sun, Moon, Wallet } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../contexts/WalletContext';
import { motion, AnimatePresence } from 'motion/react';
import { Language, uiText } from '../i18n';

interface TopBarProps {
  onConnectClick: () => void;
  language: Language;
  onLanguageToggle: () => void;
}

export default function TopBar({ onConnectClick, language, onLanguageToggle }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { wallet, disconnect, isLoading } = useWallet();
  const copy = uiText[language];

  return (
    <div className="fixed top-6 left-6 right-6 z-50 h-16 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full bg-card backdrop-blur-[20px] border border-border rounded-2xl px-6 shadow-lg pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <Shield size={22} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white">{copy.brand}</span>
        </motion.div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLanguageToggle}
            className="h-10 px-3 rounded-lg hover:bg-white/50 text-slate-600 dark:text-slate-300 transition-colors font-bold text-xs"
          >
            {copy.languageToggle}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/50 text-slate-600 dark:text-slate-300 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            onClick={wallet.isConnected ? disconnect : onConnectClick}
            className={`h-11 px-4 glass-card rounded-xl flex items-center gap-3 transition-all border-slate-900/10 ${
              wallet.isConnected ? 'border-green-500/20' : ''
            }`}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Wallet size={18} className="text-slate-400" />
                </motion.div>
              ) : wallet.isConnected ? (
                <motion.div key="connected" className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {wallet.address?.substring(0, 5)}...{wallet.address?.substring(wallet.address.length - 4)}
                    </span>
                    <div className="w-[1px] h-4 bg-slate-300" />
                    <span className="text-sm font-bold">⭐ {wallet.reputation}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="connect" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Wallet size={18} />
                  <span className="text-sm font-bold">{copy.connectWallet}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
