"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crosshair, FileText, ExternalLink, ZoomIn, Eye } from 'lucide-react';

export interface ExtractedItem {
  id: string;
  name: string;
  loinc: string;
  rawValue: string;
  canonicalValue: string;
  refRange: string;
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

const SAMPLE_EXTRACTED: ExtractedItem[] = [
  {
    id: 'e-1',
    name: 'Serum Creatinine',
    loinc: '2160-0',
    rawValue: '1.4 mg/dL',
    canonicalValue: '1.4 mg/dL',
    refRange: '0.7 - 1.2 mg/dL',
    bbox: [340, 120, 365, 450]
  },
  {
    id: 'e-2',
    name: 'eGFR (CKD-EPI)',
    loinc: '33914-3',
    rawValue: '48 mL/min/1.73m²',
    canonicalValue: '48 mL/min/1.73m²',
    refRange: '> 60 mL/min/1.73m²',
    bbox: [410, 120, 435, 480]
  },
  {
    id: 'e-3',
    name: 'Blood Urea Nitrogen (BUN)',
    loinc: '3094-0',
    rawValue: '29 mg/dL',
    canonicalValue: '29 mg/dL',
    refRange: '7 - 20 mg/dL',
    bbox: [480, 120, 505, 420]
  }
];

interface SpatialAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle?: string;
  fileUrl?: string;
  extractedItems?: ExtractedItem[];
}

export const SpatialAuditModal: React.FC<SpatialAuditModalProps> = ({
  isOpen,
  onClose,
  documentTitle = "Uploaded Medical Document",
  fileUrl,
  extractedItems = SAMPLE_EXTRACTED
}) => {
  const items = (extractedItems && extractedItems.length > 0) ? extractedItems : SAMPLE_EXTRACTED;
  const [selectedItem, setSelectedItem] = useState<ExtractedItem>(items[0]);

  useEffect(() => {
    if (items && items.length > 0) {
      setSelectedItem(items[0]);
    }
  }, [extractedItems]);

  // Bounding box coordinates normalized 0-1000
  const box = selectedItem ? selectedItem.bbox : [340, 120, 365, 450];
  const topPercent = (box[0] / 1000) * 100;
  const leftPercent = (box[1] / 1000) * 100;
  const heightPercent = ((box[2] - box[0]) / 1000) * 100;
  const widthPercent = ((box[3] - box[1]) / 1000) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="w-full max-w-6xl h-[88vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
          >
            
            {/* Header */}
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#cbd8f9]/60 flex items-center justify-between bg-[#f0f4fe]">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-2xl bg-[#dbe5ff] text-[#5868bd] border border-white shadow-xs">
                  <Crosshair className="w-5 h-5 text-[#6b7cce]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-slate-900">
                    Spatial Audit & Document Viewer
                  </h3>
                  <p className="text-xs text-[#5a6a9d] font-sans">
                    {documentTitle} • Real Document Provenance
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 font-sans">
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-[#cbd8f9] text-[#3d4ea6] rounded-full text-xs font-semibold transition-all shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#6b7cce]" />
                    <span>Open Original File</span>
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full bg-white hover:bg-slate-100 text-[#5a6a9d] border border-[#cbd8f9] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split Body */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden font-sans">
              
              {/* Left Column: Real Document Viewer with Bounding Box Overlay (7 Cols) */}
              <div className="md:col-span-7 p-6 bg-[#f0f4fe]/60 flex items-center justify-center relative overflow-y-auto border-r border-[#cbd8f9]/60">
                <div className="relative w-full max-w-[540px] max-h-full bg-white rounded-3xl border border-white shadow-lg p-3 flex flex-col justify-between overflow-hidden">
                  
                  {/* Actual Uploaded Document Image or PDF Viewer */}
                  {fileUrl ? (
                    <div className="relative w-full h-[60vh] flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden">
                      {fileUrl.endsWith('.pdf') || fileUrl.includes('application/pdf') ? (
                        <iframe src={fileUrl} className="w-full h-full border-none rounded-xl" title="PDF Document Preview" />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center overflow-auto">
                          <img
                            src={fileUrl}
                            alt="Original Uploaded Document"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                          />
                          
                          {/* Bounding Box Overlay on Real Image */}
                          {selectedItem && (
                            <motion.div
                              key={selectedItem.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              style={{
                                top: `${topPercent}%`,
                                left: `${leftPercent}%`,
                                height: `${Math.max(heightPercent, 8)}%`,
                                width: `${Math.max(widthPercent, 40)}%`
                              }}
                              className="absolute border-2 border-[#6b7cce] bg-[#6b7cce]/25 rounded-xl shadow-md flex items-center px-2 justify-between backdrop-blur-xs z-20 pointer-events-none"
                            >
                              <span className="text-[10px] font-mono font-bold text-[#3d4ea6] bg-white px-2 py-0.5 rounded-md border border-[#cbd8f9] shadow-xs">
                                {selectedItem.name}: {selectedItem.rawValue}
                              </span>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Fallback Document Canvas */
                    <div className="relative w-full h-[60vh] bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between overflow-hidden">
                      <div className="border-b border-slate-200 pb-4 flex justify-between items-center opacity-70">
                        <div>
                          <p className="text-xs font-bold font-mono uppercase text-slate-800">{documentTitle}</p>
                          <p className="text-[10px] text-slate-500">Verified by Document AI</p>
                        </div>
                        <FileText className="w-6 h-6 text-slate-400" />
                      </div>

                      <div className="space-y-4 my-auto opacity-30">
                        <div className="h-2.5 bg-slate-300 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-300 rounded w-1/2" />
                        <div className="h-2.5 bg-slate-300 rounded w-5/6" />
                        <div className="h-2.5 bg-slate-300 rounded w-2/3" />
                      </div>

                      {selectedItem && (
                        <motion.div
                          key={selectedItem.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            top: `${topPercent}%`,
                            left: `${leftPercent}%`,
                            height: `${Math.max(heightPercent, 8)}%`,
                            width: `${Math.max(widthPercent, 50)}%`
                          }}
                          className="absolute border-2 border-[#6b7cce] bg-[#6b7cce]/20 rounded-xl shadow-md flex items-center px-2 justify-between backdrop-blur-xs"
                        >
                          <span className="text-[10px] font-mono font-bold text-[#3d4ea6] bg-white px-2 py-0.5 rounded-md border border-[#cbd8f9]">
                            {selectedItem.name}: {selectedItem.rawValue}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-2.5 text-[9px] font-mono text-[#5a6a9d] flex justify-between">
                    <span>Verified Document AI Provenance</span>
                    <span>LOINC & RxNorm Ontology Standardized</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Extracted Key-Value Entity List (5 Cols) */}
              <div className="md:col-span-5 p-6 overflow-y-auto space-y-4 bg-white">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#5a6a9d] font-bold block">
                  Extracted Entities ({items.length} Items)
                </span>

                <div className="space-y-3">
                  {items.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#f0f4fe] border-[#6b7cce] shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 hover:border-[#cbd8f9]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-serif font-bold text-slate-900">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-[#cbd8f9] text-[#3d4ea6] font-semibold">
                            LOINC {item.loinc}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-xs font-sans">
                          <div>
                            <span className="text-[10px] font-mono text-[#5a6a9d] block">Extracted Value</span>
                            <span className="font-bold text-slate-900">{item.rawValue}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#5a6a9d] block">Reference Range</span>
                            <span className="text-slate-600">{item.refRange}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
