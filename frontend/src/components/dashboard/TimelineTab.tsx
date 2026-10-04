"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Pill, FileText, Activity, Calendar, ExternalLink } from 'lucide-react';

export interface TimelineItem {
  id: string;
  year?: string;
  date: string;
  title: string;
  icon: 'FLASK' | 'PILL' | 'FILE' | 'PULSE';
  iconColor: string;
  summary?: string;
  subline?: string;
  badges: string[];
}

export const DEFAULT_TIMELINE_DATA: TimelineItem[] = [
  {
    id: 't-1',
    year: '2024',
    date: '12 Apr 2024',
    title: 'Metropolis Lab — Quarterly Renal Panel',
    icon: 'FLASK',
    iconColor: 'bg-sky-50 text-sky-600 border-sky-200',
    summary: 'eGFR declined to 48 mL/min. KDIGO stage G3a. Dapagliflozin added.',
    badges: ['Metropolis Lab', 'LAB REPORT']
  },
  {
    id: 't-2',
    year: '2023',
    date: '20 Jan 2023',
    title: 'Dapagliflozin 10mg',
    icon: 'PILL',
    iconColor: 'bg-violet-50 text-violet-600 border-violet-200',
    subline: 'Once daily · active',
    badges: ['RxNorm 1991300']
  },
  {
    id: 't-3',
    year: '2022',
    date: '14 Oct 2022',
    title: 'Sunrise Hospital — Discharge Summary',
    icon: 'FILE',
    iconColor: 'bg-amber-50 text-amber-600 border-amber-200',
    summary: 'Acute dengue infection managed conservatively. Transient creatinine spike to 2.1, resolved on discharge.',
    badges: ['Sunrise Hospital', 'DISCHARGE SUMMARY']
  },
  {
    id: 't-4',
    date: '11 Oct 2022',
    title: 'Dengue Fever',
    icon: 'PULSE',
    iconColor: 'bg-rose-50 text-rose-600 border-rose-200',
    subline: 'Acute · resolved',
    badges: ['Infectious']
  },
  {
    id: 't-5',
    date: '18 Jun 2022',
    title: 'Apollo Diagnostics — Renal Panel',
    icon: 'FLASK',
    iconColor: 'bg-sky-50 text-sky-600 border-sky-200',
    summary: 'Serum creatinine elevated at 1.4 mg/dL; eGFR 72 mL/min. Recommend nephrology referral.',
    badges: ['Apollo Diagnostics', 'LAB REPORT']
  },
  {
    id: 't-6',
    date: '18 Jun 2022',
    title: 'Chronic Kidney Disease (Stage G3a)',
    icon: 'PULSE',
    iconColor: 'bg-teal-50 text-teal-600 border-teal-200',
    subline: 'Chronic · active',
    badges: ['Renal']
  },
  {
    id: 't-7',
    year: '2018',
    date: '02 Sep 2018',
    title: 'Essential Hypertension',
    icon: 'PULSE',
    iconColor: 'bg-[#0d9488]/10 text-[#0d9488] border-[#0d9488]/30',
    subline: 'Chronic · active',
    badges: ['Cardiovascular']
  },
  {
    id: 't-8',
    date: '02 Sep 2018',
    title: 'Telmisartan 40mg',
    icon: 'PILL',
    iconColor: 'bg-violet-50 text-violet-600 border-violet-200',
    subline: 'Once daily · active',
    badges: ['RxNorm']
  }
];

interface TimelineTabProps {
  items?: TimelineItem[];
  refreshKey?: number;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ items = DEFAULT_TIMELINE_DATA }) => {
  const getIcon = (type: TimelineItem['icon']) => {
    switch (type) {
      case 'FLASK':
        return <FlaskConical className="w-4 h-4" />;
      case 'PILL':
        return <Pill className="w-4 h-4" />;
      case 'FILE':
        return <FileText className="w-4 h-4" />;
      case 'PULSE':
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Section Header */}
      <div>
        <h2 className="font-serif text-2xl font-normal text-slate-900 tracking-tight">
          Master chronological timeline
        </h2>
        <p className="text-xs text-[#5a6a9d] mt-1 font-sans leading-relaxed">
          Universal longitudinal feed uniting lab reports, hospital discharge summaries, acute episodes, and active prescriptions.
        </p>
      </div>

      {/* Vertical Spine Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-[#cbd8f9] space-y-6">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            className="relative"
          >
            {/* Year Marker Badge if present */}
            {item.year && (
              <div className="absolute -left-[39px] sm:-left-[47px] -top-3 px-3 py-1 rounded-full bg-white text-[#6b7cce] font-sans text-[11px] font-bold shadow-xs border border-[#cbd8f9]">
                ● {item.year}
              </div>
            )}

            {/* Timeline Spine Node Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-5 w-4 h-4 rounded-full bg-[#6b7cce] ring-4 ring-[#e2eafc] border-2 border-white shadow-xs" />

            {/* Encounter Card Container (Matching reference screenshot) */}
            <div className="bg-white rounded-3xl p-6 border border-white shadow-md hover:shadow-lg transition-all duration-300 space-y-3.5 hover:-translate-y-0.5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 rounded-2xl bg-[#dbe5ff] text-[#5868bd] border border-white shadow-xs">
                    {getIcon(item.icon)}
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-slate-900 tracking-tight">
                      {item.title}
                    </h3>
                    {item.subline && (
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        {item.subline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-[#5a6a9d] bg-[#f0f4fe] px-3.5 py-1.5 rounded-full border border-[#d2defa] self-start sm:self-auto">
                  <Calendar className="w-3.5 h-3.5 text-[#6b7cce]" />
                  <span>{item.date}</span>
                </div>
              </div>

              {item.summary && (
                <p className="text-xs text-[#4d5cb6] leading-relaxed bg-[#f0f4fe] p-3.5 rounded-2xl border border-[#d2defa] italic font-serif">
                  “{item.summary}”
                </p>
              )}

              {/* Badges Footer */}
              <div className="flex flex-wrap gap-2 pt-1">
                {item.badges.map((badge, bIdx) => (
                  <span
                    key={bIdx}
                    className="px-3.5 py-1 rounded-full bg-[#e2eafc] border border-white text-[11px] font-sans font-medium text-[#4d5cb6]"
                  >
                    {badge}
                  </span>
                ))}
              </div>

            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};
