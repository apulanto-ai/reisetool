# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
die Versionierung an [SemVer](https://semver.org/lang/de/).

## [1.0.1] – 2026-06-12

### Hinzugefügt

- GitHub-Actions-Workflow: Docker-Image wird automatisch gebaut und auf
  `ghcr.io/apulanto-ai/reisetool` veröffentlicht (`latest` + Versions-Tags) —
  Installation auf Unraid direkt über „Add Container", ohne lokalen Build

### Geändert

- Kein `ORIGIN`-Env mehr nötig: Die App akzeptiert jede URL, unter der sie
  aufgerufen wird (CSRF weiterhin über SameSite=Lax-Session-Cookies abgedeckt)
- README: Unraid-Anleitung auf das fertige GHCR-Image umgestellt

## [1.0.0] – 2026-06-12

### Hinzugefügt

- Reisetagebuch: ein Eintrag pro Tag mit Tachostand, automatischer Tagesdistanz
  (Differenz zum Vortag), E-Bike-Ladeinfo, Wetter, Vorkommnissen und Erinnerungen
- Ausgaben: Betrag, Rubrik, „bezahlt von", Tagesgruppierung, Summen, Rubrik-Filter
- Essen: Einkäufe und Lebensmittelverbrauch mit Menge als Freitext
- Mehrbenutzer-Betrieb mit Admin-Bereich: Benutzer anlegen, Passwort zurücksetzen,
  deaktivieren; First-Run-Setup für Reise + Admin-Konto
- Frei konfigurierbare Rubriken (Admin): anlegen, umbenennen, Farbe/Icon,
  Reihenfolge, deaktivieren
- Anpassbare Darstellung pro Benutzer: Dashboard-Widgets (Sichtbarkeit/Reihenfolge),
  Tab-Reihenfolge, Karten-/Kompakt-Ansicht, Dichte
- Themes: Hell/Dunkel/System + 5 Akzentfarben, pro Benutzer
- Export: CSV (deutsches Excel-Format), JSON-Komplettexport, druckbarer Reisebericht
- Mobile-first-UI mit Bottom-Navigation, installierbar als Web-App (PWA-Manifest)
- Docker-Deployment für Unraid (SQLite unter `/data`, automatische Migrationen)
