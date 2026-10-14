import React from 'react';
import { 
  FormatType 
} from '../types';
import { 
  FORMAT_OPTIONS 
} from '../data/presets';
import { 
  Send, 
  Trash2, 
  FileText, 
  Loader2 
} from 'lucide-react';
import { countWords } from '../services/diffService';

interface InputPanelProps {
  rawText: string;
  setRawText: (text: string) => void;
  format: FormatType;
  setFormat: (fmt: FormatType) => void;
  onRefine: () => void;
  isLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  rawText,
  setRawText,
  format,
  setFormat,
  onRefine,
  isLoading,
}) => {
  const wordCount = countWords(rawText);
  const charCount = rawText.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (rawText.trim() && !isLoading) {
        onRefine();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col gap-5">
      
      {/* Top bar: Draft label & clear button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
            Your Message Draft
          </h2>
        </div>

        {rawText && (
          <button
            onClick={() => setRawText('')}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-md"
            title="Clear draft"
            aria-label="Clear draft"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Main text area */}
      <div className="relative">
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write or paste your message here... You can specify the recipient directly (e.g., 'Email to my boss about the release delay...' or 'Reply to client regarding updated invoice...')"
          rows={10}
          className="w-full p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y font-sans leading-relaxed"
        />

        {/* Counter footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5 px-1">
          <span>
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
          </span>
          <span className="hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">Ctrl+Enter</kbd> to refine
          </span>
        </div>
      </div>

      {/* Channel & Format Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Format
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as FormatType)}
          className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer font-medium"
        >
          {FORMAT_OPTIONS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label} ({f.channel})
            </option>
          ))}
        </select>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onRefine}
        disabled={isLoading || !rawText.trim()}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md ${
          isLoading || !rawText.trim()
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-500/25 active:scale-[0.99]'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Refining message for executive impact...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Refine Message</span>
          </>
        )}
      </button>

    </div>
  );
};
