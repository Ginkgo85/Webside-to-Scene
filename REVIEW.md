# Einrichtung und Release-Prüfstand

Stand: 9. Oktober 2026. Ziel: erste finale Version **1.0.0** für Foundry **14.369**.

## Ausgangspunkt

- Privates Repository Ginkgo85/Webside-to-Scene mit initialer README und MIT-Lizenz; keine vorhandenen Releases.
- Lokales funktionsfähiges Modul 0.1.3; Benutzerbestätigung und Live-Prüfungen für Szenenfelder, Vollbild und Menüausblendung.
- Lesende Referenz: Ginkgo85/foundry-world-status, Commit `14c4bb2ea6118efe8bdac507b3befa4c3e70914c`. Dort keine Dateien, Commits, Einstellungen oder Releases geändert.

## Einrichtung

Runtime-Dateien und Manifest liegen jetzt im Repository-Root. Technische ID/Flags bleiben website-to-scene. Version, Autor Ginkgo85, Repository/Issues, Lizenz und private Release-URLs sind ergänzt. Die vorhandene MIT-Lizenz bleibt erhalten.

Releasewerkzeuge und Schutztests wurden aus der Referenz angepasst; Laufzeitcode und Dateiliste beziehen sich ausschließlich auf Website to Scene. Actions-Pins für checkout v7.0.1 und setup-node v7.0.0 wurden gegen die offiziellen GitHub-Tagziele überprüft. CI und Release verwenden denselben Test-/Browser-/Build-/Artefaktablauf. CodeQL ist wegen privater Lizenzvoraussetzungen nicht automatisch aktiviert.

Das vom Nutzer bereitgestellte Bild ist docs/images/scene-settings.png und Bestandteil von README und ZIP. Lokale Backups, Screenshots, alte Prototypen und ZIPs werden nicht eingecheckt.

## Prüfstatus

Ausgeführt mit Node.js 24.19.0 am 9. Oktober 2026:

| Prüfung | Ergebnis |
| --- | --- |
| Quellsyntax, JSON, Manifest/Version/URLs, Secret-Muster | Bestanden |
| Node-Testdateien einschließlich aller Release-Schutzfälle | 26 bestanden, 0 Fehler, 0 Skips |
| Browser-Fixture mit vorhandenem Microsoft Edge | Bestanden |
| Reproduzierbarer ZIP-Bau | Bestanden, 8 Dateien, Manifest im Root |
| Tatsächliche Release-Dateien: CRC32/Quellenvergleich/Manifest | Bestanden |
| actionlint für CI und Release, ohne separates ShellCheck | Bestanden |
| git diff --check | Bestanden |

Die npm-Kommandos wurden lokal mit den äquivalenten Node-Aufrufen ausgeführt, weil dieser Rechner die gebündelte Node-Laufzeit ohne npm verwendet. GitHub CI führt die originalen npm-Kommandos sowie Playwright-Chromium aus. Der Abschluss des CI-Laufs wird nach dem Push kontrolliert und im Chat mit dem genauen Commit gemeldet.

Mehrspielertests und spezielle Proxy-/HTTPS-Umgebungen bleiben ergänzende Live-Prüfungen. Aktuelle Live-Funktionsnachweise stammen aus Foundry 14.369 mit dem unveränderten Laufzeitcode des Entwicklungsstands 0.1.3; 1.0.0 ergänzt Metadaten, Paketbau und Entwicklungs-/Releaseabläufe.

## Veröffentlichung

1.0.0 wird vorbereitet, committed und auf main gepusht. Der manuelle Release-Workflow ist anschließend verfügbar. Dieser Einrichtungsauftrag startet noch keinen Release und legt keinen Tag an. Die erste Veröffentlichung erfolgt über Actions → Release → Run workflow → main.
