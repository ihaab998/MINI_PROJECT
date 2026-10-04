"use client";

import React from 'react';
import { motion } from 'framer-motion';

export type DashboardTab = 'TIMELINE' | 'CHRONIC' | 'DOCUMENTS' | 'MEDICATIONS' | 'AGENT';

interface SegmentedTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const TABS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: 'TIMELINE', label: 'Timeline', icon: '⏱' },
  { id: 'CHRONIC', label: 'Chronic Dashboard', icon: '📈' },
  { id: 'DOCUMENTS', label: 'Documents', icon: '📄' },
  { id: 'MEDICATIONS', label: 'Medications', icon: '💊' },
  { id: 'AGENT', label: 'AI Health Agent', icon: '🤖' }
];

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="w-full bg-white/80 backdrop-blur-xl p-1.5 rounded-full border border-[#cbd8f9]/70 shadow-xs flex items-center space-x-1 overflow-x-auto font-sans">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex-1 py-2.5 px-5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
              isActive ? 'text-white font-bold' : 'text-[#5a6a9d] hover:text-[#3d4ca6] hover:bg-white/60'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-[#6b7cce] rounded-full shadow-md shadow-[#6b7cce]/25"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
