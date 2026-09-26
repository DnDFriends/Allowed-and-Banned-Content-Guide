# D&D Friends Allowed and Banned Content Guide — GitHub Ready v7

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

### Data check (for staff)

Every time data loads, the page checks it for broken cells: bare numbers in errata columns, links that are not web addresses, spell levels outside 0–9, parent IDs that point at nothing, source groups and source tags that are not on the Sources tab. Broken values are hidden or worked around so players never see them, and each one is listed under **More → Data check** (also logged to the browser console). If that button shows a warning, fix the listed cells in the Sheet.

## v7.3 — three-state filters (show only / hide)

- The Status and Source dropdowns are replaced by filter chips in **Search & Filter**. Each chip cycles on click: **1st click** shows only matching entries (✓), **2nd click** hides matching entries (✕, struck through), **3rd click** clears it.
- Several "show only" chips in the same group mean "any of these" (for example, Banned **or** Superseded). A hidden chip always wins, and the Status and Source groups combine, so you can, for example, show only Banned while hiding one source.
- The summary cards (Allowed / Banned / Superseded) use the same cycle; **All Options** clears the status filters.
- The Source list has **Show only** and **Hide** buttons for each source.
- In the search box, a word starting with `-` hides entries containing it (e.g. `fire -delayed`, `-ua2026`).
- The top bar summary spells out what's active ("Only: Banned • Hiding: Player's Handbook (2024)").
- Shareable links carry both kinds of filter as comma lists with `-` for hidden, e.g. `#status=Banned&source=-XPHB`. Old links like `#status=Banned` still work, and a browser's saved Status/Source choice from the old dropdowns carries over as "show only".

## v7.2 — Crooked Moon theme

- New **Crooked Moon** preset (under Additional Themes), built from the Crooked palette: black `#0C0D10` page, dark `#1E2930` panels, blue `#395262` borders and hover, moon `#BAD7E4` secondary text, yellow `#FBF36C` item names, and gold `#E5C758` accent. It matches the Magic Item Table's Crooked Moon theme exactly.
- The Magic Item Table now also has **Phoenix**, so all 47 themes are shared between the two sites.

## v7.1 color schemes (matched to the September 2026 Magic Item Table)

- Every preset now uses the MIT's refined palette: softer page and panel colors, restrained accents, and AA text contrast. Page, panel and accent colors match the MIT exactly for all 45 shared themes. Phoenix only exists in this guide, so it was run through the same refinement.
- The screen contrast pass, button/control/active colors, and Quick Tricolor Theme Builder use the MIT's formulas.
- With **Preserve guide status colors** on, Allowed/Banned/Superseded are darkened just enough on light themes to stay readable, the same way the MIT darkens its fixed attunement orange.
- Checked: in all 46 themes, with status colors preserved and not, every text color (body, secondary, item names, status badges, links, buttons, inputs, header, toast) reads at 4.5:1 or better.

## v7 UX cleanup

- Fixed data problems in the embedded snapshot (a stray `279` in 24 rows; the "Dhakaani Golin'dar" typo). Five banned species (Deep Imaskari, Drider, Illithidkin, Kuo-Toa, Myconid) now appear. **The same values are probably still in the live Sheet — see Data check.**
- Summary numbers are clickable: tap **Banned** to see only banned options; tap again to clear. **Sources** opens a source list explaining every tag.
- Summary numbers and "shown" counts now follow the current tab and agree with each other.
- Shareable links: the address bar updates as you browse (for example `#view=spells&status=Banned`). **More → Copy link to this view** or **Copy link** in Search & Filter copies it.
- Search matches every word in any order ("dhakaani goblin") and ignores spaces as a fallback ("fire ball" finds Fireball).
- Spells has an A–Z jump bar.
- Everything view hides empty categories while searching; a no-results message offers "Clear search and filters".
- Readable highlighted buttons (the theme button, open Search & Filter, Save Theme, Build Tricolor Theme).
- Phone layout: filter fields stack, the toolbar wraps instead of running off-screen, the summary is one compact row, and the tab row fades to show there are more tabs.
- Cards keep their own height instead of stretching to their row, and the repeated parent-class link under every subclass is gone.
- Banned and Superseded items have a colored edge; Allowed badges are quieter.
- Long Document: search/filter controls are hidden (they don't apply there) and names on the parchment page are dark and readable.
- Plainer labels: "Default" theme, "Display" (text size, font, page zoom), mode descriptions, "Show jump bar", "Reset view & filters", "Refresh data". Font and text size live only in Display.
- The header badge reads "Updated Sep 11, 2026" (the full Data Draft label shows on hover).

## Interface features carried over from v6

- application-wide contrast-safe theme handling and themed content names, including Pride/Trans gradient treatments;
- Search & Filter drawer, closed by default (`/` opens it and focuses search; Escape closes temporary UI);
- active-filter/result summary and Clear All;
- Display menu, Simple Mode, and Mobile Mode;
- hover/focus/tap content details with status, source, parent/category, level, and errata;
- optional bottom jump bar, hidden by default;
- More menu for secondary actions and data status;
- saved browsing/display/filter/mode state with versioned migrations (a shared link overrides the saved view);
- slimmer sticky navigation after scrolling.

Intentionally **not** included: hierarchy collapsing.

## Theme system

The build retains the large preset catalogue, custom theme editor, tricolor builder, theme import/export, and guide semantic-status color preservation.

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
