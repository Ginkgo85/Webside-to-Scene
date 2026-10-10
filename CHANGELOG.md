# Changelog

## 1.1.0 – unveröffentlicht

- Deutsche und englische Modultexte folgen automatisch Foundrys eingestellter Sprache; andere Sprachen verwenden Foundrys englischen Rückfall.
- Szenenbeschriftungen, Hilfetexte, Platzhalter, URL-Fehlermeldungen und Menüknopf-/Barrierefreiheitstexte übersetzt. Webseiteninhalt und gespeicherte Szenenflags bleiben erhalten.
- Sprachdateien im Manifest und Release-ZIP enthalten; beide Sprachen sowie englischer Rückfall werden in Chromium und Firefox simuliert geprüft.
- README um Sprachverhalten ergänzt und englische Anleitung auf die englischen Bedienelemente umgestellt.

## 1.0.2 – 2026-10-09

- Verbliebene Links zur Release-Seite aus der deutschen und englischen README entfernt. Installation über die Manifest-Adresse bleibt beschrieben.
- README enthält keine private Release-Überschrift, Entwicklungsbefehle, Workflow- oder weiterführenden Dokumentationslinks.

## 1.0.1 – 2026-10-09

- Öffentliche GitHub-Veröffentlichung mit direkter Installation und Updates über die Manifest-URL.
- Deutsche und englische README-Anleitung mit Sprachwechsel- und Rücksprunglinks sowie aktualisiertem Szenenbild aus der letzten Nutzeraufnahme.
- README auf Nutzung, Support und Lizenz beschränkt; Entwicklungsbefehle und Release-Abläufe stehen in den separaten Projektdokumenten.
- Öffentliche Modulbeschreibung und Entwicklungs-/Release-Dokumentation angepasst.
- CodeQL aus dem Referenzablauf ergänzt; jeder Release verlangt einen erfolgreichen Sicherheitscheck sowie die bisherigen Tests und Paketprüfungen.
- Browser-Testserver liefert ausschließlich drei fest definierte Testdateien; keine Dateipfade aus HTTP-Anfragen.
- Veröffentlichung ausschließlich auf GitHub; Modul-ID, Szenenflags und Laufzeitverhalten bleiben erhalten. Bestehender Release v1.0.0 wird nicht verändert.

## 1.0.0 – 2026-10-09

- Erste finale Version für Foundry VTT 14.369, Autor Ginkgo85.
- Frei eintragbare Webseiten-Adresse pro Szene und randlose Vollbilddarstellung.
- Option zum Ausblenden der Foundry-Menüs, lokaler Rückkehrknopf und automatische Wiederherstellung beim Szenenwechsel.
- Vorhandene Modul-ID und gespeicherte Szenenflags bleiben erhalten.
- Privates GitHub-Repository mit CI, manuellem Release-Start, automatischem Tag/ZIP/Manifest und Schutz bestehender Veröffentlichungen.
- Tests, reproduzierbarer Paketbau, Prüfsummen- und Quellenvergleich sowie Dokumentation zur weiteren Entwicklung.

## 0.1.3 – 2026-10-09

- Szenenoption zum Ausblenden der Menüs, einschließlich DSA-Leisten; temporäres Einblenden und Wiederherstellung beim Verlassen.

## 0.1.2 – 2026-10-09

- Vollbild-Szenenfläche ohne eigenen Rahmen oder Kopfzeile; zusätzlicher Aktivierungsbutton entfernt.

## 0.1.1 – 2026-10-09

- Eingabefelder in den tatsächlichen Grundlagen-Formularbereich statt in den Reitertitel verschoben.

## 0.1.0 – 2026-10-09

- Erster lokaler Prototyp zur Einbettung von Webseiten in Foundry-Szenen.
