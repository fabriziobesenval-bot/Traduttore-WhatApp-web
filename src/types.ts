export type NavTab = "translator" | "webhook" | "extension" | "solutions";

export type TranslationTone = "naturale" | "formale" | "amichevole";

export interface ChatMessage {
  id: string;
  sender: "me" | "contact";
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  targetLanguage: string;
  registerNote?: string;
  latencyMs?: number;
  timestamp: string;
  sourceType?: "simulator" | "webhook";
}

export interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  city: string;
  language: string;
  languageCode: string;
  avatarUrl: string;
  roleOrContext: string;
  messages: ChatMessage[];
}

export interface GlossaryItem {
  id: string;
  term: string;
  keepAs: string;
}

export interface WebhookLogEntry {
  id: string;
  receivedAt: string;
  from: string;
  contactName: string;
  originalText: string;
  detectedLanguage: string;
  translatedText: string;
  targetLang: string;
  registerNote: string;
  rawPayload?: unknown;
}
