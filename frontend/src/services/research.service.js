import axiosClient from './axiosClient';

export const researchService = {
  getPredictions: async (districtId) => {
    const response = await axiosClient.get('/research/predictions', {
      params: { district_id: districtId },
    });
    return response.data;
  },

  getMetrics: async () => {
    const response = await axiosClient.get('/research/metrics');
    return response.data;
  },
};
