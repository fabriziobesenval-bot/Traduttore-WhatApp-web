import { useState } from "react";
import { Copy, Check, Download, Loader2 } from "lucide-react";
import { PackageDownloadBanner } from "./PackageDownloadBanner";
import { triggerBrowserDownload } from "../utils/downloadPackage";

export function ChromeExtensionView() {
  const [copiedFile, setCopiedFile] = useState<"manifest" | "content" | null>(null);
  const [downloadingExt, setDownloadingExt] = useState(false);

  const apiBase =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const handleDownloadExtensionZip = async () => {
    if (downloadingExt) return;
    setDownloadingExt(true);
    try {
      await triggerBrowserDownload(
        "/api/download/extension.zip",
        "linguabridge-chrome-extension.zip"
      );
    } finally {
      setDownloadingExt(false);
    }
  };

  const manifestCode = `{
  "manifest_version": 3,
  "name": "LinguaBridge per WhatsApp Web",
  "version": "1.1.0",
  "description": "Traduce automaticamente in tempo reale le conversazioni su WhatsApp Web.",
  "permissions": ["storage", "activeTab"],
  "host_permissions": [
    "https://web.whatsapp.com/*",
    "http://localhost:3000/*",
    "${apiBase}/*"
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
}`;

  const contentSummary = `// La nuova estensione v1.1 include 5 file nella cartella chrome-extension/:
// - manifest.json  (permessi + service worker + popup)
// - background.js  (esegue le chiamate API aggirando i blocchi CSP di WhatsApp Web)
// - content.js     (mostra la barra "LinguaBridge" in alto su web.whatsapp.com e traduce i messaggi)
// - popup.html / popup.js (menu dall'icona Chrome per scegliere lingua e server locale/cloud)`;

  const copyBlock = (type: "manifest" | "content", text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedFile(type);
    setTimeout(() => setCopiedFile(null), 1600);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <section className="max-w-3xl space-y-2">
        <p className="text-xs font-medium text-teal-700">
          Soluzione Personale · Browser Desktop (v1.1 con barra visibile)
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Estensione Chrome per WhatsApp Web (Numero Personale)
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          La nuova versione <strong className="font-semibold text-slate-900">v1.1</strong> aggiunge un Service Worker per evitare i blocchi di sicurezza di WhatsApp Web, un popup di configurazione sull'icona Chrome e una{" "}
          <strong className="font-semibold text-slate-900">barra LinguaBridge visibile in alto su web.whatsapp.com</strong>{" "}
          per vedere subito lo stato e tradurre sia i messaggi ricevuti sia le bozze prima di inviarle.
        </p>
      </section>

      <PackageDownloadBanner />

      {/* Direct extension v1.1 download + activation checklist */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Non vedi nulla su WhatsApp Web? Verifica questi 3 passaggi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Aggiorna all'estensione v1.1 per avere la barra di controllo visibile e il collegamento Cloud/Locale dal popup.
            </p>
          </div>
          <button
            type="button"
            disabled={downloadingExt}
            onClick={handleDownloadExtensionZip}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            {downloadingExt ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{downloadingExt ? "Generazione..." : "Scarica solo Estensione v1.1 (.ZIP)"}</span>
          </button>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-600 leading-relaxed">
          <li className="space-y-1">
            <span className="font-semibold text-slate-900 block">
              01. Ricarica la cartella v1.1
            </span>
            <span>
              In <span className="font-mono">chrome://extensions</span> rimuovi la vecchia estensione, estrai il nuovo ZIP e carica la cartella <span className="font-mono">chrome-extension</span> (o <span className="font-mono">linguabridge-chrome-extension</span>).
            </span>
          </li>
          <li className="space-y-1">
            <span className="font-semibold text-slate-900 block">
              02. Ricarica WhatsApp Web (F5)
            </span>
            <span>
              Apri o ricarica <span className="font-mono">web.whatsapp.com</span>: in alto al centro comparirà subito la barra bianca <strong>LinguaBridge</strong> con i pulsanti <em>Traduci chat</em> e <em>Traduci bozza</em>.
            </span>
          </li>
          <li className="space-y-1">
            <span className="font-semibold text-slate-900 block">
              03. Avvia il server sul PC (:3000)
            </span>
            <span>
              L'URL di anteprima <span className="font-mono">ais-dev-...</span> è privato (richiede login Google). Estrai lo ZIP completo, fai doppio clic su <span className="font-mono">Avvia_LinguaBridge.bat</span> (o <span className="font-mono">.command</span>) e nel popup clicca <strong>Usa Locale (:3000)</strong>.
            </span>
          </li>
        </ol>
      </section>

      <div className="grid grid-cols-1 gap-6">
        {/* manifest.json */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-mono text-xs font-semibold text-slate-900">
              manifest.json (v1.1)
            </h2>
            <button
              type="button"
              onClick={() => copyBlock("manifest", manifestCode)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              {copiedFile === "manifest" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
                  <span>Copiato</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copia manifest.json</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-5 text-xs font-mono text-slate-800 bg-slate-50 overflow-x-auto leading-relaxed">
            <code>{manifestCode}</code>
          </pre>
        </section>

        {/* Architecture summary */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-mono text-xs font-semibold text-slate-900">
              Struttura cartella chrome-extension/ (5 file)
            </h2>
            <button
              type="button"
              onClick={() => copyBlock("content", contentSummary)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              {copiedFile === "content" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
                  <span>Copiato</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copia riepilogo</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-5 text-xs font-mono text-slate-800 bg-slate-50 overflow-x-auto leading-relaxed">
            <code>{contentSummary}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
