# Website to Scene

[Deutsch](#deutsch) · [English — jump to the English guide](#english)

**Version 1.0.2 · Foundry VTT 14.369 · Autor / Author: Ginkgo85 · MIT**

![Webseiten-Adresse und optionale Menüausblendung / Scene URL and optional menu hiding](docs/images/scene-settings.png)

## Deutsch

[Zur englischen Anleitung ↓](#english) · [Zurück nach oben ↑](#website-to-scene)

Interaktive Webseiten als randlose Vollbild-Szenen in Foundry VTT anzeigen. Die Webseiten-Adresse wird für jede Szene frei eingetragen. Foundrys Menüs können darüberliegen oder mit einem Haken ausgeblendet werden.

Das Modul ist öffentlich auf GitHub verfügbar. Die technische Modul-ID lautet `website-to-scene`; vorhandene Szeneneinstellungen bleiben erhalten. Die Veröffentlichung erfolgt vorerst ausschließlich auf GitHub.

### Installation

1. Foundrys Setup öffnen → **Zusatzmodule → Modul installieren**.
2. Diese Adresse in **Manifest-URL** einfügen und installieren:

   ```text
   https://github.com/Ginkgo85/Webside-to-Scene/releases/latest/download/module.json
   ```

3. Welt öffnen → **Module verwalten** → **Website to Scene** aktivieren.

Die Manifest-URL benötigt keine GitHub-Anmeldung. Neue Versionen lassen sich über Foundrys normale Modulaktualisierung beziehen. Die Installation per Manifest ist auch ohne Eintrag im offiziellen Modulverzeichnis möglich; siehe [Foundrys Anleitung](https://foundryvtt.com/article/modules/).

**Manuelle Alternative:** Die ZIP-Datei `website-to-scene.zip` auf GitHub herunterladen und in `Data/modules/website-to-scene/` entpacken. `module.json` muss direkt in diesem Ordner liegen. Anschließend Foundry neu starten und das Modul in der Welt aktivieren. Vor einem Update eigene geänderte Moduldateien sichern.

### Webseite als Szene anzeigen

1. Szene bearbeiten → **Grundlagen → Website to Scene**.
2. **Webseite als Szene anzeigen** aktivieren.
3. Unter **Webseiten-Adresse** eine vollständige URL wie `https://example.org/roadmap` oder einen Pfad innerhalb von Foundrys Data-Ordner wie `worlds/meine-welt/roadmap.html` eintragen.
4. Szene speichern und öffnen. Die Webseite füllt den gesamten Browserbereich, ohne eigenes Fenster oder Kopfzeile.
5. Für die ganze Runde Foundrys normale **Szenenaktivierung** verwenden. Für selbstständigen Spielerzugriff zusätzlich **Zeige in Navigation** und die Zugänglichkeit **Alle Spieler** aktivieren.

Ein zusätzlicher „Alle hierher holen“-Knopf ist nicht erforderlich. Die Webseite muss für jeden Spieler erreichbar sein. Klicks, Scrollen und Anmeldung sind individuell; die Szenenaktivierung synchronisiert keine Aktionen innerhalb der Webseite.

### Foundry-Menüs ausblenden

Der Haken **Foundry-Menüs ausblenden** gilt pro Szene für alle Benutzer, die sie öffnen. Standardmäßig ist er ausgeschaltet. Er versteckt Szenennavigation, Werkzeuge, Spielerleiste, Chat, Makroleiste und die DSA-SC-/Kalenderleisten.

**Menüknopf oben rechts:** Damit kannst du die Foundry-Oberfläche vorübergehend für dich ein- oder ausblenden.

| Knopf | Funktion |
| :---: | --- |
| <h2>☰</h2> | **Menüs anzeigen** – Blendet die Foundry-Menüs vorübergehend nur für deinen eigenen Benutzer wieder ein. |
| <h2>×</h2> | **Menüs ausblenden** – Versteckt die Foundry-Menüs wieder, damit du die Webseite ungestört nutzen kannst. |

Beim Verlassen der Szene erscheint die normale Oberfläche automatisch wieder. Bereits geöffnete Fenster und Benachrichtigungen bleiben erreichbar.

### Hinweise und Grenzen

- Die Webseite muss Einbettung im iframe erlauben. `X-Frame-Options` oder CSP `frame-ancestors` können sie blockieren.
- Bei Foundry über HTTPS muss auch die Webseite HTTPS verwenden. `localhost` bezeichnet den Rechner des jeweiligen Spielers.
- Nur vertraute Webseiten eintragen. Interaktive Skripte sind erlaubt; das Modul injiziert keine Foundry-API. Bei eigenen HTML-Dateien auf derselben Domain ist die iframe-Sandbox keine vollständige Sicherheitsgrenze.
- Foundry-Werkzeuge bearbeiten keine Tokens oder Zeichnungen innerhalb der Webseite. Für Foundry-Tastenkürzel zuerst ein Foundry-Bedienelement anklicken.
- Foundrys vollständig abgeschalteter Canvas wird nicht unterstützt. Andere Oberflächenmodule können zusätzliche Elemente einblenden.
- Getestet mit Foundry **14.369**. Andere Versionen sowie Mehrspieler- und Proxy-/HTTPS-Konfigurationen sind nicht vollständig live geprüft.
- Die Bedienelemente des Moduls sind derzeit deutsch beschriftet.

### Support und Lizenz

Fehler mit Foundry-Version und nachvollziehbaren Schritten unter [Issues](https://github.com/Ginkgo85/Webside-to-Scene/issues) melden. Keine Zugangsdaten oder privaten Weltinhalte anhängen.

Autor: **Ginkgo85**. [MIT-Lizenz](LICENSE).

[Zur englischen Anleitung ↓](#english) · [Zurück nach oben ↑](#website-to-scene)

## English

[Zur deutschen Anleitung / German guide ↑](#deutsch) · [Back to top ↑](#website-to-scene)

Display interactive websites as borderless, full-screen scenes in Foundry VTT. Enter a website address for each scene and choose whether Foundry's menus remain visible or are hidden.

The module is publicly available on GitHub. Its technical ID is `website-to-scene`; existing scene settings are preserved. Distribution currently takes place exclusively through GitHub.

### Installation

1. Open Foundry's Setup → **Add-on Modules → Install Module**.
2. Paste this address into **Manifest URL**, then install:

   ```text
   https://github.com/Ginkgo85/Webside-to-Scene/releases/latest/download/module.json
   ```

3. Open your world → **Manage Modules** → enable **Website to Scene**.

No GitHub login is required. Use Foundry's regular module updater for future versions. Installing by manifest works without an official package listing; see [Foundry's module guide](https://foundryvtt.com/article/modules/).

**Manual alternative:** Download the ZIP file `website-to-scene.zip` from GitHub and extract it into `Data/modules/website-to-scene/`. `module.json` must be directly inside that folder. Restart Foundry and enable the module in your world. Back up any personally modified module files before updating.

### Display a website as a scene

The module's controls currently use German labels; their meanings are listed below.

1. Edit a scene → **Basics → Website to Scene**.
2. Enable **Webseite als Szene anzeigen** (“Display website as a scene”).
3. Under **Webseiten-Adresse** (“Website address”), enter a full URL such as `https://example.org/roadmap` or a path inside Foundry's Data folder such as `worlds/my-world/roadmap.html`.
4. Save and view the scene. The website fills the browser viewport without a separate window or title bar.
5. Use Foundry's normal **scene activation** to show it to the group. For independent player access, also enable **Show in Navigation** and accessibility for **All Players**.

No separate “Bring everyone here” button is needed. Each player must be able to access the website. Clicking, scrolling and signing in are individual; activating the scene does not synchronize actions within the website.

### Hide Foundry's menus

**Foundry-Menüs ausblenden** (“Hide Foundry menus”) applies to everyone viewing that scene and is off by default. It hides scene navigation, tools, the player list, chat, the macro bar and the DSA-SC/calendar bars.

**Menu button in the top-right corner:** Temporarily show or hide Foundry's interface for your own client.

| Button | Function |
| :---: | --- |
| <h2>☰</h2> | **Show menus** – Temporarily restores Foundry's menus for your own client only. |
| <h2>×</h2> | **Hide menus** – Hides Foundry's menus again so you can use the website without distractions. |

Leaving the scene automatically restores the normal interface. Already open windows and notifications remain accessible.

### Notes and limitations

- The website must allow iframe embedding. `X-Frame-Options` or CSP `frame-ancestors` can block it.
- If Foundry uses HTTPS, the website must also use HTTPS. `localhost` refers to each player's own computer.
- Only embed trusted websites. Interactive scripts are allowed; the module does not inject Foundry's API. For HTML hosted on Foundry's own domain, the iframe sandbox is not a complete security boundary.
- Foundry tools cannot edit tokens or drawings inside the website. Click a Foundry control before using Foundry keyboard shortcuts.
- Completely disabling Foundry's canvas is not supported. Other interface modules may show additional elements.
- Tested with Foundry **14.369**. Other versions, multiplayer and proxy/HTTPS configurations have not been fully tested live.

### Support and license

Report bugs in [Issues](https://github.com/Ginkgo85/Webside-to-Scene/issues), including your Foundry version and steps to reproduce. Do not attach credentials or private world content.

Author: **Ginkgo85**. [MIT license](LICENSE).

[Back to the German guide ↑](#deutsch) · [Back to top ↑](#website-to-scene)
