import React from 'react';
import { BookOpen } from 'lucide-react';

export default function AdvisoryCard({ advisory, role }) {
  if (!advisory) return null;

  return (
    <div className="glass-panel p-6 border-t-4 border-t-secondary-container">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-secondary-container/20 rounded-full text-secondary">
          <BookOpen size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            Actionable Advisory
            <span className="text-xs px-2 py-1 bg-surface-variant rounded-chip text-outline font-medium">
              Target: {advisory.target_demographic}
            </span>
          </h3>
          <p className="mt-3 text-on-surface-variant leading-relaxed">
            {advisory.message}
          </p>
        </div>
      </div>
    </div>
  );
}
