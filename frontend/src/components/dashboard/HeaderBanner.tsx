"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Upload, Shield, ChevronLeft, LogOut, Stethoscope, User, Users, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface PatientOption {
  id: string;
  name: string;
  age: string;
  badges: string[];
}

export const SAMPLE_PATIENTS: PatientOption[] = [
  {
    id: "a2d6ce81-f878-42d0-9704-fcbccb0a303d",
    name: "Aarav Mehta",
    age: "65 years · Male · DOB 14 Mar 1961",
    badges: ["Chronic Kidney Disease (Stage G3a)", "Essential Hypertension"]
  },
  {
    id: "b4e8ce92-a123-4567-8901-abcdef123456",
    name: "Eleanor Vance",
    age: "58 years · Female · DOB 22 Aug 1967 font-mono",
    badges: ["Type 2 Diabetes Mellitus", "Dyslipidemia"]
  }
];

interface HeaderBannerProps {
  patientName?: string;
  patientAge?: string;
  patientBadges?: string[];
  onOpenUpload: () => void;
  selectedPatientId: string;
  onSelectPatient: (patient: PatientOption) => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  patientName = "Aarav Mehta",
  patientAge = "65 years · Male · DOB 14 Mar 1961",
  patientBadges = ["Chronic Kidney Disease (Stage G3a)", "Essential Hypertension"],
  onOpenUpload,
  selectedPatientId,
  onSelectPatient
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Compute initials dynamically
  const getInitials = (name: string) => {
    if (!name) return "P";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(patientName);

  return (
    <div className="w-full space-y-5">
      
      {/* Global Top Bar (Breadcrumb + Clinician Profile Badge + Upload Pill) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-sans font-semibold text-[#5a6a9d] uppercase tracking-wider">
            <Link href="/dashboard" className="hover:text-[#3d4ca6] transition-colors">MyHealth</Link>
            <span>/</span>
            <span className="text-[#3d4ca6]">Dashboard</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight mt-0.5">
            Patient Longitudinal Record
          </h1>
        </div>

        <div className="flex items-center space-x-3 flex-wrap sm:flex-nowrap">
          
          {/* Patient Switcher for Clinicians */}
          {user?.role === 'clinician' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 border border-[#d2defa] rounded-full px-4 py-2 text-xs text-slate-800 shadow-sm transition-all cursor-pointer font-sans"
              >
                <Users className="w-3.5 h-3.5 text-[#6b7cce]" />
                <span className="font-semibold max-w-[120px] truncate">{patientName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-slate-200 font-sans">
                  <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">Select Patient</div>
                  {SAMPLE_PATIENTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPatient(p);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between transition-colors ${
                        selectedPatientId === p.id ? 'text-[#a2b5fb] font-semibold bg-slate-800/50' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.age.split("·")[0]}</div>
                      </div>
                      {selectedPatientId === p.id && <span className="w-1.5 h-1.5 rounded-full bg-[#a2b5fb] shrink-0" />}
                    </button>
                  ))}
                  {user && (
                    <button
                      onClick={() => {
                        onSelectPatient({
                          id: user.id,
                          name: user.full_name,
                          age: "Active Logged In Patient",
                          badges: ["Patient Self-Service Record"]
                        });
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 text-[#a2b5fb] border-t border-slate-800 flex items-center space-x-2 mt-1"
                    >
                      <User className="w-3.5 h-3.5 text-[#a2b5fb]" />
                      <span>Switch to {user.full_name}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active Logged In User Badge */}
          {user && (
            <div className="flex items-center space-x-2.5 bg-white border border-[#d2defa] rounded-full px-3.5 py-1.5 shadow-sm font-sans">
              <div className="w-7 h-7 rounded-full bg-[#6b7cce] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                {user.avatar || getInitials(user.full_name)}
              </div>
              <div className="text-left hidden md:block">
                <div className="flex items-center space-x-1">
                  <p className="text-xs font-bold text-slate-900 leading-none">{user.full_name}</p>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 capitalize truncate max-w-[140px]">{user.role}</p>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Primary Periwinkle Upload Button */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center space-x-2 bg-[#6b7cce] hover:bg-[#5868bd] active:bg-[#4c5ab6] text-white px-5 py-2.5 rounded-full text-xs font-semibold font-sans transition-all shadow-md shadow-[#6b7cce]/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>+ Upload</span>
          </button>
        </div>
      </div>

      {/* Patient Context Banner Card (Pastel Periwinkle Hero Container with Soft Organic Shapes) */}
      <div className="bg-gradient-to-r from-[#dbe5ff] via-[#c8d7fa] to-[#b8cbfa] rounded-[32px] p-6 sm:p-8 shadow-md relative overflow-hidden border border-white">
        
        {/* Organic Soft Wavy Decor in Background */}
        <div className="absolute right-0 top-0 w-96 h-full bg-white/20 rounded-l-full blur-xl pointer-events-none" />
        <div className="absolute right-20 -bottom-10 w-72 h-72 bg-[#98aae8]/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Patient Details & Initials Badge */}
          <div className="flex items-center space-x-5">
            {/* White Rounded Square Badge with Periwinkle Initials */}
            <div className="w-20 h-20 rounded-2xl bg-white text-[#5868bd] flex items-center justify-center font-serif text-3xl font-bold shadow-md border border-white shrink-0">
              {initials}
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-slate-900">
                {patientName}
              </h2>
              <p className="text-xs text-[#5a6a9d] font-sans tracking-wide">
                {patientAge}
              </p>

              {/* Dynamic Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {patientBadges.map((badge, idx) => (
                  <div key={idx} className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[#b3c5f5]/80 border border-white/60 text-xs text-[#3d4ea6] font-sans font-medium shadow-xs">
                    <Shield className="w-3.5 h-3.5 text-[#4d5cb6]" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button: Inset Frosted Box with Primary Periwinkle Pill Button */}
          <div className="self-start md:self-auto bg-white/40 backdrop-blur-md p-3 rounded-2xl border border-white/60 shadow-xs">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center space-x-2 bg-[#6b7cce] hover:bg-[#5868bd] text-white px-5 py-2.5 rounded-xl text-xs font-semibold font-sans transition-all shadow-md shadow-[#6b7cce]/20 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>Upload record</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
