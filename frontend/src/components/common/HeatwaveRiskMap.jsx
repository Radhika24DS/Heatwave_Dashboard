import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const KARNATAKA_DISTRICTS = [
  { id: 1, name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { id: 2, name: "Mysore", lat: 12.2958, lng: 76.6394 },
  { id: 3, name: "Hubli", lat: 15.3647, lng: 75.1240 },
  { id: 4, name: "Mangalore", lat: 12.9141, lng: 74.8560 },
  { id: 5, name: "Belgaum", lat: 15.8497, lng: 74.4977 },
];

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function HeatwaveRiskMap({ districtId, onDistrictClick }) {
  const centerDistrict = KARNATAKA_DISTRICTS.find(d => d.id === districtId) || KARNATAKA_DISTRICTS[0];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[centerDistrict.lat, centerDistrict.lng]} 
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <ChangeView center={[centerDistrict.lat, centerDistrict.lng]} />
        
        {/* Light modern map style */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {KARNATAKA_DISTRICTS.map((district) => (
          <Marker 
            key={district.id} 
            position={[district.lat, district.lng]}
            eventHandlers={{
              click: () => onDistrictClick && onDistrictClick(district.id),
            }}
          >
            <Popup className="font-sans">
              <div className="p-1">
                <h3 className="font-bold text-primary">{district.name}</h3>
                <p className="text-xs text-outline mt-1">Click to view risk</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
