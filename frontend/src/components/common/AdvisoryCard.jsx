// src/components/common/AdvisoryCard.jsx
import React from 'react';
import { getRiskColorHex, getRiskBadgeBg } from '../../utils/riskColor';
import { ShieldAlert, AlertTriangle, BookOpen, Download } from 'lucide-react';

const AdvisoryCard = ({ advisory = {}, onDownloadReport }) => {
  const { title, content, role, risk_level, document_source } = advisory;
  const color = getRiskColorHex(risk_level);
  const bg    = getRiskBadgeBg(risk_level);
  const isHighRisk = ['HIGH', 'EXTREME', 'CRITICAL'].includes((risk_level || '').toUpperCase());

  const guidelines = content
    ? content.split('\n').filter(Boolean)
    : [];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-brand-card shadow-card fade-in-up transition-all duration-300 hover:border-brand-primary/20"
      style={{ borderColor: 'rgba(42,42,42,0.8)', borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: `${color}30`, background: bg }}>
            {isHighRisk
              ? <AlertTriangle className="h-5 w-5" style={{ color }} />
              : <ShieldAlert    className="h-5 w-5" style={{ color }} />}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: bg, color }}>
              {role || 'PUBLIC'} Advisory
            </span>
            <h3 className="font-heading text-base font-bold text-brand-text mt-1 leading-snug">
              {title || 'Heatwave Mitigation Advisory'}
            </h3>
          </div>
        </div>

        {/* Guidelines */}
        {guidelines.length > 0 ? (
          <ul className="space-y-2 mb-5">
            {guidelines.map((line, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-brand-muted">
                <span className="mt-0.5 h-4 w-4 flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold" style={{ background: bg, color }}>
                  {idx + 1}
                </span>
                <span className="leading-snug">{line.replace(/^\d+\.\s*/, '')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-brand-muted mb-5">No advisory content currently available.</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-brand-border/40 pt-4 gap-3">
          {document_source && (
            <div className="flex items-center gap-1.5 text-xs text-brand-faint">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="text-brand-muted">{document_source}</span>
            </div>
          )}
          {onDownloadReport && (
            <button
              onClick={onDownloadReport}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-text bg-brand-surface hover:bg-brand-border border border-brand-border rounded-lg transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisoryCard;
