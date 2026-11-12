# Festgehaltene Produktentscheidungen

- Aufgabe: Arbeit auf einem bestimmten Ackerschlag, zunächst ohne Roboterzuweisung.
- Disposition: Aufgaben Robotern zuweisen und Reihenfolge festlegen.
- Einsatzplan: Ergebnis der Disposition.
- Für die künftige Aufgabenmodellierung zunächst nur Grubbern, Säen und Hacken.
- Robotertypen: Trägerroboter mit wechselbaren Anbaugeräten sowie spezialisierte Roboter als feste Einheit (z. B. Hackroboter).
- Arbeitsgeräte sollen später mehrere Arbeiten unterstützen können: Grubber → flach/tief grubbern; Drillmaschine → säen; Hacke → hacken.
- Saatkultur wird beim Säen separat gewählt, mit der Schlagfrucht vorbelegt und in der Aufgabe gespeichert.
- Striegel und Spritze sind spätere Überlegungen, noch kein Teil des neuen Aufgabenumfangs. Bestehende Demo-Einsätze mit Striegel bleiben vorerst sichtbar.
- Noch keinen Geräte-/Arbeitenkatalog implementieren; zunächst Gestaltung der Feldliste.
- Feldliste: Name und Hektar als Klappzeile; aufgeklappt aktuelle Frucht, letzter Arbeitsschritt, vorgeschlagene Maßnahme und aktive Roboter mit Gerät und Arbeit.
- Historie und vorgeschlagene Maßnahmen sind erfundene UI-Beispieldaten, keine agronomischen Empfehlungen.

## Aussaat-Prototyp

- Saatdarstellung: Aussaat-Applikationskarte mit drei erfundenen Saatzonen; keine echten Boden- oder Ertragsdaten.
- Basis-Saatstärke in Körnern/ha, zusätzlich Körner/m² zur Einordnung; Zonen im Mockup bei 90 %, 100 % und 110 % der Basis.
- Fahrgassenabstand wählbar; schematische Fahrgassen parallel zu den Arbeitsbahnen.
- Vertikal: Hinterm Haus, Sonnenstück, Ortberg, Bachwiese. Horizontal: Lerchenfeld, Lange Wiese, Mühlenkamp, An den Pappeln.
- Keine automatische Erkennung eines Bearbeitungsbedarfs oder Benachrichtigungen implementieren.
- Fachbegriff: https://amazone.de/de-de/produkte-digitale-loesungen/digitale-loesung/amazone-4-0-/uebersicht-amazone-vier-null/intelligente-maschinentechnik-von-amazone/beispiele-aus-der-saetechnik/teilflaechenspezifische-saat-nach-applikationskarten-1001460

## Überarbeitete Drillansicht

- Schlagfrucht ohne Zusatz „geplant“.
- Applikationskarte per Checkbox; ohne Karte gleichmäßige Basis-Saatstärke.
- Fahrgassen können ausgeschaltet werden.
- Bearbeitungswinkel dreht die Spuren innerhalb der Schlagkontur.
- Start–Stopp-Legende in der Karte; erklärende Zusatztexte entfernt.
- Aktion: „In Aufgabenspeicher übertragen“.

## Schlagkartei und Arbeitsgeschwindigkeit

- Grubbern tief: 20 cm, 12 km/h; flach: 5 cm, 14 km/h. Säen: 10 km/h; Hacken und Striegeln: 5 km/h. Im Schlagplaner anpassbar und in der Aufgabe gespeichert.
- Info-Schaltfläche an jedem Schlag öffnet die Kartei: Karte und Demo-Wetter links, Schlagdaten, Beispielhistorie und demonstrierte KI-Vorschläge rechts.
- Karten-Layer Bodentyp, Applikationskarte und Ertragskarte; Jahresauswahl 2023–2026. Keine Anbindung an echte Historie, Wetterdaten oder KI.
- Alle Karten über Pfeil oben links seitenfüllend; Rückkehr per Pfeil oder Escape.
- Hackgeschwindigkeit als vorsichtiger Demo-Startwert gewählt; Herstellerbeispiel bis 5 km/h je nach Kultur und Größe: https://www.einboeck.at/wp-content/uploads/2025/11/einboeck-invera-de.pdf

## Aufgabenpriorität

- Vor dem Speichern im Schlagplaner und im Dispositionsdialog: Sofort, Zeitnah (eine Woche), Geplant (vier Wochen), Flexibel (ohne Zeitvorgabe; Standard).
- Auswahl als Dropdown-Menü, farbige Kennzeichnung in der Aufgabenanzeige; Priorität wird in der Aufgabe gespeichert und im Aufgabenspeicher sowie Einsatzplan angezeigt. Noch keine automatische Terminberechnung oder Prioritätssortierung.
- Schlagkartei bietet „Aufgabe planen“ als direkten Zugang zum bestehenden Schlagplaner.

## Disposition als Zeitplan

- Arbeitsspeicher enthält nur noch nicht zugewiesene Aufgaben. Neue Aufgaben aus dem Schlagplaner gehen ohne Roboterzuweisung in den Speicher.
- Sechs anklickbare Roboterzeilen mit maßstäblichen Zeitblöcken; Fenster 8/12/24 Stunden, drei Tage per Tagesauswahl und Zeitschieber.
- Farben: Grubbern sandfarben, Säen grün, Hacken/Striegeln violett, Rüsten gelb schraffiert, autonome Straßenfahrt blau.
- Geräteträger: Roboter 1, 5, 6; spezialisierte Demo-Roboter: 2 und 3 Hacke, 4 Striegel. Unpassende Gerätezuweisungen werden ausgeblendet.
- Rüsten (30 min) und Tiefe einstellen (10 min) beanspruchen Zeit; Gerätewechsel erfordern vorher Rückfahrt zum Hof.
- Karte zeigt das Straßennetz mit Zufahrten, Feldspuren und Vorgewendebahnen des ausgewählten Roboters. Arbeitsdauer nach Fläche, Arbeit und Geschwindigkeit geschätzt; Fahrdauer und Kilometer aus dem schematischen Netz abgeleitet.
- Manuell zuweisen, umsortieren, auf anderen Roboter übertragen und in den Speicher zurücklegen; Beispielvorschlag verteilt offene Aufgaben. Zeitplan übernehmen startet keine Maschinen.
- Alle Daten bleiben im Browser-Arbeitsspeicher der Demo; keine echte Routenplanung, KI oder Robotersteuerung.

## iPad-Ansicht der Disposition

- Zeitplan als einzige Hauptfläche, volle Breite. Eingeplante Roboter zuerst, danach freie Roboter.
- Offene Aufgaben über Toolbar-Button als Dialog; Roboter-/Zeitblock-Klick öffnet Karte und Einsatzdetails in einem eigenen Dialog.
- Größere Schrift und Touch-Flächen, keine parallel sichtbaren Speicher-/Karten-Spalten mit verschachtelten Scrollbereichen.

- Anpassung iPad: Karte bleibt dauerhaft links neben dem Zeitplan sichtbar (etwa ein Drittel der Breite). Roboter-/Auftragsauswahl zeigt passende Wege und hebt den gewählten Schlag hervor; Klick auf zugewiesene Kartenfläche wählt den Auftrag im Zeitplan. Detaildialog über eigene Schaltfläche.

## Arbeitsspeicher als Seite

- Eigene Ansicht #arbeitsspeicher, oben „Zurück zur Disposition“; Disposition bleibt im Hauptmenü aktiv.
- Tabelle: Fläche, Aufgabe, Dauer, Ablaufdatum, direkte Roboterzuweisung.
- Sortierung nach Flächenname, Arbeit oder frühestem Ablaufdatum; ohne Datum am Ende. Reihenfolge des Einsatzplans bleibt durch Sortieren unverändert.
- Ablaufdatum aus Priorität relativ zum Anlegedatum: sofort = gleicher Tag, zeitnah = 7 Tage, geplant = 28 Tage; flexibel ohne Datum.

## Gemeinsame Aufgabenübersicht

- Detailseite #aufgabe-ID aus Arbeitsspeicher (Name, Arbeit oder Zeile), Zeitblock und Robotereinsatzliste erreichbar.
- Zurück führt zur vorherigen Seite; zuvor geöffnete Roboterdetails werden wieder geöffnet.
- Feldkarte mit Spuren und Vorgewende; alternative Anfahrtskarte. Bei nicht disponierten Aufgaben ist die Hofanfahrt ausdrücklich ein Beispiel.
- Alle gespeicherten Parameter, Priorität, Anlage-/Ablaufdatum sowie Roboter-, Geräte- und Zeitangaben sichtbar; nicht festgelegte Angaben werden so benannt.

## Modelle und Tiefen im Flottenmanagement

- Inventar-IDs und Mengen unverändert: zwei Terrano 3 FX, TAIFUN 500, Smaragd 9/300; Saphir 9/300, Cataya 3000 Super, Cirrus 6003-2; TS 620 M3; CHOPSTAR-ONE und CHOPSTAR-TWIN.
- HORSCH Terrano FX: 5–30 cm, abhängig vom Scharsystem. https://cdn.horsch.com/celum/7687_original.pdf
- Einböck TAIFUN: bis 15 cm, abhängig von Ausstattung/Boden. https://www.einboeck.at/wp-content/uploads/2024/11/einboeck-bodenbearbeitung-de.pdf
- Cataya in TwinTeC-special-Konfiguration: Ablagetiefe 0–6 cm. https://downloadcenter.amazone.de/file/view/infoid/55051
- Cirrus 6003-2: 6 m. https://amazone.de/de-de/produkte-digitale-loesungen/cirrus-6003-2-die-6-m-anhaengesaekombination-fuer-hoechste-schlagkraft-83504
- TS 620 M3: 6,20 m; Eingriffstiefe hängt von Einstellung/Boden ab, kein fester Zahlenbereich angenommen. https://www.treffler.net/fileadmin/user_data/dokumente/prospekte/treffler-praezisions-zinkenstriegel-prospekt-2021.pdf
- CHOPSTAR: Kurbeleinstellung der Arbeitstiefe; Reihen-/Rahmenkonfiguration und damit Arbeitsbreite noch offen. https://www.einboeck.at/wp-content/uploads/2025/03/einboeck-kurzanleitung-chopstar-de.pdf
- Smaragd, Saphir und Cirrus: ohne eindeutig belegten numerischen Tiefenbereich nur Tiefeneinstellung beschrieben. Saphir: https://topicpilot.lemken.com/default/public/media?key=17512840_BA_Saphir-9_de_03_0_de_DE.pdf&lang=de_DE&name=17512840_BA_Saphir-9_de_03_0_de_DE.pdf

## Roboterspezifischer Leitstand

- Aufbau nach Referenz: Statusleiste mit Fahrzeugname/ID, Energie, Fortschritt, Restzeit und Arbeitsgerät; darunter Kameravorschau und Feld-/Hofkarte; unten Wetter, Maschinendaten und Bedienung.
- Bestehendes ROBOplan-Design, responsive Tabletansicht. Kamera als SVG-Illustration, Wetter und Messwerte als Demo markiert.
- FarmDroid zeigt Batterie-/Solarwerte, übrige Fahrzeuge beispielhafte Motor-/Tankdaten. Keine Echtzeit-Anbindung.
- Pause, Weiter, Stopp, Manuell/Automatik, Richtungstasten und Geschwindigkeit simulieren nur den UI-Zustand. Wartung/Rüstzeit lassen keinen aktiven Auftrag pausieren.

## Globale Statusampel

- Kopfzeile zeigt auf allen Seiten rote, gelbe und grüne Punkte übereinander mit jeweiliger Anzahl rechts daneben. Zahlen aus denselben Roboterdaten wie die Startseitenanzeige.
- Beschriftungen per Tooltip und für Screenreader. Bestehende Statusanzeige und Filter auf der Startseite unverändert.

## Sortierung der Feldliste

- Dropdown neben „Feldliste“: Name (A–Z, Standard), nächste Aufgabe (A–Z), Fruchtart (A–Z), Feldgröße (größte zuerst).
- Gleiche Werte werden nach Feldname sortiert. Geöffnete Felder und Kartenauswahl bleiben erhalten.

## Not-Aus an der Hülle

- Roter Not-Aus mit gelbem Sockel oben rechts über dem Joystick. Löst dieselbe Demo-Stoppaktion für den ausgewählten Roboter aus wie die Bedienung in der App.
- Hüllensteuerung unterstützt auch die lokale HTML-Exportdatei.

## Suche in Feldliste und Flotte

- Feldliste: Live-Suche nach Feldname, Fruchtart, nächster Aufgabe und Größe. Sortierung und aufgeklappte Einträge bleiben erhalten. Auswahl eines ausgeblendeten Feldes auf der Karte setzt die Suche zurück.
- Flottenmanagement: Suche über Roboter und Geräte, einschließlich Name, ID, Status und Gerätegruppe. Treffergruppen öffnen sich automatisch; beim Leeren kehrt der vorherige Klappzustand zurück.
- Beide Suchen ignorieren Groß-/Kleinschreibung, berücksichtigen mehrere Suchwörter und zeigen leere Ergebnisse an.

## Touchdisplay am Griff

- Das bisherige rote Nothalt-Bedienelement ist ein kleines flaches Touchdisplay an derselben Position.
- Zeigt „Nothalt“ ausschließlich bei manueller Bedienung auf der Roboterseite (Pause/Manuell). Sonst bleibt das Display dunkel und inaktiv. Bei Automatik, Seitenwechsel und nach dem Demo-Stopp erlischt die Anzeige.
- Hülle und App synchronisieren den Zustand auch in der Offline-Exportdatei.

## Funktionsfarben

- Grünes Grunddesign bleibt erhalten. Navigation und Funktionsakzente: Flottenmanagement/Roboter türkis, Disposition einschließlich offener Aufgaben blau, Ackerschläge einschließlich Kartei und Schlagplanung gelb.
- Auch Unterseiten erhalten ihre Bereichsfarbe; Übersichts-Roboterkarten tragen türkise Akzente. Gelbe Flächen verwenden dunkle Schrift für Lesbarkeit.
- Ampel, Prioritäten, Karten-Layer und Arbeitsarten behalten ihre inhaltlichen Farbcodes.

## Sprachmodus des KI-Assistenten

- Antippen wechselt von „KI-Assistent“ zu „Aufnehmen“ mit animierten Wellen und „Demo · hört zu …“. Erneut antippen oder Escape beendet den Modus.
- Bleibt auf allen Seiten verfügbar. Berücksichtigt reduzierte Animationen und kündigt den Zustand für Screenreader an. Rein visueller Demo-Modus ohne Mikrofonaufnahme oder KI-Auswertung.

## Flottenmanagement mit Karte und Maschineninfo

- Zweispaltig wie die Übersicht: links oben schematische Standortkarte, links unten Informationen der ausgewählten Maschine; rechts durchsuchbare Liste mit Robotern und allen bisherigen Anbaugeräten.
- Auswahl per Listeneintrag oder Roboterpunkt auf der Karte; türkis markierte Auswahl. Maschineninfos enthalten Status, Feld/Aufgabe, Energie und Arbeitsgerät beziehungsweise die bisherigen Geräteangaben. Roboterseite bleibt über „Roboter öffnen“ erreichbar.
- Nicht angebaute Geräte haben keinen hinterlegten Standort; dafür wird kein Standort erfunden. Bei angebauten Geräten zeigt die Karte den Trägerroboter.
- Suche, Gruppierung, Kartenvergrößerung und Offline-Export bleiben verfügbar; kleine Bildschirme zeigen die Bereiche untereinander.

## Platzsparende Suche auf dem iPad

- Lupe neben Maschinen, Feldliste und Betriebsauswahl; Antippen öffnet die Suche innerhalb derselben Überschriftenzeile und fokussiert das Feld. Schließen per Kreuz oder Escape setzt den Filter zurück.
- Feldsortierung wird während der Suche vorübergehend ausgeblendet und ist nach dem Schließen wieder verfügbar.
- Permanente Suchzeilen entfallen; Flottenliste und Maschineninfos verwenden größere, besser lesbare Schrift und Touchflächen.

## Flottenmanagement als aufklappbare Liste

- Ersetzt die geteilte Karten-/Infoansicht durch eine breite Maschinenliste mit einzeln aufklappbaren Einträgen; alle sechs Roboter und zehn Geräte bleiben erhalten.
- Gruppen Roboter, Grubber, Drillmaschinen und Hacke/Striegel sind als Überschriften sichtbar. Geschlossene Einträge zeigen Name, ID/Typ, Standort/Träger und bei Robotern den Status.
- Aufgeklappt stehen alle Maschineninformationen direkt im Eintrag sowie der Zugang zur Roboterseite. Mehrere Einträge lassen sich gleichzeitig öffnen.
- Suche per Lupe bleibt in der Kopfzeile, filtert auch Detailinformationen und erhält die Klappzustände.

## Aufklappbare Gerätegruppen und Roboterkarten

- Grubber, Drillmaschinen und Hacke/Striegel sind wieder aufklappbare Gruppen; darunter bleiben die einzelnen Geräte aufklappbar. Die Suche öffnet Treffergruppen und stellt beim Leeren deren vorherigen Zustand wieder her.
- Jeder aufgeklappte Robotereintrag zeigt links seine Standortkarte und rechts die Informationen. Karte auf das aktuelle Feld gezoomt; Roboter ohne Feldauftrag werden auf dem Hof gezeigt. Auf kleinen Telefonbildschirmen stehen Karte und Infos untereinander.
- Karten werden beim ersten Aufklappen vorbereitet, unterstützen Zoom und seitenfüllende Vergrößerung. Kartentexte fließen nicht in die Maschinensuche ein.

## Benutzermenü und Kontoeinstellungen

- Runder Benutzerbutton oben links öffnet Profil, Einstellungen und Logout. Alle drei führen zur gemeinsamen Kontoseite mit linker Navigation und rechtem Inhalt.
- Profil: Anzeigename, Betrieb und E-Mail lokal speichern; Initialen aktualisieren sich im Benutzerbutton. Einstellungen: Standard-Startseite und reduzierte Animationen. Kein Serverkonto; Speichern bleibt browserlokal.
- Logout öffnet zunächst die Kontoseite mit Abmeldeaktion. Demo-Abmeldung sperrt die Ansicht und lässt sich über „Demo wieder öffnen“ aufheben. Profileinstellungen bleiben erhalten.
- Dropdown bedienbar per Touch und Tastatur, schließt bei Escape oder Klick außerhalb. Neue Unterseite auch im Offline-Export enthalten.

- Kontomenü ergänzt um „Benutzerverwaltung“ mit eigener rechter Inhaltsansicht und Übersicht des lokalen Demo-Profils. Anzeigename und E-Mail übernehmen Änderungen aus dem Profil.

## Admin-Konto und Rollenübersicht

- Aktuelles Konto: Hans Admin. Benutzerverwaltung zeigt zusätzlich Otto Hilfsarbeiter, Frank Bürokraft und Anna Vollbenutzer.
- Admin: alle Arbeitsbereiche und Rollen zuweisen; Hilfsarbeiter: nur Übersicht und Roboter; Bürokraft: nur Aufgaben anlegen; Vollbenutzer: alle Arbeitsbereiche ohne Benutzerverwaltung.
- Oben „Neues Benutzerprofil anlegen“, darunter Profile mit Rollenwahl und Kurzbeschreibung des Zugriffs. Aktuelles Admin-Konto bleibt Admin. Neue Profile und Rollenzuweisungen werden lokal gespeichert.
- Bewusst grobe Demo-Darstellung: kein Kontowechsel und keine echte Anmeldung oder serverseitige Rechteprüfung. Bestehende Ansicht bleibt das Admin-Konto.

## Wischen im Dispositionszeitplan

- Der dreitägige Planungszeitraum ist als durchgehende Zeittabelle horizontal mit nativem Touch-Nachlauf scrollbar. Zeitachse und Auftragsbalken bewegen sich gemeinsam; die Roboterspalte bleibt links stehen.
- Zeitregler, Datumsanzeige und Tagesauswahl folgen dem sichtbaren Ausschnitt. Tagesbuttons und Pfeile scrollen weich, bei reduzierten Animationen direkt. Ansichten 8/12/24 Stunden behalten ihre Bedeutung.
- Zeitplan kann fokussiert auch per Pfeiltasten, Bild auf/ab und Anfang/Ende verschoben werden. Antippen einer Aufgabe bleibt erhalten.

## Aufgaben durch Gespannauswahl zuweisen

- Im Aufgabenspeicher zuerst Aufgabe anklicken: Informationen und Gespannauswahl in der Detailansicht. Direkte Roboter-Dropdowns in der Speicherliste entfallen.
- Wahl zwischen passenden aktiven Gespannen und Zugfahrzeug plus passendem Anbaugerät. Integrierte Hackroboter bleiben feste Einheiten. Fehlerbehaftete oder auf dem Hof stehende Fahrzeuge werden nicht als aktive Gespanne angeboten.
- Geräte an anderen Zugfahrzeugen oder dafür eingeplante Geräte sind nicht auswählbar. Reine Aufgaben-/Gerätekompatibilität, keine zusätzliche Leistungsberechnung.
- Bestätigen hängt die Aufgabe ans Ende der Fahrzeug-Auftragsliste. Konkrete Geräte-ID wird in der Aufgabe gespeichert und bei Rüstzeit sowie Aufgaben- und Einsatzinfos berücksichtigt. Bestehende Ist-Anbaugeräte werden durch Planung nicht verändert.
- Umplanen aus den Einsatzdetails führt ebenfalls zur Gespannauswahl. Rückgabe in den Aufgabenspeicher bleibt möglich.

## Feste Hülle beim Wischen

- Dokumente von Hülle und App gegen Viewport-Overscroll abgesichert; Körper fest im Browserfenster. Einfinger-Touchbewegungen auf der äußeren Hülle lösen keine Seitenscrollbewegung aus. Ereignisse innerhalb der separaten iframe-App bleiben davon unberührt.
- Zeitplan hat eine begrenzte Scrollfläche mit eigener Größenbegrenzung; die mehrtägige Innenbreite vergrößert nicht das Layout. Horizontales und vertikales Overscroll der Tabelle wird nicht weitergegeben.

- Fahrzeugzuweisung: linke Spalte mit kleinerer Karte, darunter Aufgabe/Fläche und Arbeitsdaten. Rechte Spalte für Gespannauswahl und Einsatz-/Anfahrtsinformationen. Beide Spalten können unabhängig scrollen.

- Aufgabenüberschrift samt Flächendaten, Aufgabennummer und Status sitzt kompakt in derselben Kopfzeile wie „Zurück“ und „Gespann wählen“, um mehr Höhe für Karte und Zuweisung zu gewinnen.

## Tagesvorschlag, Übernahme und direktes Bearbeiten

- KI-Vorschlag auf Übersicht und Disposition. Lokaler heuristischer Demo-Planer berücksichtigt Priorität/Ablaufdatum, Gerätewechsel, Fahrwege und Fahrzeugverfügbarkeit; keine echte KI-Anbindung oder mathematische Optimalitätsgarantie.
- Vorschlag setzt den Button auf „Vorschlag zurücksetzen“. Snapshot enthält ursprüngliche Aufgaben, Zuweisungen, Reihenfolge und Annahmestatus. Nachträglich angelegte Aufgaben bleiben beim Zurücksetzen offen erhalten.
- Übernehmen speichert Aufgaben und abgeleitete Fahrzeugpläne browserlokal; Übertragung wird ausdrücklich simuliert, da kein Roboterbackend angebunden ist. Gespeicherter Plan wird beim erneuten Öffnen geladen. Änderungen bleiben Entwurf bis zur erneuten Übernahme.
- Arbeitsbalken sind per Drag-and-drop zwischen Fahrzeugen und innerhalb der Reihenfolge verschiebbar. Auf Touch-Geräten am Ziehgriff, damit horizontales Wischen erhalten bleibt. Tastaturalternative: Alt+Links/Rechts für Reihenfolge, Alt+Oben/Unten für Fahrzeug.
- Geeignetes Gerät wird berücksichtigt, gebundene Geräte nicht doppelt vergeben. Rüstzeit und Straßenfahrt werden nach jeder Änderung abgeleitet; bei aufeinanderfolgenden Arbeiten auf derselben Fläche entfällt die Straßenfahrt.

## Prototyp-Bedienung auf dem iPad

- Oberfläche und sichtbarer Ablauf stehen im Vordergrund; keine zusätzliche Backend-Anbindung. Karte in der Disposition per Schaltfläche aus-/einblendbar, Zeitleiste nutzt dann die volle Breite.
- Aufgabe etwa 0,4 Sekunden halten, um sie aufzunehmen. Direktes Wischen bleibt Scrollen, kurzer Tipp öffnet weiterhin die Informationen. Ziehgriff und Maus-Drag bleiben als Alternativen.
- Beim Aufnehmen erscheinen große Ablageflächen für „Aufgabenspeicher“ und „Löschen“. Speicher entfernt nur die Zuweisung; Löschen entfernt den lokalen Demo-Auftrag. Letzte Aktion direkt per „Rückgängig“ wiederherstellbar.

- Zusätzliche Vorschlags-Infozeile entfernt, um die sichtbare Zeitleistenhöhe zu erhalten. Der KI-Button wechselt weiterhin auf „Vorschlag zurücksetzen“.
