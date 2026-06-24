// src/components/common/ConfusionMatrixHeatmap.jsx
import React from 'react';

const ConfusionMatrixHeatmap = () => {
  // Mock confusion matrix values based on the Random Forest validation set
  const matrix = {
    tp: { count: 348, label: 'True Positive (TP)', desc: 'Correctly predicted high risk' },
    fp: { count: 24, label: 'False Positive (FP)', desc: 'Incorrectly flagged heatwave' },
    fn: { count: 18, label: 'False Negative (FN)', desc: 'Missed severe event' },
    tn: { count: 724, label: 'True Negative (TN)', desc: 'Correctly predicted low risk' }
  };

  const total = matrix.tp.count + matrix.fp.count + matrix.fn.count + matrix.tn.count;
  const accuracy = ((matrix.tp.count + matrix.tn.count) / total * 100).toFixed(1);

  return (
    <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-brand-text">Confusion Matrix Heatmap</h3>
          <p className="text-xs text-brand-muted mt-0.5">Classification validation performance (Test Set: {total} records)</p>
        </div>
        <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg">
          Acc: {accuracy}%
        </div>
      </div>

      {/* Grid Layout representing Matrix */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold mb-2">
        {/* Empty top-left */}
        <div className="flex items-center justify-center text-brand-muted font-bold">
          Actual \ Pred
        </div>
        <div className="py-2 bg-brand-slate/40 border border-brand-border/40 rounded-lg text-brand-text font-bold uppercase tracking-wider text-[10px]">
          Heatwave
        </div>
        <div className="py-2 bg-brand-slate/40 border border-brand-border/40 rounded-lg text-brand-text font-bold uppercase tracking-wider text-[10px]">
          No Heatwave
        </div>

        {/* Row 1: Actual Heatwave */}
        <div className="flex items-center justify-center bg-brand-slate/40 border border-brand-border/40 rounded-lg text-brand-text font-bold uppercase tracking-wider text-[10px]">
          Heatwave
        </div>
        {/* TP */}
        <div className="p-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl transition-all duration-200 group">
          <p className="text-2xl font-black text-emerald-400">{matrix.tp.count}</p>
          <p className="text-[10px] font-bold text-brand-text mt-1">{matrix.tp.label}</p>
          <p className="text-[8px] text-brand-muted mt-0.5 leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200">{matrix.tp.desc}</p>
        </div>
        {/* FN (Missed - red shade) */}
        <div className="p-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-xl transition-all duration-200 group">
          <p className="text-2xl font-black text-red-400">{matrix.fn.count}</p>
          <p className="text-[10px] font-bold text-brand-text mt-1">{matrix.fn.label}</p>
          <p className="text-[8px] text-brand-muted mt-0.5 leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200">{matrix.fn.desc}</p>
        </div>

        {/* Row 2: Actual No Heatwave */}
        <div className="flex items-center justify-center bg-brand-slate/40 border border-brand-border/40 rounded-lg text-brand-text font-bold uppercase tracking-wider text-[10px]">
          No Heatwave
        </div>
        {/* FP (False alarm - orange shade) */}
        <div className="p-4 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/20 rounded-xl transition-all duration-200 group">
          <p className="text-2xl font-black text-orange-400">{matrix.fp.count}</p>
          <p className="text-[10px] font-bold text-brand-text mt-1">{matrix.fp.label}</p>
          <p className="text-[8px] text-brand-muted mt-0.5 leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200">{matrix.fp.desc}</p>
        </div>
        {/* TN */}
        <div className="p-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl transition-all duration-200 group">
          <p className="text-2xl font-black text-emerald-400">{matrix.tn.count}</p>
          <p className="text-[10px] font-bold text-brand-text mt-1">{matrix.tn.label}</p>
          <p className="text-[8px] text-brand-muted mt-0.5 leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200">{matrix.tn.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrixHeatmap;
