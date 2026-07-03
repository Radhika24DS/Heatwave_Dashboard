import axiosClient from './axiosClient';

export const districtService = {
  getAll: async () => {
    const response = await axiosClient.get('/districts');
    return response.data;
  },
};
