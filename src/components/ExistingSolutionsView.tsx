import { ArrowRight, Check, Info, Layers, Smartphone, Globe, Server } from "lucide-react";
import { EXISTING_SOLUTIONS } from "../data/initialData";
import { NavTab } from "../types";

interface ExistingSolutionsViewProps {
  onNavigate: (tab: NavTab) => void;
}

export function ExistingSolutionsView({ onNavigate }: ExistingSolutionsViewProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      {/* Editorial Header */}
      <section className="max-w-3xl space-y-3">
        <p className="text-xs font-medium text-teal-700">
          Analisi tecnica · Stato dell'arte e fattibilità
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 text-balance">
          Esiste già un traduttore automatico per WhatsApp o conviene crearlo?
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Esistono soluzioni parziali a livello di sistema operativo o estensioni browser, ma{" "}
          <strong className="font-semibold text-slate-900">
            non esiste un'app universale ufficiale che traduca automaticamente e in tempo reale ogni chat bidirezionale su tutti i dispositivi
          </strong>{" "}
          a causa della crittografia end-to-end di WhatsApp. Puoi però costruirlo scegliendo l'architettura giusta in base al tuo obiettivo.
        </p>
      </section>

      {/* Comparison Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Confronto tra soluzioni esistenti e sviluppo su misura
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Valutazione basata su automazione bidirezionale, supporto dispositivi e conformità ai termini Meta
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Soluzione</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Tempo Reale</th>
                <th className="py-3 px-4">Punti di forza</th>
                <th className="py-3 px-6">Limiti principali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {EXISTING_SOLUTIONS.map((item) => (
                <tr key={item.name} className="hover:bg-slate-50/60 transition-colors align-top">
                  <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">
                    {item.name}
                    <div className="text-xs font-normal text-slate-500 mt-1 whitespace-normal max-w-[220px]">
                      {item.availability}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 whitespace-nowrap">{item.category}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`text-xs font-medium ${
                        item.realtimeAuto.startsWith("Sì")
                          ? "text-teal-700"
                          : "text-amber-700"
                      }`}
                    >
                      {item.realtimeAuto}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 max-w-xs">{item.pros}</td>
                  <td className="py-4 px-6 text-slate-600 max-w-xs">{item.limits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3 Practical Ways to Build It */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-slate-900">
          3 modi concreti per creare il tuo traduttore oggi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-teal-700">
                <Server className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs font-semibold">Opzione 1 · Business & Team</span>
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                WhatsApp Cloud API + Webhook
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Soluzione ufficiale Meta al 100% legale e scalabile. Ogni messaggio ricevuto sul tuo numero aziendale attiva un webhook su questo server, viene tradotto da Gemini e mostrato in dashboard.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Zero rischio di blocco account</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Endpoint Webhook già attivo in questa app</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("webhook")}
              className="inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
            >
              <span>Apri Webhook API attivo</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs font-semibold">Opzione 2 · Uso Personale su PC</span>
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                Estensione Chrome per WhatsApp Web
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ideale se vuoi usare il tuo WhatsApp personale senza API Business. Un piccolo script legge i nuovi messaggi su <span className="font-mono text-xs">web.whatsapp.com</span> e inserisce la traduzione sotto ogni bolla in tempo reale.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Funziona sul tuo numero personale</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Codice pronto da copiare e caricare in Chrome</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("extension")}
              className="inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <span>Ottieni Estensione pronta</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Smartphone className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs font-semibold">Opzione 3 · Mobile Nativo</span>
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                App Android con NotificationListener
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Un'app Kotlin per Android intercetta le notifiche di WhatsApp in entrata, le traduce tramite il backend Gemini e mostra un overlay o invia la risposta tramite{" "}
                <span className="font-mono text-xs">RemoteInput</span>.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                <li className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Non viola la crittografia E2E dell'app</span>
                </li>
                <li className="flex items-start gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Su iOS non è permesso da Apple per app terze</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("translator")}
              className="inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <span>Prova il motore live</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
