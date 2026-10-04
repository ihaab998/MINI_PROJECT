"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HeaderBanner, PatientOption, SAMPLE_PATIENTS } from '@/components/dashboard/HeaderBanner';
import { SegmentedTabs, DashboardTab } from '@/components/dashboard/SegmentedTabs';
import { TimelineTab, TimelineItem, DEFAULT_TIMELINE_DATA } from '@/components/dashboard/TimelineTab';
import { ChronicDashboardTab } from '@/components/dashboard/ChronicDashboardTab';
import { DocumentsTab, DocumentItem } from '@/components/dashboard/DocumentsTab';
import { MedicationsTab, MedicationItem, DEFAULT_MEDICATIONS_LIST } from '@/components/dashboard/MedicationsTab';
import { SpatialAuditModal } from '@/components/dashboard/SpatialAuditModal';
import { UploadRecordModal } from '@/components/dashboard/UploadRecordModal';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { AIAgentChat } from '@/components/dashboard/AIAgentChat';
import { AIAgentLauncher } from '@/components/dashboard/AIAgentLauncher';
import { useAuth } from '@/context/AuthContext';
import { Upload, Sparkles, FileText, Bot, Database, Pill, BarChart3 } from 'lucide-react';

export default function ClinicianDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>('TIMELINE');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [auditDoc, setAuditDoc] = useState<DocumentItem | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Active Patient State
  const [selectedPatient, setSelectedPatient] = useState<PatientOption>(SAMPLE_PATIENTS[0]);

  // Timeline, Documents & Medications State
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(DEFAULT_TIMELINE_DATA);
  const [medicationsList, setMedicationsList] = useState<MedicationItem[]>(DEFAULT_MEDICATIONS_LIST);
  const [userDocumentsList, setUserDocumentsList] = useState<DocumentItem[]>([]);

  // 1. Initial Sync according to user role
  useEffect(() => {
    if (user) {
      if (user.role === 'patient') {
        setSelectedPatient({
          id: user.id,
          name: user.full_name,
          age: "Registered Patient Profile · Active Session",
          badges: ["Universal Health Record", "Active Patient Portal"]
        });
      } else {
        setSelectedPatient(SAMPLE_PATIENTS[0]);
      }
    }
  }, [user]);

  // 2. Load & Restore Persisted Data from localStorage & Backend DB whenever selectedPatient changes
  useEffect(() => {
    if (!selectedPatient?.id) return;
    const pid = selectedPatient.id;

    // A. Check localStorage persistence
    const savedTimeline = localStorage.getItem(`healthguard_timeline_${pid}`);
    const savedDocs = localStorage.getItem(`healthguard_docs_${pid}`);
    const savedMeds = localStorage.getItem(`healthguard_meds_${pid}`);

    if (savedTimeline) {
      try { setTimelineItems(JSON.parse(savedTimeline)); } catch (e) { console.error(e); }
    } else if (pid === SAMPLE_PATIENTS[0].id) {
      setTimelineItems(DEFAULT_TIMELINE_DATA);
    } else {
      setTimelineItems([]);
    }

    if (savedDocs) {
      try { setUserDocumentsList(JSON.parse(savedDocs)); } catch (e) { console.error(e); }
    } else {
      setUserDocumentsList([]);
    }

    if (savedMeds) {
      try { setMedicationsList(JSON.parse(savedMeds)); } catch (e) { console.error(e); }
    } else if (pid === SAMPLE_PATIENTS[0].id) {
      setMedicationsList(DEFAULT_MEDICATIONS_LIST);
    } else {
      setMedicationsList([]);
    }

    // B. Fetch from Backend Database API for complete database sync
    async function syncBackendDatabase() {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/documents/patient/${pid}`);
        if (res.ok) {
          const dbDocs = await res.json();
          if (dbDocs && dbDocs.length > 0) {
            const mappedDocs: DocumentItem[] = dbDocs.map((d: any) => ({
              id: d.id,
              title: `${d.facility_name || 'Medical Center'} — ${d.document_type || 'LAB_REPORT'}`,
              facility: d.facility_name || 'Medical Facility',
              date: d.encounter_date || new Date().toISOString().split('T')[0],
              type: d.document_type || 'LAB_REPORT',
              biomarkersCount: 2,
              medsCount: 1,
              fileUrl: d.file_path || d.file_url,
              fileName: d.document_name
            }));

            setUserDocumentsList(prev => {
              const combined = [...mappedDocs, ...prev];
              const seen = new Set();
              const unique = combined.filter(item => {
                if (seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
              });
              localStorage.setItem(`healthguard_docs_${pid}`, JSON.stringify(unique));
              return unique;
            });

            // Also convert DB docs to Timeline items
            const mappedTimeline: TimelineItem[] = dbDocs.map((d: any) => ({
              id: `t-db-${d.id}`,
              year: (d.encounter_date || new Date().toISOString()).substring(0, 4),
              date: d.encounter_date || new Date().toISOString().split('T')[0],
              title: `${d.facility_name || 'Medical Facility'} — ${d.document_type || 'LAB_REPORT'}`,
              icon: d.document_type === 'PRESCRIPTION' ? 'PILL' : d.document_type === 'DISCHARGE_SUMMARY' ? 'FILE' : 'FLASK',
              iconColor: d.document_type === 'PRESCRIPTION' ? 'bg-violet-50 text-violet-600 border-violet-200' : 'bg-sky-50 text-sky-600 border-sky-200',
              summary: d.clinical_summary || `Uploaded medical record from ${d.facility_name}.`,
              badges: [d.facility_name || 'Lab', d.document_type || 'LAB_REPORT']
            }));

            setTimelineItems(prev => {
              const combined = [...mappedTimeline, ...prev];
              const seen = new Set();
              const unique = combined.filter(item => {
                if (seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
              });
              localStorage.setItem(`healthguard_timeline_${pid}`, JSON.stringify(unique));
              return unique;
            });
          }
        }
      } catch (err) {
        console.warn("Backend database fetch notice:", err);
      }
    }
    syncBackendDatabase();
  }, [selectedPatient, refreshKey]);

  // Authentication Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-teal-400 font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Verifying MyHealth Session...</p>
        </div>
      </div>
    );
  }

  const handleSelectPatient = (p: PatientOption) => {
    setSelectedPatient(p);
    setRefreshKey(prev => prev + 1);
  };

  const handleUploadSuccess = (data: any) => {
    console.log("[DYNAMIC INGESTION SYNC] Medical document processed & saved:", data);
    const pid = selectedPatient.id;

    const ext = data?.extracted_data || {};
    const docType = ext.document_type || data?.document_type || 'LAB_REPORT';
    const facility = data?.facility_name || ext.facility_name || ext.lab_name || 'Uploaded Document';
    const dateStr = ext.report_date || ext.encounter_date || data?.encounter_date || new Date().toISOString().split('T')[0];
    const summary = data?.summary || ext.clinical_summary || `Parsed document for ${facility}. Synchronized LOINC/RxNorm trajectories.`;

    // 1. Prepend new Timeline entry & save to localStorage
    const iconType = docType === 'PRESCRIPTION' ? 'PILL' : docType === 'DISCHARGE_SUMMARY' ? 'FILE' : 'FLASK';
    const iconColor = docType === 'PRESCRIPTION'
      ? 'bg-violet-50 text-violet-600 border-violet-200'
      : docType === 'DISCHARGE_SUMMARY'
      ? 'bg-amber-50 text-amber-600 border-amber-200'
      : 'bg-sky-50 text-sky-600 border-sky-200';

    const newTimelineItem: TimelineItem = {
      id: `t-uploaded-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      date: dateStr,
      title: `${facility} — ${docType}`,
      icon: iconType,
      iconColor: iconColor,
      summary: summary,
      badges: [facility, docType]
    };

    setTimelineItems(prev => {
      const updated = [newTimelineItem, ...prev];
      localStorage.setItem(`healthguard_timeline_${pid}`, JSON.stringify(updated));
      return updated;
    });

    // 2. Prepend new Document entry & save to localStorage
    const newDocItem: DocumentItem = {
      id: `doc-up-${Date.now()}`,
      title: `${facility} — ${docType}`,
      facility: facility,
      date: dateStr,
      type: docType,
      biomarkersCount: data.biomarkers_count || 2,
      medsCount: data.medications_count || 1,
      fileUrl: data.file_url,
      fileName: data.file_name
    };

    setUserDocumentsList(prev => {
      const updated = [newDocItem, ...prev];
      localStorage.setItem(`healthguard_docs_${pid}`, JSON.stringify(updated));
      return updated;
    });

    // 3. Prepend extracted medications if available & save to localStorage
    if (ext.medications && Array.isArray(ext.medications) && ext.medications.length > 0) {
      const newMeds: MedicationItem[] = ext.medications.map((m: any, i: number) => ({
        id: `m-upload-${Date.now()}-${i}`,
        name: m.name || m.medication_name || 'Prescribed Medication',
        dosage: m.dosage || 'Standard dose',
        frequency: m.frequency || 'As directed',
        prescribedDate: dateStr,
        rxnormCode: m.rxnorm_code || 'RxNorm',
        status: 'ACTIVE'
      }));
      setMedicationsList(prev => {
        const updated = [...newMeds, ...prev];
        localStorage.setItem(`healthguard_meds_${pid}`, JSON.stringify(updated));
        return updated;
      });
    }

    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#dbe4f8]/60 text-slate-900 font-serif flex flex-col md:flex-row relative selection:bg-[#6b7cce]/20 selection:text-[#3d4ca6]">
      
      {/* 1. Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2. Main Content View Area */}
      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Top Header Banner */}
        <HeaderBanner
          patientName={selectedPatient.name}
          patientAge={selectedPatient.age}
          patientBadges={selectedPatient.badges}
          onOpenUpload={() => setIsUploadOpen(true)}
          selectedPatientId={selectedPatient.id}
          onSelectPatient={handleSelectPatient}
        />

        {/* 4 Metrics Strip Cards (Matching Reference Screenshot) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
          
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-white flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#dbe5ff] text-[#5868bd] flex items-center justify-center font-bold shrink-0">
              <Database className="w-5 h-5 text-[#6b7cce]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#5a6a9d] uppercase tracking-wider">RECORD STATUS</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-bold text-slate-900">Synchronized</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-white flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#dbe5ff] text-[#5868bd] flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5 text-[#6b7cce]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#5a6a9d] uppercase tracking-wider">DOCUMENTS</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {userDocumentsList.length || (selectedPatient.id === SAMPLE_PATIENTS[0].id ? 3 : 1)} Records
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-white flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#dbe5ff] text-[#5868bd] flex items-center justify-center font-bold shrink-0">
              <Pill className="w-5 h-5 text-[#6b7cce]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#5a6a9d] uppercase tracking-wider">PRESCRIPTIONS</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {medicationsList.length || 1} Active Rx
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-white flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#dbe5ff] text-[#5868bd] flex items-center justify-center font-bold shrink-0">
              <BarChart3 className="w-5 h-5 text-[#6b7cce]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#5a6a9d] uppercase tracking-wider">AI STANDARD</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">LOINC & RxNorm</p>
            </div>
          </div>

        </div>

        {/* Segmented Navigation Tabs */}
        <SegmentedTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* 4. Tab Views Content */}
        <div className="pt-2">
          <AnimatePresence mode="wait">
            {activeTab === 'TIMELINE' && (
              <motion.div
                key="tab-timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {timelineItems.length > 0 ? (
                  <TimelineTab items={timelineItems} refreshKey={refreshKey} />
                ) : (
                  <div className="bg-white/95 backdrop-blur-md border border-white/80 rounded-[30px] p-10 text-center space-y-4 max-w-xl mx-auto my-6 shadow-xl">
                    <div className="w-14 h-14 bg-[#5b6bbd]/10 text-[#5b6bbd] rounded-2xl flex items-center justify-center mx-auto border border-[#5b6bbd]/20">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-normal text-slate-900">
                        Welcome, {selectedPatient.name}!
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed font-sans">
                        You have no medical records stored yet in your Universal Longitudinal Record. Upload your lab report, prescription, or discharge summary to automatically extract biomarkers and generate your trajectory.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="inline-flex items-center space-x-2 bg-[#5b6bbd] hover:bg-[#4c5cb6] active:bg-[#3d4ca6] text-white px-5 py-2.5 rounded-2xl text-xs font-medium font-sans transition-all shadow-md hover:scale-[1.02] cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Your First Record</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'CHRONIC' && (
              <motion.div
                key="tab-chronic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ChronicDashboardTab refreshKey={refreshKey} patientId={selectedPatient.id} />
              </motion.div>
            )}

            {activeTab === 'DOCUMENTS' && (
              <motion.div
                key="tab-documents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DocumentsTab
                  refreshKey={refreshKey}
                  patientId={selectedPatient.id}
                  userDocuments={userDocumentsList}
                  onOpenAudit={(doc) => setAuditDoc(doc)}
                />
              </motion.div>
            )}

            {activeTab === 'MEDICATIONS' && (
              <motion.div
                key="tab-medications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MedicationsTab items={medicationsList} refreshKey={refreshKey} />
              </motion.div>
            )}

            {activeTab === 'AGENT' && (
              <motion.div
                key="tab-agent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 backdrop-blur-md rounded-[30px] border border-white/80 shadow-2xl overflow-hidden"
              >
                <AIAgentChat
                  patientName={selectedPatient.name}
                  patientId={selectedPatient.id}
                  documents={userDocumentsList}
                  medications={medicationsList}
                  timeline={timelineItems}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* 5. Modals */}
      <SpatialAuditModal
        isOpen={!!auditDoc}
        onClose={() => setAuditDoc(null)}
        documentTitle={auditDoc?.title}
        fileUrl={auditDoc?.fileUrl}
      />

      <UploadRecordModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        patientId={selectedPatient.id}
        activePatientName={selectedPatient.name}
      />

      {/* 6. Floating AI Health Agent Widget Launcher */}
      <AIAgentLauncher
        patientName={selectedPatient.name}
        patientId={selectedPatient.id}
        documents={userDocumentsList}
        medications={medicationsList}
        timeline={timelineItems}
      />

    </div>
  );
}
