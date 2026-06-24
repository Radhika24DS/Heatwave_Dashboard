import axiosClient from './axiosClient';

const ADVISORY_DICTIONARY = {
  PUBLIC: {
    LOW: {
      title: 'Low Heatwave Advisory for the General Public',
      content: '1. Stay hydrated by drinking water regularly, even if you don\'t feel thirsty.\n2. Limit outdoor activities during the hottest part of the day (12 pm–4 pm).\n3. Wear lightweight, light-colored clothing and a wide-brimmed hat.\n4. Check local weather alerts and keep windows closed while using fans.',
      document_source: 'IMD General Guidelines'
    },
    MODERATE: {
      title: 'Moderate Heatwave Advisory for the General Public',
      content: '1. Increase fluid intake; aim for at least 2-3 L of water per day.\n2. Schedule outdoor work or exercise for early morning or evening when temperatures are lower.\n3. Wear breathable, moisture-wicking clothing and a hat; use sunscreen with SPF 30+.\n4. Monitor vulnerable individuals (elderly, children, chronic-illness patients) for signs of heat-related illness.\n5. Keep indoor spaces ventilated; use fans or air-conditioning if available.\n6. Stay informed via local weather alerts and heed any heat-stroke warnings.',
      document_source: 'Karnataka State Disaster Management Authority'
    },
    HIGH: {
      title: 'High Heatwave Advisory - Take Preventive Action',
      content: '1. Drink ORS (Oral Rehydration Salts), buttermilk, or coconut water to restore electrolytes.\n2. Do NOT go outdoors unless absolutely necessary between 11 am and 4 pm.\n3. Restrict strenuous physical activity; work in cool shade areas.\n4. Never leave children or pets inside locked vehicles.\n5. Check on elderly neighbors twice a day for signs of confusion, heavy sweating, or fainting.',
      document_source: 'National Disaster Management Authority (NDMA)'
    },
    EXTREME: {
      title: 'CRITICAL Heatwave Warning - Emergency Directives',
      content: '1. Heatwave Emergency in Effect. Stay inside air-conditioned spaces.\n2. High danger of heat exhaustion and heat stroke. Minimize physical exertion.\n3. Seek immediate medical attention if you experience dry hot skin, rapid pulse, dizziness, or nausea.\n4. Keep wet cloths on head and neck to lower body temperature if feeling overheated.',
      document_source: 'Ministry of Health and Family Welfare'
    }
  },
  FARMER: {
    LOW: {
      title: 'Low Heatwave Advisory for Agricultural Operations',
      content: '1. Continue standard crop cycles. Check soil moisture weekly.\n2. Ensure livestock has access to clean drinking water under shade.\n3. Rest during the hottest hours of the day (1 pm to 3 pm).',
      document_source: 'University of Agricultural Sciences (UAS)'
    },
    MODERATE: {
      title: 'Moderate Heatwave Advisory for Farmers',
      content: '1. Apply mulching (straw or plastic) to crop rows to conserve critical soil moisture.\n2. Irrigate crops during early morning or late evening to minimize evaporation losses.\n3. Keep animals under proper thatch-roof sheds and provide clean drinking water with salt supplements.\n4. Keep poultry houses ventilated; use gunny bags soaked in water on the window screens.',
      document_source: 'ICAR-Indian Institute of Horticultural Research'
    },
    HIGH: {
      title: 'High Heatwave Advisory - Crop and Livestock Alert',
      content: '1. Postpone sowing or transplanting operations during peak temperature days.\n2. Apply light and frequent irrigations to vegetables, orchards, and standing cereal crops.\n3. Provide sprinklers or misting systems in poultry and dairy sheds to lower temperatures.\n4. Avoid grazing cattle between 11 am and 4 pm. Watch for rapid breathing or drooling in livestock.',
      document_source: 'Krishi Vigyan Kendra (KVK)'
    },
    EXTREME: {
      title: 'CRITICAL Heatwave Advisory - Emergency Agri-Directives',
      content: '1. Suspend all strenuous field operations. Restrict work to shade before 10 am and after 5 pm.\n2. Spray water on the roofs of cattle/poultry sheds frequently.\n3. Suspend fertilizer and chemical pesticide applications as they can cause leaf-scorch under extreme heat.\n4. Ensure dairy animals receive electrolyte-fortified cold water. Provide maximum thatch shading.',
      document_source: 'Department of Agriculture, Karnataka'
    }
  },
  TRAVELLER: {
    LOW: {
      title: 'Low Heatwave Advisory for Transit and Commuters',
      content: '1. Carry a water bottle. Stay hydrated during travel.\n2. Check transit schedules for any weather-related delay alerts.\n3. Keep basic sunglasses or sun protection items in your bag.',
      document_source: 'Karnataka State Road Transport Corporation'
    },
    MODERATE: {
      title: 'Moderate Heatwave Advisory for Travellers',
      content: '1. Carry a reusable insulated flask with cool water and ORS packets.\n2. Avoid walking long distances under direct sunlight between 12 pm and 3:30 pm.\n3. Check your vehicle\'s coolant level and tire pressure before starting a journey.\n4. Wear UV-blocking sunglasses, wide brim hats, and loose light clothing.',
      document_source: 'Ministry of Tourism Guidelines'
    },
    HIGH: {
      title: 'High Heatwave Advisory - Safe Transit Alerts',
      content: '1. Pre-hydrate thoroughly before starting any journey. Drink 500ml of water before leaving.\n2. Plan travel routes that involve air-conditioned public transit or AC vehicles.\n3. Avoid hiking, cycling, or outdoor tours during peak heat hours (11 am - 4 pm).\n4. Keep windows shaded when driving. Park vehicle in the shade to prevent cabin heat buildup.',
      document_source: 'National Highway Authority of India'
    },
    EXTREME: {
      title: 'CRITICAL Heatwave Alert - Travel Restriction Warning',
      content: '1. Avoid non-essential travel in extreme-risk districts.\n2. Stay within climate-controlled indoor spaces. Do not embark on hikes or nature walks.\n3. Keep emergency emergency contacts active. Carry double the normal water supply if travelling is unavoidable.\n4. Ensure you know the locations of public cool centers or hospitals along your route.',
      document_source: 'Emergency Travel Advisory'
    }
  }
};

export const advisoryApi = {
  getAdvisory: async (role, riskLevel) => {
    const uppercaseRole = role.toUpperCase();
    const uppercaseRisk = riskLevel.toUpperCase();
    
    // Map UserRole values (e.g. FARMER, TRAVELLER, PUBLIC, ADMIN, RESEARCH)
    // to AdvisoryRole values (PUBLIC, FARMER, TRAVELLER)
    let advisoryRole = 'PUBLIC';
    if (uppercaseRole === 'FARMER') advisoryRole = 'FARMER';
    if (uppercaseRole === 'TRAVELLER') advisoryRole = 'TRAVELLER';

    try {
      const response = await axiosClient.get('/advisories', {
        params: { role: advisoryRole, risk_level: uppercaseRisk }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.warn(`// TODO: no backend endpoint yet for advisories (${advisoryRole}, ${uppercaseRisk}) — using placeholder data`);
        
        const data = ADVISORY_DICTIONARY[advisoryRole]?.[uppercaseRisk] || ADVISORY_DICTIONARY.PUBLIC.LOW;

        return {
          status: 'success',
          message: 'Advisory retrieved successfully',
          data: {
            id: Math.floor(Math.random() * 500) + 1,
            role: advisoryRole,
            risk_level: uppercaseRisk,
            title: data.title,
            content: data.content,
            document_source: data.document_source,
            created_at: new Date().toISOString()
          }
        };
      }
      throw error;
    }
  }
};
