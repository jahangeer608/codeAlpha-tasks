# ✈ Lingo Board

A fast, free, client-side text translator styled like an airport departures board. No backend, no account, no API key required — just open `index.html` in a browser.

**[Live preview →](./lingoboard-preview.html)** *(single-file build, open directly in any browser)*

![Lingo Board](https://img.shields.io/badge/status-active-brightgreen) ![No backend](https://img.shields.io/badge/backend-none-blue) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Features

- **45+ languages** with auto-detect (script-based, no network call)
- **Translate** — powered by the free [MyMemory API](https://mymemory.translated.net/doc/spec.php), with automatic fallback to [Lingva Translate](https://github.com/thedaviddelta/lingva-translate) if the primary service is unreachable or its daily quota is exhausted
- **Long text support** — up to 1,000 characters, auto-chunked on sentence/word boundaries and stitched back together
- **🎤 Dictate** — voice input via the Web Speech API (Chrome/Edge)
- **🔊 Pronounce** — text-to-speech for both source and translated text, with adjustable voice speed
- **☆ Save** — keep translations for later, reuse or delete them anytime
- **Dashboard layout** — full three-panel view (translator + saved + settings) on desktop; tabbed single-panel view on mobile
- **Light / dark themes** — amber-on-navy "departures board" dark mode, or a cream "boarding pass" light mode
- **Offline detection**, copy-to-clipboard, swap languages, daily translation counter, and persistent settings — all stored locally, nothing leaves your device except the translation request itself

## Getting started

No build step, no dependencies to install.

```bash
git clone https://github.com/<your-username>/lingo-board.git
cd lingo-board
```

Then either:

- Open `index.html` directly in a browser, **or**
- Serve it locally (recommended, since some browsers restrict microphone/clipboard access on `file://`):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
lingo-board/
├── index.html   # markup — language board, translate/saved/settings panels
├── style.css    # theming (light/dark), layout, components
├── script.js    # translation logic, speech, storage, view switching
└── README.md
```

## Configuration

Everything lives in `script.js`, no `.env` file needed:

- **Raise the free daily quota** — MyMemory allows ~5,000 characters/day anonymously, or ~50,000/day if you add a contact email. Set it in-app under **Settings → Contact email**; it's stored only in your browser.
- **Swap translation providers** — `translateText()` and `callLingva()` in `script.js` include commented drop-in examples for Google Cloud Translate and Microsoft Translator. Both require a paid/free-tier API key — proxy the request through your own backend rather than shipping a key in client-side code.

## Browser support

| Feature | Requirement |
|---|---|
| Translate | Any modern browser (uses `fetch`) |
| 🎤 Dictate | Chrome or Edge (`SpeechRecognition`); hidden automatically elsewhere |
| 🔊 Pronounce | Any browser supporting `speechSynthesis`; hidden automatically elsewhere |
| Saved translations, theme, settings | `localStorage` (falls back gracefully in private browsing) |

## Roadmap / ideas

- [ ] PWA manifest + service worker for offline install
- [ ] Self-hosted LibreTranslate option for production-grade accuracy
- [ ] Proper language auto-detect via API (current detection is script-based only, so it can't distinguish Latin-script languages like Spanish vs. French)

## License

MIT — see [LICENSE](./LICENSE) for details.

## Acknowledgements

- [MyMemory Translation API](https://mymemory.translated.net/) — primary translation provider
- [Lingva Translate](https://github.com/thedaviddelta/lingva-translate) — fallback translation provider
- [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) & [Inter](https://fonts.google.com/specimen/Inter) — typefaces
