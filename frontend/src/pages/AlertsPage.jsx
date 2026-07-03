import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { alertService } from '../services/alert.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Bell, BellOff, CheckCircle, RefreshCw, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { getRiskBadgeClass, formatDateTime } from '../utils/constants';
import toast from 'react-hot-toast';

const TABS = ['ACTIVE', 'RESOLVED'];

function AlertCard({ alert, onResolve, canResolve }) {
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await onResolve(alert.id);
      toast.success('Alert resolved successfully.');
    } catch {
      toast.error('Failed to resolve alert.');
    } finally {
      setResolving(false);
    }
  };

  const borderColor = {
    LOW:      'border-heatwave-normal',
    MODERATE: 'border-heatwave-watch',
    HIGH:     'border-heatwave-warning',
    EXTREME:  'border-heatwave-extreme',
  }[alert.risk_level] || 'border-outline';

  return (
    <div className={`bg-surface rounded-card p-5 border-l-4 ${borderColor} shadow-card border border-outline-variant flex flex-col gap-3`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getRiskBadgeClass(alert.risk_level)}`}>
            {alert.risk_level}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface">
            {alert.status}
          </span>
        </div>
        {canResolve && alert.status === 'ACTIVE' && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-primary text-on-primary hover:bg-[#853900] transition-colors disabled:opacity-50"
          >
            <CheckCircle size={14} />
            {resolving ? 'Resolving…' : 'Resolve'}
          </button>
        )}
      </div>

      <p className="text-sm text-on-surface leading-relaxed">{alert.message}</p>

      <div className="flex flex-wrap gap-4 text-xs text-outline pt-2 border-t border-outline-variant">
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {alert.district_name}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} /> {formatDateTime(alert.issued_at)}
        </span>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { user } = useAuthStore();
  const [tab, setTab]       = useState('ACTIVE');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const canResolve = ['AUTHORITY', 'ADMIN'].includes(user?.role);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await alertService.getAlerts({ status: tab });
      setAlerts(res.data || []);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 422) {
        setAlerts([]);
      } else {
        setError('Failed to load alerts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleResolve = async (alertId) => {
    await alertService.resolveAlert(alertId);
    // Refresh
    await fetchAlerts();
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface flex items-center gap-3">
            <Bell className="text-primary" size={28} />
            Alerts & Notifications
          </h1>
          <p className="text-outline mt-1">
            Heatwave alerts issued across Karnataka districts
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-outline-variant hover:bg-surface-variant transition-colors text-sm font-semibold"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-full w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              tab === t
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface hover:bg-surface-variant'
            }`}
          >
            {t === 'ACTIVE' ? '🔴 Active' : '✅ Resolved'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container text-on-error-container rounded-card">
          <AlertTriangle size={20} />
          <div>
            <p className="font-semibold">{error}</p>
            <button onClick={fetchAlerts} className="text-sm underline mt-1">Retry</button>
          </div>
        </div>
      )}

      {/* Authority info banner */}
      {canResolve && tab === 'ACTIVE' && alerts.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-secondary-container text-on-secondary-container rounded-card text-sm">
          <CheckCircle size={16} />
          <span>As <strong>{user?.role}</strong>, you can resolve active alerts.</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4 bg-surface rounded-card border border-outline-variant">
          <BellOff size={40} className="text-outline" />
          <div className="text-center">
            <p className="font-bold text-on-surface">No {tab.toLowerCase()} alerts</p>
            <p className="text-outline text-sm mt-1">
              {tab === 'ACTIVE'
                ? 'No active heatwave alerts at this time. Check back later.'
                : 'No resolved alerts in the system.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-outline">{alerts.length} alert{alerts.length !== 1 ? 's' : ''} found</p>
          {alerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={handleResolve}
              canResolve={canResolve}
            />
          ))}
        </div>
      )}
    </div>
  );
}
