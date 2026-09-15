# D&D Friends Allowed and Banned Content Guide — GitHub Ready v6

This is the production GitHub Pages build of the **D&D Friends Allowed and Banned Content Guide**.

`index.html` is fully self-contained: its CSS, JavaScript, live Google Sheets loader, fallback dataset, theme system, and UI behavior are embedded in the page. This avoids missing-asset problems on GitHub Pages and also makes local testing easy.

## Deploy to GitHub Pages

1. Open the repository used for the Content Guide.
2. Replace the old site files at the repository root with the contents of this folder.
3. Commit/push to the branch GitHub Pages uses (normally `main`).
4. In **Settings → Pages**, use **Deploy from a branch**, `main`, `/ (root)` if it is not already configured.
5. Hard-refresh the published page after deployment (`Ctrl+F5` on Windows).

`.nojekyll` is included. No `CNAME` is included because a CNAME requires a real custom hostname, not the site display title.

## Content updates

Normal rules/content changes should be made in the Google Sheet, not in this HTML.

Google Sheet ID:

`1i8i5JMJCbrRivC7QpjdGwED-dZli-kf_pXTJaBucADU`

Editor:

https://docs.google.com/spreadsheets/d/1i8i5JMJCbrRivC7QpjdGwED-dZli-kf_pXTJaBucADU/edit

The site uses the Sheet as its live data source and also includes an embedded fallback snapshot so the guide remains usable if the live feed is unavailable.

## v6 MIT-parity interface

This release carries over the approved design principles from the current D&D Friends Magic Item Table UI:

- application-wide contrast-safe theme handling;
- MIT-style themed content names, including Pride/Trans gradient treatments;
- Search & Filter drawer, closed by default;
- active-filter/result summary and Clear All;
- Display menu with text sizing, fonts, interface scale, and Auto Fit;
- Simple Mode and touch-oriented Mobile Mode;
- hover/focus/tap content details with status, source, parent/category, level, and errata where applicable;
- optional bottom navigation, hidden by default;
- More menu for secondary actions and data status;
- technical Google Sheet status removed from the main interface;
- saved browsing/display/filter/mode/navigation state;
- versioned local settings migrations;
- visual theme-preset preview;
- Escape closes temporary UI;
- `/` opens Search & Filter and focuses search;
- slimmer sticky navigation after scrolling;
- MIT-style mobile touch sizing and one-column presentation.

Intentionally **not** included: hierarchy collapsing and permalink/deep-link behavior.

## Theme system

The build retains the large MIT-style preset catalogue, custom theme editor, tricolor builder, theme import/export, font/text scaling, and guide semantic-status color preservation.

Theme and UI preferences are stored only in the visitor's browser via `localStorage`; they do not modify the Google Sheet.

## Live Google Sheet access

A public GitHub Pages site must be able to read the Sheet. If live loading does not work, make sure the required Sheet data is available through Google's read-only web publishing/sharing configuration. Edit access should remain restricted to staff.

## Local test

You can open `index.html` directly, or serve the folder locally:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000/`
