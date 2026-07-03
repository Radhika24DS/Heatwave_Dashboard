import axiosClient from './axiosClient';

export const authService = {
  login: async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (data) => {
    const response = await axiosClient.post('/auth/register', data);
    return response.data;
  },
};
