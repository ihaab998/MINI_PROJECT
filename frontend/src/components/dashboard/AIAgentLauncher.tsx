"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, MessageSquare, X } from 'lucide-react';
import { AIAgentChat } from './AIAgentChat';

interface AIAgentLauncherProps {
  patientName?: string;
  patientId?: string;
  documents?: any[];
  medications?: any[];
  timeline?: any[];
}

export const AIAgentLauncher: React.FC<AIAgentLauncherProps> = ({
  patientName = "Patient",
  patientId = "default",
  documents = [],
  medications = [],
  timeline = []
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Floating Action Launcher Button (Fixed Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 font-sans">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative group bg-gradient-to-r from-[#6b7cce] via-[#5868bd] to-[#8090d8] text-white p-4 rounded-full shadow-2xl flex items-center space-x-2 border-2 border-white cursor-pointer"
        >
          {/* Glowing pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-[#6b7cce] opacity-40 blur-md group-hover:opacity-75 transition-opacity animate-pulse pointer-events-none" />

          <div className="relative z-10 flex items-center space-x-2">
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <>
                <Bot className="w-6 h-6" />
                <span className="text-xs font-bold font-sans tracking-wide pr-1 hidden sm:inline">AI Agent</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </>
            )}
          </div>
        </motion.button>
      </div>

      {/* Floating Chat Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[94vw] sm:w-[480px] z-50 shadow-2xl rounded-[30px] overflow-hidden border border-white"
          >
            <AIAgentChat
              patientName={patientName}
              patientId={patientId}
              documents={documents}
              medications={medications}
              timeline={timeline}
              isFloating={true}
              onCloseFloating={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
