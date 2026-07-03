import React from 'react';
import { AlertOctagon } from 'lucide-react';

export default function EmergencyBanner({ isActive, message }) {
  if (!isActive) return null;

  return (
    <div className="bg-error text-on-error w-full py-3 px-6 pulse-urgent flex justify-center items-center gap-4 z-50 sticky top-0 shadow-lg">
      <AlertOctagon size={24} className="animate-bounce" />
      <span className="font-bold text-sm tracking-wide uppercase">
        {message || "EXTREME HEATWAVE WARNING: TAKE IMMEDIATE PRECAUTIONS"}
      </span>
      <AlertOctagon size={24} className="animate-bounce" />
    </div>
  );
}
