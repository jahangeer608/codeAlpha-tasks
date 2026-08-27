# Employee Engagement Survey App

A self-contained, single-file HTML survey tool for collecting anonymous employee engagement feedback, aggregating results live, and generating an auto-updating summary report — no backend required.

![status](https://img.shields.io/badge/status-demo-yellow) ![type](https://img.shields.io/badge/type-single--file%20HTML-blue) ![license](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **12 Likert-scale questions** (1–5, Strongly Disagree → Strongly Agree) covering satisfaction, recognition, growth, communication, work–life balance, and collaboration
- **3 open-ended questions** for free-text feedback
- **Form validation** — every rating question is required before submission; the app scrolls to the first unanswered question
- **Live Results tab** — averages, response counts, and open-text comments recompute automatically as new responses come in
- **Anonymity threshold** — results stay hidden until at least 3 responses are collected
- **Auto-generated Summary Report** — strongest/weakest areas, key findings, and recommendations are computed from real submitted data, not hardcoded
- **CSV export** of all responses
- **Configurable branding** — set your organization name and industry from an in-app settings panel; no code editing required
- **Seeded sample data** — ships with 5 sample responses so Live Results and the Summary Report have something to show immediately; clear or restore them anytime
- **Print-friendly report** view
- **Accessible** — proper ARIA roles on tabs, keyboard navigation (arrow keys) between tabs, visible focus states, `prefers-reduced-motion` support

## Screenshot

*(Add a screenshot here — e.g. `docs/screenshot.png` — once you have one.)*

## How it works

This app is a single HTML file with inline CSS and JavaScript. It has no server, no build step, and no external dependencies.

### Storage

Responses are persisted using a storage API when the file is opened as a **Claude artifact** on [claude.ai](https://claude.ai). In that context, data is shared across everyone using the artifact, so results genuinely aggregate.

If that storage API isn't available (for example, when the file is downloaded and opened directly in a browser), the app automatically falls back to an **in-memory store** scoped to the current browser tab. Every feature still works in this mode — submitting, live results, the report, CSV export — but data resets on page reload and isn't shared with anyone else. A note at the top of the survey tells you which mode you're in.

> **For a production deployment**, replace the storage layer (`storageGet` / `storageSet` / `storageList` / `storageDelete` in the `<script>` block) with calls to a real backend — e.g. a small API in front of Postgres, Firebase, or Supabase — so responses persist durably and survive across devices and sessions.

## Getting started

1. Download `employee-engagement-survey-app.html`
2. Open it in any modern browser, **or** upload/open it as a Claude artifact for persistent, shared storage
3. Click **⚙ Customize for your organization** to set your company name and industry
4. Share the file (or artifact link) with employees to collect responses
5. Check the **Live Results** and **Summary Report** tabs as responses come in

No installation, build tools, or dependencies required.

## Usage

| Tab | Purpose |
|---|---|
| **Take Survey** | The form employees fill out. Anonymous, ~5 minutes. |
| **Live Results** | Aggregated averages per question, response count, and open-text feedback. Hidden until 3+ responses to protect anonymity. |
| **Summary Report** | Auto-generated findings: strongest/weakest areas, recommendations, and a printable write-up. |

### Admin actions (Live Results tab)

- **Refresh** — manually re-pull the latest data
- **Restore sample responses** — bring back the 5 seeded demo responses if you cleared them
- **Export CSV** — download all responses (including a column marking sample vs. real data)
- **Clear all responses** — wipes stored data (asks for confirmation)

## Customization

- **Questions** — edit the `likertQuestions` and `openQuestions` arrays near the top of the `<script>` block
- **Anonymity threshold** — change `MIN_RESPONSES_TO_SHOW` (default: `3`)
- **Recommendation copy** — edit the `improvementIdeas` map used to generate report suggestions per question
- **Colors / fonts** — all design tokens are CSS custom properties in `:root` at the top of the `<style>` block

## Known limitations

This is a demo-grade, single-file tool. Before using it for a real company rollout, consider:

- No authentication or role separation between employees and HR/admin — anyone with the link can view Live Results and clear data
- No real backend — storage is either a Claude artifact's built-in store or an in-memory fallback, not a durable database
- Single fixed survey — no support for multiple concurrent surveys, scheduling, or recurring cycles
- No department/team-level breakdowns or minimum-sample safeguards beyond the overall response count
- No multi-language support

## License

MIT — use, modify, and distribute freely.
