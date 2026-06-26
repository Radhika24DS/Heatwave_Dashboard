// src/pages/dashboard/AuthorityDashboard.jsx
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import HeatwaveRiskMap  from '../../components/common/HeatwaveRiskMap';
import RiskSummaryCard  from '../../components/common/RiskSummaryCard';
import { predictionApi } from '../../api/predictionApi';
import { authorityApi }  from '../../api/authorityApi';
import { FileText, AlertCircle, Send, Download, ShieldAlert, Activity } from 'lucide-react';

const inputCls = 'w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/30 transition-all';

const AuthorityDashboard = () => {
  const [predictions,       setPredictions]       = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [alertRiskLevel,    setAlertRiskLevel]    = useState('HIGH');
  const [alertMessage,      setAlertMessage]      = useState('');
  const [broadcastMsg,      setBroadcastMsg]      = useState(null);
  const [downloading,       setDownloading]       = useState(false);
  const [broadcasting,      setBroadcasting]      = useState(false);

  useEffect(() => {
    (async () => {
      const resp = await predictionApi.getPredictions();
      if (resp?.status === 'success') {
        setPredictions(resp.data);
        if (resp.data.length > 0) setSelectedDistrictId(resp.data[0].district_id.toString());
      }
    })();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!selectedDistrictId || !alertMessage.trim()) return;
    setBroadcasting(true);
    setBroadcastMsg(null);
    try {
      const res = await authorityApi.generateAlerts(selectedDistrictId, alertRiskLevel, alertMessage);
      setBroadcastMsg(
        res.status === 'success'
          ? { type: 'success', text: `✅ Alert #${res.data?.id || 'OK'} broadcast successfully!` }
          : { type: 'error',   text: `❌ ${res.message || 'Failed to generate alert.'}` }
      );
      if (res.status === 'success') setAlertMessage('');
    } catch {
      setBroadcastMsg({ type: 'error', text: '❌ Network error. Check console.' });
    } finally {
      setBroadcasting(false);
    }
  };

  const handleDownload = async (scope) => {
    setDownloading(true);
    try {
      const distId = scope === 'district' ? parseInt(selectedDistrictId) : null;
      await authorityApi.downloadReport(distId);
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-1 rounded-full bg-blue-400" />
            <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">Authority Console</span>
          </div>
          <h1 className="section-header text-2xl sm:text-3xl font-black text-brand-text">
            Authority Management Console
          </h1>
          <p className="text-sm text-brand-muted mt-1 font-medium">
            Broadcast official heatwave warnings and coordinate district-level disaster response
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge level="EXTREME" pulse />
          <div className="flex items-center gap-2 bg-risk-extremeBg border border-risk-extreme/30 rounded-xl px-3 py-2 text-xs shadow-sm">
            <span className="h-2 w-2 rounded-full bg-risk-extreme animate-ping" />
            <span className="font-bold text-risk-extreme">Emergency Mode</span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={AlertCircle}  label="Active Alerts"       value="3"         color="text-risk-extreme" />
        <StatCard icon={ShieldAlert}  label="Districts Monitored" value="12"        color="text-blue-400" />
        <StatCard icon={Activity}     label="Avg Risk Level"      value="HIGH"      color="text-risk-high" />
        <StatCard icon={FileText}     label="Reports Today"       value="8"         color="text-risk-low" />
      </div>

      {/* ── Statewide Overview ─────────────────────────────── */}
      <Card title="Statewide District Risk Distribution" className="card-glow" accent>
        <RiskSummaryCard predictions={predictions} />
      </Card>

      {/* ── Map + Action Panels ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map */}
        <Card
          padding="none"
          hover={false}
          title="Geographical Risk Distribution"
          subtitle="Click district center circles to inspect specific atmospheric data"
          accent
          className="lg:col-span-2 shadow-card overflow-hidden card-glow"
        >
          <div className="h-[380px]"><HeatwaveRiskMap /></div>
        </Card>

        {/* Right Action Panel */}
        <div className="space-y-4">
          {/* Download Reports */}
          <Card title="📄 Vulnerability Reports">
            <p className="text-xs text-brand-muted mb-4 leading-relaxed">
              Export real-time diagnostic PDFs with IMD met-variables, AOD & PM datasets.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={downloading}
                onClick={() => handleDownload('state')}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-brand-surface hover:bg-brand-border border border-brand-border rounded-xl transition-all disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                All Districts
              </button>
              <button
                disabled={downloading}
                onClick={() => handleDownload('district')}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-brand-surface hover:bg-brand-border border border-brand-border rounded-xl transition-all disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                Selected
              </button>
            </div>
          </Card>

          {/* Broadcast Alert Form */}
          <Card title="📢 Broadcast Emergency Alert" glow>
            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="block text-[10px] text-brand-faint uppercase font-bold tracking-widest mb-1">Target District</label>
                <select value={selectedDistrictId} onChange={e => setSelectedDistrictId(e.target.value)} className={inputCls}>
                  {predictions.map(p => (
                    <option key={p.id} value={p.district_id}>
                      {p.district_name || `District ${p.district_id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-brand-faint uppercase font-bold tracking-widest mb-1">Severity</label>
                <select value={alertRiskLevel} onChange={e => setAlertRiskLevel(e.target.value)} className={inputCls}>
                  {['LOW','MODERATE','HIGH','EXTREME'].map(l => <option key={l} value={l}>{l} RISK</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-brand-faint uppercase font-bold tracking-widest mb-1">Warning Message</label>
                <textarea
                  required rows={3}
                  value={alertMessage}
                  onChange={e => setAlertMessage(e.target.value)}
                  placeholder="Enter directives for the public, transit guides, and farmers…"
                  className={`${inputCls} resize-none leading-relaxed`}
                />
              </div>

              {broadcastMsg && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  broadcastMsg.type === 'success'
                    ? 'bg-risk-lowBg text-risk-low border-risk-low/30'
                    : 'bg-risk-extremeBg text-risk-extreme border-risk-extreme/30'
                }`}>
                  {broadcastMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={broadcasting}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-risk-extreme hover:bg-red-500 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_16px_rgba(239,68,68,0.3)]"
              >
                <Send className="h-3.5 w-3.5" />
                {broadcasting ? 'Broadcasting…' : 'Publish Official Broadcast'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
