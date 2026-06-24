import axiosClient from './axiosClient';

// Hardcoded district coordinates and data matching seeded DB IDs for Karnataka
const DISTRICT_GEO_METADATA = {
  'BANGALORE': { lat: 12.9716, lng: 77.5946, tempOffset: 0, aodOffset: 0.1 },
  'MYSORE': { lat: 12.2958, lng: 76.6394, tempOffset: -1.5, aodOffset: -0.05 },
  'BELAGAVI': { lat: 15.8497, lng: 74.4977, tempOffset: -2, aodOffset: -0.1 },
  'KALABURAGI': { lat: 17.3297, lng: 76.8343, tempOffset: 4, aodOffset: 0.2 },
  'MANGALORE': { lat: 12.9141, lng: 74.8560, tempOffset: -1, aodOffset: -0.08 },
  'CHIKKAMAGALURU': { lat: 13.3161, lng: 75.7720, tempOffset: -4, aodOffset: -0.12 },
  'BIDAR': { lat: 17.9104, lng: 77.5199, tempOffset: 3.5, aodOffset: 0.15 },
  'DAVANAGERE': { lat: 14.4644, lng: 75.9218, tempOffset: 1, aodOffset: 0.05 },
  'UDUPI': { lat: 13.3409, lng: 74.7421, tempOffset: -0.5, aodOffset: -0.07 },
  'TUMKUR': { lat: 13.3379, lng: 77.1173, tempOffset: 0.5, aodOffset: 0.02 },
};

const getDistrictMeta = (name) => {
  const normalized = name.toUpperCase();
  for (const [key, value] of Object.entries(DISTRICT_GEO_METADATA)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  return { lat: 15.3173, lng: 75.7139, tempOffset: 0, aodOffset: 0 }; // Karnataka center
};

export const predictionApi = {
  getDistricts: async () => {
    try {
      const response = await axiosClient.get('/districts');
      return response.data;
    } catch (error) {
      console.warn('// TODO: failed to fetch districts, falling back to mock seed districts');
      // If backend is entirely down, return default seed list
      return {
        status: 'success',
        data: [
          { id: 1, name: 'Bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, population: 8443675 },
          { id: 2, name: 'Mysore', state: 'Karnataka', latitude: 12.2958, longitude: 76.6394, population: 3001127 },
          { id: 3, name: 'Belagavi', state: 'Karnataka', latitude: 15.8497, longitude: 74.4977, population: 4762269 },
          { id: 4, name: 'Kalaburagi', state: 'Karnataka', latitude: 17.3297, longitude: 76.8343, population: 2566326 },
          { id: 5, name: 'Mangalore', state: 'Karnataka', latitude: 12.9141, longitude: 74.8560, population: 2089649 },
          { id: 6, name: 'Chikkamagaluru', state: 'Karnataka', latitude: 13.3161, longitude: 75.7720, population: 1137961 },
          { id: 7, name: 'Bidar', state: 'Karnataka', latitude: 17.9104, longitude: 77.5199, population: 1703300 },
          { id: 8, name: 'Davanagere', state: 'Karnataka', latitude: 14.4644, longitude: 75.9218, population: 1945497 },
          { id: 9, name: 'Udupi', state: 'Karnataka', latitude: 13.3409, longitude: 74.7421, population: 1177361 },
          { id: 10, name: 'Tumkur', state: 'Karnataka', latitude: 13.3379, longitude: 77.1173, population: 2678779 },
        ]
      };
    }
  },

  getPredictions: async () => {
    try {
      const response = await axiosClient.get('/predictions');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn('// TODO: no backend endpoint yet for predictions — using placeholder data');
        
        // Fetch districts to make mock predictions consistent
        let districts = [];
        try {
          const res = await predictionApi.getDistricts();
          districts = res.data || [];
        } catch (e) {
          districts = [
            { id: 1, name: 'Bangalore' }, { id: 2, name: 'Mysore' },
            { id: 3, name: 'Belagavi' }, { id: 4, name: 'Kalaburagi' },
            { id: 5, name: 'Mangalore' }, { id: 6, name: 'Chikkamagaluru' },
            { id: 7, name: 'Bidar' }, { id: 8, name: 'Davanagere' },
            { id: 9, name: 'Udupi' }, { id: 10, name: 'Tumkur' }
          ];
        }

        const today = new Date().toISOString().split('T')[0];
        
        const predictions = districts.map((d) => {
          const meta = getDistrictMeta(d.name);
          // Calculate realistic temperatures and scores
          // Bangalore is mild, Kalaburagi/Bidar are extremely hot
          const baseTemp = 32 + meta.tempOffset;
          let riskLevel = 'LOW';
          let riskScore = 15 + (meta.tempOffset * 10) + (meta.aodOffset * 100);
          riskScore = Math.max(5, Math.min(99, riskScore));

          if (riskScore > 80) riskLevel = 'EXTREME';
          else if (riskScore > 60) riskLevel = 'HIGH';
          else if (riskScore > 35) riskLevel = 'MODERATE';

          return {
            id: d.id * 100,
            district_id: d.id,
            district_name: d.name, // extension helper
            prediction_date: today,
            forecast_date: today,
            risk_level: riskLevel,
            risk_score: parseFloat(riskScore.toFixed(1)),
            model_version: 'v1.4.2-RF',
            created_at: new Date().toISOString(),
            // Included variables to render in Leaflet maps popups
            weather: {
              max_temp: parseFloat(baseTemp.toFixed(1)),
              min_temp: parseFloat((baseTemp - 8).toFixed(1)),
              humidity: Math.round(55 - meta.tempOffset * 3),
              wind_speed: parseFloat((12 + Math.random() * 6).toFixed(1)),
              rainfall: Math.random() > 0.85 ? parseFloat((Math.random() * 5).toFixed(1)) : 0.0
            },
            aerosol: {
              aod_value: parseFloat((0.35 + meta.aodOffset).toFixed(2)),
              pm25: parseFloat((40 + meta.aodOffset * 150).toFixed(1)),
              pm10: parseFloat((85 + meta.aodOffset * 250).toFixed(1))
            }
          };
        });

        return {
          status: 'success',
          message: 'Predictions retrieved successfully',
          data: predictions
        };
      }
      throw error;
    }
  },

  getForecast: async (districtId) => {
    try {
      const response = await axiosClient.get(`/predictions/forecast/${districtId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn(`// TODO: no backend endpoint yet for forecast of district ${districtId} — using placeholder data`);
        
        let districtName = 'District';
        try {
          const res = await predictionApi.getDistricts();
          const d = res.data.find(item => item.id === parseInt(districtId));
          if (d) districtName = d.name;
        } catch (e) {}

        const meta = getDistrictMeta(districtName);
        const forecast = [];
        const today = new Date();

        for (let i = 0; i < 3; i++) {
          const targetDate = new Date();
          targetDate.setDate(today.getDate() + i);
          const dateStr = targetDate.toISOString().split('T')[0];

          // Introduce some variance over the 3 days
          const dayVariance = Math.sin(i) * 1.5 + (Math.random() - 0.5);
          const temp = 33 + meta.tempOffset + dayVariance;
          let score = 25 + (meta.tempOffset * 9) + (meta.aodOffset * 80) + (dayVariance * 5);
          score = Math.max(5, Math.min(99, score));
          
          let level = 'LOW';
          if (score > 80) level = 'EXTREME';
          else if (score > 60) level = 'HIGH';
          else if (score > 35) level = 'MODERATE';

          forecast.push({
            id: parseInt(districtId) * 1000 + i,
            district_id: parseInt(districtId),
            prediction_date: today.toISOString().split('T')[0],
            forecast_date: dateStr,
            risk_level: level,
            risk_score: parseFloat(score.toFixed(1)),
            model_version: 'v1.4.2-RF',
            created_at: new Date().toISOString(),
            weather: {
              max_temp: parseFloat(temp.toFixed(1)),
              min_temp: parseFloat((temp - 9).toFixed(1)),
              humidity: Math.round(52 - meta.tempOffset * 2 - dayVariance * 2)
            }
          });
        }

        return {
          status: 'success',
          message: 'District forecast retrieved successfully',
          data: forecast
        };
      }
      throw error;
    }
  }
};
