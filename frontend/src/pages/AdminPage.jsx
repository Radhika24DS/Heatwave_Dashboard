import React, { useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';
import StatCard from '../components/ui/StatCard';
import { Users, Database, Activity, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      await adminService.triggerPipeline();
      toast.success("Pipeline triggered successfully.");
    } catch (error) {
      toast.error("Failed to trigger pipeline.");
    } finally {
      setTriggering(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-on-surface">Admin Control Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.total_users || 0} 
          icon={<Users size={24} className="text-on-primary-container" />} 
          colorClass="bg-primary-container"
        />
        <StatCard 
          title="Active Alerts" 
          value={stats?.active_alerts || 0} 
          icon={<AlertTriangle size={24} className="text-on-error-container" />} 
          colorClass="bg-error-container"
        />
        <StatCard 
          title="API Requests" 
          value={stats?.api_requests || 0} 
          icon={<Activity size={24} className="text-on-secondary-container" />} 
          colorClass="bg-secondary-container"
        />
        <StatCard 
          title="DB Size" 
          value={stats?.db_size || 'N/A'} 
          icon={<Database size={24} className="text-on-tertiary-container" />} 
          colorClass="bg-tertiary-container"
        />
      </div>

      <div className="bg-surface rounded-card p-6 shadow-card border border-surface-variant">
        <h2 className="text-xl font-bold mb-4 text-on-surface">ML Pipeline Controls</h2>
        <p className="text-outline mb-4">Manually trigger the data preprocessing, feature engineering, and model training pipeline. This action runs asynchronously in the background.</p>
        <button 
          onClick={handleTrigger}
          disabled={triggering}
          className="px-6 py-2 bg-error text-on-error font-bold rounded-lg hover:bg-[#93000a] disabled:opacity-50 transition"
        >
          {triggering ? "Triggering..." : "Force Run Pipeline"}
        </button>
      </div>
    </div>
  );
}
