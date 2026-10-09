# Einrichtung und Release-Prüfstand

Stand: 9. Oktober 2026. Ziel: öffentliche Anpassung und abschließende README-Korrektur **1.0.2** für Foundry **14.369**.

## Ausgangspunkt

- Repository Ginkgo85/Webside-to-Scene wurde vom Nutzer öffentlich gestellt.
- v1.0.0 ist seit dem 9. Oktober 2026 veröffentlicht, Tag-SHA `1f5e3ab0da84bb74290b9987e771c8348a23840e`. Tag, Release und Assets werden nicht ersetzt.
- Der ursprüngliche CI-Lauf für 1.0.0 bestand: [Run 37921563161](https://github.com/Ginkgo85/Webside-to-Scene/actions/runs/37921563161).
- v1.0.1 wurde mit Commit `9e9f5e99ac2a0d81e9bc14f10d422db3e0abc2f6` öffentlich veröffentlicht: [Release-Lauf 37925055098](https://github.com/Ginkgo85/Webside-to-Scene/actions/runs/37925055098). CI, CodeQL und Release bestanden, keine offenen CodeQL-Befunde. Tag-SHA, beide Assets und anonyme Downloads wurden geprüft; ZIP und Latest-Manifest stimmen mit den Quellen überein.
- Lesende Referenz: Ginkgo85/foundry-world-status, Commit `14c4bb2ea6118efe8bdac507b3befa4c3e70914c`. Dort keine Dateien, Commits, Einstellungen oder Releases geändert.

## Öffentliche Anpassung

Version und Download-URL sind 1.0.2. Die Modulbeschreibung enthält keinen privaten Nutzungsvorbehalt. Autor Ginkgo85, technische ID/Flags, Laufzeitverhalten und MIT-Lizenz bleiben erhalten. `private: true` in package.json betrifft ausschließlich npm.

README: Deutsch vor Englisch, Sprachwechsel- und Rücksprunglinks, aktualisiertes Szenenbild, Installation über die öffentliche Manifest-URL, manuelle Alternative, Bedienung, Menüoptionen, Grenzen, Support und Lizenz in beiden Sprachen. Auf Nutzerwunsch stehen Entwicklungsbefehle und Release-Workflow nur in den separaten Dokumentationsdateien. Die englische Anleitung erklärt die derzeit deutschen Modulbeschriftungen.

Die nach Veröffentlichung von v1.0.1 angeforderte Entfernung der verbleibenden Release-Seitenlinks wird in v1.0.2 umgesetzt; v1.0.1 wird nicht überschrieben.

CodeQL wird aus dem Referenzablauf übernommen, mit gegen die offizielle GitHub-Tagauflösung geprüfter Action v4.38.0. Der Workflow ist zusätzlich wiederverwendbar; Release wartet mittels `needs: codeql` auf dessen Erfolg. Die bisherigen CI-/Browser-/Build-/Artefaktprüfungen bleiben erhalten.

Der erste CodeQL-Lauf beanstandete eine aus HTTP-Anfragen abgeleitete Dateipfadprüfung im lokalen Browser-Testserver. Der Server lädt nun ausschließlich seine drei festen Assets vorab und liefert sie über eine exakte URL-Zuordnung. Unbekannte, Traversal- und Query-Pfade werden mit 404 abgewiesen und in der Browserprüfung kontrolliert. Der Testserver ist nicht Teil des Release-ZIPs.

Der Nutzer hat anschließend auch die Foundry-Einreichung beauftragt und die Lizenzbestätigungen selbst vorgenommen. Am 9. Oktober 2026 wurden der Paketeintrag und Version **1.0.2** mit festem GitHub-Manifest, Release-Notizen und passender Kompatibilität gespeichert. Die Kategorien sind **External Integrations** und **Tools and Controls**. Im angemeldeten Konto ist die Modulseite sichtbar; die anonyme Prüfung leitet noch auf das allgemeine Paketverzeichnis weiter. Öffentliche Freischaltung steht aus, die GitHub-Installation bleibt verfügbar. Details und Folgeschritte stehen in PUBLISHING.md; eine automatische Foundry-Release-Meldung ist noch nicht eingerichtet.

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

Live-Nachweise stammen aus Foundry 14.369 mit dem unveränderten Laufzeitcode des Entwicklungsstands 0.1.3. Am 9. Oktober 2026 hat der Nutzer den durchgeführten bisherigen manuellen Praxistest als bestanden bestätigt. Die Bestätigung ist in VALIDIERUNG.md dokumentiert. Mehrspielertests, andere Browser/Foundry-Versionen und spezielle Proxy-/HTTPS-Umgebungen sind nicht vollständig live geprüft.

## Veröffentlichung

Nach erfolgreicher Prüfung wird der öffentliche Stand auf main gepusht, CI/CodeQL kontrolliert und der beauftragte Release **v1.0.2** über Actions gestartet. Bestehende Releases bleiben erhalten. Die heruntergeladenen öffentlichen Assets werden anschließend mit dem lokalen Build verglichen.
