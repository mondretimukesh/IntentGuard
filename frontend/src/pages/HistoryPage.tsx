import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { TopBar } from '../components/layout';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useScan } from '../context/ScanContext';
import type { RiskLevel } from '../types';

type FilterLevel = 'all' | RiskLevel;

const filterOptions: { label: string; value: FilterLevel }[] = [
  { label: 'All Scans', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'High Risk', value: 'high' },
  { label: 'Review Required', value: 'review' },
  { label: 'Low Risk', value: 'low' },
];

function formatRelativeDate(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hrs ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
  }
}

function truncateHash(hash: string): string {
  if (!hash || hash.length < 10) return hash || '';
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
}

export function HistoryPage() {
  const navigate = useNavigate();
  const {
    history,
    historyTotal,
    historyPage,
    historyTotalPages,
    isLoadingHistory,
    loadHistory,
    fetchReportById,
    deleteRecord,
  } = useScan();

  const [filter, setFilter] = useState<FilterLevel>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadHistory(1, filter, search);
  }, [loadHistory, filter, search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= historyTotalPages) {
      loadHistory(newPage, filter, search);
    }
  };

  const handleSelectRecord = async (id: string) => {
    await fetchReportById(id);
    navigate('/dashboard');
  };

  return (
    <AppLayout>
      <TopBar
        title="Scan History Log"
        subtitle="Paginated CTI scan records from GET /api/history"
        actions={
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <MaterialIcon name="add" className="text-base" />
            New APK Scan
          </button>
        }
      />

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Search & Classification Filter Panel */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 glass-panel p-4 border-white/10">
          <div className="relative w-full lg:w-96">
            <MaterialIcon
              name="search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
            />
            <input
              className="w-full bg-[#07090E] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Search package, app title, or SHA-256..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-colors ${
                  filter === opt.value
                    ? 'bg-amber-500 text-[#07090E] border-amber-500 font-bold'
                    : 'border-white/10 bg-transparent text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Column Headers */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 font-mono text-xs text-slate-500 border-b border-white/10 uppercase tracking-wider font-bold">
          <div className="col-span-4">Application / Package Name</div>
          <div className="col-span-2 text-right">Risk Score</div>
          <div className="col-span-2">Scan Date</div>
          <div className="col-span-3">SHA-256 Hash</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Table Data Rows */}
        {isLoadingHistory ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <MaterialIcon name="sync" className="animate-spin text-amber-500 text-base" />
            Loading scan history...
          </div>
        ) : history.length === 0 ? (
          <div className="glass-panel p-12 text-center space-y-3 border-white/10">
            <MaterialIcon name="find_in_page" className="text-4xl text-slate-600" />
            <h4 className="font-heading text-lg font-bold text-white">No Scan Records Match Filter</h4>
            <p className="font-body text-xs text-slate-400">
              Try resetting your search query or changing the risk level filter.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {history.map((record) => (
              <div
                key={record.id}
                className="glass-panel p-4 border-white/10 hover:border-amber-500/40 transition-all duration-200 cursor-pointer"
                onClick={() => handleSelectRecord(record.id)}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* App Info */}
                  <div className="col-span-4 flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <MaterialIcon name="android" className="text-amber-500 text-xl" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading text-sm font-bold text-white truncate">
                        {record.appName}
                      </h3>
                      <p className="font-mono text-xs text-slate-400 truncate">{record.packageName}</p>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="col-span-2 flex md:justify-end">
                    <SeverityBadge level={record.riskLevel} score={record.riskScore} />
                  </div>

                  {/* Scan Date */}
                  <div className="col-span-2 font-mono text-xs text-slate-400">
                    {formatRelativeDate(record.scanDate)}
                  </div>

                  {/* SHA-256 Hash */}
                  <div className="col-span-3 font-mono text-xs text-cyan-400 truncate">
                    {truncateHash(record.sha256)}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded"
                      title="Delete Record"
                    >
                      <MaterialIcon name="delete" className="text-sm" />
                    </button>
                    <MaterialIcon name="chevron_right" className="text-slate-500 hover:text-amber-400 transition-colors text-base" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center border-t border-white/10 pt-4 font-mono text-xs text-slate-400">
          <p>
            Total Records: <span className="text-white font-bold">{historyTotal}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(historyPage - 1)}
              disabled={historyPage <= 1}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-white font-bold px-2">
              Page {historyPage} of {historyTotalPages}
            </span>
            <button
              onClick={() => handlePageChange(historyPage + 1)}
              disabled={historyPage >= historyTotalPages}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
