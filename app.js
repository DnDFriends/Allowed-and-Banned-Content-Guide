
const state = {
  data: null,
  view: "everything",
  query: "",
  status: "",
  source: "",
  dataMode: "loading",
  lastLiveRefresh: null
};

const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm = (v) => String(v ?? "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"");
const splitSources = (v) => String(v ?? "").split(";").map(s=>s.trim()).filter(Boolean);
const slug = (v) => norm(v).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");


/* ---------- User-selectable color themes ---------- */
const THEME_STORAGE_KEY = "ddf-content-guide-theme";
const CUSTOM_THEME_STORAGE_KEY = "ddf-content-guide-custom-theme";
const DOCUMENT_THEME_STORAGE_KEY = "ddf-content-guide-document-theme";

const THEME_FIELDS = [
  ["bg","Page Background",true],
  ["panel","Panel Background",true],
  ["text","Primary Text",true],
  ["muted","Secondary Text",true],
  ["accent","Primary Accent",true],
  ["secondary","Secondary Accent",true],
  ["allowed","Allowed",true],
  ["banned","Banned",true],
  ["panel2","Raised Panel",false],
  ["panel3","Raised Panel 2",false],
  ["line","Border",false],
  ["lineSoft","Soft Border",false],
  ["accent2","Accent Highlight",false],
  ["secondary2","Secondary Highlight",false],
  ["link","Link Color",false],
  ["allowedBg","Allowed Background",false],
  ["bannedBg","Banned Background",false],
  ["superseded","Superseded",false]
];

const THEMES = {
  "default": {
    bg:"#0f0e13",panel:"#18161e",panel2:"#201d28",panel3:"#282430",line:"#393342",lineSoft:"#2c2833",
    text:"#f5f2f7",muted:"#b8b0c2",accent:"#e6a32b",accent2:"#ffc95e",secondary:"#aa90df",secondary2:"#c7b5f2",
    link:"#80baf0",allowed:"#69d28a",allowedBg:"#173521",banned:"#ff7c7c",bannedBg:"#401c22",superseded:"#cab5ff"
  },
  "white-black": {
    bg:"#ffffff",panel:"#f7f7f8",panel2:"#eeeeef",panel3:"#e2e2e4",line:"#a8a8ad",lineSoft:"#d5d5d8",
    text:"#111111",muted:"#5a5a62",accent:"#111111",accent2:"#2d2d32",secondary:"#66666f",secondary2:"#3f3f46",
    link:"#005ea8",allowed:"#176b36",allowedBg:"#e7f5ec",banned:"#a11f2a",bannedBg:"#fdebed",superseded:"#62449a"
  },
  "black-white": {
    bg:"#000000",panel:"#0a0a0a",panel2:"#141414",panel3:"#1f1f1f",line:"#4a4a4a",lineSoft:"#282828",
    text:"#ffffff",muted:"#c2c2c2",accent:"#f2f2f2",accent2:"#ffffff",secondary:"#9e9e9e",secondary2:"#d0d0d0",
    link:"#76c8ff",allowed:"#70e69b",allowedBg:"#0a2615",banned:"#ff7676",bannedBg:"#2f0c0c",superseded:"#c6a9ff"
  },
  "phoenix": {
    bg:"#120909",panel:"#1d0e0c",panel2:"#2b1510",panel3:"#3a1b12",line:"#6b3424",lineSoft:"#432217",
    text:"#fff1df",muted:"#d8b89c",accent:"#ff6a00",accent2:"#ffb000",secondary:"#c52f24",secondary2:"#ff704d",
    link:"#ffd166",allowed:"#7bd88f",allowedBg:"#17351e",banned:"#ff5b4d",bannedBg:"#46130e",superseded:"#d1a4ff"
  },
  "knicks": {
    bg:"#071523",panel:"#0b2238",panel2:"#10304d",panel3:"#143c60",line:"#356789",lineSoft:"#1d4663",
    text:"#f7fbff",muted:"#b8cad8",accent:"#f58426",accent2:"#ffad63",secondary:"#006bb6",secondary2:"#4aa9e8",
    link:"#72c7ff",allowed:"#77d49a",allowedBg:"#113722",banned:"#ff6b6b",bannedBg:"#431817",superseded:"#bec0c2"
  },
  "dnd-beyond": {
    bg:"#0d0d0e",panel:"#171719",panel2:"#212124",panel3:"#2b2b2f",line:"#4b4b50",lineSoft:"#303034",
    text:"#f5f5f3",muted:"#bdbdb8",accent:"#c73032",accent2:"#ef5a5b",secondary:"#73737a",secondary2:"#c8c8cc",
    link:"#e2b34f",allowed:"#72cf8d",allowedBg:"#14351f",banned:"#ff6969",bannedBg:"#421517",superseded:"#c7a6ff"
  },
  "roll20": {
    bg:"#10151c",panel:"#17212b",panel2:"#1e2b36",panel3:"#273846",line:"#446276",lineSoft:"#2c4353",
    text:"#f6fbff",muted:"#b9cbd7",accent:"#ff2061",accent2:"#ff6d98",secondary:"#9dcae3",secondary2:"#c7e3f2",
    link:"#9dcae3",allowed:"#72d59a",allowedBg:"#123522",banned:"#ff667f",bannedBg:"#421422",superseded:"#c49cff"
  },
  "foundry-vtt": {
    bg:"#171a1d",panel:"#20252a",panel2:"#292f35",panel3:"#333b43",line:"#56616b",lineSoft:"#39424a",
    text:"#e8e6df",muted:"#b4b0a6",accent:"#c58c45",accent2:"#e1b76f",secondary:"#8b2f3f",secondary2:"#c75b6d",
    link:"#6aaed6",allowed:"#75cb8f",allowedBg:"#17341f",banned:"#e96b67",bannedBg:"#3b1716",superseded:"#b9a0d9"
  }
};

const THEME_VAR_MAP = {
  bg:"--bg",panel:"--panel",panel2:"--panel-2",panel3:"--panel-3",line:"--line",lineSoft:"--line-soft",
  text:"--text",muted:"--muted",accent:"--accent",accent2:"--accent-2",secondary:"--secondary",secondary2:"--secondary-2",
  link:"--link",allowed:"--allowed",allowedBg:"--allowed-bg",banned:"--banned",bannedBg:"--banned-bg",superseded:"--superseded"
};

let themeEditorOriginal = null;
let themeEditorDraft = null;

function normalizeHex(hex){
  let h=String(hex||"").trim().replace(/^#/,"");
  if(h.length===3) h=h.split("").map(c=>c+c).join("");
  return /^[0-9a-f]{6}$/i.test(h)?`#${h.toLowerCase()}`:"#000000";
}
function hexRgb(hex){
  const h=normalizeHex(hex).slice(1);
  return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
}
function mixHex(a,b,weight=.5){
  const ar=hexRgb(a), br=hexRgb(b), w=Math.max(0,Math.min(1,Number(weight)));
  return `#${ar.map((v,i)=>Math.round(v*w+br[i]*(1-w)).toString(16).padStart(2,"0")).join("")}`;
}
function contrastText(hex){
  const [r,g,b]=hexRgb(hex).map(v=>v/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));
  return .2126*r+.7152*g+.0722*b > .42 ? "#111111" : "#ffffff";
}
function isLightColor(hex){ return contrastText(hex)==="#111111"; }
function readCustomTheme(){
  try{
    const obj=JSON.parse(localStorage.getItem(CUSTOM_THEME_STORAGE_KEY)||"null");
    return obj && THEME_FIELDS.every(([k])=>obj[k]) ? obj : null;
  }catch(_){ return null; }
}
function themeForName(name){
  if(name==="custom") return readCustomTheme() || {...THEMES.default};
  return THEMES[name] || THEMES.default;
}
function applyThemeObject(theme){
  const root=document.documentElement;
  for(const [key,cssVar] of Object.entries(THEME_VAR_MAP)) root.style.setProperty(cssVar,normalizeHex(theme[key]));
  root.style.setProperty("--superseded-bg",mixHex(theme.superseded,theme.panel,.23));
  root.style.setProperty("--accent-contrast",contrastText(theme.accent));
  root.style.colorScheme=isLightColor(theme.bg)?"light":"dark";
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta) meta.content=normalizeHex(theme.panel);
}
function applyThemeName(name,{persist=true}={}){
  const normalized=(name==="custom" || THEMES[name])?name:"default";
  applyThemeObject(themeForName(normalized));
  const select=$("#themeSelect"); if(select) select.value=normalized;
  document.documentElement.dataset.theme=normalized;
  if(persist){ try{localStorage.setItem(THEME_STORAGE_KEY,normalized);}catch(_){} }
}
function currentThemeName(){ return $("#themeSelect")?.value || "default"; }
function buildThemeFields(){
  const basic=$("#themeBasicFields"), advanced=$("#themeAdvancedFields");
  if(!basic || !advanced) return;
  basic.innerHTML=""; advanced.innerHTML="";
  for(const [key,label,isBasic] of THEME_FIELDS){
    const wrap=document.createElement("label");
    wrap.className="color-field";
    wrap.innerHTML=`<input type="color" data-theme-color="${key}" aria-label="${esc(label)}"><span class="color-field-label"><strong>${esc(label)}</strong><code data-theme-code="${key}"></code></span>`;
    (isBasic?basic:advanced).appendChild(wrap);
  }
  document.querySelectorAll("[data-theme-color]").forEach(input=>input.addEventListener("input",e=>{
    const key=e.target.dataset.themeColor;
    themeEditorDraft={...(themeEditorDraft||THEMES.default),[key]:normalizeHex(e.target.value)};
    const code=document.querySelector(`[data-theme-code="${key}"]`); if(code) code.textContent=normalizeHex(e.target.value).toUpperCase();
    applyThemeObject(themeEditorDraft);
  }));
}
function fillThemeEditor(theme){
  themeEditorDraft={...theme};
  for(const [key] of THEME_FIELDS){
    const input=document.querySelector(`[data-theme-color="${key}"]`);
    const code=document.querySelector(`[data-theme-code="${key}"]`);
    if(input) input.value=normalizeHex(theme[key]);
    if(code) code.textContent=normalizeHex(theme[key]).toUpperCase();
  }
}
function openThemeEditor(){
  const name=currentThemeName();
  themeEditorOriginal={name, theme:{...themeForName(name)}};
  fillThemeEditor(themeEditorOriginal.theme);
  $("#themePanel")?.classList.remove("hidden");
  document.body.classList.add("theme-modal-open");
}
function closeThemeEditor({restore=false}={}){
  if(restore && themeEditorOriginal){ applyThemeName(themeEditorOriginal.name,{persist:false}); }
  $("#themePanel")?.classList.add("hidden");
  document.body.classList.remove("theme-modal-open");
  themeEditorOriginal=null; themeEditorDraft=null;
}
function saveCustomTheme(){
  const finalTheme={...(themeEditorDraft||themeForName(currentThemeName()))};
  try{localStorage.setItem(CUSTOM_THEME_STORAGE_KEY,JSON.stringify(finalTheme));}catch(_){}
  applyThemeObject(finalTheme);
  const select=$("#themeSelect"); if(select) select.value="custom";
  document.documentElement.dataset.theme="custom";
  try{localStorage.setItem(THEME_STORAGE_KEY,"custom");}catch(_){}
  closeThemeEditor();
}
function resetThemeEditor(){ fillThemeEditor({...THEMES.default}); applyThemeObject(THEMES.default); }
function setDocumentTheme(mode,{persist=true}={}){
  const m=mode==="match"?"match":"parchment";
  document.body.dataset.documentTheme=m;
  const sel=$("#documentThemeSelect"); if(sel) sel.value=m;
  if(persist){try{localStorage.setItem(DOCUMENT_THEME_STORAGE_KEY,m);}catch(_){}}
}
function initThemeSystem(){
  buildThemeFields();
  let saved="default", docSaved="parchment";
  try{saved=localStorage.getItem(THEME_STORAGE_KEY)||"default";docSaved=localStorage.getItem(DOCUMENT_THEME_STORAGE_KEY)||"parchment";}catch(_){}
  if(saved==="custom" && !readCustomTheme()) saved="default";
  applyThemeName(saved,{persist:false});
  setDocumentTheme(docSaved,{persist:false});
  $("#themeSelect")?.addEventListener("change",e=>applyThemeName(e.target.value));
  $("#documentThemeSelect")?.addEventListener("change",e=>setDocumentTheme(e.target.value));
  $("#customizeThemeBtn")?.addEventListener("click",openThemeEditor);
  $("#closeThemePanelBtn")?.addEventListener("click",()=>closeThemeEditor({restore:true}));
  $("#cancelThemeBtn")?.addEventListener("click",()=>closeThemeEditor({restore:true}));
  $("#saveCustomThemeBtn")?.addEventListener("click",saveCustomTheme);
  $("#resetCustomThemeBtn")?.addEventListener("click",resetThemeEditor);
  $("#themePanel")?.addEventListener("click",e=>{if(e.target.id==="themePanel") closeThemeEditor({restore:true});});
  document.addEventListener("keydown",e=>{if(e.key==="Escape" && !$("#themePanel")?.classList.contains("hidden")) closeThemeEditor({restore:true});});
}

function sourceMap(){
  return Object.fromEntries(state.data.sources.map(s => [s["Source ID"], s]));
}
function sourceMatchesFilter(sourceIds){
  if (!state.source) return true;
  const sm = sourceMap();
  return splitSources(sourceIds).some(id => {
    if (id === state.source) return true;
    const s = sm[id];
    return s && s["Source Group"] === state.source;
  });
}
function searchableText(row, extra=""){
  const sm = sourceMap();
  const sourceText = splitSources(row["Source IDs"]).map(id=>{
    const s=sm[id]; return [id,s?.["Full Source Name"],s?.["Source Group"]].filter(Boolean).join(" ");
  }).join(" ");
  return norm(Object.values(row).filter(v=>v!==null && v!==undefined).join(" ")+" "+sourceText+" "+extra);
}
function rowMatches(row, extra=""){
  if (state.status && row.Status !== state.status) return false;
  if (!sourceMatchesFilter(row["Source IDs"])) return false;
  if (state.query && !searchableText(row, extra).includes(norm(state.query))) return false;
  return true;
}
function statusChip(status){
  const c = slug(status);
  return `<span class="status ${c}">${esc(status)}</span>`;
}
function sourceChips(ids){
  const sm=sourceMap();
  return splitSources(ids).map(id=>{
    const s=sm[id] || {"Source ID":id,"Full Source Name":id};
    const label=esc(id);
    const title=esc(s["Full Source Name"] || id);
    if (s.URL){
      return `<a class="source-chip" href="${esc(s.URL)}" target="_blank" rel="noopener noreferrer" title="${title}">${label}<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 5h5v5M10 14 19 5M19 14v5H5V5h5"/></svg></a>`;
    }
    return `<span class="source-chip" title="${title}">${label}</span>`;
  }).join("");
}
function meta(status, sources){
  return `<div class="meta-line">${sourceChips(sources)}${statusChip(status)}</div>`;
}
function errataBox(text,label="Server Errata"){
  if (!text) return "";
  return `<div class="errata"><strong>${esc(label)}:</strong> ${esc(text)}</div>`;
}
function sortByOrderName(arr, orderKey, nameKey){
  return [...arr].sort((a,b)=>(Number(a[orderKey]??999999)-Number(b[orderKey]??999999)) || String(a[nameKey]??"").localeCompare(String(b[nameKey]??"")));
}
function sectionHeading(title,count){
  return `<div class="section-heading"><h2>${esc(title)}</h2><div class="section-count">${count.toLocaleString()} shown</div></div>`;
}
function noResults(){
  return `<div class="empty-state">No content matches the current search and filters.</div>`;
}

function allRowsForMetrics(){
  const rows=[];
  state.data.classes.forEach(r=>rows.push(r));
  state.data.subclasses.forEach(r=>rows.push(r));
  state.data.species.forEach(r=>rows.push(r));
  state.data.classOptions.forEach(r=>rows.push(r));
  state.data.feats.forEach(r=>rows.push(r));
  state.data.spells.forEach(r=>rows.push(r));
  return rows;
}
function visibleMetricRows(){
  // Broad text filtering for summary; parent names are added for subclasses/options below.
  const cm=Object.fromEntries(state.data.classes.map(c=>[c["Class ID"],c["Class Name"]]));
  const sm=Object.fromEntries(state.data.subclasses.map(s=>[s["Subclass ID"],s["Subclass Name"]]));
  return allRowsForMetrics().filter(r=>{
    const extra=[cm[r["Parent Class ID"]], sm[r["Parent Subclass ID"]]].filter(Boolean).join(" ");
    return rowMatches(r,extra);
  });
}
function renderSummary(){
  const rows=visibleMetricRows();
  const statuses = Object.fromEntries(["Allowed","Banned","Superseded"].map(s=>[s,rows.filter(r=>r.Status===s).length]));
  const visibleSourceIds = new Set();
  rows.forEach(r=>splitSources(r["Source IDs"]).forEach(id=>visibleSourceIds.add(id)));
  return `<div class="summary-grid">
    <div class="metric"><div class="value">${rows.length.toLocaleString()}</div><div class="label">Options Shown</div></div>
    <div class="metric allowed"><div class="value">${statuses.Allowed.toLocaleString()}</div><div class="label">Allowed</div></div>
    <div class="metric banned"><div class="value">${statuses.Banned.toLocaleString()}</div><div class="label">Banned</div></div>
    <div class="metric superseded"><div class="value">${statuses.Superseded.toLocaleString()}</div><div class="label">Superseded</div></div>
    <div class="metric sources"><div class="value">${visibleSourceIds.size.toLocaleString()}</div><div class="label">Sources Represented</div></div>
  </div>`;
}

function renderSpecies(){
  const rows=sortByOrderName(state.data.species,"Sort Order","Species Name");
  const parents=rows.filter(r=>!r["Parent Species ID"]);
  const childrenByParent={};
  rows.filter(r=>r["Parent Species ID"]).forEach(r=>(childrenByParent[r["Parent Species ID"]]??=[]).push(r));
  const cards=[];
  for (const p of parents){
    const children=childrenByParent[p["Species ID"]]||[];
    const parentMatch=rowMatches(p);
    const matchingChildren=children.filter(c=>rowMatches(c,p["Species Name"]));
    if(!parentMatch && !matchingChildren.length) continue;
    // If the parent matches, show children that also satisfy explicit status/source filters; search inherits parent match.
    let shownChildren = children.filter(c=>{
      if (state.status && c.Status !== state.status) return false;
      if (!sourceMatchesFilter(c["Source IDs"])) return false;
      if (state.query && !parentMatch && !searchableText(c,p["Species Name"]).includes(norm(state.query))) return false;
      return true;
    });
    cards.push(`<article class="species-card" id="species-${esc(slug(p["Species ID"]))}">
      <div class="top">
        <div>
          <div class="item-title">${esc(p["Species Name"])}</div>
          ${p["Modifications / Errata"]?`<div class="item-subtitle">${esc(p["Modifications / Errata"])}</div>`:""}
        </div>
        ${statusChip(p.Status)}
      </div>
      <div class="meta-line" style="justify-content:flex-start;margin-top:7px">${sourceChips(p["Source IDs"])}</div>
      ${shownChildren.length?`<div class="variant-list">${shownChildren.map(c=>`<div class="variant">
        <div>
          <div class="nested-name">${esc(c["Variant / Legacy Name"] || c["Species Name"])}</div>
          ${c["Modifications / Errata"]?`<div class="item-subtitle">${esc(c["Modifications / Errata"])}</div>`:""}
        </div>
        <div class="meta-line">${sourceChips(c["Source IDs"])}${statusChip(c.Status)}</div>
      </div>`).join("")}</div>`:""}
    </article>`);
  }
  return `<section class="section" id="section-species">${sectionHeading("Species",cards.length)}${cards.length?`<div class="species-grid">${cards.join("")}</div>`:noResults()}</section>`;
}

function renderClasses(){
  const classes=sortByOrderName(state.data.classes,"Sort Order","Class Name");
  const subclasses=sortByOrderName(state.data.subclasses,"Sort Order","Subclass Name");
  const subsByClass={};
  subclasses.forEach(s=>(subsByClass[s["Parent Class ID"]]??=[]).push(s));
  const cards=[];
  for(const c of classes){
    const subs=subsByClass[c["Class ID"]]||[];
    const classMatch=rowMatches(c);
    const childMatches=subs.filter(s=>rowMatches(s,c["Class Name"]));
    if(!classMatch && !childMatches.length) continue;
    let shownSubs=subs.filter(s=>{
      if (state.status && s.Status!==state.status) return false;
      if (!sourceMatchesFilter(s["Source IDs"])) return false;
      if (state.query && !classMatch && !searchableText(s,c["Class Name"]).includes(norm(state.query))) return false;
      return true;
    });
    cards.push(`<article class="card class-card" id="class-${esc(slug(c["Class ID"]))}">
      <div class="class-header">
        <div>
          <div class="class-title">${esc(c["Class Name"])}</div>
          <div class="meta-line" style="justify-content:flex-start;margin-top:7px">${sourceChips(c["Source IDs"])}${statusChip(c.Status)}</div>
        </div>
      </div>
      ${c["Class Errata"]?`<div style="padding:9px">${errataBox(c["Class Errata"],"Class Errata")}</div>`:""}
      <div class="class-body">
        ${shownSubs.length?shownSubs.map(s=>`<div class="nested-item">
          <div class="nested-top">
            <div>
              <div class="nested-name">${esc(s["Subclass Name"])}</div>
              <button class="parent-link" data-class-jump="${esc(c["Class ID"])}" title="Parent class">${esc(c["Class Name"])}</button>
            </div>
            <div class="meta-line">${sourceChips(s["Source IDs"])}${statusChip(s.Status)}</div>
          </div>
          ${s.Errata?errataBox(s.Errata,"Subclass Errata"):""}
        </div>`).join(""):`<div class="no-results">No subclasses match the active filters.</div>`}
      </div>
    </article>`);
  }
  return `<section class="section" id="section-classes">${sectionHeading("Classes",cards.length)}${cards.length?`<div class="class-grid">${cards.join("")}</div>`:noResults()}</section>`;
}

function renderClassOptions(){
  const cm=Object.fromEntries(state.data.classes.map(c=>[c["Class ID"],c["Class Name"]]));
  const sm=Object.fromEntries(state.data.subclasses.map(s=>[s["Subclass ID"],s["Subclass Name"]]));
  const rows=sortByOrderName(state.data.classOptions,"Sort Order","Option Name").filter(r=>{
    const extra=[cm[r["Parent Class ID"]],sm[r["Parent Subclass ID"]]].filter(Boolean).join(" ");
    return rowMatches(r,extra);
  });
  const groups={};
  rows.forEach(r=>(groups[r["Option Type"]]??=[]).push(r));
  const html=Object.entries(groups).map(([type,items])=>`<div class="card group-card">
    <h3>${esc(type)} <span class="section-count">• ${items.length}</span></h3>
    <div class="option-grid">${items.map(r=>{
      const parent=[cm[r["Parent Class ID"]],sm[r["Parent Subclass ID"]]].filter(Boolean).join(" → ");
      return `<div class="option-card">
        <div class="top"><div><div class="item-title">${esc(r["Option Name"])}</div>${parent?`<div class="item-subtitle">${esc(parent)}</div>`:""}</div>${statusChip(r.Status)}</div>
        <div class="meta-line" style="justify-content:flex-start;margin-top:7px">${sourceChips(r["Source IDs"])}</div>
        ${r["Requirement / Errata"]?errataBox(r["Requirement / Errata"],"Requirement / Errata"):""}
      </div>`;
    }).join("")}</div>
  </div>`).join("");
  return `<section class="section" id="section-class-options">${sectionHeading("Class Options",rows.length)}${rows.length?html:noResults()}</section>`;
}

function renderBackgrounds(){
  const rows=state.data.backgrounds.filter(r=>{
    // Backgrounds sheet has Status/Source but not necessarily Source IDs in older schemas.
    const adapted={...r,"Source IDs":r["Source IDs"]||r["Source ID"]||""};
    return rowMatches(adapted);
  });
  return `<section class="section" id="section-backgrounds">${sectionHeading("Backgrounds",rows.length)}
    ${rows.length?rows.map(r=>`<article class="card background-card">
      <div class="meta-line" style="justify-content:flex-start;margin-bottom:11px">${sourceChips(r["Source IDs"]||r["Source ID"]||"SERVER")}${statusChip(r.Status||"Allowed")}</div>
      <p>${esc(r.Text || r["Background Rule Text"] || r["Rule Text"] || Object.values(r).find(v=>typeof v==="string" && v.includes("Universal Custom Backgrounds")) || "")}</p>
    </article>`).join(""):noResults()}
  </section>`;
}

function renderFeats(){
  const rows=sortByOrderName(state.data.feats,"Sort Order","Feat Name").filter(r=>rowMatches(r));
  const byGroup={};
  rows.forEach(r=>(byGroup[r["Website Group"]||"Other"]??=[]).push(r));
  const order=["Origin","General","Epic Boon","Other"];
  const blocks=Object.keys(byGroup).sort((a,b)=>(order.indexOf(a)<0?99:order.indexOf(a))-(order.indexOf(b)<0?99:order.indexOf(b))).map(group=>{
    const groupRows=byGroup[group];
    const byType={};
    groupRows.forEach(r=>(byType[r["Official Type"]||group]??=[]).push(r));
    return `<div class="feat-block"><h3>${esc(group)} Feats</h3>
      ${Object.entries(byType).map(([type,items])=>`<div class="feat-subtype">${esc(type)}</div><div class="feat-grid">${items.map(r=>`<div class="feat-card">
        <div class="top"><div class="feat-name">${esc(r["Feat Name"])}</div>${statusChip(r.Status)}</div>
        <div class="meta-line" style="justify-content:flex-start;margin-top:6px">${sourceChips(r["Source IDs"])}</div>
        ${r.Errata?errataBox(r.Errata,"Errata"):""}
      </div>`).join("")}</div>`).join("")}
    </div>`;
  }).join("");
  return `<section class="section" id="section-feats">${sectionHeading("Feats",rows.length)}${rows.length?blocks:noResults()}</section>`;
}

function renderSpells(){
  const rows=[...state.data.spells].sort((a,b)=>String(a["Spell Name"]).localeCompare(String(b["Spell Name"]))).filter(r=>rowMatches(r));
  return `<section class="section" id="section-spells">${sectionHeading("Spells",rows.length)}${rows.length?`<div class="spell-grid">${rows.map(r=>`<div class="spell-card">
    <div class="top"><div class="spell-name">${esc(r["Spell Name"])}</div>${r["Level (Optional)"]!==null && r["Level (Optional)"]!==undefined && r["Level (Optional)"]!==""?`<span class="level-badge">Level ${esc(r["Level (Optional)"])}</span>`:""}</div>
    <div class="meta-line" style="justify-content:flex-start;margin-top:6px">${sourceChips(r["Source IDs"])}${statusChip(r.Status)}</div>
    ${r.Errata?errataBox(r.Errata,"Errata"):""}
  </div>`).join("")}</div>`:noResults()}</section>`;
}

function docSource(ids){
  const sm=sourceMap();
  return splitSources(ids).map(id=>{
    const s=sm[id]||{};
    return s.URL?`<a href="${esc(s.URL)}" target="_blank" rel="noopener">${esc(id)}</a>`:esc(id);
  }).join(", ");
}
function docItem(name,row,extra=""){
  const statusClass=slug(row.Status||"Allowed");
  const status=(row.Status&&row.Status!=="Allowed")?` — <span class="doc-status ${statusClass}">${esc(row.Status)}</span>`:"";
  const src=row["Source IDs"]?` <span class="doc-source">(${docSource(row["Source IDs"])})</span>`:"";
  const ex=extra?` — ${esc(extra)}`:"";
  const er=(row.Errata||row["Requirement / Errata"]||row["Modifications / Errata"])?` <span class="doc-errata">[Errata: ${esc(row.Errata||row["Requirement / Errata"]||row["Modifications / Errata"]) }]</span>`:"";
  return `${esc(name)}${status}${src}${ex}${er}`;
}
function renderLongDocument(){
  const classes=sortByOrderName(state.data.classes,"Sort Order","Class Name");
  const subs=sortByOrderName(state.data.subclasses,"Sort Order","Subclass Name");
  const subsBy={}; subs.forEach(s=>(subsBy[s["Parent Class ID"]]??=[]).push(s));
  const species=sortByOrderName(state.data.species,"Sort Order","Species Name");
  const spChildren={}; species.filter(r=>r["Parent Species ID"]).forEach(r=>(spChildren[r["Parent Species ID"]]??=[]).push(r));
  const spParents=species.filter(r=>!r["Parent Species ID"]);
  const opts=sortByOrderName(state.data.classOptions,"Sort Order","Option Name");
  const optGroups={}; opts.forEach(r=>(optGroups[r["Option Type"]]??=[]).push(r));
  const feats=sortByOrderName(state.data.feats,"Sort Order","Feat Name");
  const featGroups={}; feats.forEach(r=>(featGroups[r["Website Group"]]??=[]).push(r));
  const spells=[...state.data.spells].sort((a,b)=>String(a["Spell Name"]).localeCompare(String(b["Spell Name"])));
  const bg=state.data.backgrounds[0];

  return `<section class="section print-long-section" id="section-long-document">
    <div class="notice">Long Document View intentionally ignores the search and filters so it can be printed as a complete rules guide.</div>
    <article class="long-doc">
      <h1 style="font-family:Georgia,'Times New Roman',serif;margin-top:0">D&amp;D Friends</h1>
      <p><strong>Allowed &amp; Banned Content Guide</strong><br><span class="doc-source">Generated from ${esc(state.data.meta.draft)}</span></p>

      <h2>Species</h2>
      <ul>${spParents.map(p=>`<li>${docItem(p["Species Name"],p)}${spChildren[p["Species ID"]]?.length?`<ul>${spChildren[p["Species ID"]].map(c=>`<li>${docItem(c["Variant / Legacy Name"],c)}</li>`).join("")}</ul>`:""}</li>`).join("")}</ul>

      <h2>Classes</h2>
      ${classes.map(c=>`<h3>${docItem(c["Class Name"],c)}</h3>${c["Class Errata"]?`<p class="doc-errata"><strong>Class Errata:</strong> ${esc(c["Class Errata"])}</p>`:""}<ul>${(subsBy[c["Class ID"]]||[]).map(s=>`<li>${docItem(s["Subclass Name"],s)}${s.Errata?` <span class="doc-errata">[Subclass Errata: ${esc(s.Errata)}]</span>`:""}</li>`).join("")}</ul>`).join("")}

      <h2>Class Options</h2>
      ${Object.entries(optGroups).map(([type,items])=>`<h3>${esc(type)}</h3><ul>${items.map(r=>`<li>${docItem(r["Option Name"],r)}</li>`).join("")}</ul>`).join("")}

      <h2>Backgrounds</h2>
      <p>${esc(bg?.Text || bg?.["Background Rule Text"] || bg?.["Rule Text"] || Object.values(bg||{}).find(v=>typeof v==="string" && v.includes("Universal Custom Backgrounds")) || "")}</p>

      <h2>Feats</h2>
      ${Object.entries(featGroups).map(([group,items])=>`<h3>${esc(group)} Feats</h3><ul>${items.map(r=>`<li>${docItem(r["Feat Name"],r, r["Official Type"] && r["Official Type"]!==group ? r["Official Type"] : "")}</li>`).join("")}</ul>`).join("")}

      <h2>Spells</h2>
      <ul>${spells.map(r=>`<li>${docItem(r["Spell Name"],r, r["Level (Optional)"]!==null && r["Level (Optional)"]!==undefined && r["Level (Optional)"]!=="" ? `Level ${r["Level (Optional)"]}` : "")}</li>`).join("")}</ul>
    </article>
  </section>`;
}

function render(){
  const app=$("#app");
  if(!state.data){ app.innerHTML=`<div class="loading-card">Loading content guide…</div>`; return; }
  if(state.view==="long-document"){
    app.innerHTML=renderLongDocument();
    return;
  }
  let body=renderSummary();
  if(state.view==="everything" || state.view==="species") body+=renderSpecies();
  if(state.view==="everything" || state.view==="classes") body+=renderClasses();
  if(state.view==="everything" || state.view==="class-options") body+=renderClassOptions();
  if(state.view==="everything" || state.view==="backgrounds") body+=renderBackgrounds();
  if(state.view==="everything" || state.view==="feats") body+=renderFeats();
  if(state.view==="everything" || state.view==="spells") body+=renderSpells();
  app.innerHTML=body;
  bindDynamicActions();
}
function bindDynamicActions(){
  document.querySelectorAll("[data-class-jump]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id=btn.dataset.classJump;
      const el=document.getElementById(`class-${slug(id)}`);
      el?.scrollIntoView({behavior:"smooth",block:"start"});
    });
  });
}
function setView(view){
  state.view=view;
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===view));
  render();
  window.scrollTo({top:Math.max(0,document.querySelector(".controls-shell")?.offsetTop||0),behavior:"smooth"});
}
function populateSources(){
  const sel=$("#sourceFilter");
  const previous=state.source;
  sel.innerHTML='<option value="">All sources</option>';
  const sources=[...state.data.sources].sort((a,b)=>String(a["Full Source Name"]).localeCompare(String(b["Full Source Name"])));
  // Parent group option appears once; monthly children remain independently selectable.
  const groupIds=[...new Set(sources.map(s=>s["Source Group"]).filter(Boolean))];
  for(const gid of groupIds){
    const parent=sources.find(s=>s["Source ID"]===gid);
    const label=parent?.["Full Source Name"] || gid;
    const opt=document.createElement("option");
    opt.value=gid; opt.textContent=`${label} (all)`;
    sel.appendChild(opt);
  }
  for(const s of sources){
    // Skip the generic BndD duplicate because its group-wide option already represents it.
    if(groupIds.includes(s["Source ID"])) continue;
    const opt=document.createElement("option");
    opt.value=s["Source ID"];
    opt.textContent=`${s["Full Source Name"]} — ${s["Source ID"]}`;
    sel.appendChild(opt);
  }
  if ([...sel.options].some(o=>o.value===previous)) sel.value=previous;
}
function reset(){
  state.query=""; state.status=""; state.source="";
  $("#searchInput").value="";
  $("#statusFilter").value="";
  $("#sourceFilter").value="";
  setView("everything");
}
function formatRefreshTime(date){
  try { return date.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}); }
  catch (_) { return "just now"; }
}
function setDataSourceStatus(mode, detail=""){
  state.dataMode=mode;
  const el=$("#dataSourceStatus");
  if(!el) return;
  el.className=`data-source-status ${mode}`;
  if(mode==="live") el.innerHTML=`<span class="data-dot"></span><strong>Live Google Sheet</strong> <span>• refreshed ${esc(formatRefreshTime(state.lastLiveRefresh || new Date()))}</span>`;
  else if(mode==="snapshot") el.innerHTML=`<span class="data-dot"></span><strong>Embedded snapshot</strong> <span>• live Google Sheet unavailable${detail?`: ${esc(detail)}`:""}</span>`;
  else if(mode==="refreshing") el.innerHTML=`<span class="data-dot"></span><strong>Refreshing Google Sheet…</strong>`;
  else el.innerHTML=`<span class="data-dot"></span><strong>Connecting to the Google Sheet…</strong>`;
}
function applyLoadedData(data, mode){
  state.data=data;
  if (data?.meta?.title) document.title=data.meta.title;
  populateSources();
  render();
  if(mode==="live"){ state.lastLiveRefresh=new Date(); setDataSourceStatus("live"); }
}
async function refreshLiveData({initial=false}={}){
  if(!window.ContentGuideLive) throw new Error("Live Sheet loader is unavailable.");
  if(!initial) setDataSourceStatus("refreshing");
  try{
    const data=await window.ContentGuideLive.load();
    applyLoadedData(data,"live");
    return true;
  }catch(e){
    if(initial && window.CONTENT_GUIDE_DATA){
      applyLoadedData(window.CONTENT_GUIDE_DATA,"snapshot");
      setDataSourceStatus("snapshot", e.message);
      return false;
    }
    if(state.data){
      setDataSourceStatus(state.dataMode==="live"?"live":"snapshot", `refresh failed: ${e.message}`);
      return false;
    }
    throw e;
  }
}
async function boot(){
  try{
    setDataSourceStatus("loading");
    const live=await refreshLiveData({initial:true});
    if(!state.data){
      const res=await fetch("data.json",{cache:"no-store"});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      applyLoadedData(await res.json(),"snapshot");
    }
    const mins=Number(window.ContentGuideLive?.config?.refreshMinutes || 0);
    if(live && mins>0) setInterval(()=>refreshLiveData(), mins*60*1000);
  }catch(e){
    $("#app").innerHTML=`<div class="empty-state"><strong>Could not load the content guide data.</strong><br><span class="muted">${esc(e.message)}</span></div>`;
    setDataSourceStatus("snapshot", e.message);
  }
}
document.addEventListener("DOMContentLoaded",()=>{
  initThemeSystem();
  document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>setView(t.dataset.view)));
  $("#searchInput").addEventListener("input",e=>{state.query=e.target.value;render();});
  $("#statusFilter").addEventListener("change",e=>{state.status=e.target.value;render();});
  $("#sourceFilter").addEventListener("change",e=>{state.source=e.target.value;render();});
  $("#resetBtn").addEventListener("click",reset);
  $("#refreshDataBtn").addEventListener("click",()=>refreshLiveData());
  $("#printBtn").addEventListener("click",()=>{ if(state.view!=="long-document") setView("long-document"); setTimeout(()=>window.print(),120); });
  boot();
});
