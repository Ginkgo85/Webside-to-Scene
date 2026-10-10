/** Language-independent validation errors, translated by Foundry at the UI boundary. */
export class WebsiteUrlError extends Error {
  constructor(key) {
    super(`website-to-scene.Errors.${key}`);
    this.name = "WebsiteUrlError";
  }
}

/** Accept explicit web URLs and paths relative to Foundry's Data directory. */
export function resolveWebsiteUrl(value, base = document.baseURI) {
  const input = String(value ?? "").trim();
  if (!input) throw new WebsiteUrlError("Required");
  if (/^[\\/]{2}|\\/.test(input)) throw new WebsiteUrlError("Ambiguous");
  let url;
  try { url = new URL(input, base); }
  catch { throw new WebsiteUrlError("InvalidUrl"); }
  if (!["https:", "http:"].includes(url.protocol)) throw new WebsiteUrlError("Protocol");
  if (url.username || url.password) throw new WebsiteUrlError("Credentials");
  if (new URL(base).protocol === "https:" && url.protocol === "http:") {
    throw new WebsiteUrlError("MixedContent");
  }
  return url.href;
}
