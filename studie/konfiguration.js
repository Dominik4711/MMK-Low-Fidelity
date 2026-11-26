// Konfiguration des ROBOplan-Nutzertests.
// Grundlage: „Use Cases: Auftragsplanung im Ackerbau“ (UC 1–5) und
// „MMK Requirements Ackerbaubetrieb“ (Personas P-001–P-004, Testkriterien T-001–T-003).
// Wird auf dem iPad (app.html?studie=1) und in der Testleitung geladen.
//
// Aufgabe:
//   id            eindeutiger Schlüssel (erscheint in Export und Auswertung)
//   titel         kurzer Name für Testleitung und Auswertung (mit Bezug zu UC/T)
//   bezug         Rückverfolgung zu Use Case, Anforderung und Bedarf
//   text          Szenario, das die Testperson auf dem iPad liest
//   start         Seite, auf der die Aufgabe beginnt
//   zuruecksetzen true: App vor der Aufgabe in den Ausgangszustand bringen
//   rollen        Personas, für die die Aufgabe standardmäßig ausgewählt ist
//   erfolg        Erfolgskriterium für die Testleitung
//   pruefen(ctx)  optional: automatische Erfolgsprüfung auf dem iPad. Ohne
//                 Prüffunktion bewertet ausschließlich die Testleitung.
//                 ctx.hat(name, fn?) prüft protokollierte Aktionen der Aufgabe,
//                 ctx.besucht(ansicht) besuchte Ansichten, ctx.metriken Zähler.
//   wizard        Hinweis für die Testleitung (KI-Assistent / Meldungen)
window.STUDIE_KONFIG = {
  titel: 'ROBOplan · Nutzertest',

  // Personas aus den Requirements. rechte = sichtbare Hauptbereiche der App.
  rollen: {
    p001: {label: 'P-001 Moderne Betriebsleiterin', person: 'Lena Hofmann', rechte: ['home', 'ackerschlagskarte', 'roboterverwaltung', 'auftragsverwaltung', 'benutzerverwaltung'], start: '#home'},
    p002: {label: 'P-002 Erfahrener Landwirt', person: 'Heinrich Brandt', rechte: ['home', 'ackerschlagskarte', 'roboterverwaltung', 'auftragsverwaltung'], start: '#home'},
    p003: {label: 'P-003 Unerfahrene Hilfskraft', person: 'Tim Krüger', rechte: ['home', 'roboterverwaltung'], start: '#home'},
    p004: {label: 'P-004 Lohnunternehmer', person: 'Karl Wiesner', rechte: ['home', 'ackerschlagskarte', 'roboterverwaltung', 'auftragsverwaltung'], start: '#home'}
  },

  // Vorschläge für die Teilnehmergruppe (tatsächlicher Hintergrund der Testperson).
  gruppen: ['Betriebsleitung', 'Landwirt/in', 'Mitarbeiter/in oder Hilfskraft', 'Lohnunternehmen', 'Auszubildende/r', 'Studierende', 'Pilot'],

  einwilligung: 'Ich bin einverstanden, dass meine Eingaben während des Tests unter einem Teilnehmercode ohne Namen aufgezeichnet und für die Auswertung des Projekts verwendet werden.',

  aufgaben: [
    // ---------------------------------------------------------- Testkriterien aus den Requirements
    {
      id: 'T-001',
      titel: 'T-001 Betriebszustände erkennen',
      bezug: 'R-001 · N-001 · P-001',
      text: 'Drei Roboter arbeiten gerade auf unterschiedlichen Feldern: AgBot · 1, FarmDroid · 2 und AgBot · 2. Sag laut, in welchem Zustand jeder dieser drei Roboter gerade ist. Bleib dabei auf der Startseite.',
      start: '#home', zuruecksetzen: true,
      rollen: ['p001', 'p003'],
      erfolg: 'Alle drei Zustände korrekt benannt, ohne in eine andere Ansicht zu wechseln: AgBot · 1 festgefahren (Fehler, Eingriff nötig) · FarmDroid · 2 hackt (läuft normal) · AgBot · 2 Warnung „Saatgut fast leer“. Ansichtswechsel stehen im Pfad.'
    },
    {
      id: 'T-002',
      titel: 'T-002 Auftragsfortschritt finden',
      bezug: 'R-002 · N-002 · P-001',
      text: 'Finde heraus, wie weit Roboter 2 (FarmDroid · 1) mit seinem aktuellen Auftrag ist. Sag es laut.',
      start: '#home', zuruecksetzen: true,
      rollen: ['p001', 'p004'],
      erfolg: 'Fortschritt des richtigen Roboters genannt: 32 % erledigt (Hacken auf „Hinterm Haus“, noch ca. 2 h 10 min).'
    },
    {
      id: 'T-003',
      titel: 'T-003 Störung zuordnen',
      bezug: 'R-003 · N-003 · P-001',
      text: 'Während der Feldarbeit meldet ein Roboter eine Störung. Finde heraus, welcher Roboter betroffen ist und was das Problem ist. Sag beides laut.',
      start: '#home', zuruecksetzen: true,
      rollen: ['p001', 'p002', 'p003'],
      erfolg: 'Betroffenen Roboter und Status korrekt benannt: AgBot · 1 auf „Hinterm Haus“, festgefahren.'
    },

    // ---------------------------------------------------------- Use Cases Auftragsplanung
    {
      id: 'UC1',
      titel: 'UC 1 Auftrag über die Schlagkartei anlegen',
      bezug: 'UC 1 · N-004 · N-005',
      text: 'Auf dem Feld „Mühlenkamp“ soll nach dem Grubbern Winterweizen gesät werden – innerhalb dieser Woche. Plane diese Maßnahme so, dass ein passendes Fahrzeug sie übernimmt.',
      start: '#home', zuruecksetzen: true,
      rollen: ['p001', 'p002', 'p004'],
      erfolg: 'Neuer Auftrag „Säen“ auf Mühlenkamp mit Priorität „Zeitnah“ (oder „Sofort“) und zugewiesenem Fahrzeug. Beobachten: Einstieg über die Ackerschlagkartei (Schlagkartei geöffnet?).',
      pruefen: () => dispatchTasks.some(t => t.id > 6 && t.field === 7 && t.operation === 'Säen' && ['week', 'immediate'].includes(t.priority) && t.robot != null)
    },
    {
      id: 'UC2',
      titel: 'UC 2 Reihenfolge vorschlagen lassen',
      bezug: 'UC 2 · N-005',
      text: 'Auf dem Feld „Sonnenstück“ wurden Kartoffeln geerntet. Jetzt soll der Boden gegrubbert und Winterweizen gesät werden. Lass dir von ROBOplan vorschlagen, in welcher Reihenfolge und wann du das am besten machst, und plane danach den ersten Arbeitsschritt ein.',
      start: '#home', zuruecksetzen: true,
      rollen: ['p001'],
      erfolg: 'Vorschlag eingeholt (KI-Assistent) und angenommen, geändert oder bewusst abgelehnt; neuer Auftrag „Grubbern“ auf Sonnenstück angelegt.',
      wizard: 'Vorlagen „UC 2“: Vorschlag mit Begründung, Konfliktwarnung bei falscher Reihenfolge, Hinweis auf unsichere Daten.',
      pruefen: ctx => ctx.hat('ki-antwort') && dispatchTasks.some(t => t.id > 6 && t.field === 8 && t.operation.startsWith('Grubbern'))
    },
    {
      id: 'UC3',
      titel: 'UC 3 Mehrere Schläge planen und Maschinen zuordnen',
      bezug: 'UC 3 · N-004 · N-018',
      text: 'Mehrere Felder müssen in den nächsten Tagen bearbeitet werden, zwei Aufträge sind noch keinem Fahrzeug zugeteilt. Lass dir eine Einsatzplanung vorschlagen, prüfe sie, passe sie bei Bedarf an und gib den Plan an die Roboter frei.',
      start: '#home', zuruecksetzen: true,
      rollen: ['p001', 'p004'],
      erfolg: 'Offene Aufträge (Mühlenkamp, Sonnenstück) zugeordnet und Einsatzplan übernommen – per Vorschlag oder manuell (Drag & Drop).',
      pruefen: () => planAccepted === true && [2, 4].every(id => dispatchTasks.find(t => t.id === id)?.robot != null)
    },
    {
      id: 'UC4a',
      titel: 'UC 4 Auf Wetterwarnung reagieren',
      bezug: 'UC 4 · N-008 · N-009',
      text: 'Deine Roboter arbeiten gerade auf den Feldern. Du bist auf dem Hof und schaust ab und zu auf das Tablet. Reagiere auf Meldungen deiner Roboter so, wie du es im Alltag tun würdest.',
      start: '#home', zuruecksetzen: true,
      rollen: ['p001', 'p002'],
      erfolg: 'Auf die Starkregen-Meldung von AgBot · 2 reagiert (pausieren, fortsetzen oder abbrechen – Abbruch bestätigt); Entscheidung wurde vom Roboter bestätigt.',
      wizard: 'Nach ca. 20 s Vorlage „UC 4 · Starkregen-Meldung“ senden. Auf die Antwort mit der passenden Bestätigung reagieren; bei „Abbrechen“ zuerst die Rückfrage senden. Keine Reaktion nach 60 s: „Vorsorglich pausiert“.',
      pruefen: ctx => ctx.hat('ki-aktion', a => /^roboter-(pause|weiter|abbruch):4$/.test(a.args[0])) || ['paused', 'stopped'].includes(robotProfileStates.get(4)?.action)
    },
    {
      id: 'UC4b',
      titel: 'UC 4 Spontanen Befehl geben',
      bezug: 'UC 4 · N-006 · N-010',
      text: 'Der FarmDroid · 2 hackt gerade auf der „Bachwiese“. Er soll ab sofort 8 cm tief arbeiten. Gib ihm diese Anweisung.',
      start: '#home', zuruecksetzen: true,
      rollen: ['p002'],
      erfolg: 'Befehl gegeben (Sprache oder Touch), Wiederholung des Roboters bestätigt, Erfolgsmeldung erhalten.',
      wizard: 'Vorlagen „UC 4 · Arbeitstiefe“: erst wiederholen und bestätigen lassen, dann Erfolg melden. Werte über 10 cm ablehnen.',
      pruefen: ctx => ctx.metriken.kiAnfragen > 0 && ctx.hat('ki-option')
    },
    {
      id: 'UC5',
      titel: 'UC 5 Einfache Befehle auf dem Hof',
      bezug: 'UC 5 · N-010 · N-013 · N-014',
      text: 'Am CLAAS ARION 640 auf dem Hof soll gleich die Sämaschine angebaut werden. Bereite den Traktor vor: Schalte ihn auf manuelle Steuerung und hebe die Unterlenker ganz an.',
      start: '#home', zuruecksetzen: true,
      rollen: ['p002', 'p003'],
      erfolg: 'ARION 640 im manuellen Modus, Hubwerk ganz angehoben (≥ 90 %). Beobachten: Weg zur Roboterübersicht ohne Umweg über die Schlagkartei, Sprache oder Touch.',
      wizard: 'Sprachbefehle über Vorlagen „UC 5“ (manuelle Steuerung, Unterlenker heben, zum Gerät fahren). Alternativfälle: Hindernis, Verbindungsabbruch.',
      pruefen: () => robotProfileStates.get(6)?.action === 'paused' && (robotProfileStates.get(6)?.implements?.height || 0) >= 90
    }
  ],

  // Frage nach jeder Aufgabe (Single Ease Question, 1–7).
  seq: {frage: 'Wie einfach oder schwierig war diese Aufgabe für dich?', links: 'Sehr schwierig', rechts: 'Sehr einfach'},

  // Evaluationsbogen nach dem Test. Typen: likert (1–5), tlx (0–100), text, auswahl.
  // IDs sus1–sus10 und tlx_* werden in der Auswertung zu SUS- bzw. Raw-TLX-Werten verrechnet.
  fragebogen: [
    {
      titel: 'Bedienbarkeit',
      hinweis: 'Wie sehr stimmst du den folgenden Aussagen über ROBOplan zu?',
      typ: 'likert', links: 'Stimme überhaupt nicht zu', rechts: 'Stimme voll zu',
      fragen: [
        {id: 'sus1', text: 'Ich denke, dass ich ROBOplan gerne häufig benutzen würde.'},
        {id: 'sus2', text: 'Ich fand ROBOplan unnötig komplex.'},
        {id: 'sus3', text: 'Ich fand ROBOplan einfach zu benutzen.'},
        {id: 'sus4', text: 'Ich glaube, ich würde die Hilfe einer technisch versierten Person brauchen, um ROBOplan benutzen zu können.'},
        {id: 'sus5', text: 'Ich fand, die verschiedenen Funktionen in ROBOplan waren gut integriert.'},
        {id: 'sus6', text: 'Ich denke, ROBOplan enthielt zu viele Ungereimtheiten.'},
        {id: 'sus7', text: 'Ich kann mir vorstellen, dass die meisten Menschen den Umgang mit ROBOplan sehr schnell lernen.'},
        {id: 'sus8', text: 'Ich fand ROBOplan sehr umständlich zu nutzen.'},
        {id: 'sus9', text: 'Ich fühlte mich bei der Benutzung von ROBOplan sehr sicher.'},
        {id: 'sus10', text: 'Ich musste eine Menge lernen, bevor ich mit ROBOplan arbeiten konnte.'}
      ]
    },
    {
      titel: 'Beanspruchung',
      hinweis: 'Wie hast du die Aufgaben insgesamt erlebt? Tippe auf der Skala an die passende Stelle.',
      typ: 'tlx',
      fragen: [
        {id: 'tlx_geistig', text: 'Geistige Anforderung', erklaerung: 'Wie viel Nachdenken und Konzentration war nötig?', links: 'Gering', rechts: 'Hoch'},
        {id: 'tlx_koerperlich', text: 'Körperliche Anforderung', erklaerung: 'Wie viel körperliche Aktivität war nötig?', links: 'Gering', rechts: 'Hoch'},
        {id: 'tlx_zeitlich', text: 'Zeitliche Anforderung', erklaerung: 'Wie viel Zeitdruck hast du empfunden?', links: 'Gering', rechts: 'Hoch'},
        {id: 'tlx_leistung', text: 'Leistung', erklaerung: 'Wie erfolgreich hast du die Aufgaben deiner Meinung nach erledigt?', links: 'Gut', rechts: 'Schlecht'},
        {id: 'tlx_anstrengung', text: 'Anstrengung', erklaerung: 'Wie sehr musstest du dich anstrengen, um dieses Ergebnis zu erreichen?', links: 'Gering', rechts: 'Hoch'},
        {id: 'tlx_frustration', text: 'Frustration', erklaerung: 'Wie unsicher, gestresst oder verärgert hast du dich gefühlt?', links: 'Gering', rechts: 'Hoch'}
      ]
    },
    {
      // Aussagen nach den Bedürfnissen (N-…) der Requirements.
      titel: 'Konzept',
      hinweis: 'Wie sehr stimmst du zu? Wenn du etwas nicht ausprobiert hast, wähle „k. A.“.',
      typ: 'likert', links: 'Stimme überhaupt nicht zu', rechts: 'Stimme voll zu', keineAngabe: true,
      fragen: [
        {id: 'k_status', text: 'Ich konnte den Zustand aller Roboter schnell erkennen.'},
        {id: 'k_fortschritt', text: 'Ich konnte erkennen, wie weit ein Roboter mit seinem Auftrag ist.'},
        {id: 'k_stoerung', text: 'Störungen konnte ich schnell erkennen und dem richtigen Roboter zuordnen.'},
        {id: 'k_rueckmeldung', text: 'Ich habe eindeutig erkannt, ob eine Aktion erfolgreich war.'},
        {id: 'k_feldplanung', text: 'Aufträge vom Feld aus (über die Ackerschlagkartei) zu planen, passt zu meiner Arbeitsweise.'},
        {id: 'k_vorschlag_begruendung', text: 'Die Vorschläge des Systems waren nachvollziehbar begründet.'},
        {id: 'k_vorschlag_vertrauen', text: 'Ich würde einen Planvorschlag des Systems ohne eigenes Nachprüfen übernehmen.'},
        {id: 'k_meldungen', text: 'Die Meldungen der Roboter während des Einsatzes waren hilfreich.'},
        {id: 'k_kontrolle', text: 'Ich hatte jederzeit das Gefühl, die Kontrolle über die Roboter zu behalten.'},
        {id: 'k_sprache', text: 'Ich würde Roboter gern per Sprache bedienen.'},
        {id: 'k_feldbedingungen', text: 'Ich könnte ROBOplan auch unter Feldbedingungen (Sonne, Arbeitshandschuhe) gut bedienen.'},
        {id: 'k_einarbeitung', text: 'Ich könnte ROBOplan nach kurzer Einarbeitung selbstständig nutzen.'},
        {id: 'k_alltag', text: 'Ich kann mir vorstellen, ROBOplan im Arbeitsalltag zu nutzen.'}
      ]
    },
    {
      titel: 'Deine Meinung',
      typ: 'text',
      fragen: [
        {id: 'f_positiv', text: 'Was hat dir besonders gut gefallen?'},
        {id: 'f_negativ', text: 'Was hat dich gestört oder verwirrt?'},
        {id: 'f_wunsch', text: 'Was hat dir gefehlt?'}
      ]
    },
    {
      titel: 'Zu deiner Person',
      typ: 'auswahl',
      fragen: [
        {id: 'p_taetigkeit', text: 'Was beschreibt deine Tätigkeit am besten?', optionen: ['Betriebsleitung', 'Landwirt/in', 'Mitarbeiter/in oder Hilfskraft', 'Lohnunternehmen', 'Ausbildung oder Studium', 'Sonstiges']},
        {id: 'p_alter', text: 'Alter', optionen: ['unter 25', '25–34', '35–44', '45–54', '55–64', '65 oder älter', 'keine Angabe']},
        {id: 'p_landwirtschaft', text: 'Berufserfahrung in der Landwirtschaft', optionen: ['keine', 'unter 2 Jahre', '2–10 Jahre', 'über 10 Jahre']},
        {id: 'p_tablet', text: 'Wie oft nutzt du ein Tablet?', optionen: ['täglich', 'wöchentlich', 'selten', 'nie']},
        {id: 'p_robotik', text: 'Erfahrung mit autonomen Landmaschinen oder Robotern', optionen: ['selbst genutzt', 'schon gesehen', 'keine']},
        {id: 'p_assistent', text: 'Nutzt du Sprachassistenten (z. B. Siri, Alexa)?', optionen: ['regelmäßig', 'gelegentlich', 'nie']}
      ]
    }
  ],

  // Vorlagen der Testleitung für KI-Assistent und Robotermeldungen (Wizard of Oz).
  //   aktion/modus  eine Aktion: 'vorschlag' = Button, 'direkt' = sofort ausführen
  //   optionen      mehrere Antwort-Buttons [{label, aktion?}]
  //   absender      erscheint als Absender (Standard: KI-Assistent)
  //   meldung       true: Push-Meldung mit Signalton, ohne vorherige Frage
  // Zahlenwerte entsprechen den Daten der App; die Hacktiefe 1–10 cm ist ein Testwert.
  kiVorlagen: [
    {gruppe: 'Allgemein', text: 'Einen Moment, ich schaue nach.'},
    {gruppe: 'Allgemein', text: 'Das habe ich leider nicht verstanden. Kannst du das bitte wiederholen?'},
    {gruppe: 'Allgemein', text: 'Dabei kann ich dir leider noch nicht helfen.'},
    {gruppe: 'Allgemein', text: 'Erledigt.'},

    {gruppe: 'T-001 bis T-003 · Status', text: 'AgBot · 1 steckt auf „Hinterm Haus“ fest und braucht einen Eingriff. Der FarmDroid · 2 hackt ohne Probleme auf der „Bachwiese“. Beim AgBot · 2 auf „An den Pappeln“ ist das Saatgut fast leer.'},
    {gruppe: 'T-001 bis T-003 · Status', text: 'Roboter 2, der FarmDroid · 1, hackt auf „Hinterm Haus“. Der Auftrag ist zu 32 Prozent erledigt, er braucht noch etwa 2 Stunden und 10 Minuten.', aktion: 'roboter:2', modus: 'vorschlag', aktionLabel: 'FarmDroid · 1 öffnen'},
    {gruppe: 'T-001 bis T-003 · Status', text: 'Der AgBot · 1 steckt auf dem Feld „Hinterm Haus“ fest und braucht einen Eingriff. Soll ich die Roboterseite öffnen?', aktion: 'roboter:1', modus: 'vorschlag', aktionLabel: 'AgBot · 1 öffnen'},

    {gruppe: 'UC 2 · Reihenfolge Sonnenstück', text: 'Mein Vorschlag für das Sonnenstück: Zuerst heute flach grubbern, solange der Boden trocken ist. Danach bis Freitag Winterweizen säen – ab Samstag ist Regen gemeldet. Die Aussaat liegt bereits im Aufgabenspeicher. Soll ich die Planung fürs Grubbern öffnen?', optionen: [{label: 'Grubbern planen', aktion: 'feld-planen:8'}, {label: 'Nein, danke'}]},
    {gruppe: 'UC 2 · Reihenfolge Sonnenstück', text: 'Achtung: Wenn zuerst gesät und danach gegrubbert wird, wird die Saat wieder zerstört. Ich empfehle, mit dem Grubbern zu beginnen. Möchtest du trotzdem so fortfahren?', optionen: [{label: 'Trotzdem fortfahren'}, {label: 'Vorschlag übernehmen', aktion: 'feld-planen:8'}]},
    {gruppe: 'UC 2 · Reihenfolge Sonnenstück', text: 'Hinweis: Für das Sonnenstück liegen keine aktuellen Bodenfeuchtedaten vor. Mein Vorschlag ist deshalb unsicher.'},

    {gruppe: 'UC 3 · Planung mehrerer Schläge', text: 'Ich habe einen Vorschlag für die Einsatzplanung erstellt. Prüfe ihn bitte und gib ihn frei.', aktion: 'ki-vorschlag', modus: 'direkt'},
    {gruppe: 'UC 3 · Planung mehrerer Schläge', text: 'Zwei Aufträge sind noch keinem Fahrzeug zugeteilt: Grubbern auf dem Mühlenkamp und Säen auf dem Sonnenstück.', aktion: 'seite:arbeitsspeicher', modus: 'vorschlag', aktionLabel: 'Offene Aufträge'},
    {gruppe: 'UC 3 · Planung mehrerer Schläge', text: 'Achtung: Der AgBot · 1 steckt fest und der JD 6R 215 ist in der Wartung. Beide kann ich nicht einplanen.'},

    {gruppe: 'UC 4 · Wetterwarnung AgBot · 2', absender: 'AgBot · 2', meldung: true, text: 'Achtung: Über „An den Pappeln“ zieht in etwa 30 Minuten Starkregen auf. Die Aussaat ist zu 81 Prozent erledigt. Soll ich pausieren, fortsetzen oder abbrechen?', optionen: [{label: 'Pausieren', aktion: 'roboter-pause:4'}, {label: 'Fortsetzen', aktion: 'roboter-weiter:4'}, {label: 'Abbrechen'}]},
    {gruppe: 'UC 4 · Wetterwarnung AgBot · 2', absender: 'AgBot · 2', text: 'Verstanden. Ich pausiere die Aussaat und warte im sicheren Zustand, bis der Regen vorbei ist.', aktion: 'roboter-pause:4', modus: 'direkt'},
    {gruppe: 'UC 4 · Wetterwarnung AgBot · 2', absender: 'AgBot · 2', text: 'Verstanden. Ich setze die Aussaat fort und melde mich, wenn es kritisch wird.', aktion: 'roboter-weiter:4', modus: 'direkt'},
    {gruppe: 'UC 4 · Wetterwarnung AgBot · 2', absender: 'AgBot · 2', text: 'Soll ich die Aussaat auf „An den Pappeln“ wirklich abbrechen? Die restliche Fläche bleibt als offene Aufgabe gespeichert.', optionen: [{label: 'Ja, abbrechen', aktion: 'roboter-abbruch:4'}, {label: 'Nein'}]},
    {gruppe: 'UC 4 · Wetterwarnung AgBot · 2', absender: 'AgBot · 2', text: 'Aussaat abgebrochen. Ich fahre zurück zum Hof. Die restlichen 19 Prozent bleiben als offene Aufgabe gespeichert.'},
    {gruppe: 'UC 4 · Wetterwarnung AgBot · 2', absender: 'AgBot · 2', meldung: true, text: 'Ich habe keine Rückmeldung erhalten und vorsorglich pausiert. Bitte melde dich, wenn es weitergehen soll.', aktion: 'roboter-pause:4', modus: 'direkt'},

    {gruppe: 'UC 4 · Arbeitstiefe FarmDroid · 2', absender: 'FarmDroid · 2', text: 'Arbeitstiefe beim FarmDroid · 2 auf 8 Zentimeter stellen – richtig?', optionen: [{label: 'Ja'}, {label: 'Nein'}]},
    {gruppe: 'UC 4 · Arbeitstiefe FarmDroid · 2', absender: 'FarmDroid · 2', text: 'Erledigt. Ich hacke auf der Bachwiese jetzt 8 Zentimeter tief.'},
    {gruppe: 'UC 4 · Arbeitstiefe FarmDroid · 2', absender: 'FarmDroid · 2', text: 'Das geht leider nicht. Für die Hackeinheit sind 1 bis 10 Zentimeter möglich.'},
    {gruppe: 'UC 4 · Arbeitstiefe FarmDroid · 2', absender: 'FarmDroid · 2', text: 'Die Änderung konnte nicht übernommen werden: Der Tiefensensor meldet einen Fehler. Ich arbeite mit der bisherigen Tiefe weiter.'},

    {gruppe: 'UC 5 · ARION 640 auf dem Hof', absender: 'ARION 640', text: 'Ich schalte auf manuelle Steuerung.', aktion: 'manuell:6', modus: 'direkt'},
    {gruppe: 'UC 5 · ARION 640 auf dem Hof', absender: 'ARION 640', text: 'Ich hebe die Unterlenker ganz an.', aktion: 'hubwerk-heben:6', modus: 'direkt'},
    {gruppe: 'UC 5 · ARION 640 auf dem Hof', absender: 'ARION 640', text: 'Ich senke die Unterlenker ab.', aktion: 'hubwerk-senken:6', modus: 'direkt'},
    {gruppe: 'UC 5 · ARION 640 auf dem Hof', absender: 'ARION 640', text: 'Ich fahre zur AMAZONE Cataya in der Maschinenhalle und halte davor an.'},
    {gruppe: 'UC 5 · ARION 640 auf dem Hof', absender: 'ARION 640', meldung: true, text: 'Der Weg zur Maschinenhalle ist blockiert. Ich habe angehalten. Bitte prüfe die Umgebung.'},
    {gruppe: 'UC 5 · ARION 640 auf dem Hof', absender: 'ARION 640', meldung: true, text: 'Verbindung zum ARION 640 unterbrochen. Der Traktor ist außer Reichweite und hat sicher angehalten.'},

    {gruppe: 'Wetter', text: 'Heute bleibt es trocken. Die Regenwahrscheinlichkeit liegt bei höchstens 30 Prozent, gegen 18 Uhr zieht es sich etwas zu. Regnerisch wird es erst am Samstag.', aktion: 'seite:wetter', modus: 'vorschlag', aktionLabel: 'Wetter öffnen'}
  ]
};

// Aktionen, die KI-Assistent und Robotermeldungen auf dem iPad auslösen können.
// ausfuehren() läuft nur auf dem iPad; label erscheint in der Testleitung.
(function () {
  const seiten = {home: 'Übersicht', wetter: 'Wetter', ackerschlagskarte: 'Ackerschläge', roboterverwaltung: 'Flottenmanagement', auftragsverwaltung: 'Disposition', arbeitsspeicher: 'Offene Aufgaben'};
  const roboter = {1: 'AgBot · 1', 2: 'FarmDroid · 1', 3: 'FarmDroid · 2', 4: 'AgBot · 2', 5: 'JD 6R 215', 6: 'ARION 640'};
  const felder = {1: 'Hinterm Haus', 2: 'Lerchenfeld', 3: 'Ortberg', 4: 'Bachwiese', 5: 'An den Pappeln', 6: 'Lange Wiese', 7: 'Mühlenkamp', 8: 'Sonnenstück'};
  // Betriebszustand setzen, auch wenn die Roboterseite nicht geöffnet ist.
  function zustand(id, action) {
    const s = robotProfileState(id);
    s.action = action; s.mode = action === 'paused' ? 'manual' : 'auto';
    if (robotProfileId === id) updateRobotProfileControls();
  }
  function aufRoboterseite(id, fn) {
    if (location.hash !== '#roboter-' + id) location.hash = 'roboter-' + id;
    setTimeout(fn, 150);
  }
  const aktionen = [];
  Object.entries(seiten).forEach(([hash, name]) => aktionen.push({id: 'seite:' + hash, label: 'Seite: ' + name, ausfuehren: () => { location.hash = hash; }}));
  Object.entries(roboter).forEach(([id, name]) => aktionen.push({id: 'roboter:' + id, label: 'Roboter öffnen: ' + name, ausfuehren: () => { location.hash = 'roboter-' + id; }}));
  Object.entries(roboter).forEach(([id, name]) => {
    id = Number(id);
    aktionen.push({id: 'roboter-pause:' + id, label: 'Pausieren: ' + name, ausfuehren: () => zustand(id, 'paused')});
    aktionen.push({id: 'roboter-weiter:' + id, label: 'Fortsetzen: ' + name, ausfuehren: () => zustand(id, 'running')});
    aktionen.push({id: 'roboter-abbruch:' + id, label: 'Auftrag abbrechen: ' + name, ausfuehren: () => zustand(id, 'stopped')});
    aktionen.push({id: 'manuell:' + id, label: 'Manuelle Steuerung: ' + name, ausfuehren: () => aufRoboterseite(id, () => zustand(id, 'paused'))});
    aktionen.push({id: 'hubwerk-heben:' + id, label: 'Unterlenker heben: ' + name, ausfuehren: () => aufRoboterseite(id, () => { if (robotProfileStates.get(id)?.action !== 'paused') zustand(id, 'paused'); moveRobotLift(90); })});
    aktionen.push({id: 'hubwerk-senken:' + id, label: 'Unterlenker senken: ' + name, ausfuehren: () => aufRoboterseite(id, () => { if (robotProfileStates.get(id)?.action !== 'paused') zustand(id, 'paused'); moveRobotLift(5); })});
  });
  Object.entries(felder).forEach(([id, name]) => aktionen.push({id: 'feld-kartei:' + id, label: 'Schlagkartei: ' + name, ausfuehren: () => { location.hash = 'ackerschlagskarte'; setTimeout(() => openFieldRecord(Number(id)), 50); }}));
  Object.entries(felder).forEach(([id, name]) => aktionen.push({id: 'feld-planen:' + id, label: 'Aufgabe planen: ' + name, ausfuehren: () => { location.hash = 'ackerschlagskarte'; setTimeout(() => openFieldPlanner(Number(id)), 50); }}));
  aktionen.push({id: 'ki-vorschlag', label: 'KI-Vorschlag in der Disposition erstellen', ausfuehren: () => { if (!planProposalSnapshot) toggleDispatchSuggestion(true); else location.hash = 'auftragsverwaltung'; }});
  window.STUDIE_KONFIG.kiAktionen = aktionen;
})();
