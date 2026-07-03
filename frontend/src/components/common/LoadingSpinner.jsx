import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="animate-spin-slow w-12 h-12 border-4 border-surface-variant border-t-primary rounded-full" />
    </div>
  );
}
