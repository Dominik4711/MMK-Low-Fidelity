# ROBOplan

## Änderungen Jonas

Stand: 26.11.2026. Aus dem Low-Fidelity-Prototyp ist ein High-Fidelity-Prototyp für unseren Nutzertest geworden. Wir wollen herausfinden, ob die einzelnen Personas ihre Use Cases mit ROBOplan schaffen und wie gut ihnen das gelingt. Grundlage sind unsere Unterlagen „Use Cases: Auftragsplanung im Ackerbau“ (UC 1–5) und „MMK Requirements Ackerbaubetrieb“ (Personas P-001 bis P-004, Testkriterien T-001 bis T-003).

### So funktioniert der Test

- **Die Testperson** arbeitet auf dem iPad mit der echten App. Vor jeder Aufgabe liest sie einen kurzen Aufgabentext, und die App wird in den Ausgangszustand zurückgesetzt. Am Ende füllt sie auf dem iPad einen Evaluationsbogen aus: SUS, NASA-TLX, Fragen zu unserem Konzept, Freitext und Angaben zur Person.
- **Die Testleitung** sitzt am Laptop. Dort steuert sie den Ablauf, sieht live, was auf dem iPad passiert, zählt Hinweise mit und bewertet jede Aufgabe.
- **Der KI-Assistent und die Robotermeldungen sind simuliert (Wizard of Oz).** Tippt die Testperson auf „KI-Assistent“, sieht die Testleitung das sofort. Sie hört im Raum mit und schickt die Antwort vom Laptop aus. Die Antwort erscheint auf dem iPad und wird vorgelesen. Genauso kann die Testleitung Push-Meldungen eines Roboters mit Antwort-Buttons senden, etwa eine Starkregen-Warnung für UC 4.
- **Gemessen** werden pro Aufgabe Erfolg, Zeit, Taps (davon Taps ohne Wirkung), Navigationspfad, Rücksprünge, Hinweise, KI-Nutzung und die Schwierigkeit aus Sicht der Testperson (SEQ, 1–7). Die Auswertungsseite fasst alles nach Aufgabe und Persona zusammen und exportiert es als CSV.

### Selbst ausprobieren (ca. 10 Minuten, ein Laptop reicht)

1. Im Projektordner den Server starten (nur Python 3 nötig, sonst keine Installation):
   ```bash
   python3 server.py
   ```
2. Zwei Browserfenster nebeneinander öffnen:
   - **Testleitung:** http://localhost:8000/testleitung
   - **„iPad“:** http://localhost:8000/ipad (zeigt zuerst „Gleich geht’s los“)
3. In der Testleitung auf **Neue Sitzung** klicken, als Teilnehmercode z. B. `Test-Max` eintragen, als Gruppe **Pilot** wählen und eine Persona auswählen, etwa *P-001 Moderne Betriebsleiterin*. Die passenden Aufgaben sind schon angehakt. → **Sitzung starten**.
4. Im iPad-Fenster die Einwilligung bestätigen, **Los geht’s** und dann **Aufgabe starten**.
5. Ein paar Dinge ausprobieren:
   - In der App herumklicken und in der Testleitung zusehen, wie sich Ansicht, Zähler und Ereignisliste aktualisieren.
   - Im iPad-Fenster auf **KI-Assistent** tippen. In der Testleitung wird „Testperson spricht …“ rot. Rechts eine Vorlage mit **▶** senden.
   - Bei Aufgabe *UC 4 Wetterwarnung* die Vorlage „🔔 Starkregen“ senden und auf dem iPad eine der drei Optionen antippen.
   - Eine Aufgabe in der Testleitung bewerten (Erfolg, Mit Hilfe oder Gescheitert), auf dem iPad **Fertig** tippen und die SEQ-Frage beantworten.
6. Zum Schluss den Fragebogen durchklicken und unter http://localhost:8000/auswertung das Ergebnis ansehen.
7. Die eigene Probesitzung in der Auswertung bei **Ausschließen** anhaken, damit sie nicht in die echten Ergebnisse eingeht.

**Mit echtem iPad:** iPad und Laptop ins selbe WLAN bringen (im eduroam klappt das oft nicht, dann einen Hotspot nehmen). Auf dem iPad in Safari `http://<IP-des-Laptops>:8000/ipad` öffnen. Die IP-Adresse zeigt der Server beim Start an. Vorbereitung des iPads, Moderation und Datenschutz stehen in [TESTLEITFADEN.md](TESTLEITFADEN.md).

### Personas und Aufgaben

| Persona | Sieht in der App | Aufgaben |
| --- | --- | --- |
| P-001 Moderne Betriebsleiterin | alles | T-001, T-002, T-003, UC 1, UC 2, UC 3, UC 4 Wetter |
| P-002 Erfahrener Landwirt | alles außer Benutzerverwaltung | T-003, UC 1, UC 4 Wetter, UC 4 Befehl, UC 5 |
| P-003 Unerfahrene Hilfskraft | nur Übersicht und Roboter | T-001, T-003, UC 5 |
| P-004 Lohnunternehmer | alles außer Benutzerverwaltung | T-002, UC 1, UC 3 |

Aufgabentexte, Erfolgskriterien und eine Liste, was der Prototyp aus den Use Cases noch nicht abbildet, stehen in [TESTLEITFADEN.md](TESTLEITFADEN.md#3-personas-und-aufgaben). Aufgaben, Fragebogen und KI-Vorlagen ändert ihr in [studie/konfiguration.js](studie/konfiguration.js). Das geht ohne Programmierkenntnisse, die Datei ist kommentiert.

### Was neu ist

| Datei | Zweck |
| --- | --- |
| [server.py](server.py) | Kleiner Webserver: liefert die App aus, steuert den Testablauf, speichert die Daten in `studien-daten/` und exportiert CSV-Dateien |
| [studie/konfiguration.js](studie/konfiguration.js) | Personas, Aufgaben, Erfolgskriterien, Fragebogen, Vorlagen für den KI-Assistenten |
| [studie/teilnehmer.js](studie/teilnehmer.js), [studie/teilnehmer.css](studie/teilnehmer.css) | Testmodus auf dem iPad: Aufgabenkarten, Aufgabenleiste unten, Protokollierung, KI-Fenster, Fragebogen. Wird nur mit `app.html?studie=1` geladen |
| [studie/testleitung.html](studie/testleitung.html), [studie/leitung.js](studie/leitung.js) | Konsole für die Testleitung: Ablauf, Live-Beobachtung, Notizen, Bewertung, KI-Steuerung |
| [studie/auswertung.html](studie/auswertung.html) | Ergebnisse nach Aufgabe und Persona, SUS, NASA-TLX, Konzeptfragen, Freitexte, CSV-Export |
| [TESTLEITFADEN.md](TESTLEITFADEN.md) | Anleitung für die Testdurchführung |
| [.gitignore](.gitignore) | Hält die Testdaten (`studien-daten/`) aus Git heraus |

### Was sich an der App geändert hat

- **„Demo“- und „simuliert“-Hinweise entfernt.** Auf dem iPad sollen die Testpersonen ein echtes Produkt vor sich haben, zum Beispiel beim KI-Assistenten, bei der Planübernahme und auf der Kontoseite.
- **Kopfzeile auf iPad-Breite korrigiert.** Bei 1180–1194 px im Querformat hat das ROBOplan-Logo den Menüpunkt „Disposition“ verdeckt.
- **Fahrzeuge auf dem Hof lassen sich jetzt manuell bedienen.** Das wird für UC 5 (Gerätewechsel, Unterlenker heben) gebraucht. Vorher war die manuelle Steuerung nur auf dem Feld möglich.
- **`bootstrap.js` lädt den Testmodus bei `?studie=1` nach.** Ohne diesen Parameter verhält sich die App wie vorher, auch die Offline-Datei `ROBOplan-Export.html`. Die beiden Exportdateien sind neu erzeugt.

## Aufbau der App

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
