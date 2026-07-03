import axiosClient from './axiosClient';

export const predictionService = {
  getPrediction: async (districtId, date) => {
    const response = await axiosClient.post('/predictions/forecast', {
      district_id: districtId,
      forecast_date: date,
    });
    return response.data;
  },

  /**
   * Fetch historical predictions.
   * @param {Object} [params]
   * @param {number} [params.days]       - number of past days (1-90), default 30
   * @param {number} [params.districtId] - filter by district ID
   */
  getHistory: async (params = {}) => {
    const query = {};
    if (params.days)       query.days        = params.days;
    if (params.districtId) query.district_id = params.districtId;
    const response = await axiosClient.get('/predictions/history', { params: query });
    return response.data;
  },
};
