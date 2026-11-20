import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { triggerBrowserDownload } from "../utils/downloadPackage";

interface PackageDownloadBannerProps {
  compact?: boolean;
}

export function PackageDownloadBanner({ compact = false }: PackageDownloadBannerProps) {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownloadZip = async () => {
    if (downloadingZip) return;
    setDownloadingZip(true);
    setErrorMsg(null);
    try {
      await triggerBrowserDownload("/api/download/package.zip", "linguabridge-completo.zip");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Errore download ZIP.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    setErrorMsg(null);
    try {
      await triggerBrowserDownload("/api/download/guida.pdf", "Guida_Installazione_LinguaBridge.pdf");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Errore download PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (compact) {
    return (
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
        <div>
          <p className="text-xs font-semibold text-slate-900">
            Pacchetto installazione locale
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Codice sorgente, estensione Chrome e guida PDF.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={downloadingZip}
            onClick={handleDownloadZip}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {downloadingZip ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{downloadingZip ? "Creazione ZIP..." : "Scarica tutto (.ZIP + PDF)"}</span>
          </button>
          <button
            type="button"
            disabled={downloadingPdf}
            onClick={handleDownloadPdf}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{downloadingPdf ? "Generazione PDF..." : "Solo guida PDF"}</span>
          </button>
        </div>
        {errorMsg && <p className="text-[11px] text-red-700">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
      <div className="space-y-1 max-w-2xl">
        <h2 className="font-display text-base font-semibold text-slate-900">
          Scarica il pacchetto completo (.ZIP) con guida PDF inclusa
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Include gli script di avvio automatico con doppio clic (<span className="font-mono">Avvia_LinguaBridge.bat</span> / <span className="font-mono">.command</span>), il generatore per installer Windows (<span className="font-mono">installer-exe/</span>), l'estensione Chrome (<span className="font-mono">chrome-extension/</span>) e la guida <span className="font-mono">Guida_Installazione_LinguaBridge.pdf</span>.
        </p>
        {errorMsg && <p className="text-xs text-red-700 pt-1">{errorMsg}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        <button
          type="button"
          disabled={downloadingPdf}
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
        >
          {downloadingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{downloadingPdf ? "Generazione..." : "Scarica Guida PDF"}</span>
        </button>

        <button
          type="button"
          disabled={downloadingZip}
          onClick={handleDownloadZip}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
        >
          {downloadingZip ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{downloadingZip ? "Creazione ZIP..." : "Scarica Tutto (.ZIP)"}</span>
        </button>
      </div>
    </section>
  );
}
