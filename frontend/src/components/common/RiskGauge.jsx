import React from 'react';

export default function RiskGauge({ score, percent }) {
  const rotation = (percent / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface rounded-card shadow-sm border border-outline-variant">
      <h3 className="text-sm font-bold text-on-surface-variant mb-4 uppercase tracking-wider">Risk Level</h3>
      
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Gauge Background */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[24px] border-surface-variant" />
        
        {/* Gauge Fill (Gradient) */}
        <div 
          className="absolute top-0 left-0 w-48 h-48 rounded-full border-[24px] border-transparent risk-gradient origin-center"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
        />
        
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-20 bg-on-surface origin-bottom transform -translate-x-1/2 transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
        
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-on-surface rounded-full transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="mt-4 text-center">
        <span className="text-3xl font-black text-primary">{percent.toFixed(1)}%</span>
        <p className="text-xs text-outline mt-1">Risk Score: {score.toFixed(3)}</p>
      </div>
    </div>
  );
}
