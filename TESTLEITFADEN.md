# Leitfaden Nutzertest ROBOplan

Mit diesem Aufbau prüfen wir, ob die verschiedenen Nutzerrollen ihre Use Cases mit ROBOplan erledigen können und wie gut ihnen das gelingt. Die Testperson arbeitet auf dem iPad. Die Testleitung steuert den Ablauf von einem Laptop aus und übernimmt dort auch die Antworten des KI-Assistenten (Wizard of Oz).

## 1. Aufbau

| Gerät | Adresse | Wer |
| --- | --- | --- |
| Laptop (Server) | `python3 server.py` im Projektordner starten | Testleitung |
| iPad | `http://<IP-des-Laptops>:8000/ipad` | Testperson |
| Laptop | `http://localhost:8000/testleitung` | Testleitung (Ablauf und KI-Assistent) |
| Laptop / zweiter Rechner | `http://<IP>:8000/auswertung` | Auswertung |

Die IP-Adresse wird beim Start des Servers angezeigt. iPad und Laptop müssen im selben WLAN sein. Im Hochschul-WLAN (eduroam) sind Geräte oft voneinander abgeschirmt. Nutzt dann einen eigenen Router oder einen Hotspot. Benötigt wird nur Python 3, es gibt keine weiteren Abhängigkeiten.

Testleitungs-Konsole und KI-Steuerung lassen sich auch auf zwei Rechnern öffnen, zum Beispiel einer für die Moderation und einer für die Person, die den KI-Assistenten spielt. Beide sehen denselben Stand.

### iPad vorbereiten (einmalig)

1. Die iPad-Adresse in Safari öffnen, dann *Teilen → Zum Home-Bildschirm*. Die App startet so ohne Adressleiste im Vollbild.
2. *Einstellungen → Anzeige & Helligkeit → Automatische Sperre: Nie*.
3. *Einstellungen → Bedienungshilfen → Geführter Zugriff* aktivieren. Mit dreimaligem Drücken der Seitentaste bleibt die Testperson in der App.
4. Ton laut stellen, damit der KI-Assistent vorlesen kann. Den Stummschalter beachten.
5. Für Videoaufnahmen: das iPad per Kabel an einen Mac anschließen und in QuickTime *Neue Filmaufnahme* mit dem iPad als Quelle wählen. Alternativ die Bildschirmaufnahme im Kontrollzentrum nutzen.

## 2. Ablauf einer Sitzung

1. **Neue Sitzung** in der Testleitung: Teilnehmercode (wird automatisch vorgeschlagen), Gruppe (tatsächlicher Hintergrund der Testperson), Persona (P-001 bis P-004) und Aufgaben festlegen. Die Aufgaben sind passend zur Persona vorausgewählt. Mit „Reihenfolge mischen“ verteilt ihr Lerneffekte über die Aufgaben.
2. Das iPad setzt sich automatisch zurück und zeigt die **Begrüßung mit Einwilligung**. Die Testperson ist als Persona der Rolle angemeldet (z. B. Otto Hilfsarbeiter). Sie sieht nur die Bereiche, für die ihre Rolle Rechte hat.
3. Pro Aufgabe:
   - Die Testperson liest den Aufgabentext und tippt auf **Aufgabe starten**. Ab da läuft die Zeit.
   - Unten auf dem iPad bleibt eine Leiste mit **Aufgabe zeigen**, **Fertig** und **Aufgeben** sichtbar.
   - Die Testleitung sieht live: Zeit, Taps, Taps ohne Wirkung, Ansichten, Rücksprünge, KI-Anfragen und ob das automatische Erfolgskriterium erreicht ist.
   - Die Testleitung zählt gegebene **Hinweise** mit, schreibt **Notizen** (die Schnell-Chips helfen) und **bewertet**: Erfolg, Mit Hilfe oder Gescheitert.
   - Danach beantwortet die Testperson die **SEQ-Frage** (1 = sehr schwierig, 7 = sehr einfach).
   - Vor jeder Aufgabe wird die App in den Ausgangszustand gesetzt. So hat jede Testperson dieselben Startbedingungen.
4. Nach der letzten Aufgabe folgt der **Evaluationsbogen** auf dem iPad: SUS (10 Fragen), NASA-TLX in der Rohfassung (6 Skalen), Fragen zum Konzept, Freitexte und Angaben zur Person.
5. **Sitzung beenden**. Alle Daten sind gespeichert.

Die Testleitung kann jederzeit eingreifen: eine Aufgabe beenden, zu einer Aufgabe springen bzw. sie wiederholen, die App auf dem iPad neu laden oder zurücksetzen. Lädt das iPad versehentlich neu, macht es an derselben Stelle weiter.

### Moderation

- Lautes Denken zu Beginn kurz vormachen. Während der Aufgabe nur neutral nachfragen („Was erwartest du hier?“).
- Erst helfen, wenn die Testperson länger feststeckt. Jeden Hinweis mit **+ Hinweis** zählen.
- Die Bewertung „Erfolg“ gilt nur ohne Hilfe. Für Aufgaben mit mündlicher Antwort (Roboterstatus, Feldhistorie) prüft die Testleitung die Antwort selbst.

## 3. Personas und Aufgaben

Grundlage sind die Unterlagen „Use Cases: Auftragsplanung im Ackerbau“ (UC 1–5) und „MMK Requirements Ackerbaubetrieb“ (Personas, T-001 bis T-003). Beim Anlegen einer Sitzung wählt ihr die Persona aus. Die Testperson ist dann mit deren Rechten angemeldet, und die passenden Aufgaben sind vorausgewählt.

| Persona | Rechte in der App | Aufgaben (vorausgewählt) |
| --- | --- | --- |
| P-001 Moderne Betriebsleiterin (Lena Hofmann) | alle Bereiche inklusive Benutzerverwaltung | T-001, T-002, T-003, UC 1, UC 2, UC 3, UC 4 Wetter |
| P-002 Erfahrener Landwirt (Heinrich Brandt) | alle Bereiche | T-003, UC 1, UC 4 Wetter, UC 4 Befehl, UC 5 |
| P-003 Unerfahrene Hilfskraft (Tim Krüger) | Übersicht und Roboter | T-001, T-003, UC 5 |
| P-004 Lohnunternehmer (Karl Wiesner) | alle Bereiche | T-002, UC 1, UC 3 |

| Aufgabe | Erfolgskriterium | Prüfung |
| --- | --- | --- |
| T-001 Betriebszustände erkennen | Zustände von AgBot · 1 (festgefahren), FarmDroid · 2 (hackt) und AgBot · 2 (Saatgut fast leer) nennen, ohne die Ansicht zu wechseln | Testleitung; Ansichtswechsel stehen im Pfad |
| T-002 Auftragsfortschritt finden | Roboter 2 = FarmDroid · 1: 32 % erledigt | Testleitung |
| T-003 Störung zuordnen | AgBot · 1, festgefahren | Testleitung |
| UC 1 Auftrag über die Schlagkartei | Säen auf dem Mühlenkamp, Priorität „Zeitnah“, Fahrzeug zugewiesen | automatisch; dazu beobachten, ob der Einstieg über die Schlagkartei erfolgt |
| UC 2 Reihenfolge vorschlagen lassen | Vorschlag eingeholt, Grubbern auf dem Sonnenstück angelegt | automatisch und Wizard |
| UC 3 Mehrere Schläge planen | Offene Aufträge zugeordnet, Plan übernommen | automatisch |
| UC 4 Wetterwarnung | Auf die Meldung von AgBot · 2 reagiert (Pausieren, Fortsetzen oder Abbrechen) | automatisch und Wizard |
| UC 4 Spontaner Befehl | Arbeitstiefe 8 cm angewiesen, Wiederholung bestätigt | automatisch und Wizard |
| UC 5 Befehle auf dem Hof | ARION 640 im manuellen Modus, Unterlenker ganz angehoben | automatisch (per Touch oder Sprache) |

Die Konsole zeigt zu jeder Aufgabe den Bezug zu Use Case, Anforderung und Bedarf, das Erfolgskriterium und einen Hinweis für den Wizard. Die Fragen zum Konzept im Evaluationsbogen folgen den Bedürfnissen N-001 bis N-015.

**Was der Prototyp aus den Use Cases nicht abbildet** und was die Testleitung deshalb per Wizard oder gar nicht abdeckt:

- UC 1: Warnung bei nicht sinnvoller Maßnahme und Alternativen, wenn keine Maschine frei ist. Beides nur als Wizard-Antwort möglich.
- UC 2: Es gibt kein Planungsmenü für mehrere Maßnahmen. Den Reihenfolgevorschlag liefert der KI-Assistent.
- UC 4: Push-Meldungen und Rückfragen kommen vom Wizard. Einen echten Anruf gibt es nicht.
- UC 5: Ein Ziel auf der Karte markieren oder ein Anbaugerät anfahren geht nur per Sprache (Wizard). Die Unterlenker bedient man in der vergrößerten Kachel „Bedienung“.
- P-004: Die Kundenauswahl ändert nur den angezeigten Namen. Kundenspezifische Rechte werden nicht getestet.

## 4. KI-Assistent und Robotermeldungen (Wizard of Oz)

Vorlagen mit 🔔 sind **Push-Meldungen eines Roboters**. Sie erscheinen ohne vorherige Frage der Testperson, mit Absender, Signalton und Antwort-Buttons. Die Vorlagen sind nach Aufgaben gruppiert. Die Abläufe:

- **UC 4 Wetterwarnung:** Etwa 20 Sekunden nach dem Start die Meldung „Starkregen“ senden. Antwortet die Testperson per Button, ist die Aktion bereits ausgeführt. Dann nur noch die passende Bestätigung schicken. Bei „Abbrechen“ zuerst die Rückfrage senden, denn ein Abbruch muss bestätigt werden. Kommt nach etwa 60 Sekunden keine Reaktion, „Vorsorglich pausiert“ senden.
- **UC 4 Spontaner Befehl:** Der Roboter wiederholt den Wert und lässt ihn bestätigen. Danach folgt die Meldung „Erledigt“. Werte über 10 cm lehnt er mit Nennung des erlaubten Bereichs ab. Der Bereich ist ein Testwert.
- **UC 2:** Den Vorschlag mit Begründung senden. Will die Testperson in der falschen Reihenfolge planen, die Konfliktwarnung senden.

### Bedienung des Assistenten


Tippt die Testperson auf **KI-Assistent**, erscheint auf dem iPad „Ich höre zu …“. In der Konsole leuchtet gleichzeitig **„Testperson spricht …“** rot. Die Testleitung hört im Raum mit. Es wird kein Mikrofon aufgenommen.

1. Optional in **„Was hat die Testperson gesagt?“** eintragen. Das ist das Transkript für die Auswertung.
2. Bei Bedarf **„Einen Moment …“** senden. Das iPad zeigt dann eine Denkanimation.
3. Eine Antwort eintippen oder eine **Vorlage** anklicken. Ein Klick übernimmt die Vorlage zum Bearbeiten, **▶** sendet sie sofort.
4. Optional eine **Aktion** anhängen, zum Beispiel eine Seite oder einen Roboter öffnen, die Aufgabenplanung für ein Feld starten oder einen KI-Vorschlag erzeugen:
   - *als Button anbieten*: Die Testperson entscheidet selbst, ob sie die Aktion ausführt. Das ist aufschlussreich für die Frage, wie sehr sie dem Assistenten vertraut.
   - *direkt ausführen*: Der Assistent handelt selbst.
5. **Senden**. Die Antwort erscheint auf dem iPad und wird vorgelesen, wenn „Vorlesen“ aktiviert ist.

Antwortet ruhig und knapp, möglichst gleich bei allen Testpersonen. Fragen außerhalb des Konzepts beantwortet ihr mit „Dabei kann ich dir leider noch nicht helfen.“ Die Vorlagen orientieren sich an den Daten der App: Wetter, festgefahrener AgBot · 1, FarmDroid · 1 mit 32 % Fortschritt und noch 2 h 10 min Laufzeit.

## 5. Was gemessen wird

| Messgröße | Quelle |
| --- | --- |
| Aufgabenerfolg | Bewertung der Testleitung. Ohne Bewertung zählt das automatische Kriterium, oder „gescheitert“, wenn die Testperson aufgegeben hat |
| Bearbeitungszeit, Zeit bis zum Erfolgskriterium | Server-Zeitstempel |
| Taps (mit Wirkung, ohne Wirkung, auf deaktivierte Elemente, Karte), Wischen | iPad |
| Ansichtspfad, Ansichtswechsel, Rücksprünge, verweigerte Zugriffe | iPad |
| Hinweise, Notizen | Testleitung |
| SEQ je Aufgabe, SUS, Raw-TLX, Konzeptfragen, Freitext, Angaben zur Person | Testperson |
| KI-Nutzung: Anfragen, Antworten, Transkripte, angenommene Aktionen | iPad und Testleitung |

Die **Auswertung** zeigt Erfolgsquoten je Aufgabe und Rolle, Zeiten, Fehlbedienungen, SEQ, SUS und TLX sowie die Konzeptfragen und Freitexte. Filter nach Rolle und Gruppe sind möglich. Pilotsitzungen lassen sich ausschließen. Für SPSS, R oder Excel gibt es CSV-Exporte (Semikolon, Dezimalkomma).

## 6. Anpassen

Aufgaben, Erfolgskriterien, Rollen, Fragebogen und KI-Vorlagen stehen in [studie/konfiguration.js](studie/konfiguration.js). Jede Aufgabe hat einen Text, eine Startseite und eine kurze Prüffunktion für das automatische Erfolgskriterium. Nach einer Änderung das iPad und die Testleitung neu laden.

Startet nach jeder Änderung einen Pilottest mit einer Person aus dem Team und schließt die Pilotsitzung danach in der Auswertung aus.

## 7. Datenschutz

- Gespeichert werden nur Teilnehmercodes, keine Namen. Die Liste, welcher Code zu welcher Person gehört, führt ihr getrennt und auf Papier.
- Die Daten liegen lokal in `studien-daten/`. Der Ordner ist von Git ausgeschlossen und über den Server nicht abrufbar.
- Freitextfelder in der App, etwa ein Benutzername, werden nur mit ihrer Länge protokolliert, nicht mit ihrem Inhalt.
- Eine schriftliche Einwilligung nach den Vorgaben der Hochschule ersetzt die Bestätigung auf dem iPad nicht.
