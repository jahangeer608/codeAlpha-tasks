# StudyCards — Flashcard Quiz App

A browser-based flashcard quiz app styled as an iPhone-frame mockup: flip
cards, self-score your recall, manage your own deck, and have cards read
aloud — all client-side, no build step, no server, no accounts.

## 1. How to run this project

No installation and no internet connection is required beyond loading the
optional Google Fonts (the app falls back to system fonts if that request
fails, so it still works fully offline).

1. Open the `studycards` folder in VS Code (or any editor/file browser).
2. Easiest: just double-click `index.html` to open it in any browser — no
   build step, no dependencies, no server.
3. Optional: install the **Live Server** extension in VS Code and right-click
   `index.html` → "Open with Live Server" for auto-reload while you edit.
4. Below 400px viewport width the phone-frame chrome drops away and the app
   fills the screen edge-to-edge, so it works the same on an actual phone
   browser as it does in the desktop mockup.

Files:
- `index.html` — page structure (header/toolbar, flip card, manage list, modal)
- `style.css` — the phone-mockup styling, category colour system, mobile layout
- `script.js` — all app logic (fully functional, no stubs, no console errors)

## 2. Data model

Cards live in memory only, in a plain JavaScript array (`cards` in
`script.js`), seeded with 10 example questions across Biology, Geography,
Chemistry, Literature, Math, Astronomy and History. There is no backend and
no browser storage — refreshing the page resets the deck to the seed data.
If you want the deck to persist between visits, the natural next step is to
add `localStorage` (or a small backend) around the `cards` array; it's kept
out for now so the app has zero dependencies and works identically in any
environment.

## 3. Features

### Study tab
- **Flip card** — tap the card (or "Show Answer") to reveal the answer;
  tap again to flip back.
- **Previous / Next** — browse the deck manually.
- **Got it ✅ / Review again 🔁** — self-score each card. Scores show live
  in the header ("✅ 3 · 🔁 1") and a toast summarises your results once you
  loop back to the start of the deck.
- **Shuffle** — randomises card order (Fisher–Yates shuffle).
- **Pronounce 🔊** — toggles the browser's built-in Web Speech API. When on,
  the question is read aloud on each new card, and the answer is read aloud
  when you flip. No audio files, no API key, no server round-trip; on the
  rare browser without speech support the button disables itself instead of
  erroring.
- **Category colour tags** — each subject gets a consistent colour (hashed
  from its name) so a mixed deck is easy to scan at a glance.
- **Keyboard shortcuts** (desktop): `←`/`→` to navigate, `space` to flip,
  `1` for Got it, `2` for Review again. Shortcuts are automatically ignored
  while you're typing in the Add/Edit modal.

### Manage tab
- **Add / Edit / Delete** cards via a bottom-sheet modal (category, question,
  answer).
- **Search** — filters the list live by question, answer, or category text.
- Empty states for "no cards yet" and "no search results."

## 4. Accessibility & robustness

- Visible keyboard focus rings throughout.
- `aria-live` regions on the toast and pronounce stats so screen readers
  pick up status changes.
- `prefers-reduced-motion` support — card-flip and slide-up animations are
  disabled for users who've asked their OS for reduced motion.
- Question/answer/category text is escaped before being inserted into the
  Manage list, so pasted text can't break the layout or inject markup.
- Deleting the currently-viewed card, emptying the whole deck, or searching
  to zero results are all handled without breaking navigation or throwing
  errors.

## 5. Code explanation (for a write-up or submission)

`script.js` is a single IIFE (so it never leaks globals) organised into:
1. **Data** — the in-memory `cards` array plus `stats` (correct/review
   counts) and `settings` (pronounce on/off).
2. **Render functions** — `renderCard()` draws the current flashcard and
   progress bar; `renderList()` draws the searchable Manage list;
   `renderStats()` updates the header score readout.
3. **Actions** — `flip()`, `advance()` (used by the Got it/Review buttons),
   the shuffle handler, and the Add/Edit/Delete modal handlers.
4. **Speech** — a small `speak()` wrapper around
   `window.speechSynthesis` that cancels any in-flight utterance before
   speaking the next one, so rapid card changes never queue up overlapping
   audio.

## 6. What to screenshot for submission
1. Study tab, front of card, with the progress bar and header stats visible.
2. Study tab, card flipped to the answer.
3. The "Got it / Review again" buttons and the resulting score in the header.
4. Manage tab with a few cards and the search box filtering results.
5. The Add/Edit modal open.
