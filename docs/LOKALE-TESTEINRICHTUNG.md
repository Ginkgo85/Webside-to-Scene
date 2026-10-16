# Lokale Testeinrichtung unter Windows wiederherstellen

Diese Anleitung gilt für PowerShell im Projektordner. Sie richtet die Entwicklungswerkzeuge ein; das Foundry-Modul selbst benötigt weder Node.js noch Playwright. Die Projektregeln im Repository-Root und der Testumfang in [VALIDIERUNG.md](../VALIDIERUNG.md) bleiben maßgeblich.

## 1. Node.js, npm, Git und GitHub CLI

Node.js **24 mit npm** über die [offizielle Node.js-Downloadseite](https://nodejs.org/en/download) installieren und den Installationsordner in den Benutzer-Suchpfad aufnehmen lassen. npm gehört zur regulären Node.js-Installation; eine mit einer App gebündelte Node-Laufzeit enthält nicht zwingend einen direkt aufrufbaren npm-Befehl. Siehe auch [npm: Node.js und npm installieren](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/).

Git und GitHub CLI müssen ebenfalls installiert und im Suchpfad erreichbar sein. Nach einer Installation bereits geöffnete Terminals und die App neu starten. Dann prüfen:

```powershell
Get-Command node, npm, npx, git, gh
node --version
npm --version
npx --version
gh auth status
```

Eine scheinbar ungültige GitHub-Anmeldung zuerst in einem normalen Terminal mit Netzwerkzugriff gegenprüfen. Am 16. Oktober 2026 lag die Fehlermeldung an der eingeschränkten Ausführungsumgebung; die gespeicherte Anmeldung war gültig. Nur bei tatsächlich fehlender oder ungültiger Anmeldung erneut anmelden:

```powershell
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
```

## 2. Projekt und lokale Git-Einstellungen

Falls noch keine lokale Kopie existiert, im gewünschten übergeordneten Ordner ausführen:

```powershell
gh repo clone Ginkgo85/Webside-to-Scene
Set-Location Webside-to-Scene
```

Bei einer vorhandenen Kopie direkt deren Projektordner öffnen. Branch `main`, Remote und Änderungen prüfen; den Abgleich gemäß [CONTRIBUTING.md](../CONTRIBUTING.md) vornehmen. Einen sauberen `main` ausschließlich mit `git pull --ff-only` aktualisieren. Vorhandene Änderungen nicht zurücksetzen.

Die Commit-Vorlage ist versioniert, ihre Git-Zuordnung dagegen lokal:

```powershell
git status --short --branch
git remote -v
git config --get user.name
git config --get user.email
git config --local commit.template .gitmessage
```

Falls Name oder E-Mail fehlen, vor einem Commit die eigene GitHub-Identität konfigurieren. `AGENTS.md`, `.gitmessage`, `.gitattributes` und `.editorconfig` kommen mit dem Repository zurück; Git-Zugangsdaten und lokale Git-Einstellungen werden durch Klonen nicht übernommen.

## 3. Playwright und Testbrowser installieren

Im Projektordner die **festgelegte Version 1.62.1** installieren:

```powershell
npm install --no-save --package-lock=false --ignore-scripts playwright@1.62.1
```

Damit liegt Playwright unter dem ignorierten `node_modules/`. `package.json` und die Laufzeitabhängigkeiten des Moduls bleiben unverändert; es entsteht keine `package-lock.json`. Nach Verlust von `node_modules/` diesen Schritt wiederholen. Eine globale Playwright-Installation und `PLAYWRIGHT_PATH` sind für diese Einrichtung nicht erforderlich. Einen eventuell vorhandenen alten `PLAYWRIGHT_PATH`-Verweis prüfen, da er die lokale Installation übersteuert.

Für die hier erprobte Einrichtung den Browsercache dauerhaft als Benutzereinstellung speichern. Ein bereits gespeicherter Wert wird beibehalten; falls er zu einer früheren Installation gehört, vor dem Fortfahren prüfen und gegebenenfalls über Windows' Benutzer-Umgebungsvariablen korrigieren.

```powershell
$testBrowserCache = [Environment]::GetEnvironmentVariable('PLAYWRIGHT_BROWSERS_PATH', 'User')
if ([string]::IsNullOrWhiteSpace($testBrowserCache)) {
  $testBrowserCache = Join-Path $env:USERPROFILE '.cache\ms-playwright'
  [Environment]::SetEnvironmentVariable('PLAYWRIGHT_BROWSERS_PATH', $testBrowserCache, 'User')
}
$env:PLAYWRIGHT_BROWSERS_PATH = $testBrowserCache
npx --no-install playwright install chromium firefox
```

Die einmalige Zuweisung an `$env:` macht die gespeicherte Einstellung sofort für dieses Terminal nutzbar. Danach Terminals und die App vollständig neu starten. Neue Prozesse übernehmen den Cache automatisch; bei späteren Testaufrufen sind keine Pfadangaben nötig. Die Benutzereinstellung gilt auch für andere Playwright-Projekte desselben Windows-Benutzers. Der Pfad wird aus dem Benutzerprofil abgeleitet und gehört nicht in den Modulcode oder die CI.

Ohne diese Einstellung verwendet Playwright unter Windows normalerweise `%LOCALAPPDATA%\ms-playwright`. Am 16. Oktober 2026 meldete Firefox dort einen Windows-Side-by-Side-Fehler zu `mozglue`. Dieselben Browserdateien bestanden im alternativen Cache sämtliche Tests. Die genaue Windows-Ursache wurde nicht abschließend geklärt; der alternative Cache ist die hier geprüfte lokale Lösung. Browser stets passend zur installierten Playwright-Version beziehen; siehe [Playwright: Browserdateien und Cache](https://playwright.dev/docs/browsers#managing-browser-binaries).

## 4. Nach einem Neustart prüfen

Die folgende Gleichheitsprüfung muss `True` liefern; der Cachewert muss gefüllt sein:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH
$env:PLAYWRIGHT_BROWSERS_PATH -eq [Environment]::GetEnvironmentVariable('PLAYWRIGHT_BROWSERS_PATH', 'User')
npx --no-install playwright --version
```

Dann die normalen Projektbefehle ausführen. Die Browserauswahl ist lediglich ein Name, keine Pfadangabe. Beide Browser müssen erfolgreich sein:

```powershell
npm test
Remove-Item Env:TEST_BROWSER -ErrorAction SilentlyContinue
npm run test:browser
try {
  $env:TEST_BROWSER = 'firefox'
  npm run test:browser
} finally {
  Remove-Item Env:TEST_BROWSER -ErrorAction SilentlyContinue
}
npm run build:release
npm run test:release
git diff --check
git status --short --branch
```

Die Browser prüfen jeweils Deutsch, Englisch und den englischen Rückfall für `fr`. Das sind Simulationen mit künstlichen Webseiten und Foundry-Hooks; Live-Foundry- oder Mehrspielertests folgen daraus nicht. `build:release` erzeugt nur lokale Dateien unter `release/`. Keiner dieser Befehle startet den Release-Workflow oder legt eine Foundry-Version an.

## 5. Typische Fehler

| Meldung | Nächster Schritt |
| --- | --- |
| `npm` oder `npx` nicht gefunden | Node.js einschließlich npm und den Suchpfad prüfen; Terminal/App neu starten. |
| PowerShell blockiert `npm.ps1` | Den entsprechenden Aufruf mit `npm.cmd` beziehungsweise `npx.cmd` ausführen; keine Sicherheitsrichtlinie pauschal abschalten. |
| Playwright-Modul nicht gefunden | Schritt 3 im richtigen Projektordner wiederholen. |
| Browserdatei fehlt | Gespeicherten und geerbten Cachewert vergleichen; `npx --no-install playwright install chromium firefox` mit derselben Einstellung erneut ausführen. |
| `EACCES` beim Zugriff auf `127.0.0.1` | Die lokale Testseite wird von der Ausführungsumgebung blockiert. In einem normalen Terminal oder mit gezielt freigegebenem lokalem Zugriff prüfen; die Tests nicht abschwächen. |
| Firefox startet mit Side-by-Side-Fehler nicht | Den alternativen Cache aus Schritt 3 prüfen. Keine DLLs aus unbekannten Quellen ergänzen und keinen persönlichen Firefox verändern. |

## 6. Was separat gesichert werden muss

`node_modules/`, der Browsercache und `release/` sind erneut erzeugbar. Historische Backups, manuelle Testprotokolle, Screenshots und Prototypen unter `artifacts/` und `website-to-scene/` liegen dagegen nicht auf GitHub; benötigte Exemplare vor einer Neuinstallation separat sichern. Das gilt auch für eigene ignorierte Editor-/Agent-Einstellungen. Ein Klon stellt diese Inhalte nicht wieder her.

Solange diese Anleitung nur lokal gespeichert ist, auch sie beziehungsweise das vollständige lokale Repository einschließlich `.git` separat sichern. Die Dokumentation wird durch ihre Erstellung nicht automatisch auf GitHub übertragen.

Für normale Tests werden keine Release-Tokens und keine Foundry-Core- oder Weltdateien benötigt. `FOUNDRY_RELEASE_TOKEN` liegt als GitHub-Repository-Secret vor und muss nicht lokal wiederhergestellt werden. Die CLI-Anmeldung erfolgt über den Windows-Anmeldespeicher beziehungsweise die erneute Browseranmeldung.

## Geprüfter Stand am 16. Oktober 2026

Nach einem App-Neustart ohne manuelle Pfadzuweisungen bestätigt: Node.js **24.19.0**, npm **11.17.0**, Playwright **1.62.1**, Chromium **151.0.7922.34** und Firefox **153.0**. `npm test` bestand mit **38 Tests**; beide Browser bestanden alle drei Sprachvarianten. Paketbau und Paketprüfung bestanden bei der Einrichtung ebenfalls. Es wurde kein neuer Live-Foundry-Test und keine Veröffentlichung durchgeführt.
