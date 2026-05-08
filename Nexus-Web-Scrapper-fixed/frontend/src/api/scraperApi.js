import axios from 'axios';

// ── Change this to your backend URL (LAN IP when testing on device) ──────────
export const API_BASE = __DEV__
  ? 'http://localhost:8000'
  : 'https://your-production-server.com';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Normalize errors so callers always get a readable message ────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const detail = typeof data?.detail === 'string' ? data.detail : '';

      // Site actively blocked the scraper (403 with our sentinel prefix)
      if (status === 403 && detail.startsWith('SCRAPER_BLOCKED:')) {
        const blockedUrl = detail.replace('SCRAPER_BLOCKED:', '');
        error.isBlockaded = true;
        error.blockedUrl  = blockedUrl;
        error.message     = `Denied scraping because of blockade — ${blockedUrl} rejected the request.`;
      } else if (detail) {
        error.message = detail;
      } else {
        error.message = `Server error ${status}: ${error.response.statusText || 'Unknown error'}`;
      }
    } else if (error.request) {
      // Request sent but no response — backend is down or unreachable
      error.message =
        `Cannot reach the backend at ${API_BASE}. ` +
        'Make sure the FastAPI server is running (uvicorn main:app --reload --port 8000).';
    }
    return Promise.reject(error);
  }
);

// ── API calls ────────────────────────────────────────────────────────────────

export const sendSearch = async (query, sessionId = null) => {
  const { data } = await api.post('/search', { query, session_id: sessionId });
  return data;
};

export const fetchSessions = async () => {
  const { data } = await api.get('/sessions');
  return data;
};

export const fetchSession = async (sessionId) => {
  const { data } = await api.get(`/sessions/${sessionId}`);
  return data;
};

export const removeSession = async (sessionId) => {
  const { data } = await api.delete(`/sessions/${sessionId}`);
  return data;
};

export const interactWithSite = async (url, action = 'post', formData = {}) => {
  const { data } = await api.post('/interact', { url, action, data: formData });
  return data;
};

export const explainQuery = async (query) => {
  const { data } = await api.get('/nlp/explain', { params: { query } });
  return data;
};

export const proxyUrl = (url) =>
  url ? `${API_BASE}/proxy?url=${encodeURIComponent(url)}` : '';

export const proxyRaw = (url) =>
  url ? `${API_BASE}/proxy/raw?url=${encodeURIComponent(url)}` : '';
