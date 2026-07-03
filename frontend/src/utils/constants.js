// All 10 Karnataka districts with lat/lng centroids
export const KARNATAKA_DISTRICTS = [
  { id: 1,  name: 'Bangalore',  lat: 12.9716, lng: 77.5946 },
  { id: 2,  name: 'Mysore',     lat: 12.2958, lng: 76.6394 },
  { id: 3,  name: 'Hubli',      lat: 15.3647, lng: 75.1240 },
  { id: 4,  name: 'Mangalore',  lat: 12.9141, lng: 74.8560 },
  { id: 5,  name: 'Belgaum',    lat: 15.8497, lng: 74.4977 },
  { id: 6,  name: 'Gulbarga',   lat: 17.3297, lng: 76.8343 },
  { id: 7,  name: 'Davanagere', lat: 14.4644, lng: 75.9218 },
  { id: 8,  name: 'Bellary',    lat: 15.1394, lng: 76.9214 },
  { id: 9,  name: 'Bijapur',    lat: 16.8302, lng: 75.7100 },
  { id: 10, name: 'Shimoga',    lat: 13.9299, lng: 75.5681 },
];

/** Returns hex colour for a given risk level string */
export const getRiskColor = (riskLevel) => {
  switch (riskLevel?.toUpperCase()) {
    case 'LOW':      return '#16a34a';
    case 'MODERATE': return '#ca8a04';
    case 'HIGH':     return '#ea580c';
    case 'EXTREME':  return '#dc2626';
    default:         return '#9c8880';
  }
};

/** Returns Tailwind background + text classes for a risk-level badge */
export const getRiskBadgeClass = (riskLevel) => {
  switch (riskLevel?.toUpperCase()) {
    case 'LOW':      return 'bg-heatwave-normal  text-white';
    case 'MODERATE': return 'bg-heatwave-watch   text-white';
    case 'HIGH':     return 'bg-heatwave-warning text-white';
    case 'EXTREME':  return 'bg-heatwave-extreme text-white';
    default:         return 'bg-outline          text-white';
  }
};

/** Returns a lighter background container class for cards */
export const getRiskCardClass = (riskLevel) => {
  switch (riskLevel?.toUpperCase()) {
    case 'LOW':      return 'border-l-4 border-heatwave-normal  bg-surface';
    case 'MODERATE': return 'border-l-4 border-heatwave-watch   bg-surface';
    case 'HIGH':     return 'border-l-4 border-heatwave-warning bg-surface';
    case 'EXTREME':  return 'border-l-4 border-heatwave-extreme bg-surface';
    default:         return 'border-l-4 border-outline          bg-surface';
  }
};

/** Weather icon emoji by risk tier */
export const getRiskIcon = (riskLevel) => {
  switch (riskLevel?.toUpperCase()) {
    case 'LOW':      return '🌤️';
    case 'MODERATE': return '☀️';
    case 'HIGH':     return '🌡️';
    case 'EXTREME':  return '🔥';
    default:         return '🌤️';
  }
};

/** Format date string to readable "Jun 28" */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
};

/** Format date + time */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
