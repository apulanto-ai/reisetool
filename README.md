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

## Installation auf Unraid

Das fertige Docker-Image wird automatisch von GitHub Actions gebaut und auf GHCR veröffentlicht — es ist **kein lokaler Build und kein docker-compose nötig**.

In Unraid: **Docker → Add Container** und eintragen:

| Feld | Wert |
|---|---|
| Name | `Reisetool` |
| Repository | `ghcr.io/apulanto-ai/reisetool:latest` |
| Network Type | `bridge` (Port 3000 mappen) oder `br0` mit eigener IP |
| Port (bei bridge) | Host `3000` → Container `3000` |
| Path | Host `/mnt/user/appdata/reisetool` → Container `/data` |
| Variable | `TZ` = `Europe/Berlin` |

Apply → fertig. Beim ersten Aufruf von `http://<IP>:3000` erscheint die Einrichtung (Reisename + Admin-Konto). Die SQLite-Datenbank liegt danach unter `/mnt/user/appdata/reisetool/`.

Weitere Umgebungsvariablen braucht es nicht — die App akzeptiert jede URL, unter der sie aufgerufen wird.

### Zugriff im Heimnetz

1. Im Browser `http://<IP-des-Unraid-Servers>:3000` öffnen
2. Am Handy: „Zum Startbildschirm hinzufügen" → fühlt sich wie eine App an

Tipp: Dem Unraid-Server im Router eine feste IP geben, damit die URL stabil bleibt.

### Update auf eine neue Version

In Unraid beim Container auf **force update** klicken (zieht das neueste `latest`-Image). Datenbank-Migrationen laufen beim Start automatisch.

### Alternativ: selbst bauen

```bash
docker build -t reisetool .        # oder: docker compose up -d --build
```

### Backup

Die gesamte Datenbank ist eine Datei: `/mnt/user/appdata/reisetool/reisetool.db` (inkl. `-wal`/`-shm`-Dateien). Für ein konsistentes Backup den Container kurz stoppen und die Dateien kopieren — oder den JSON-Export aus der App nutzen.

## Technik

SvelteKit 2 (Svelte 5) · TypeScript · Tailwind CSS v4 · SQLite via Drizzle ORM (`better-sqlite3`) · Argon2id-Passwort-Hashing · Session-Cookies · Migrationen laufen automatisch beim Start.

```bash
npm run check        # Typprüfung
npm run db:generate  # Migration aus Schemaänderung erzeugen
```
