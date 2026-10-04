"use client";

import React, { useState } from 'react';
import { Copy, Check, Sparkles, AlertCircle, TrendingDown, ShieldAlert } from 'lucide-react';
import { TrajectoryAnalytics } from '../types';

interface ClinicalBriefingProps {
  analytics: TrajectoryAnalytics;
  diseaseName: string;
}

export const ClinicalBriefing: React.FC<ClinicalBriefingProps> = ({
  analytics,
  diseaseName
}) => {
  const [copied, setCopied] = useState(false);

  const velocity = analytics.velocity_metrics.overall_velocity_per_year;
  const forecast = analytics.forecast_metrics;
  const changepoints = analytics.changepoint_metrics;

  const briefingBullets = [
    `Trajectory Analysis (${analytics.display_name}): Historical rate of change demonstrates an annualized velocity of ${velocity > 0 ? '+' : ''}${velocity} ${analytics.standard_unit}/year over ${analytics.velocity_metrics.total_days_elapsed || 365} elapsed days.`,
    `Bayesian Trajectory Projection: 90-day Bayesian Ridge forecast projects ${analytics.display_name} at ${forecast.forecast_points?.[2]?.projected_value || 'N/A'} ${analytics.standard_unit} (95% CI: [${forecast.forecast_points?.[2]?.confidence_interval_95.lower_bound}, ${forecast.forecast_points?.[2]?.confidence_interval_95.upper_bound}]).`,
    forecast.cutoff_projection?.is_moving_towards_cutoff
      ? `Critical Cutoff Risk: Projected to cross safety threshold (${forecast.cutoff_projection.target_cutoff} ${analytics.standard_unit}) in approximately ~${forecast.cutoff_projection.months_remaining} months on ${forecast.cutoff_projection.projected_crossing_date}.`
      : `Clinical Cutoff Status: Trajectory is stable; no immediate threshold breach projected over the next 6 months.`,
    changepoints.changepoints_detected_count > 0
      ? `Guarded Changepoint Alert (${changepoints.method_used}): Detected ${changepoints.changepoints_detected_count} statistical shift(s) in mean/variance (latest mean shift: ${changepoints.changepoints[0]?.delta_mean} ${analytics.standard_unit} on ${changepoints.changepoints[0]?.date}).`
      : `Changepoint Status (${changepoints.method_used}): No significant variance shifts detected across ${changepoints.sample_size} historical encounters.`
  ];

  const fullTextToCopy = `CLINICAL BRIEFING & TRAJECTORY SUMMARY - ${diseaseName.toUpperCase()}\n` +
    `Patient Biomarker Focus: ${analytics.display_name} (${analytics.canonical_name})\n` +
    `Date: ${new Date().toLocaleDateString()}\n\n` +
    briefingBullets.map((bullet, i) => `${i + 1}. ${bullet}`).join('\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTextToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium tracking-tight text-white/90">
              Objective Clinical Briefing
            </h3>
            <p className="text-[11px] text-white/40">
              Synthesized trajectory analysis for consultation review & EHR notes export
            </p>
          </div>
        </div>

        {/* Copy to EHR Button */}
        <button
          onClick={handleCopy}
          className="glass-button px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 flex items-center space-x-1.5 hover:text-white transition-all cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/60" />}
          <span>{copied ? "Copied to Clipboard" : "Copy Briefing"}</span>
        </button>
      </div>

      {/* Bullet Points Container */}
      <div className="space-y-3">
        {briefingBullets.map((bullet, index) => (
          <div key={index} className="flex items-start space-x-3 text-xs leading-relaxed text-white/80 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
            <p className="flex-1 font-sans">{bullet}</p>
          </div>
        ))}
      </div>

    </div>
  );
};
