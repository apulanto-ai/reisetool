# 🚲 Reisetool

Selbst gehostete Web-App für die Fahrradreise: **Reisetagebuch** (Kilometerstände, E-Bike-Laden, Wetter, Erinnerungen), **Ausgaben** und **Essen/Lebensmittel** — mit mehreren Benutzern, Admin-Bereich, Theme-Auswahl und Export. Läuft als ein Docker-Container auf Unraid, Daten liegen in einer SQLite-Datei.

## Funktionen

- 📓 **Reisetagebuch** — ein Eintrag pro Tag: Tachostand (Tagesdistanz wird automatisch aus der Differenz berechnet), wo/wie das E-Bike geladen wurde, Wetter, Vorkommnisse, Erinnerungen
- 💶 **Ausgaben** — Betrag, Rubrik, wer bezahlt hat; Summen und Rubrik-Filter
- 🛒 **Essen** — Einkäufe und Lebensmittelverbrauch
- 👥 **Mehrere Benutzer** mit Admin-Bereich (Benutzer anlegen, Passwort zurücksetzen, deaktivieren)
- 🏷️ **Rubriken frei konfigurierbar** (Admin → Rubriken): ergänzen, umbenennen, Farbe/Icon, Reihenfolge, deaktivieren
- 🎨 **Themes**: Hell/Dunkel/System + 5 Akzentfarben, pro Benutzer
- 📱 **Mobile-first**: Bottom-Navigation, große Touch-Ziele, als Web-App installierbar (PWA-Manifest)
- 🧩 **Anpassbare Darstellung** pro Benutzer: Dashboard-Widgets ein-/ausblenden und umsortieren, Tab-Reihenfolge, Karten-/Kompakt-Ansicht
- 📤 **Export**: CSV (deutsches Excel-Format), JSON-Komplettexport, druckbarer Reisebericht (→ PDF über den Druckdialog)

## Schnellstart (Entwicklung)

```bash
npm install
npm run dev
```

Beim ersten Aufruf erscheint die Einrichtung (`/setup`): Reisename + Admin-Konto anlegen. Die Datenbank entsteht automatisch unter `data/reisetool.db`.

## Deployment auf Unraid

### 1. Image bauen

Auf einem Rechner mit Docker (oder direkt auf Unraid im Terminal):

```bash
docker build -t reisetool .
```

Alternativ mit Compose: `docker compose up -d --build`

### 2. Datenordner anlegen

```bash
mkdir -p /mnt/user/appdata/reisetool
chown -R 99:100 /mnt/user/appdata/reisetool
```

### 3. Container starten

Wichtige Einstellungen (siehe `docker-compose.yml`, gilt genauso für ein Unraid-Docker-Template):

| Einstellung | Wert | Hinweis |
|---|---|---|
| Port | `3000` | Web-UI |
| Volume | `/mnt/user/appdata/reisetool` → `/data` | SQLite-Datenbank |
| `ORIGIN` | z.B. `http://192.168.1.10:3000` | **Muss exakt der URL entsprechen, die ihr im Browser eintippt** — sonst werden Formulare mit 403 abgelehnt (CSRF-Schutz von SvelteKit) |
| `TZ` | `Europe/Berlin` | Für korrekte Datumsvorbelegung |
| User | `99:100` | Unraid `nobody:users` |

### 4. Zugriff im Heimnetz

1. Im Browser `http://<IP-des-Unraid-Servers>:3000` öffnen (gleiche URL wie in `ORIGIN`)
2. Am Handy: „Zum Startbildschirm hinzufügen" → fühlt sich wie eine App an

Tipp: Dem Unraid-Server im Router eine feste IP geben, damit die URL stabil bleibt.

### Backup

Die gesamte Datenbank ist eine Datei: `/mnt/user/appdata/reisetool/reisetool.db` (inkl. `-wal`/`-shm`-Dateien). Für ein konsistentes Backup den Container kurz stoppen und die Dateien kopieren — oder den JSON-Export aus der App nutzen.

## Technik

SvelteKit 2 (Svelte 5) · TypeScript · Tailwind CSS v4 · SQLite via Drizzle ORM (`better-sqlite3`) · Argon2id-Passwort-Hashing · Session-Cookies · Migrationen laufen automatisch beim Start.

```bash
npm run check        # Typprüfung
npm run db:generate  # Migration aus Schemaänderung erzeugen
```
