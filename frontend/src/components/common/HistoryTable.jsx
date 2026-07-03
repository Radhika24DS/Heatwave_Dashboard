import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getRiskBadgeClass, formatDate } from '../../utils/constants';

const PAGE_SIZE = 15;

const COLUMNS = [
  { key: 'forecast_date',  label: 'Date',       render: (v) => formatDate(v) },
  { key: 'district_name',  label: 'District',   render: (v) => v },
  { key: 'risk_level',     label: 'Risk Level', render: (v) => (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRiskBadgeClass(v)}`}>{v}</span>
  )},
  { key: 'risk_score',     label: 'Risk Score', render: (v) => (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-surface-variant rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${(v * 100).toFixed(0)}%` }} />
      </div>
      <span className="text-xs text-outline">{(v * 100).toFixed(0)}%</span>
    </div>
  )},
  { key: 'confidence',     label: 'Confidence', render: (v) => `${(v * 100).toFixed(0)}%` },
  { key: 'model_version',  label: 'Model',      render: (v) => v },
];

export default function HistoryTable({ data = [] }) {
  const [sortKey, setSortKey] = useState('forecast_date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData   = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-32 text-outline text-sm">
        No historical records found for this period.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Table */}
      <div className="overflow-x-auto rounded-card border border-outline-variant">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-container-low">
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-semibold text-on-surface cursor-pointer select-none hover:bg-surface-variant transition-colors group"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                      {sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        : <ChevronUp size={14} />
                      }
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr
                key={row.id ?? i}
                className={`border-t border-outline-variant transition-colors ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'} hover:bg-surface-variant`}
              >
                {COLUMNS.map(col => (
                  <td key={col.key} className="px-4 py-3 text-on-surface">
                    {col.render(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-outline">
          <span>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-surface-variant disabled:opacity-30 transition-colors"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-surface-variant disabled:opacity-30 transition-colors"
            >
              <ChevronUp size={16} className="rotate-[-90deg]" />
            </button>
            <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded font-semibold">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded hover:bg-surface-variant disabled:opacity-30 transition-colors"
            >
              <ChevronDown size={16} className="rotate-[-90deg]" />
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded hover:bg-surface-variant disabled:opacity-30 transition-colors"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
