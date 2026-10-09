# Website to Scene – Projektregeln

## Identität und Einstieg

- Repository: **Ginkgo85/Webside-to-Scene**, öffentlich. Technische Modul-ID und Flag-Namespace: **website-to-scene**. Sichtbarer Titel: **Website to Scene**. Autor: **Ginkgo85**.
- Zuerst README.md, CONTRIBUTING.md, VALIDIERUNG.md und PUBLISHING.md lesen. Die Dateien im Repository-Root sind maßgeblich. `/website-to-scene/` und `/artifacts/` sind ignorierte lokale Prototypen/Backups.
- Vor Änderungen `git status`, Remotes und Branch prüfen. Authentifizierung mit GitHub CLI prüfen; Remote-Stand holen. Sauberen main nur mit `git pull --ff-only` aktualisieren. Fremde Änderungen nicht überschreiben.
- `foundry-world-status` diente als lesende Referenz für Entwicklungs-/Releasewerkzeuge. Dort nichts ändern. Der Nutzerauftrag gilt ausschließlich für dieses Repository.
- Keine technischen IDs, Flag-Schlüssel oder Remotes eigenmächtig umbenennen. Vor ID-Änderungen vorhandene Szenen analysieren und einen Migrationsplan testen.

## Umsetzung und Prüfungen

- Bestehendes Verhalten verstehen, Fehler belegen und kleine nachvollziehbare Änderungen vornehmen. Keine unnötigen Abhängigkeiten oder Refactorings.
- Vor Commit/Push: `npm test`, Browserprüfung bei UI-Änderungen, `npm run build:release`, `npm run test:release` und `git diff --check`; vollständigen Diff prüfen.
- Vor jeder Veröffentlichung dieselben Prüfungen einschließlich Browser und CodeQL durchführen. Der Release-Workflow ruft den CodeQL-Workflow auf und wartet auf dessen Erfolg; alle Prüfungen laufen vor jeder Mutation auf GitHub. Keine Prüfungen abschwächen, um einen Release zu ermöglichen.
- Nur tatsächlich ausgeführte Prüfungen als bestanden melden. Live-Foundry- und Mehrspielertests sind von simulierten Browser-/Node-Tests zu unterscheiden.
- Keine Foundry-Core-Dateien, privaten Weltinhalte, Zugangsdaten oder lokalen Installationspfade einchecken. Tests nutzen künstliche Webseiten und veröffentlichen keine Daten.
- Ausblenden der Oberfläche muss einen Rückweg bieten und beim Szenenwechsel vollständig bereinigt werden. Lokales Menüeinblenden darf keine Szene aktualisieren. Eingabefelder gehören in `.tab[data-tab="basics"][data-group="sheet"]`, nicht in den Navigationslink.

## Git und Releases

- Bei beauftragter Entwicklung nach erfolgreichen Prüfungen sinnvoll committen und pushen, sofern der Nutzer dies nicht ausschließt. Git-Historie nicht umschreiben.
- Conventional Commits: `type(scope): imperative summary`, möglichst unter 50, höchstens ungefähr 72 Zeichen; keine generischen Nachrichten oder AI-Co-Autoren. Vorlage: `.gitmessage`.
- `module.json` ist die Versionsquelle. `package.json`, README, Changelog und Download-URL gemeinsam aktuell halten; SemVer X.Y.Z. Erste finale Version **1.0.0**, Tags **v1.0.0** usw.
- Tags/Releases ausschließlich über **Actions → Release → Run workflow → main**, wenn Veröffentlichung vom Nutzer beauftragt ist. Eine Entwicklungsänderung oder vorbereitete Version allein ist kein Auftrag zur Veröffentlichung.
- Vorhandene Tags, Releases, Entwürfe oder Assets niemals ersetzen. Bei Fehlern den fehlgeschlagenen Lauf prüfen und eine neue Version vorbereiten, falls bereits ein Release existiert.
- Das Repository ist seit dem Nutzerauftrag vom 9. Oktober 2026 öffentlich. Veröffentlichung vorerst ausschließlich auf GitHub; keine Foundry-Package-Registrierung ohne neuen Auftrag. Keine Zugangstokens in Downloadlinks oder Änderungen an Repository-Einstellungen ohne Auftrag.
- Nach Push den exakten Remote-SHA und CI-Ergebnis prüfen. Nach beauftragtem Release Run, Tag-SHA, Assetnamen und heruntergeladene Dateien verifizieren.
