# ROBOplan

- `index.html`: Startseite mit iPad-Rahmen.
- `app.html`: gemeinsame Grunddatei mit Navigation und Dialog.
- `pages/`: HTML-Inhalte der vier Unterseiten.
- `styles.css`: gemeinsames Layout und Gestaltung.
- `bootstrap.js`: lädt die Unterseiten über den Webserver.
- `app.js`: gemeinsame Daten, Karten, Navigation und Interaktionen.
- `preview.html`: Weiterleitung auf die neue Startseite.

Über einen Webserver öffnen, z. B. `/mmk/`. Ohne Geräte-Rahmen ist die Anwendung unter `/mmk/app.html` erreichbar. Die Unterseiten sind HTML-Fragmente und werden in die Grunddatei eingebunden. Beim Reiterwechsel bleiben Kartenansichten und Zustand erhalten.

## Versand als einzelne HTML-Datei

`ROBOplan-Export.html` enthält die gesamte Anwendung inklusive aller Unterseiten, Gestaltung, JavaScript und Kamerabild. Die Datei kann einzeln verschickt und im Browser geöffnet werden; ein Webserver ist nicht erforderlich. Der externe Link zu wetter.de benötigt Internet.

Nach Änderungen neu exportieren:

```bash
python3 build_demo.py --output ROBOplan-Export.html
```

## Disposition

Der lokale Demo-Vorschlag berücksichtigt Prioritäten, Gerätewechsel und Fahrwege. „Vorschlag zurücksetzen“ stellt den vorherigen Plan wieder her. Im Oberflächenprototyp lassen sich Aufträge mit der Maus oder nach kurzem Festhalten auf Touchgeräten aufnehmen. Ablageflächen zeigen das Zurücklegen in den Aufgabenspeicher und das Löschen; beide Aktionen sind rückgängig machbar. Die Karte kann zugunsten einer breiteren Zeitleiste ausgeblendet werden.

„Einsatzplan übernehmen“ speichert den Plan im Browser. Die Übertragung wird simuliert; es ist kein Roboterbackend angebunden. Beim erneuten Öffnen im selben Browser wird der gespeicherte Plan geladen.
