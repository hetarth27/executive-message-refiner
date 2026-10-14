import React, { useState } from 'react';
import { RefinementResult } from '../types';
import { 
  X, 
  Trash2, 
  Star, 
  Copy, 
  Check, 
  ArrowRight, 
  Clock, 
  Inbox
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: RefinementResult[];
  onSelect: (item: RefinementResult) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onCopySuccess: (text: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onToggleFavorite,
  onDelete,
  onClearAll,
  onCopySuccess,
}) => {
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = onlyFavorites
    ? history.filter((item) => item.isFavorite)
    : history;

  const handleCopy = async (e: React.MouseEvent, item: RefinementResult) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.refinedText);
      setCopiedId(item.id);
      onCopySuccess('Copied from history!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onCopySuccess('Failed to copy');
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Refinement History
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                {history.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                onlyFavorites
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Favorites only</span>
            </button>

            {history.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* History List */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1">
            {filtered.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Inbox className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-medium">No messages found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {onlyFavorites
                    ? 'No messages starred as favorite yet.'
                    : 'Refined messages will automatically appear here.'}
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        {item.audience}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className="p-1 text-slate-400 hover:text-amber-500"
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleCopy(e, item)}
                        className="p-1 text-slate-400 hover:text-brand-500"
                        title="Copy refined text"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.subjectLine && (
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.subjectLine}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.refinedText}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{item.wordCountRefined} words</span>
                    <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium group-hover:underline">
                      Load in editor <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

