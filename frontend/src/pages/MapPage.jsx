import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { predictionService } from '../services/prediction.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Map, RefreshCw, X } from 'lucide-react';
import { KARNATAKA_DISTRICTS, getRiskColor, getRiskBadgeClass, formatDateTime } from '../utils/constants';

/* Leaflet icon fix */
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RISK_LEGEND = [
  { label: 'Low',      color: '#16a34a' },
  { label: 'Moderate', color: '#ca8a04' },
  { label: 'High',     color: '#ea580c' },
  { label: 'Extreme',  color: '#dc2626' },
];

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

function DistrictPopupContent({ district, prediction, loading }) {
  if (loading) {
    return (
      <div className="p-3 min-w-[160px] flex flex-col items-center gap-2">
        <LoadingSpinner />
        <p className="text-xs text-outline">Fetching forecast…</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="p-3 min-w-[180px]">
        <p className="font-bold text-sm">{district.name}</p>
        <p className="text-xs text-outline mt-1">No forecast data available.<br />Run a prediction from the Dashboard.</p>
      </div>
    );
  }

  const { risk_level, risk_score, weather, alert } = prediction;
  const level = alert?.risk_level || risk_level || 'LOW';

  return (
    <div className="p-3 min-w-[200px] font-sans">
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-sm text-on-surface">{district.name}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRiskBadgeClass(level)}`}>
          {level}
        </span>
      </div>
      {weather && (
        <div className="space-y-1 text-xs text-outline">
          <div className="flex justify-between">
            <span>Max Temp</span>
            <span className="font-semibold text-on-surface">{weather.tempmax?.toFixed(1)}°C</span>
          </div>
          <div className="flex justify-between">
            <span>Heat Index</span>
            <span className="font-semibold text-on-surface">{weather.apparent_heat_index?.toFixed(1)}°C</span>
          </div>
          <div className="flex justify-between">
            <span>Humidity</span>
            <span className="font-semibold text-on-surface">{weather.humidity}%</span>
          </div>
        </div>
      )}
      {prediction.prediction && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-outline">
          Risk Score: <span className="font-semibold text-on-surface">{(prediction.prediction.risk_score * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  const [riskMap, setRiskMap]         = useState({});       // districtId → prediction
  const [loadingMap, setLoadingMap]   = useState({});       // districtId → boolean
  const [initialLoading, setInitialLoading] = useState(true);

  // Load latest historical prediction for each district on mount
  const loadDistrictHistory = useCallback(async () => {
    setInitialLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const results = await Promise.allSettled(
      KARNATAKA_DISTRICTS.map(d =>
        predictionService.getHistory({ days: 7, districtId: d.id }).then(r => ({
          id: d.id,
          data: r?.data?.[0] || null,   // most recent record
        }))
      )
    );

    const map = {};
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value?.data) {
        map[r.value.id] = { risk_level: r.value.data.risk_level };
      }
    });
    setRiskMap(map);
    setInitialLoading(false);
  }, []);

  useEffect(() => { loadDistrictHistory(); }, [loadDistrictHistory]);

  const handleMarkerClick = async (district) => {
    if (riskMap[district.id]?.weather) return; // already has detail

    setLoadingMap(prev => ({ ...prev, [district.id]: true }));
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await predictionService.getPrediction(district.id, today);
      const d   = res?.data;
      setRiskMap(prev => ({ ...prev, [district.id]: d }));
    } catch {
      // keep existing minimal data
    } finally {
      setLoadingMap(prev => ({ ...prev, [district.id]: false }));
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Page header bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-outline-variant flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-on-surface flex items-center gap-3">
            <Map className="text-primary" size={24} />
            District Risk Map — Karnataka
          </h1>
          <p className="text-sm text-outline mt-0.5">Click any district to fetch the latest forecast</p>
        </div>
        <button
          onClick={loadDistrictHistory}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-outline-variant hover:bg-surface-variant text-sm font-semibold transition-colors"
        >
          <RefreshCw size={14} className={initialLoading ? 'animate-spin text-primary' : ''} />
          Refresh
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[15.0, 75.7]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapController center={[15.0, 75.7]} zoom={7} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {KARNATAKA_DISTRICTS.map(district => {
            const pred     = riskMap[district.id];
            const isLoading = loadingMap[district.id];
            const riskLevel = pred?.alert?.risk_level || pred?.risk_level || 'UNKNOWN';
            const color     = getRiskColor(riskLevel);
            const opacity   = riskLevel === 'UNKNOWN' ? 0.3 : riskLevel === 'LOW' ? 0.5 : riskLevel === 'MODERATE' ? 0.65 : riskLevel === 'HIGH' ? 0.80 : 0.95;

            return (
              <CircleMarker
                key={district.id}
                center={[district.lat, district.lng]}
                radius={18}
                pathOptions={{
                  color:       color,
                  fillColor:   color,
                  fillOpacity: opacity,
                  weight:      2,
                }}
                eventHandlers={{ click: () => handleMarkerClick(district) }}
              >
                <Popup>
                  <DistrictPopupContent
                    district={district}
                    prediction={pred}
                    loading={isLoading}
                  />
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-6 left-4 z-[1000] bg-surface border border-outline-variant rounded-lg p-3 shadow-lg">
          <p className="text-xs font-black uppercase tracking-widest text-outline mb-2">Risk Level</p>
          {RISK_LEGEND.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-semibold text-on-surface">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1">
            <div className="h-3 w-3 rounded-full flex-shrink-0 bg-outline opacity-30" />
            <span className="text-xs text-outline">No data</span>
          </div>
        </div>

        {/* Initial loading overlay */}
        {initialLoading && (
          <div className="absolute inset-0 z-[999] bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-surface rounded-card p-6 flex flex-col items-center gap-3 shadow-lg">
              <LoadingSpinner />
              <p className="text-sm text-outline">Loading district risk data…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
