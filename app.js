// ── State ─────────────────────────────────────────────────────────────────
let API_KEY   = localStorage.getItem('nexus_tavily_key') || '';
let sessions  = JSON.parse(localStorage.getItem('nexus_sessions') || '[]');
let curSession = null;   // { id, title, messages: [] }
let loading    = false;
let activeIntent = 'auto';

// ── SVG Icon Library ──────────────────────────────────────────────────────
// All icons are 16×16 stroke-based SVGs that inherit `currentColor`.
const ICONS = {
  auto: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  contact: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.1 6.1l1-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.04z"/></svg>`,
  services: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34L7 3a10 10 0 0 1 14.07 14.07L21 17a10 10 0 0 1-1.66 2.08M4.93 19.07A10 10 0 0 0 17.01 20.66L17 21a10 10 0 0 1-14.07-14.07L3 7a10 10 0 0 1 1.66-2.08"/></svg>`,
  history: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  description: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  inquiry: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  tag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  shield: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  warning: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  copy: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
};

// ── Intents ───────────────────────────────────────────────────────────────
const INTENTS = [
  { key: 'auto',        label: 'Auto',     color: '#00f5d4', iconKey: 'auto'        },
  { key: 'contact',     label: 'Contact',  color: '#00e676', iconKey: 'contact'     },
  { key: 'services',    label: 'Services', color: '#4a90e2', iconKey: 'services'    },
  { key: 'history',     label: 'History',  color: '#b78bff', iconKey: 'history'     },
  { key: 'description', label: 'Describe', color: '#ffab40', iconKey: 'description' },
  { key: 'inquiry',     label: 'Inquiry',  color: '#00f5d4', iconKey: 'inquiry'     },
];

const QUICK_PROMPTS = [
  { text: 'Latest releases on github.com',       iconKey: 'inquiry'     },
  { text: 'Contact info for github.com',          iconKey: 'contact'     },
  { text: 'Services offered by github.com',       iconKey: 'services'    },
  { text: 'History of github.com',                iconKey: 'history'     },
  { text: 'Latest iPhone from apple.com',         iconKey: 'tag'         },
  { text: 'Describe what stripe.com does',        iconKey: 'description' },
];

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildIntentBar();
  renderEmptyState();
  renderHistorySidebar();
  if (API_KEY) {
    document.getElementById('api-key-input').value = API_KEY;
    setKeyStatus(API_KEY.startsWith('tvly-'));
  }
  updateSendBtn();
  // Auto-resize textarea as user types
  document.getElementById('query-input').addEventListener('input', () => updateSendBtn());
});

function buildIntentBar() {
  const bar = document.getElementById('intent-bar');
  bar.innerHTML = INTENTS.map(i => `
    <button class="intent-chip${i.key === activeIntent ? ' active' : ''}"
            id="chip-${i.key}"
            onclick="setIntent('${i.key}')"
            style="${i.key === activeIntent ? `border-color:${i.color};background:${i.color}18` : ''}">
      <span style="display:flex;align-items:center;color:${i.key === activeIntent ? i.color : 'var(--txt3)'}">${ICONS[i.iconKey]}</span>
      <span class="label" style="${i.key === activeIntent ? `color:${i.color}` : ''}">${i.label}</span>
    </button>
  `).join('');
}

function setIntent(key) {
  activeIntent = key;
  buildIntentBar();
}

function renderEmptyState() {
  document.getElementById('empty-state').innerHTML = `
    <div class="splash-ring">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f5d4" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </div>
    <div class="splash-title">NEXUS SCRAPER</div>
    <div class="splash-sub">
      Intelligent web intelligence with natural language queries.<br/>
      Ask about contact info, services, history, or anything else.
    </div>
    <div class="splash-hint">TRY THESE QUERIES</div>
    <div class="quick-prompts">
      ${QUICK_PROMPTS.map(p => `
        <button class="qp-btn" onclick="usePrompt('${p.text.replace(/'/g,"\\'")}')">
          <span style="display:flex;align-items:center;flex-shrink:0;color:var(--teal)">${ICONS[p.iconKey]}</span>
          <span class="qp-text">${p.text}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function usePrompt(text) {
  const inp = document.getElementById('query-input');
  inp.value = text;
  autoResize(inp);
  updateSendBtn();
  inp.focus();
}

// ── API Key ───────────────────────────────────────────────────────────────
function onApiKeyChange(val) {
  API_KEY = val.trim();
  localStorage.setItem('nexus_tavily_key', API_KEY);
  setKeyStatus(API_KEY.startsWith('tvly-'));
  updateSendBtn();
}
function setKeyStatus(ok) {
  const el = document.getElementById('key-status');
  el.textContent = ok ? 'READY' : 'NO KEY';
  el.className = 'key-status ' + (ok ? 'ok' : 'missing');
  const dot = document.getElementById('status-dot');
  dot.style.background = ok ? '#00e676' : '#ff4081';
  dot.style.boxShadow  = ok ? '0 0 6px #00e676' : '0 0 6px #ff4081';
}

// ── Input helpers ─────────────────────────────────────────────────────────
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
function updateSendBtn() {
  const q = document.getElementById('query-input').value.trim();
  document.getElementById('send-btn').disabled = !q || loading || !API_KEY;
}
function onInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitQuery();
  }
}

// ── Session Management ────────────────────────────────────────────────────
function newSession() {
  curSession = null;
  document.getElementById('messages').innerHTML = '<div id="empty-state"></div>';
  renderEmptyState();
  renderHistorySidebar();
}

function saveSession() {
  if (!curSession) return;
  const idx = sessions.findIndex(s => s.id === curSession.id);
  if (idx >= 0) sessions[idx] = curSession;
  else sessions.unshift(curSession);
  // keep last 50
  sessions = sessions.slice(0, 50);
  localStorage.setItem('nexus_sessions', JSON.stringify(sessions));
  renderHistorySidebar();
}

function loadSession(id) {
  const sess = sessions.find(s => s.id === id);
  if (!sess) return;
  curSession = sess;
  const msgsEl = document.getElementById('messages');
  msgsEl.innerHTML = '';
  for (const msg of sess.messages) {
    appendMessage(msg, false);
  }
  renderHistorySidebar();
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function renderHistorySidebar() {
  const list = document.getElementById('history-list');
  if (sessions.length === 0) {
    list.innerHTML = `<div style="padding:16px 12px;font-family:var(--mono);font-size:10px;color:var(--txt3);letter-spacing:1px">NO SESSIONS YET</div>`;
    return;
  }
  list.innerHTML = sessions.map(s => `
    <div class="history-item${curSession?.id === s.id ? ' active' : ''}" onclick="loadSession('${s.id}')">
      <div class="history-title">${escHtml(s.title || 'Session')}</div>
      <div class="history-date">${s.date || ''}</div>
    </div>
  `).join('');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ── Prompt Building ───────────────────────────────────────────────────────
function buildSystemPrompt(intent) {
  const intentInstructions = {
    auto:        `Analyze the user's query to determine what they want: contact info, services, history, description, or a general inquiry. Then search the web and provide what they asked for.`,
    contact:     `The user wants contact information. Search the website and find: email addresses, phone numbers, physical addresses, social media handles, support links. Return them clearly labeled.`,
    services:    `The user wants to know about products and services. Search the site and list all services/products with brief descriptions.`,
    history:     `The user wants the company/site history. Search for founding year, key milestones, leadership changes, major events. Present in chronological order.`,
    description: `The user wants a description of the site/company. Provide a clear overview: what they do, who they serve, what makes them notable.`,
    inquiry:     `The user wants specific information from the site. Search thoroughly and return matching results with source URLs.`,
  };

  return `You are Nexus, an intelligent web scraping and research assistant.
${intentInstructions[intent] || intentInstructions.auto}

RESPONSE FORMAT — reply with a JSON object (no markdown fences) with these fields:
{
  "intent":   "<contact|services|history|description|inquiry|general>",
  "url":      "<canonical URL of the site>",
  "title":    "<site/company name>",
  "summary":  "<1-2 sentence overview>",
  "data":     { ... intent-specific structured data ... },
  "blocked":  false
}

For contact intent, data should be: { "emails": [...], "phones": [...], "address": "...", "social": {...}, "support": "..." }
For services intent, data should be: { "services": [{ "name": "...", "description": "..." }] }
For history intent, data should be: { "founded": "...", "milestones": [{ "year": "...", "event": "..." }] }
For description intent, data should be: { "overview": "...", "keywords": [...], "target_audience": "..." }
For inquiry intent, data should be: { "matches": [{ "title": "...", "url": "...", "snippet": "..." }] }

If the site actively blocks all access (Cloudflare, 403 errors everywhere, no useful data), set "blocked": true and explain in summary.
Always use web_search to get real, current data. Never make up information.`;
}

// ── Main Submit ───────────────────────────────────────────────────────────
async function submitQuery() {
  const inp = document.getElementById('query-input');
  const q = inp.value.trim();
  if (!q || loading || !API_KEY) return;

  // Reset input
  inp.value = '';
  inp.style.height = 'auto';
  updateSendBtn();

  // Remove empty state
  const emptyEl = document.getElementById('empty-state');
  if (emptyEl) emptyEl.remove();

  // Add user message
  const ts = new Date().toISOString();
  const userMsg = { role: 'user', text: q, timestamp: ts };
  if (!curSession) {
    curSession = {
      id: 'sess-' + Date.now(),
      title: q.slice(0, 44),
      date: new Date().toLocaleDateString(),
      messages: [],
    };
  }
  curSession.messages.push(userMsg);
  appendMessage(userMsg);

  // Typing indicator
  const typingId = 'typing-' + Date.now();
  appendTyping(typingId);
  loading = true;
  updateSendBtn();

  // Build query with intent prefix
  let fullQuery = q;
  if (activeIntent !== 'auto') {
    const prefixes = {
      contact:     'Find complete contact information for',
      services:    'List all services and products offered by',
      history:     'Give me the company history and timeline of',
      description: 'Describe in detail what this site/company does:',
      inquiry:     'Search for specific information about',
    };
    const pre = prefixes[activeIntent];
    if (pre && !q.toLowerCase().startsWith(pre.toLowerCase().substring(0, 10))) {
      fullQuery = `${pre} ${q}`;
    }
  }

  try {
    const result = await callAnthropicWithSearch(fullQuery, activeIntent);
    removeTyping(typingId);

    const botMsg = {
      role: 'bot',
      timestamp: new Date().toISOString(),
      ...result,
    };
    curSession.messages.push(botMsg);
    appendMessage(botMsg);
    saveSession();
  } catch (err) {
    removeTyping(typingId);
    const isBlocked = err.message?.includes('blocked') || err.message?.includes('403');
    const errMsg = {
      role: 'bot',
      type: 'error',
      isBlocked,
      text: err.message || 'Request failed',
      timestamp: new Date().toISOString(),
    };
    curSession.messages.push(errMsg);
    appendMessage(errMsg);
    saveSession();
  } finally {
    loading = false;
    updateSendBtn();
  }
}

// ── Tavily API Call ────────────────────────────────────────────
// Free key at https://app.tavily.com — 1,000 credits/month free.
// Tavily returns LLM-ready snippets + an answer field; we map those
// directly into the structured JSON Nexus expects.
async function callAnthropicWithSearch(query, intent) {

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: API_KEY,
      query: query,
      search_depth: 'advanced',
      include_answer: 'advanced',   // full AI-generated answer
      include_raw_content: false,
      max_results: 8,
      topic: intent === 'history' ? 'general' : 'general',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.detail || err?.message || `Tavily error ${res.status}`;
    if (res.status === 401) throw new Error('Invalid Tavily key — check the tvly-… field.');
    if (res.status === 403) throw new Error('Invalid Tavily key — check the tvly-… field.');
    if (res.status === 429) throw new Error('Tavily rate limit hit — wait a moment and try again.');
    throw new Error(msg);
  }

  const data = await res.json();
  const results = data.results || [];
  const answer  = data.answer  || '';

  // Pick the most relevant source URL
  const primaryUrl   = results[0]?.url   || '';
  const primaryTitle = results[0]?.title || '';

  // Build intent-specific structured data from Tavily results
  let intentData = {};

  if (intent === 'contact') {
    // Scan all snippets for emails, phones, addresses
    const allText = results.map(r => r.content || '').join(' ');
    const emails  = [...new Set((allText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || []))];
    const phones  = [...new Set((allText.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) || []))];
    intentData = { emails, phones, address: '', social: {} };

  } else if (intent === 'services') {
    intentData = {
      services: results.slice(0, 6).map(r => ({
        name: r.title || '',
        description: (r.content || '').slice(0, 160),
      })),
    };

  } else if (intent === 'history') {
    const allText = results.map(r => r.content || '').join(' ');
    const founded = (allText.match(/(?:founded|established|started|launched)(?:[\s\w]{0,20})(?:in\s)?((?:19|20)\d{2})/i) || [])[1] || '';
    intentData = {
      founded,
      milestones: results.slice(0, 6).map(r => ({
        year:  (r.content || '').match(/((?:19|20)\d{2})/)?.[1] || '?',
        event: (r.content || '').slice(0, 120),
      })),
    };

  } else if (intent === 'description') {
    const allText = results.map(r => r.content || '').join(' ');
    // Extract short keyword phrases
    const words = allText.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    const freq  = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const keywords = Object.entries(freq)
      .filter(([w]) => !['their','about','which','these','those','there','where','would','could','should','https','from'].includes(w))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([w]) => w);
    intentData = {
      overview: answer || (results[0]?.content || '').slice(0, 300),
      keywords,
      target_audience: '',
    };

  } else if (intent === 'inquiry') {
    intentData = {
      matches: results.slice(0, 6).map(r => ({
        title:   r.title   || '',
        url:     r.url     || '',
        snippet: (r.content || '').slice(0, 200),
      })),
    };

  } else {
    // auto / general — use inquiry layout
    intentData = {
      matches: results.slice(0, 6).map(r => ({
        title:   r.title   || '',
        url:     r.url     || '',
        snippet: (r.content || '').slice(0, 200),
      })),
    };
  }

  return {
    intent:  intent === 'auto' ? 'inquiry' : intent,
    url:     primaryUrl,
    title:   primaryTitle,
    summary: answer || (results[0]?.content || '').slice(0, 300),
    data:    intentData,
    blocked: false,
  };
}

// ── Render Helpers ────────────────────────────────────────────────────────
function appendMessage(msg, scroll = true) {
  const msgsEl = document.getElementById('messages');

  if (msg.role === 'user') {
    msgsEl.insertAdjacentHTML('beforeend', `
      <div class="msg-wrap">
        <div class="user-row">
          <div class="user-bubble">${escHtml(msg.text)}</div>
        </div>
        <div class="msg-ts user-ts">${fmtTime(msg.timestamp)}</div>
      </div>
    `);
  } else if (msg.type === 'error') {
    const cls  = msg.isBlocked ? 'blockade-bubble' : 'error-bubble';
    const icon = msg.isBlocked ? ICONS.shield : ICONS.warning;
    msgsEl.insertAdjacentHTML('beforeend', `
      <div class="msg-wrap">
        <div class="bot-row">
          <div class="bot-avatar">N</div>
          <div>
            <div class="${cls}">
              <span class="error-icon" style="display:flex;align-items:center;flex-shrink:0">${icon}</span>
              <span>${escHtml(msg.text)}</span>
            </div>
            <div class="msg-ts">${fmtTime(msg.timestamp)}</div>
          </div>
        </div>
      </div>
    `);
  } else {
    // Normal bot result
    const intentMeta = {
      contact:     { label: 'CONTACT INFO',  color: '#00e676' },
      services:    { label: 'SERVICES',      color: '#4a90e2' },
      history:     { label: 'HISTORY',       color: '#b78bff' },
      description: { label: 'DESCRIPTION',  color: '#ffab40' },
      inquiry:     { label: 'INQUIRY',       color: '#00f5d4' },
      general:     { label: 'GENERAL',       color: '#00f5d4' },
    };
    const meta = intentMeta[msg.intent] || intentMeta.general;
    const cardHtml = buildResultCard(msg, meta);

    msgsEl.insertAdjacentHTML('beforeend', `
      <div class="msg-wrap">
        <div class="bot-row">
          <div class="bot-avatar">N</div>
          <div style="flex:1;min-width:0">
            <div class="bot-bubble">
              <div class="bot-label">→ ${meta.label} · ${escHtml(msg.url || '')} · ${escHtml(msg.title || '')}</div>
              ${cardHtml}
            </div>
            <div class="msg-ts">${fmtTime(msg.timestamp)}</div>
          </div>
        </div>
      </div>
    `);
  }

  if (scroll) msgsEl.scrollTop = msgsEl.scrollHeight;
}

function buildResultCard(msg, meta) {
  const d = msg.data || {};
  const intent = msg.intent;
  let content = '';

  if (msg.summary) {
    content += `<div class="section">
      <div class="section-label">SUMMARY</div>
      <div class="section-value">${escHtml(msg.summary)}</div>
    </div>`;
  }

  if (msg.url) {
    content = `<a class="url-bar" href="${escHtml(msg.url)}" target="_blank" rel="noopener">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8892aa" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      <span class="url-text">${escHtml(msg.url)}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8892aa" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </a>` + content;
  }

  if (intent === 'contact' && d.emails?.length) {
    content += `<div class="section"><div class="section-label">EMAIL</div>` +
      d.emails.map(e => dataRow('email', e, true)).join('') + `</div>`;
  }
  if (intent === 'contact' && d.phones?.length) {
    content += `<div class="section"><div class="section-label">PHONE</div>` +
      d.phones.map(p => dataRow('phone', p, false)).join('') + `</div>`;
  }
  if (intent === 'contact' && d.address) {
    content += `<div class="section"><div class="section-label">ADDRESS</div>
      <div class="data-row"><span class="data-val">${escHtml(d.address)}</span></div></div>`;
  }
  if (intent === 'contact' && d.social && Object.keys(d.social).length) {
    content += `<div class="section"><div class="section-label">SOCIAL</div>` +
      Object.entries(d.social).map(([k,v]) => dataRow(k, v, false)).join('') + `</div>`;
  }

  if (intent === 'services' && d.services?.length) {
    content += `<div class="section"><div class="section-label">SERVICES &amp; PRODUCTS</div>` +
      d.services.map(s => `
        <div class="service-item">
          <div class="service-name">${escHtml(s.name || '')}</div>
          ${s.description ? `<div class="service-desc">${escHtml(s.description)}</div>` : ''}
        </div>
      `).join('') + `</div>`;
  }

  if (intent === 'history') {
    if (d.founded) {
      content += `<div class="section"><div class="section-label">FOUNDED</div>
        <div class="data-row"><span class="data-val">${escHtml(d.founded)}</span></div></div>`;
    }
    if (d.milestones?.length) {
      content += `<div class="section"><div class="section-label">MILESTONES</div>` +
        d.milestones.map(m => dataRow(m.year || '?', m.event || '', false)).join('') + `</div>`;
    }
  }

  if (intent === 'description') {
    if (d.target_audience) {
      content += `<div class="section"><div class="section-label">TARGET AUDIENCE</div>
        <div class="data-row"><span class="data-val">${escHtml(d.target_audience)}</span></div></div>`;
    }
    if (d.keywords?.length) {
      content += `<div class="section"><div class="section-label">KEYWORDS</div>
        <div class="tag-list">${d.keywords.map(k =>
          `<span class="tag" style="border-color:#ffab4444;color:#ffab40">${escHtml(k)}</span>`
        ).join('')}</div></div>`;
    }
  }

  if (intent === 'inquiry' && d.matches?.length) {
    content += `<div class="section"><div class="section-label">RESULTS</div>` +
      d.matches.map(m => `
        <div class="match-item">
          <div class="match-title">${escHtml(m.title || '')}</div>
          ${m.url ? `<a class="match-url" href="${escHtml(m.url)}" target="_blank" rel="noopener">${escHtml(m.url)}</a>` : ''}
          ${m.snippet ? `<div class="match-snippet">${escHtml(m.snippet)}</div>` : ''}
        </div>
      `).join('') + `</div>`;
  }

  return `<div class="result-card">
    <div class="card-header">
      <div class="intent-badge" style="color:${meta.color}">
        <div class="intent-dot" style="background:${meta.color}"></div>
        ${meta.label}
      </div>
    </div>
    ${content || `<div class="section-value" style="color:var(--txt2)">No structured data returned.</div>`}
  </div>`;
}

function dataRow(label, value, copyable) {
  const id = 'dr-' + Math.random().toString(36).slice(2);
  return `<div class="data-row">
    <span class="data-label">${escHtml(label)}</span>
    <span class="data-val" id="${id}">${escHtml(value)}</span>
    ${copyable ? `<button class="copy-btn" onclick="copyVal('${id}', this)" title="Copy">${ICONS.copy}</button>` : ''}
  </div>`;
}

function copyVal(id, btn) {
  const val = document.getElementById(id)?.textContent || '';
  navigator.clipboard?.writeText(val).then(() => {
    btn.innerHTML = ICONS.check;
    setTimeout(() => { btn.innerHTML = ICONS.copy; }, 1500);
  });
}

function appendTyping(id) {
  document.getElementById('messages').insertAdjacentHTML('beforeend', `
    <div class="msg-wrap" id="${id}">
      <div class="bot-row">
        <div class="bot-avatar">N</div>
        <div class="typing-bubble">
          <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
          <span class="crawl-label">SEARCHING WEB…</span>
        </div>
      </div>
    </div>
  `);
  document.getElementById('messages').scrollTop = 999999;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

// ── Utils ─────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function fmtTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
