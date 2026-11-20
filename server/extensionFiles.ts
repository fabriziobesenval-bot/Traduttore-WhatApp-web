export function buildChromeExtensionFiles(serverOrigin: string) {
  const cleanOrigin = serverOrigin.replace(/\/+$/, "");

  const manifestJson = `{
  "manifest_version": 3,
  "name": "LinguaBridge per WhatsApp Web",
  "version": "1.1.0",
  "description": "Traduce automaticamente in tempo reale le conversazioni su WhatsApp Web.",
  "permissions": ["storage", "activeTab"],
  "host_permissions": [
    "https://web.whatsapp.com/*",
    "http://localhost:3000/*",
    "http://127.0.0.1:3000/*",
    "${cleanOrigin}/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_title": "LinguaBridge WhatsApp",
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["https://web.whatsapp.com/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}
`;

  const backgroundJs = `// LinguaBridge MV3 Service Worker (evita blocchi CSP di web.whatsapp.com)
const DEFAULT_SETTINGS = {
  serverUrl: "${cleanOrigin}",
  targetLang: "Italiano",
  outgoingLang: "Inglese",
  autoTranslate: true
};

async function getSettings() {
  const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...stored };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "CHECK_HEALTH") {
    (async () => {
      try {
        const settings = await getSettings();
        const base = (msg.serverUrl || settings.serverUrl).replace(/\\/+$/, "");
        const res = await fetch(base + "/api/health", { method: "GET" });
        sendResponse({ ok: res.ok, status: res.status, serverUrl: base });
      } catch (err) {
        sendResponse({ ok: false, error: err?.message || "Server non raggiungibile" });
      }
    })();
    return true;
  }

  if (msg?.type === "TRANSLATE_MESSAGE") {
    (async () => {
      try {
        const settings = await getSettings();
        const base = settings.serverUrl.replace(/\\/+$/, "");
        const res = await fetch(base + "/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: msg.text,
            sourceLang: msg.sourceLang || "auto",
            targetLang: msg.targetLang || settings.targetLang,
            tone: msg.tone || "naturale"
          })
        });
        const data = await res.json();
        if (!res.ok) {
          sendResponse({ ok: false, error: data?.error || "Errore API " + res.status });
          return;
        }
        sendResponse({ ok: true, data });
      } catch (err) {
        sendResponse({ ok: false, error: err?.message || "Connessione al server fallita" });
      }
    })();
    return true;
  }
});
`;

  const contentJs = `// LinguaBridge Content Script per WhatsApp Web
(() => {
  if (window.__linguaBridgeLoaded) return;
  window.__linguaBridgeLoaded = true;

  const processedNodes = new WeakSet();
  const translationCache = new Map();
  let settings = {
    serverUrl: "${cleanOrigin}",
    targetLang: "Italiano",
    outgoingLang: "Inglese",
    autoTranslate: true
  };
  let serverOnline = null;
  let lastError = "";

  const SELECTORS = [
    '[data-testid="msg-container"] span.selectable-text',
    'div.copyable-text span.selectable-text',
    'span.selectable-text.copyable-text'
  ];

  function collectMessageNodes() {
    const set = new Set();
    for (const sel of SELECTORS) {
      document.querySelectorAll(sel).forEach((el) => {
        if (el.closest("#linguabridge-bar")) return;
        if (el.dataset.lbTranslation === "1") return;
        const inner = el.querySelector("span.selectable-text");
        if (!inner) set.add(el);
      });
    }
    return Array.from(set);
  }

  function updateStatusUI() {
    const statusEl = document.getElementById("lb-status-text");
    if (!statusEl) return;
    if (serverOnline === true) {
      statusEl.textContent = "Connesso (" + settings.targetLang + ")";
      statusEl.style.color = "#0f766e";
    } else if (serverOnline === false) {
      statusEl.textContent = "Server offline — clicca l'icona LinguaBridge o avvia il server";
      statusEl.style.color = "#b91c1c";
    } else {
      statusEl.textContent = "Verifica server...";
      statusEl.style.color = "#475569";
    }
  }

  function checkServerHealth() {
    chrome.runtime.sendMessage({ type: "CHECK_HEALTH" }, (resp) => {
      if (chrome.runtime.lastError || !resp?.ok) {
        serverOnline = false;
        lastError = resp?.error || "Server non raggiungibile";
      } else {
        serverOnline = true;
        lastError = "";
      }
      updateStatusUI();
    });
  }

  function renderTranslationUnderNode(msgNode, translatedText, detectedLang) {
    if (!msgNode.parentElement) return;
    const existing = msgNode.parentElement.querySelector('[data-lb-translation="1"]');
    if (existing) {
      existing.textContent = translatedText + (detectedLang ? " (" + detectedLang + ")" : "");
      return;
    }
    const badge = document.createElement("div");
    badge.dataset.lbTranslation = "1";
    badge.style.cssText = [
      "margin-top:5px",
      "padding-top:4px",
      "border-top:1px dashed rgba(15,118,110,0.35)",
      "font-size:12.5px",
      "font-weight:500",
      "color:#0f766e",
      "line-height:1.4",
      "white-space:pre-wrap"
    ].join(";");
    badge.textContent = translatedText + (detectedLang ? "  [" + detectedLang + "]" : "");
    msgNode.parentElement.appendChild(badge);
  }

  function translateMessageNode(msgNode, force = false) {
    if (!settings.autoTranslate && !force) return;
    if (!force && processedNodes.has(msgNode)) return;
    const original = (msgNode.innerText || "").trim();
    if (!original || original.length < 2) return;
    processedNodes.add(msgNode);

    const cacheKey = settings.targetLang + "::" + original;
    if (translationCache.has(cacheKey)) {
      const cached = translationCache.get(cacheKey);
      if (cached.translatedText && cached.translatedText.toLowerCase() !== original.toLowerCase()) {
        renderTranslationUnderNode(msgNode, cached.translatedText, cached.detectedLanguage);
      }
      return;
    }

    chrome.runtime.sendMessage(
      {
        type: "TRANSLATE_MESSAGE",
        text: original,
        targetLang: settings.targetLang
      },
      (resp) => {
        if (chrome.runtime.lastError || !resp?.ok) {
          serverOnline = false;
          lastError = resp?.error || "Errore connessione";
          updateStatusUI();
          return;
        }
        serverOnline = true;
        updateStatusUI();
        const data = resp.data;
        if (!data?.translatedText) return;
        translationCache.set(cacheKey, data);

        const sameText =
          data.translatedText.trim().toLowerCase() === original.trim().toLowerCase();
        if (!sameText) {
          renderTranslationUnderNode(msgNode, data.translatedText, data.detectedLanguage);
        }
      }
    );
  }

  function translateVisibleMessages(force = true) {
    const nodes = collectMessageNodes();
    nodes.forEach((n) => translateMessageNode(n, force));
  }

  function translateDraftAndInsert() {
    const composer =
      document.querySelector('[data-testid="conversation-compose-box-input"]') ||
      document.querySelector('footer div[contenteditable="true"][role="textbox"]');
    if (!composer) {
      alert("Apri prima una chat su WhatsApp Web e scrivi un messaggio.");
      return;
    }
    const draft = (composer.innerText || "").trim();
    if (!draft) {
      alert("Scrivi prima il testo da tradurre nella barra di messaggio di WhatsApp.");
      return;
    }

    const btn = document.getElementById("lb-translate-draft-btn");
    if (btn) btn.textContent = "Traduzione...";

    chrome.runtime.sendMessage(
      {
        type: "TRANSLATE_MESSAGE",
        text: draft,
        targetLang: settings.outgoingLang
      },
      (resp) => {
        if (btn) btn.textContent = "Traduci bozza (" + settings.outgoingLang + ")";
        if (chrome.runtime.lastError || !resp?.ok) {
          serverOnline = false;
          updateStatusUI();
          alert("Errore traduzione: " + (resp?.error || "Server non raggiungibile"));
          return;
        }
        const translated = resp.data?.translatedText;
        if (translated) {
          composer.focus();
          document.execCommand("selectAll", false, null);
          document.execCommand("insertText", false, translated);
        }
      }
    );
  }

  function injectToolbar() {
    if (document.getElementById("linguabridge-bar")) return;
    const bar = document.createElement("div");
    bar.id = "linguabridge-bar";
    bar.style.cssText = [
      "position:fixed",
      "top:10px",
      "left:50%",
      "transform:translateX(-50%)",
      "z-index:99999",
      "background:#ffffff",
      "border:1px solid #cbd5e1",
      "border-radius:10px",
      "padding:6px 12px",
      "display:flex",
      "align-items:center",
      "gap:10px",
      "box-shadow:0 4px 14px rgba(15,23,42,0.12)",
      "font-family:system-ui,-apple-system,sans-serif",
      "font-size:12px",
      "color:#0f172a"
    ].join(";");

    const brand = document.createElement("strong");
    brand.textContent = "LinguaBridge";
    brand.style.color = "#0f172a";

    const status = document.createElement("span");
    status.id = "lb-status-text";
    status.textContent = "Inizializzazione...";

    const scanBtn = document.createElement("button");
    scanBtn.type = "button";
    scanBtn.textContent = "Traduci chat";
    scanBtn.style.cssText =
      "padding:4px 9px;border-radius:6px;border:1px solid #cbd5e1;background:#f8fafc;color:#0f172a;font-size:11.5px;font-weight:600;cursor:pointer;";
    scanBtn.addEventListener("click", () => translateVisibleMessages(true));

    const draftBtn = document.createElement("button");
    draftBtn.id = "lb-translate-draft-btn";
    draftBtn.type = "button";
    draftBtn.textContent = "Traduci bozza (" + settings.outgoingLang + ")";
    draftBtn.style.cssText =
      "padding:4px 9px;border-radius:6px;border:none;background:#0f766e;color:#ffffff;font-size:11.5px;font-weight:600;cursor:pointer;";
    draftBtn.addEventListener("click", translateDraftAndInsert);

    bar.appendChild(brand);
    bar.appendChild(status);
    bar.appendChild(scanBtn);
    bar.appendChild(draftBtn);
    document.body.appendChild(bar);
    updateStatusUI();
  }

  chrome.storage.local.get(settings, (stored) => {
    settings = { ...settings, ...stored };
    injectToolbar();
    checkServerHealth();
    translateVisibleMessages(false);
    const btn = document.getElementById("lb-translate-draft-btn");
    if (btn) btn.textContent = "Traduci bozza (" + settings.outgoingLang + ")";
  });

  chrome.storage.onChanged.addListener((changes) => {
    for (const [k, v] of Object.entries(changes)) {
      settings[k] = v.newValue;
    }
    const btn = document.getElementById("lb-translate-draft-btn");
    if (btn) btn.textContent = "Traduci bozza (" + settings.outgoingLang + ")";
    updateStatusUI();
    translateVisibleMessages(true);
  });

  const observer = new MutationObserver(() => {
    injectToolbar();
    translateVisibleMessages(false);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
`;

  const popupHtml = `<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <title>LinguaBridge</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; width: 320px; margin: 0; padding: 16px; background: #f8fafc; color: #0f172a; }
      h1 { font-size: 15px; margin: 0 0 4px; }
      p.sub { font-size: 11.5px; color: #475569; margin: 0 0 14px; }
      label { display: block; font-size: 11.5px; font-weight: 600; color: #334155; margin: 10px 0 4px; }
      input, select { width: 100%; box-sizing: border-box; padding: 7px 9px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; }
      .row { display: flex; gap: 6px; margin-top: 6px; }
      button { padding: 7px 10px; font-size: 12px; font-weight: 600; border-radius: 7px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; }
      button.primary { background: #0f766e; color: #fff; border-color: #0f766e; flex: 1; }
      .status { margin-top: 10px; font-size: 11.5px; padding: 8px; border-radius: 7px; background: #fff; border: 1px solid #e2e8f0; }
      .check { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 12px; }
      .check input { width: auto; }
    </style>
  </head>
  <body>
    <h1>LinguaBridge per WhatsApp Web</h1>
    <p class="sub">Configura lingua e server di traduzione in tempo reale.</p>

    <label for="serverUrl">URL Server LinguaBridge</label>
    <input id="serverUrl" type="text" placeholder="http://localhost:3000" />
    <div class="row">
      <button type="button" id="presetLocal">Usa Locale (:3000)</button>
      <button type="button" id="presetCloud">Usa Cloud</button>
    </div>

    <label for="targetLang">Traduci messaggi ricevuti in</label>
    <select id="targetLang">
      <option>Italiano</option>
      <option>Inglese</option>
      <option>Spagnolo</option>
      <option>Francese</option>
      <option>Tedesco</option>
      <option>Portoghese</option>
      <option>Giapponese</option>
    </select>

    <label for="outgoingLang">Traduci bozze da inviare in</label>
    <select id="outgoingLang">
      <option>Inglese</option>
      <option>Tedesco</option>
      <option>Spagnolo</option>
      <option>Francese</option>
      <option>Portoghese</option>
      <option>Giapponese</option>
      <option>Italiano</option>
    </select>

    <label class="check">
      <input type="checkbox" id="autoTranslate" checked />
      <span>Traduci automaticamente i messaggi in arrivo</span>
    </label>

    <div class="row" style="margin-top: 12px;">
      <button type="button" id="testBtn">Testa</button>
      <button type="button" class="primary" id="saveBtn">Salva impostazioni</button>
    </div>

    <div id="statusBox" class="status">Pronto.</div>
    <script src="popup.js"></script>
  </body>
</html>
`;

  const popupJs = `const CLOUD_ORIGIN = "${cleanOrigin}";
const serverInput = document.getElementById("serverUrl");
const targetSelect = document.getElementById("targetLang");
const outgoingSelect = document.getElementById("outgoingLang");
const autoCheck = document.getElementById("autoTranslate");
const statusBox = document.getElementById("statusBox");

chrome.storage.local.get(
  {
    serverUrl: CLOUD_ORIGIN,
    targetLang: "Italiano",
    outgoingLang: "Inglese",
    autoTranslate: true
  },
  (cfg) => {
    serverInput.value = cfg.serverUrl;
    targetSelect.value = cfg.targetLang;
    outgoingSelect.value = cfg.outgoingLang;
    autoCheck.checked = Boolean(cfg.autoTranslate);
  }
);

document.getElementById("presetLocal").addEventListener("click", () => {
  serverInput.value = "http://localhost:3000";
});

document.getElementById("presetCloud").addEventListener("click", () => {
  serverInput.value = CLOUD_ORIGIN;
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const cfg = {
    serverUrl: serverInput.value.trim().replace(/\\/+$/, "") || CLOUD_ORIGIN,
    targetLang: targetSelect.value,
    outgoingLang: outgoingSelect.value,
    autoTranslate: autoCheck.checked
  };
  chrome.storage.local.set(cfg, () => {
    statusBox.textContent = "Impostazioni salvate. Ricarica WhatsApp Web se necessario.";
    statusBox.style.color = "#0f766e";
  });
});

document.getElementById("testBtn").addEventListener("click", () => {
  const url = serverInput.value.trim().replace(/\\/+$/, "") || CLOUD_ORIGIN;
  statusBox.textContent = "Verifica connessione a " + url + "...";
  statusBox.style.color = "#475569";
  chrome.runtime.sendMessage({ type: "CHECK_HEALTH", serverUrl: url }, (resp) => {
    if (chrome.runtime.lastError || !resp?.ok) {
      statusBox.textContent = "Non raggiungibile: " + (resp?.error || "avvia il server o usa Cloud");
      statusBox.style.color = "#b91c1c";
    } else {
      statusBox.textContent = "Connesso correttamente al server LinguaBridge!";
      statusBox.style.color = "#0f766e";
    }
  });
});
`;

  return {
    manifestJson,
    backgroundJs,
    contentJs,
    popupHtml,
    popupJs,
  };
}
