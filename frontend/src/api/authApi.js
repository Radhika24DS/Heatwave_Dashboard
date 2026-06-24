import axiosClient from './axiosClient';

// Helper to generate a valid base64-encoded mock JWT token for testing decode
const generateMockJwt = (user) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payload = btoa(JSON.stringify({
    sub: user.id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signature = "mock_signature_hash";
  return `${header}.${payload}.${signature}`;
};

export const authApi = {
  login: async (email, password) => {
    try {
      // Send authentic request
      const response = await axiosClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // Fallback if endpoint is not built (404) or server is unreachable
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('// TODO: no backend endpoint yet for auth login — using placeholder data');
        
        // Infer role based on email context for testing/demo
        let role = 'PUBLIC';
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes('admin')) role = 'ADMIN';
        else if (lowerEmail.includes('farmer')) role = 'FARMER';
        else if (lowerEmail.includes('traveller')) role = 'TRAVELLER';
        else if (lowerEmail.includes('research')) role = 'RESEARCH';
        else if (lowerEmail.includes('authority')) role = 'AUTHORITY';

        const user = {
          id: 101,
          name: email.split('@')[0].toUpperCase(),
          email: email,
          role: role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const access_token = generateMockJwt(user);
        const refresh_token = 'mock_refresh_token_for_' + user.role;

        return {
          status: 'success',
          message: 'Mock login successful',
          data: {
            access_token,
            refresh_token,
            user,
          }
        };
      }
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('// TODO: no backend endpoint yet for auth register — using placeholder data');
        
        // Limit roles to public ones as requested in constraints
        const role = userData.role || 'PUBLIC';
        const allowedPublicRoles = ['PUBLIC', 'FARMER', 'TRAVELLER', 'RESEARCH'];
        const validatedRole = allowedPublicRoles.includes(role) ? role : 'PUBLIC';

        const user = {
          id: Math.floor(Math.random() * 1000) + 200,
          name: userData.name,
          email: userData.email,
          role: validatedRole,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return {
          status: 'success',
          message: 'Mock registration successful',
          data: user
        };
      }
      throw error;
    }
  }
};
