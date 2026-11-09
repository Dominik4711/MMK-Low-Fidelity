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
