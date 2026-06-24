import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRiskColorHex } from '../../utils/riskColor';
import { predictionApi } from '../../api/predictionApi';
import RiskLegend from './RiskLegend';

const HeatwaveRiskMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [predictions, setPredictions] = useState([]);

  // Load GeoJSON file
  useEffect(() => {
    fetch('/karnataka_districts.geojson')
      .then((res) => res.json())
      .then(setGeoData)
      .catch((e) => console.error('Failed to load GeoJSON', e));
  }, []);

  // Load predictions
  useEffect(() => {
    const load = async () => {
      const resp = await predictionApi.getPredictions();
      if (resp?.status === 'success') {
        setPredictions(resp.data);
      } else {
        console.warn('Prediction API fallback data not available');
      }
    };
    load();
  }, []);

  // Helper to get risk level for a district name
  const getRiskForDistrict = (name) => {
    const match = predictions.find((p) => p.district_name?.toUpperCase() === name.toUpperCase());
    return match?.risk_level || 'LOW';
  };

  // Style each feature based on risk level
  const onEachFeature = (feature, layer) => {
    const districtName = feature.properties?.district || feature.properties?.name || '';
    const risk = getRiskForDistrict(districtName);
    const color = getRiskColorHex(risk);
    layer.setStyle({
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.6,
    });
    const tooltipContent = `${districtName}<br/>Risk: ${risk}`;
    layer.bindTooltip(tooltipContent, { sticky: true });
  };

  // Map points to circle markers with custom styling
  const pointToLayer = (feature, latlng) => {
    const districtName = feature.properties?.district || feature.properties?.name || '';
    const risk = getRiskForDistrict(districtName);
    const color = getRiskColorHex(risk);
    return L.circleMarker(latlng, {
      radius: 12,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    });
  };

  if (!geoData) return <div className="flex h-64 items-center justify-center font-semibold text-brand-muted">Loading map…</div>;

  return (
    <MapContainer center={[15.3, 75.7]} zoom={6} style={{ height: '500px', width: '100%' }} className="relative rounded-lg shadow-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <GeoJSON data={geoData} onEachFeature={onEachFeature} pointToLayer={pointToLayer} />
      <RiskLegend />
    </MapContainer>
  );
};

export default HeatwaveRiskMap;
