/** Accept explicit web URLs and paths relative to Foundry's Data directory. */
export function resolveWebsiteUrl(value, base = document.baseURI) {
  const input = String(value ?? "").trim();
  if (!input) throw new Error("Bitte eine Webseiten-Adresse eintragen.");
  if (/^[\\/]{2}|\\/.test(input)) throw new Error("Bitte eine vollständige https://-Adresse oder einen relativen Foundry-Pfad verwenden.");
  const url = new URL(input, base);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Nur HTTP(S)-Adressen oder relative Foundry-Pfade sind erlaubt.");
  if (url.username || url.password) throw new Error("Bitte keine Zugangsdaten in der Adresse angeben.");
  if (new URL(base).protocol === "https:" && url.protocol === "http:") {
    throw new Error("Foundry läuft über HTTPS. Bitte auch für die Webseite HTTPS verwenden.");
  }
  return url.href;
}
