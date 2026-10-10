# Öffentliche Version auf GitHub und bei Foundry veröffentlichen

## Ablauf

1. Gewünschte Änderungen und konsistente neue Version auf `main` pushen. **v1.0.0**, **v1.0.1** und **v1.0.2** sind veröffentlicht und bleiben erhalten; **1.1.0** ist vorbereitet. Bei beauftragter Veröffentlichung die Vorbereitungshinweise in README entfernen und den Changelog-Eintrag datieren.
2. CI und CodeQL für genau diesen Commit abwarten. Bei UI-Änderungen die relevanten Live-Foundry-Fälle aus VALIDIERUNG.md prüfen.
3. GitHub → **Actions → Release → Run workflow → main**, Modus **release**.

Der Release-Workflow ruft zuerst den wiederverwendbaren CodeQL-Workflow auf. Nur nach dessen Erfolg läuft der Release-Job (`needs: codeql`). Dieser prüft Branch, Modus und Checkout, Quellcode/Metadaten, Node-Tests, den vollständigen Browsertest in Chromium und Firefox, Paketbau und tatsächliche Artefakte. Anschließend validiert die Foundry-API den geplanten Eintrag ohne Speicherung (`dry-run`). Erst danach prüft der Ablauf den aktuellen Remote-main und erstellt automatisch Tag `v<version>` und einen öffentlichen Release mit genau `module.json` und `website-to-scene.zip`.

Nach GitHub-Veröffentlichung prüft `tools/foundry-release.mjs --publish` den Tag-SHA und öffentlichen Release, lädt beide Assets anonym herunter und vergleicht sie bytegenau mit dem lokal geprüften Build. Erst danach legt die offizielle Foundry Release API den Versionseintrag mit festem Manifest-Link, Release-Notizen und Kompatibilität aus module.json an. Ein HTTP-Erfolg allein genügt nicht; die bestätigte API-Antwort wird geprüft. Rohantworten und Token werden nicht protokolliert.

Keine Dateien oder Tags manuell anlegen. Für GitHub ist kein persönlicher Token erforderlich: Der Analysejob erhält `security-events: write`; nur der Release-Job erhält `contents: write`. CI und der nachgelagerte Foundry-Job haben `contents: read`. Normale Pushes veröffentlichen keine Version. Der Ablauf übernimmt die Prüfungen des Referenzmoduls und ergänzt die Browserprüfung sowie die CodeQL-Abhängigkeit vor Veröffentlichung.

## Einmalige Einrichtung und Prüfmodus

Der Nutzer hat am 10. Oktober 2026 die automatische Foundry-Eintragung und das Repository-Secret **FOUNDRY_RELEASE_TOKEN** ausdrücklich beauftragt. Den vorhandenen **Package Release Token** aus der Foundry-Bearbeitungsseite ausschließlich als verschlüsseltes Actions-Secret in **Ginkgo85/Webside-to-Scene** hinterlegen. Keine Datei, Variable, Ausgabe, Screenshot oder Downloadadresse darf den Wert enthalten. Ein erneutes Token-Erzeugen ist hierfür nicht notwendig.

Vor der ersten Veröffentlichung **Release → Run workflow → main → check-foundry** ausführen. Dieser Modus durchläuft CodeQL und sämtliche bisherigen Prüfungen, ruft Foundry mit `dry-run: true` auf und erzeugt weder Tag noch Release noch Versionseintrag. Es muss eine noch nicht bei Foundry vorhandene Version vorbereitet sein; doppelte Versionsnummern werden auch im Prüfmodus abgelehnt.

Die API-Schritte bekommen das Secret nur als Umgebungsvariable. Andere Schritte, CI und CodeQL erhalten es nicht. Kein zusätzlicher Dienst oder kostenpflichtiger Runner wird verwendet. Offizielle API-Dokumentation: [Package Release API](https://foundryvtt.com/article/package-release-api/). Foundry kann bei echten Einträgen zusätzlich selbst eine Release-Meldung in seinem Discord ausgeben.

## Wiederholung nach Fehlern

- Bestehender Tag ohne Release darf nur bei genau demselben aktuellen main-SHA wiederverwendet werden.
- Abweichender oder annotierter Tag: Abbruch; niemals verschieben oder löschen.
- Bereits vorhandener Release, auch als Entwurf: Abbruch. Keine Assets überschreiben; neue Version vorbereiten.
- main wurde verändert oder API-Antwort unklar: Abbruch und neuen Lauf prüfen/starten.
- Fehlgeschlagene Prüfungen: Ursache beheben, erneut testen und pushen. Kein `continue-on-error`, Force oder `--clobber`.
- GitHub-Release erstellt, Foundry fehlgeschlagen: GitHub-Assets bleiben erhalten. Modus **retry-foundry** wiederholt CodeQL, Node-/Browser-/Paketprüfungen und die öffentlichen Bytevergleiche, erstellt aber keinen GitHub-Tag/Release. Der Checkout muss exakt dem veröffentlichten Tag entsprechen. Bei unverändertem main kann der Workflow so neu gestartet werden. Ist main inzwischen weiter, nur den fehlgeschlagenen **foundry**-Job im ursprünglichen Lauf erneut ausführen: Er verwendet denselben bereits vollständig geprüften SHA, baut/verifiziert das Paket erneut und wiederholt die öffentlichen Bytevergleiche. Bei unklarer API-Antwort zuerst die Foundry-Modulseite auf einen bereits gespeicherten Eintrag prüfen. Keine automatischen POST-Wiederholungen und keine Überschreibung vorhandener Versionen.

## Öffentliche Installation und Updates

Stabile Manifest-URL:

```text
https://github.com/Ginkgo85/Webside-to-Scene/releases/latest/download/module.json
```

In Foundry unter **Zusatzmodule → Modul installieren → Manifest-URL** verwenden. Der Download im Manifest zeigt auf die ZIP der jeweiligen Version; die Manifest-Adresse bleibt für Updates gleich. Eine GitHub-Anmeldung oder ein Token ist nicht nötig. `package.json` bleibt `private: true`, um npm-Veröffentlichungen zu verhindern; dies hat keinen Einfluss auf GitHub oder Foundry.

Alternativ die ZIP aus dem öffentlichen Release herunterladen:

```sh
gh release download v1.0.2 --repo Ginkgo85/Webside-to-Scene --pattern website-to-scene.zip --dir downloads/v1.0.2
```

Die ZIP enthält `module.json` im Root. In `Data/modules/website-to-scene/` entpacken und Foundry neu starten. Vor einem Update eigene geänderte Moduldateien sichern. Die README enthält deutsche und englische Anleitungen mit Sprunglinks.

## Nachkontrolle

Actions-Lauf erfolgreich, Tag-SHA gleich geprüftem main, exakt zwei Assets und passende Version kontrollieren. Manifest und ZIP zusätzlich **ohne Authentifizierung** über ihre öffentlichen Downloadlinks beziehen und mit den lokal geprüften Dateien vergleichen. Das lokale `npm run test:release` prüft ZIP-Namen, CRC32, Manifest und Bytevergleich mit den Quellen. Auch `releases/latest/download/module.json` muss dieselbe aktuelle Version liefern.

CodeQL steht für das öffentliche Repository zur Verfügung und läuft bei Push, Pull Request, manuellem Start und als Voraussetzung jedes Releases. Grundlage: [GitHub CodeQL-Konfiguration](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning/configuring-advanced-setup-for-code-scanning).

## Vertriebsumfang

Der Nutzer hat am 9. Oktober 2026 zusätzlich die Einreichung im offiziellen Foundry-Modulverzeichnis beauftragt und die Lizenzbestätigungen selbst vorgenommen. Paket `website-to-scene` und Version **1.0.2** sind in der Foundry-Paketverwaltung gespeichert. Kategorien: **External Integrations** und **Tools and Controls**; keine verpflichtende Bindung an ein Spielsystem.

Die öffentliche Freischaltung wurde am 10. Oktober 2026 anhand der anonym erreichbaren [Modulseite](https://foundryvtt.com/packages/website-to-scene) bestätigt. Die README beschreibt die Installation über Foundrys Modulsuche und die Manifest-URL als Alternative.

Foundry verweist auf die bestehenden GitHub-Dateien. Der Versionseintrag verwendet `https://github.com/Ginkgo85/Webside-to-Scene/releases/download/v1.0.2/module.json`, die Release-Notizen `https://github.com/Ginkgo85/Webside-to-Scene/releases/tag/v1.0.2` und dieselbe Kompatibilität wie module.json: Minimum/Verified **14.369**, Maximum **14**. Den festen Manifest-Link pro Version verwenden; nicht `releases/latest` in den Foundry-Versionseintrag übernehmen.

Künftige Versionen erst nach den bisherigen Quell-, Node-, Browser-, CodeQL- und Paketprüfungen sowie verifiziertem GitHub-Release bei Foundry eintragen. Der erweiterte Release-Workflow übernimmt dies automatisch, sobald das autorisierte Secret hinterlegt ist. Bestehende Foundry-Einträge werden nicht überschrieben. Die Einrichtung ist kein Auftrag, die vorbereitete Version 1.1.0 jetzt zu veröffentlichen.
