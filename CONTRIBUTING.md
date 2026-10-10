# Weiterentwicklung

Das Repository ist öffentlich. Es verwendet Node.js 24, Git und GitHub CLI. Normale Tests und Paketbau haben keine npm-Abhängigkeiten und benötigen keine Foundry-Core-Dateien. `private: true` in package.json verhindert eine versehentliche npm-Veröffentlichung; es beschränkt nicht die GitHub-Releases.

## Checkout und Git

```sh
gh auth status
gh auth setup-git
gh repo clone Ginkgo85/Webside-to-Scene
cd Webside-to-Scene
git status
git remote -v
git fetch origin
git pull --ff-only
```

Erwartet: `main` und `https://github.com/Ginkgo85/Webside-to-Scene.git`. Bei fremden Änderungen oder Konflikten nicht zurücksetzen oder überschreiben. Root-Dateien sind die Quellen; alte lokale Prototypordner sind ignoriert.

## Lokal prüfen

```sh
npm test
npm run build:release
npm run test:release
git diff --check
```

Bei UI-Änderungen zusätzlich die Browser-Tests mit Chromium und Firefox aus VALIDIERUNG.md ausführen und relevante Fälle in einer eigenen Foundry-Testwelt prüfen. Beide Browserprüfungen sind in CI und vor jedem Release verpflichtend. Den vollständigen Diff vor dem Commit prüfen.

## Version und Commits

SemVer: PATCH für kompatible Korrekturen, MINOR für neue kompatible Funktionen, MAJOR bei inkompatiblen Änderungen. Versionsquelle ist module.json; package.json, README, CHANGELOG und Download-URL gemeinsam anpassen. Keine führenden Nullen, Prerelease-/Build-Suffixe oder separat gepflegten Tags.

Vorbereitete Versionen in README und CHANGELOG als unveröffentlicht kennzeichnen. Erst bei beauftragter Veröffentlichung die Vorbereitungshinweise entfernen und den Changelog-Eintrag datieren; der Download-Link wird erst durch den geprüften Release gültig.

Conventional Commits: `feat(scene): add optional menu hiding`, `fix(config): place inputs in the content tab`, `ci(release): verify release assets`. Imperativ, kein Schlusspunkt; kurze konkrete Nachricht, bei Bedarf Body mit Was/Warum und tatsächlich ausgeführten Tests.

Nach autorisierter Entwicklung committen/pushen und CI sowie CodeQL für den exakten SHA prüfen. Tags und Releases entstehen ausschließlich im ausdrücklich gestarteten Release-Workflow. Kein Force-Push, kein Überschreiben veröffentlichter Assets. Der vorhandene Release v1.0.0 bleibt erhalten; die öffentliche Anpassung beginnt bei v1.0.1. Die deutsche und englische README-Anleitung zusammen aktuell halten und ihre Sprunglinks prüfen.

## Architektur und Dateien

- scripts/main.js: Szenenhooks, DOM-Konfiguration, iframe und lokaler Menüknopf.
- scripts/url.js: URL-Prüfung, relative Data-Pfade und HTTPS-Regel.
- lang/de.json und lang/en.json: vollständige Modulübersetzungen; über Foundrys `game.i18n.localize` laden, keine eigene Erkennung der Browser-/Betriebssystemsprache. Formatvariablen über den zweiten Parameter übergeben (Foundry 14). Beide Kataloge und die explizite Release-Dateiliste gemeinsam pflegen.
- styles/website-to-scene.css: Vollbildfläche, Menüausblendung und Rückkehrknopf.
- tests/: URL-, Release-/Workflow- und Browserprüfungen.
- tools/: Quellprüfung, reproduzierbarer ZIP-Bau, Artefaktprüfung und geschützter Release.
- .github/workflows/: CI, wiederverwendbarer CodeQL-Workflow und manuell gestarteter Release. Release wiederholt alle CI-Prüfungen und verlangt zusätzlich einen erfolgreichen CodeQL-Lauf.
- docs/images/scene-settings.png: vom Nutzer bereitgestelltes README-Bild, ebenfalls im ZIP.

Alle Szenenflags bleiben unter `flags.website-to-scene.website`: `enabled`, `url`, `hideMenus`. Unbekannte alte Felder nicht zur Migration verwenden. Der lokale Menüknopf speichert keine Änderung in Foundry.
