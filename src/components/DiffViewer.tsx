import React from 'react';
import { computeWordDiff } from '../services/diffService';
import { ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';

interface DiffViewerProps {
  originalText: string;
  refinedText: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ originalText, refinedText }) => {
  const diff = computeWordDiff(originalText, refinedText);

  return (
    <div className="space-y-4">
      {/* Metric comparison banner */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Original</span>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{diff.originalWordCount} <span className="text-xs font-normal text-slate-400">words</span></p>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Refined</span>
          <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{diff.refinedWordCount} <span className="text-xs font-normal text-slate-400">words</span></p>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Brevity Shift</span>
          <p className={`text-lg font-bold flex items-center justify-center gap-0.5 ${
            diff.percentageChange < 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : diff.percentageChange > 0 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-slate-600 dark:text-slate-400'
          }`}>
            {diff.percentageChange < 0 ? (
              <ArrowDownRight className="w-4 h-4 inline" />
            ) : diff.percentageChange > 0 ? (
              <ArrowUpRight className="w-4 h-4 inline" />
            ) : (
              <Scale className="w-4 h-4 inline" />
            )}
            {Math.abs(diff.percentageChange)}% {diff.percentageChange < 0 ? 'tighter' : diff.percentageChange > 0 ? 'expanded' : 'identical'}
          </p>
        </div>
      </div>

      {/* Visual Word-level Diff */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 leading-relaxed font-sans text-sm sm:text-base">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-medium">
          <span>Word-level Evolution:</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-200 dark:bg-rose-900/80 inline-block"></span>
              Removed fluff
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-900/80 inline-block"></span>
              Polished additions
            </span>
          </div>
        </div>

        <div className="whitespace-pre-wrap font-sans">
          {diff.chunks.map((chunk, idx) => {
            if (chunk.type === 'removed') {
              return (
                <mark
                  key={idx}
                  className="bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 line-through decoration-rose-400 px-1 py-0.5 rounded mx-0.5 select-none text-xs sm:text-sm font-medium"
                >
                  {chunk.text}
                </mark>
              );
            }
            if (chunk.type === 'added') {
              return (
                <mark
                  key={idx}
                  className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 px-1 py-0.5 rounded mx-0.5 font-medium"
                >
                  {chunk.text}
                </mark>
              );
            }
            return <span key={idx} className="text-slate-700 dark:text-slate-300">{chunk.text}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

