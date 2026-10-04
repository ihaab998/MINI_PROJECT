"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  Activity,
  FileText,
  Pill,
  FlaskConical,
  ArrowRight,
  Sparkles,
  Layers,
  LineChart,
  ShieldCheck,
  CheckCircle2,
  Search,
  Upload,
  Clock,
  TrendingDown,
  Database,
  ChevronRight,
  Play
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-800 font-sans selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* A. Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-neutral-900 leading-none">
                Vita
              </span>
              <span className="text-[9px] font-mono font-medium tracking-widest text-teal-700 uppercase leading-tight">
                Health Record
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-600">
            <a href="#architecture" className="hover:text-teal-700 transition-colors">
              Architecture
            </a>
            <a href="#chronic-engine" className="hover:text-teal-700 transition-colors">
              Chronic Engine
            </a>
            <a href="#how-it-works" className="hover:text-teal-700 transition-colors">
              How it works
            </a>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4 text-teal-400" />
            </Link>
          </div>

        </div>
      </header>

      {/* B. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-200/40 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-4xl mx-auto text-center space-y-6">
            
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium tracking-wide shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Two-tier: Universal Record + Chronic Trajectory Engine</span>
            </motion.div>

            {/* H1 Serif Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-neutral-950 tracking-tight leading-[1.08]"
            >
              A patient’s entire medical story,{" "}
              <span className="bg-teal-100/70 text-teal-950 px-2 py-0.5 rounded-lg inline-block italic font-serif">
                in one glance.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-neutral-600 font-sans max-w-3xl mx-auto leading-relaxed"
            >
              Vita ingests any medical document — lab reports, prescriptions, discharge summaries — extracts structured clinical data, and builds a unified chronological timeline with dynamic chronic-disease trajectory forecasting.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white px-7 py-3.5 rounded-full text-base font-medium transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Open the Dashboard</span>
                <ArrowRight className="w-5 h-5 text-teal-400" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 px-7 py-3.5 rounded-full text-base font-medium transition-all shadow-xs hover:border-neutral-400"
              >
                <Play className="w-4 h-4 text-teal-700 fill-teal-700" />
                <span>See how it works</span>
              </a>
            </motion.div>

          </div>

          {/* Interactive Mockup Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-14 max-w-5xl mx-auto relative"
          >
            {/* Main Obsidian Preview Container */}
            <div className="bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-2xl relative overflow-hidden text-white">
              
              {/* Animated ECG Wave Line */}
              <div className="w-full h-12 mb-6 border-b border-neutral-800 relative flex items-center overflow-hidden">
                <svg className="w-full h-full text-teal-400/80" viewBox="0 0 1200 60" preserveAspectRatio="none">
                  <motion.path
                    d="M 0,30 Q 150,30 200,30 T 250,30 L 260,10 L 270,50 L 280,5 L 290,40 L 300,30 T 500,30 L 510,15 L 520,45 L 530,30 T 800,30 L 810,5 L 820,55 L 830,30 T 1200,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    initial={{ pathLength: 0, opacity: 0.4 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </svg>
              </div>

              {/* Card Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-800 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                    <h3 className="text-lg font-medium text-white tracking-tight">
                      Longitudinal Timeline · Aarav Mehta
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    51 y/o Male • Patient ID: P-94021 • Monitored 2018 — 2025
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono tracking-wide uppercase self-start sm:self-auto">
                  Tier 2 Active: CKD + T2DM
                </div>
              </div>

              {/* Biomarker Summary Columns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-neutral-800">
                <div className="bg-neutral-800/50 p-3.5 rounded-xl border border-neutral-700/50">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">eGFR Rate</span>
                  <p className="text-xl font-light text-rose-400 mt-1">48 mL/min</p>
                  <span className="text-[10px] text-neutral-400">Declining (-15.9/yr)</span>
                </div>
                <div className="bg-neutral-800/50 p-3.5 rounded-xl border border-neutral-700/50">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Serum Creatinine</span>
                  <p className="text-xl font-light text-amber-400 mt-1">1.9 mg/dL</p>
                  <span className="text-[10px] text-neutral-400">Above Ref (0.7-1.2)</span>
                </div>
                <div className="bg-neutral-800/50 p-3.5 rounded-xl border border-neutral-700/50">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Glycated HbA1c</span>
                  <p className="text-xl font-light text-teal-300 mt-1">7.0%</p>
                  <span className="text-[10px] text-emerald-400">↓ From 8.4%</span>
                </div>
                <div className="bg-neutral-800/50 p-3.5 rounded-xl border border-neutral-700/50">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Staging Focus</span>
                  <p className="text-xl font-light text-cyan-300 mt-1">KDIGO G3a</p>
                  <span className="text-[10px] text-neutral-400">Moderate Impairment</span>
                </div>
              </div>

              {/* Mockup Timeline Feed Items */}
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between bg-neutral-800/30 p-3 rounded-xl border border-neutral-800 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span>Apollo Diagnostics Comprehensive Metabolic Panel</span>
                  </div>
                  <span className="font-mono text-neutral-400">Apr 2024</span>
                </div>

                <div className="flex items-center justify-between bg-neutral-800/30 p-3 rounded-xl border border-neutral-800 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Pill className="w-4 h-4" />
                    </div>
                    <span>Cardiology Prescription · Amlodipine 5mg + Atorvastatin 20mg</span>
                  </div>
                  <span className="font-mono text-neutral-400">Jan 2024</span>
                </div>
              </div>

            </div>

            {/* Floating Ambient Motion Cards with Shadows */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 hidden lg:flex items-center space-x-3 bg-white text-neutral-900 p-3.5 rounded-2xl border border-neutral-200 shadow-xl z-20"
            >
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold">HbA1c 7.0%</p>
                <p className="text-[10px] text-emerald-600 font-medium">↓ Down from 8.4%</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-6 hidden lg:flex items-center space-x-3 bg-white text-neutral-900 p-3.5 rounded-2xl border border-neutral-200 shadow-xl z-20"
            >
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold">Metformin 1000mg</p>
                <p className="text-[10px] text-neutral-500">Active Rx · Twice daily</p>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* C. The Problem Section */}
      <section className="py-20 bg-white border-y border-neutral-200/80 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-mono tracking-widest uppercase text-teal-800 font-semibold"
          >
            THE PROBLEM
          </motion.span>

          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-2xl sm:text-4xl md:text-5xl font-normal text-neutral-900 leading-tight"
          >
            “Medical records are decentralised, heterogeneous, and fragmented across paper reports, clinic prescriptions, and disparate diagnostic formats. Clinicians lack a unified view — increasing consultation overhead and delaying intervention.”
          </motion.blockquote>

        </div>
      </section>

      {/* D. Two-Tier Architecture Section (#architecture) */}
      <section id="architecture" className="py-24 bg-[#fafafa] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono tracking-widest uppercase text-teal-800 font-semibold">
              TWO-TIER ARCHITECTURE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-neutral-950 tracking-tight">
              Universal ingestion meets specialized chronic analytics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            
            {/* Tier 1 Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-neutral-900">
                  Tier 1 · The Core: Universal Health Record
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  A centralised repository that ingests any document, extracts structured clinical data with bounding-box provenance, and constructs a unified chronological timeline.
                </p>
              </div>

              <div className="space-y-3 pt-6 border-t border-neutral-100 text-xs text-neutral-700">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Multimodal ingestion:</strong> PDFs, camera uploads, lab exports.</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Hybrid OCR + Vision:</strong> PaddleOCR with Vision-LLM fallback.</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Ontology normalization:</strong> LOINC biomarkers · RxNorm meds.</span>
                </div>
              </div>
            </motion.div>

            {/* Tier 2 Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                  <LineChart className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-neutral-900">
                  Tier 2 · The Focus: Chronic Trajectory Engine
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  Continuously monitors the record. When a chronic diagnosis or persistent abnormal thresholds appear, it activates deep time-series analytics — automatically.
                </p>
              </div>

              <div className="space-y-3 pt-6 border-t border-neutral-100 text-xs text-neutral-700">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Annualised velocity:</strong> ΔV / Δt across irregular intervals.</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Bayesian forecasting:</strong> 3–6 month trajectories w/ 95% CI.</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span><strong className="text-neutral-900">Guarded changepoints:</strong> PELT (N ≥ 8) · Z-score fallback.</span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Center Divider Pill */}
          <div className="text-center">
            <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-mono tracking-wider shadow-md">
              <span>↓ CHRONIC DETECTION ENGINE ROUTES EACH PATIENT</span>
            </span>
          </div>

        </div>
      </section>

      {/* E. Chronic Focus Scope Section (#chronic-engine) */}
      <section id="chronic-engine" className="py-24 bg-white border-t border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono tracking-widest uppercase text-teal-800 font-semibold">
              CHRONIC FOCUS SCOPE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-neutral-950 tracking-tight">
              Five disease trajectories, monitored continuously
            </h2>
            <p className="text-neutral-600 text-base">
              When triggered, the Tier 2 engine isolates each disease's biomarker panel for deep time-series analytics — velocity, forecasting, and anomaly detection.
            </p>
          </div>

          {/* 6-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Type 2 Diabetes */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-[#fafafa] border border-neutral-200 space-y-4 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                T2D
              </div>
              <div>
                <h3 className="font-serif text-xl text-neutral-900 font-medium">Type 2 Diabetes</h3>
                <p className="text-xs text-neutral-500 mt-1">Glycemic variability · beta-cell decline</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">HbA1c</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">FBS</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">PPBS</span>
              </div>
            </motion.div>

            {/* Card 2: Chronic Kidney Disease */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-[#fafafa] border border-neutral-200 space-y-4 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                CKD
              </div>
              <div>
                <h3 className="font-serif text-xl text-neutral-900 font-medium">Chronic Kidney Disease</h3>
                <p className="text-xs text-neutral-500 mt-1">eGFR slope · KDIGO G1–G5 staging</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">Creatinine</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">eGFR</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">BUN</span>
              </div>
            </motion.div>

            {/* Card 3: Dyslipidemia */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-[#fafafa] border border-neutral-200 space-y-4 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                LIP
              </div>
              <div>
                <h3 className="font-serif text-xl text-neutral-900 font-medium">Dyslipidemia / Cardiovascular</h3>
                <p className="text-xs text-neutral-500 mt-1">Atherogenic ratios · statin response</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">LDL</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">HDL</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">Triglycerides</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">Systolic BP</span>
              </div>
            </motion.div>

            {/* Card 4: Thyroid Disorders */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-[#fafafa] border border-neutral-200 space-y-4 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                THY
              </div>
              <div>
                <h3 className="font-serif text-xl text-neutral-900 font-medium">Thyroid Disorders</h3>
                <p className="text-xs text-neutral-500 mt-1">Feedback-loop tracking · levothyroxine titration</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">TSH</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">Free T4</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">Free T3</span>
              </div>
            </motion.div>

            {/* Card 5: Chronic Liver Disease */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-[#fafafa] border border-neutral-200 space-y-4 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
                LIV
              </div>
              <div>
                <h3 className="font-serif text-xl text-neutral-900 font-medium">Chronic Liver Disease</h3>
                <p className="text-xs text-neutral-500 mt-1">Enzyme spikes · synthetic function decay</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">ALT</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">AST</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">Bilirubin</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-mono text-neutral-700">Albumin</span>
              </div>
            </motion.div>

            {/* Card 6: Acute Events & Universal Context */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/30">
                  +
                </div>
                <h3 className="font-serif text-xl font-medium text-white">And any acute event, too</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Dengue, infections, surgeries — every encounter feeds the universal record, providing full context for chronic biomarker trends.
                </p>
              </div>
              <div className="text-[11px] font-mono text-teal-400">
                Universal Health Timeline →
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* F. Four Steps to a 5-Minute Consultation (#how-it-works) */}
      <section id="how-it-works" className="py-24 bg-[#fafafa] border-t border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono tracking-widest uppercase text-teal-800 font-semibold">
              FROM PAPER TO PROGNOSIS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-neutral-950 tracking-tight">
              Four steps to a 5-minute consultation
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-xs relative">
              <span className="text-3xl font-serif text-teal-600 font-light">01</span>
              <h3 className="font-serif text-xl font-medium text-neutral-900">Upload any document</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Drop a PDF, snap a photo, or import a digital lab export — prescriptions, checkups, discharge notes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-xs relative">
              <span className="text-3xl font-serif text-teal-600 font-light">02</span>
              <h3 className="font-serif text-xl font-medium text-neutral-900">Extract & normalize</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Hybrid OCR + Vision extraction maps values to standard LOINC/RxNorm codes with spatial bounding box provenance.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-xs relative">
              <span className="text-3xl font-serif text-teal-600 font-light">03</span>
              <h3 className="font-serif text-xl font-medium text-neutral-900">Build the timeline</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Every encounter joins one chronological feed. Past acute illnesses, surgeries, and active meds in one view.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-xs relative">
              <span className="text-3xl font-serif text-teal-600 font-light">04</span>
              <h3 className="font-serif text-xl font-medium text-neutral-900">Forecast trajectories</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Projects biomarker paths with 95% confidence bounds, annualized rates of decline, and changepoint alerts.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* G. Call to Action Banner & Footer */}
      <section className="py-20 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Dark CTA Banner Box */}
          <div className="bg-neutral-900 rounded-3xl p-8 sm:p-14 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight max-w-3xl mx-auto leading-tight">
              Give every consultation the full picture.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
              Open the clinician dashboard and explore a synthetic multi-year patient record — timeline, chronic trajectories, and forecasting — right now.
            </p>
            
            <div className="pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 bg-white hover:bg-neutral-100 text-neutral-950 px-8 py-4 rounded-full text-base font-medium transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <span>Launch the Dashboard</span>
                <ArrowRight className="w-5 h-5 text-teal-700" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span className="font-serif text-sm font-bold text-neutral-900">Vita</span>
            <span className="font-mono text-[10px] text-neutral-400">UNIVERSAL HEALTH RECORD</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#architecture" className="hover:text-neutral-900 transition-colors">Architecture</a>
            <a href="#chronic-engine" className="hover:text-neutral-900 transition-colors">Chronic Engine</a>
            <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">How it works</a>
            <Link href="/dashboard" className="text-teal-700 hover:text-teal-800 font-medium">Dashboard →</Link>
          </div>

          <p className="font-sans">
            © 2026 Vita — Universal Longitudinal Health Record & Dynamic Chronic Disease Analytics. Built for clinicians.
          </p>

        </div>
      </footer>

    </div>
  );
}
