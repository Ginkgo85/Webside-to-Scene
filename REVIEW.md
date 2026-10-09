# Einrichtung und Release-Prüfstand

Stand: 9. Oktober 2026. Ziel: öffentliche Anpassung **1.0.1** für Foundry **14.369**.

## Ausgangspunkt

- Repository Ginkgo85/Webside-to-Scene wurde vom Nutzer öffentlich gestellt.
- v1.0.0 ist seit dem 9. Oktober 2026 veröffentlicht, Tag-SHA `1f5e3ab0da84bb74290b9987e771c8348a23840e`. Tag, Release und Assets werden nicht ersetzt.
- Der ursprüngliche CI-Lauf für 1.0.0 bestand: [Run 37921563161](https://github.com/Ginkgo85/Webside-to-Scene/actions/runs/37921563161).
- Lesende Referenz: Ginkgo85/foundry-world-status, Commit `14c4bb2ea6118efe8bdac507b3befa4c3e70914c`. Dort keine Dateien, Commits, Einstellungen oder Releases geändert.

## Öffentliche Anpassung

Version und Download-URL sind 1.0.1. Die Modulbeschreibung enthält keinen privaten Nutzungsvorbehalt. Autor Ginkgo85, technische ID/Flags, Laufzeitverhalten und MIT-Lizenz bleiben erhalten. `private: true` in package.json betrifft ausschließlich npm.

README: Deutsch vor Englisch, Sprachwechsel- und Rücksprunglinks, aktualisiertes Szenenbild, Installation über die öffentliche Manifest-URL, manuelle Alternative, Bedienung, Menüoptionen, Grenzen, Support und Lizenz in beiden Sprachen. Auf Nutzerwunsch stehen Entwicklungsbefehle und Release-Workflow nur in den separaten Dokumentationsdateien. Die englische Anleitung erklärt die derzeit deutschen Modulbeschriftungen.

CodeQL wird aus dem Referenzablauf übernommen, mit gegen die offizielle GitHub-Tagauflösung geprüfter Action v4.38.0. Der Workflow ist zusätzlich wiederverwendbar; Release wartet mittels `needs: codeql` auf dessen Erfolg. Die bisherigen CI-/Browser-/Build-/Artefaktprüfungen bleiben erhalten.

Der erste CodeQL-Lauf beanstandete eine aus HTTP-Anfragen abgeleitete Dateipfadprüfung im lokalen Browser-Testserver. Der Server lädt nun ausschließlich seine drei festen Assets vorab und liefert sie über eine exakte URL-Zuordnung. Unbekannte, Traversal- und Query-Pfade werden mit 404 abgewiesen und in der Browserprüfung kontrolliert. Der Testserver ist nicht Teil des Release-ZIPs.

Der Nutzer hat Vertrieb **ausschließlich auf GitHub** festgelegt. Es wird kein Eintrag im offiziellen Foundry-Modulverzeichnis angelegt.

## Prüfungen

Am 9. Oktober 2026 lokal mit Node.js 24.19.0 ausgeführt:

| Prüfung | Umfang |
| --- | --- |
| Quellprüfung | Bestanden: Syntax, JSON, Metadaten und bekannte Secret-Muster |
| Node-Tests | 26 bestanden, 0 Fehler, 0 Skips; einschließlich CodeQL-Abhängigkeit |
| Browser-Fixture mit Edge | Bestanden: Interaktion, Vollbild, Menüs, Formular/Flags und Bereinigung |
| Paketprüfung | Bestanden: 8 Dateien, Root-Manifest, reproduzierbare Bytes, CRC32/Quellenvergleich |
| Workflowprüfung | actionlint für CI, CodeQL und Release bestanden, ohne separates ShellCheck |
| Diff-Prüfung | git diff --check bestanden; Änderungen geprüft |
| README auf GitHub | Bestanden: Sprachwechsel Deutsch/Englisch, Rücksprung zum Anfang und geladenes Szenenbild |
| GitHub | Nach Push: CI/CodeQL; nach Release: Tag-SHA, Assets und anonyme Downloads |

Lokal verwendet dieser Rechner Node.js 24 ohne npm. Es werden die äquivalenten direkten Node-Aufrufe verwendet; GitHub führt die npm-Kommandos und Chromium aus. Tatsächliche Ergebnisse und Abschluss-SHA werden nach Durchführung im Chat gemeldet.

Live-Nachweise stammen aus Foundry 14.369 mit dem unveränderten Laufzeitcode des Entwicklungsstands 0.1.3. Mehrspielertests, andere Browser/Foundry-Versionen und spezielle Proxy-/HTTPS-Umgebungen sind nicht vollständig live geprüft.

## Veröffentlichung

Nach erfolgreicher Prüfung wird der öffentliche Stand auf main gepusht, CI/CodeQL kontrolliert und der beauftragte Release **v1.0.1** über Actions gestartet. Bestehendes v1.0.0 bleibt erhalten. Die heruntergeladenen öffentlichen Assets werden anschließend mit dem lokalen Build verglichen.
