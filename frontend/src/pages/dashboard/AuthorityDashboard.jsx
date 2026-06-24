// src/pages/dashboard/AuthorityDashboard.jsx
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import HeatwaveRiskMap from '../../components/common/HeatwaveRiskMap';
import RiskSummaryCard from '../../components/common/RiskSummaryCard';
import { predictionApi } from '../../api/predictionApi';
import { authorityApi } from '../../api/authorityApi';
import RiskLegend from '../../components/common/RiskLegend';
import StatCard from '../../components/ui/StatCard';

const AuthorityDashboard = () => {
  const [predictions, setPredictions] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [alertRiskLevel, setAlertRiskLevel] = useState('HIGH');
  const [alertMessage, setAlertMessage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const resp = await predictionApi.getPredictions();
      if (resp?.status === 'success') {
        setPredictions(resp.data);
        if (resp.data.length > 0) {
          setSelectedDistrictId(resp.data[0].district_id.toString());
        }
      }
    };
    fetchData();
  }, []);

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    if (!selectedDistrictId || !alertMessage.trim()) return;

    setBroadcasting(true);
    setBroadcastMessage(null);
    try {
      const res = await authorityApi.generateAlerts(
        selectedDistrictId,
        alertRiskLevel,
        alertMessage
      );
      if (res.status === 'success') {
        setBroadcastMessage({
          type: 'success',
          text: `Success: Alert #${res.data?.id || 'OK'} broadcasted successfully to the public!`
        });
        setAlertMessage('');
      } else {
        setBroadcastMessage({
          type: 'error',
          text: `Error: ${res.message || 'Failed to generate alert.'}`
        });
      }
    } catch (err) {
      setBroadcastMessage({
        type: 'error',
        text: 'Failed to broadcast alert. Check console.'
      });
    } finally {
      setBroadcasting(false);
    }
  };

  const handleDownloadReport = async (scope) => {
    setDownloadingReport(true);
    try {
      const distId = scope === 'district' ? parseInt(selectedDistrictId) : null;
      await authorityApi.downloadReport(distId);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingReport(false);
    }
  };

  return (
    <div className="glass p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Authority Management Console</h1>
          <p className="text-sm text-brand-muted mt-1">Broadcast official heatwave warnings and download local disaster coordination reports</p>
        </div>
        <Badge level="EXTREME" className="mt-4 md:mt-0" variant="danger" />
        <div className="mt-4 md:mt-0 flex items-center space-x-2 text-xs text-brand-muted bg-brand-navy border border-brand-border px-3.5 py-1.5 rounded-lg shadow-inner">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-bold text-risk-extreme">Emergency Operations Mode</span>
        </div>
      </div>

      {/* Statewide Overview */}
      <div className="bg-brand-navy/40 border border-brand-border/60 rounded-2xl p-6 shadow-lg">
        <h2 className="text-sm font-black text-brand-text uppercase tracking-wider mb-4">Statewide District Risk Counts</h2>
        <RiskSummaryCard predictions={predictions} />
      </div>

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Geographical distribution */}
        <Card title="Heatwave Risk Geographical Distribution" className="lg:col-span-2 bg-brand-navy border border-brand-border rounded-2xl p-5 shadow-xl">
          <p className="text-xs text-brand-muted mt-0.5">Click district center circles to inspect specific atmospheric data</p>
          <HeatwaveRiskMap />
        </Card>

        {/* Right column: Form & Actions panel */}
        <div className="space-y-6">
          {/* Action 1: Report Generation */}
          <Card title="Vulnerability Reports" className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-5 w-5 text-risk-moderate" />
           {/* Stats Overview */}
        <Card title="Key Metrics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Active Alerts" value="3" />
            <StatCard label="Districts Monitored" value="12" />
            <StatCard label="Avg Risk Level" value="HIGH" />
            <StatCard label="Report Generation" value="Completed" />
          </div>
        </Card>

            </div>
            <p className="text-xs text-brand-muted mb-4 leading-relaxed">
              Export real-time diagnostic reports based on the latest IMD met-variables and PM2.5/AOD datasets.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={downloadingReport}
                onClick={() => handleDownloadReport('state')}
                className="py-2.5 bg-brand-slate text-brand-text hover:bg-brand-border border border-brand-border rounded-xl text-xs font-bold transition-all duration-150"
              >
                {downloadingReport ? 'Generating...' : 'All Districts'}
              </button>
              <button
                type="button"
                disabled={downloadingReport}
                onClick={() => handleDownloadReport('district')}
                className="py-2.5 bg-brand-slate text-brand-text hover:bg-brand-border border border-brand-border rounded-xl text-xs font-bold transition-all duration-150"
              >
                {downloadingReport ? 'Generating...' : 'Selected District'}
              </button>
            </div>
          </Card>

          {/* Action 2: Alert Broadcast Form */}
          <Card title="Broadcast Emergency Alert" className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-md font-bold text-brand-text">Broadcast Emergency Alert</h3>
            </div>

            <form onSubmit={handleBroadcastAlert} className="space-y-4">
              {/* Select Target District */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                  Target District
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  className="w-full bg-brand-slate border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted/60"
                >
                  {predictions.map((p) => (
                    <option key={p.id} value={p.district_id}>
                      {p.district_name || `District ID: ${p.district_id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Warning Severity */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                  Severity Level
                </label>
                <select
                  value={alertRiskLevel}
                  onChange={(e) => setAlertRiskLevel(e.target.value)}
                  className="w-full bg-brand-slate border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted/60"
                >
                  <option value="LOW">LOW RISK</option>
                  <option value="MODERATE">MODERATE RISK</option>
                  <option value="HIGH">HIGH RISK</option>
                  <option value="EXTREME">EXTREME RISK</option>
                </select>
              </div>

              {/* Advisory Message text area */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                  Warning message
                </label>
                <textarea
                  required
                  rows={3}
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Enter specific directives for the general public, transit guides, and farmers..."
                  className="w-full bg-brand-slate border border-brand-border rounded-xl p-3 text-xs text-brand-text focus:outline-none focus:border-brand-muted/60 placeholder-brand-muted/40 resize-none leading-relaxed"
                />
              </div>

              {/* Action message indicator */}
              {broadcastMessage && (
                <div 
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    broadcastMessage.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {broadcastMessage.text}
                </div>
              )}

              {/* Submit Broadcast Button */}
              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-brand-text rounded-xl font-bold transition-all duration-150 flex items-center justify-center space-x-2 text-xs disabled:bg-brand-border"
              >
                <Send className="h-4 w-4" />
                <span>{broadcasting ? 'Broadcasting Alert...' : 'Publish Official Broadcast'}</span>
              </button>
            </form>
          </Card>
        </div>
        <RiskLegend />
      </div>
    );
  };

  export default AuthorityDashboard;
