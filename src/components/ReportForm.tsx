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
  MoreHorizontal,
  Navigation,
  Loader2,
  CheckCircle2,
  Wallet,
  Siren,
  ShieldAlert,
  Pill
} from 'lucide-react';
import { IncidentType, Severity } from '../types';
import { useWallet } from '../contexts/WalletContext';
import { categoryLabels, Language, uiText } from '../i18n';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: IncidentType; severity: Severity; description: string }) => Promise<void>;
  onConnectClick: () => void;
  userLocation: [number, number] | null;
  locationReady: boolean;
  language: Language;
}

const CATEGORY_ICONS: Record<IncidentType, React.ReactNode> = {
  robbery: <Zap size={18} />,
  assault: <AlertTriangle size={18} />,
  homicide: <Siren size={18} />,
  kidnapping: <ShieldAlert size={18} />,
  sexualCrime: <Eye size={18} />,
  drugActivity: <Pill size={18} />,
  other: <MoreHorizontal size={18} />,
};

const CATEGORY_ORDER: IncidentType[] = [
  'robbery',
  'assault',
  'homicide',
  'kidnapping',
  'sexualCrime',
  'drugActivity',
  'other',
];

// Auto-assign severity based on incident type
const getSeverityForType = (type: IncidentType): Severity => {
  // High severity (red): most violent/serious crimes
  if (['homicide', 'kidnapping', 'sexualCrime'].includes(type)) {
    return 'high';
  }
  // Medium severity (amber): other crimes
  return 'medium';
};

export default function ReportForm({ isOpen, onClose, onSubmit, onConnectClick, userLocation, locationReady, language }: ReportFormProps) {
  const { wallet } = useWallet();
  const copy = uiText[language];
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [type, setType] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-assign severity based on selected type
  const severity = type ? getSeverityForType(type) : 'medium';

  const handleFormSubmit = async () => {
    if (!type || !description) return;
    
    setStep('loading');
    setSubmitError(null);

    try {
      await onSubmit({ type, severity, description });
      setStep('success');
      await new Promise(resolve => setTimeout(resolve, 1500));
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.reportErrorDefault;
      setSubmitError(message || copy.reportErrorDefault);
      setStep('form');
    }
  };

  const handleClose = () => {
    setStep('form');
    setType(null);
    setDescription('');
    setSubmitError(null);
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
            className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-4 pointer-events-none"
          >
            <div className="max-w-lg mx-auto glass-card rounded-t-[28px] sm:rounded-t-[32px] rounded-b-2xl p-4 sm:p-6 pointer-events-auto shadow-2xl max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] overflow-y-auto">
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
                    <h3 className="text-2xl font-bold mb-2">{copy.connectIdentity}</h3>
                    <p className="text-slate-500 text-sm mb-8 px-4">
                      {copy.connectIdentityHint}
                    </p>
                    <button 
                      onClick={onConnectClick}
                      className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-transform"
                    >
                      {copy.connectWallet}
                    </button>
                  </motion.div>
                ) : step === 'form' ? (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold">{copy.reportIncident}</h3>
                      <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">{copy.category}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {CATEGORY_ORDER.map((category) => (
                            <button
                              key={category}
                              onClick={() => setType(category)}
                              className={`min-h-20 p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border ${
                                type === category 
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                  : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              {CATEGORY_ICONS[category]}
                              <span className="text-[10px] font-bold uppercase tracking-tight text-center leading-tight">{categoryLabels[language][category].short}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">{copy.description}</label>
                          <span className="text-[10px] font-medium text-slate-300">{description.length}/120</span>
                        </div>
                        <textarea
                          placeholder={copy.descriptionPlaceholder}
                          maxLength={120}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-slate-300 dark:focus:border-slate-500 rounded-2xl p-4 text-sm outline-none resize-none h-24 transition-all"
                        />
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                        <div className={`p-2 rounded-lg ${userLocation ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          <Navigation size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">{copy.location}</p>
                          {!locationReady ? (
                            <p className="text-xs font-semibold text-slate-500">{copy.requestingGps}</p>
                          ) : userLocation ? (
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                              {copy.gpsObtained} · {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                            </p>
                          ) : (
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                              {copy.gpsUnavailable} · {copy.usingGuadalajara}
                            </p>
                          )}
                        </div>
                      </div>

                      {submitError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                          {submitError}
                        </div>
                      )}

                      <button
                        disabled={!type || description.length < 5 || !locationReady}
                        onClick={handleFormSubmit}
                        className={`w-full h-14 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
                          type && description.length >= 5 && locationReady
                            ? 'bg-slate-900 text-white shadow-slate-900/10'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {copy.fileReport}
                      </button>
                    </div>
                  </motion.div>
                ) : step === 'loading' ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                    <Loader2 size={48} className="mx-auto mb-6 text-slate-400 animate-spin" />
                    <h3 className="text-xl font-bold mb-2">{copy.publishingToMonad}</h3>
                    <p className="text-slate-400 text-sm">Processing your report on the blockchain...</p>
                  </motion.div>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{copy.reportFiled}</h3>
                    <p className="text-slate-400 text-sm">{copy.reputationUpdate}</p>
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
