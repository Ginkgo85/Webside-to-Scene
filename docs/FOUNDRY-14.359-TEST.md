# Kompatibilitätsprüfung: Foundry 14.359

Status: **Noch nicht durchgeführt.** Die Vorbereitung und Browser-Simulationen beweisen keine Live-Kompatibilität. Die reguläre Mindestversion bleibt **14.369**, Modulversion **1.1.0**. Es wird kein Release gestartet.

Ziel ist die erste stabile Foundry-14-Version [14.359](https://foundryvtt.com/releases/14.359). Ein Erfolg auf 14.359 und 14.369 ist kein Einzeltest aller Zwischenversionen; relevante Core-Änderungen dazwischen müssen zusätzlich bewertet und gegebenenfalls getestet werden. Frühere Prototype-/Development-/Testing-Builds sind nicht Teil des Ziels.

## Was benötigt wird

- Eine lizenzierte Foundry-Installation **14.359**, separat zur normalen Installation, mit eigenem User-Data-Ordner. Falls der Download verfügbar ist: über das eigene Foundry-Konto beziehen. Lizenzschlüssel und Kontopasswort bleiben beim Nutzer.
- Eine dort neu erstellte leere Testwelt, mit einem zu 14.359 passenden Spielsystem, zunächst nur Website to Scene aktiviert. Keine bestehende, mit einer neueren Version gespeicherte Welt zurückstufen.
- Ein GM- und ein Spieler-Testkonto. Für getrennte Sitzungen zwei Browser/Browserprofile nutzen. Zum Testen des tatsächlichen Mehrspielerzugriffs möglichst auch einen zweiten Rechner verwenden.
- Die erreichbare URL der Testinstanz; für die Vorbereitung vor Ort zusätzlich der Installations- und Testdatenordner. Keine öffentliche Erreichbarkeit oder Portfreigabe erforderlich.
- Chrome/Chromium und Firefox für den echten Browservergleich; bei Nutzung der Foundry-App auch deren Sprache und Menübedienung prüfen.

## Testkopie vorbereiten und installieren

Im Repository ausführen:

```sh
node tools/prepare-foundry-test.mjs
```

Der Befehl erzeugt einen neuen Ordner `artifacts/foundry-14.359-<zufall>/` mit:

- `Data/modules/website-to-scene/`: aktuelle Moduldateien. Ausschließlich in dieser Kopie ist `compatibility.minimum` auf `14.359` gesetzt; `manifest` und `download` fehlen, damit keine direkten Release-Update-Links verwendet werden. ID, Version, bestehende Verified-Angabe und sämtliche Laufzeitdateien bleiben erhalten. Die bisherige Verified-Angabe ist kein Nachweis für diesen Test.
- `Data/assets/website-to-scene-test/index.html`: künstliche interaktive Webseite ohne externe Dienste.
- `provenance.json`: Ausgangscommit, SHA256 jedes Modulinputs und jeder kopierten Datei, veränderte Manifestfelder und Live-Status `not-run`. Die Hashes bestimmen den Teststand auch bei noch nicht committeten Änderungen.
- `TESTPLAN.md`: diese Anleitung als beschreibbares Ergebnisprotokoll.

Den Inhalt des erzeugten `Data`-Ordners in den **separaten Testdatenordner** übernehmen. Vorhandene Dateien dort nicht überschreiben. Nicht in die normale Foundry-Installation kopieren. Foundry 14.359 starten, Testwelt öffnen und Modul aktivieren. Das Modul im Setup gegen Updates sperren: Foundrys Paketverzeichnis kann trotz fehlender Links die offizielle Version anbieten; ein Update würde die Testkopie ersetzen.

Für einen Vergleich unter 14.369 dieselben Dateien in eine weitere eigene Testumgebung übernehmen. Modul und Daten bleiben im Repository unter `artifacts/` ignoriert; Foundry-Core, Weltinhalte, Zugangsdaten und rechnerabhängige Pfade nicht committen.

## Ablauf und erwartetes Ergebnis

Zwei Szenen anlegen: **Webtest** und **Normale Szene**. Beide in der Navigation anzeigen, Webtest für **Alle Spieler** zugänglich machen. Szenenaktivierung und unabhängiges Betrachten getrennt prüfen. In Webtest die Adresse `assets/website-to-scene-test/index.html` verwenden.

Für jeden tatsächlich ausgeführten Browser und Core-Build die folgenden Ergebnisse getrennt protokollieren. Bei Fehlern konkrete Schritte, sichtbares Verhalten und bereinigte Konsolenfehler notieren. Nicht ausgeführte Fälle bleiben offen.

| Fall | Schritte und Erwartung | Ergebnis / Browser / Core |
| --- | --- | --- |
| A – Formular | Grundlagen/Basics öffnen: Felder stehen im Inhaltsreiter. URL und beide Haken speichern, schließen und erneut öffnen: Werte unverändert. Keine doppelten Felder. | Offen |
| B – Lokale Seite | Webseite einschalten, Menüs zunächst sichtbar lassen. Szene öffnen: Testseite lädt randlos. Zähler klicken, Notiz eingeben, zum Ende scrollen. Fenstergröße ändern: iframe passt sich an. | Offen |
| C – Menüs | Chat, Navigation, Werkzeuge und Makroleiste bleiben erreichbar. Menü-Haken speichern: normale Oberfläche verschwindet; ☰ zeigt sie wieder, × versteckt sie. Bereits offene Fenster und Benachrichtigungen bleiben zugänglich. | Offen |
| D – Zustand | Zähler/Notiz verändern, dann nur den Szenennamen ändern: iframe-Zustand bleibt erhalten. Bei temporär eingeblendeten Menüs darf eine Namensänderung sie nicht wieder ausblenden. | Offen |
| E – Bereinigung | Andere Szene öffnen: Overlay und Knopf verschwinden, Menüs erscheinen. Zurück zu Webtest: Haken gilt wieder. Webseite deaktivieren, URL ändern und Webtest löschen: keine alte Fläche/versteckten Menüs bleiben zurück. | Offen |
| F – Spieler | Als GM Webtest aktivieren: Spieler folgt. Spieler kann bei Alle Spieler/Navigation selbst wechseln. Zähler/Notiz und temporärer Menüknopf gelten pro Benutzer; ein Benutzer verändert damit weder die Anzeige des anderen noch gespeicherte Szenenwerte. | Offen |
| G – Deutsch/Englisch | In der geöffneten Welt Core → Language Preference Deutsch/Englisch wählen und jeweils neu laden. Felder, Hilfetexte, Platzhalter, URL-Fehler und beide Knopf-Tooltips übersetzt. Keine rohen Übersetzungsschlüssel; iframe-Titel enthält Szenenname statt `{name}`. URL/Haken bleiben gespeichert, Testseite bleibt Deutsch. Browser und App haben eigene Client-Einstellungen. | Offen |
| H – Fehler | Aktiviert: leere Adresse, `file:///test.html` und `javascript:void(0)` werden vor dem Speichern abgewiesen. Bei deaktivierter Webseite verhindert eine leere Adresse das Speichern nicht. Keine Zugangsdaten für Tests verwenden. | Offen |
| I – Absolute Adresse | Die erreichbare absolute HTTP(S)-Adresse der eigenen Testseite verwenden; bei zwei Rechnern kein `localhost` als Serveradresse. Zusätzlich eine vertraute externe Seite prüfen, die iframe-Einbettung erlaubt. | Offen |
| J – HTTPS/Proxy | Falls vorhanden: HTTP-Seite in HTTPS-Foundry wird abgewiesen; HTTPS-Seite funktioniert. Bei route-prefix relative Adresse korrekt. Einbettungssperren werden respektiert. Ohne passende Infrastruktur diesen Fall als nicht geprüft belassen. | Offen |

Fall E mit neu erstelltem Webtest zuletzt ausführen, damit Löschen nicht die weiteren Tests verhindert. Ungewöhnliche Surface-/Systemmodule erst nach dem Basistest einzeln ergänzen, falls deren Kompatibilität ebenfalls geprüft werden soll.

## Ergebnisprotokoll

- Datum / Tester: offen
- Tatsächliche Foundry-Version / Spielsystemversion: offen
- Modulversion / Ausgangscommit / Hash-Nachweis: siehe `provenance.json`, hier ergänzen
- Browser-Versionen / Foundry-App: offen
- Durchgeführte Fälle mit Ergebnis: Tabelle oben ausfüllen
- Nicht geprüfte Fälle: offen
- Fehler und Reproduktionsschritte: offen
- Gesamturteil: **Noch nicht durchgeführt**

Erst nach Auswertung der echten Tests und relevanter Core-Änderungen entscheiden, ob die reguläre Mindestversion auf 14.359 gesenkt werden kann. Anschließend alle bisherigen automatisierten Prüfungen erneut ausführen. Änderungen von Manifest/README/Changelog und eine Veröffentlichung benötigen einen gesonderten Folgeauftrag; diese Vorbereitung veröffentlicht nichts.
