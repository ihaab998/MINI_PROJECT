"use client";

import React, { useState } from 'react';
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
  CartesianGrid
} from 'recharts';
import { TrendingDown, TrendingUp, AlertTriangle, ShieldCheck, Activity, Target } from 'lucide-react';
import { TrajectoryAnalytics } from '../types';

interface ChronicDashboardProps {
  analyticsData: TrajectoryAnalytics;
  selectedDisease: string;
  onSelectDisease: (disease: string) => void;
  selectedBiomarker: string;
  onSelectBiomarker: (biomarker: string) => void;
}

const DISEASE_PANELS = [
  { id: "CKD", name: "Chronic Kidney Disease (CKD)", biomarkers: ["egfr", "serum_creatinine", "blood_urea_nitrogen"] },
  { id: "DIABETES", name: "Type 2 Diabetes", biomarkers: ["hba1c", "fasting_blood_sugar", "postprandial_glucose"] },
  { id: "DYSLIPIDEMIA", name: "Dyslipidemia / Cardiovascular", biomarkers: ["total_cholesterol", "ldl_cholesterol", "hdl_cholesterol", "triglycerides", "systolic_bp"] },
  { id: "THYROID", name: "Thyroid Disorders", biomarkers: ["tsh", "free_t3", "free_t4"] },
  { id: "LIVER", name: "Chronic Liver Disease", biomarkers: ["alt_sgpt", "ast_sgot", "total_bilirubin", "alkaline_phosphatase"] }
];

export const ChronicDashboard: React.FC<ChronicDashboardProps> = ({
  analyticsData,
  selectedDisease,
  onSelectDisease,
  selectedBiomarker,
  onSelectBiomarker
}) => {
  // Combine historical records and Bayesian forecast points into a continuous chart dataset
  const historicalPoints = analyticsData.historical_records.map((rec) => ({
    date: rec.test_date,
    value: rec.canonical_value,
    type: 'HISTORICAL',
    isAbnormal: rec.is_abnormal
  }));

  const forecastPoints = (analyticsData.forecast_metrics.forecast_points || []).map((fp) => ({
    date: fp.projected_date,
    forecastValue: fp.projected_value,
    ciLower: fp.confidence_interval_95.lower_bound,
    ciUpper: fp.confidence_interval_95.upper_bound,
    type: 'FORECAST'
  }));

  // Append last historical point to forecast to make line continuous
  const lastHistorical = historicalPoints[historicalPoints.length - 1];
  const chartData = [
    ...historicalPoints,
    ...(lastHistorical ? [{ date: lastHistorical.date, forecastValue: lastHistorical.value, type: 'TRANSITION' }] : []),
    ...forecastPoints
  ];

  const currentDiseasePanel = DISEASE_PANELS.find((d) => d.id === selectedDisease) || DISEASE_PANELS[0];
  const cutoffInfo = analyticsData.forecast_metrics.cutoff_projection;
  const velocity = analyticsData.velocity_metrics.overall_velocity_per_year;

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-6">
      
      {/* Disease Panel Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base font-medium tracking-tight text-white/90">
              Tier 2 Focused Trajectory Engine
            </h2>
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            Bayesian Ridge trajectory modeling, annualized velocity metrics, and shaded normal reference bands.
          </p>
        </div>

        {/* Tabs for 5 Disease Categories */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {DISEASE_PANELS.map((panel) => (
            <button
              key={panel.id}
              onClick={() => {
                onSelectDisease(panel.id);
                onSelectBiomarker(panel.biomarkers[0]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-all cursor-pointer ${
                selectedDisease === panel.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
              }`}
            >
              {panel.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Monitored Biomarkers Pill Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-mono uppercase text-white/40 tracking-wider">Monitored Biomarkers:</span>
        {currentDiseasePanel.biomarkers.map((bio) => (
          <button
            key={bio}
            onClick={() => onSelectBiomarker(bio)}
            className={`px-3 py-1 rounded-full text-xs font-mono tracking-wide transition-all cursor-pointer ${
              selectedBiomarker === bio
                ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
            }`}
          >
            {bio.replace(/_/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Stat 1: Display Name & Latest Value */}
        <div className="glass-panel p-4 rounded-xl border border-white/[0.06]">
          <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">Latest Observation</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-light text-white tracking-tight">
              {lastHistorical?.value ?? 'N/A'}
            </span>
            <span className="text-xs text-white/50">{analyticsData.standard_unit}</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            {analyticsData.display_name} • {lastHistorical?.date}
          </p>
        </div>

        {/* Stat 2: Annualized Velocity */}
        <div className="glass-panel p-4 rounded-xl border border-white/[0.06]">
          <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">Annualized Velocity (ΔV/Δt)</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-2xl font-light tracking-tight ${velocity < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {velocity > 0 ? `+${velocity}` : velocity}
            </span>
            <span className="text-xs text-white/50">{analyticsData.standard_unit}/year</span>
          </div>
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-white/40">
            {velocity < 0 ? <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> : <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Rate of change calculated from baseline</span>
          </div>
        </div>

        {/* Stat 3: Cutoff Crossing Projection */}
        <div className="glass-panel p-4 rounded-xl border border-white/[0.06]">
          <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">Cutoff Crossing Projection</span>
          <div className="flex items-center space-x-2 mt-1">
            {cutoffInfo?.is_moving_towards_cutoff ? (
              <span className="text-sm font-medium text-rose-300 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-rose-400 inline mr-1" />
                <span>~{cutoffInfo.months_remaining} months to cutoff</span>
              </span>
            ) : (
              <span className="text-sm font-medium text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline mr-1" />
                <span>Stable Trajectory</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/40 mt-1 truncate">
            {cutoffInfo?.clinical_warning || "No immediate breach forecasted."}
          </p>
        </div>

      </div>

      {/* Recharts Longitudinal Curve Canvas */}
      <div className="h-[320px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} />
            
            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-panel p-3 rounded-xl border border-white/20 text-xs shadow-xl backdrop-blur-2xl">
                      <p className="font-mono text-white/50 text-[10px] uppercase mb-1">{label}</p>
                      {data.value !== undefined && (
                        <p className="text-white font-medium">
                          Historical Value: <span className="text-cyan-400 font-bold">{data.value} {analyticsData.standard_unit}</span>
                        </p>
                      )}
                      {data.forecastValue !== undefined && (
                        <p className="text-cyan-300 font-medium">
                          Bayesian Forecast: <span className="text-cyan-300 font-bold">{data.forecastValue} {analyticsData.standard_unit}</span>
                        </p>
                      )}
                      {data.ciLower !== undefined && (
                        <p className="text-white/40 text-[10px] mt-1 font-mono">
                          95% CI: [{data.ciLower} - {data.ciUpper}]
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Shaded Normal Reference Area */}
            <ReferenceArea y1={60} y2={120} fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="3 3" />
            
            {/* Target Cutoff Reference Line */}
            {cutoffInfo?.target_cutoff && (
              <ReferenceLine y={cutoffInfo.target_cutoff} stroke="rgba(244, 63, 94, 0.6)" strokeDasharray="4 4" label={{ value: `Cutoff: ${cutoffInfo.target_cutoff}`, fill: '#f43f5e', fontSize: 10 }} />
            )}

            {/* Historical Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#22d3ee"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#0a0a0c', stroke: '#22d3ee', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#22d3ee' }}
              name="Historical"
            />

            {/* Projected Bayesian Forecast Line */}
            <Line
              type="monotone"
              dataKey="forecastValue"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#38bdf8' }}
              name="Bayesian Forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
