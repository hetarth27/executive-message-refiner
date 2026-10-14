import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppSettings, 
  AudienceType, 
  FormatType, 
  RefinementResult, 
  ToneType 
} from './types';
import { 
  loadSettings, 
  loadHistory, 
  saveHistory, 
  deleteHistoryItem, 
  toggleFavoriteInHistory 
} from './services/storageService';
import { refineMessage } from './services/llmService';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';

function inferAudienceFromText(text: string): AudienceType {
  const lower = text.toLowerCase();
  if (lower.includes('client') || lower.includes('customer') || lower.includes('account')) {
    return 'client';
  }
  if (lower.includes('team') || lower.includes('report') || lower.includes('intern') || lower.includes('direct report')) {
    return 'team';
  }
  if (lower.includes('vendor') || lower.includes('partner') || lower.includes('contractor') || lower.includes('supplier')) {
    return 'vendor';
  }
  if (lower.includes('peer') || lower.includes('colleague') || lower.includes('cross-functional')) {
    return 'peer';
  }
  return 'boss';
}

export const App: React.FC = () => {
  // App Settings & Theme
  const [settings] = useState<AppSettings>(loadSettings);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Editor State
  const [rawText, setRawText] = useState<string>('');
  const [tone, setTone] = useState<ToneType>('executive');
  const [format, setFormat] = useState<FormatType>('normal_discussion');

  // Execution & Output State
  const [result, setResult] = useState<RefinementResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // History & Navigation State
  const [history, setHistory] = useState<RefinementResult[]>(loadHistory);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark mode class to root html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRefine = async () => {
    if (!rawText.trim()) return;

    // Detect recipient from the message text
    const detectedAudience = inferAudienceFromText(rawText);

    setIsLoading(true);
    try {
      const refined = await refineMessage({
        rawText,
        audience: detectedAudience,
        tone,
        format,
        settings,
      });

      setResult(refined);

      // Save to history
      const updatedHistory = [refined, ...history.filter((h) => h.id !== refined.id)];
      setHistory(updatedHistory);
      saveHistory(updatedHistory);

      showToast('Message refined successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Refinement failed';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteInHistory(id);
    setHistory(updated);
    if (result && result.id === id) {
      setResult({ ...result, isFavorite: !result.isFavorite });
    }
    showToast('Updated favorites');
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
    if (result && result.id === id) {
      setResult(null);
    }
    showToast('Item removed from history');
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    saveHistory([]);
    showToast('History cleared');
  };

  const handleSelectHistoryItem = (item: RefinementResult) => {
    setRawText(item.originalText);
    setTone(item.tone);
    setFormat(item.format);
    setResult(item);
    showToast('Loaded message from history');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Navigation Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onToggleTheme={() => setIsDark(!isDark)}
        isDark={isDark}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* 2-Column Split Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Input workbench */}
          <InputPanel
            rawText={rawText}
            setRawText={setRawText}
            format={format}
            setFormat={setFormat}
            onRefine={() => handleRefine()}
            isLoading={isLoading}
          />

          {/* Right Column: Output suite */}
          <OutputPanel
            result={result}
            isLoading={isLoading}
            onToggleFavorite={handleToggleFavorite}
            onCopySuccess={(msg) => showToast(msg)}
          />

        </div>

      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
        onCopySuccess={(msg) => showToast(msg)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
};

export default App;
