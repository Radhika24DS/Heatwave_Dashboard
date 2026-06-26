// src/pages/dashboard/AdminDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { adminApi } from '../../api/adminApi';
import { 
  Users, 
  UploadCloud, 
  Cpu, 
  Terminal, 
  CheckCircle, 
  AlertTriangle,
  Play,
  UserCheck2,
  UserX2
} from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';

const inputCls = 'w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/30 transition-all';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  
  // Tab 1: User Management States
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userMsg, setUserMsg] = useState(null);

  // Tab 2: Dataset Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetType, setDatasetType] = useState('AEROSOL');
  const [uploadMsg, setUploadMsg] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Tab 3: Model Retraining States
  const [jobId, setJobId] = useState(null);
  const [retrainStatus, setRetrainStatus] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const pollIntervalRef = useRef(null);

  // Tab 4: System Logs States
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch Users
  const fetchUsersList = async () => {
    setLoadingUsers(true);
    try {
      const res = await adminApi.getUsers();
      if (res.status === 'success') {
        setUsersList(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Toggle user activation
  const handleToggleUser = async (userId, currentActive) => {
    setUserMsg(null);
    try {
      const targetActive = !currentActive;
      const res = await adminApi.toggleUserStatus(userId, targetActive);
      if (res.status === 'success') {
        setUserMsg(`Successfully ${targetActive ? 'activated' : 'deactivated'} user account.`);
        // Reload locally to save request
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_active: targetActive } : u));
      }
    } catch (err) {
      setUserMsg('Failed to modify user status.');
    }
  };

  // Handle file select
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle dataset upload submission
  const handleUploadDataset = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadMsg(null);
    try {
      const res = await adminApi.uploadDataset(selectedFile, datasetType);
      if (res.status === 'success') {
        setUploadMsg({
          type: 'success',
          text: `Success: Dataset ${res.data?.filename} uploaded and marked PENDING.`
        });
        setSelectedFile(null);
      } else {
        setUploadMsg({
          type: 'error',
          text: res.message || 'Dataset upload failed.'
        });
      }
    } catch (err) {
      setUploadMsg({
        type: 'error',
        text: 'System upload error.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Trigger retraining pipeline
  const handleTriggerRetraining = async () => {
    setTriggering(true);
    setRetrainStatus(null);
    try {
      const res = await adminApi.triggerRetraining();
      if (res.status === 'success' && res.data?.job_id) {
        setJobId(res.data.job_id);
        setRetrainStatus({
          status: 'PROCESSING',
          progress: 20,
          active_model: 'v2.0-XGBoost'
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTriggering(false);
    }
  };

  // Retrain Polling Hook
  useEffect(() => {
    if (jobId) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await adminApi.getRetrainStatus(jobId);
          if (res.status === 'success' && res.data) {
            setRetrainStatus(res.data);
            if (res.data.status === 'COMPLETED' || res.data.status === 'FAILED') {
              clearInterval(pollIntervalRef.current);
              setJobId(null);
            }
          }
        } catch (err) {
          console.error(err);
          clearInterval(pollIntervalRef.current);
        }
      }, 3000);
    }
    return () => clearInterval(pollIntervalRef.current);
  }, [jobId]);

  // Fetch Logs
  const fetchLogsList = async (page) => {
    setLoadingLogs(true);
    try {
      const res = await adminApi.getSystemLogs(page, 8);
      if (res.status === 'success' && res.data) {
        setLogs(res.data.logs);
        setLogsTotalPages(res.data.pages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Reload lists when tabs switch
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsersList();
    } else if (activeTab === 'logs') {
      fetchLogsList(logsPage);
    }
  }, [activeTab, logsPage]);

  // Helper for role badge custom styles
  const getRoleBadgeClass = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'AUTHORITY':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'RESEARCHER':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'FARMER':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-brand-surface text-brand-muted border border-brand-border';
    }
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-1 rounded-full bg-purple-500" />
            <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">System Operations</span>
          </div>
          <h1 className="section-header text-2xl sm:text-3xl font-black text-brand-text">
            Admin Operations Dashboard
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Configure user roles, upload physical sensor observations, and retrain risk predictors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-xl px-3 py-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
            <span className="font-bold text-purple-400">Superuser Mode</span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Users}  
          label="Registered Users"       
          value={loadingUsers ? '...' : usersList.length} 
          sub="Authorized user accounts"
          color="text-purple-400" 
        />
        <StatCard 
          icon={UploadCloud}  
          label="Dataset Feeds" 
          value="2 Active"        
          sub="AEROSOL & WEATHER categories"
          color="text-blue-400" 
        />
        <StatCard 
          icon={Cpu}     
          label="Prediction Engine"      
          value={retrainStatus?.active_model || 'v2.0-XGBoost'}      
          sub="Optimized XGBoost predictor"
          color="text-brand-primary" 
        />
        <StatCard 
          icon={Terminal}     
          label="Logs Index"       
          value={logsTotalPages > 1 ? `${logsTotalPages * 8}+` : logs.length}         
          sub="Activity system logs"
          color="text-brand-yellow" 
        />
      </div>

      {/* ── Tabs Controller ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-brand-surface border border-brand-border rounded-2xl max-w-max">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
            activeTab === 'users'
              ? 'bg-brand-card text-brand-primary border border-brand-border shadow-sm shadow-brand-primary/5'
              : 'text-brand-muted hover:text-brand-text border border-transparent hover:bg-brand-card/30'
          }`}
        >
          <Users className={`h-4 w-4 ${activeTab === 'users' ? 'text-brand-primary' : 'text-brand-muted'}`} />
          <span>User Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('datasets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
            activeTab === 'datasets'
              ? 'bg-brand-card text-brand-primary border border-brand-border shadow-sm shadow-brand-primary/5'
              : 'text-brand-muted hover:text-brand-text border border-transparent hover:bg-brand-card/30'
          }`}
        >
          <UploadCloud className={`h-4 w-4 ${activeTab === 'datasets' ? 'text-brand-primary' : 'text-brand-muted'}`} />
          <span>Dataset Feeds</span>
        </button>

        <button
          onClick={() => setActiveTab('retraining')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
            activeTab === 'retraining'
              ? 'bg-brand-card text-brand-primary border border-brand-border shadow-sm shadow-brand-primary/5'
              : 'text-brand-muted hover:text-brand-text border border-transparent hover:bg-brand-card/30'
          }`}
        >
          <Cpu className={`h-4 w-4 ${activeTab === 'retraining' ? 'text-brand-primary' : 'text-brand-muted'}`} />
          <span>Retrain Model</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
            activeTab === 'logs'
              ? 'bg-brand-card text-brand-primary border border-brand-border shadow-sm shadow-brand-primary/5'
              : 'text-brand-muted hover:text-brand-text border border-transparent hover:bg-brand-card/30'
          }`}
        >
          <Terminal className={`h-4 w-4 ${activeTab === 'logs' ? 'text-brand-primary' : 'text-brand-muted'}`} />
          <span>System Logs</span>
        </button>
      </div>

      {/* ── Tab Panels ──────────────────────────────────────── */}
      <div className="space-y-4">
        
        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <Card
            title="Active User Accounts"
            subtitle="Toggle active statuses or audit registered roles"
            accent
          >
            {userMsg && (
              <div className="p-3 mb-4 bg-risk-lowBg text-risk-low border border-risk-low/20 text-xs font-semibold rounded-xl">
                {userMsg}
              </div>
            )}

            {loadingUsers ? (
              <p className="text-sm text-brand-muted text-center py-8">Loading user records...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-muted uppercase font-bold text-[9px] tracking-wider">
                      <th className="pb-3 pl-2">User Name</th>
                      <th className="pb-3">Email Address</th>
                      <th className="pb-3">Role Assigned</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((user) => (
                      <tr key={user.id} className="border-b border-brand-border/40 hover:bg-brand-surface/30 transition-colors duration-150">
                        <td className="py-3.5 pl-2 font-bold text-brand-text">{user.name}</td>
                        <td className="py-3.5 text-brand-muted">{user.email}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block w-2 h-2 rounded-full ${user.is_active ? 'bg-risk-low risk-badge-low' : 'bg-risk-extreme risk-badge-extreme'}`} />
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <button
                            onClick={() => handleToggleUser(user.id, user.is_active)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                              user.is_active 
                                ? 'text-risk-extreme bg-risk-extremeBg hover:bg-risk-extreme hover:text-white border-risk-extreme/20' 
                                : 'text-risk-low bg-risk-lowBg hover:bg-risk-low hover:text-black border-risk-low/20'
                            }`}
                          >
                            {user.is_active ? <UserX2 className="h-4 w-4" /> : <UserCheck2 className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab 2: Dataset Upload */}
        {activeTab === 'datasets' && (
          <Card
            title="Aerosol & Weather Feed Loader"
            subtitle="Upload IMD weather records or satellite AOD measurements (CSV format)"
            accent
          >
            <div className="max-w-md space-y-6">
              <form onSubmit={handleUploadDataset} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-1.5">
                    Dataset Category
                  </label>
                  <select
                    value={datasetType}
                    onChange={(e) => setDatasetType(e.target.value)}
                    className={inputCls}
                  >
                    <option value="AEROSOL">Aerosol Optical Depth (AOD)</option>
                    <option value="WEATHER">IMD Meteorological Observations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-1.5">
                    CSV Data File
                  </label>
                  <div className={`border border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 relative group ${
                    selectedFile 
                      ? 'border-risk-low/40 bg-risk-lowBg/5' 
                      : 'border-brand-border hover:border-brand-primary/40 bg-brand-surface/30 hover:bg-brand-surface/75'
                  }`}>
                    <input
                      required
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className={`h-8 w-8 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110 ${
                      selectedFile ? 'text-risk-low' : 'text-brand-muted group-hover:text-brand-primary'
                    }`} />
                    <p className={`text-xs font-bold ${selectedFile ? 'text-risk-low' : 'text-brand-text'}`}>
                      {selectedFile ? selectedFile.name : 'Click or Drag CSV here'}
                    </p>
                    <p className="text-[10px] text-brand-muted mt-1">Accepts comma-separated format only</p>
                  </div>
                </div>

                {uploadMsg && (
                  <div 
                    className={`p-3 rounded-xl border text-xs font-semibold ${
                      uploadMsg.type === 'success' 
                        ? 'bg-risk-lowBg text-risk-low border-risk-low/20' 
                        : 'bg-risk-extremeBg text-risk-extreme border-risk-extreme/20'
                    }`}
                  >
                    {uploadMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl font-bold transition-all duration-150 flex items-center justify-center space-x-2 text-xs disabled:opacity-50 shadow-[0_0_16px_rgba(255,107,53,0.2)]"
                >
                  <span>{uploading ? 'Processing File...' : 'Upload & Sync Observations'}</span>
                </button>
              </form>
            </div>
          </Card>
        )}

        {/* Tab 3: Model Retraining */}
        {activeTab === 'retraining' && (
          <Card
            title="ML Prediction Predictor Retrain Portal"
            subtitle="Trigger standard XGBoost model optimization pipeline"
            accent
          >
            <div className="space-y-6 max-w-xl">
              <div className="p-4 bg-risk-lowBg/5 border border-risk-low/20 rounded-2xl flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-risk-low flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-brand-text">Active Prediction Engine</p>
                  <p className="text-[10px] text-brand-muted leading-relaxed mt-0.5">
                    Currently running: <span className="font-bold text-risk-low">v2.0-XGBoost</span>. Evaluated test set accuracy: <span className="font-bold text-brand-text">89.2%</span>. Sync observations are fully indexed.
                  </p>
                </div>
              </div>

              {retrainStatus ? (
                <div className="space-y-4 border border-brand-border rounded-2xl p-5 bg-brand-surface/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-brand-text">Pipeline Execution: <span className="font-mono text-brand-primary">{retrainStatus.job_id || 'retrain_job'}</span></span>
                    <span className="font-bold uppercase px-2 py-0.5 bg-risk-moderateBg text-risk-moderate border border-risk-moderate/20 rounded-md text-[10px]">{retrainStatus.status}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-brand-surface rounded-full h-2.5 overflow-hidden border border-brand-border">
                    <div 
                      className="h-full rounded-full bg-heat-gradient transition-all duration-500 shadow-glow" 
                      style={{ width: `${retrainStatus.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-brand-muted">
                    <span>Model ID: {retrainStatus.active_model}</span>
                    <span>Progress: <span className="font-bold text-brand-text">{retrainStatus.progress}%</span></span>
                  </div>

                  {retrainStatus.status === 'COMPLETED' && (
                    <div className="p-3 bg-risk-lowBg text-risk-low border border-risk-low/20 text-xs font-semibold rounded-xl flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Retraining pipeline complete! Accuracy optimized to: <span className="font-black text-brand-text">{(retrainStatus.accuracy * 100).toFixed(1)}%</span>.</span>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  disabled={triggering}
                  onClick={handleTriggerRetraining}
                  className="px-6 py-3 bg-brand-surface hover:bg-brand-border border border-brand-border text-brand-text rounded-xl font-bold transition-all duration-150 flex items-center space-x-2 text-xs cursor-pointer"
                >
                  <Play className="h-4 w-4 text-risk-low" />
                  <span>{triggering ? 'Queuing Task...' : 'Trigger Model Retrain'}</span>
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Tab 4: System Logs */}
        {activeTab === 'logs' && (
          <Card
            title="Audited System Logs"
            subtitle="Paginated live feed of user operations and fetch crons"
            accent
          >
            {loadingLogs ? (
              <p className="text-sm text-brand-muted text-center py-8">Loading audit trail...</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-brand-border bg-brand-surface/40 hover:bg-brand-surface/80 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-3 transition-colors duration-150">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-surface border border-brand-border rounded-lg text-brand-muted flex-shrink-0">
                        <Terminal className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-text">{log.action}</span>
                          <span className="text-[10px] text-brand-muted font-mono bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border">IP: {log.ip_address}</span>
                        </div>
                        <p className="text-brand-muted mt-1 leading-relaxed text-[11px] font-sans">{log.details}</p>
                      </div>
                    </div>

                    <div className="text-[10px] text-brand-muted text-right flex-shrink-0 self-end sm:self-auto font-mono bg-brand-surface/60 px-2 py-1 rounded border border-brand-border/40">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-brand-border">
                  <button
                    disabled={logsPage === 1}
                    onClick={() => setLogsPage(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2 bg-brand-surface text-brand-text hover:bg-brand-border border border-brand-border rounded-xl text-xs font-bold disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-brand-muted font-medium">
                    Page <span className="font-bold text-brand-text">{logsPage}</span> of <span className="font-bold text-brand-text">{logsTotalPages}</span>
                  </span>
                  <button
                    disabled={logsPage === logsTotalPages}
                    onClick={() => setLogsPage(prev => Math.min(logsTotalPages, prev + 1))}
                    className="px-4 py-2 bg-brand-surface text-brand-text hover:bg-brand-border border border-brand-border rounded-xl text-xs font-bold disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
