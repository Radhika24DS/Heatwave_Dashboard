import React from 'react';
import { Activity } from 'lucide-react';

export default function PredictionCard({ prediction }) {
  if (!prediction) return null;

  const classNames = ["Normal", "Moderate", "Severe"];
  const formattedProbabilities = Array.isArray(prediction.probabilities)
    ? prediction.probabilities.map((prob, idx) => {
        if (prob && typeof prob === 'object') {
          return prob;
        }
        return {
          class_name: classNames[idx] || `Class ${idx}`,
          probability: typeof prob === 'number' ? prob : 0
        };
      })
    : [];

  return (
    <div className="bg-surface rounded-card p-6 shadow-card border border-surface-variant">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-container rounded-full text-on-primary-container">
          <Activity size={24} />
        </div>
        <h3 className="text-xl font-bold text-on-surface">AI Prediction</h3>
      </div>

      <div className="flex justify-between items-end border-b border-surface-variant pb-4 mb-4">
        <div>
          <p className="text-sm text-outline uppercase tracking-wider mb-1">Predicted Class</p>
          <p className="text-2xl font-black">{prediction.predicted_class}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-outline uppercase tracking-wider mb-1">Severity Tier</p>
          <span className="risk-badge bg-tertiary-container text-on-tertiary-container">
            {prediction.severity_tier}
          </span>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Class Probabilities</p>
        <div className="space-y-3">
          {formattedProbabilities.map((prob, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-xs mb-1">
                <span>{prob.class_name}</span>
                <span className="font-semibold">{(prob.probability * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${prob.probability * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
