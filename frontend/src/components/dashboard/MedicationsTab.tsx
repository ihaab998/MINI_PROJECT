"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Pill, CheckCircle2, Calendar, ShieldCheck } from 'lucide-react';

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedDate: string;
  rxnormCode: string;
  status: 'ACTIVE' | 'DISCONTINUED';
}

export const DEFAULT_MEDICATIONS_LIST: MedicationItem[] = [
  {
    id: 'm-1',
    name: 'Telmisartan 40mg',
    dosage: '40mg',
    frequency: 'Once daily',
    prescribedDate: '02 Sep 2018',
    rxnormCode: '31676',
    status: 'ACTIVE'
  },
  {
    id: 'm-2',
    name: 'Dapagliflozin 10mg',
    dosage: '10mg',
    frequency: 'Once daily',
    prescribedDate: '20 Jan 2023',
    rxnormCode: '1991300',
    status: 'ACTIVE'
  }
];

interface MedicationsTabProps {
  items?: MedicationItem[];
  refreshKey?: number;
}

export const MedicationsTab: React.FC<MedicationsTabProps> = ({ items = DEFAULT_MEDICATIONS_LIST }) => {
  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* Section Header */}
      <div>
        <h2 className="font-serif text-2xl font-normal text-white tracking-tight drop-shadow-xs">
          Active medications & RxNorm ontology
        </h2>
        <p className="text-xs text-white/85 mt-1 leading-relaxed">
          Normalized prescription records extracted with RxNorm clinical concept mapping.
        </p>
      </div>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {items.map((med, idx) => (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 border border-white/80 shadow-lg hover:shadow-xl hover:border-[#5b6bbd]/40 transition-all duration-300 space-y-4 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-[#5b6bbd]/10 text-[#5b6bbd] border border-[#5b6bbd]/20">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    {med.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    {med.frequency} · prescribed {med.prescribedDate}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active</span>
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>RxNorm Identifier:</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-800 font-bold">{med.rxnormCode || 'N/A'}</span>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};
