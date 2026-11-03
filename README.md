# ROBOplan

- `index.html`: Startseite mit iPad-Rahmen.
- `app.html`: gemeinsame Grunddatei mit Navigation und Dialog.
- `pages/`: HTML-Inhalte der vier Unterseiten.
- `styles.css`: gemeinsames Layout und Gestaltung.
- `bootstrap.js`: lädt die Unterseiten über den Webserver.
- `app.js`: gemeinsame Daten, Karten, Navigation und Interaktionen.
- `preview.html`: Weiterleitung auf die neue Startseite.

Über einen Webserver öffnen, z. B. `/mmk/`. Ohne Geräte-Rahmen ist die Anwendung unter `/mmk/app.html` erreichbar. Die Unterseiten sind HTML-Fragmente und werden in die Grunddatei eingebunden. Beim Reiterwechsel bleiben Kartenansichten und Zustand erhalten.
