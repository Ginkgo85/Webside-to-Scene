# Öffentliche Version auf GitHub veröffentlichen

## Ablauf

1. Gewünschte Änderungen und konsistente neue Version auf `main` pushen. **v1.0.0** ist bereits veröffentlicht und bleibt erhalten; die öffentliche Anpassung folgt als **v1.0.1**.
2. CI und CodeQL für genau diesen Commit abwarten. Bei UI-Änderungen die relevanten Live-Foundry-Fälle aus VALIDIERUNG.md prüfen.
3. GitHub → **Actions → Release → Run workflow → main**.

Der Release-Workflow ruft zuerst den wiederverwendbaren CodeQL-Workflow auf. Nur nach dessen Erfolg läuft der Release-Job (`needs: codeql`). Dieser prüft Branch und Checkout, Quellcode/Metadaten, Node-Tests, Browsertest, Paketbau und tatsächliche Artefakte. Erst danach prüft er den aktuellen Remote-main und erstellt automatisch Tag `v<version>` und einen öffentlichen Release mit genau `module.json` und `website-to-scene.zip`.

Keine Dateien oder Tags manuell anlegen. Keine persönlichen Tokens für Actions erforderlich: Der Analysejob erhält `security-events: write`; nur der Release-Job erhält `contents: write`. CI hat `contents: read`. Normale Pushes veröffentlichen keine Version. Der Ablauf übernimmt die Prüfungen des Referenzmoduls und ergänzt die Browserprüfung sowie die CodeQL-Abhängigkeit vor Veröffentlichung.

## Wiederholung nach Fehlern

- Bestehender Tag ohne Release darf nur bei genau demselben aktuellen main-SHA wiederverwendet werden.
- Abweichender oder annotierter Tag: Abbruch; niemals verschieben oder löschen.
- Bereits vorhandener Release, auch als Entwurf: Abbruch. Keine Assets überschreiben; neue Version vorbereiten.
- main wurde verändert oder API-Antwort unklar: Abbruch und neuen Lauf prüfen/starten.
- Fehlgeschlagene Prüfungen: Ursache beheben, erneut testen und pushen. Kein `continue-on-error`, Force oder `--clobber`.

## Öffentliche Installation und Updates

Stabile Manifest-URL:

```text
https://github.com/Ginkgo85/Webside-to-Scene/releases/latest/download/module.json
```

In Foundry unter **Zusatzmodule → Modul installieren → Manifest-URL** verwenden. Der Download im Manifest zeigt auf die ZIP der jeweiligen Version; die Manifest-Adresse bleibt für Updates gleich. Eine GitHub-Anmeldung oder ein Token ist nicht nötig. `package.json` bleibt `private: true`, um npm-Veröffentlichungen zu verhindern; dies hat keinen Einfluss auf GitHub oder Foundry.

Alternativ die ZIP aus dem öffentlichen Release herunterladen:

```sh
gh release download v1.0.1 --repo Ginkgo85/Webside-to-Scene --pattern website-to-scene.zip --dir downloads/v1.0.1
```

Die ZIP enthält `module.json` im Root. In `Data/modules/website-to-scene/` entpacken und Foundry neu starten. Vor einem Update eigene geänderte Moduldateien sichern. Die README enthält deutsche und englische Anleitungen mit Sprunglinks.

## Nachkontrolle

Actions-Lauf erfolgreich, Tag-SHA gleich geprüftem main, exakt zwei Assets und passende Version kontrollieren. Manifest und ZIP zusätzlich **ohne Authentifizierung** über ihre öffentlichen Downloadlinks beziehen und mit den lokal geprüften Dateien vergleichen. Das lokale `npm run test:release` prüft ZIP-Namen, CRC32, Manifest und Bytevergleich mit den Quellen. Auch `releases/latest/download/module.json` muss dieselbe aktuelle Version liefern.

CodeQL steht für das öffentliche Repository zur Verfügung und läuft bei Push, Pull Request, manuellem Start und als Voraussetzung jedes Releases. Grundlage: [GitHub CodeQL-Konfiguration](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning/configuring-advanced-setup-for-code-scanning).

## Vertriebsumfang

Der Nutzerauftrag vom 9. Oktober 2026 beschränkt die Veröffentlichung vorerst auf GitHub. Keine Einreichung oder automatische Registrierung im offiziellen Foundry-Modulverzeichnis. Die Installation per Manifest-URL funktioniert unabhängig davon; siehe [Foundrys Modulverwaltung](https://foundryvtt.com/article/modules/).
