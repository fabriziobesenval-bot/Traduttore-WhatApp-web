import { useState, FormEvent } from "react";
import { Copy, Check, Send, Radio, AlertCircle } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../data/initialData";
import { WebhookLogEntry } from "../types";

interface WebhookBridgeViewProps {
  logs: WebhookLogEntry[];
  sseConnected: boolean;
}

export function WebhookBridgeView({
  logs,
  sseConnected,
}: WebhookBridgeViewProps) {
  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhook/whatsapp`
      : "/api/webhook/whatsapp";

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [senderName, setSenderName] = useState("Lukas Meyer");
  const [senderPhone, setSenderPhone] = useState("4917612345678");
  const [incomingText, setIncomingText] = useState(
    "Guten Tag! Können wir das Meeting auf 15:30 Uhr verschieben?"
  );
  const [targetLang, setTargetLang] = useState("Italiano");
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1600);
  };

  const handleTriggerWebhook = async (e: FormEvent) => {
    e.preventDefault();
    if (!incomingText.trim() || isSending) return;

    setIsSending(true);
    setErrorMsg(null);

    const metaWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "104928172635",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "390212345678",
                  phone_number_id: "9876543210",
                },
                contacts: [
                  {
                    profile: { name: senderName.trim() || "Contatto Esterno" },
                    wa_id: senderPhone.trim() || "4917612345678",
                  },
                ],
                messages: [
                  {
                    from: senderPhone.trim() || "4917612345678",
                    id: `wamid.HBgM${Date.now()}`,
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    text: { body: incomingText.trim() },
                    type: "text",
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    try {
      const res = await fetch(
        `/api/webhook/whatsapp?targetLang=${encodeURIComponent(targetLang)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metaWebhookPayload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore durante l'invio al webhook.");
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Errore sconosciuto webhook."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium text-teal-700">
            Architettura Server-Side · Meta Cloud API
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Bridge Webhook WhatsApp Business attivo
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Questo server espone già gli endpoint ufficiali compatibili con{" "}
            <strong className="font-semibold text-slate-900">
              WhatsApp Business Cloud API
            </strong>
            . Ogni messaggio ricevuto viene tradotto con Gemini e trasmesso in tempo reale alla dashboard tramite Server-Sent Events.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg">
          <Radio
            className={`w-3.5 h-3.5 ${
              sseConnected ? "text-teal-600" : "text-slate-400"
            }`}
            aria-hidden="true"
          />
          <span>
            Stream SSE: {sseConnected ? "Connesso in tempo reale" : "Riconnessione..."}
          </span>
        </div>
      </div>

      {/* Configuration Details */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          <span className="text-xs font-medium text-slate-500">
            Callback URL Webhook (GET verifica & POST ricezione)
          </span>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 truncate">
              {webhookUrl}
            </code>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
                  <span>Copiato</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copia URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-500">
            Verify Token predefinito
          </span>
          <div className="px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
            linguabridge_verify
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Test Simulator Form */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Invia un Webhook Meta di test
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Simula un payload JSON ufficiale inviato dai server Meta al tuo endpoint <span className="font-mono">/api/webhook/whatsapp</span>.
            </p>
          </div>

          <form onSubmit={handleTriggerWebhook} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="wh-name" className="block text-xs font-medium text-slate-700 mb-1">
                  Nome mittente
                </label>
                <input
                  id="wh-name"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="wh-phone" className="block text-xs font-medium text-slate-700 mb-1">
                  Numero WA ID
                </label>
                <input
                  id="wh-phone"
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="wh-lang" className="block text-xs font-medium text-slate-700 mb-1">
                Traduci automaticamente in
              </label>
              <select
                id="wh-lang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="wh-text" className="block text-xs font-medium text-slate-700 mb-1">
                Corpo del messaggio WhatsApp
              </label>
              <textarea
                id="wh-text"
                rows={3}
                value={incomingText}
                onChange={(e) => setIncomingText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || !incomingText.trim()}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isSending ? "Elaborazione webhook..." : "Esegui POST Webhook"}</span>
            </button>
          </form>
        </section>

        {/* Live Streamed Webhook Log */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Eventi ricevuti in tempo reale
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {logs.length} {logs.length === 1 ? "evento" : "eventi"}
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Nessun webhook ricevuto in questa sessione
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Usa il modulo a sinistra per inviare un evento WhatsApp Cloud API simulato oppure configura l'URL su Meta for Developers.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 max-h-[500px] overflow-y-auto">
              {logs.map((entry) => (
                <div key={entry.id} className="p-5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="font-medium text-slate-900">
                      {entry.contactName}{" "}
                      <span className="font-mono tabular-nums font-normal text-slate-500">
                        · +{entry.from}
                      </span>
                    </div>
                    <div className="font-mono tabular-nums">
                      {new Date(entry.receivedAt).toLocaleTimeString("it-IT")} ·{" "}
                      {entry.detectedLanguage} → {entry.targetLang}
                    </div>
                  </div>
                  <p className="text-sm text-slate-900 font-medium">
                    {entry.translatedText}
                  </p>
                  <p className="text-xs text-slate-500">
                    Originale: {entry.originalText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
