# 🚀 Deployment Guide

## Development Setup

1. **Kopiere Umgebungsvariablen:**

```bash
cp .env.local.example .env.local
```

2. **Installiere Dependencies:**

```bash
npm install
```

3. **Starte Development Server:**

```bash
npm run dev
```

## Production Deployment

### 1. Umgebungsvariablen für Production

Setze folgende Umgebungsvariablen auf deinem Production-Server:

```bash
# KRITISCH: Ändere diesen Secret für Production!
BETTER_AUTH_SECRET=dein-sehr-langer-und-sicherer-produktions-schlüssel-hier-mindestens-32-zeichen

# Deine echte Domain
BETTER_AUTH_URL=https://deine-domain.com
NEXTAUTH_URL=https://deine-domain.com

# Node.js Environment
NODE_ENV=production
```

### 2. Sicherheits-Checkliste

- ✅ **BETTER_AUTH_SECRET**: Mindestens 32 Zeichen, zufällig generiert
- ✅ **HTTPS**: In Production nur HTTPS verwenden
- ✅ **E-Mail Verification**: `requireEmailVerification: true` in `config/auth.ts` setzen
- ✅ **Datenbank**: SQLite-Datei sicher speichern und backuppen

### 3. Build Commands

```bash
# Build für Production
npm run build

# Starte Production Server
npm start
```

### 4. Vercel Deployment

1. **Vercel CLI installieren:**

```bash
npm i -g vercel
```

2. **Deployen:**

```bash
vercel --prod
```

3. **Umgebungsvariablen in Vercel setzen:**
   - Gehe zu Vercel Dashboard > Settings > Environment Variables
   - Füge alle oben genannten Variablen hinzu

### 5. Database Persistence

Für Production empfiehlt sich eine externe Datenbank:

```typescript
// config/auth.ts - Beispiel für PostgreSQL
export const auth = betterAuth({
  database: {
    provider: "pg",
    url: process.env.DATABASE_URL,
  },
  // ... rest der Konfiguration
});
```

## Troubleshooting

### Session-Probleme?

- Prüfe, ob BETTER_AUTH_SECRET gesetzt ist
- Lösche Browser-Cookies und versuche erneut
- Prüfe Network-Tab für API-Fehler

### Cookie-Probleme?

- Stelle sicher, dass HTTPS in Production verwendet wird
- Prüfe Domain-Konfiguration in BETTER_AUTH_URL

### Datenbank-Probleme?

- Prüfe, ob auth.db Schreibrechte hat
- Bei SQLite: Stelle sicher, dass der Ordner existiert
