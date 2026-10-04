"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, CheckCircle2, Crosshair, Calendar, FileCheck, FolderOpen, ExternalLink } from 'lucide-react';

export interface DocumentItem {
  id: string;
  title: string;
  facility: string;
  date: string;
  type: string;
  biomarkersCount: number;
  medsCount: number;
  fileUrl?: string;
  fileName?: string;
  extractedItems?: any[];
}

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Metropolis Lab — Quarterly Renal Panel',
    facility: 'Metropolis Lab',
    date: '12 Apr 2024',
    type: 'LAB_REPORT',
    biomarkersCount: 3,
    medsCount: 1
  },
  {
    id: 'doc-2',
    title: 'Sunrise Hospital — Discharge Summary',
    facility: 'Sunrise Hospital',
    date: '14 Oct 2022',
    type: 'DISCHARGE_SUMMARY',
    biomarkersCount: 4,
    medsCount: 2
  },
  {
    id: 'doc-3',
    title: 'Apollo Diagnostics — Renal Panel',
    facility: 'Apollo Diagnostics',
    date: '18 Jun 2022',
    type: 'LAB_REPORT',
    biomarkersCount: 3,
    medsCount: 0
  }
];

const SAMPLE_PATIENT_ID = "a2d6ce81-f878-42d0-9704-fcbccb0a303d";

interface DocumentsTabProps {
  onOpenAudit: (doc: DocumentItem) => void;
  refreshKey?: number;
  patientId?: string;
  userDocuments?: DocumentItem[];
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  onOpenAudit,
  refreshKey = 0,
  patientId = SAMPLE_PATIENT_ID,
  userDocuments = []
}) => {
  const isSamplePatient = patientId === SAMPLE_PATIENT_ID;
  const [documents, setDocuments] = useState<DocumentItem[]>(
    userDocuments.length > 0 ? userDocuments : (isSamplePatient ? DEFAULT_DOCUMENTS : [])
  );

  useEffect(() => {
    if (userDocuments.length > 0) {
      setDocuments(userDocuments);
      return;
    }

    async function fetchDocuments() {
      if (isSamplePatient) {
        setDocuments(DEFAULT_DOCUMENTS);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/api/v1/documents/patient/${patientId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mapped: DocumentItem[] = data.map((d: any) => ({
              id: d.id,
              title: `${d.facility_name || 'Medical Center'} — ${d.document_type || 'Lab Record'}`,
              facility: d.facility_name || 'Medical Facility',
              date: d.encounter_date || new Date().toISOString().split('T')[0],
              type: d.document_type || 'LAB_REPORT',
              biomarkersCount: 2,
              medsCount: 1,
              fileUrl: d.file_path || d.file_url
            }));
            setDocuments(mapped);
          } else {
            setDocuments([]);
          }
        } else {
          setDocuments([]);
        }
      } catch (err) {
        console.warn("Could not fetch documents from API:", err);
        setDocuments([]);
      }
    }
    fetchDocuments();
  }, [refreshKey, patientId, isSamplePatient, userDocuments]);

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* Section Header */}
      <div>
        <h2 className="font-serif text-2xl font-normal text-white tracking-tight drop-shadow-xs">
          Document provenance & spatial audit
        </h2>
        <p className="text-xs text-white/85 mt-1 leading-relaxed">
          Side-by-side audit trail: click any extracted biomarker to highlight its source bounding box over the original document.
        </p>
      </div>

      {documents.length > 0 ? (
        /* Documents Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 border border-white/80 shadow-lg hover:shadow-xl hover:border-[#5b6bbd]/40 transition-all duration-300 flex flex-col justify-between space-y-6 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#5b6bbd]/10 text-[#5b6bbd] border border-[#5b6bbd]/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#5b6bbd]/10 border border-[#5b6bbd]/20 text-[11px] font-mono font-medium text-[#5b6bbd]">
                    {doc.type}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-[#5b6bbd]" />
                    <span>{doc.date}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono text-slate-600 pt-3 border-t border-slate-100">
                  <span className="font-semibold text-slate-800">{doc.biomarkersCount} Biomarkers</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-800">{doc.medsCount} Prescriptions</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all border border-slate-200"
                  >
                    <Eye className="w-4 h-4 text-[#5b6bbd]" />
                    <span>View Original File</span>
                  </a>
                )}
                
                <button
                  onClick={() => onOpenAudit(doc)}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-[#5b6bbd] hover:bg-[#4c5cb6] active:bg-[#3d4ca6] text-white px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Crosshair className="w-4 h-4 text-white" />
                  <span>Audit spatial bounding boxes</span>
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State for New Patient Profile */
        <div className="bg-white/95 backdrop-blur-md border border-white/80 rounded-[30px] p-10 text-center space-y-4 max-w-xl mx-auto my-6 shadow-xl font-serif">
          <div className="w-14 h-14 bg-[#5b6bbd]/10 text-[#5b6bbd] rounded-2xl flex items-center justify-center mx-auto border border-[#5b6bbd]/20">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-normal text-slate-900">
              No Medical Documents Uploaded
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed font-sans">
              There are no uploaded lab reports, prescriptions, or discharge summaries for this patient profile. Upload a document using the "+ Upload" button above.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
