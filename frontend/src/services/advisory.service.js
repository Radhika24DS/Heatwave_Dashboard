import axiosClient from './axiosClient';

export const advisoryService = {
  /**
   * Get a RAG-powered heatwave advisory.
   * @param {string} query - The user's question
   * @param {string} role - User role (PUBLIC, FARMER, TRAVELLER, RESEARCH, AUTHORITY, ADMIN)
   * @param {string} districtName - District name for location context
   * @param {string} [severityTier='MODERATE'] - Current severity tier
   * @param {string} [alertLevel='MODERATE'] - Current alert level
   */
  getAdvisory: async (query, role, districtName, severityTier = 'MODERATE', alertLevel = 'MODERATE') => {
    const response = await axiosClient.post('/rag/advisory', {
      query,
      role: role || 'PUBLIC',
      district_name: districtName,
      severity_tier: severityTier,
      alert_level: alertLevel,
    });
    return response.data;
  },
};
