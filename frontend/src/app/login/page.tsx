"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Activity,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Stethoscope,
  ArrowRight,
  ChevronDown,
  Globe,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [role, setRole] = useState<'clinician' | 'patient'>('clinician');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('Nephrology & Chronic Disease');

  const handleQuickDemo = async (demoEmail: string, demoPass: string, demoRole: 'clinician' | 'patient') => {
    setLoading(true);
    setErrorMsg(null);
    setEmail(demoEmail);
    setPassword(demoPass);
    setRole(demoRole);

    const success = await login(demoEmail, demoPass, demoRole);
    setLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setErrorMsg('Failed to sign in with demo credentials.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please fill in your email and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const success = await login(email, password, role);
        if (success) {
          router.push('/dashboard');
        } else {
          setErrorMsg('Invalid email or password. Please try again.');
        }
      } else {
        if (!fullName) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        const success = await register(fullName, email, password, role, specialty);
        if (success) {
          router.push('/dashboard');
        } else {
          setErrorMsg('Registration failed. Email may already be registered.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#9aa7c7] flex flex-col justify-center items-center p-4 sm:p-8 font-serif select-none">
      
      {/* Top Page Header Label (Matching reference style) */}
      <h1 className="text-3xl sm:text-4xl font-normal text-white drop-shadow-md mb-6 tracking-wide text-center">
        {mode === 'register' ? 'Sign up Page' : 'Log in Page'}
      </h1>

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-4xl bg-[#98aae8] rounded-[36px] p-2 sm:p-3 shadow-2xl grid grid-cols-1 md:grid-cols-12 overflow-hidden border border-white/40"
      >
        
        {/* Left Hero Panel (Pastel Periwinkle with 3D Stethoscope) */}
        <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between relative bg-transparent text-white min-h-[380px]">
          
          {/* Top Pill Icon */}
          <div className="w-11 h-11 rounded-2xl bg-white text-[#5868bd] flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6" />
          </div>

          {/* Headline Text */}
          <div className="my-auto pt-6 space-y-4">
            <p className="text-lg sm:text-xl leading-relaxed text-white/95 font-serif font-light">
              We at <span className="font-bold text-white">MyHealth AI</span> are always fully focused on helping your health journey.
            </p>

            {/* 3D Stethoscope Image Container */}
            <div className="relative w-full max-w-[240px] mx-auto py-2">
              <img
                src="/3d_stethoscope.jpg"
                alt="3D Stethoscope Illustration"
                className="w-full h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300 rounded-2xl"
              />
            </div>
          </div>

          <p className="text-[11px] text-white/80 font-sans tracking-wide">
            LOINC & RxNorm Ontology Standardized
          </p>

        </div>

        {/* Right Form Panel (Clean Crisp White Inset Card) */}
        <div className="md:col-span-7 bg-white rounded-[30px] p-6 sm:p-10 flex flex-col justify-between shadow-inner">
          
          {/* Language Selector Top Right */}
          <div className="flex justify-end mb-2">
            <div className="inline-flex items-center space-x-1 text-xs text-slate-400 font-sans cursor-pointer hover:text-slate-600">
              <Globe className="w-3.5 h-3.5" />
              <span>English(US)</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          {/* Form Title */}
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              {mode === 'register' ? 'Create Account' : 'Welcome Back'}
            </h2>
          </div>

          {/* Role Toggle Selector Pill */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl mb-5 text-xs font-sans font-medium border border-slate-200">
            <button
              type="button"
              onClick={() => setRole('clinician')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all cursor-pointer ${
                role === 'clinician'
                  ? 'bg-[#5b6bbd] text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Clinician Portal</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all cursor-pointer ${
                role === 'patient'
                  ? 'bg-[#5b6bbd] text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient Portal</span>
            </button>
          </div>

          {/* Social Sign In Buttons (Matching reference UI) */}
          <div className="grid grid-cols-2 gap-3 mb-4 font-sans text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('dr.eleanor@myhealth.ai', 'password123', 'clinician')}
              className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 cursor-pointer shadow-xs"
            >
              {/* Google G Multi-color Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Demo Dr. Eleanor</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('dr.marcus@myhealth.ai', 'password123', 'clinician')}
              className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-[#3b5998] cursor-pointer shadow-xs font-medium"
            >
              <Shield className="w-4 h-4 text-[#3b5998]" />
              <span>Demo Dr. Marcus</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <span className="relative bg-white px-4 text-xs font-serif text-slate-400">
              -OR-
            </span>
          </div>

          {/* Error Message Alert */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-sans flex items-center space-x-2 my-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form with Minimalist Underlined Inputs (Matching reference screenshot) */}
          <form onSubmit={handleSubmit} className="space-y-4 my-2 font-serif">
            
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder={role === 'clinician' ? "Dr. Jane Doe" : "Jane Doe"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full py-1.5 border-b border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5b6bbd] bg-transparent font-sans transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-500 mb-1">Email:</label>
              <input
                type="email"
                required
                placeholder="name@myhealth.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-1.5 border-b border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5b6bbd] bg-transparent font-sans transition-colors"
              />
            </div>

            {mode === 'register' && role === 'clinician' && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Specialty:</label>
                <input
                  type="text"
                  placeholder="e.g. Nephrology, Cardiology"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full py-1.5 border-b border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5b6bbd] bg-transparent font-sans transition-colors"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-xs text-slate-500 mb-1">Password:</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-1.5 border-b border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#5b6bbd] bg-transparent font-sans pr-8 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Blue/Periwinkle Button (Matching reference UI) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#5b6bbd] hover:bg-[#4c5cb6] active:bg-[#3d4ca6] disabled:opacity-50 text-white font-sans font-semibold text-sm rounded-2xl shadow-md transition-all cursor-pointer mt-4 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{mode === 'register' ? 'Create Account' : 'Log in'}</span>
              )}
            </button>

          </form>

          {/* Bottom Link Toggle */}
          <div className="mt-4 text-center text-xs text-slate-500 font-serif">
            {mode === 'register' ? (
              <span>
                Already have an Account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); }}
                  className="text-[#5b6bbd] hover:underline font-sans font-medium cursor-pointer"
                >
                  Log in
                </button>
              </span>
            ) : (
              <span>
                Don't have an Account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(null); }}
                  className="text-[#5b6bbd] hover:underline font-sans font-medium cursor-pointer"
                >
                  Sign up
                </button>
              </span>
            )}
          </div>

        </div>

      </motion.div>

    </div>
  );
}
