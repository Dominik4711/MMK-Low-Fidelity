# Navigation des ROBOplan-Prototyps

Stand: 4. November 2026. Durchgezogene Pfeile zeigen Seiten und Unteransichten; gestrichelte Pfeile öffnen Dialoge. Die vier Hauptbereiche sind über die obere Navigation erreichbar. Rückwege sind zur Lesbarkeit überwiegend ausgelassen.

```mermaid
flowchart TD
    NAV["Hauptnavigation"]
    NAV --> HOME["Übersicht"]
    NAV --> FIELDS["Ackerschläge"]
    NAV --> FLEET["Flottenmanagement"]
    NAV --> DISPO["Disposition"]

    HOME -->|"Mehr Infos / Roboter auf der Karte"| ROBOT["Roboterübersicht · ausgewählter Roboter"]
    HOME -->|"Wetterkachel"| WEATHER["Wetterseite"]
    WEATHER --> HOURS["Stundenwetter"]
    WEATHER --> DAYS["7-Tage-Prognose"]
    WEATHER --> RADAR["Regenradar · Hof- und Feldkarte"]
    WEATHER -->|"Externer Link"| EXT["wetter.de"]

    FLEET -->|"Roboter öffnen"| ROBOT
    FLEET --> EQUIP["Anbaugeräte · aufklappbare Gerätedaten"]
    ROBOT -->|"Kopfzeile antippen"| PLAN["Robotereinsatzplan · Zeitstrahl und Karte"]
    PLAN -->|"Disposition öffnen"| DISPO
    ROBOT -->|"Kamerakachel vergrößern"| CAM["Kameras · vergrößert"]
    ROBOT -->|"Standortkachel vergrößern"| LOC["Standortkarte · vergrößert"]
    ROBOT -->|"Maschinendaten vergrößern"| MACHINE["Roboter- und Anbaugerätedaten"]
    ROBOT -->|"Bedienkachel vergrößern"| MANUAL["Kameras und manuelle Bedienung"]
    ROBOT -->|"Fehlerspeicher"| ERRORS["Fehlerübersicht · nur dieser Roboter"]

    FIELDS -.->|"Betrieb / Kunde"| CUSTOMER["Dialog: Betrieb auswählen · Suche und A–Z"]
    FIELDS -->|"Info am Feld"| RECORD["Schlagkartei · Historie und Felddaten"]
    FIELDS -->|"Aufgabe planen"| PLANNER["Aufgabenplanung · Feld und Parameter"]
    RECORD -->|"Aufgabe planen"| PLANNER
    PLANNER -.->|"Speichern: Aufgabe wird dort abgelegt"| STORAGE["Offene Aufgaben / Arbeitsspeicher"]

    DISPO -->|"Offene Aufgaben"| STORAGE
    DISPO -.->|"Einsatzdetails öffnen"| INSPECTOR["Dialog: Einsatzdetails des Roboters"]
    DISPO -->|"Auftrag im Zeitstrahl"| TASK["Aufgabenübersicht · Feldkarte und Straßenfahrt"]
    INSPECTOR -->|"Auftrag antippen"| TASK
    STORAGE -->|"Auftrag antippen"| TASK
    STORAGE -.->|"Aufgabe hinzufügen"| NEW["Dialog: Neue Aufgabe"]
    TASK -->|"Im Arbeitsspeicher zuweisen"| STORAGE

    classDef main fill:#27785b,color:#fff,stroke:#1d5b45;
    classDef dialog fill:#fff3d6,color:#66501d,stroke:#c79c42,stroke-dasharray:5 4;
    class HOME,FIELDS,FLEET,DISPO main;
    class CUSTOMER,INSPECTOR,NEW dialog;
```

## Navigation innerhalb einer Seite

- **Übersicht:** Ein Robotereintrag fokussiert die Karte und aktualisiert den Wetterbezug. Rot/Orange/Grün filtern die Liste; sie öffnen keine Unterseite.
- **Roboterübersicht:** Die vier Kacheln sind Unteransichten derselben Roboterseite. „Zurück zur Roboterübersicht“ schließt die Vergrößerung. Manuelle Bedienung ist nur im Pausenmodus freigegeben.
- **Robotereinsatzplan:** Ein Zeitstrahleintrag markiert das zugehörige Feld auf der Karte; er öffnet keine weitere Seite.
- **Ackerschläge:** Die Betriebsauswahl ändert nur den angezeigten Namen. Die Aufgabenplanung legt beim Speichern eine Aufgabe im Arbeitsspeicher ab und bleibt geöffnet; der gestrichelte Pfeil dorthin bezeichnet daher einen Datenfluss.
- **Aufgabenübersicht:** „Zurück“ führt zur aufrufenden Ansicht; kam der Aufruf aus den Einsatzdetails, öffnet sich dieser Dialog wieder.
- **Fehlerübersicht:** Der Rückweg führt zum zugehörigen Roboter.

## Seitenadressen

| Seite | Adresse innerhalb von `app.html` |
| --- | --- |
| Übersicht | `#home` |
| Ackerschläge | `#ackerschlagskarte` |
| Flottenmanagement | `#roboterverwaltung` |
| Disposition | `#auftragsverwaltung` |
| Roboterübersicht | `#roboter-ID` |
| Robotereinsatzplan | `#roboter-plan-ID` |
| Wetter | `#wetter` |
| Fehlerübersicht | `#fehler` |
| Offene Aufgaben | `#arbeitsspeicher` |
| Aufgabenübersicht | `#aufgabe-ID` |

`ID` steht für die jeweilige Roboter- oder Aufgaben-ID. Schlagkartei, Aufgabenplanung, vergrößerte Kacheln und Dialoge haben keine eigene Seitenadresse.
