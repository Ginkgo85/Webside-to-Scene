import { resolveWebsiteUrl } from "./url.js";

const ID = "website-to-scene";
let overlay;

class WebsiteOverlay {
  constructor(scene, url, config) {
    this.sceneId = scene.id;
    this.url = url;
    this.root = document.createElement("section");
    this.root.id = "wts-overlay";
    this.root.setAttribute("aria-label", "Webseiten-Szene");
    this.frame = document.createElement("iframe");
    this.setSceneName(scene.name);
    // No parent-document access helper, no top-navigation or privileged device permissions.
    this.frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads");
    this.frame.referrerPolicy = "no-referrer";
    this.frame.src = url;
    this.root.append(this.frame);
    document.body.append(this.root);
    this.menuToggle = document.createElement("button");
    this.menuToggle.id = "wts-menu-toggle";
    this.menuToggle.type = "button";
    this.menuToggle.addEventListener("click", () => this.setMenusHidden(!this.menusHidden));
    document.body.append(this.menuToggle);
    this.configureMenus(config);
  }

  setSceneName(name) {
    this.frame.title = "Webseite: " + name;
  }

  configureMenus(config) {
    const requestedHidden = Boolean(config.hideMenus);
    // Keep a user's temporary reveal when an unrelated scene field changes.
    if (this.requestedHidden === requestedHidden) return;
    this.requestedHidden = requestedHidden;
    this.menuToggle.hidden = !requestedHidden;
    this.setMenusHidden(requestedHidden);
  }

  setMenusHidden(hidden) {
    this.menusHidden = hidden;
    document.body.classList.toggle("wts-hide-ui", hidden);
    const label = hidden ? "Foundry-Menüs anzeigen" : "Foundry-Menüs ausblenden";
    this.menuToggle.textContent = hidden ? "☰" : "×";
    this.menuToggle.title = label;
    this.menuToggle.setAttribute("aria-label", label);
    this.menuToggle.setAttribute("aria-expanded", String(!hidden));
  }

  destroy() {
    document.body.classList.remove("wts-hide-ui");
    this.menuToggle.remove();
    this.root.remove();
  }
}

function clearOverlay() {
  overlay?.destroy();
  overlay = null;
}

function syncScene(scene = canvas.scene) {
  const config = scene?.getFlag(ID, "website");
  if (!config?.enabled) return clearOverlay();
  let url;
  try {
    url = resolveWebsiteUrl(config.url);
  } catch (error) {
    clearOverlay();
    ui.notifications.warn(`Website to Scene: ${error.message}`);
    return;
  }
  if (overlay?.sceneId === scene.id && overlay.url === url) {
    overlay.setSceneName(scene.name);
    overlay.configureMenus(config);
    return;
  }
  clearOverlay();
  overlay = new WebsiteOverlay(scene, url, config);
}

function addSceneFields(app, element) {
  if (!game.user.isGM || !app.isEditable) return;
  // Both the navigation link and the content panel have data-tab="basics".
  // Inputs must live in the panel, never inside the navigation action.
  const tab = element.querySelector('.tab[data-tab="basics"][data-group="sheet"]');
  if (!tab || tab.querySelector(".wts-config")) return;
  const scene = app.document;
  const config = scene.getFlag(ID, "website") ?? {};
  const fieldset = document.createElement("fieldset");
  fieldset.className = "wts-config";
  // Static markup only; user-provided values are assigned through DOM properties below.
  fieldset.innerHTML = `
    <legend>Website to Scene</legend>
    <div class="form-group"><label>Webseite als Szene anzeigen</label><div class="form-fields">
      <input type="checkbox" name="flags.website-to-scene.website.enabled" data-dtype="Boolean">
    </div></div>
    <div class="form-group"><label>Foundry-Menüs ausblenden</label><div class="form-fields">
      <input type="checkbox" name="flags.website-to-scene.website.hideMenus" data-dtype="Boolean">
    </div><p class="hint">Blendet die Foundry-Oberfläche in dieser Szene aus. Ein kleiner Menüknopf oben rechts zeigt sie vorübergehend wieder an.</p></div>
    <div class="form-group stacked"><label>Webseiten-Adresse</label><div class="form-fields">
      <input type="text" name="flags.website-to-scene.website.url" placeholder="https://example.org oder worlds/meine-welt/roadmap.html">
    </div><p class="hint">Adresse frei eintragen. Die Seite muss Einbettung erlauben.</p></div>
    <p class="hint">Für selbstständigen Spielerzugriff oben bei Zugänglichkeit „Alle Spieler“ und die Szenennavigation aktivieren. Speichere die Szene, bevor du sie öffnest.</p>`;
  const enabled = fieldset.querySelector('[name="flags.website-to-scene.website.enabled"]');
  const hideMenus = fieldset.querySelector('[name="flags.website-to-scene.website.hideMenus"]');
  const url = fieldset.querySelector('input[type="text"]');
  enabled.checked = Boolean(config.enabled);
  hideMenus.checked = Boolean(config.hideMenus);
  url.value = config.url ?? "";
  enabled.id = `${app.id}-wts-enabled`;
  hideMenus.id = `${app.id}-wts-hide-menus`;
  url.id = `${app.id}-wts-url`;
  const labels = fieldset.querySelectorAll(".form-group > label");
  labels[0].htmlFor = enabled.id;
  labels[1].htmlFor = hideMenus.id;
  labels[2].htmlFor = url.id;
  const validate = () => {
    url.setCustomValidity("");
    if (!enabled.checked) return;
    try { resolveWebsiteUrl(url.value); }
    catch (error) { url.setCustomValidity(error.message); }
  };
  enabled.addEventListener("change", validate);
  url.addEventListener("input", validate);
  validate();
  tab.append(fieldset);
}

Hooks.on("renderSceneConfig", addSceneFields);
Hooks.on("canvasReady", board => syncScene(board.scene));
Hooks.on("canvasTearDown", clearOverlay);
Hooks.on("updateScene", scene => {
  if (canvas.ready && scene.id === canvas.scene?.id) syncScene(scene);
});
Hooks.on("deleteScene", scene => {
  if (overlay?.sceneId === scene.id) clearOverlay();
});
Hooks.once("ready", () => {
  if (canvas.ready) syncScene();
});
