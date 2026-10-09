# Validierung – Version 1.0.2

## Wiederholbare Prüfungen

Node.js 24:

```sh
npm test
npm run build:release
npm run test:release
```

`pretest` prüft Syntax aller JS/MJS-Dateien, JSON, Version/URLs und bekannte Secret-Muster. Tests prüfen relative/absolute URLs und Ablehnung ungültiger Schemata, Zugangsdaten und HTTPS-Mischinhalte. Release-Tests prüfen reproduzierbare ZIPs, exakte Quellen, CRC32, Manipulationen, Metadaten und alle Schutzregeln vor Remote-Mutationen. Kein Test veröffentlicht einen echten Release.

Ohne npm sind die äquivalenten Befehle `node tools/check-project.mjs`, `node --test tests/*.test.js tests/*.test.mjs`, `node tools/build-release.mjs` und `node tools/verify-release.mjs` möglich.

## Browser-Test

Die CI und der Release installieren die feste Testversion Playwright 1.62.1 nur im Runner und laden Chromium:

```sh
npm install --no-save --package-lock=false --ignore-scripts playwright@1.62.1
npx --no-install playwright install --with-deps chromium
npm run test:browser
```

Der Browser-Test nutzt eine lokale HTTP-Fixture und künstliche Webseiten. Er prüft iframe-Klicks, volle Fläche nach Größenänderung, Foundry-Bedienelemente, Erhalt des Webseitenzustands bei Szeneupdates, den tatsächlichen Navigationslink und Inhaltsreiter der Szenenkonfiguration, Validierung/Flags, Menüausblendung/temporäre Wiederanzeige und Bereinigung beim Szenenwechsel. Screenshot-Ausgabe liegt in ignoriertem artifacts/.

Alternativ `PLAYWRIGHT_PATH` auf `index.mjs` einer vorhandenen Playwright-Installation setzen. `TEST_BROWSER=msedge` oder `chrome` verwendet den bereits installierten Browser; ohne diese Variable wird Playwright-Chromium verwendet. Keine rechnerabhängigen Laufzeitpfade im Repository voraussetzen.

## Live-Foundry-Testplan

1. Modul in einer eigenen Foundry-14.369-Testwelt aktivieren. Webseite pro Szene eintragen/speichern, Formular erneut öffnen: Werte erhalten.
2. Ohne Menü-Haken die Vollbildfläche und Foundrys Szene-/Chat-/Makro-Bedienung prüfen.
3. Menü-Haken aktivieren/speichern: Oberfläche einschließlich DSA-Leisten verschwindet. Webseite bleibt bedienbar; ☰ blendet Menüs lokal wieder ein/aus.
4. Eine andere Szene öffnen: Webseite und Rückkehrknopf verschwinden, normale Menüs erscheinen. Webseite erneut öffnen: Einstellung gilt wieder.
5. Webseite deaktivieren, URL ändern und Szene löschen: Overlay wird aktualisiert/entfernt; keine verdeckten Menüs bleiben zurück.
6. GM und Spieler in getrennten Browsern verbinden. Selbstständigen Spielerzugriff mit Alle Spieler/Navigation sowie normale Szenenaktivierung für die Runde prüfen. Lokales Menüeinblenden darf die anderen Benutzer nicht verändern.
7. Erlaubte externe Seite, relativen Data-Pfad, HTTPS, route-prefix und eine Einbettung verweigernde Seite prüfen. Keine Sperre umgehen; Verhalten/Fehler dokumentieren.

## Bisherige tatsächliche Nachweise

Am 9. Oktober 2026 wurden in der laufenden lokalen Foundry-Version 14.369 die Szenenfelder, iframe-Navigation des Notizbuchs, randlose Vollbildgröße, Seitenleistenbedienung sowie Speichern/Lesen des Menü-Hakens und Rückkehrknopf geprüft. Zusätzlich bestanden die lokalen Browserprüfungen der Entwicklungsstände bis 0.1.3.

Der Nutzer hat am 9. Oktober 2026 bestätigt, dass der bisherige manuelle Praxistest durchgeführt wurde und bestanden ist. Diese Bestätigung ergänzt die bisherigen Live-Nachweise; sie bestätigt nicht pauschal sämtliche Fälle des Testplans oder weitere Browser-, Mehrspieler- und Proxy-/HTTPS-Konfigurationen.

Für jede Veröffentlichung, aktuell 1.0.2, werden Quell-, Node-, Browser- und Paketprüfungen erneut ausgeführt. Aktuelle Ergebnisse und der genaue GitHub-Stand stehen in REVIEW.md. Mehrspielerverhalten, andere Browser/Foundry-Versionen und verschiedene Proxy-/HTTPS-Konfigurationen sind nicht vollständig live geprüft. Ein erfolgreiches iframe-Ladeereignis allein beweist keine erfolgreiche externe Seite.

## Öffentliche Veröffentlichung

CodeQL analysiert JavaScript/TypeScript bei Push, Pull Request und manuellem Start. Der Release ruft denselben wiederverwendbaren Workflow auf und darf nur nach dessen Erfolg veröffentlichen. CI und CodeQL für den genauen Commit kontrollieren; bei Befunden Ursache prüfen/beheben, keine Prüfung umgehen. Workflow-Dateien zusätzlich mit actionlint prüfen.

Vor dem Release README in GitHub prüfen: Deutsch steht vor Englisch; Sprachwechsel und Rücksprünge funktionieren, das Bild lädt. Nach dem Release Manifest und ZIP ohne GitHub-Token herunterladen. Latest-Manifest, Version, Tag-SHA, Assetnamen sowie ZIP und Manifest mit den lokal gebauten Dateien vergleichen. GitHub-Veröffentlichung bedeutet keine Registrierung im Foundry-Modulverzeichnis.
