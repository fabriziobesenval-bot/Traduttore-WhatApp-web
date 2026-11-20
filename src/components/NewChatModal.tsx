import { useState, FormEvent } from "react";
import { X } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../data/initialData";
import { WhatsAppContact } from "../types";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateContact: (contact: WhatsAppContact) => void;
}

export function NewChatModal({ isOpen, onClose, onCreateContact }: NewChatModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+33 6 45 12 89 00");
  const [city, setCity] = useState("Parigi");
  const [language, setLanguage] = useState("Francese");
  const [roleOrContext, setRoleOrContext] = useState("Cliente / Partner commerciale");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.label === language) || SUPPORTED_LANGUAGES[4];

    const newContact: WhatsAppContact = {
      id: `chat-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || "+00 000 000000",
      city: city.trim() || "Internazionale",
      language: langObj.label,
      languageCode: langObj.code,
      avatarUrl: "",
      roleOrContext: roleOrContext.trim() || "Conversazione WhatsApp tradotta in tempo reale",
      messages: [],
    };

    onCreateContact(newContact);
    setName("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-chat-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="new-chat-title" className="font-display text-base font-semibold text-slate-900">
            Nuova Conversazione Multilingua
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi finestra"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="contact-name" className="block text-xs font-medium text-slate-700 mb-1.5">
              Nome contatto
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Claire Dubois"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="contact-lang" className="block text-xs font-medium text-slate-700 mb-1.5">
                Lingua del contatto
              </label>
              <select
                id="contact-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {SUPPORTED_LANGUAGES.filter((l) => l.label !== "Italiano").map((l) => (
                  <option key={l.code} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contact-city" className="block text-xs font-medium text-slate-700 mb-1.5">
                Città / Paese
              </label>
              <input
                id="contact-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-phone" className="block text-xs font-medium text-slate-700 mb-1.5">
              Numero WhatsApp
            </label>
            <input
              id="contact-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label htmlFor="contact-context" className="block text-xs font-medium text-slate-700 mb-1.5">
              Contesto conversazione (aiuta l'AI sul registro)
            </label>
            <input
              id="contact-context"
              type="text"
              value={roleOrContext}
              onChange={(e) => setRoleOrContext(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
            >
              Crea Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
