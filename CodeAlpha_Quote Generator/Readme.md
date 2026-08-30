# 💬 Random Quote Generator

A single-file, no-build, no-dependency web app styled as a phone-frame "quote card" — tap for a fresh quote, have it read aloud, share it, or save it as a favorite. Pure HTML, CSS, and vanilla JavaScript.

![Status](https://img.shields.io/badge/status-active-brightgreen) ![No build step](https://img.shields.io/badge/build-none%20required-blue) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## ✨ Features

- **Shuffle-bag randomization** — every quote is shown once before any quote repeats, so it never feels stuck in a loop.
- **Previous / Next navigation** — full history, not just one-way forward; the ◀ button and the ← arrow key both step back.
- **🔊 Pronounce** — reads the current quote and author aloud using the browser's built-in Web Speech API, with a voice picker that auto-matches your browser language. Tap again to stop.
- **📤 Share / Copy** — uses the native share sheet on mobile (`navigator.share`), falling back to a clipboard copy with a toast confirmation on desktop.
- **♥ Favorites** — saved to `localStorage`, so favorited quotes persist across visits.
- **Keyboard shortcuts** — → or Space for the next quote, ← for the previous one.
- **Accessible** — live region announces new quotes to screen readers, icon buttons have descriptive `aria-label`s, visible focus states, `prefers-reduced-motion` respected.
- **Responsive** — the phone-frame UI scales to fit small and short viewports instead of overflowing.
- **Zero dependencies** — no framework, no npm install, no build step. (Uses Google Fonts for the display typefaces; falls back gracefully to system fonts if offline.)

---

## 🚀 Getting Started

No installation required.

1. Clone or download this repository.
2. Open `quote-generator-app.html` in any modern browser.

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
open quote-generator-app.html   # macOS
# or just double-click the file on Windows/Linux
```

### Optional: serve it locally

Some browsers restrict certain APIs (like clipboard access or the native share sheet) on `file://` pages. If you run into that, serve it over a local server instead:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/quote-generator-app.html
```

---

## 🖱 Usage

| Action | How |
|---|---|
| Get a new quote | Click **New Quote →**, press **→**, or press **Space** |
| Go back to the previous quote | Click **‹**, or press **←** |
| Hear the quote aloud | Click **🔊** (pick a voice from the dropdown first, if you like) — click again to stop |
| Save / unsave a favorite | Click the **♥** in the top-right of the card |
| Copy or share the quote | Click **📤** — opens your device's share sheet on mobile, or copies to clipboard on desktop |

---

## 📁 Project Structure

```
.
├── quote-generator-app.html   # the entire app — HTML, CSS, and JS in one file
└── README.md
```

Everything is intentionally kept in a single file for maximum portability: it can be opened directly, hosted anywhere (GitHub Pages, any static host), or embedded, with no build tooling required.

---

## 📝 About the Quotes

The app ships with 30 short, widely-attributed quotes from historical and public figures. To add your own, edit the `quotes` array near the top of the `<script>` block in `quote-generator-app.html`:

```js
{ text: "Your quote here.", author: "Author Name" }
```

---

## 🌐 Browser Support

Works in current versions of Chrome, Edge, Firefox, and Safari.

- **🔊 Pronounce** depends on the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — voice availability varies by browser/OS. The button disables itself automatically if the API isn't supported.
- **📤 Share** uses the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) where available (mainly mobile browsers) and falls back to clipboard copy everywhere else.
- **♥ Favorites** requires `localStorage`; if it's unavailable (e.g. some private-browsing modes), favoriting simply won't persist between visits, without breaking the rest of the app.

---

## 🛣 Roadmap / Ideas

- A "View Favorites" panel to browse and revisit saved quotes, not just mark them.
- Category or mood filters (motivational, humor, etc.) as the quote list grows.
- An "Add your own quote" input for personal use.
- Swipe gestures for next/previous on touch devices.

Contributions and suggestions are welcome — feel free to open an issue or PR.

---

## 📄 License

MIT — free to use, modify, and distribute.
