import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-4',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.medium} animate-spin rounded-full border-brand-border border-t-risk-high`}
        role="status"
        aria-label="loading"
      />
      {message && <p className="text-sm font-medium text-brand-muted">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
