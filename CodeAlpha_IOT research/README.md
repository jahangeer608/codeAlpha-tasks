# 🏡 BloomHome — Smart Home Dashboard

A phone-frame IoT dashboard concept — control rooms and devices, monitor live energy usage, arm your security system, and get spoken status briefings — built with plain HTML, CSS, and vanilla JavaScript.

![Status](https://img.shields.io/badge/status-active-brightgreen) ![No build step](https://img.shields.io/badge/build-none%20required-blue) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## ✨ Features

- **Five-tab dashboard** — Home, Devices, Energy, Security, and Profile, all in a realistic phone-frame UI.
- **Home Pulse score** — a live animated ring summarizing overall home activity.
- **Device control** — toggle any of 12 devices on/off, filter by room, search by name, with quick-access tiles on the Home tab.
- **Live energy chart** — powered by Chart.js when available online, with an automatic graceful fallback bar chart if the CDN can't be reached (e.g. offline).
- **Thermostat** — adjustable via buttons or a slider, with a **°C / °F toggle** for global usability.
- **Security panel** — arm/disarm toggle, camera tiles, and dedicated security device controls.
- **🔊 Voice Briefing** — a header button reads a full spoken summary of the home's current status (pulse score, active devices, energy, temperature, humidity, security) using the browser's built-in Web Speech API.
- **🔊 Per-device announce** — every device card has its own speaker icon to read that device's status aloud.
- **Voice picker** — choose a preferred voice on the Profile tab, auto-matched to your browser's language where possible.
- **Fully functional settings rows** — Household, Notifications, Network, and Help all give real feedback instead of doing nothing.
- **Accessible** — keyboard focus is preserved when toggling devices, visible focus states throughout, ARIA labels on icon buttons, `prefers-reduced-motion` respected.
- **Battery-friendly** — background update loops automatically pause when the browser tab isn't visible.
- **Responsive** — the phone-frame chrome drops away on small screens so it behaves like a normal mobile page.

---

## 🚀 Getting Started

No installation required — this is a static site.

1. Clone or download this repository.
2. Open `index.html` in any modern browser.

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
open index.html   # macOS
# or just double-click the file on Windows/Linux
```

### Optional: serve it locally

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/index.html
```

---

## 🖱 Usage

| Action | How |
|---|---|
| Switch tabs | Tap **Home / Devices / Energy / Security / Profile** in the bottom nav |
| Toggle a device | Tap the switch on any device card or quick tile |
| Filter devices | Tap a room chip, or type in the search box on the Devices tab |
| Adjust temperature | Use **−** / **+** or drag the slider on the Energy tab |
| Switch temperature units | Profile tab → **Preferences** → °C / °F |
| Arm / disarm security | Tap the **Armed** / **Disarmed** button on the Security tab |
| Hear a full status briefing | Tap the 🔊 icon in the header |
| Hear one device's status | Tap the 🔊 icon on that device's card |
| Choose a voice | Profile tab → **Voice & accessibility** |
| Repeat the last briefing | Profile tab → **Repeat last briefing** |

---

## 📁 Project Structure

```
.
├── index.html   # markup
├── style.css    # all styling
├── script.js    # app logic
└── README.md
```

`index.html` loads Chart.js from a CDN for the energy graph and falls back to a simple built-in bar chart automatically if that CDN is unreachable — no broken page either way.

---

## 🌐 Browser Support

Works in current versions of Chrome, Edge, Firefox, and Safari.

- **🔊 Voice Briefing / per-device announce** depends on the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — voice availability varies by browser/OS. Buttons disable themselves automatically if the API isn't supported.
- **Live energy chart** depends on the Chart.js CDN; without internet access it falls back to a lightweight built-in bar chart so the tab still works.

---

## 🛣 Roadmap / Ideas

- Persist device states and thermostat setting in `localStorage` so a page refresh doesn't reset the simulated home.
- Build out real sub-pages for Notifications and Network status instead of quick-feedback toasts.
- Push-style alerts (e.g. "Front Door unlocked") tied into the activity log and voice briefing.
- Multi-user support / household member switching.

Contributions and suggestions are welcome — feel free to open an issue or PR.

---

## 📄 License

MIT — free to use, modify, and distribute.
