const BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError(
      'backend_unreachable',
      'Cannot reach the ResearchMate backend. Make sure it is running on http://localhost:8000.'
    );
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const err = body?.error;
    throw new ApiError(
      err?.code || 'error',
      err?.message || `Request failed with status ${res.status}.`,
      res.status
    );
  }
  return body;
}

const payloadFrom = (form, settings) => ({
  idea: form.idea.trim(),
  domain: form.domain,
  tech_preferences: form.tech?.trim() || null,
  level: form.level,
  provider: settings.provider,
  model: (settings.provider === 'gemini' ? settings.geminiModel : settings.ollamaModel)?.trim() || null,
});

export const api = {
  health: (ollamaModel) =>
    request(`/health${ollamaModel ? `?ollama_model=${encodeURIComponent(ollamaModel)}` : ''}`),

  generate: (form, settings) =>
    request('/generate', { method: 'POST', body: JSON.stringify(payloadFrom(form, settings)) }),

  regenerate: (form, settings, section, current) =>
    request('/regenerate', {
      method: 'POST',
      body: JSON.stringify({ ...payloadFrom(form, settings), section, current }),
    }),
};
