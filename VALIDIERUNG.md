# Validierung – Version 1.1.1

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

Die [lokale Einrichtung unter Windows](docs/LOKALE-TESTEINRICHTUNG.md) beschreibt die Wiederherstellung von npm und beiden Testbrowsern sowie den hier erprobten dauerhaften Browsercache. Nach einem Terminal-/App-Neustart sind keine manuellen Pfadangaben pro Testlauf nötig.

Die CI und der Release installieren die feste Testversion Playwright 1.62.1 im Runner und laden Chromium sowie Firefox. Beide führen denselben vollständigen Browser-Test aus; ein Fehler in einem der Browser verhindert die Veröffentlichung:

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

Der ausführliche Abgleich für **14.370** und die tatsächlich ausgeführten Tests vom **5. November 2026** stehen in [REVIEW.md](REVIEW.md#foundry-14370--5-november-2026). Die folgende ältere 14.359-Vorbereitung bleibt davon unabhängig.

### Wiederholbarer Live-Test für 14.370

`tests/foundry-live.mjs` ist ein **optionaler Integrationstest**, keine CI-Simulation. Er benötigt eine separat gestartete lizenzierte Foundry-14.370-Instanz auf `http://127.0.0.1:30001` mit eigenem Datenordner, D&D 5e **6.0.6** und der leeren Wegwerf-Testwelt **wts-compatibility**. Einen GM namens **Gamemaster** ohne Testpasswort anlegen, ausschließlich dieses Modul aus dem aktuellen Checkout aktivieren und zuvor keine privaten Daten übernehmen. Nur eine Kopie des Spielsystems verwenden, da Foundry dessen Datenbanken migrieren kann. Die produktive Installation bleibt geschlossen/unverändert. Beim separaten Server UPnP und IP-Erkennung abschalten; Node-Anforderung siehe [lokale Testeinrichtung](docs/LOKALE-TESTEINRICHTUNG.md).

Der Test prüft Welt-ID, Core-/Systemversion, aktivierte Modulversion und bytegleichen Laufzeitcode vor Dokumentänderungen. Er erzeugt einen künstlichen Spieler und Testszenen, ändert die Sprache der Testsitzung und löscht erfolgreich geprüfte Szenen wieder. Bei einem Abbruch können Szenen in dieser Wegwerf-Welt zurückbleiben. Der temporäre Webserver auf `127.0.0.1:30002` liefert ausschließlich die künstliche HTML-Testseite; er wird danach beendet. Die festen Loopback-Adressen sind nur für diesen lokalen Test geeignet.

```powershell
node tests/foundry-live.mjs --test-world
$env:TEST_BROWSER = 'firefox'
try { node tests/foundry-live.mjs --test-world }
finally { Remove-Item Env:TEST_BROWSER }
```

Beide Läufe nacheinander ausführen: Sie verwenden dieselbe Testwelt und denselben Webseitenport. Ergebnisse und Screenshots entstehen unter `artifacts/foundry-14.370/`. Deutsch und Englisch laufen gegen den echten Core; der französische Rückfall bleibt Bestandteil der vollständigen Browser-Simulation, weil die Testwelt keine französische Core-Sprache installiert hat. Diese Datei und sämtliche Foundry-Daten gehören nicht ins Release-ZIP. Lizenz, Spielsystem, Core und lokale Daten bleiben außerhalb von Git.

### Manueller ergänzender Plan

Die Prüfung einer niedrigeren Mindestversion **14.359** wird separat vorbereitet: [Testkopie, Voraussetzungen und Ergebnisprotokoll](docs/FOUNDRY-14.359-TEST.md). `node tools/prepare-foundry-test.mjs` erzeugt eine isolierte lokale Kopie und künstliche HTML-Seite unter `artifacts/`. Dies senkt die reguläre Mindestversion nicht und ist kein bestandener Live-Test.

1. Modul in einer eigenen Foundry-14.369-Testwelt aktivieren. Webseite pro Szene eintragen/speichern, Formular erneut öffnen: Werte erhalten.
2. Ohne Menü-Haken die Vollbildfläche und Foundrys Szene-/Chat-/Makro-Bedienung prüfen.
3. Menü-Haken aktivieren/speichern: Oberfläche einschließlich DSA-Leisten verschwindet. Webseite bleibt bedienbar; ☰ blendet Menüs lokal wieder ein/aus.
4. Eine andere Szene öffnen: Webseite und Rückkehrknopf verschwinden, normale Menüs erscheinen. Webseite erneut öffnen: Einstellung gilt wieder.
5. Webseite deaktivieren, URL ändern und Szene löschen: Overlay wird aktualisiert/entfernt; keine verdeckten Menüs bleiben zurück.
6. GM und Spieler in getrennten Browsern verbinden. Selbstständigen Spielerzugriff mit Alle Spieler/Navigation sowie normale Szenenaktivierung für die Runde prüfen. Lokales Menüeinblenden darf die anderen Benutzer nicht verändern.
7. Erlaubte externe Seite, relativen Data-Pfad, HTTPS, route-prefix und eine Einbettung verweigernde Seite prüfen. Foundry liefert HTML aus Data als Text; für Interaktionstests einen separaten Webseitenserver verwenden. Ein korrekt aufgelöster Pfad beweist keine HTML-Ausführung. Keine Sperre umgehen; Verhalten/Fehler dokumentieren.
8. Foundry mit deutscher und englischer Sprache neu laden: Szenenfelder, Hilfetexte, URL-Fehler und ☰-/×-Tooltips prüfen. Webseite behält ihre eigene Sprache; vorhandene URL-/Checkbox-Werte bleiben erhalten. Der Nutzer hat den manuellen Sprachwechsel in einer Testwelt als bestanden bestätigt; der genaue bestätigte Umfang steht unten.

## Bisherige tatsächliche Nachweise

### Bestandener DSA-Praxistest mit 14.370 – 5. November 2026

Website to Scene **1.1.1** wurde über die sichtbare Oberfläche einer tatsächlich laufenden, gehosteten HTTPS-Welt mit Foundry **14.370**, **Das Schwarze Auge 8.2.1**, **99 aktiven Modulen insgesamt** und Microsoft Edge geprüft. Eine eigene, nur für die Spielleitung zugängliche Testszene diente für die Änderungen. Dies ist ein echter Praxistest, keine Simulation. Der Nutzer bestätigte während des Tests: „scheint ja alles zu klappen“.

Bestanden: deutsche Szenenfelder und gespeicherte Werte, Ablehnung einer HTTP-Adresse unter HTTPS, sichtbare HTTPS-Webseite, Texteingaben und Auswahl im eingebetteten Formular, Ausblenden einschließlich DSA-Leisten/Kalender, lokale Wiederanzeige über den Rückkehrknopf sowie vollständige Entfernung von Webseite und Knopf beim Wechsel zurück zur ursprünglichen Szene. Auch nach einer im iframe verweigerten externen Navigation blieb der Rückkehrknopf bedienbar. Keine Testformulare wurden abgesendet.

Es wurde eine GM-Sitzung geprüft; die aktive Szene für die Runde blieb unverändert. Anschließend wurden die ursprüngliche Szenenansicht und die Oberfläche wiederhergestellt; die eigene Testszene blieb für Wiederholungen erhalten. Keine bestehenden Szeneninhalte wurden bearbeitet. Der Nachweis gilt für diesen Ablauf mit gleichzeitig aktiven Zusatzmodulen, nicht für deren sämtliche Funktionen oder für Mehrspielerbetrieb in dieser gehosteten Welt. Details einschließlich der verweigerten externen Zielseite stehen im [Praxistestprotokoll](REVIEW.md#gehosteter-dsa-praxistest--5-november-2026). Private Weltinhalte, Hostadresse und Screenshots werden nicht ins Repository übernommen.

### Frühere Nachweise

Am 9. Oktober 2026 wurden in der laufenden lokalen Foundry-Version 14.369 die Szenenfelder, iframe-Navigation des Notizbuchs, randlose Vollbildgröße, Seitenleistenbedienung sowie Speichern/Lesen des Menü-Hakens und Rückkehrknopf geprüft. Zusätzlich bestanden die lokalen Browserprüfungen der Entwicklungsstände bis 0.1.3.

Der Nutzer hat am 9. Oktober 2026 bestätigt, dass der bisherige manuelle Praxistest durchgeführt wurde und bestanden ist. Diese Bestätigung ergänzt die bisherigen Live-Nachweise; sie bestätigt nicht pauschal sämtliche Fälle des Testplans oder weitere Browser-, Mehrspieler- und Proxy-/HTTPS-Konfigurationen.

Am 11. Oktober 2026 hat der Nutzer zusätzlich den durchgeführten manuellen Sprachtest in einer Testwelt für Website to Scene **1.1.0** mit Foundry **14.369** als bestanden bestätigt: Der Wechsel zwischen Deutsch und Englisch funktioniert, die Modultexte folgen der eingestellten Foundry-Sprache. Nach der zuvor berichteten Abweichung in der Foundry-App wurde die Sprache innerhalb der geöffneten Welt unter Core → Language Preference eingestellt; anschließend bestätigte der Nutzer die korrekte Anzeige. App und Browser können unterschiedliche clientbezogene Spracheinstellungen verwenden. Dies ist ein vom Nutzer bestätigter Live-Test, keine Browser-Simulation und kein Nachweis aller weiteren Testfälle.

Am 9. Oktober 2026 bestand der vollständige simulierte Browser-Test zusätzlich mit Playwright-Firefox **153.0** unter Windows. Die bestehende Prüfung mit Microsoft Edge **154.0.4258.62** bestand nach der Erweiterung ebenfalls. CI und Release führen ab dieser Änderung Chromium und Firefox als getrennte Pflichtprüfungen aus. Ein Live-Foundry-Praxistest in Firefox ist damit nicht nachgewiesen.

Für jede Veröffentlichung werden Quell-, Node-, Browser- und Paketprüfungen erneut ausgeführt. Aktuelle Ergebnisse und der genaue GitHub-Stand stehen in REVIEW.md. Mehrspielerverhalten, andere Browser/Foundry-Versionen und verschiedene Proxy-/HTTPS-Konfigurationen sind nicht vollständig live geprüft. Ein erfolgreiches iframe-Ladeereignis allein beweist keine erfolgreiche externe Seite.

## Öffentliche Veröffentlichung

CodeQL analysiert JavaScript/TypeScript bei Push, Pull Request und manuellem Start. Der Release ruft denselben wiederverwendbaren Workflow auf und darf nur nach dessen Erfolg veröffentlichen. CI und CodeQL für den genauen Commit kontrollieren; bei Befunden Ursache prüfen/beheben, keine Prüfung umgehen. Workflow-Dateien zusätzlich mit actionlint prüfen.

Vor dem Release README in GitHub prüfen: Deutsch steht vor Englisch; Sprachwechsel und Rücksprünge funktionieren, das Bild lädt. Vorbereitungshinweise entfernen und den Changelog-Eintrag datieren. Nach dem Release Manifest und ZIP ohne GitHub-Token herunterladen. Latest-Manifest, Version, Tag-SHA, Assetnamen sowie ZIP und Manifest mit dem Build des veröffentlichten Tags vergleichen. Den Foundry-Job und den öffentlich erreichbaren Versionseintrag separat bestätigen.

Die Foundry-Eintragung wird nun nach verifiziertem GitHub-Release im Release-Workflow ausgeführt. Vor jeder GitHub-Veröffentlichung validiert die Foundry-API den geplanten Eintrag mit `dry-run: true`. Modus `check-foundry` führt alle Prüfungen einschließlich dieser echten API-Validierung aus, erstellt aber keinen Tag, Release oder Foundry-Versionseintrag. Der Token kommt ausschließlich aus `FOUNDRY_RELEASE_TOKEN`; Testdateien enthalten nur künstliche Werte.

Die Foundry-Tests prüfen falschen Branch/Commit/Workflow, fehlendes Secret, Paketfehler, falsche Tags, Entwürfe, fehlende/veränderte Assets und API-Fehler. Erst nach anonymem Download und Bytevergleich von Manifest und ZIP darf der echte API-Aufruf speichern. Keine automatischen POST-Wiederholungen bei unklarer Antwort; bestehende Versionen bleiben geschützt. Ein erfolgreicher Dry-run beweist API-Zugriff und gültige Eingabedaten, keine tatsächliche Veröffentlichung oder Installation.
