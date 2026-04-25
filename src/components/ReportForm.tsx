/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Zap, 
  AlertTriangle, 
  Eye, 
  Ghost, 
  MoreHorizontal,
  Navigation,
  Loader2,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { IncidentType, Severity } from '../types';
import { useWallet } from '../contexts/WalletContext';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onConnectClick: () => void;
}

const CATEGORIES: { id: IncidentType; label: string; icon: React.ReactNode }[] = [
  { id: 'robbery', label: 'Robbery', icon: <Zap size={18} /> },
  { id: 'weapon', label: 'Weapon', icon: <AlertTriangle size={18} /> },
  { id: 'suspicious', label: 'Suspicious', icon: <Eye size={18} /> },
  { id: 'lighting', label: 'Lighting', icon: <Ghost size={18} /> },
  { id: 'other', label: 'Other', icon: <MoreHorizontal size={18} /> },
];

export default function ReportForm({ isOpen, onClose, onSubmit, onConnectClick }: ReportFormProps) {
  const { wallet } = useWallet();
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [type, setType] = useState<IncidentType | null>(null);
  const [severity, setSeverity] = useState<Severity>('medium');
  const [description, setDescription] = useState('');

  const handleFormSubmit = async () => {
    if (!type || !description) return;
    
    setStep('loading');
    // Simulate transaction signing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep('success');
    onSubmit({ type, severity, description });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    handleClose();
  };

  const handleClose = () => {
    setStep('form');
    setType(null);
    setSeverity('medium');
    setDescription('');
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[80]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[90] p-4 pointer-events-none"
          >
            <div className="max-w-lg mx-auto glass-card rounded-t-[32px] rounded-b-2xl p-6 pointer-events-auto shadow-2xl">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 opacity-50" />
              
              <AnimatePresence mode="wait">
                {!wallet.isConnected ? (
                  <motion.div 
                    key="no-wallet"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10 text-center"
                  >
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Wallet size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Connect Wallet</h3>
                    <p className="text-slate-500 text-sm mb-8 px-4">
                      Sentinel uses your wallet as a secure digital identity. Connect to report incidents and build reputation.
                    </p>
                    <button 
                      onClick={onConnectClick}
                      className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-transform"
                    >
                      Connect Wallet
                    </button>
                  </motion.div>
                ) : step === 'form' ? (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold">Report Incident</h3>
                      <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Category</label>
                        <div className="grid grid-cols-3 gap-2">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setType(cat.id)}
                              className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all border ${
                                type === cat.id 
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                  : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              {cat.icon}
                              <span className="text-[10px] font-bold uppercase tracking-tight">{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Severity</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setSeverity('medium')}
                            className={`h-12 rounded-2xl font-bold text-xs transition-all border ${
                              severity === 'medium'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                                : 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 border-transparent'
                            }`}
                          >
                            Medium
                          </button>
                          <button
                            onClick={() => setSeverity('high')}
                            className={`h-12 rounded-2xl font-bold text-xs transition-all border ${
                              severity === 'high'
                                ? 'bg-red-500 text-white border-red-500 shadow-md'
                                : 'bg-red-50 dark:bg-red-900/10 text-red-600 border-transparent'
                            }`}
                          >
                            High
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Description</label>
                          <span className="text-[10px] font-medium text-slate-300">{description.length}/120</span>
                        </div>
                        <textarea
                          placeholder="What did you see? Be brief and accurate..."
                          maxLength={120}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-slate-300 dark:focus:border-slate-500 rounded-2xl p-4 text-sm outline-none resize-none h-24 transition-all"
                        />
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                          <Navigation size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">Static Location</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Using current GPS position</p>
                        </div>
                      </div>

                      <button
                        disabled={!type || description.length < 5}
                        onClick={handleFormSubmit}
                        className={`w-full h-14 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
                          type && description.length >= 5
                            ? 'bg-slate-900 text-white shadow-slate-900/10'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed shadow-none'
                        }`}
                      >
                        File Report
                      </button>
                    </div>
                  </motion.div>
                ) : step === 'loading' ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                    <Loader2 size={48} className="mx-auto mb-6 text-slate-400 animate-spin" />
                    <h3 className="text-xl font-bold mb-2">Signing Transaction...</h3>
                    <p className="text-slate-400 text-sm">Validating report on the network</p>
                  </motion.div>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Report Filed</h3>
                    <p className="text-slate-400 text-sm">Your reputation will update once validated.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
