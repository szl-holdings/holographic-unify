/*
 * SZL Holographic Space Fabric v2
 * Shared navigation/accessibility with deterministic, per-Space identity.
 * No network access, analytics, storage, cookies, or application-state mutation.
 * SPDX-License-Identifier: Apache-2.0
 */
(function () {
  "use strict";
  if (window.__SZL_SPACE_HOLO_V2__) return;
  window.__SZL_SPACE_HOLO_V2__ = true;

  var VERSION = "2.0.0";
  // SZL KANCHAY v1.1.0, founder direction (szl-brand kanchay/ @aa876fa). Palette values are token
  // references resolved against szl-design-system.css, which each Space links before this layer
  // (the same roles as _layers/szl-space-hologram): ground --bg, surface --surface, text --text /
  // --text-sub, one functional teal accent --link (kicker, skip link, native controls), and silver
  // linework (color-silver-300 or -100). No coral (the fabric draws no single node), no gold, no
  // violet or cyan. Keys, labels, motifs and the FNV-1a palette index are unchanged.
  var CURATED = {
    "a11oy": ["A11oy", "command-grid", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    "a11oy-enterprise": ["A11oy Enterprise", "command-grid", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    "lyte": ["Lyte", "signal-aurora", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    "lyte-lattice": ["Lyte Lattice", "signal-aurora", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    "vessels": ["Vessels", "bathymetric-radar", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    "terra": ["Terra", "parcel-topography", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    "szl-real-estate": ["Terra Real Estate", "parcel-topography", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    "aegis": ["Aegis", "threat-lattice", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    "prism-counsel": ["PRISM Counsel", "case-lines", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    "counsel": ["PRISM Counsel", "case-lines", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    "carlota-jo": ["Carlota Jo", "editorial-orbit", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    "nexus": ["Nexus", "graph-mesh", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    "a11oy-factory": ["A11oy Factory", "build-circuit", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    "szl-command-lab": ["SZL Command Lab", "build-circuit", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    "ouroboros": ["Ouroboros", "recursive-weave", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    "szl-khipu": ["SZL KHIPU", "recursive-weave", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    "killinchu": ["Killinchu", "agent-swarm", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    "immune": ["IMMUNE", "cell-membrane", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    "governed-receipt-verifier": ["Governed Receipt Verifier", "checksum-ledger", "var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"]
  };
  var PALETTES = [
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-100)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"],
    ["var(--bg)", "var(--surface)", "var(--text)", "var(--text-sub)", "var(--link)", "var(--color-silver-300)"]
  ];
  var MOTIFS = ["command-grid", "signal-aurora", "bathymetric-radar", "parcel-topography", "threat-lattice", "case-lines", "editorial-orbit", "graph-mesh", "build-circuit", "recursive-weave", "agent-swarm", "cell-membrane", "checksum-ledger"];
  var LINKS = [
    ["Command", "https://a-11-oy.com"],
    ["Proof", "https://a11oy.net"],
    ["Spaces", "https://huggingface.co/SZLHOLDINGS"],
    ["Source", "https://github.com/szl-holdings"]
  ];

  function slug(value) {
    return String(value || "").normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
  }
  function hash(value) {
    var result = 0x811c9dc5;
    String(value || "szl-space").split("").forEach(function (character) {
      result ^= character.charCodeAt(0);
      result = Math.imul(result, 0x01000193) >>> 0;
    });
    return result >>> 0;
  }
  function spaceSlug() {
    var declared = document.documentElement.dataset.szlSpaceSlug || document.body && document.body.dataset ? document.body.dataset.szlSpaceSlug : "";
    if (declared) return slug(declared);
    var host = location.hostname.toLowerCase();
    var match = host.match(/^(?:szlholdings|szl-holdings)-(.+)\.hf\.space$/);
    if (match) return slug(match[1]);
    var title = slug(document.title.replace(/\s*[|·—-]\s*(hugging face|spaces?|szl holdings).*$/i, ""));
    return title || slug(host) || "szl-space";
  }
  function labelFor(id) {
    return id.split("-").filter(Boolean).map(function (part) { return part.charAt(0).toUpperCase() + part.slice(1); }).join(" ") || "SZL Space";
  }
  function resolveIdentity() {
    var id = spaceSlug();
    var keys = Object.keys(CURATED);
    var curatedKey = CURATED[id] ? id : keys.find(function (key) { return id.indexOf(key) >= 0 || key.indexOf(id) >= 0; });
    if (curatedKey) {
      var values = CURATED[curatedKey];
      return { id: id, label: values[0], motif: values[1], background: values[2], surface: values[3], foreground: values[4], muted: values[5], accent: values[6], accent2: values[7], source: "curated" };
    }
    var seed = hash(id);
    var palette = PALETTES[seed % PALETTES.length];
    return { id: id, label: labelFor(id), motif: MOTIFS[(seed >>> 8) % MOTIFS.length], background: palette[0], surface: palette[1], foreground: palette[2], muted: palette[3], accent: palette[4], accent2: palette[5], source: "deterministic" };
  }
  function applyIdentity(identity) {
    var root = document.documentElement;
    root.dataset.szlSpaceHoloV2 = "true";
    root.dataset.szlSpaceSlug = identity.id;
    root.dataset.szlSpaceMotif = identity.motif;
    root.dataset.szlSpaceThemeSource = identity.source;
    [["--szl-space-bg", identity.background], ["--szl-space-surface", identity.surface], ["--szl-space-fg", identity.foreground], ["--szl-space-muted", identity.muted], ["--szl-space-accent", identity.accent], ["--szl-space-accent-2", identity.accent2]].forEach(function (row) { root.style.setProperty(row[0], row[1]); });
  }
  function ambient() {
    if (document.getElementById("szl-space-holo-v2-ambient")) return;
    var node = document.createElement("div");
    node.id = "szl-space-holo-v2-ambient";
    node.setAttribute("aria-hidden", "true");
    ["field", "orbit", "beam", "scan", "nodes"].forEach(function (part) {
      var layer = document.createElement("span");
      layer.className = "szl-space-" + part;
      node.appendChild(layer);
    });
    document.body.insertBefore(node, document.body.firstChild);
  }
  function skipLink() {
    if (document.querySelector("[data-szl-space-skip]")) return;
    var main = document.querySelector("main, [role='main'], .gradio-container, [data-testid='stAppViewContainer']");
    if (!main) return;
    if (!main.id) main.id = "szl-space-main";
    var link = document.createElement("a");
    link.href = "#" + main.id;
    link.className = "szl-space-skip-link";
    link.dataset.szlSpaceSkip = "true";
    link.textContent = "Skip to main content";
    document.body.insertBefore(link, document.body.firstChild);
  }
  function defineBar(identity) {
    if (!window.customElements || customElements.get("szl-space-ecosystem-bar")) return;
    function SpaceBar() { return Reflect.construct(HTMLElement, [], SpaceBar); }
    SpaceBar.prototype = Object.create(HTMLElement.prototype);
    SpaceBar.prototype.constructor = SpaceBar;
    Object.setPrototypeOf(SpaceBar, HTMLElement);
    SpaceBar.prototype.connectedCallback = function () {
      if (this.shadowRoot) return;
      var shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = '<style>:host{all:initial;display:block;position:relative;z-index:2147483000;color-scheme:dark;font-family:var(--font-body)}*{box-sizing:border-box}.bar{min-height:50px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:14px;padding:8px clamp(12px,2.3vw,30px);color:var(--szl-space-fg,var(--text));background:color-mix(in srgb,var(--szl-space-bg,var(--bg)) 88%,transparent);border-bottom:1px solid color-mix(in srgb,var(--szl-space-accent-2,var(--color-silver-300)) 25%,transparent);box-shadow:0 14px 40px color-mix(in srgb,var(--szl-space-bg,var(--bg)) 27%,transparent);backdrop-filter:blur(18px) saturate(130%)}.identity{min-width:0;display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none}.mark{width:24px;height:24px;flex:none;border:1px solid color-mix(in srgb,var(--szl-space-accent-2) 70%,var(--szl-space-fg) 12%);border-radius:8px;background:radial-gradient(circle at 28% 25%,var(--szl-space-accent),transparent 35%),linear-gradient(145deg,color-mix(in srgb,var(--szl-space-accent-2) 70%,transparent),transparent 72%);box-shadow:0 0 25px color-mix(in srgb,var(--szl-space-accent-2) 28%,transparent);transform:rotate(8deg)}.copy{min-width:0;display:grid;gap:1px}.eyebrow{color:var(--szl-space-muted);font-size:9px;letter-spacing:.19em;text-transform:uppercase}.label{overflow:hidden;font-size:13px;font-weight:740;text-overflow:ellipsis;white-space:nowrap}nav{display:flex;gap:4px}nav a{min-height:34px;display:inline-flex;align-items:center;padding:6px 10px;border:1px solid transparent;border-radius:999px;color:var(--szl-space-muted);font-size:11px;font-weight:660;letter-spacing:.04em;text-decoration:none}nav a:hover,nav a:focus-visible,nav a[aria-current=page]{color:var(--szl-space-fg);border-color:color-mix(in srgb,var(--szl-space-accent-2) 38%,transparent);background:color-mix(in srgb,var(--szl-space-fg) 7%,transparent);outline:none}nav a:focus-visible,button:focus-visible,.identity:focus-visible{outline:3px solid var(--szl-space-focus,var(--focus));outline-offset:2px}button{display:none;width:40px;height:36px;align-items:center;justify-content:center;border:1px solid color-mix(in srgb,var(--szl-space-accent-2) 32%,transparent);border-radius:10px;color:var(--szl-space-fg);background:transparent;cursor:pointer}@media(max-width:700px){button{display:inline-flex}nav{position:absolute;top:calc(100% + 7px);right:10px;min-width:190px;display:none;flex-direction:column;padding:8px;border:1px solid color-mix(in srgb,var(--szl-space-accent-2) 28%,transparent);border-radius:14px;background:color-mix(in srgb,var(--szl-space-bg) 96%,var(--szl-space-fg) 2%);box-shadow:0 20px 52px color-mix(in srgb,var(--szl-space-bg) 53%,transparent)}nav[data-open=true]{display:flex}nav a{min-height:42px}}@media(prefers-reduced-motion:reduce){.mark{transform:none}}@media(forced-colors:active){.bar,nav a,button,.mark{border:1px solid CanvasText}.mark{background:CanvasText}}</style><div class="bar" role="banner"><a class="identity" href="https://a-11-oy.com" aria-label="Open A11oy Command"><span class="mark" aria-hidden="true"></span><span class="copy"><span class="eyebrow">SZL holographic fabric</span><span class="label"></span></span></a><button type="button" aria-label="Open ecosystem navigation" aria-expanded="false">Menu</button><nav aria-label="SZL ecosystem" data-open="false"></nav></div>';
      shadow.querySelector(".label").textContent = identity.label;
      var nav = shadow.querySelector("nav");
      LINKS.forEach(function (row) {
        var link = document.createElement("a");
        link.href = row[1];
        link.textContent = row[0];
        if (new URL(row[1]).hostname === location.hostname) link.setAttribute("aria-current", "page");
        nav.appendChild(link);
      });
      var button = shadow.querySelector("button");
      button.addEventListener("click", function () {
        var open = nav.dataset.open !== "true";
        nav.dataset.open = String(open);
        button.setAttribute("aria-expanded", String(open));
        button.textContent = open ? "Close" : "Menu";
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && nav.dataset.open === "true") {
          nav.dataset.open = "false";
          button.setAttribute("aria-expanded", "false");
          button.textContent = "Menu";
          button.focus();
        }
      });
    };
    customElements.define("szl-space-ecosystem-bar", SpaceBar);
  }
  function pointerEngine(reduced) {
    var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced || !fine) return;
    var root = document.documentElement;
    var frame = 0;
    var x = innerWidth / 2;
    var y = innerHeight / 3;
    function draw() {
      frame = 0;
      root.style.setProperty("--szl-space-x", x.toFixed(1) + "px");
      root.style.setProperty("--szl-space-y", y.toFixed(1) + "px");
      root.style.setProperty("--szl-space-nx", (((x / Math.max(innerWidth, 1)) - .5) * 2).toFixed(4));
      root.style.setProperty("--szl-space-ny", (((y / Math.max(innerHeight, 1)) - .5) * 2).toFixed(4));
    }
    addEventListener("pointermove", function (event) { x = event.clientX; y = event.clientY; if (!frame) frame = requestAnimationFrame(draw); }, { passive: true });
    draw();
  }
  function lowPower() {
    return Boolean(navigator.connection && navigator.connection.saveData) || Number(navigator.hardwareConcurrency || 8) <= 4 || Number(navigator.deviceMemory || 8) <= 4;
  }
  function boot() {
    if (!document.body) return;
    var identity = resolveIdentity();
    var reduced = Boolean(matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    applyIdentity(identity);
    document.documentElement.dataset.szlSpacePower = lowPower() ? "low" : "full";
    document.documentElement.dataset.szlSpaceState = document.hidden ? "paused" : "active";
    ambient();
    skipLink();
    defineBar(identity);
    if (!document.documentElement.hasAttribute("data-szl-space-no-shell") && !document.querySelector("szl-space-ecosystem-bar")) document.body.insertBefore(document.createElement("szl-space-ecosystem-bar"), document.body.firstChild);
    pointerEngine(reduced);
    document.addEventListener("visibilitychange", function () { document.documentElement.dataset.szlSpaceState = document.hidden ? "paused" : "active"; });
    document.dispatchEvent(new CustomEvent("szl:space-hologram-ready", { detail: Object.freeze({ version: VERSION, slug: identity.id, motif: identity.motif, source: identity.source, power: document.documentElement.dataset.szlSpacePower }) }));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
}());

/*
 * SZL Public Experience v3.1
 * Viewport-, zoom-, and audience-aware adaptation for Holographic Space Fabric v2.
 * No network, analytics, cookies, storage, or product-state mutation.
 * SPDX-License-Identifier: Apache-2.0
 */
(function () {
  "use strict";

  if (window.__SZL_PUBLIC_EXPERIENCE_V3__) return;
  window.__SZL_PUBLIC_EXPERIENCE_V3__ = true;

  var VERSION = "3.1.0";
  var ROOT = document.documentElement;
  var raf = 0;
  var observer = null;
  var rootStyleObserver = null;
  var stopObserverTimer = 0;
  var lastViewportState = "";

  function layoutViewportWidth() {
    var visual = window.visualViewport && window.visualViewport.width;
    return Math.max(
      1,
      Math.round(Number(visual) || 0),
      Math.round(Number(window.innerWidth) || 0),
      Math.round(Number(ROOT.clientWidth) || 0)
    );
  }

  function layoutViewportHeight() {
    var visual = window.visualViewport && window.visualViewport.height;
    return Math.max(
      1,
      Math.round(Number(visual) || 0),
      Math.round(Number(window.innerHeight) || 0),
      Math.round(Number(ROOT.clientHeight) || 0)
    );
  }

  function cssZoom() {
    var value = 1;
    try {
      value = Number.parseFloat(window.getComputedStyle(ROOT).zoom || ROOT.style.zoom || "1");
    } catch (_error) {
      value = Number.parseFloat(ROOT.style.zoom || "1");
    }
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  function zoomTier(value) {
    if (value >= 3) return "extreme";
    if (value >= 1.5) return "high";
    return "normal";
  }

  function tier(width) {
    if (width < 480) return "phone";
    if (width < 768) return "compact";
    if (width < 1024) return "tablet";
    if (width < 1440) return "desktop";
    if (width < 1920) return "wide";
    if (width < 2560) return "theatre";
    return "ultrawide";
  }

  function orientation(width, height) {
    return width >= height ? "landscape" : "portrait";
  }

  function audience() {
    var value = "";
    try {
      value = new URLSearchParams(window.location.search || "").get("view") || "";
    } catch (_error) {}
    value = String(value).toLowerCase();
    if (value === "developer" || value === "dev" || value === "build") return "developer";
    if (value === "investor" || value === "diligence") return "investor";
    if (value === "operator" || value === "command") return "operator";
    return "user";
  }

  function humanize(value) {
    return String(value || "")
      .replace(/^szlholdings[-/]/i, "")
      .replace(/^szl-holdings[-/]/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, function (character) { return character.toUpperCase(); })
      .trim();
  }

  function declaredIdentity() {
    var meta = document.querySelector('meta[name="szl-space-slug"]');
    var value = ROOT.dataset.szlSpaceLabel || ROOT.dataset.szlSpaceSlug ||
      (meta && meta.getAttribute("content")) || "";
    if (!value) {
      var match = String(window.location.hostname || "").match(/^(?:szlholdings|szl-holdings)-(.+?)(?:\.static)?\.hf\.space$/i);
      value = match ? match[1] : "";
    }
    return humanize(value) || "SZL Holdings";
  }

  function ensureDocumentTitle() {
    if (String(document.title || "").trim()) return;
    document.title = declaredIdentity() + " · SZL Holdings";
  }

  function syncBars(currentZoomTier) {
    document.querySelectorAll("szl-space-ecosystem-bar").forEach(function (bar) {
      bar.dataset.szlZoomTier = currentZoomTier;
    });
  }

  function snapshot() {
    var width = layoutViewportWidth();
    var height = layoutViewportHeight();
    var zoom = cssZoom();
    return Object.freeze({
      version: VERSION,
      width: width,
      height: height,
      effectiveWidth: Math.max(280, Math.round(width / zoom)),
      zoom: zoom,
      zoomTier: zoomTier(zoom),
      viewportTier: tier(Math.max(280, Math.round(width / zoom))),
      orientation: orientation(width, height),
      audience: audience()
    });
  }

  function applyViewportState() {
    raf = 0;
    var state = snapshot();
    var key = [state.width, state.height, state.zoom.toFixed(3), state.audience].join("|");
    syncBars(state.zoomTier);
    ensureDocumentTitle();
    if (key === lastViewportState) return;
    lastViewportState = key;

    ROOT.dataset.szlSpaceHoloV2 = "true";
    ROOT.dataset.szlPublicExperienceV3 = "true";
    ROOT.dataset.szlViewportTier = state.viewportTier;
    ROOT.dataset.szlViewportOrientation = state.orientation;
    ROOT.dataset.szlZoomTier = state.zoomTier;
    ROOT.dataset.szlAudience = state.audience;
    ROOT.style.setProperty("--szl-viewport-width", state.width + "px");
    ROOT.style.setProperty("--szl-viewport-height", state.height + "px");
    ROOT.style.setProperty("--szl-effective-inline-size", state.effectiveWidth + "px");
    ROOT.style.setProperty("--szl-page-zoom", state.zoom.toFixed(3));
  }

  function scheduleViewportState() {
    if (raf) return;
    raf = window.requestAnimationFrame(applyViewportState);
  }

  function responsiveBarStyle() {
    return [
      ":host{position:sticky!important;top:0!important;inline-size:100%!important;max-inline-size:100%!important;z-index:2147483000!important}",
      ":host([data-szl-zoom-tier=high]),:host([data-szl-zoom-tier=extreme]){position:relative!important;top:auto!important}",
      ".bar{min-height:56px!important;padding-block:8px!important;padding-inline:max(clamp(12px,2.3vw,30px),env(safe-area-inset-left,0px)) max(clamp(12px,2.3vw,30px),env(safe-area-inset-right,0px))!important}",
      "nav a,button{min-width:54px!important;min-height:48px!important;border-radius:10px!important;touch-action:manipulation!important}",
      "nav{max-width:100%!important}",
      "@media(max-width:700px){.bar{position:relative!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important}.identity{min-width:0!important}.label{max-width:min(58vw,360px)!important}.eyebrow{font-size:8px!important}button{display:inline-flex!important}nav{position:absolute!important;top:calc(100% + 7px)!important;right:max(8px,env(safe-area-inset-right,0px))!important;left:max(8px,env(safe-area-inset-left,0px))!important;max-height:min(56dvh,420px)!important;max-width:calc(100vw - 16px)!important;overflow:auto!important;overscroll-behavior:contain!important;padding:8px!important;border-radius:14px!important}nav a{justify-content:flex-start!important;padding-inline:14px!important}}",
      "@media(max-width:420px){.bar{min-height:54px!important;padding-block:5px!important}.copy{gap:0!important}.label{font-size:12px!important}.mark{width:22px!important;height:22px!important}nav{top:calc(100% + 5px)!important}}",
      "@media(min-width:1440px){.bar{min-height:60px!important;padding-inline:max(40px,env(safe-area-inset-left,0px)) max(40px,env(safe-area-inset-right,0px))!important}nav a{padding-inline:14px!important}}",
      "@media(min-width:1920px){.bar{min-height:64px!important;padding-inline:max(64px,env(safe-area-inset-left,0px)) max(64px,env(safe-area-inset-right,0px))!important}.label{font-size:14px!important}nav{gap:8px!important}nav a{min-height:48px!important;padding-inline:18px!important;font-size:12px!important}}",
      "@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important;animation:none!important}}",
      "@media(forced-colors:active){.bar,nav,nav a,button{forced-color-adjust:auto!important}}"
    ].join("");
  }

  function enhanceBar(bar) {
    if (!bar || !bar.shadowRoot || bar.dataset.szlResponsiveV3 === "true") return;
    var style = document.createElement("style");
    style.dataset.szlResponsiveV3 = "true";
    style.textContent = responsiveBarStyle();
    bar.shadowRoot.appendChild(style);
    bar.dataset.szlResponsiveV3 = "true";
    bar.dataset.szlZoomTier = ROOT.dataset.szlZoomTier || zoomTier(cssZoom());

    var nav = bar.shadowRoot.querySelector("nav");
    var button = bar.shadowRoot.querySelector("button");
    if (button) button.setAttribute("title", "Open SZL product, proof, source, and Space navigation");
    if (nav) {
      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.dataset.open = "false";
          if (button) {
            button.setAttribute("aria-expanded", "false");
            button.textContent = "Menu";
          }
        });
      });
    }
  }

  function enhanceBars() {
    document.querySelectorAll("szl-space-ecosystem-bar").forEach(enhanceBar);
  }

  function startBarObserver() {
    enhanceBars();
    if (!window.MutationObserver || observer) return;
    observer = new MutationObserver(function (records) {
      records.forEach(function (record) {
        record.addedNodes.forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.matches && node.matches("szl-space-ecosystem-bar")) enhanceBar(node);
          if (node.querySelectorAll) node.querySelectorAll("szl-space-ecosystem-bar").forEach(enhanceBar);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    stopObserverTimer = window.setTimeout(function () {
      if (observer) observer.disconnect();
      observer = null;
      stopObserverTimer = 0;
    }, 30000);
  }

  function startRootStyleObserver() {
    if (!window.MutationObserver || rootStyleObserver) return;
    rootStyleObserver = new MutationObserver(scheduleViewportState);
    rootStyleObserver.observe(ROOT, { attributes: true, attributeFilter: ["style"] });
  }

  function initialize() {
    applyViewportState();
    startRootStyleObserver();
    startBarObserver();
    if (window.customElements && customElements.whenDefined) {
      customElements.whenDefined("szl-space-ecosystem-bar").then(enhanceBars).catch(function () {});
    }
  }

  Object.defineProperty(window, "SZLPublicExperience", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: Object.freeze({ version: VERSION, snapshot: snapshot })
  });

  window.addEventListener("resize", scheduleViewportState, { passive: true });
  window.addEventListener("orientationchange", scheduleViewportState, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleViewportState, { passive: true });
    window.visualViewport.addEventListener("scroll", scheduleViewportState, { passive: true });
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) scheduleViewportState();
  });
  window.addEventListener("pagehide", function () {
    if (observer) observer.disconnect();
    if (rootStyleObserver) rootStyleObserver.disconnect();
    if (stopObserverTimer) window.clearTimeout(stopObserverTimer);
    if (raf) window.cancelAnimationFrame(raf);
  }, { once: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
}());
