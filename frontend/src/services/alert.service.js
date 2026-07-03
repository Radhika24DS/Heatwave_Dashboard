import axiosClient from './axiosClient';

export const alertService = {
  getAlerts: async ({ districtId, status } = {}) => {
    const response = await axiosClient.get('/alerts', {
      params: {
        ...(districtId && { district_id: districtId }),
        ...(status     && { status }),
      },
    });
    return response.data;
  },

  resolveAlert: async (alertId) => {
    const response = await axiosClient.patch(`/alerts/${alertId}/resolve`);
    return response.data;
  },
};
