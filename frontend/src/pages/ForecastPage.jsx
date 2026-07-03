import React, { useState, useEffect, useCallback } from 'react';
import { predictionService } from '../services/prediction.service';
import DistrictSelector from '../components/common/DistrictSelector';
import ForecastDayCard from '../components/common/ForecastDayCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ForecastTrendChart from '../components/common/ForecastTrendChart';
import { SunSnow, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatDate, getRiskColor } from '../utils/constants';

function RiskTrendChart({ data }) {
  if (!data.length) return null;
  const chartData = [...data]
    .sort((a, b) => a.forecast_date?.localeCompare(b.forecast_date))
    .map(d => ({
      date: formatDate(d.forecast_date),
      risk: Math.round((d.risk_score || 0) * 100),
    }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ea580c" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ea580c" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#d8c2b8" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9c8880' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9c8880' }} unit="%" />
        <Tooltip formatter={(v) => [`${v}%`, 'Risk Score']} />
        <Area
          type="monotone" dataKey="risk"
          stroke="#ea580c" strokeWidth={2}
          fill="url(#riskGrad)"
          dot={{ r: 3, fill: '#ea580c' }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function ForecastPage() {
  const [districtId, setDistrictId] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [todayData, setTodayData]   = useState(null);
  const [history, setHistory]       = useState([]);
  const [selected, setSelected]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's forecast and recent history in parallel
      const [todayRes, historyRes] = await Promise.allSettled([
        predictionService.getPrediction(districtId, today),
        predictionService.getHistory({ days: 14, districtId }),
      ]);

      let todayEntry = null;
      if (todayRes.status === 'fulfilled') {
        const d = todayRes.value?.data;
        todayEntry = {
          forecast_date: today,
          risk_level:    d?.alert?.risk_level,
          risk_score:    d?.prediction?.risk_score,
          weather:       d?.weather,
          prediction:    d?.prediction,
        };
        setTodayData(todayEntry);
        setSelected(todayEntry);
      }

      if (historyRes.status === 'fulfilled') {
        setHistory(historyRes.value?.data || []);
      }
    } catch (err) {
      setError('Failed to load forecast data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [districtId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Merge today + history, deduplicate by date
  const allDays = React.useMemo(() => {
    const map = new Map();
    history.forEach(h => map.set(h.forecast_date, {
      forecast_date: h.forecast_date,
      risk_level:    h.risk_level,
      risk_score:    h.risk_score,
    }));
    if (todayData) map.set(todayData.forecast_date, todayData);
    return [...map.values()].sort((a, b) => b.forecast_date?.localeCompare(a.forecast_date)).slice(0, 7);
  }, [todayData, history]);

  const today = new Date().toISOString().split('T')[0];
  const selData = selected || todayData;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface flex items-center gap-3">
            <SunSnow className="text-primary" size={30} />
            7-Day Heatwave Forecast
          </h1>
          <p className="text-outline mt-1">Recent predictions and risk trends for your district</p>
        </div>
        <div className="flex items-center gap-3">
          <DistrictSelector selectedDistrict={districtId} onChange={setDistrictId} />
          <button
            onClick={fetchData}
            className="p-2 rounded-full bg-surface border border-outline-variant hover:bg-surface-variant transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={`text-primary ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container text-on-error-container rounded-card">
          <AlertTriangle size={20} />
          <div>
            <p className="font-semibold">{error}</p>
            <button onClick={fetchData} className="text-sm underline mt-1">Retry</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner />
            <p className="text-outline text-sm">Running ML forecast model…</p>
          </div>
        </div>
      ) : (
        <>
          {/* Day cards */}
          {allDays.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {allDays.map((day) => (
                <ForecastDayCard
                  key={day.forecast_date}
                  forecast={day}
                  isToday={day.forecast_date === today}
                  isSelected={selected?.forecast_date === day.forecast_date}
                  onClick={() => setSelected(day)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-card p-10 border border-outline-variant text-center">
              <Info size={40} className="text-outline mx-auto mb-3" />
              <p className="font-bold text-on-surface">No Forecast Data Yet</p>
              <p className="text-outline text-sm mt-1">
                Visit the Dashboard first to generate a prediction for this district.
              </p>
            </div>
          )}

          {/* Selected day detail + trend */}
          {selData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Detail card */}
              <div className="lg:col-span-1 bg-surface rounded-card p-6 border border-outline-variant shadow-card">
                <h2 className="text-lg font-bold text-on-surface mb-4">
                  {selData.forecast_date === today ? "Today's" : formatDate(selData.forecast_date)} Details
                </h2>
                {selData.weather ? (
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Max Temperature', value: `${selData.weather.tempmax?.toFixed(1)}°C` },
                      { label: 'Min Temperature', value: `${selData.weather.tempmin?.toFixed(1)}°C` },
                      { label: 'Humidity',         value: `${selData.weather.humidity}%` },
                      { label: 'Wind Speed',        value: `${selData.weather.windspeed} km/h` },
                      { label: 'Heat Index',        value: `${selData.weather.apparent_heat_index?.toFixed(1)}°C` },
                      { label: 'Precipitation',     value: `${selData.weather.precip} mm` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-outline">{label}</span>
                        <span className="font-semibold text-on-surface">{value}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-outline-variant">
                      <div className="flex justify-between">
                        <span className="text-outline">Severity</span>
                        <span className="font-bold text-on-surface">{selData.prediction?.severity_tier}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-outline text-sm">Click today's card to see detailed weather data.</p>
                )}
              </div>

              {/* Trend chart */}
              <div className="lg:col-span-2 bg-surface rounded-card p-6 border border-outline-variant shadow-card">
                <h2 className="text-lg font-bold text-on-surface mb-4">Risk Score Trend</h2>
                {history.length > 1 ? (
                  <RiskTrendChart data={allDays} />
                ) : (
                  <div className="flex items-center justify-center h-40 text-outline text-sm">
                    Trend will appear after multiple forecasts are generated.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
