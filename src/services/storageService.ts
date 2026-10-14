import { AppSettings, RefinementResult } from '../types';
import { DEFAULT_RULES } from '../data/presets';

const SETTINGS_KEY = 'emr_user_settings_v1';
const HISTORY_KEY = 'emr_refinement_history_v1';

export const INITIAL_SETTINGS: AppSettings = {
  provider: 'mock',
  apiKey: '',
  selectedModel: 'gemini-1.5-flash',
  customEndpoint: '',
  userName: '',
  userTitle: '',
  systemPersonaInstructions: 'Communicate with executive precision, clarity, and authority. Eliminate filler words and timid phrases.',
  rules: DEFAULT_RULES,
  theme: 'light',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return INITIAL_SETTINGS;
    const parsed = JSON.parse(raw);
    const provider = parsed.provider || 'mock';
    return {
      ...INITIAL_SETTINGS,
      ...parsed,
      provider,
      rules: parsed.rules && parsed.rules.length > 0 ? parsed.rules : DEFAULT_RULES,
    };
  } catch (err) {
    console.warn('Failed to load settings from localStorage:', err);
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}


export function loadHistory(): RefinementResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load history:', err);
    return [];
  }
}

export function saveHistory(history: RefinementResult[]): void {
  try {
    // Keep last 40 items to manage storage
    const trimmed = history.slice(0, 40);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save history:', err);
  }
}

export function toggleFavoriteInHistory(id: string): RefinementResult[] {
  const current = loadHistory();
  const updated = current.map((item) =>
    item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
  );
  saveHistory(updated);
  return updated;
}

export function deleteHistoryItem(id: string): RefinementResult[] {
  const current = loadHistory();
  const updated = current.filter((item) => item.id !== id);
  saveHistory(updated);
  return updated;
}

