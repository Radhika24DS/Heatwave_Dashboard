import React, { useState, useEffect, useMemo } from 'react';
import { predictionService } from '../services/prediction.service';
import DistrictSelector from '../components/common/DistrictSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { History, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, BarChart, Bar, Cell
} from 'recharts';

const RISK_COLORS = {
  LOW:      { badge: 'bg-heatwave-normal text-white',   dot: '#16a34a' },
  MODERATE: { badge: 'bg-heatwave-watch text-white',    dot: '#ca8a04' },
  HIGH:     { badge: 'bg-heatwave-warning text-white',  dot: '#ea580c' },
  EXTREME:  { badge: 'bg-error text-on-error',          dot: '#dc2626' },
};

function getRiskStyle(level) {
  const key = (level || 'LOW').toUpperCase();
  return RISK_COLORS[key] || RISK_COLORS.LOW;
}

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronUp size={12} className="opacity-20" />;
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="text-primary" />
    : <ChevronDown size={12} className="text-primary" />;
}

const PAGE_SIZE = 15;

export default function HistoryPage() {
  const [districtId, setDistrictId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table state
  const [sortCol, setSortCol] = useState('forecast_date');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { days: 60 };
        if (districtId) params.districtId = districtId;
        const res = await predictionService.getHistory(params);
        setRecords(res.data || []);
        setPage(1);
      } catch (e) {
        setError('Failed to load historical data.');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [districtId]);

  // Build chart data (aggregate by date: max risk_score)
  const chartData = useMemo(() => {
    const byDate = {};
    records.forEach(r => {
      const d = r.forecast_date;
      if (!byDate[d] || r.risk_score > byDate[d].score) {
        byDate[d] = { date: d.slice(5), score: parseFloat((r.risk_score * 100).toFixed(1)) };
      }
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  }, [records]);

  // Filtered + sorted + paginated
  const filtered = useMemo(() => {
    let data = [...records];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.district_name?.toLowerCase().includes(q) ||
        r.risk_level?.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      let valA = a[sortCol], valB = b[sortCol];
      if (sortCol === 'risk_score' || sortCol === 'confidence') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [records, search, sortCol, sortDir]);

  // Compute risk level distribution from filtered records
  const distributionData = useMemo(() => {
    const counts = { LOW: 0, MODERATE: 0, HIGH: 0, EXTREME: 0 };
    filtered.forEach(r => {
      const lvl = (r.risk_level || 'LOW').toUpperCase();
      if (counts[lvl] !== undefined) {
        counts[lvl]++;
      }
    });
    return [
      { name: 'Low', count: counts.LOW, fill: '#16a34a' },
      { name: 'Moderate', count: counts.MODERATE, fill: '#ca8a04' },
      { name: 'High', count: counts.HIGH, fill: '#ea580c' },
      { name: 'Extreme', count: counts.EXTREME, fill: '#dc2626' }
    ];
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
    setPage(1);
  };

  const COL = [
    { key: 'forecast_date',  label: 'Date' },
    { key: 'district_name',  label: 'District' },
    { key: 'risk_level',     label: 'Risk Level' },
    { key: 'risk_score',     label: 'Score' },
    { key: 'confidence',     label: 'Confidence' },
    { key: 'model_version',  label: 'Model' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-tertiary-container rounded-xl">
            <History size={24} className="text-on-tertiary-container" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-on-surface">Historical Trends</h1>
            <p className="text-sm text-outline">Past 60 days of prediction records</p>
          </div>
        </div>
        <DistrictSelector
          selectedDistrict={districtId || 1}
          onChange={id => { setDistrictId(id === 1 && !districtId ? '' : id); }}
        />
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container rounded-xl p-4 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Trend Chart */}
      {/* Charts Grid */}
      {!loading && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Score Trend Chart */}
          <div className="bg-surface rounded-2xl border border-surface-variant p-6 shadow-card">
            <h2 className="text-lg font-bold text-on-surface mb-1">Risk Score Trend</h2>
            <p className="text-xs text-outline mb-4">Maximum daily risk score across selected district (last 30 days)</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#9d4300" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#9d4300" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9c8880' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9c8880' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #d8c2b8', borderRadius: 8 }}
                    formatter={v => [`${v}%`, 'Risk Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Risk Score"
                    stroke="#9d4300"
                    fill="url(#scoreGrad)"
                    strokeWidth={2.5}
                    dot={{ r: 2, fill: '#9d4300' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Level Distribution Chart */}
          <div className="bg-surface rounded-2xl border border-surface-variant p-6 shadow-card">
            <h2 className="text-lg font-bold text-on-surface mb-1">Risk Level Distribution</h2>
            <p className="text-xs text-outline mb-4">Frequency of predicted risk levels in the current timeframe</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9c8880' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9c8880' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #d8c2b8', borderRadius: 8 }}
                    formatter={v => [v, 'Predictions']}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-card overflow-hidden">
        <div className="p-4 border-b border-surface-variant flex items-center justify-between gap-4 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Search district or risk level..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-4 py-2 text-sm bg-surface border border-surface-variant rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <span className="text-sm text-outline">{filtered.length} records</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><LoadingSpinner /></div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-outline">
            <History size={40} className="mb-3 opacity-40" />
            <p className="font-semibold">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-surface-variant">
                <tr>
                  {COL.map(c => (
                    <th
                      key={c.key}
                      onClick={() => handleSort(c.key)}
                      className="px-4 py-3 text-left text-xs font-bold text-outline uppercase tracking-wider cursor-pointer hover:text-on-surface transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        {c.label}
                        <SortIcon col={c.key} sortCol={sortCol} sortDir={sortDir} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {paginated.map((r, i) => {
                  const style = getRiskStyle(r.risk_level);
                  return (
                    <tr key={r.id || i} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 text-on-surface font-medium whitespace-nowrap">
                        {format(parseISO(r.forecast_date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-on-surface">{r.district_name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                          {r.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${r.risk_score * 100}%`, backgroundColor: style.dot }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-on-surface">
                            {(r.risk_score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-outline text-xs">
                        {r.confidence != null ? `${(r.confidence * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-surface-variant text-outline px-2 py-0.5 rounded-full">
                          v{r.model_version || '1.0'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-variant">
            <span className="text-xs text-outline">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg bg-surface border border-surface-variant disabled:opacity-40 hover:bg-primary-container transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg bg-surface border border-surface-variant disabled:opacity-40 hover:bg-primary-container transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
