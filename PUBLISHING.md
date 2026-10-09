# Private Version veröffentlichen

## Ablauf

1. Gewünschte Änderungen und konsistente neue Version auf `main` pushen. **1.0.0** ist die erste finale Version.
2. CI für genau diesen Commit abwarten. Bei UI-Änderungen die relevanten Live-Foundry-Fälle aus VALIDIERUNG.md prüfen.
3. GitHub → **Actions → Release → Run workflow → main**.

Der Workflow prüft Branch und Checkout, Quellcode/Metadaten, Node-Tests, Browsertest, Paketbau und tatsächliche Artefakte. Erst danach prüft er den aktuellen Remote-main und erstellt automatisch Tag `v<version>` und privaten Release mit genau `module.json` und `website-to-scene.zip`.

Keine Dateien oder Tags manuell anlegen. Keine persönlichen Tokens für Actions erforderlich: nur der Release-Workflow erhält `contents: write`; CI hat `contents: read`. Normale Pushes veröffentlichen keine Version. Der Ablauf entspricht dem Referenzmodul, ergänzt um den Browser-Test dieser Szene.

## Wiederholung nach Fehlern

- Bestehender Tag ohne Release darf nur bei genau demselben aktuellen main-SHA wiederverwendet werden.
- Abweichender oder annotierter Tag: Abbruch; niemals verschieben oder löschen.
- Bereits vorhandener Release, auch als Entwurf: Abbruch. Keine Assets überschreiben; neue Version vorbereiten.
- main wurde verändert oder API-Antwort unklar: Abbruch und neuen Lauf prüfen/starten.
- Fehlgeschlagene Prüfungen: Ursache beheben, erneut testen und pushen. Kein `continue-on-error`, Force oder `--clobber`.

## Privat herunterladen und installieren

Im angemeldeten GitHub-Konto die Release-ZIP herunterladen oder GitHub CLI verwenden:

```sh
gh release download v1.0.0 --repo Ginkgo85/Webside-to-Scene --pattern website-to-scene.zip --dir downloads/v1.0.0
```

Die ZIP enthält `module.json` im Root. In `Data/modules/website-to-scene/` entpacken und Foundry neu starten. Vor einem Update eigene geänderte Moduldateien sichern.

Das Repository und seine Releases bleiben privat. Die Manifest-/Downloadlinks enthalten keine Zugangsdaten. Eine private GitHub-Adresse ist kein anonymer Foundry-Updatekanal; die GitHub-Anmeldung des Browsers wird nicht durch Foundry verwendet. Keine öffentlichen Mirrors oder Token-URLs einrichten. Der Build wird nicht im Foundry-Paketverzeichnis registriert.

## Nachkontrolle

Actions-Lauf erfolgreich, Tag-SHA gleich geprüftem main, exakt zwei Assets und passende Version kontrollieren. Assets authentifiziert herunterladen und mit den lokal geprüften Dateien vergleichen. Das lokale `npm run test:release` prüft ZIP-Namen, CRC32, Manifest und Bytevergleich mit den Quellen.

CodeQL wird nicht ungeprüft aus dem öffentlichen Referenzrepository aktiviert: Private Code-Scanning-Nutzung benötigt laut [GitHub-Dokumentation](https://docs.github.com/en/code-security/reference/code-scanning/troubleshoot-analysis-errors/private-repository-enablement) eine passende Code-Security-Lizenz. Es ist kein erforderlicher Release-Schritt dieses privaten Repositories.
