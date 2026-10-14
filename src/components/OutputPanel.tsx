import React, { useState } from 'react';
import { 
  RefinementResult 
} from '../types';
import { 
  Copy, 
  Check, 
  Star, 
  Sparkles, 
  FileCheck2, 
  Mail 
} from 'lucide-react';

interface OutputPanelProps {
  result: RefinementResult | null;
  isLoading: boolean;
  onToggleFavorite: (id: string) => void;
  onCopySuccess: (text: string) => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  result,
  isLoading,
  onToggleFavorite,
  onCopySuccess,
}) => {
  const [copiedType, setCopiedType] = useState<'full' | 'subject' | null>(null);

  const handleCopyMessage = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.refinedText);
      setCopiedType('full');
      onCopySuccess('Message copied to clipboard!');
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      onCopySuccess('Failed to copy');
    }
  };

  const handleCopySubject = async () => {
    if (!result?.subjectLine) return;
    try {
      await navigator.clipboard.writeText(result.subjectLine);
      setCopiedType('subject');
      onCopySuccess('Subject line copied!');
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      onCopySuccess('Failed to copy subject');
    }
  };

  // State 1: Loading
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center min-h-[460px] text-center">
        <div className="relative mb-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-500 opacity-20 blur animate-pulse" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Refining message with clarity and precision...
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          Correcting grammar, eliminating filler words, and optimizing structure.
        </p>
        <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-brand-500 to-indigo-500 animate-[indeterminate_1.5s_infinite_linear]" />
        </div>
      </div>
    );
  }

  // State 2: Empty / Initial state
  if (!result) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 sm:p-10 flex flex-col items-center justify-center min-h-[460px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4">
          <FileCheck2 className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">
          Ready to Refine Your Daily Communication
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          Write or paste your message on the left. We will correct grammar, eliminate filler, and deliver an executive-ready message you can send directly.
        </p>
      </div>
    );
  }

  // State 3: Active Result (Clean & minimal)
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
      
      {/* Top Result Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
        
        {/* Section Title */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
            Refined Message
          </h2>
        </div>

        {/* Favorite & Copy Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(result.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              result.isFavorite
                ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 text-amber-500'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
            }`}
            title={result.isFavorite ? 'Saved in favorites' : 'Save to favorites'}
            aria-label="Toggle favorite"
          >
            <Star className={`w-4 h-4 ${result.isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          <button
            onClick={handleCopyMessage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 active:scale-95 transition-all"
          >
            {copiedType === 'full' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subject Line if present */}
      {result.subjectLine && (
        <div className="px-4 sm:px-5 py-3 bg-brand-50/40 dark:bg-brand-950/20 border-b border-brand-100 dark:border-brand-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <div className="text-xs truncate">
              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-2">Subject:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 select-all">
                {result.subjectLine}
              </span>
            </div>
          </div>
          <button
            onClick={handleCopySubject}
            className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium shrink-0 flex items-center gap-1"
            title="Copy subject line"
          >
            {copiedType === 'subject' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedType === 'subject' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}

      {/* Direct Refined Message Area */}
      <div className="p-4 sm:p-5 flex-1 min-h-[340px]">
        <div className="h-full p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 leading-relaxed font-sans text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-text">
          {result.refinedText}
        </div>
      </div>

    </div>
  );
};
