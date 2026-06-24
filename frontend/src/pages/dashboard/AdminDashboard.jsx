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
          active_model: 'v1.4.2-RF'
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

  return (
    <div className="p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Admin Operations Dashboard</h1>
          <p className="text-sm text-brand-muted mt-1">Configure user roles, upload physical sensor observations, and retrain risk predictors</p>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex space-x-2 border-b border-brand-border/40 pb-px">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-bold text-sm transition-all duration-150 ${
            activeTab === 'users'
              ? 'border-risk-high text-risk-high bg-brand-slate/10'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('datasets')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-bold text-sm transition-all duration-150 ${
            activeTab === 'datasets'
              ? 'border-risk-high text-risk-high bg-brand-slate/10'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          <span>Dataset Feeds</span>
        </button>

        <button
          onClick={() => setActiveTab('retraining')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-bold text-sm transition-all duration-150 ${
            activeTab === 'retraining'
              ? 'border-risk-high text-risk-high bg-brand-slate/10'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>Retrain Model</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-bold text-sm transition-all duration-150 ${
            activeTab === 'logs'
              ? 'border-risk-high text-risk-high bg-brand-slate/10'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>System Logs</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-2xl">
        
        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-bold text-brand-text">Active User Accounts</h3>
                <p className="text-xs text-brand-muted mt-0.5">Toggle active statuses or audit registered roles</p>
              </div>
            </div>

            {userMsg && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl">
                {userMsg}
              </div>
            )}

            {loadingUsers ? (
              <p className="text-sm text-brand-muted text-center py-6">Loading user records...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border/40 text-brand-muted uppercase font-bold text-[9px] tracking-wider">
                      <th className="pb-3 pl-2">User Name</th>
                      <th className="pb-3">Email Address</th>
                      <th className="pb-3">Role Assigned</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((user) => (
                      <tr key={user.id} className="border-b border-brand-border/20 hover:bg-brand-slate/10 transition-colors duration-150">
                        <td className="py-3 pl-2 font-bold text-brand-text">{user.name}</td>
                        <td className="py-3 text-brand-muted">{user.email}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-brand-slate border border-brand-border rounded text-[10px] font-bold text-brand-text uppercase">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => handleToggleUser(user.id, user.is_active)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold ${
                              user.is_active 
                                ? 'text-red-500 hover:bg-red-500/10 border-red-500/20' 
                                : 'text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20'
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
          </div>
        )}

        {/* Tab 2: Dataset Upload */}
        {activeTab === 'datasets' && (
          <div className="max-w-md space-y-6">
            <div>
              <h3 className="text-lg font-bold text-brand-text">Aerosol & Weather Feed Loader</h3>
              <p className="text-xs text-brand-muted mt-0.5">Upload IMD weather records or satellite AOD measurements (CSV format)</p>
            </div>

            <form onSubmit={handleUploadDataset} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                  Dataset Category
                </label>
                <select
                  value={datasetType}
                  onChange={(e) => setDatasetType(e.target.value)}
                  className="w-full bg-brand-slate border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none"
                >
                  <option value="AEROSOL">Aerosol Optical Depth (AOD)</option>
                  <option value="WEATHER">IMD Meteorological Observations</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                  CSV Data File
                </label>
                <div className="border border-dashed border-brand-border rounded-2xl p-6 text-center cursor-pointer hover:bg-brand-slate/20 transition-all duration-150 relative">
                  <input
                    required
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="h-8 w-8 text-brand-muted mx-auto mb-2" />
                  <p className="text-xs text-brand-text font-bold">
                    {selectedFile ? selectedFile.name : 'Click or Drag CSV here'}
                  </p>
                  <p className="text-[10px] text-brand-muted mt-1">Accepts comma-separated format only</p>
                </div>
              </div>

              {uploadMsg && (
                <div 
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    uploadMsg.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {uploadMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full py-2.5 bg-risk-high hover:bg-orange-500 text-brand-dark rounded-xl font-bold transition-all duration-150 flex items-center justify-center space-x-2 text-xs disabled:bg-brand-border"
              >
                <span>{uploading ? 'Processing File...' : 'Upload & Sync Observations'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Model Retraining */}
        {activeTab === 'retraining' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-lg font-bold text-brand-text">ML Prediction Predictor Retrain Portal</h3>
              <p className="text-xs text-brand-muted mt-0.5">Trigger standard Random Forest model optimization pipeline</p>
            </div>

            <div className="p-4 bg-brand-slate/40 border border-brand-border/60 rounded-2xl flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-risk-low flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-brand-text">Active Prediction Engine</p>
                <p className="text-[10px] text-brand-muted leading-relaxed mt-0.5">
                  Currently running: <span className="font-bold text-brand-text">v1.4.2-RF</span>. Evaluated test set accuracy: 89.2%. Sync observations are fully indexed.
                </p>
              </div>
            </div>

            {retrainStatus ? (
              <div className="space-y-4 border border-brand-border/60 rounded-2xl p-5 bg-brand-navy/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-brand-text">Pipeline Execution: {retrainStatus.job_id || 'retrain_job'}</span>
                  <span className="font-bold uppercase text-risk-moderate">{retrainStatus.status}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-brand-slate rounded-full h-3 overflow-hidden border border-brand-border">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-risk-moderate to-risk-high transition-all duration-500" 
                    style={{ width: `${retrainStatus.progress}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-brand-muted">
                  <span>Model: {retrainStatus.active_model}</span>
                  <span>Progress: {retrainStatus.progress}%</span>
                </div>

                {retrainStatus.status === 'COMPLETED' && (
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>retraining pipeline complete! Accuracy bumped to: {(retrainStatus.accuracy * 100).toFixed(1)}%.</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled={triggering}
                onClick={handleTriggerRetraining}
                className="px-6 py-3 bg-brand-slate text-brand-text hover:bg-brand-border border border-brand-border rounded-xl font-bold transition-all duration-150 flex items-center space-x-2 text-xs"
              >
                <Play className="h-4 w-4 text-risk-low" />
                <span>{triggering ? 'Queuing Task...' : 'Trigger Model Retrain'}</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 4: System Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-bold text-brand-text">Audited System Logs</h3>
                <p className="text-xs text-brand-muted mt-0.5">Paginated live feed of user operations and fetch crons</p>
              </div>
            </div>

            {loadingLogs ? (
              <p className="text-sm text-brand-muted text-center py-6">Loading audit trail...</p>
            ) : (
              <div className="space-y-2.5">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl border border-brand-border/40 bg-brand-slate/20 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2">
                    <div className="flex items-start space-x-3">
                      <Terminal className="h-4.5 w-4.5 text-brand-muted flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-brand-text">{log.action}</span>
                          <span className="text-[10px] text-brand-muted">• IP: {log.ip_address}</span>
                        </div>
                        <p className="text-brand-muted mt-1 leading-relaxed text-[11px]">{log.details}</p>
                      </div>
                    </div>

                    <div className="text-[10px] text-brand-muted text-right flex-shrink-0 self-end sm:self-auto font-medium">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-brand-border/40">
                  <button
                    disabled={logsPage === 1}
                    onClick={() => setLogsPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 bg-brand-slate text-brand-text hover:bg-brand-border border border-brand-border rounded-lg text-xs font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-brand-muted">
                    Page <span className="font-bold text-brand-text">{logsPage}</span> of {logsTotalPages}
                  </span>
                  <button
                    disabled={logsPage === logsTotalPages}
                    onClick={() => setLogsPage(prev => Math.min(logsTotalPages, prev + 1))}
                    className="px-3 py-1.5 bg-brand-slate text-brand-text hover:bg-brand-border border border-brand-border rounded-lg text-xs font-semibold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
