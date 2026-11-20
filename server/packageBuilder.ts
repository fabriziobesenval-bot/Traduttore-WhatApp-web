import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import JSZip from "jszip";
import { buildChromeExtensionFiles } from "./extensionFiles";

const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".git", ".aistudio", ".next"]);
const EXCLUDED_FILES = new Set([".env", ".env.local", ".env.production", "server.js", "bun.lock"]);

export function generateInstallationPdfBuffer(serverOrigin: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 52, bottom: 52, left: 52, right: 52 },
      info: {
        Title: "Guida di Installazione - LinguaBridge",
        Author: "LinguaBridge",
        Subject: "Installazione automatica, estensione Chrome WhatsApp Web, Webhook Meta ed eseguibile EXE",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const primary = "#0F766E";
    const ink = "#0F172A";
    const muted = "#475569";
    const border = "#CBD5E1";

    const sectionTitle = (num: string, title: string) => {
      doc.moveDown(0.8);
      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(primary)
        .text(`${num}. ${title}`);
      doc.moveDown(0.25);
    };

    const bodyText = (text: string) => {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(ink)
        .text(text, { lineGap: 3 });
      doc.moveDown(0.35);
    };

    const bullet = (text: string) => {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(ink)
        .text(`•  ${text}`, { indent: 10, lineGap: 2.5 });
    };

    const codeBlock = (code: string) => {
      doc.moveDown(0.2);
      const startY = doc.y;
      const padding = 10;
      const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const height = doc.heightOfString(code, { width: width - padding * 2, lineGap: 2 }) + padding * 2;

      if (startY + height > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
      }

      const boxY = doc.y;
      doc
        .save()
        .roundedRect(doc.page.margins.left, boxY, width, height, 6)
        .fillAndStroke("#F8FAFC", border)
        .restore();

      doc
        .font("Courier")
        .fontSize(9)
        .fillColor("#1E293B")
        .text(code, doc.page.margins.left + padding, boxY + padding, {
          width: width - padding * 2,
          lineGap: 2,
        });

      doc.y = boxY + height + 8;
    };

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor(ink)
      .text("LinguaBridge");
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(muted)
      .text("Pacchetto completo — Avvio con doppio clic, Estensione Chrome, Cloud API & Builder EXE");
    doc.moveDown(0.5);
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor(border)
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.6);

    // 1. Overview
    sectionTitle("01", "Contenuto del pacchetto finito");
    bodyText(
      "Questo archivio include gli script automatici per avviare l'app senza usare manualmente il terminale, l'estensione per WhatsApp Web e i file per generare un installer .EXE su Windows."
    );
    bullet("Avvia_LinguaBridge.bat — Avvio automatico con doppio clic su Windows (installa e apre il browser).");
    bullet("Avvia_LinguaBridge.command — Avvio automatico con doppio clic su macOS / Linux.");
    bullet("installer-exe/ — Progetto Electron pronto per generare 'LinguaBridge Setup.exe' su Windows.");
    bullet("chrome-extension/ — Estensione Chrome per tradurre WhatsApp Web sul numero personale.");
    bullet("Guida_Installazione_LinguaBridge.pdf — Questo manuale operativo.");
    doc.moveDown(0.4);

    // 2. One-click startup
    sectionTitle("02", "Avvio immediato con doppio clic (Windows e macOS)");
    bodyText("Prerequisito unico: avere Node.js 20+ installato sul PC (se manca, lo script ti apre la pagina di download ufficiale).");
    bullet("Estrai tutto il file ZIP in una cartella sul Desktop o in Documenti.");
    bullet("Su Windows: fai doppio clic su 'Avvia_LinguaBridge.bat'.");
    bullet("Su macOS: fai doppio clic su 'Avvia_LinguaBridge.command' (al primo avvio: tasto destro > Apri).");
    bullet("Al primo avvio lo script crea il file .env e ti chiede di incollare la tua chiave GEMINI_API_KEY, installa le dipendenze in automatico e apre LinguaBridge nel browser.");
    doc.moveDown(0.4);

    // 3. Build true .EXE installer on Windows
    sectionTitle("03", "Creare un vero installer .EXE per Windows (Opzionale)");
    bodyText(
      "Se desideri distribuire il software come applicazione desktop autonoma con icona sul Desktop e procedura guidata di installazione Windows (.exe):"
    );
    bullet("Apri la cartella 'installer-exe/' estratta dallo ZIP.");
    bullet("Fai doppio clic su 'Crea_Installer_EXE.bat' (richiede Node.js installato sul PC Windows).");
    bullet("Lo script compila l'app web, impacchetta Electron e genera il file finale in 'installer-exe/dist-exe/LinguaBridge Setup 1.0.0.exe'.");
    doc.moveDown(0.3);
    bodyText("Comandi equivalenti se preferisci eseguirli manualmente da terminale:");
    codeBlock(`npm install\nnpm run build\ncd installer-exe\nnpm install\nnpm run build:win`);

    // 4. Chrome Extension
    sectionTitle("04", "Estensione Chrome per WhatsApp Web (Numero Personale)");
    bodyText(
      "Per tradurre in tempo reale le conversazioni sul tuo numero WhatsApp personale mentre il programma è avviato:"
    );
    bullet("Apri Google Chrome e visita: chrome://extensions");
    bullet("Attiva 'Modalità sviluppatore' in alto a destra.");
    bullet("Clicca 'Carica estensione non pacchettizzata' e seleziona la cartella 'chrome-extension'.");
    bullet("Apri https://web.whatsapp.com : ogni messaggio in arrivo verrà tradotto automaticamente sotto la bolla originale.");
    doc.moveDown(0.3);
    bodyText(
      `Nota: per collegare l'estensione a un server già online invece che al PC locale, imposta API_ENDPOINT in chrome-extension/content.js su: ${serverOrigin}/api/translate`
    );

    // 5. WhatsApp Cloud API
    sectionTitle("05", "Collegamento Webhook Meta WhatsApp Cloud API (Business)");
    bodyText(
      "Per un servizio attivo 24/7 su numeri WhatsApp Business ufficiali senza tenere il PC acceso:"
    );
    bullet("Pubblica il server su un servizio cloud HTTPS (Cloud Run, Railway o VPS).");
    bullet("Nel portale Meta for Developers > WhatsApp > Webhook imposta Callback URL:");
    codeBlock(`${serverOrigin}/api/webhook/whatsapp`);
    bullet("Imposta Verify Token (predefinito: linguabridge_verify) e sottoscrivi il campo 'messages'.");
    bullet("Aggiungi WHATSAPP_APP_SECRET in .env per verificare crittograficamente ogni richiesta Meta.");
    doc.moveDown(0.4);

    // 6. Security
    sectionTitle("06", "Sicurezza e protezione della chiave API");
    bullet("Il file .env resta esclusivamente sul tuo computer o server e non viene mai incluso negli archivi di distribuzione.");
    bullet("Le chiamate a Gemini avvengono solo lato server; l'estensione Chrome non contiene mai chiavi segrete.");
    bullet("Per distribuire un .exe a colleghi o clienti senza esporre la tua chiave personale, ospita il backend su cloud e collega l'app desktop all'URL del server.");

    doc.end();
  });
}

function collectProjectFiles(rootDir: string, currentDir = rootDir): string[] {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relPath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name) || entry.name.startsWith(".")) {
        continue;
      }
      files.push(...collectProjectFiles(rootDir, fullPath));
    } else if (entry.isFile()) {
      if (EXCLUDED_FILES.has(entry.name) || entry.name.endsWith(".log") || entry.name.endsWith(".zip")) {
        continue;
      }
      files.push(relPath);
    }
  }
  return files;
}

export async function generateFullPackageZip(
  projectRoot: string,
  serverOrigin: string
): Promise<Buffer> {
  const zip = new JSZip();

  // 1. PDF Guide
  const pdfBuffer = await generateInstallationPdfBuffer(serverOrigin);
  zip.file("Guida_Installazione_LinguaBridge.pdf", pdfBuffer);

  // 2. Windows One-Click Installer & Launcher (.bat with CRLF)
  const winBat = [
    "@echo off",
    "setlocal enabledelayedexpansion",
    "title LinguaBridge - Avvio Rapido",
    'cd /d "%~dp0"',
    "",
    "echo ==========================================",
    "echo   LinguaBridge - Installazione e Avvio",
    "echo ==========================================",
    "echo.",
    "",
    "where node >nul 2>nul",
    "if errorlevel 1 (",
    "  echo [ERRORE] Node.js non trovato su questo PC.",
    "  echo Apertura della pagina ufficiale per scaricare Node.js LTS...",
    "  start https://nodejs.org/",
    "  pause",
    "  exit /b 1",
    ")",
    "",
    'if not exist "node_modules" (',
    "  echo [1/3] Installazione dipendenze al primo avvio...",
    "  call npm install --no-audit --no-fund",
    "  if errorlevel 1 (",
    "    echo Riprovo con --legacy-peer-deps...",
    "    call npm install --legacy-peer-deps --no-audit --no-fund",
    "    if errorlevel 1 (",
    "      echo [ERRORE] Installazione dipendenze fallita.",
    "      pause",
    "      exit /b 1",
    "    )",
    "  )",
    ")",
    "",
    'if not exist ".env" (',
    "  echo.",
    "  echo [2/3] Configurazione chiave API Gemini...",
    '  set /p USER_KEY="Incolla qui la tua GEMINI_API_KEY e premi INVIO: "',
    '  (',
    '    echo GEMINI_API_KEY="!USER_KEY!"',
    '    echo WHATSAPP_VERIFY_TOKEN="linguabridge_verify"',
    '  ) > .env',
    ")",
    "",
    "echo [3/3] Avvio del server LinguaBridge su http://localhost:3000 ...",
    'start "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"',
    "call npm run dev",
    "pause",
  ].join("\r\n");

  zip.file("Avvia_LinguaBridge.bat", winBat);

  // 3. macOS / Linux One-Click Launcher (.command with executable permissions)
  const macCommand = [
    "#!/usr/bin/env bash",
    "set -e",
    'cd "$(dirname "$0")"',
    "",
    'echo "=========================================="',
    'echo "  LinguaBridge - Installazione e Avvio"',
    'echo "=========================================="',
    "",
    "if ! command -v node >/dev/null 2>&1; then",
    '  echo "[ERRORE] Node.js non trovato. Scaricalo da https://nodejs.org/"',
    "  open https://nodejs.org/ 2>/dev/null || true",
    '  read -p "Premi INVIO per chiudere..."',
    "  exit 1",
    "fi",
    "",
    'if [ ! -d "node_modules" ]; then',
    '  echo "[1/3] Installazione dipendenze al primo avvio..."',
    "  npm install --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund",
    "fi",
    "",
    'if [ ! -f ".env" ]; then',
    '  echo "[2/3] Configurazione chiave API Gemini..."',
    '  read -p "Incolla la tua GEMINI_API_KEY e premi INVIO: " USER_KEY',
    '  printf \'GEMINI_API_KEY="%s"\\nWHATSAPP_VERIFY_TOKEN="linguabridge_verify"\\n\' "$USER_KEY" > .env',
    "fi",
    "",
    'echo "[3/3] Avvio su http://localhost:3000 ..."',
    "(sleep 3 && (open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null || true)) &",
    "npm run dev",
  ].join("\n");

  zip.file("Avvia_LinguaBridge.command", macCommand, { unixPermissions: "755" });

  // 4. Desktop .EXE Builder (Electron + NSIS configuration)
  const electronMain = `const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let serverProcess = null;

function startBackend() {
  const rootDir = path.resolve(__dirname, "..");
  serverProcess = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["tsx", "server.ts"], {
    cwd: rootDir,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "ignore",
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    title: "LinguaBridge — Traduzione WhatsApp",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const loadWithRetry = () => {
    win.loadURL("http://localhost:3000").catch(() => {
      setTimeout(loadWithRetry, 500);
    });
  };
  setTimeout(loadWithRetry, 1200);
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
`;

  const electronPkg = `{
  "name": "linguabridge-desktop",
  "version": "1.0.0",
  "description": "Installer desktop per LinguaBridge",
  "main": "electron-main.cjs",
  "scripts": {
    "start": "electron .",
    "build:win": "electron-builder --win nsis"
  },
  "build": {
    "appId": "com.linguabridge.app",
    "productName": "LinguaBridge",
    "directories": {
      "output": "dist-exe"
    },
    "files": [
      "electron-main.cjs",
      "../dist/**/*",
      "../server.ts",
      "../server/**/*",
      "../package.json"
    ],
    "win": {
      "target": "nsis"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true
    }
  },
  "devDependencies": {
    "electron": "^35.0.0",
    "electron-builder": "^25.1.8"
  }
}
`;

  const buildExeBat = [
    "@echo off",
    "title LinguaBridge - Generatore Installer .EXE",
    'cd /d "%~dp0.."',
    "echo [1/4] Installazione dipendenze app web...",
    "call npm install --no-audit --no-fund || call npm install --legacy-peer-deps --no-audit --no-fund",
    "echo [2/4] Compilazione frontend di produzione...",
    "call npm run build",
    'cd /d "%~dp0"',
    "echo [3/4] Installazione Electron Builder...",
    "call npm install --no-audit --no-fund || call npm install --legacy-peer-deps --no-audit --no-fund",
    "echo [4/4] Creazione installer Windows (.exe)...",
    "call npm run build:win",
    "echo.",
    'echo Fatto! Trovi il file .exe nella cartella "installer-exe\\dist-exe".',
    "pause",
  ].join("\r\n");

  zip.file("installer-exe/electron-main.cjs", electronMain);
  zip.file("installer-exe/package.json", electronPkg);
  zip.file("installer-exe/Crea_Installer_EXE.bat", buildExeBat);

  // 5. Chrome Extension Folder (MV3 with background service worker + popup + floating WhatsApp bar)
  const ext = buildChromeExtensionFiles(serverOrigin);
  zip.file("chrome-extension/manifest.json", ext.manifestJson);
  zip.file("chrome-extension/background.js", ext.backgroundJs);
  zip.file("chrome-extension/content.js", ext.contentJs);
  zip.file("chrome-extension/popup.html", ext.popupHtml);
  zip.file("chrome-extension/popup.js", ext.popupJs);

  // Add .npmrc so Windows/macOS npm never fails on optional peer conflicts
  zip.file(".npmrc", "legacy-peer-deps=true\n");

  // 6. Full-stack source code (excluding secrets and build artifacts)
  const files = collectProjectFiles(projectRoot);
  for (const relPath of files) {
    const normalized = relPath.split(path.sep).join("/");
    if (normalized === "package.json") {
      const pkgRaw = fs.readFileSync(path.join(projectRoot, relPath), "utf8");
      const pkgFixed = pkgRaw.replace(/"esbuild":\s*"\^0\.25\.0"/, '"esbuild": "^0.28.0"');
      zip.file(normalized, pkgFixed);
      continue;
    }
    const content = fs.readFileSync(path.join(projectRoot, relPath));
    zip.file(normalized, content);
  }

  return zip.generateAsync({
    type: "nodebuffer",
    platform: "UNIX",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export async function generateExtensionOnlyZip(serverOrigin: string): Promise<Buffer> {
  const zip = new JSZip();
  const ext = buildChromeExtensionFiles(serverOrigin);
  zip.file("linguabridge-chrome-extension/manifest.json", ext.manifestJson);
  zip.file("linguabridge-chrome-extension/background.js", ext.backgroundJs);
  zip.file("linguabridge-chrome-extension/content.js", ext.contentJs);
  zip.file("linguabridge-chrome-extension/popup.html", ext.popupHtml);
  zip.file("linguabridge-chrome-extension/popup.js", ext.popupJs);

  return zip.generateAsync({
    type: "nodebuffer",
    platform: "UNIX",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}
