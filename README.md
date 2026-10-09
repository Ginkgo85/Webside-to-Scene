# Website to Scene

**Version 1.0.0 · Foundry VTT 14.369 · Autor: Ginkgo85**

Interaktive Webseiten als Vollbild-Szenen in Foundry VTT anzeigen. Die Webseiten-Adresse wird für jede Szene manuell eingetragen. Foundrys Menüs können darüberliegen oder über einen Haken ausgeblendet werden.

Dieses Repository `Ginkgo85/Webside-to-Scene` bleibt privat und dient der eigenen Nutzung. Die technische Modul-ID lautet weiterhin `website-to-scene`, damit vorhandene Installationen und Szeneneinstellungen erhalten bleiben.

![Webseiten-Adresse und optionale Menüausblendung in der Szenenkonfiguration](docs/images/scene-settings.png)

## Einrichtung in Foundry

1. Im angemeldeten GitHub-Konto unter **Releases** die Datei `website-to-scene.zip` herunterladen. Falls noch kein Release existiert, zuerst den unten beschriebenen Release-Workflow starten.
2. ZIP in den Benutzerdatenordner unter `Data/modules/website-to-scene/` entpacken. `module.json` liegt direkt im ZIP-Root; nach dem Entpacken muss `Data/modules/website-to-scene/module.json` existieren.
3. Foundry neu starten, Welt öffnen und unter **Module verwalten** das Modul **Website to Scene** aktivieren.
4. Szene bearbeiten → **Grundlagen → Website to Scene**. **Webseite als Szene anzeigen** anhaken, die Adresse eintragen und speichern.
5. Die Szene öffnen. Zum Anzeigen für alle Spieler Foundrys normale Szenenaktivierung verwenden. Für selbstständigen Spielerzugriff **Zeige in Navigation** und die Berechtigung **Alle Spieler** aktivieren.

Eine vollständige URL wie `https://example.org/roadmap` oder ein Pfad innerhalb von Foundrys Data-Ordner wie `worlds/meine-welt/roadmap.html` ist möglich. Die Webseite füllt die ganze Szenenfläche, ohne eigenen Fensterrand oder Kopfzeile.

## Foundry-Menüs ausblenden

Der Haken **Foundry-Menüs ausblenden** gilt pro Szene für alle Benutzer, die sie öffnen. Standardmäßig ist er ausgeschaltet. Er versteckt Szenennavigation, Werkzeuge, Spielerleiste, Chat, Makroleiste und die DSA-SC-/Kalenderleisten.

Ein kleiner **☰**-Knopf oben rechts zeigt die Menüs vorübergehend nur für den eigenen Benutzer wieder an. Derselbe Knopf blendet sie wieder aus. Beim Verlassen der Szene erscheint die normale Oberfläche automatisch wieder. Bereits geöffnete Fenster und Benachrichtigungen bleiben erreichbar.

## Private Releases und Updates

Die GitHub-Automation erzeugt private Releases mit ZIP und Manifest. Die Downloadlinks erfordern Zugriff auf das private Repository. Foundrys normale Paketverwaltung übernimmt keine GitHub-Anmeldung aus deinem Browser; daher die ZIP angemeldet herunterladen und lokal installieren beziehungsweise aktualisieren. Keine Zugangsdaten in Manifest-URLs eintragen.

- [Releases](https://github.com/Ginkgo85/Webside-to-Scene/releases)
- [Release-Workflow](https://github.com/Ginkgo85/Webside-to-Scene/actions/workflows/release.yml)
- Manifest: https://github.com/Ginkgo85/Webside-to-Scene/releases/latest/download/module.json
- ZIP 1.0.0: https://github.com/Ginkgo85/Webside-to-Scene/releases/download/v1.0.0/website-to-scene.zip

## Grenzen der Einbettung

- Die Webseite muss die Anzeige im iframe erlauben. `X-Frame-Options` oder CSP `frame-ancestors` können sie blockieren. Das Modul hebt diese Sperren nicht auf.
- Bei Foundry über HTTPS muss auch die Webseite HTTPS verwenden. Die Adresse muss für jeden Spieler erreichbar sein; `localhost` bezeichnet dessen eigenen Rechner.
- Klicks, Scrollen und Anmeldung sind individuell. Nur eine eigene Synchronisierung der Webseite kann diese Aktionen teilen.
- Nur vertraute Webseiten eintragen. Interaktive Skripte sind erlaubt; das Modul injiziert keine Foundry-API. Bei eigenen HTML-Dateien auf derselben Domain bietet die iframe-Sandbox keine vollständige Sicherheitsgrenze.
- Der Inhalt wird von der Webseite selbst skaliert. Foundry-Werkzeuge bearbeiten keine Tokens oder Zeichnungen innerhalb der Webseite. Für Foundry-Tastenkürzel zuerst ein Foundry-Bedienelement anklicken.
- Foundrys vollständig abgeschalteter Canvas wird nicht unterstützt. Fremde Oberflächenmodule können zusätzlich eigene Elemente einblenden.

## Entwicklung und Veröffentlichung

Node.js 24 verwenden. Tests und Paketbau benötigen keine Foundry-Installation und keine Paketinstallation:

```sh
npm test
npm run build:release
npm run test:release
```

CI prüft bei Push und Pull Request auf `main` zusätzlich die Bedienung im Chromium-Browser. **Actions → Release → Run workflow → main** führt dieselben Prüfungen aus und erstellt danach automatisch `v<version>` sowie die beiden Release-Dateien. Normale Pushes veröffentlichen keinen Release.

Weitere Informationen im Repository: [Entwicklung](https://github.com/Ginkgo85/Webside-to-Scene/blob/main/CONTRIBUTING.md), [Veröffentlichung](https://github.com/Ginkgo85/Webside-to-Scene/blob/main/PUBLISHING.md), [Validierung](https://github.com/Ginkgo85/Webside-to-Scene/blob/main/VALIDIERUNG.md), [Agentenregeln](https://github.com/Ginkgo85/Webside-to-Scene/blob/main/AGENTS.md).

## Lizenz

Autor: **Ginkgo85**. Die bereits im Repository enthaltene [MIT-Lizenz](LICENSE) gilt weiter. Das Repository wird dadurch nicht öffentlich.
