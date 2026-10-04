"use client";

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Clock,
  FileText,
  Pill,
  FileCheck,
  Bot,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { DashboardTab } from './SegmentedTabs';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'TIMELINE' as DashboardTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'TIMELINE' as DashboardTab, label: 'Timeline', icon: Clock },
    { id: 'DOCUMENTS' as DashboardTab, label: 'Records', icon: FileText },
    { id: 'MEDICATIONS' as DashboardTab, label: 'Medications', icon: Pill },
    { id: 'CHRONIC' as DashboardTab, label: 'Analytics', icon: FileCheck },
    { id: 'AGENT' as DashboardTab, label: 'AI Agent', icon: Bot },
  ];

  return (
    <aside className="w-64 bg-[#d8e3f9]/70 backdrop-blur-xl border-r border-white/60 min-h-screen p-6 flex flex-col justify-between hidden md:flex shrink-0 select-none font-sans">
      
      <div className="space-y-8">
        {/* Top Branding Logo */}
        <div className="px-3 pt-2">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#4d5cb6] group-hover:text-[#3d4ca6] transition-colors">
              MyHealth
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 font-sans">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && (item.label === 'Dashboard' ? activeTab === 'TIMELINE' : true);

            return (
              <button
                key={idx}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6b7cce] text-white shadow-md shadow-[#6b7cce]/25'
                    : 'text-[#5a6a9d] hover:text-[#3d4ca6] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5a6a9d]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Info Box with WhatsApp Connect */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-[#4d5cb6] text-xs font-bold font-serif">
          <ShieldCheck className="w-4 h-4 text-[#6b7cce]" />
          <span>MyHealth Platform</span>
        </div>
        <p className="text-[10px] text-slate-500 font-sans leading-tight">
          Standardized with LOINC & RxNorm clinical ontology.
        </p>

        {/* WhatsApp Connection Badge */}
        <div className="pt-2 border-t border-slate-100 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>WhatsApp Integration</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Twilio Ready
            </span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
            PIN: <span className="font-bold text-slate-900 tracking-wider text-xs">123456</span>
          </p>
        </div>
      </div>

    </aside>
  );
};
