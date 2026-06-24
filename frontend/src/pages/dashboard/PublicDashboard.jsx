// src/pages/dashboard/PublicDashboard.jsx
import React, { useEffect, useState } from 'react';
import HeatwaveRiskMap    from '../../components/common/HeatwaveRiskMap';
import RiskSummaryCard    from '../../components/common/RiskSummaryCard';
import DistrictRankCard   from '../../components/common/DistrictRankCard';
import RiskLevelCard      from '../../components/common/RiskLevelCard';
import AdvisoryCard       from '../../components/common/AdvisoryCard';
import ForecastTrendChart from '../../components/common/ForecastTrendChart';
import { predictionApi }  from '../../api/predictionApi';
import { advisoryApi }    from '../../api/advisoryApi';
import { authorityApi }   from '../../api/authorityApi';
import { MapPin, Activity, AlertTriangle } from 'lucide-react';

const PageHeader = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="h-5 w-1 rounded-full bg-heat-gradient" />
        <span className="text-xs text-brand-primary font-bold uppercase tracking-widest">Karnataka · Live Feed</span>
      </div>
      <h1 className="font-heading text-2xl sm:text-3xl font-black text-brand-text">
        Heatwave Risk Assessment
      </h1>
      <p className="text-sm text-brand-muted mt-1">
        AI-powered predictions using AOD aerosol & IMD meteorological data
      </p>
    </div>
    <div className="flex items-center gap-2 bg-brand-card border border-risk-low/20 rounded-xl px-4 py-2 self-start sm:self-auto">
      <span className="h-2 w-2 rounded-full bg-risk-low animate-pulse" />
      <span className="text-xs font-semibold text-risk-low">Model Active</span>
      <Activity className="h-3.5 w-3.5 text-risk-low ml-1" />
    </div>
  </div>
);

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
  <div className="flex items-start gap-2 mb-4">
    {Icon && (
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 border border-brand-primary/20">
        <Icon className="h-3.5 w-3.5 text-brand-primary" />
      </div>
    )}
    <div>
      <h2 className="font-heading text-sm font-bold text-brand-text">{title}</h2>
      {subtitle && <p className="text-[11px] text-brand-faint mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const PublicDashboard = () => {
  const [predictions, setPredictions]   = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [forecast, setForecast]         = useState([]);
  const [advisory, setAdvisory]         = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [loadingMain, setLoadingMain]   = useState(true);

  useEffect(() => {
    (async () => {
      const resp = await predictionApi.getPredictions();
      if (resp?.status === 'success') {
        setPredictions(resp.data);
        if (resp.data.length > 0) {
          const sorted = [...resp.data].sort((a, b) => b.risk_score - a.risk_score);
          setSelectedDistrict(sorted[0]);
        }
      }
      setLoadingMain(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedDistrict) return;
    (async () => {
      setLoadingForecast(true);
      try {
        const [fResp, aResp] = await Promise.all([
          predictionApi.getForecast(selectedDistrict.district_id),
          advisoryApi.getAdvisory('PUBLIC', selectedDistrict.risk_level),
        ]);
        if (fResp?.status === 'success') setForecast(fResp.data);
        if (aResp?.status === 'success') setAdvisory(aResp.data);
      } catch (e) {
        console.error('Failed loading district details', e);
      } finally {
        setLoadingForecast(false);
      }
    })();
  }, [selectedDistrict]);

  const handleDownload = async () => {
    if (selectedDistrict) await authorityApi.downloadReport(selectedDistrict.district_id);
  };

  if (loadingMain) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-brand-primary/30 border-t-brand-primary animate-spin" />
        <p className="text-brand-muted text-sm">Loading heatwave data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <PageHeader />

      {/* ── Risk Summary Counts ──────────────────────────── */}
      <section>
        <SectionHeader title="Statewide Risk Distribution" subtitle="Count of districts per risk category" />
        <RiskSummaryCard predictions={predictions} />
      </section>

      {/* ── Map + Ranking ────────────────────────────────── */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Map */}
        <div className="xl:col-span-2 rounded-2xl border border-brand-border bg-brand-card shadow-card overflow-hidden">
          <div className="p-4 border-b border-brand-border/50 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-primary" />
            <div>
              <h2 className="font-heading text-sm font-bold text-brand-text">Geographical Risk Distribution</h2>
              <p className="text-[11px] text-brand-faint">Click district circles to inspect atmospheric data</p>
            </div>
          </div>
          <div className="h-[420px]">
            <HeatwaveRiskMap />
          </div>
        </div>

        {/* Ranking */}
        <DistrictRankCard
          predictions={predictions}
          onSelectDistrict={setSelectedDistrict}
        />
      </section>

      {/* ── District Detail ──────────────────────────────── */}
      {selectedDistrict && (
        <section className="border-t border-brand-border/30 pt-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="h-4 w-4 text-brand-primary" />
            <h2 className="font-heading text-lg font-black text-brand-text">
              Inspection: <span className="gradient-text">{selectedDistrict.district_name}</span>
            </h2>
            <p className="text-xs text-brand-muted hidden sm:block mt-0.5">
              — atmospheric variables, advisory guidelines & 3-day forecast
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Left: Risk profile + advisory */}
            <div className="space-y-4">
              <RiskLevelCard
                districtName={selectedDistrict.district_name}
                riskLevel={selectedDistrict.risk_level}
                riskScore={selectedDistrict.risk_score}
                weather={selectedDistrict.weather}
                aerosol={selectedDistrict.aerosol}
              />
              {advisory && (
                <AdvisoryCard advisory={advisory} onDownloadReport={handleDownload} />
              )}
            </div>

            {/* Right: Forecast chart */}
            <div className="xl:col-span-2">
              {loadingForecast ? (
                <div className="flex items-center justify-center h-72 rounded-2xl border border-brand-border bg-brand-card">
                  <div className="flex flex-col items-center gap-3 text-brand-faint">
                    <div className="h-7 w-7 rounded-full border-2 border-brand-primary/30 border-t-brand-primary animate-spin" />
                    <span className="text-sm">Loading forecast analytics…</span>
                  </div>
                </div>
              ) : (
                <ForecastTrendChart forecastData={forecast} />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PublicDashboard;
