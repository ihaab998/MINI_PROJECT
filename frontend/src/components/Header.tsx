"use client";

import React from 'react';
import { Activity, Upload, ShieldCheck, HeartPulse, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  patientName?: string;
  patientAge?: string;
  isTier2Active?: boolean;
  activeConditionsCount?: number;
  onOpenUploadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  patientName = "John Doe",
  patientAge = "51 y/o • Male • DOB 1975-08-15",
  isTier2Active = true,
  activeConditionsCount = 2,
  onOpenUploadModal
}) => {
  return (
    <header className="w-full border-b border-white/[0.08] bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left: Platform Brand & Patient Info */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center shadow-inner">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-medium tracking-tight text-white/90">
                {patientName}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase bg-white/[0.06] text-white/60 border border-white/[0.1] rounded-full">
                ID: P-94021
              </span>
            </div>
            <p className="text-xs text-white/40 tracking-tight mt-0.5">
              {patientAge}
            </p>
          </div>
        </div>

        {/* Right: Tier Status Indicator & Upload Button */}
        <div className="flex items-center space-x-3">
          
          {/* Dynamic Tier Status Pill */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`px-3.5 py-1.5 rounded-full border flex items-center space-x-2 text-xs font-medium tracking-wide ${
              isTier2Active
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {isTier2Active ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
                <span className="uppercase text-[11px] font-mono tracking-wider">
                  Tier 2: Chronic Focus Active ({activeConditionsCount})
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="uppercase text-[11px] font-mono tracking-wider">
                  Tier 1: Master Health Timeline
                </span>
              </>
            )}
          </motion.div>

          {/* Document Upload Button */}
          <button
            onClick={onOpenUploadModal}
            className="glass-button px-4 py-2 rounded-xl text-xs font-medium text-white/90 flex items-center space-x-2 cursor-pointer shadow-sm hover:shadow-cyan-500/10 active:scale-98 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Document</span>
          </button>

        </div>

      </div>
    </header>
  );
};
