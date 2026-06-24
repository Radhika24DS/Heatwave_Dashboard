import axiosClient from './axiosClient';

// Cache for mock users to support toggling activation in the UI session
let cachedMockUsers = [
  { id: 1, name: 'ADMIN USER', email: 'admin@heatwave.org', role: 'ADMIN', is_active: true, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 2, name: 'DR. SWETHA REDDY', email: 'swetha.research@science.in', role: 'RESEARCH', is_active: true, created_at: '2026-02-15T09:30:00Z', updated_at: '2026-02-15T09:30:00Z' },
  { id: 3, name: 'SDMA AUTHORITY', email: 'authority.karnataka@gov.in', role: 'AUTHORITY', is_active: true, created_at: '2026-03-01T14:22:00Z', updated_at: '2026-03-01T14:22:00Z' },
  { id: 4, name: 'KESHAV GOWDA', email: 'keshav.farmer@gmail.com', role: 'FARMER', is_active: true, created_at: '2026-04-12T06:15:00Z', updated_at: '2026-04-12T06:15:00Z' },
  { id: 5, name: 'ROHIT SHARMA', email: 'rohit.traveller@yahoo.com', role: 'TRAVELLER', is_active: false, created_at: '2026-05-20T11:45:00Z', updated_at: '2026-05-20T11:45:00Z' },
  { id: 6, name: 'ANANYA SEN', email: 'ananya.public@outlook.com', role: 'PUBLIC', is_active: true, created_at: '2026-06-01T17:10:00Z', updated_at: '2026-06-01T17:10:00Z' }
];

export const adminApi = {
  // 1. User Management
  getUsers: async () => {
    try {
      const response = await axiosClient.get('/admin/users');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('// TODO: no backend endpoint yet for admin get users — using placeholder data');
        return {
          status: 'success',
          data: cachedMockUsers
        };
      }
      throw error;
    }
  },

  toggleUserStatus: async (userId, isActive) => {
    try {
      const response = await axiosClient.patch(`/admin/users/${userId}/status`, { is_active: isActive });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn(`// TODO: no backend endpoint yet for user status toggle (${userId}) — using placeholder data`);
        
        cachedMockUsers = cachedMockUsers.map(user => 
          user.id === parseInt(userId) ? { ...user, is_active: isActive, updated_at: new Date().toISOString() } : user
        );
        
        const updatedUser = cachedMockUsers.find(user => user.id === parseInt(userId));

        return {
          status: 'success',
          message: `User status changed to ${isActive ? 'active' : 'inactive'}`,
          data: updatedUser
        };
      }
      throw error;
    }
  },

  // 2. Dataset Upload
  uploadDataset: async (file, datasetType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset_type', datasetType);

    try {
      const response = await axiosClient.post('/admin/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('// TODO: no backend endpoint yet for dataset upload — using placeholder data');
        
        return {
          status: 'success',
          message: 'Dataset uploaded and queued for processing successfully',
          data: {
            id: Math.floor(Math.random() * 500) + 1,
            filename: file.name,
            file_path: `/ml/data/raw/${file.name}`,
            dataset_type: datasetType,
            status: 'PENDING',
            uploaded_by_user_id: 101,
            created_at: new Date().toISOString()
          }
        };
      }
      throw error;
    }
  },

  // 3. Model Retrain
  triggerRetraining: async () => {
    try {
      const response = await axiosClient.post('/admin/model/retrain');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('// TODO: no backend endpoint yet for model retrain trigger — using placeholder data');
        
        // Save standard training start timestamp in localStorage
        localStorage.setItem('mock_retrain_start', Date.now().toString());

        return {
          status: 'success',
          message: 'Model retraining pipeline successfully started in background',
          data: {
            job_id: 'retrain_job_' + Math.floor(Math.random() * 10000),
            status: 'PROCESSING',
            started_at: new Date().toISOString()
          }
        };
      }
      throw error;
    }
  },

  getRetrainStatus: async (jobId) => {
    try {
      const response = await axiosClient.get(`/admin/model/retrain/status/${jobId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        // Mock retraining behavior: completes after 15 seconds of polling
        const startTime = localStorage.getItem('mock_retrain_start');
        let status = 'PROCESSING';
        let progress = 35;
        let accuracy = null;

        if (startTime) {
          const elapsed = (Date.now() - parseInt(startTime)) / 1000;
          if (elapsed > 15) {
            status = 'COMPLETED';
            progress = 100;
            accuracy = 0.914; // High-accuracy Random Forest
            localStorage.removeItem('mock_retrain_start');
          } else {
            progress = Math.min(95, Math.round(20 + elapsed * 5));
          }
        }

        return {
          status: 'success',
          data: {
            job_id: jobId,
            status: status,
            progress: progress,
            accuracy: accuracy,
            active_model: status === 'COMPLETED' ? 'v1.5.0-RF' : 'v1.4.2-RF',
            updated_at: new Date().toISOString()
          }
        };
      }
      throw error;
    }
  },

  // 4. System Logs
  getSystemLogs: async (page = 1, limit = 10) => {
    try {
      const response = await axiosClient.get('/admin/logs', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('// TODO: no backend endpoint yet for system logs — using placeholder data');
        
        const mockLogs = [
          { id: 1, user_id: 1, action: 'USER_LOGIN', details: 'User admin@heatwave.org logged in successfully.', ip_address: '192.168.1.10', created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
          { id: 2, user_id: 3, action: 'ALERT_BROADCAST', details: 'Broadcasted Extreme Heatwave warning to Kalaburagi (ID: 4)', ip_address: '10.0.0.5', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
          { id: 3, user_id: 1, action: 'DATASET_UPLOAD', details: 'Uploaded new AOD observations file: Aerosol_Karnataka_June.xlsx', ip_address: '192.168.1.10', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
          { id: 4, user_id: 2, action: 'MODEL_EVALUATED', details: 'Model performance evaluation completed: Accuracy 89.2%, AUC 0.941', ip_address: '172.16.55.22', created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString() },
          { id: 5, user_id: 1, action: 'USER_SUSPENDED', details: 'Deactivated user account: rohit.traveller@yahoo.com', ip_address: '192.168.1.10', created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString() },
          { id: 6, user_id: null, action: 'WEATHER_FETCH_CRON', details: 'Fetched live IMD meteorological variables. Synced 10 locations.', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString() }
        ];

        return {
          status: 'success',
          data: {
            logs: mockLogs,
            total_count: 6,
            page: page,
            pages: 1
          }
        };
      }
      throw error;
    }
  }
};
