# NEXUS SCRAPER

> Intelligent web intelligence powered by [Tavily Search API](https://app.tavily.com) — runs entirely in the browser, no server required.

**Live demo:** `https://<your-username>.github.io/nexus-scraper`

---

## Features

- **Contact** — extracts emails, phones, addresses from any site
- **Services** — lists products and services offered
- **History** — pulls founding year and key milestones
- **Description** — summarizes what a site/company does
- **Inquiry** — general web search with cited results
- **Auto** — detects intent from your query automatically
- Session history saved to localStorage
- Zero backend — pure static HTML/CSS/JS

---

## Setup

### 1. Get a free Tavily API key

Sign up at [app.tavily.com](https://app.tavily.com).  
You get **1,000 free search credits per month** — no credit card required.  
Your key starts with `tvly-`.

### 2. Deploy to GitHub Pages

```bash
# Clone or fork this repo, then:
git clone https://github.com/<your-username>/nexus-scraper.git
cd nexus-scraper

# Push to GitHub
git add .
git commit -m "initial commit"
git push origin main
```

Then in your repo:  
**Settings → Pages → Source → Deploy from branch → `main` / `/ (root)`**

Your site will be live at `https://<your-username>.github.io/nexus-scraper` within a minute.

### 3. Use the app

Paste your `tvly-…` key into the field in the top-right corner.  
The key is saved to `localStorage` — you only need to enter it once per browser.

---

## File Structure

```
nexus-scraper/
├── index.html      # App shell & layout
├── style.css       # All styles
├── app.js          # All logic (Tavily API, session management, rendering)
├── _config.yml     # GitHub Pages config
└── README.md
```

---

## API

This app uses only one external API:

| API | Purpose | Free tier |
|-----|---------|-----------|
| [Tavily Search](https://app.tavily.com) | Web search + AI answer | 1,000 credits/month |

---

## License

MIT
