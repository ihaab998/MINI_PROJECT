"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Target, CheckCircle2, AlertTriangle, Crosshair, ArrowRight } from 'lucide-react';
import { TimelineEvent, BiomarkerReading } from '../types';

interface DocumentAuditViewerProps {
  event: TimelineEvent | null;
  onClose: () => void;
}

export const DocumentAuditViewer: React.FC<DocumentAuditViewerProps> = ({
  event,
  onClose
}) => {
  if (!event) return null;

  const biomarkers = event.biomarkers || [];
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerReading | null>(
    biomarkers[0] || null
  );

  // Bounding box [ymin, xmin, ymax, xmax] normalized to 0-1000 scale
  const box = selectedBiomarker?.source_bounding_box?.box_2d || [340, 120, 362, 450];
  const topPercent = (box[0] / 1000) * 100;
  const leftPercent = (box[1] / 1000) * 100;
  const heightPercent = ((box[2] - box[0]) / 1000) * 100;
  const widthPercent = ((box[3] - box[1]) / 1000) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-6xl h-[85vh] glass-panel rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Crosshair className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-medium text-white tracking-tight">
                Side-by-Side Spatial Bounding Box Audit Viewer
              </h2>
              <p className="text-xs text-white/40">
                {event.title} • {event.facility || "Diagnostic Center"} • Date: {event.date}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-Side Split Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Parsed Biomarkers List (4 Cols) */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-white/10 p-4 overflow-y-auto space-y-3 bg-[#0a0a0c]/60">
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 block mb-2">
              Extracted Biomarker Entities ({biomarkers.length})
            </span>

            {biomarkers.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBiomarker(b)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedBiomarker?.id === b.id
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-white/90">
                    {b.display_name}
                  </h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    b.is_abnormal
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {b.is_abnormal ? 'Abnormal' : 'Normal'}
                  </span>
                </div>

                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-lg font-light text-white">
                    {b.canonical_value}
                  </span>
                  <span className="text-xs text-white/50">{b.canonical_unit}</span>
                  {b.raw_unit !== b.canonical_unit && (
                    <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                      Raw: {b.raw_value} {b.raw_unit}
                    </span>
                  )}
                </div>

                {/* Ref range & Confidence score */}
                <div className="flex items-center justify-between text-[10px] text-white/40 mt-2 font-mono border-t border-white/[0.04] pt-2">
                  <span>Ref: {b.lab_ref_min ?? 0.7} - {b.lab_ref_max ?? 1.2}</span>
                  <span className="text-cyan-400">Score: {((b.confidence_score || 0.97) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Source Document Canvas Overlay (8 Cols) */}
          <div className="md:col-span-8 p-6 overflow-y-auto bg-[#050507] flex flex-col items-center justify-center relative">
            
            {/* Document Canvas Container */}
            <div className="relative w-full max-w-[620px] aspect-[1/1.3] bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden shadow-2xl p-6 flex flex-col justify-between">
              
              {/* Document Header Watermark */}
              <div className="border-b border-white/10 pb-4 flex justify-between items-center opacity-40">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-white">APOLLO DIAGNOSTICS LAB REPORT</p>
                  <p className="text-[10px] text-white">Patient ID: P-94021 • Encounter: {event.date}</p>
                </div>
                <FileText className="w-8 h-8 text-white/30" />
              </div>

              {/* Simulated Document Lines */}
              <div className="space-y-4 my-auto opacity-20">
                <div className="h-3 bg-white/20 rounded w-3/4" />
                <div className="h-3 bg-white/20 rounded w-1/2" />
                <div className="h-3 bg-white/20 rounded w-5/6" />
                <div className="h-3 bg-white/20 rounded w-2/3" />
                <div className="h-3 bg-white/20 rounded w-4/5" />
              </div>

              {/* Dynamic Bounding Box Overlay Frame */}
              {selectedBiomarker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={selectedBiomarker.id}
                  style={{
                    top: `${topPercent}%`,
                    left: `${leftPercent}%`,
                    height: `${Math.max(heightPercent, 8)}%`,
                    width: `${Math.max(widthPercent, 50)}%`
                  }}
                  className="absolute border-2 border-cyan-400 bg-cyan-500/20 rounded-md shadow-lg shadow-cyan-500/30 flex items-center px-2 justify-between backdrop-blur-[2px]"
                >
                  <span className="text-[10px] font-mono font-bold text-cyan-200 bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-400">
                    {selectedBiomarker.raw_name}: {selectedBiomarker.raw_value} {selectedBiomarker.raw_unit}
                  </span>
                  <Target className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                </motion.div>
              )}

              {/* Document Footer */}
              <div className="border-t border-white/10 pt-3 text-[9px] font-mono text-white/30 flex justify-between">
                <span>Verified by Document AI Pipeline</span>
                <span>Page 1 of 1</span>
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};
