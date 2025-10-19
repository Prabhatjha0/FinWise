s# FinWise — Prototype

This is a static prototype for the FinWise project. It contains a simple HTML/CSS/JS demo that runs entirely in the browser and stores data in localStorage. The project is designed to be extensible — add a backend, integrate APIs, and swap the client-side auth for real authentication.

What I added
- `index.html` — the main landing + demo dashboard and tools
- `styles/style.css` — basic responsive styling
- `scripts/app.js` — local JS for expenses, interest calc, terms and news demo
- `assets/logo.svg` — small text logo

How to run
1. Open `index.html` in a browser (double-click or use Live Server extension).

Questions for you
1. Do you want a backend (Node/Express) + database (Firebase/MongoDB) or keep this static for now?
2. Which AI integration do you prefer for personalized tips? (OpenAI API, local model, or placeholder text?)
3. Which features are highest priority for your demo (expense core flows, learning, news integration, investment rates)?

Extensibility notes
- Backend: add a Node/Express API or Firebase to persist users and expenses across devices.
- AI: add a server-side proxy to call OpenAI or other LLM providers for personalized tips and a chatbot.
- APIs: integrate NewsAPI, currency rates, or investment feeds; add caching on the server.
- Charts & analytics: add Chart.js and server-side aggregation for comparisons against national averages.
	- The dashboard now includes category pie and monthly bar charts (uses Chart.js via CDN).

Next steps I can take after your answers
- Wire a simple Node/Express backend and persist data to MongoDB or Firebase.
- Integrate a News API and a currency/investment rates API.
- Add an AI-backed tips endpoint (example with OpenAI) and a simple chatbot UI.
