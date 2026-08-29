import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AnalysisJobResponse, AnalysisReport, ScanRecord } from '../types';
import { analyzeApk, getJobStatus, getReport, getScanHistory, deleteScanRecord } from '../services/api';

interface ScanContextType {
  activeJobId: string | null;
  activeJobStatus: AnalysisJobResponse | null;
  activeReport: AnalysisReport | null;
  isLoadingReport: boolean;
  history: ScanRecord[];
  historyTotal: number;
  historyPage: number;
  historyTotalPages: number;
  isLoadingHistory: boolean;
  startScan: (
    fileInput: File | { name: string; size: string; sha256: string }
  ) => Promise<{ jobId: string; sha256: string }>;
  fetchReportById: (id: string) => Promise<AnalysisReport>;
  loadHistory: (page?: number, filter?: string, search?: string) => Promise<void>;
  deleteRecord: (id: string) => void;
  resetActiveScan: () => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobStatus, setActiveJobStatus] = useState<AnalysisJobResponse | null>(null);
  const [activeReport, setActiveReport] = useState<AnalysisReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const startScan = async (
    fileInput: File | { name: string; size: string; sha256: string }
  ) => {
    const res = await analyzeApk(fileInput);
    setActiveJobId(res.jobId);
    setActiveJobStatus({
      jobId: res.jobId,
      status: 'queued',
      currentStep: 'Job Queued',
      logs: [],
      estimatedTimeRemaining: 15,
      sha256: res.sha256,
    });
    return res;
  };

  const fetchReportById = useCallback(async (id: string) => {
    setIsLoadingReport(true);
    try {
      const report = await getReport(id);
      setActiveReport(report);
      return report;
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  const loadHistory = useCallback(async (page = 1, filter = 'all', search = '') => {
    setIsLoadingHistory(true);
    try {
      const res = await getScanHistory({ page, filter, search });
      setHistory(res.items);
      setHistoryTotal(res.total);
      setHistoryPage(res.page);
      setHistoryTotalPages(res.totalPages);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Poll job status when activeJobId is set
  useEffect(() => {
    if (!activeJobId) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const status = await getJobStatus(activeJobId);
        if (!isSubscribed) return;

        setActiveJobStatus(status);

        if (status.status === 'complete') {
          clearInterval(interval);
          fetchReportById(activeJobId);
          loadHistory(1);
        } else if (status.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeJobId, fetchReportById, loadHistory]);

  const deleteRecord = (id: string) => {
    deleteScanRecord(id);
    loadHistory(historyPage);
  };

  const resetActiveScan = () => {
    setActiveJobId(null);
    setActiveJobStatus(null);
  };

  return (
    <ScanContext.Provider
      value={{
        activeJobId,
        activeJobStatus,
        activeReport,
        isLoadingReport,
        history,
        historyTotal,
        historyPage,
        historyTotalPages,
        isLoadingHistory,
        startScan,
        fetchReportById,
        loadHistory,
        deleteRecord,
        resetActiveScan,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export function useScan(): ScanContextType {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
