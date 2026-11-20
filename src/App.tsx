import { useState, useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { LiveTranslatorView } from "./components/LiveTranslatorView";
import { WebhookBridgeView } from "./components/WebhookBridgeView";
import { ChromeExtensionView } from "./components/ChromeExtensionView";
import { ExistingSolutionsView } from "./components/ExistingSolutionsView";
import { NewChatModal } from "./components/NewChatModal";
import { INITIAL_CONTACTS, INITIAL_GLOSSARY } from "./data/initialData";
import {
  ChatMessage,
  GlossaryItem,
  NavTab,
  WebhookLogEntry,
  WhatsAppContact,
} from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("translator");
  const [contacts, setContacts] = useState<WhatsAppContact[]>(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string>(
    INITIAL_CONTACTS[0].id
  );
  const [glossary, setGlossary] = useState<GlossaryItem[]>(INITIAL_GLOSSARY);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const [webhookLogs, setWebhookLogs] = useState<WebhookLogEntry[]>([]);
  const [sseConnected, setSseConnected] = useState(false);

  // Load initial webhook logs & subscribe to real-time SSE events
  useEffect(() => {
    fetch("/api/webhook/logs")
      .then((res) => (res.ok ? res.json() : { logs: [] }))
      .then((data) => {
        if (Array.isArray(data.logs)) {
          setWebhookLogs(data.logs);
        }
      })
      .catch(() => {});

    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("connected", () => {
      setSseConnected(true);
    });

    eventSource.addEventListener("whatsapp_message", (ev) => {
      try {
        const entry = JSON.parse((ev as MessageEvent).data) as WebhookLogEntry;
        setWebhookLogs((prev) => [entry, ...prev].slice(0, 30));

        // Also mirror incoming webhook messages into the live chat list
        setContacts((prev) => {
          const existing = prev.find((c) => c.phone.replace(/\D/g, "") === entry.from.replace(/\D/g, ""));
          const newMsg: ChatMessage = {
            id: entry.id,
            sender: "contact",
            originalText: entry.originalText,
            translatedText: entry.translatedText,
            detectedLanguage: entry.detectedLanguage,
            targetLanguage: entry.targetLang,
            registerNote: entry.registerNote || undefined,
            timestamp: new Date(entry.receivedAt).toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sourceType: "webhook",
          };

          if (existing) {
            return prev.map((c) =>
              c.id === existing.id
                ? { ...c, messages: [...c.messages, newMsg] }
                : c
            );
          }

          const newContact: WhatsAppContact = {
            id: `wa-${entry.from}`,
            name: entry.contactName,
            phone: `+${entry.from}`,
            city: "WhatsApp Cloud API",
            language: entry.detectedLanguage,
            languageCode: "auto",
            avatarUrl: "",
            roleOrContext: "Messaggio ricevuto via Webhook ufficiale",
            messages: [newMsg],
          };
          return [newContact, ...prev];
        });
      } catch {
        // Ignore malformed SSE payload
      }
    });

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleAddMessage = (contactId: string, message: ChatMessage) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId ? { ...c, messages: [...c.messages, message] } : c
      )
    );
  };

  const handleUpdateContactLanguage = (contactId: string, language: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, language } : c))
    );
  };

  const handleCreateContact = (contact: WhatsAppContact) => {
    setContacts((prev) => [contact, ...prev]);
    setActiveContactId(contact.id);
    setActiveTab("translator");
  };

  const handleAddGlossary = (term: string, keepAs: string) => {
    setGlossary((prev) => [
      ...prev,
      { id: `g-${Date.now()}`, term, keepAs },
    ]);
  };

  const handleRemoveGlossary = (id: string) => {
    setGlossary((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewChat={() => setIsNewChatOpen(true)}
      />

      <div className="flex-1">
        {activeTab === "translator" && (
          <LiveTranslatorView
            contacts={contacts}
            activeContactId={activeContactId}
            onSelectContact={setActiveContactId}
            onAddMessage={handleAddMessage}
            onUpdateContactLanguage={handleUpdateContactLanguage}
            glossary={glossary}
            onAddGlossary={handleAddGlossary}
            onRemoveGlossary={handleRemoveGlossary}
          />
        )}

        {activeTab === "webhook" && (
          <WebhookBridgeView logs={webhookLogs} sseConnected={sseConnected} />
        )}

        {activeTab === "extension" && <ChromeExtensionView />}

        {activeTab === "solutions" && (
          <ExistingSolutionsView onNavigate={setActiveTab} />
        )}
      </div>

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreateContact={handleCreateContact}
      />
    </div>
  );
}
