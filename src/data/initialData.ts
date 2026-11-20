import { GlossaryItem, WhatsAppContact } from "../types";

export const SUPPORTED_LANGUAGES = [
  { label: "Italiano", code: "it" },
  { label: "Inglese", code: "en" },
  { label: "Tedesco", code: "de" },
  { label: "Spagnolo", code: "es" },
  { label: "Francese", code: "fr" },
  { label: "Giapponese", code: "ja" },
  { label: "Portoghese", code: "pt" },
  { label: "Cinese (Mandarino)", code: "zh" },
  { label: "Arabo", code: "ar" },
  { label: "Coreano", code: "ko" },
];

export const INITIAL_CONTACTS: WhatsAppContact[] = [
  {
    id: "elena-berlin",
    name: "Elena Weber",
    phone: "+49 176 4820 9134",
    city: "Berlino",
    language: "Tedesco",
    languageCode: "de",
    avatarUrl: "/src/assets/images/avatar_elena_1795163238912.jpg",
    roleOrContext: "Responsabile Acquisti — Fornitura Packaging Sostenibile",
    messages: [
      {
        id: "m-1",
        sender: "contact",
        originalText:
          "Hallo! Wir haben die Muster heute bekommen. Die Haptik ist super, aber beim Preis müssen wir noch etwas feilen, bevor wir die Bestellung freigeben.",
        translatedText:
          "Ciao! Abbiamo ricevuto i campioni oggi. La qualità al tatto è ottima, ma sul prezzo dobbiamo ancora limare qualcosa prima di approvare l'ordine.",
        detectedLanguage: "Tedesco",
        targetLanguage: "Italiano",
        registerNote: "Espressione 'etwas feilen' resa con 'limare qualcosa' nel registro commerciale.",
        timestamp: "09:42",
        sourceType: "simulator",
      },
      {
        id: "m-2",
        sender: "me",
        originalText:
          "Ciao Elena, felice che i campioni vi siano piaciuti! Su un ordine da 10.000 pezzi possiamo applicare lo sconto volume dell'8%.",
        translatedText:
          "Hallo Elena, es freut mich, dass euch die Muster gefallen haben! Bei einer Bestellung ab 10.000 Stück können wir einen Mengenrabatt von 8 % gewähren.",
        detectedLanguage: "Italiano",
        targetLanguage: "Tedesco",
        timestamp: "09:45",
        sourceType: "simulator",
      },
    ],
  },
  {
    id: "kenji-tokyo",
    name: "Kenji Sato",
    phone: "+81 90 3412 8890",
    city: "Tokyo",
    language: "Giapponese",
    languageCode: "ja",
    avatarUrl: "/src/assets/images/avatar_kenji_1795163239482.jpg",
    roleOrContext: "Architetto — Progetto Showroom Milano / Tokyo",
    messages: [
      {
        id: "m-3",
        sender: "contact",
        originalText:
          "お疲れ様です。昨日の図面の件ですが、照明の配置を少し調整してもよろしいでしょうか？明日の午前中までに修正版をお送りします。",
        translatedText:
          "Buongiorno e buon lavoro. Riguardo alle planimetrie di ieri, potremmo regolare leggermente la disposizione delle luci? Le invierò la versione aggiornata entro domani mattina.",
        detectedLanguage: "Giapponese",
        targetLanguage: "Italiano",
        registerNote: "'Otsukaresama desu' è un saluto lavorativo formale cortese.",
        timestamp: "10:15",
        sourceType: "simulator",
      },
    ],
  },
  {
    id: "sofia-madrid",
    name: "Sofia Mendoza",
    phone: "+34 612 904 331",
    city: "Madrid",
    language: "Spagnolo",
    languageCode: "es",
    avatarUrl: "/src/assets/images/avatar_sofia_1795163239982.jpg",
    roleOrContext: "Creative Director — Campagna Lancio Primavera",
    messages: [
      {
        id: "m-4",
        sender: "contact",
        originalText:
          "¡Oye! Se nos ha echado el tiempo encima con el rodaje. ¿Crees que podemos mover la entrega del martes al jueves sin que se caiga todo?",
        translatedText:
          "Ehi! Siamo stretti con i tempi per le riprese. Pensi che possiamo spostare la consegna da martedì a giovedì senza mandare tutto all'aria?",
        detectedLanguage: "Spagnolo",
        targetLanguage: "Italiano",
        registerNote: "'Se nos ha echado el tiempo encima' indica urgenza improvvisa.",
        timestamp: "11:04",
        sourceType: "simulator",
      },
    ],
  },
];

export const INITIAL_GLOSSARY: GlossaryItem[] = [
  { id: "g-1", term: "LinguaBridge", keepAs: "LinguaBridge" },
  { id: "g-2", term: "FOB Milano", keepAs: "FOB Milano" },
];

export const INCOMING_TEST_SAMPLES = [
  {
    label: "Inglese (Slang colloquiale)",
    lang: "Inglese",
    text: "No worries at all, let's play it by ear tomorrow and touch base around noon!",
  },
  {
    label: "Tedesco (Urgenza logistica)",
    lang: "Tedesco",
    text: "Der Spediteur steckt leider im Stau fest. Reicht es euch, wenn die Palette erst morgen früh ankommt?",
  },
  {
    label: "Francese (Assistenza clienti)",
    lang: "Francese",
    text: "Bonjour, je n'ai toujours pas reçu le numéro de suivi pour ma commande #4821. Pouvez-vous vérifier s'il vous plaît ?",
  },
  {
    label: "Giapponese (Conferma cortese)",
    lang: "Giapponese",
    text: "承知いたしました。契約書の内容を確認のうえ、週明けにご連絡いたします。",
  },
];

export const EXISTING_SOLUTIONS = [
  {
    name: "Traduzione integrata WhatsApp",
    category: "Nativa (Meta)",
    realtimeAuto: "Parziale",
    availability: "Rollout graduale su iOS/Android (traduzione manuale on-device per singolo messaggio)",
    pros: "Massima privacy end-to-end, nessuna app esterna necessaria.",
    limits: "Non traduce automaticamente in tempo reale mentre scrivi in uscita e supporta poche lingue iniziali.",
  },
  {
    name: "Samsung Galaxy AI / Gboard",
    category: "Sistema / Tastiera",
    realtimeAuto: "Sì (in uscita)",
    availability: "Smartphone Samsung S24/S25+ o tastiera Google Gboard su Android",
    pros: "Funziona dentro l'app WhatsApp ufficiale senza ban o API.",
    limits: "Legata all'hardware (Samsung) o richiede copia-incolla/selezione per i messaggi in entrata.",
  },
  {
    name: "Estensioni Chrome per WhatsApp Web",
    category: "Browser Desktop",
    realtimeAuto: "Sì (bidirezionale)",
    availability: "Chrome Web Store (es. WA Web Translator, oppure estensione personalizzata)",
    pros: "Traduce automaticamente la chat sul browser sul tuo account personale senza cambiare numero.",
    limits: "Funziona solo su PC/Mac tramite browser; se WhatsApp Web aggiorna il DOM va adattato il selettore.",
  },
  {
    name: "App Custom con WhatsApp Cloud API",
    category: "Software Proprietario",
    realtimeAuto: "Sì (100% automatico)",
    availability: "Richiede account WhatsApp Business API (Meta Developers) + server come questo",
    pros: "Controllo totale: webhook istantanei, glossario aziendale, CRM, messaggi vocali trascritti e tradotti.",
    limits: "Non si collega a un numero WhatsApp personale standard: richiede un numero dedicato Business.",
  },
  {
    name: "App Android NotificationListener",
    category: "App Mobile Custom",
    realtimeAuto: "Sì (overlay / risposte)",
    availability: "Sviluppo nativo Android (Kotlin) tramite intercettazione notifiche + risposta rapida",
    pros: "Funziona sul numero personale senza violare la crittografia dell'app WhatsApp.",
    limits: "Su iOS è bloccato da Apple; su Android funziona solo a schermo/notifiche attive.",
  },
];
