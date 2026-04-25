/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

export type FilterType = 'all' | 'high' | 'confirmed';
export type TimeFilter = 'all' | '30m' | '1h' | '24h';

interface FilterBarProps {
  activeType: FilterType;
  setActiveType: (type: FilterType) => void;
  activeTime: TimeFilter;
  setActiveTime: (time: TimeFilter) => void;
}

export default function FilterBar({ activeType, setActiveType, activeTime, setActiveTime }: FilterBarProps) {
  const typeFilters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Incidents' },
    { id: 'high', label: 'High Severity' },
    { id: 'confirmed', label: 'Confirmed Only' },
  ];

  const timeFilters: { id: TimeFilter; label: string }[] = [
    { id: 'all', label: 'All Time' },
    { id: '1h', label: 'Last 1h' },
    { id: '24h', label: 'Last 24h' },
  ];

  return (
    <div className="fixed top-24 left-0 right-0 z-40 pointer-events-none flex justify-center">
      <div className="flex items-center gap-2 pointer-events-auto overflow-x-auto pb-1 no-scrollbar px-6">
        {typeFilters.map((filter) => (
          <motion.button
            key={filter.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveType(filter.id)}
            className={`px-5 h-10 rounded-full text-sm font-medium transition-all shadow-sm ${
              activeType === filter.id
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'glass-card text-slate-600 dark:text-slate-300'
            }`}
          >
            {filter.label}
          </motion.button>
        ))}
        
        <div className="w-[1px] h-10 bg-slate-300 dark:bg-slate-700 mx-2 flex-shrink-0" />

        {timeFilters.map((filter) => (
          <motion.button
            key={filter.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTime(filter.id)}
            className={`px-5 h-10 rounded-full text-sm font-medium transition-all shadow-sm ${
              activeTime === filter.id
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'glass-card text-slate-600 dark:text-slate-300'
            }`}
          >
            {filter.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
