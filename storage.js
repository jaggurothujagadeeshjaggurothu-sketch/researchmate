const HISTORY_KEY = 'researchmate.history.v1';
const SETTINGS_KEY = 'researchmate.settings.v1';

export const DEFAULT_SETTINGS = {
  provider: 'ollama',
  ollamaModel: 'llama3.2',
  geminiModel: 'gemini-2.0-flash',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked - app keeps working in memory */
  }
}

export const loadHistory = () => {
  const items = read(HISTORY_KEY, []);
  return Array.isArray(items) ? items : [];
};
export const saveHistory = (items) => write(HISTORY_KEY, items);

export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...read(SETTINGS_KEY, {}) });
export const saveSettings = (settings) => write(SETTINGS_KEY, settings);
