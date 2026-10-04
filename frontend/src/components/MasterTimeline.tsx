"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Pill, Stethoscope, Scissors, AlertCircle, Eye, Calendar, ChevronRight } from 'lucide-react';
import { TimelineEvent } from '../types';

interface MasterTimelineProps {
  events: TimelineEvent[];
  onSelectEventForAudit: (event: TimelineEvent) => void;
}

export const MasterTimeline: React.FC<MasterTimelineProps> = ({
  events,
  onSelectEventForAudit
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredEvents = events.filter((evt) => {
    if (filter === 'ALL') return true;
    if (filter === 'LABS') return evt.category === 'LAB_REPORT';
    if (filter === 'MEDS') return evt.category === 'PRESCRIPTION';
    if (filter === 'ACUTE') return evt.category === 'ACUTE_EPISODE';
    if (filter === 'SURGERY') return evt.category === 'SURGERY';
    return true;
  });

  const getCategoryIcon = (category: TimelineEvent['category']) => {
    switch (category) {
      case 'LAB_REPORT':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'PRESCRIPTION':
        return <Pill className="w-4 h-4 text-emerald-400" />;
      case 'ACUTE_EPISODE':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'SURGERY':
        return <Scissors className="w-4 h-4 text-rose-400" />;
      default:
        return <Stethoscope className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/[0.08]">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-white/[0.06] gap-4">
        <div>
          <h2 className="text-base font-medium tracking-tight text-white/90">
            Master Longitudinal Health Feed
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Chronological universal record tracking acute episodes, lab panels, surgeries, and active prescriptions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'LABS', 'MEDS', 'ACUTE', 'SURGERY'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer ${
                filter === tab
                  ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Timeline Feed */}
      <div className="relative pt-6 pl-4 sm:pl-6 border-l border-white/[0.08] space-y-6 mt-2">
        <AnimatePresence>
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="relative group"
            >
              {/* Timeline Node Dot */}
              <div className="absolute -left-[25px] sm:-left-[33px] top-1.5 w-4 h-4 rounded-full bg-[#0a0a0c] border border-white/20 flex items-center justify-center group-hover:border-cyan-400 group-hover:scale-110 transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>

              {/* Event Card Container */}
              <div className="glass-panel-interactive rounded-xl p-4 sm:p-5 border border-white/[0.06] hover:border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  
                  {/* Title & Metadata */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] mt-0.5">
                      {getCategoryIcon(event.category)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-white/90 tracking-tight">
                          {event.title}
                        </h3>
                        {event.statusTag && (
                          <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${
                            event.statusType === 'critical'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : event.statusType === 'warning'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {event.statusTag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        {event.facility || 'General Health Encounter'} • {event.details}
                      </p>
                    </div>
                  </div>

                  {/* Date Badge & Audit Trigger */}
                  <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-0 border-white/[0.04]">
                    <div className="flex items-center text-xs font-mono text-white/50 space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-white/30" />
                      <span>{event.date}</span>
                    </div>

                    <button
                      onClick={() => onSelectEventForAudit(event)}
                      className="glass-button px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 flex items-center space-x-1.5 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Audit PDF Bounding Boxes</span>
                      <ChevronRight className="w-3 h-3 text-cyan-400/60" />
                    </button>
                  </div>

                </div>

                {/* Parsed Biomarkers Pills Preview if present */}
                {event.biomarkers && event.biomarkers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04] flex flex-wrap gap-2">
                    {event.biomarkers.map((b) => (
                      <div
                        key={b.id}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono border flex items-center space-x-1.5 ${
                          b.is_abnormal
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            : 'bg-white/[0.04] text-white/70 border-white/[0.08]'
                        }`}
                      >
                        <span className="font-sans font-medium text-white/80">{b.display_name}:</span>
                        <span>{b.canonical_value} {b.canonical_unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};
