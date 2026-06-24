// src/pages/dashboard/PublicDashboard.jsx
import React, { useEffect, useState } from 'react';
import HeatwaveRiskMap from '../../components/common/HeatwaveRiskMap';
import RiskSummaryCard from '../../components/common/RiskSummaryCard';
import DistrictRankCard from '../../components/common/DistrictRankCard';
import RiskLevelCard from '../../components/common/RiskLevelCard';
import AdvisoryCard from '../../components/common/AdvisoryCard';
import ForecastTrendChart from '../../components/common/ForecastTrendChart';
import { predictionApi } from '../../api/predictionApi';
import { advisoryApi } from '../../api/advisoryApi';
import { authorityApi } from '../../api/authorityApi';

const PublicDashboard = () => {
  const [predictions, setPredictions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [advisory, setAdvisory] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const resp = await predictionApi.getPredictions();
      if (resp?.status === 'success') {
        setPredictions(resp.data);
        // Default select the highest risk district
        if (resp.data.length > 0) {
          const sorted = [...resp.data].sort((a, b) => b.risk_score - a.risk_score);
          setSelectedDistrict(sorted[0]);
        }
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      const loadForecastAndAdvisory = async () => {
        setLoadingForecast(true);
        try {
          const [forecastResp, advisoryResp] = await Promise.all([
            predictionApi.getForecast(selectedDistrict.district_id),
            advisoryApi.getAdvisory('PUBLIC', selectedDistrict.risk_level)
          ]);
          if (forecastResp?.status === 'success') {
            setForecast(forecastResp.data);
          }
          if (advisoryResp?.status === 'success') {
            setAdvisory(advisoryResp.data);
          }
        } catch (e) {
          console.error('Failed to load details for district', e);
        } finally {
          setLoadingForecast(false);
        }
      };
      loadForecastAndAdvisory();
    }
  }, [selectedDistrict]);

  const handleDownloadReport = async () => {
    if (selectedDistrict) {
      await authorityApi.downloadReport(selectedDistrict.district_id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Karnataka Heatwave Risk Assessment</h1>
          <p className="text-sm text-brand-muted mt-1">Real-time AI prediction monitoring using multi-spectral Aerosol (AOD) and IMD weather data</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 text-xs text-brand-muted bg-brand-navy border border-brand-border px-3.5 py-1.5 rounded-lg shadow-inner">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-brand-text">Live System Feed</span>
        </div>
      </div>

      {/* Overview stats */}
      <div className="bg-brand-navy/40 border border-brand-border/60 rounded-2xl p-6 shadow-lg">
        <h2 className="text-sm font-black text-brand-text uppercase tracking-wider mb-4">Statewide District Risk Counts</h2>
        <RiskSummaryCard predictions={predictions} />
      </div>

      {/* Main Grid: Interactive Map & Ranking List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map */}
        <div className="lg:col-span-2 bg-brand-navy border border-brand-border rounded-2xl p-5 shadow-xl">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-brand-text">Heatwave Risk Geographical Distribution</h2>
            <p className="text-xs text-brand-muted mt-0.5">Click district center circles to inspect specific atmospheric data</p>
          </div>
          <HeatwaveRiskMap />
        </div>

        {/* Right: Ranking */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl shadow-xl">
          <DistrictRankCard 
            predictions={predictions} 
            onSelectDistrict={(dist) => setSelectedDistrict(dist)}
          />
        </div>
      </div>

      {/* Detailed Inspection Drawer */}
      {selectedDistrict && (
        <div className="border-t border-brand-border/40 pt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-brand-text tracking-tight">
              Detailed Inspection: <span className="text-risk-high">{selectedDistrict.district_name}</span>
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">Atmospheric variables, dynamic public advisory guidelines, and 3-day forecast trends</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk profile cards */}
            <div className="space-y-6">
              <RiskLevelCard 
                districtName={selectedDistrict.district_name}
                riskLevel={selectedDistrict.risk_level}
                riskScore={selectedDistrict.risk_score}
                weather={selectedDistrict.weather}
                aerosol={selectedDistrict.aerosol}
              />
              
              {advisory && (
                <AdvisoryCard 
                  advisory={advisory} 
                  onDownloadReport={handleDownloadReport}
                />
              )}
            </div>

            {/* Forecast Area Trend Chart */}
            <div className="lg:col-span-2">
              {loadingForecast ? (
                <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 h-full min-h-[300px] flex items-center justify-center text-brand-muted">
                  Loading forecast analytics...
                </div>
              ) : (
                <ForecastTrendChart forecastData={forecast} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicDashboard;
