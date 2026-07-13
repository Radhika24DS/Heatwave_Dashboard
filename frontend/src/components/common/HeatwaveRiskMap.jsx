import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper: Haversine distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Custom Icons
const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/809/809989.png',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11]
});

const waterIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

const startIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

const destIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854860.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

const FALLBACK_DISTRICTS = [
  { id: 1, name: "Bangalore", latitude: 12.9716, longitude: 77.5946 },
  { id: 2, name: "Mysore", latitude: 12.2958, longitude: 76.6394 },
  { id: 3, name: "Belagavi", latitude: 15.8497, longitude: 74.4977 },
  { id: 4, name: "Kalaburagi", latitude: 17.3297, longitude: 76.8343 },
  { id: 5, name: "Mangalore", latitude: 12.9141, longitude: 74.8560 },
];

function ChangeView({ center }) {
  const map = useMap();
  if (center) {
    map.setView(center, map.getZoom());
  }
  return null;
}

export default function HeatwaveRiskMap({ 
  districtId, 
  onDistrictClick, 
  districts = [], 
  riskData = [], 
  mode = 'public',
  routeInsights = null 
}) {
  const activeDistricts = districts.length > 0 ? districts : FALLBACK_DISTRICTS;
  const currentId = districtId ? parseInt(districtId) : 1;
  const centerDistrict = activeDistricts.find(d => d.id === currentId) || activeDistricts[0];

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'EXTREME': return '#ef4444'; // Red
      case 'HIGH': return '#f97316'; // Orange
      case 'MODERATE': return '#fbbf24'; // Yellow
      default: return '#10b981'; // Green
    }
  };

  const getErrorColor = (name) => {
    // Coastal districts get high prediction error (purple)
    const coastal = ['Mangalore', 'Udupi', 'Uttara Kannada', 'Karwar', 'Chikkamagaluru'];
    if (coastal.some(c => name.includes(c))) return '#8b5cf6'; // Purple
    return '#10b981'; // Green (stable inland)
  };

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[centerDistrict.latitude || centerDistrict.lat, centerDistrict.longitude || centerDistrict.lng]} 
        zoom={mode === 'traveler' ? 8 : 7} 
        style={{ height: '100%', width: '100%' }}
        className="rounded-2xl"
      >
        <ChangeView center={[centerDistrict.latitude || centerDistrict.lat, centerDistrict.longitude || centerDistrict.lng]} />
        
        {/* Voyager modern map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
        />

        {/* ── MODE: TRAVELER ROUTE PLANNER ── */}
        {mode === 'traveler' && routeInsights && (
          <>
            {/* Draw color-coded polyline segments */}
            {routeInsights.route_segments.map((seg, i) => {
              if (i === 0) return null;
              const prev = routeInsights.route_segments[i-1];
              return (
                <Polyline
                  key={i}
                  positions={[
                    [prev.lat, prev.lon],
                    [seg.lat, seg.lon]
                  ]}
                  pathOptions={{
                    color: getRiskColor(seg.risk_level),
                    weight: 6,
                    opacity: 0.85
                  }}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <span className="font-black text-stone-900">{prev.district_name} ➔ {seg.district_name}</span>
                      <p className="mt-1 font-bold text-[#f97316]">Risk: {seg.risk_level}</p>
                      <p className="text-stone-500">Temp: {seg.temp}°C | Humidity: {seg.humidity}%</p>
                    </div>
                  </Popup>
                </Polyline>
              );
            })}

            {/* Start Marker */}
            {routeInsights.route_segments[0] && (
              <Marker 
                position={[routeInsights.route_segments[0].lat, routeInsights.route_segments[0].lon]}
                icon={startIcon}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <span className="font-black">Origin: {routeInsights.route_segments[0].district_name}</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Destination Marker */}
            {routeInsights.route_segments.length > 1 && (
              <Marker 
                position={[
                  routeInsights.route_segments[routeInsights.route_segments.length - 1].lat,
                  routeInsights.route_segments[routeInsights.route_segments.length - 1].lon
                ]}
                icon={destIcon}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <span className="font-black">Destination: {routeInsights.route_segments[routeInsights.route_segments.length - 1].district_name}</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Rest Stops Pins */}
            {routeInsights.route_segments.map((seg, i) => {
              if (i === 0 || i === routeInsights.route_segments.length - 1) return null;
              return (
                <Marker 
                  key={`stop-${i}`}
                  position={[seg.lat, seg.lon]}
                  icon={waterIcon}
                >
                  <Popup>
                    <div className="p-1 text-xs space-y-1">
                      <span className="font-black text-[#9d4300]">🥤 Shaded Rest Stop</span>
                      <p className="text-stone-500 text-[10px]">Rest & Hydrate. Clean water & ORS solutions available.</p>
                      <span className="block text-[10px] text-stone-400 font-bold">Segment: {seg.district_name}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Nearby Hospital Pins */}
            {routeInsights.route_segments.map((seg, i) => (
              <Marker
                key={`hosp-${i}`}
                position={[seg.lat + 0.05, seg.lon - 0.04]} // offset for visual lookup
                icon={hospitalIcon}
              >
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <span className="font-black text-red-600">🏥 Emergency Health Hospital</span>
                    <p className="text-stone-700 font-bold">Contact: 108</p>
                    <p className="text-stone-400 text-[9px]">24/7 Heat-stroke trauma center available.</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* ── STANDARD MODES (Public, Farmer, Research, Authority) ── */}
        {mode !== 'traveler' && activeDistricts.map((district) => {
          const lat = district.latitude || district.lat;
          const lon = district.longitude || district.lng;
          
          // Match risk level from riskData
          const itemData = riskData.find(r => r.district_id === district.id || r.district_name === district.name);
          const riskLevel = itemData?.risk_level || 'LOW';
          const temp = itemData?.temperature || 35;
          const isSelected = district.id === currentId;

          let color = getRiskColor(riskLevel);
          let radius = isSelected ? 16 : 10;
          let weight = isSelected ? 4 : 1.5;
          let dashArray = null;

          // Mode adjustments
          if (mode === 'research') {
            color = getErrorColor(district.name);
          } else if (mode === 'farmer' && isSelected) {
            // Pulsing highlight or dashed neighbor borders
            dashArray = "4 3";
          }

          // Blinking animation for EXTREME alerts on Authority dashboard
          const isExtremeAlert = mode === 'authority' && riskLevel === 'EXTREME';

          return (
            <CircleMarker
              key={district.id}
              center={[lat, lon]}
              radius={radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.8,
                color: isSelected ? '#4b5563' : '#ffffff',
                weight: weight,
                dashArray: dashArray
              }}
              eventHandlers={{
                click: () => onDistrictClick && onDistrictClick(district.id),
              }}
            >
              <Popup className="font-sans">
                <div className="p-1 space-y-1">
                  <h3 className="font-black text-stone-900">📍 {district.name}</h3>
                  {mode === 'research' ? (
                    <div className="text-xs">
                      <p className="font-bold text-purple-600">
                        Error: {color === '#8b5cf6' ? 'High Variance' : 'Low (Stable)'}
                      </p>
                      <p className="text-stone-500">Feature contribution: Temp, AOD</p>
                      <span className="block text-[9px] text-stone-400 mt-1 uppercase font-bold">Click for SHAP</span>
                    </div>
                  ) : (
                    <div className="text-xs">
                      <p className="font-bold uppercase tracking-wider" style={{ color }}>
                        {riskLevel} Risk
                      </p>
                      <p className="text-stone-500 mt-0.5">Temp: {temp}°C</p>
                      {isExtremeAlert && <span className="block text-[9px] text-red-600 font-bold uppercase animate-pulse">⚠️ Alert Draft Triggered</span>}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

