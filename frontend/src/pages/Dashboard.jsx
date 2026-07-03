import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { predictionService } from '../services/prediction.service';
import { advisoryService } from '../services/advisory.service';
import { alertService } from '../services/alert.service';

import DistrictSelector from '../components/common/DistrictSelector';
import WeatherCard from '../components/common/WeatherCard';
import PredictionCard from '../components/common/PredictionCard';
import AdvisoryCard from '../components/common/AdvisoryCard';
import AlertBadge from '../components/common/AlertBadge';
import RiskGauge from '../components/common/RiskGauge';
import EmergencyBanner from '../components/common/EmergencyBanner';
import ForecastStrip from '../components/common/ForecastStrip';
import HeatwaveRiskMap from '../components/common/HeatwaveRiskMap';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [districtId, setDistrictId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  
  // RAG Advisory
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryData, setAdvisoryData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Parallel fetching but handle alert failure gracefully (Phase 7 didn't build alerts API)
        const predRes = await predictionService.getPrediction(districtId, today);
        let alertRes = { data: [] };
        try {
          alertRes = await alertService.getAlerts(districtId);
        } catch (e) {
          console.warn("Alerts API not implemented yet");
        }
        
        setData(predRes.data);
        setAlerts(alertRes.data || []);
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [districtId]);

  // Only fetch advisory when prediction finishes and if there's a risk.
  useEffect(() => {
    if (data && data.prediction?.risk_score > 0.3) {
      const fetchAdvisory = async () => {
        setAdvisoryLoading(true);
        try {
          const reqQuery = `Heatwave advisory for ${data.district_name}`;
          const res = await advisoryService.getAdvisory(reqQuery, user.role, data.district_name);
          setAdvisoryData(res.data);
        } catch (error) {
          console.error("Advisory error", error);
        } finally {
          setAdvisoryLoading(false);
        }
      };
      fetchAdvisory();
    } else {
      setAdvisoryData(null);
    }
  }, [data, user.role]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  const isExtreme = data?.prediction?.severity_tier === 'EXTREME';
  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1440px] mx-auto">
      <EmergencyBanner isActive={isExtreme} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface">Hello, {user?.name || 'User'}</h1>
          <p className="text-outline">Here is the heatwave situation for your selected district.</p>
        </div>
        
        <DistrictSelector selectedDistrict={districtId} onChange={setDistrictId} />
      </div>

      {latestAlert && (
        <AlertBadge level={latestAlert.alert_level} message={latestAlert.message} />
      )}

      {/* Primary Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Prediction & Risk */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {data?.prediction && (
            <RiskGauge score={data.prediction.risk_score} percent={data.prediction.risk_percent} />
          )}
          <PredictionCard prediction={data?.prediction} />
        </div>

        {/* Middle Column: Weather & Advisories */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <WeatherCard weather={data?.weather} />
          
          {(advisoryData || advisoryLoading) && (
            <div className="mt-2">
              {advisoryLoading ? (
                <div className="glass-panel p-6 flex flex-col items-center justify-center h-40">
                  <LoadingSpinner />
                  <p className="text-sm mt-3 text-outline">Generating AI Advisory...</p>
                </div>
              ) : (
                <AdvisoryCard advisory={advisoryData} role={user.role} />
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map */}
        <div className="lg:col-span-1 h-full min-h-[400px]">
           {/* Fallback map or actual react-leaflet map component */}
           <div className="bg-surface rounded-card p-4 h-full border border-surface-variant flex flex-col">
             <h3 className="font-bold text-lg mb-3 text-on-surface">Regional Overview</h3>
             <div className="flex-1 relative rounded-lg overflow-hidden border border-outline-variant">
               <HeatwaveRiskMap districtId={districtId} onDistrictClick={setDistrictId} />
             </div>
           </div>
        </div>

      </div>

      {/* Bottom Area: Forecast & Role-Specific Widgets */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {/* Placeholder for forecast since the real endpoint returns 7 days */}
        {data?.forecasts && data.forecasts.length > 0 && (
          <ForecastStrip forecasts={data.forecasts} />
        )}
      </div>

      {/* Role Conditional Sections */}
      {user.role === 'ADMIN' && (
        <div className="mt-8 p-6 bg-error-container text-on-error-container rounded-card">
          <h2 className="font-bold text-xl mb-2">Admin Controls</h2>
          <p className="text-sm opacity-80 mb-4">You are viewing the consolidated dashboard as an Administrator.</p>
          <button className="px-4 py-2 bg-error text-on-error rounded-full font-bold shadow-md hover:bg-[#93000a] transition">
            Force Trigger ML Pipeline
          </button>
        </div>
      )}

      {user.role === 'RESEARCH' && (
        <div className="mt-8 p-6 bg-secondary-container text-on-secondary-container rounded-card">
          <h2 className="font-bold text-xl mb-2">Research Analytics</h2>
          <p className="text-sm">Additional SHAP charts, model performance metrics, and dataset views go here.</p>
        </div>
      )}
      
    </div>
  );
}
