# Aurora Assistant — FAQ Chatbot

An in-browser FAQ chatbot with a dashboard sidebar, typed **and** voice input,
and a read-aloud ("pronounce") option for every reply. No backend, no API
key, no build step — open `index.html` and it runs.

## Files

| File | What it does |
|---|---|
| `index.html` | Page structure and content |
| `style.css` | All styling — theme colors, layout, responsive rules |
| `script.js` | Matching engine (TF-IDF), chat logic, voice features, dashboard |

Keep all three files in the same folder — `index.html` loads the other two
by relative path (`href="style.css"`, `src="script.js"`).

## Running it

**Easiest:** double-click `index.html` — it opens directly in your browser
and works fully offline (voice features and Google Fonts need an internet
connection; everything else does not).

**Recommended for voice input:** some browsers only allow the microphone
over `http://localhost` or `https://`, not a `file://` path. Serve the
folder locally instead:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000`.

## How to talk to it

- **Type** a question in the input bar and press Enter or tap send — this
  always works, in every browser.
- **Tap a suggestion chip** to ask that question instantly.
- **Tap the mic icon** to ask by voice (Chrome/Edge have the best support;
  the button disables itself with a tooltip if your browser can't do this).
- **Tap the speaker icon** on any reply to hear it read aloud, or turn on
  **Auto-read replies** in the sidebar to have every answer read
  automatically. Voice, speed, and language are configurable in the
  sidebar's Voice section.
- **Esc** stops read-aloud, or closes the dashboard drawer on mobile.

## Editing the FAQ content

Open `script.js` and edit the `FAQS` array near the top:

```js
const FAQS = [
  { q: "Your question here?", a: "Your answer here." },
  // add as many as you like
];
```

The matching engine (TF-IDF + cosine similarity) rebuilds itself
automatically from whatever is in this array — no other code needs to
change. To rebrand, update the `<title>`, the header text, and the
`brand`/`header-text` copy in `index.html`.

`SIMILARITY_THRESHOLD` (also near the top of `script.js`) controls how
close a question has to be to a known FAQ before the bot answers instead of
saying "I'm not sure." Raise it to make the bot more cautious, lower it to
make it answer more liberally.

## Dashboard features

- **Session stats** — questions asked, average match confidence, helpful
  rate, session time.
- **Voice controls** — auto-read toggle, voice picker (populated from your
  OS/browser's installed voices, so it supports whatever languages your
  system offers), and a speed slider.
- **Theme toggle** — light / dark, also available as a quick icon in the
  header.
- **New chat** — resets the conversation and stats.
- **Export transcript** — downloads the conversation as a `.txt` file.

Nothing is stored between visits — no cookies, no `localStorage`. Stats and
chat history reset on page reload, by design, so no personal data lingers
in the browser.

## Browser support

| Feature | Works everywhere? |
|---|---|
| Typed chat | ✅ Yes, always |
| Suggestion chips | ✅ Yes, always |
| Read-aloud (TTS) | Most modern browsers. Falls back to a disabled button with a tooltip if unavailable. |
| Voice input (STT) | Best in Chrome/Edge; limited in Firefox and older Safari. Falls back to a disabled button with a tooltip if unavailable. |
| Copy to clipboard | Falls back to a manual-selection prompt on very old browsers. |

The sidebar's small status dots (● Read-aloud / ● Voice input) show live
whether your current browser supports each feature.

## Known limitations / ideas for later

- FAQ answers are in a single language (whatever you write them in);
  voice input/output follow the visitor's browser language, but the text
  answers themselves aren't auto-translated.
- Matching is keyword-based (TF-IDF). It's accurate for a small, focused
  FAQ set; for hundreds of questions or heavily paraphrased queries, a
  semantic/embeddings-based matcher would do better.
- No persistence or backend — helpful/not-helpful votes and low-confidence
  queries aren't logged anywhere, which would be the natural next step for
  actually improving the FAQ set over time.
