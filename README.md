# AI Skills Studio

Interactive learning platform for AI education — designed for professionals.

## 🌐 Live Site

Hosted via GitHub Pages. The site is served from the `public/` directory.

## 🏗️ Structure

```
public/              → Static site (served by GitHub Pages)
├── index.html       → SPA shell (student exercise platform)
├── css/styles.css   → Global styles
├── js/              → Application code
│   ├── app.js       → Entry point
│   ├── config.example.js → API key template (copy to config.js)
│   ├── core/        → Router, session, sync engine
│   ├── views/       → Page views
│   ├── modules/     → Module content definitions
│   ├── chat/        → AI chat panel + services
│   └── components/  → Reusable UI components
├── decks/           → Trainer slide decks (Reveal.js)
│   ├── index.html   → Trainer portal (passcode protected)
│   ├── module1.html → Module 1 slides
│   └── module2.html → Module 2 slides
functions/           → Firebase Cloud Functions (AI chat proxy)
.kiro/               → Spec documents and steering
```

## 🔑 Configuration

### AI Chat (Gemini)

1. Copy `public/js/config.example.js` to `public/js/config.js`
2. Add your Gemini API key (get one at https://aistudio.google.com/app/apikey)
3. `config.js` is gitignored — your key won't be committed

### Trainer Access

Slide decks are protected with passcode: set in deck HTML files.

### Firebase (optional)

For real-time collaboration features, configure Firebase:
- Project: synaptic-ai-4491b
- Database rules: `database.rules.json`

## 🚀 Local Development

```bash
cd public
python3 -m http.server 8080
# Open http://localhost:8080
```

## 📚 Modules

| # | Topic | Student | Slides |
|---|-------|---------|--------|
| 1 | AI Landscape & Tool Survey | ✅ | ✅ |
| 2 | Prompt Engineering & Professional Writing | ✅ | ✅ |
| 3 | AI as Notetaker & Operational Writing | ✅ | 🔜 |
| 4 | Privacy & Responsible Use | ✅ | 🔜 |
| 5 | Data Analysis & Visualisation | ✅ | 🔜 |
| 6 | Reviewing & Summarising Documents | 🔜 | 🔜 |
| 7 | Research & Grounded Answers | 🔜 | 🔜 |
| 8 | Visualisation & Presentation | 🔜 | 🔜 |
| 9 | Building Without Coding | 🔜 | 🔜 |
| 10 | Capstone | 🔜 | 🔜 |

## 📄 License

All rights reserved — Gen AI Inc.
