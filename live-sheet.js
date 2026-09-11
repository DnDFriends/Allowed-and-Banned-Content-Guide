(() => {
  const config = {
    spreadsheetId: "1i8i5JMJCbrRivC7QpjdGwED-dZli-kf_pXTJaBucADU",
    spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1i8i5JMJCbrRivC7QpjdGwED-dZli-kf_pXTJaBucADU/edit",
    refreshMinutes: 5,
    timeoutMs: 15000,
    sheets: {
      sources: "Sources",
      classes: "Classes",
      subclasses: "Subclasses",
      species: "Species",
      classOptions: "Class Options",
      backgrounds: "Backgrounds",
      feats: "Feats",
      spells: "Spells",
      siteConfig: "Site Config"
    }
  };

  function cleanValue(cell) {
    if (!cell) return "";
    if (cell.v === null || cell.v === undefined) return cell.f ?? "";
    return cell.v;
  }

  function tableToRows(response, sheetName) {
    if (!response || response.status !== "ok" || !response.table) {
      const detail = response?.errors?.map(e => e.detailed_message || e.message || e.reason).filter(Boolean).join("; ");
      throw new Error(detail || `Google Sheets did not return ${sheetName}.`);
    }
    const headers = response.table.cols.map((c, i) => String(c.label || c.id || `Column ${i + 1}`).trim());
    return response.table.rows
      .map(r => {
        const out = {};
        headers.forEach((h, i) => { if (h) out[h] = cleanValue(r.c?.[i]); });
        return out;
      })
      .filter(row => Object.values(row).some(v => v !== "" && v !== null && v !== undefined));
  }

  function loadSheet(sheetName) {
    return new Promise((resolve, reject) => {
      const callback = `__ddfSheet_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      let done = false;
      const cleanup = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { delete window[callback]; } catch (_) { window[callback] = undefined; }
        script.remove();
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Timed out loading ${sheetName}.`));
      }, config.timeoutMs);

      window[callback] = response => {
        try {
          const rows = tableToRows(response, sheetName);
          cleanup();
          resolve(rows);
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      script.onerror = () => {
        cleanup();
        reject(new Error(`Could not reach Google Sheets for ${sheetName}.`));
      };

      const tqx = `out:json;responseHandler:${callback}`;
      script.src = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(config.spreadsheetId)}/gviz/tq?sheet=${encodeURIComponent(sheetName)}&headers=1&tqx=${encodeURIComponent(tqx)}&_=${Date.now()}`;
      document.head.appendChild(script);
    });
  }

  async function load() {
    const entries = Object.entries(config.sheets);
    const loaded = await Promise.all(entries.map(async ([key, sheet]) => [key, await loadSheet(sheet)]));
    const raw = Object.fromEntries(loaded);
    const siteConfig = Object.fromEntries((raw.siteConfig || []).map(r => [String(r.Setting || "").trim(), r.Value ?? ""]));
    const statuses = String(siteConfig.Statuses || "Allowed;Banned;Superseded").split(";").map(s => s.trim()).filter(Boolean);
    return {
      meta: {
        title: siteConfig["Site Title"] || "D&D Friends Allowed and Banned Content Guide",
        draft: siteConfig["Data Draft"] || "Live Google Sheet",
        defaultView: siteConfig["Default View"] || "Everything",
        statusOrder: statuses,
        sourceDelimiter: siteConfig["Source Delimiter"] || ";",
        live: true,
        loadedAt: new Date().toISOString(),
        spreadsheetId: config.spreadsheetId
      },
      sources: raw.sources || [],
      classes: raw.classes || [],
      subclasses: raw.subclasses || [],
      species: raw.species || [],
      classOptions: raw.classOptions || [],
      backgrounds: raw.backgrounds || [],
      feats: raw.feats || [],
      spells: raw.spells || []
    };
  }

  window.ContentGuideLive = { config, load };
})();
