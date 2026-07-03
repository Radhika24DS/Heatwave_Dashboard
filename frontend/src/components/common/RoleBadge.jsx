import React from 'react';

export default function RoleBadge({ role }) {
  const getColors = () => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-[#4a0072] text-[#f3e5f5]';
      case 'AUTHORITY': return 'bg-error text-on-error';
      case 'RESEARCH': return 'bg-secondary text-on-secondary';
      case 'FARMER': return 'bg-tertiary-container text-on-tertiary-container';
      case 'TRAVELLER': return 'bg-primary-container text-on-primary-container';
      case 'PUBLIC':
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getColors()}`}>
      {role}
    </span>
  );
}
