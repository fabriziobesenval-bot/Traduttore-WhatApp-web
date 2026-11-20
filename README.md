LinguaBridge
LinguaBridge è una piattaforma full-stack per la traduzione automatica bidirezionale e in tempo reale delle conversazioni WhatsApp, basata su React + TypeScript + Vite, backend Express e motore di traduzione Google Gemini (@google/genai).
Funzionalità principali
Traduttore Live Bidirezionale
Traduzione simultanea dei messaggi in entrata e in uscita con rilevamento automatico della lingua.
Gestione del registro/tono (naturale, formale, amichevole), preservazione di formattazione WhatsApp (*grassetto*, _corsivo_), emoji e link.
Glossario personalizzato vincolante (termini aziendali, nomi propri, sigle) e contesto degli ultimi messaggi della chat.
Anteprima di traduzione in tempo reale durante la digitazione e simulazione interattiva delle risposte del contatto.
Bridge Ufficiale WhatsApp Cloud API (Webhook + SSE)
Endpoint GET / POST conforme alle specifiche Meta (hub.challenge, verifica token timingSafeEqual e firma opzionale X-Hub-Signature-256 HMAC-SHA256).
Stream Server-Sent Events (/api/events) per visualizzare immediatamente nella dashboard i messaggi ricevuti e tradotti.
Estensione Chrome MV3 per WhatsApp Web
Inietta traduzioni automatiche direttamente sotto le bolle di https://web.whatsapp.com tramite background.js (aggiramento sicuro della CSP di WhatsApp) e coda concorrente controllata.
Barra flottante con cambio lingua/tono al volo e indicatore di stato del server locale.
Progetto Nativo Android (Kotlin / Gradle)
Codice sorgente pronto da compilare in APK con Android Studio: intercetta le notifiche WhatsApp tramite NotificationListenerService, traduce tramite il server LinguaBridge e consente la risposta rapida tramite RemoteInput.
Esportazione Pacchetti e Guide PDF
Endpoint dedicati per scaricare l'archivio completo (linguabridge-completo.zip), la sola estensione Chrome, il progetto Android e le guide PDF passo-passo (installazione PC/Estensione + creazione APK Android).
Stack Tecnologico
Livello	Tecnologie
Frontend	React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion
Backend	Node.js, Express 4, tsx, Server-Sent Events (SSE)
Motore AI	@google/genai (con fallback automatico gemini-4-hydrogen → gemini-3.1-flash-lite)
Export & Docs	jszip, pdfkit
Mobile (opzionale)	Android SDK / Kotlin / Gradle (NotificationListenerService)
Struttura del Repository
Text
.
├── index.html                  # Entry point HTML
├── metadata.json               # Metadati applicazione
├── package.json                # Dipendenze e script npm
├── server.ts                   # Server Express, API Gemini, Webhook Meta, SSE e download
├── vite.config.ts              # Configurazione Vite
├── server/
│   ├── androidFiles.ts         # Generatore file sorgente progetto Android Kotlin/Gradle
│   ├── extensionFiles.ts       # Generatore estensione Chrome Manifest V3
│   └── packageBuilder.ts       # Generatore archivi ZIP e manuali PDF (PC & APK)
└── src/
    ├── App.tsx                 # Shell principale e navigazione tra le viste
    ├── index.css               # Stili globali Tailwind CSS
    ├── types.ts                # Tipi TypeScript condivisi
    ├── data/
    │   └── initialData.ts      # Lingue supportate, glossario iniziale e analisi soluzioni
    ├── utils/
    │   └── downloadPackage.ts  # Helper download browser
    └── components/
        ├── TopBar.tsx
        ├── LiveTranslatorView.tsx
        ├── WebhookBridgeView.tsx
        ├── ChromeExtensionView.tsx
        ├── ExistingSolutionsView.tsx
        ├── PackageDownloadBanner.tsx
        └── NewChatModal.tsx
Requisiti
Node.js >= 20.x e npm
Una chiave API valida di Google Gemini (GEMINI_API_KEY)
(Opzionale) Google Chrome / Edge per usare l'estensione su WhatsApp Web
(Opzionale) Android Studio (con Gradle JDK 17) per compilare l'APK Android
(Opzionale) Account Meta for Developers per collegare un numero WhatsApp Business tramite Webhook
Installazione e Avvio Locale
Clona il repository
Bash
git clone https://github.com/<tuo-utente>/<tuo-repo>.git
cd <tuo-repo>
Installa le dipendenze
Bash
npm install --legacy-peer-deps
(Il flag --legacy-peer-deps evita eventuali conflitti tra peer dependency opzionali di esbuild/vite.)
Configura le variabili d'ambiente
Copia .env.example in .env e inserisci la tua chiave Gemini:
Bash
cp .env.example .env
Contenuto di .env:
Env
GEMINI_API_KEY="la-tua-chiave-gemini"
APP_URL="http://localhost:3000"

# Opzionali — per l'integrazione con Meta WhatsApp Cloud API
WHATSAPP_VERIFY_TOKEN="linguabridge_verify"
WHATSAPP_APP_SECRET=""
Avvia in modalità sviluppo
Bash
npm run dev
Il server sarà disponibile su http://localhost:3000.
Build e avvio in produzione
Bash
npm run build
NODE_ENV=production npm start
Script Disponibili
Comando	Descrizione
npm run dev	Avvia server Express + middleware Vite in sviluppo sulla porta 3000
npm run build	Compila il frontend React/Vite nella cartella dist/
npm start	Avvia il server Node (server.ts) in produzione
npm run lint	Esegue il type-check TypeScript (tsc --noEmit)
npm run clean	Rimuove la cartella dist/
Endpoint API Principali
Metodo	Endpoint	Descrizione
GET	/api/health	Verifica stato operativo del server
POST	/api/translate	Traduce un messaggio con lingua target, tono, glossario e storico
POST	/api/simulate-reply	Simula una risposta del contatto nella lingua selezionata
GET	/api/webhook/whatsapp	Verifica iniziale del Webhook Meta (hub.challenge)
POST	/api/webhook/whatsapp	Riceve e traduce messaggi in entrata da WhatsApp Cloud API
GET	/api/webhook/logs	Restituisce gli ultimi messaggi ricevuti via Webhook
GET	/api/events	Stream SSE live per aggiornamenti Webhook in tempo reale
GET	/api/download/package.zip	Scarica il pacchetto completo con script di avvio, estensione e progetto Android
GET	/api/download/extension.zip	Scarica la sola estensione Chrome MV3
GET	/api/download/android.zip	Scarica il progetto Android Studio completo
GET	/api/download/guida.pdf	Scarica il manuale PDF di installazione generale
GET	/api/download/android-guida.pdf	Scarica il manuale PDF passo-passo per compilare l'APK Android
Estensione Chrome & App Android
Una volta avviata l'applicazione web (http://localhost:3000):
Estensione Chrome: scarica lo ZIP dalla scheda Estensione Web, estrai la cartella, apri chrome://extensions, attiva la Modalità sviluppatore e seleziona Carica estensione non pacchettizzata.
APK Android: scarica il progetto Android (.zip) e la guida PDF dedicata (Istruzioni Crea APK (.PDF)) dalla barra laterale o dalla scheda Soluzioni Esistenti, quindi apri il progetto in Android Studio con Gradle JDK 17 per generare l'APK Debug o Release.
Sicurezza
La chiave GEMINI_API_KEY è utilizzata esclusivamente lato server e non viene mai esposta al client o nei pacchetti ZIP esportati.
La verifica del Webhook Meta usa confronto constant-time (crypto.timingSafeEqual), validazione rigorosa di hub.challenge e supporto opzionale alla firma HMAC-SHA256 (WHATSAPP_APP_SECRET).
I messaggi utente sono racchiusi in delimitatori dedicati per mitigare tentativi di prompt injection.
CORS su /api/translate e /api/health è limitato all'origine locale, https://web.whatsapp.com ed estensioni Chrome (chrome-extension://).
Rate limiting in memoria per IP applicato agli endpoint /api/* (con esenzione per traffico locale di loopback dell'estensione desktop).
Licenza
Uso personale e dimostrativo. Verifica la conformità ai Termini di Servizio di Meta prima dell'uso in produzione su account WhatsApp aziendali.
