# Personnel Requisition Binder — Job Descriptions

A self-contained, single-file HTML app that presents a company's open job descriptions as a tabbed "folder binder," with region-based filtering and print support. No backend, no build step, no dependencies beyond a Google Fonts link.

![type](https://img.shields.io/badge/type-single--file%20HTML-blue) ![status](https://img.shields.io/badge/status-demo-yellow) ![license](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **8 filled-in job descriptions**, each laid out as a printable "sheet" with role title, employment meta (department, reports-to, experience, employment type, salary, openings, region), a summary pitch, key responsibilities, qualifications, and required skills
- **1 reusable template folder** (marked `TEMPLATE`) with bracketed placeholder copy — duplicate it to add a new role without rebuilding the layout from scratch
- **Region-based filtering** — filter chips (Islamabad, Lahore, Karachi, Remote, Template) show a live count and narrow the visible tabs to one region at a time
- **Tabbed folder navigation** — click a tab or use the arrow keys to move between visible roles; hidden tabs are skipped by keyboard navigation
- **Empty state** — if a region filter matches nothing, the app shows a message instead of a blank page
- **Print support** — print the currently open role, or use "Print all" to print every currently-visible (filtered) role as a paginated batch, one per page
- **Accessible** — proper ARIA roles (`tablist`/`tab`/`tabpanel`), `aria-pressed` on filter chips, visible keyboard focus, `prefers-reduced-motion` support

## Roles included

| Role | Region |
|---|---|
| Software Developer | Islamabad |
| HR Executive | Lahore |
| UI/UX Designer | Karachi |
| QA Engineer | Islamabad |
| Digital Marketing Executive | Remote |
| Sales Executive | Lahore |
| Financial Analyst | Karachi |
| Content Writer | Remote |
| *[Job Title]* | Template |

## Getting started

1. Download `job-descriptions.html`
2. Open it in any modern browser — that's it, no server or install needed
3. Use the region filter chips to narrow by location, or click through tabs to browse each role
4. Use **Print this file** on a single role, or **Print all** to print every currently-filtered role in one batch

## Customization

Everything lives in one file — no build tooling required to edit it.

- **Add a new role**: duplicate the `<article class="folder" id="panel-model">` template block (and its matching `<button class="tab">` entry), give both a new unique id, set `data-region` to one of `islamabad` / `lahore` / `karachi` / `remote`, and replace the bracketed placeholder text
- **Add a new region**: add a new `--region-<name>` color token in `:root`, a matching `.tab[data-region="<name>"]` CSS rule, and a filter chip button with `data-filter="<name>"`
- **Colors / fonts**: all design tokens are CSS custom properties at the top of the `<style>` block (`:root`)
- **Company name / footer text**: search for `Bright Path Solutions` and replace with your organization's name

## How it works

This is a static HTML + CSS + vanilla JavaScript app — no framework, no bundler.

- Tabs and folders are toggled via `hidden` attributes and `is-active` classes; only one folder is shown at a time in the standard view
- The region filter hides non-matching tabs with `is-region-hidden` and recalculates the header subtitle and chip counts on every change
- **Print all** temporarily un-hides every currently-visible folder, adds an `is-printing-all` class (used by print-specific CSS to force page breaks between folders), triggers `window.print()`, then restores the single-tab view once printing finishes (`afterprint` event)

## Known limitations

This is a static reference/demo tool, not a job-board CMS:

- Content is hardcoded in the HTML — there's no admin UI, form, or database; adding/editing roles means editing markup directly
- No search, sorting, or multi-region (AND/OR) filtering — one region filter at a time
- No routing — tabs aren't reflected in the URL, so a direct link always opens the first role
- No CSV/JSON export of the role data

## License

MIT — use, modify, and distribute freely.
