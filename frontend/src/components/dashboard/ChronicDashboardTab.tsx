"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  CartesianGrid,
  Area,
  ComposedChart
} from 'recharts';
import { AlertTriangle, Sparkles, TrendingDown, TrendingUp, ShieldAlert, Droplets, LineChart as ChartIcon, CheckCircle2 } from 'lucide-react';

const EGFR_DATA = [
  { date: 'Jun 2022', value: 72, type: 'HISTORICAL' },
  { date: 'Jan 2023', value: 58, type: 'HISTORICAL' },
  { date: 'Sep 2023', value: 65, type: 'HISTORICAL' },
  { date: 'Apr 2024', value: 48, type: 'HISTORICAL' },
  { date: 'Feb 2025', value: 42, forecast: 42, ciLower: 42, ciUpper: 42, type: 'TRANSITION' },
  { date: 'Aug 2025', forecast: 36, ciLower: 31, ciUpper: 41, type: 'FORECAST' },
  { date: 'Feb 2026', forecast: 30, ciLower: 23, ciUpper: 37, type: 'FORECAST' }
];

const CREATININE_DATA = [
  { date: 'Jun 2022', value: 1.4, type: 'HISTORICAL' },
  { date: 'Oct 2022', value: 2.1, isSpike: true, type: 'HISTORICAL' },
  { date: 'Jan 2023', value: 1.5, type: 'HISTORICAL' },
  { date: 'Apr 2024', value: 1.9, type: 'HISTORICAL' },
  { date: 'Feb 2025', value: 2.1, forecast: 2.1, ciLower: 2.1, ciUpper: 2.1, type: 'TRANSITION' },
  { date: 'Aug 2025', forecast: 2.3, ciLower: 2.0, ciUpper: 2.6, type: 'FORECAST' },
  { date: 'Feb 2026', forecast: 2.5, ciLower: 2.1, ciUpper: 2.9, type: 'FORECAST' }
];

const BUN_DATA = [
  { date: 'Jun 2022', value: 19, type: 'HISTORICAL' },
  { date: 'Jan 2023', value: 24, type: 'HISTORICAL' },
  { date: 'Apr 2024', value: 29, type: 'HISTORICAL' },
  { date: 'Feb 2025', value: 34, forecast: 34, ciLower: 34, ciUpper: 34, type: 'TRANSITION' },
  { date: 'Aug 2025', forecast: 38, ciLower: 33, ciUpper: 43, type: 'FORECAST' },
  { date: 'Feb 2026', forecast: 43, ciLower: 37, ciUpper: 49, type: 'FORECAST' }
];

const DISEASE_OPTIONS = [
  "Chronic Kidney Disease",
  "Type 2 Diabetes",
  "Dyslipidemia",
  "Thyroid Disorders",
  "Chronic Liver Disease"
];

const SAMPLE_PATIENT_ID = "a2d6ce81-f878-42d0-9704-fcbccb0a303d";

interface ChronicDashboardTabProps {
  refreshKey?: number;
  patientId?: string;
}

export const ChronicDashboardTab: React.FC<ChronicDashboardTabProps> = ({
  refreshKey = 0,
  patientId = SAMPLE_PATIENT_ID
}) => {
  const isSamplePatient = patientId === SAMPLE_PATIENT_ID;
  const [selectedDisease, setSelectedDisease] = useState<string>("Chronic Kidney Disease");
  const [hasData, setHasData] = useState<boolean>(isSamplePatient);

  useEffect(() => {
    async function fetchTrajectory() {
      if (isSamplePatient) {
        setHasData(true);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/api/v1/analytics/patient/${patientId}/trajectory/egfr?target_cutoff=60.0`);
        if (res.ok) {
          const result = await res.json();
          if (result && result.historical_points && result.historical_points.length > 0) {
            setHasData(true);
          } else {
            setHasData(false);
          }
        } else {
          setHasData(false);
        }
      } catch (e) {
        console.warn("Could not fetch trajectory from backend:", e);
        setHasData(false);
      }
    }
    fetchTrajectory();
  }, [refreshKey, patientId, isSamplePatient]);

  if (!hasData) {
    return (
      <div className="w-full space-y-6 font-sans">
        <div>
          <div className="flex items-center space-x-2 text-white">
            <Sparkles className="w-5 h-5 text-white" />
            <h2 className="font-serif text-2xl font-normal text-white tracking-tight drop-shadow-xs">
              Focused chronic analytics
            </h2>
          </div>
          <p className="text-xs text-white/85 mt-1 leading-relaxed">
            Tier 2 dynamic focus engine monitoring annualized rates of decline and Bayesian trajectory forecasting.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md border border-white/80 rounded-[30px] p-10 text-center space-y-4 max-w-xl mx-auto my-6 shadow-xl font-serif">
          <div className="w-14 h-14 bg-[#5b6bbd]/10 text-[#5b6bbd] rounded-2xl flex items-center justify-center mx-auto border border-[#5b6bbd]/20">
            <ChartIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-normal text-slate-900">
              No Chronic Disease Trajectories Detected
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed font-sans">
              Tier 2 dynamic focus engine monitors patient lab reports over time. Upload lab reports to automatically trigger multi-year trajectory modeling and Bayesian forecast projections.
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 text-xs text-[#5b6bbd] bg-[#5b6bbd]/10 border border-[#5b6bbd]/20 px-4 py-2 rounded-full font-medium font-sans">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Patient biomarkers within baseline range or awaiting first report</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-white">
            <AlertTriangle className="w-5 h-5 text-amber-200" />
            <h2 className="font-serif text-2xl font-normal text-white tracking-tight drop-shadow-xs">
              Focused chronic analytics
            </h2>
          </div>
          <p className="text-xs text-white/85 mt-1 leading-relaxed">
            Tier 2 dynamic focus engine monitoring annualized rates of decline and Bayesian trajectory forecasting.
          </p>
        </div>

        {/* Disease Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {DISEASE_OPTIONS.map((disease) => (
            <button
              key={disease}
              onClick={() => setSelectedDisease(disease)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shadow-xs ${
                selectedDisease === disease
                  ? 'bg-[#5b6bbd] text-white shadow-md border border-white/40'
                  : 'bg-white/90 border border-white/70 text-slate-700 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {disease === "Chronic Kidney Disease" && <Droplets className="w-3.5 h-3.5 inline mr-1 text-sky-400" />}
              {disease}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Main Charts Left (2 cols), Clinical Briefing Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Charts) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Card 1: eGFR Trajectory */}
          <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 border border-white/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">eGFR</h3>
                <p className="text-[11px] font-mono text-slate-500">LOINC 33914-3 · mL/min/1.73m²</p>
              </div>
              <div className="px-3 py-1 bg-[#5b6bbd]/10 border border-[#5b6bbd]/20 text-[#5b6bbd] text-xs font-mono rounded-full font-semibold">
                Annualized: -10.59 mL/min/1.73m²/yr
              </div>
            </div>

            {/* Recharts eGFR Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={EGFR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 130]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs font-mono space-y-1 border border-slate-800">
                            <div className="text-[10px] text-slate-400 font-sans uppercase">{d.date}</div>
                            {d.value !== undefined && (
                              <div className="text-[#98aae8] font-semibold">Observed: {d.value} mL/min</div>
                            )}
                            {d.forecast !== undefined && (
                              <div className="text-sky-300 font-semibold">Bayesian Forecast: {d.forecast} mL/min</div>
                            )}
                            {d.ciLower !== undefined && (
                              <div className="text-slate-400 text-[10px]">95% CI: [{d.ciLower} - {d.ciUpper}]</div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Cutoff 60', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                  <Area type="monotone" dataKey="ciUpper" stroke="none" fill="#5b6bbd" fillOpacity={0.12} />
                  <Line type="monotone" dataKey="value" stroke="#5b6bbd" strokeWidth={3} dot={{ r: 5, fill: '#5b6bbd' }} />
                  <Line type="monotone" dataKey="forecast" stroke="#0284c7" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4, fill: '#0284c7' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Card 2: Serum Creatinine */}
          <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 border border-white/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">Serum Creatinine</h3>
                <p className="text-[11px] font-mono text-slate-500">LOINC 2160-0 · mg/dL</p>
              </div>
              <div className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono rounded-full font-semibold">
                Annualized: +0.19 mg/dL/yr
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={CREATININE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0.5, 3.5]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <ReferenceLine y={1.5} stroke="#ef4444" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="value" stroke="#d97706" strokeWidth={3} dot={{ r: 5, fill: '#d97706' }} />
                  <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="4 4" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column (KDIGO Staging + Objective Briefing) */}
        <div className="space-y-6">
          
          {/* KDIGO Stage Box */}
          <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 border border-white/80 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-500">
              <Droplets className="w-4 h-4 text-[#5b6bbd]" />
              <span>KDIGO STAGE</span>
            </div>
            
            <div className="flex items-baseline space-x-3">
              <span className="font-serif text-5xl font-bold text-slate-900">G3b</span>
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                Moderate-severe decline
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Patient exhibits progressive renal functional decline. KDIGO classification updated based on longitudinal eGFR trajectory (&lt; 45 mL/min).
            </p>
          </div>

          {/* Objective Clinical Briefing Card (Vibrant Periwinkle Card matching login hero card) */}
          <div className="bg-[#5b6bbd] rounded-[28px] p-6 text-white shadow-xl space-y-4 border border-white/30">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-white">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="font-bold">Objective Clinical Briefing</span>
            </div>

            <ul className="space-y-3 text-xs text-white/95 leading-relaxed font-sans">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 rounded-full bg-white mt-1 shrink-0" />
                <span>eGFR declined from 72 to 42 mL/min/1.73m² between Jun 2022 and Feb 2025 (outside reference range); annualized rate -11.32 mL/min/1.73m²/yr.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-300 mt-1 shrink-0" />
                <span>Serum Creatinine increased from 1.4 to 2.1 mg/dL between Jun 2022 and Feb 2025 (outside reference range); annualized rate +0.26 mg/dL/yr.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
