import axiosClient from './axiosClient';

export const adminService = {
  getStats: async () => {
    const response = await axiosClient.get('/admin/stats');
    return response.data;
  },
  triggerPipeline: async () => {
    const response = await axiosClient.post('/admin/pipeline/trigger');
    return response.data;
  }
};
