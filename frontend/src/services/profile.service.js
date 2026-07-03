import axiosClient from './axiosClient';

export const profileService = {
  getProfile: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (updates) => {
    const response = await axiosClient.patch('/auth/profile', updates);
    return response.data;
  },

  changePassword: async ({ current_password, new_password }) => {
    const response = await axiosClient.post('/auth/change-password', {
      current_password,
      new_password,
    });
    return response.data;
  },
};
