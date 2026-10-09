# Weiterentwicklung

Das Repository bleibt privat. Es verwendet Node.js 24, Git und GitHub CLI. Normale Tests und Paketbau haben keine npm-Abhängigkeiten und benötigen keine Foundry-Core-Dateien.

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

Bei UI-Änderungen zusätzlich den Browser-Test aus VALIDIERUNG.md ausführen und relevante Fälle in einer eigenen Foundry-Testwelt prüfen. Den vollständigen Diff vor dem Commit prüfen.

## Version und Commits

SemVer: PATCH für kompatible Korrekturen, MINOR für neue kompatible Funktionen, MAJOR bei inkompatiblen Änderungen. Versionsquelle ist module.json; package.json, README, CHANGELOG und Download-URL gemeinsam anpassen. Keine führenden Nullen, Prerelease-/Build-Suffixe oder separat gepflegten Tags.

Conventional Commits: `feat(scene): add optional menu hiding`, `fix(config): place inputs in the content tab`, `ci(release): verify private release assets`. Imperativ, kein Schlusspunkt; kurze konkrete Nachricht, bei Bedarf Body mit Was/Warum und tatsächlich ausgeführten Tests.

Nach autorisierter Entwicklung committen/pushen und CI für den exakten SHA prüfen. Tags und Releases entstehen ausschließlich im ausdrücklich gestarteten Release-Workflow. Kein Force-Push, kein Überschreiben veröffentlichter Assets.

## Architektur und Dateien

- scripts/main.js: Szenenhooks, DOM-Konfiguration, iframe und lokaler Menüknopf.
- scripts/url.js: URL-Prüfung, relative Data-Pfade und HTTPS-Regel.
- styles/website-to-scene.css: Vollbildfläche, Menüausblendung und Rückkehrknopf.
- tests/: URL-, Release-/Workflow- und Browserprüfungen.
- tools/: Quellprüfung, reproduzierbarer ZIP-Bau, Artefaktprüfung und geschützter Release.
- .github/workflows/: CI und manuell gestarteter Release, jeweils mit denselben Prüfungen.
- docs/images/scene-settings.png: vom Nutzer bereitgestelltes README-Bild, ebenfalls im ZIP.

Alle Szenenflags bleiben unter `flags.website-to-scene.website`: `enabled`, `url`, `hideMenus`. Unbekannte alte Felder nicht zur Migration verwenden. Der lokale Menüknopf speichert keine Änderung in Foundry.
