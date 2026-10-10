# Validierung – Version 1.1.0 (vorbereitet)

## Wiederholbare Prüfungen

Node.js 24:

```sh
npm test
npm run build:release
npm run test:release
```

`pretest` prüft Syntax aller JS/MJS-Dateien, JSON, Version/URLs und bekannte Secret-Muster. Tests prüfen relative/absolute URLs und Ablehnung ungültiger Schemata, Zugangsdaten und HTTPS-Mischinhalte sowie vollständige DE-/EN-Sprachkataloge, gleiche Formatvariablen und übersetzbare Fehler. Release-Tests prüfen reproduzierbare ZIPs, exakte Quellen einschließlich beider Sprachdateien, CRC32, Manipulationen, Metadaten und alle Schutzregeln vor Remote-Mutationen. Kein Test veröffentlicht einen echten Release.

Ohne npm sind die äquivalenten Befehle `node tools/check-project.mjs`, `node --test tests/*.test.js tests/*.test.mjs`, `node tools/build-release.mjs` und `node tools/verify-release.mjs` möglich.

## Browser-Test

Die CI und der Release installieren die feste Testversion Playwright 1.62.1 nur im Runner und laden Chromium sowie Firefox. Beide führen denselben vollständigen Browser-Test aus; ein Fehler in einem der Browser verhindert die Veröffentlichung:

```sh
npm install --no-save --package-lock=false --ignore-scripts playwright@1.62.1
npx --no-install playwright install --with-deps chromium firefox
npm run test:browser
TEST_BROWSER=firefox npm run test:browser
```

Der Browser-Test nutzt eine lokale HTTP-Fixture und künstliche Webseiten mit dem unveränderten Modulcode. Er prüft iframe-Klicks, volle Fläche nach Größenänderung, Foundry-Bedienelemente, Erhalt des Webseitenzustands bei Szeneupdates, den tatsächlichen Navigationslink und Inhaltsreiter der Szenenkonfiguration, Validierung/Flags, Menüausblendung/temporäre Wiederanzeige und Bereinigung beim Szenenwechsel. Jeder Browser durchläuft den vollständigen Test mit Foundry-Sprache `de`, `en` und `fr` (englischer Rückfall). Die Browsersprache ist absichtlich anders eingestellt. Geprüft werden Beschriftungen, Hilfetexte, Platzhalter, Fehlermeldungen, Tooltips und Barrierefreiheitstexte. Es laufen echte Browser gegen simulierte Foundry-Hooks, Dokumente und Sprachkataloge, keine vollständige Foundry-Installation. Playwright verwendet eine eigene Firefox-Testversion, nicht den persönlichen Firefox mit seinen Erweiterungen und Einstellungen. Screenshots liegen je Browser/Sprache in `artifacts/browser-check-<browser>-<sprache>.png` und `artifacts/browser-config-<browser>-<sprache>.png`.

Alternativ `PLAYWRIGHT_PATH` auf `index.mjs` einer vorhandenen Playwright-Installation setzen. `TEST_BROWSER=firefox` startet Playwright-Firefox; `msedge` oder `chrome` verwendet den bereits installierten Browser. Ohne diese Variable oder mit `chromium` wird Playwright-Chromium verwendet. Andere Werte brechen mit einem Fehler ab. Keine rechnerabhängigen Laufzeitpfade im Repository voraussetzen.

Unter PowerShell vor dem Firefox-Aufruf `$env:TEST_BROWSER = 'firefox'` setzen und danach mit `Remove-Item Env:TEST_BROWSER` zurücksetzen. Ohne npm direkt `node tests/browser.mjs` ausführen. `PLAYWRIGHT_BROWSERS_PATH` kann auf einen lokalen Testbrowser-Ordner zeigen.

## Live-Foundry-Testplan

1. Modul in einer eigenen Foundry-14.369-Testwelt aktivieren. Webseite pro Szene eintragen/speichern, Formular erneut öffnen: Werte erhalten.
2. Ohne Menü-Haken die Vollbildfläche und Foundrys Szene-/Chat-/Makro-Bedienung prüfen.
3. Menü-Haken aktivieren/speichern: Oberfläche einschließlich DSA-Leisten verschwindet. Webseite bleibt bedienbar; ☰ blendet Menüs lokal wieder ein/aus.
4. Eine andere Szene öffnen: Webseite und Rückkehrknopf verschwinden, normale Menüs erscheinen. Webseite erneut öffnen: Einstellung gilt wieder.
5. Webseite deaktivieren, URL ändern und Szene löschen: Overlay wird aktualisiert/entfernt; keine verdeckten Menüs bleiben zurück.
6. GM und Spieler in getrennten Browsern verbinden. Selbstständigen Spielerzugriff mit Alle Spieler/Navigation sowie normale Szenenaktivierung für die Runde prüfen. Lokales Menüeinblenden darf die anderen Benutzer nicht verändern.
7. Erlaubte externe Seite, relativen Data-Pfad, HTTPS, route-prefix und eine Einbettung verweigernde Seite prüfen. Keine Sperre umgehen; Verhalten/Fehler dokumentieren.
8. Foundry mit deutscher und englischer Sprache neu laden: Szenenfelder, Hilfetexte, URL-Fehler und ☰-/×-Tooltips prüfen. Webseite behält ihre eigene Sprache; vorhandene URL-/Checkbox-Werte bleiben erhalten. Die Sprachänderung dieses Entwicklungsstands ist noch nicht live in Foundry geprüft.

## Bisherige tatsächliche Nachweise

Am 9. Oktober 2026 wurden in der laufenden lokalen Foundry-Version 14.369 die Szenenfelder, iframe-Navigation des Notizbuchs, randlose Vollbildgröße, Seitenleistenbedienung sowie Speichern/Lesen des Menü-Hakens und Rückkehrknopf geprüft. Zusätzlich bestanden die lokalen Browserprüfungen der Entwicklungsstände bis 0.1.3.

Der Nutzer hat am 9. Oktober 2026 bestätigt, dass der bisherige manuelle Praxistest durchgeführt wurde und bestanden ist. Diese Bestätigung ergänzt die bisherigen Live-Nachweise; sie bestätigt nicht pauschal sämtliche Fälle des Testplans oder weitere Browser-, Mehrspieler- und Proxy-/HTTPS-Konfigurationen.

Am selben Tag bestand der vollständige simulierte Browser-Test zusätzlich mit Playwright-Firefox **153.0** unter Windows. Die bestehende Prüfung mit Microsoft Edge **154.0.4258.62** bestand nach der Erweiterung ebenfalls. CI und Release führen ab dieser Änderung Chromium und Firefox als getrennte Pflichtprüfungen aus. Ein Live-Foundry-Praxistest in Firefox ist damit nicht nachgewiesen.

Für jede Veröffentlichung werden Quell-, Node-, Browser- und Paketprüfungen erneut ausgeführt. Aktuelle Ergebnisse und der genaue GitHub-Stand stehen in REVIEW.md. Mehrspielerverhalten, andere Browser/Foundry-Versionen und verschiedene Proxy-/HTTPS-Konfigurationen sind nicht vollständig live geprüft. Ein erfolgreiches iframe-Ladeereignis allein beweist keine erfolgreiche externe Seite.

## Öffentliche Veröffentlichung

CodeQL analysiert JavaScript/TypeScript bei Push, Pull Request und manuellem Start. Der Release ruft denselben wiederverwendbaren Workflow auf und darf nur nach dessen Erfolg veröffentlichen. CI und CodeQL für den genauen Commit kontrollieren; bei Befunden Ursache prüfen/beheben, keine Prüfung umgehen. Workflow-Dateien zusätzlich mit actionlint prüfen.

Vor dem Release README in GitHub prüfen: Deutsch steht vor Englisch; Sprachwechsel und Rücksprünge funktionieren, das Bild lädt. Nach dem Release Manifest und ZIP ohne GitHub-Token herunterladen. Latest-Manifest, Version, Tag-SHA, Assetnamen sowie ZIP und Manifest mit den lokal gebauten Dateien vergleichen. GitHub-Veröffentlichung bedeutet keine Registrierung im Foundry-Modulverzeichnis.
