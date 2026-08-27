# ⚙ Mechanical Drawing — Flange Designer

A single-file, no-build, no-dependency web app that renders a live, editable **orthographic technical drawing** of a flange (Front View, Top View with hidden lines, and Right Side View) directly in the browser as SVG — with real-time dimensioning, unit conversion, text-to-speech readouts, and export to SVG/PDF.

![Status](https://img.shields.io/badge/status-active-brightgreen) ![No build step](https://img.shields.io/badge/build-none%20required-blue) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## ✨ Features

- **Live, editable technical drawing** — Front View, Top View (with correct hidden/dashed lines for the bore and bolt holes), and Right Side View, all driven from four inputs: outer diameter, inner diameter, thickness, and bolt circle diameter.
- **Synced number inputs + sliders** for fast, precise adjustments.
- **Real-time validation** with a non-blocking inline banner (no jarring `alert()` popups) — invalid inputs are highlighted directly.
- **Unit toggle (mm / in)** — all readouts and dimension labels can display in millimeters or inches.
- **🔊 Pronounce Dimensions** — reads the current dimensions aloud using the browser's built-in Web Speech API, with a voice picker.
- **Shareable links** — copies a URL that encodes the current dimensions, so anyone can reopen the exact same drawing.
- **Export**
  - **Print / PDF** via the browser's native print dialog (clean print stylesheet, UI chrome hidden).
  - **Export SVG** — downloads the drawing as a standalone `.svg` file.
- **Responsive** — works down to mobile screens.
- **Accessible** — keyboard-navigable, visible focus states, ARIA live regions for status messages, `prefers-reduced-motion` respected.
- **Zero dependencies** — pure HTML, CSS, and vanilla JavaScript. No build step, no npm install, no framework.

---

## 🚀 Getting Started

No installation required.

1. Clone or download this repository.
2. Open `mechanical-drawing-app.html` in any modern browser.

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
open mechanical-drawing-app.html   # macOS
# or just double-click the file on Windows/Linux
```

### Optional: serve it locally

Some browsers restrict certain APIs (like clipboard access for the share link) on `file://` pages. If you run into that, serve it over a local server instead:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/mechanical-drawing-app.html
```

---

## 🖱 Usage

| Action | How |
|---|---|
| Change a dimension | Type a value or drag the matching slider under **Part Dimensions** |
| Reset to defaults | Click **Reset Dimensions** |
| Switch units | Click **MM** / **IN** in the top-right of the header |
| Hear the dimensions | Click **🔊 Pronounce Dimensions** (pick a voice from the dropdown first, if you like) |
| Share this exact drawing | Click **🔗 Copy Share Link**, then send the copied URL |
| Print or save as PDF | Click **🖨 Print / PDF** |
| Download the raw drawing | Click **↓ Export SVG** |

### Valid dimension ranges

| Dimension | Min | Max |
|---|---|---|
| Outer diameter | 60 mm | 200 mm |
| Inner diameter | 10 mm | 80 mm |
| Thickness | 5 mm | 50 mm |
| Bolt circle diameter | 30 mm | 150 mm |

The app also enforces engineering constraints: the inner diameter and bolt circle must both be smaller than the outer diameter, and the bolt circle must be larger than the inner diameter.

---

## 📁 Project Structure

```
.
├── mechanical-drawing-app.html   # the entire app — HTML, CSS, and JS in one file
└── README.md
```

Everything is intentionally kept in a single file for maximum portability: it can be opened directly, hosted anywhere (GitHub Pages, any static host, an internal file share), or embedded, with no build tooling required.

---

## 🌐 Browser Support

Works in current versions of Chrome, Edge, Firefox, and Safari. The **Pronounce Dimensions** feature depends on the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API), which has varying voice availability by browser/OS; the button disables itself automatically if the API isn't supported.

---

## 🛣 Roadmap / Ideas

- A true sectional view (A-A) with hatching, per standard drafting convention.
- Editable title block fields (drawing number, material, tolerance, revision).
- Save/load multiple named parts (localStorage).
- Additional part templates beyond the flange.

Contributions and suggestions are welcome — feel free to open an issue or PR.

---

## 📄 License

MIT — free to use, modify, and distribute.
