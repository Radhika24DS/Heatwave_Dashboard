// src/components/common/AdvisoryCard.jsx
import React from 'react';
import { getRiskColorHex } from '../../utils/riskColor';
import { ShieldAlert, BookOpen, AlertTriangle } from 'lucide-react';

const AdvisoryCard = ({ advisory = {}, onDownloadReport }) => {
  const { title, content, role, risk_level, document_source } = advisory;
  const color = getRiskColorHex(risk_level);

  // Split guidelines by newline if formatted that way
  const guidelines = content ? content.split('\n') : [];

  return (
    <div className="bg-brand-navy/80 backdrop-blur-md border border-brand-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Risk status bar */}
      <div 
        className="absolute top-0 left-0 w-full h-1.5" 
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center space-x-3 mb-4">
        <div 
          className="p-2.5 rounded-xl border"
          style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}
        >
          {risk_level === 'EXTREME' || risk_level === 'HIGH' ? (
            <AlertTriangle className="h-6 w-6" style={{ color: color }} />
          ) : (
            <ShieldAlert className="h-6 w-6" style={{ color: color }} />
          )}
        </div>
        <div>
          <span 
            className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            {role || 'PUBLIC'} ADVISORY
          </span>
          <h3 className="text-lg font-bold text-brand-text mt-1">{title || 'Heatwave Mitigation Advisory'}</h3>
        </div>
      </div>

      {guidelines.length > 0 ? (
        <ul className="space-y-3 mb-6">
          {guidelines.map((line, idx) => (
            <li key={idx} className="flex items-start text-sm text-brand-text">
              <span className="mr-2 text-brand-muted">•</span>
              <span>{line.replace(/^\d+\.\s*/, '')}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-brand-muted mb-6">No advisory content currently available.</p>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-brand-border/30 pt-4 gap-4">
        {document_source && (
          <div className="flex items-center space-x-2 text-xs text-brand-muted">
            <BookOpen className="h-4 w-4" />
            <span>Source: <span className="font-semibold text-brand-text">{document_source}</span></span>
          </div>
        )}
        
        {onDownloadReport && (
          <button
            onClick={onDownloadReport}
            className="px-4 py-2 text-xs font-bold text-brand-text hover:bg-brand-border bg-brand-slate border border-brand-border rounded-xl transition-all duration-150 flex items-center space-x-2 self-end sm:self-auto"
          >
            <span>Download Report</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdvisoryCard;
