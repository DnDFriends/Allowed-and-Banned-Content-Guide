# D&D Friends Allowed and Banned Content Guide

Production-ready static website for the D&D Friends 5R content guide.

The site is designed for **GitHub Pages** and uses the D&D Friends Google Sheet as its live data source. It also contains an embedded snapshot so the guide remains usable if Google Sheets is temporarily unavailable.

## Live Google Sheet

**Spreadsheet ID:** `1i8i5JMJCbrRivC7QpjdGwED-dZli-kf_pXTJaBucADU`

**Editor:** https://docs.google.com/spreadsheets/d/1i8i5JMJCbrRivC7QpjdGwED-dZli-kf_pXTJaBucADU/edit

The website reads these tabs:

- Sources
- Classes
- Subclasses
- Species
- Class Options
- Backgrounds
- Feats
- Spells
- Site Config

The live feed refreshes automatically every **5 minutes** and users can also press **Refresh Data** for an immediate reload.

## Important: make the sheet readable by the public site

A static GitHub Pages site cannot read a private Google Sheet without OAuth.

Before publishing the website, make the data readable from the web using one of Google's read-only public options. The safest workflow is to **Publish to web** while keeping edit access restricted to staff:

1. Open the Google Sheet.
2. Use **File → Share → Publish to web**.
3. Publish the workbook or all tabs used by the site.
4. Do **not** give public edit access.

The site never writes to the Sheet. Website visitors only read the published data.

## GitHub Pages deployment

### Easiest method

1. Create a GitHub repository, for example `dnd-friends-content-guide`.
2. Upload **the contents of this folder** to the repository root. Do not upload the outer folder itself as a nested directory.
3. Commit the files to the `main` branch.
4. Open **Repository Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select `main` and `/ (root)`.
7. Save.

GitHub will provide the public Pages URL after the first deployment.

`.nojekyll` is included so GitHub Pages serves the site as ordinary static files without Jekyll processing.

## Updating content

For normal rule updates, **do not edit the website files**.

Edit the Google Sheet instead. The site will update from the Sheet automatically within five minutes, or immediately when a visitor presses **Refresh Data**.

The static `data.js` and `data.json` files are fallback snapshots. They are only used when the live Sheet cannot be reached. Replacing those snapshots is optional for routine changes but recommended before major releases.

## Included color themes

Theme choice is stored locally in each visitor's browser and does not change the spreadsheet or affect other users.

- Default
- White with Black Text
- Black with White Text
- Phoenix
- NY Knicks
- D&D Beyond
- Roll20
- Foundry VTT
- Custom

The Custom theme includes both basic and advanced color controls. Long Document view can use either **Parchment** or **Match Theme**. Print/PDF output uses a clean print-safe presentation.

## Repository files

| File | Purpose |
| --- | --- |
| `index.html` | Main website page |
| `style.css` | Layout, responsive styling, themes, and print styles |
| `app.js` | Search, filtering, rendering, theme controls, long-document mode, and refresh behavior |
| `live-sheet.js` | Google Sheets live-data loader and Sheet ID |
| `data.js` | Embedded fallback dataset used directly by the browser |
| `data.json` | Human/machine-readable fallback snapshot |
| `.nojekyll` | Prevents GitHub Pages Jekyll processing |
| `.gitignore` | Ignores common local OS/editor files |

## Custom domain (optional)

A GitHub Pages `CNAME` file is only needed if you later connect a real hostname, for example `guide.example.com`. The site title **D&D Friends Allowed and Banned Content Guide** is not a valid CNAME value because CNAME files must contain a domain/hostname.

## Local testing

Double-clicking `index.html` usually works because the site has an embedded data fallback, but live Google Sheet access is best tested through a local web server.

From this directory, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Data behavior

- Default view: **Everything**
- Search and filters work across the content database.
- Subclasses are tied to their parent class by ID.
- Species variants remain attached to their parent species where applicable.
- Status values: **Allowed**, **Banned**, **Superseded**.
- Source badges can link to D&D Beyond or the original publication when a URL exists in the Sources sheet.
- Server errata/modifications are displayed from the relevant sheet fields.
- Long Document mode can be printed or saved as PDF.

## Maintenance note

`live-sheet.js` contains the Google Sheet ID. If the master spreadsheet is ever replaced rather than edited in place, update the `spreadsheetId` and `spreadsheetUrl` values in that file.
