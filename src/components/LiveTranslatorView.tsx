import { useState, useEffect, useRef, FormEvent } from "react";
import {
  Send,
  Copy,
  Check,
  Search,
  ArrowLeftRight,
  Trash2,
  Plus,
  MessageSquarePlus,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { INCOMING_TEST_SAMPLES, SUPPORTED_LANGUAGES } from "../data/initialData";
import { PackageDownloadBanner } from "./PackageDownloadBanner";
import {
  ChatMessage,
  GlossaryItem,
  TranslationTone,
  WhatsAppContact,
} from "../types";

interface LiveTranslatorViewProps {
  contacts: WhatsAppContact[];
  activeContactId: string;
  onSelectContact: (id: string) => void;
  onAddMessage: (contactId: string, message: ChatMessage) => void;
  onUpdateContactLanguage: (contactId: string, language: string) => void;
  glossary: GlossaryItem[];
  onAddGlossary: (term: string, keepAs: string) => void;
  onRemoveGlossary: (id: string) => void;
}

function Avatar({ name, url }: { name: string; url: string }) {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!url || imgError) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-display text-xs font-semibold flex items-center justify-center shrink-0">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`Foto profilo di ${name}`}
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className="w-10 h-10 rounded-full object-cover bg-slate-100 shrink-0"
    />
  );
}

export function LiveTranslatorView({
  contacts,
  activeContactId,
  onSelectContact,
  onAddMessage,
  onUpdateContactLanguage,
  glossary,
  onAddGlossary,
  onRemoveGlossary,
}: LiveTranslatorViewProps) {
  const activeContact =
    contacts.find((c) => c.id === activeContactId) || contacts[0];

  const [searchQuery, setSearchQuery] = useState("");
  const [userLanguage, setUserLanguage] = useState("Italiano");
  const [tone, setTone] = useState<TranslationTone>("naturale");
  const [autoReply, setAutoReply] = useState(true);
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(true);

  const [draftText, setDraftText] = useState("");
  const [livePreviewText, setLivePreviewText] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const [isSimulatingReply, setIsSimulatingReply] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Incoming message simulator drawer
  const [showIncomingDrawer, setShowIncomingDrawer] = useState(false);
  const [incomingInput, setIncomingInput] = useState("");
  const [isReceivingIncoming, setIsReceivingIncoming] = useState(false);

  // Mobile/Tablet inspector toggle
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Glossary form
  const [newTerm, setNewTerm] = useState("");
  const [newKeepAs, setNewKeepAs] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContact?.messages.length, isSimulatingReply]);

  // Debounced live translation preview as user types
  useEffect(() => {
    if (!livePreviewEnabled || !draftText.trim() || !activeContact) {
      setLivePreviewText("");
      setIsPreviewLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsPreviewLoading(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            text: draftText,
            sourceLang: userLanguage,
            targetLang: activeContact.language,
            tone,
            glossary: glossary.map(({ term, keepAs }) => ({ term, keepAs })),
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setLivePreviewText(data.translatedText || "");
      } catch {
        // Ignore aborted preview requests
      } finally {
        setIsPreviewLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [draftText, livePreviewEnabled, userLanguage, activeContact?.language, tone, glossary]);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const nowTime = () =>
    new Date().toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!draftText.trim() || !activeContact || isSending) return;

    const textToSend = draftText.trim();
    setDraftText("");
    setLivePreviewText("");
    setErrorMsg(null);
    setIsSending(true);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSend,
          sourceLang: userLanguage,
          targetLang: activeContact.language,
          tone,
          glossary: glossary.map(({ term, keepAs }) => ({ term, keepAs })),
          history: activeContact.messages.slice(-6).map((m) => ({
            sender: m.sender,
            original: m.originalText,
            translated: m.translatedText,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore durante la traduzione.");
      }

      const outgoingMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "me",
        originalText: textToSend,
        translatedText: data.translatedText,
        detectedLanguage: data.detectedLanguage || userLanguage,
        targetLanguage: activeContact.language,
        registerNote: data.registerNote || undefined,
        latencyMs: data.latencyMs,
        timestamp: nowTime(),
        sourceType: "simulator",
      };

      onAddMessage(activeContact.id, outgoingMsg);
      setIsSending(false);

      if (autoReply) {
        setIsSimulatingReply(true);
        const replyRes = await fetch("/api/simulate-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contactName: activeContact.name,
            contactLang: activeContact.language,
            userLang: userLanguage,
            lastUserMessageNative: data.translatedText,
            tone,
            scenario: activeContact.roleOrContext,
            history: [...activeContact.messages, outgoingMsg].slice(-6).map((m) => ({
              sender: m.sender,
              original: m.originalText,
            })),
          }),
        });

        const replyData = await replyRes.json();
        if (replyRes.ok && replyData.nativeReply) {
          const incomingMsg: ChatMessage = {
            id: `msg-reply-${Date.now()}`,
            sender: "contact",
            originalText: replyData.nativeReply,
            translatedText: replyData.translatedReply,
            detectedLanguage: activeContact.language,
            targetLanguage: userLanguage,
            registerNote: replyData.registerNote || undefined,
            timestamp: nowTime(),
            sourceType: "simulator",
          };
          onAddMessage(activeContact.id, incomingMsg);
        }
        setIsSimulatingReply(false);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Impossibile tradurre il messaggio."
      );
      setIsSending(false);
      setIsSimulatingReply(false);
    }
  };

  const handleSimulateIncoming = async (textOverride?: string) => {
    const payloadText = (textOverride ?? incomingInput).trim();
    if (!payloadText || !activeContact || isReceivingIncoming) return;

    setIsReceivingIncoming(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: payloadText,
          sourceLang: "auto",
          targetLang: userLanguage,
          tone,
          glossary: glossary.map(({ term, keepAs }) => ({ term, keepAs })),
          history: activeContact.messages.slice(-4).map((m) => ({
            sender: m.sender,
            original: m.originalText,
            translated: m.translatedText,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore traduzione in entrata.");

      onAddMessage(activeContact.id, {
        id: `msg-in-${Date.now()}`,
        sender: "contact",
        originalText: payloadText,
        translatedText: data.translatedText,
        detectedLanguage: data.detectedLanguage || "Rilevata",
        targetLanguage: userLanguage,
        registerNote: data.registerNote || undefined,
        latencyMs: data.latencyMs,
        timestamp: nowTime(),
        sourceType: "simulator",
      });
      setIncomingInput("");
      setShowIncomingDrawer(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Errore traduzione.");
    } finally {
      setIsReceivingIncoming(false);
    }
  };

  const handleAddGlossarySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim()) return;
    onAddGlossary(newTerm.trim(), (newKeepAs || newTerm).trim());
    setNewTerm("");
    setNewKeepAs("");
  };

  if (!activeContact) return null;

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-50">
      {/* Left Sidebar: Contacts */}
      <aside className="hidden md:flex md:w-72 shrink-0 flex-col bg-white border-r border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca contatto o lingua..."
              aria-label="Cerca contatto o lingua"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Nessun contatto trovato per "{searchQuery}".
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = contact.id === activeContact.id;
              const lastMsg = contact.messages[contact.messages.length - 1];
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => onSelectContact(contact.id)}
                  className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected ? "bg-teal-50/70" : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar name={contact.name} url={contact.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isSelected ? "text-teal-900" : "text-slate-900"
                        }`}
                      >
                        {contact.name}
                      </span>
                      {lastMsg && (
                        <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                          {lastMsg.timestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {contact.city} · {contact.language}
                    </p>
                    {lastMsg ? (
                      <p className="text-xs text-slate-600 mt-1 truncate">
                        {lastMsg.sender === "me"
                          ? `Tu: ${lastMsg.originalText}`
                          : lastMsg.translatedText}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1 italic">
                        Nessun messaggio ancora
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <PackageDownloadBanner compact />
      </aside>

      {/* Center: Bilingual Live Chat Viewport */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Chat Subheader */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={activeContact.name} url={activeContact.avatarUrl} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-sm font-semibold text-slate-900 truncate">
                  {activeContact.name}
                </h1>
                <span className="text-xs font-mono tabular-nums text-slate-400 hidden sm:inline">
                  {activeContact.phone}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {userLanguage} ↔ {activeContact.language} · {activeContact.roleOrContext}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowIncomingDrawer((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showIncomingDrawer
                  ? "bg-teal-50 border-teal-200 text-teal-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Simula Messaggio Ricevuto</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettingsDrawer((prev) => !prev)}
              aria-label="Impostazioni traduzione e glossario"
              className="xl:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Opzioni</span>
            </button>
          </div>
        </div>

        {/* Mobile Contact Switcher Strip */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {contacts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectContact(c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                c.id === activeContact.id
                  ? "bg-teal-700 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {c.name} ({c.language})
            </button>
          ))}
        </div>

        {/* Incoming Message Tester Drawer */}
        {showIncomingDrawer && (
          <div className="bg-white border-b border-slate-200 px-5 py-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-800">
                Incolla un messaggio ricevuto in qualsiasi lingua per testare la traduzione istantanea in {userLanguage}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {INCOMING_TEST_SAMPLES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    disabled={isReceivingIncoming}
                    onClick={() => handleSimulateIncoming(sample.text)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={incomingInput}
                onChange={(e) => setIncomingInput(e.target.value)}
                placeholder="Es: Hey! Running 15 mins late because of the train strike, mind pushing our call?"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <button
                type="button"
                disabled={isReceivingIncoming || !incomingInput.trim()}
                onClick={() => handleSimulateIncoming()}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                {isReceivingIncoming ? "Traduzione..." : "Ricevi e Traduci"}
              </button>
            </div>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
          {activeContact.messages.length === 0 ? (
            <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-xl p-6 text-center space-y-2">
              <ArrowLeftRight className="w-6 h-6 text-teal-700 mx-auto" aria-hidden="true" />
              <h2 className="font-display text-sm font-semibold text-slate-900">
                Conversazione pronta per {activeContact.name}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scrivi un messaggio in {userLanguage} qui sotto: verrà tradotto istantaneamente in {activeContact.language}. Se l'opzione Auto-risposta è attiva, {activeContact.name} ti risponderà nella sua lingua e vedrai la traduzione automatica.
              </p>
            </div>
          ) : (
            activeContact.messages.map((msg) => {
              const isMe = msg.sender === "me";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-xl w-full sm:w-auto rounded-xl border p-4 space-y-2.5 ${
                      isMe
                        ? "bg-teal-900 text-white border-teal-900"
                        : "bg-white text-slate-900 border-slate-200"
                    }`}
                  >
                    {/* Primary readable text for the user */}
                    <div>
                      <div
                        className={`text-[11px] font-medium mb-1 flex items-center justify-between gap-4 ${
                          isMe ? "text-teal-200" : "text-slate-500"
                        }`}
                      >
                        <span>
                          {isMe
                            ? `Tradotto in ${msg.targetLanguage}`
                            : `Tradotto da ${msg.detectedLanguage}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.translatedText)}
                          className={`inline-flex items-center gap-1 hover:underline cursor-pointer ${
                            isMe ? "text-teal-100" : "text-slate-600"
                          }`}
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3" aria-hidden="true" />
                              <span>Copiato</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" aria-hidden="true" />
                              <span>Copia</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.translatedText}
                      </p>
                    </div>

                    {/* Hairline divider + Original text */}
                    <div
                      className={`pt-2.5 border-t text-xs leading-relaxed ${
                        isMe
                          ? "border-teal-800 text-teal-100/90"
                          : "border-slate-100 text-slate-500"
                      }`}
                    >
                      <span className="font-medium">
                        {isMe ? "Originale:" : `${activeContact.name}:`}
                      </span>{" "}
                      {msg.originalText}
                    </div>

                    {msg.registerNote && (
                      <p
                        className={`text-[11px] leading-snug ${
                          isMe ? "text-teal-200/80" : "text-teal-700"
                        }`}
                      >
                        Nota linguistica: {msg.registerNote}
                      </p>
                    )}
                  </div>

                  {/* Clean unboxed timestamp & latency metadata */}
                  <div className="mt-1 px-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono tabular-nums">
                    <span>{msg.timestamp}</span>
                    {msg.sourceType === "webhook" && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-sans text-teal-700 font-medium">
                          Via Webhook WhatsApp
                        </span>
                      </>
                    )}
                    {msg.latencyMs !== undefined && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{msg.latencyMs} ms</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isSimulatingReply && (
            <div className="flex items-start">
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" aria-hidden="true" />
                <span>
                  {activeContact.name} sta scrivendo in {activeContact.language}...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-5 mb-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-3 text-xs text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="font-medium underline cursor-pointer"
            >
              Chiudi
            </button>
          </div>
        )}

        {/* Live Translation Preview + Message Composer */}
        <form
          onSubmit={handleSend}
          className="bg-white border-t border-slate-200 px-5 py-3.5 space-y-2.5"
        >
          {livePreviewEnabled && (draftText.trim().length > 0 || isPreviewLoading) && (
            <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium text-teal-700">
                  Anteprima simultanea ({activeContact.language})
                </span>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                  {isPreviewLoading && !livePreviewText
                    ? "Traduzione in corso..."
                    : livePreviewText}
                </p>
              </div>
              {isPreviewLoading && (
                <Loader2
                  className="w-3.5 h-3.5 animate-spin text-slate-400 shrink-0 mt-1"
                  aria-hidden="true"
                />
              )}
            </div>
          )}

          <div className="flex items-end gap-3">
            <textarea
              rows={2}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={`Scrivi in ${userLanguage} — traduzione automatica in ${activeContact.language}...`}
              className="flex-1 resize-none px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!draftText.trim() || isSending}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0 h-10"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{isSending ? "Invio..." : "Traduci e Invia"}</span>
            </button>
          </div>
        </form>
      </main>

      {/* Right Inspector: Preferences & Glossary */}
      <aside
        className={`${
          showSettingsDrawer
            ? "fixed inset-y-16 right-0 z-40 flex w-80 shadow-xl"
            : "hidden xl:flex xl:w-80"
        } shrink-0 flex-col bg-white border-l border-slate-200 overflow-y-auto`}
      >
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Motore di Traduzione
            </h2>
            {showSettingsDrawer && (
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Chiudi
              </button>
            )}
          </div>

          {/* Language Pair */}
          <div className="space-y-3">
            <div>
              <label htmlFor="user-lang" className="block text-xs font-medium text-slate-600 mb-1">
                La tua lingua
              </label>
              <select
                id="user-lang"
                value={userLanguage}
                onChange={(e) => setUserLanguage(e.target.value)}
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
              <label htmlFor="target-lang" className="block text-xs font-medium text-slate-600 mb-1">
                Lingua di {activeContact.name}
              </label>
              <select
                id="target-lang"
                value={activeContact.language}
                onChange={(e) =>
                  onUpdateContactLanguage(activeContact.id, e.target.value)
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tone Segmented Control */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <span className="block text-xs font-medium text-slate-600">
              Registro della traduzione
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {(["naturale", "formale", "amichevole"] as TranslationTone[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                      tone === t
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Behavior Toggles */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <span className="block text-xs font-medium text-slate-800">
                  Anteprima mentre scrivi
                </span>
                <span className="block text-[11px] text-slate-500">
                  Mostra la traduzione prima dell'invio
                </span>
              </div>
              <input
                type="checkbox"
                checked={livePreviewEnabled}
                onChange={(e) => setLivePreviewEnabled(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-teal-700 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <span className="block text-xs font-medium text-slate-800">
                  Auto-risposta contatto
                </span>
                <span className="block text-[11px] text-slate-500">
                  Simula una risposta reale nella lingua estera
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoReply}
                onChange={(e) => setAutoReply(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-teal-700 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Glossary */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-xs font-semibold text-slate-800">
                Glossario termini protetti
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nomi brand, sigle o termini tecnici da non alterare.
              </p>
            </div>

            <div className="space-y-1.5">
              {glossary.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <span className="text-slate-800 font-medium truncate">
                    {item.term} → {item.keepAs}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveGlossary(item.id)}
                    aria-label={`Rimuovi ${item.term}`}
                    className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddGlossarySubmit} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="Termine"
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <input
                  type="text"
                  value={newKeepAs}
                  onChange={(e) => setNewKeepAs(e.target.value)}
                  placeholder="Mantieni come"
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <button
                type="submit"
                disabled={!newTerm.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Aggiungi al glossario</span>
              </button>
            </form>
          </div>
        </div>
      </aside>
    </div>
  );
}
