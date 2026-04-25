/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Zap, 
  MoreHorizontal,
  Siren,
  ShieldAlert,
  Pill,
  Wallet,
} from 'lucide-react';
import { Incident, IncidentType } from '../types';
import { useWallet } from '../contexts/WalletContext';
import { categoryLabels, Language, uiText } from '../i18n';
import { confidenceLabel } from '../trustScore';

interface IncidentPanelProps {
  incident: Incident | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  language: Language;
}

const IconMap: Record<IncidentType, React.ReactNode> = {
  robbery: <Zap size={18} />,
  assault: <AlertTriangle size={18} />,
  homicide: <Siren size={18} />,
  kidnapping: <ShieldAlert size={18} />,
  sexualCrime: <Eye size={18} />,
  drugActivity: <Pill size={18} />,
  other: <MoreHorizontal size={18} />
};

export default function IncidentPanel({ incident, onClose, onConfirm, language }: IncidentPanelProps) {
  const { wallet } = useWallet();
  const copy = uiText[language];

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return copy.justNow;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}${copy.agoM}`;
    return `${Math.floor(minutes / 60)}${copy.agoH}`;
  };

  return (
    <AnimatePresence>
      {incident && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-[70] p-4 pointer-events-none"
          >
            <div className="glass-card rounded-[32px] p-6 pointer-events-auto border-b shadow-2xl overflow-hidden">
              <div className="w-12 h-1.5 bg-slate-300/50 rounded-full mx-auto mb-6" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                      incident.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {incident.severity.toUpperCase()} SEVERITY
                    </div>
                    <span className="text-slate-400 text-xs font-medium">{getTimeAgo(incident.timestamp)}</span>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">{categoryLabels[language][incident.type].long}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  incident.severity === 'high' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                }`}>
                  {IconMap[incident.type]}
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {incident.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider text-left">Confianza</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      incident.confidence === 'confirmed' ? 'text-green-600 dark:text-green-400' :
                      incident.confidence === 'disputed'  ? 'text-amber-600 dark:text-amber-400' :
                                                           'text-slate-500 dark:text-slate-400'
                    }`}>{incident.points} pts</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${
                      incident.confidence === 'confirmed' ? 'text-green-500' :
                      incident.confidence === 'disputed'  ? 'text-amber-500' :
                                                           'text-slate-400'
                    }`}>{confidenceLabel[language][incident.confidence]}</span>
                  </div>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider text-left">{copy.confirmations}</div>
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{incident.confirmations}</span>
                    {incident.points < 70 && (
                      <span className="text-[10px] text-slate-400">
                        +{Math.ceil((70 - incident.points) / 8)} para Alta
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-6 mb-6">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-mono text-xs">
                  {incident.reporter.address.substring(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-slate-500">{incident.reporter.address}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{copy.validatedIdentity}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => wallet.isConnected && onConfirm(incident.id)}
                disabled={!wallet.isConnected}
                className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  wallet.isConnected 
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed shadow-none'
                }`}
              >
                {wallet.isConnected ? (
                  <>
                    <ShieldCheck size={20} />
                    {copy.confirmIncident}
                  </>
                ) : (
                  <>
                    <Wallet size={18} />
                    {copy.connectToInteract}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
