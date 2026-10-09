import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

// Use a locally available Playwright without adding runtime dependencies to the module.
const library = process.env.PLAYWRIGHT_PATH;
const { chromium, firefox } = await import(library ? pathToFileURL(library).href : "playwright");
const browserName = process.env.TEST_BROWSER || "chromium";
if (!["chromium", "firefox", "chrome", "msedge"].includes(browserName)) {
  throw new Error("TEST_BROWSER must be chromium, firefox, chrome or msedge");
}
const browserType = browserName === "firefox" ? firefox : chromium;
const channel = ["chrome", "msedge"].includes(browserName) ? browserName : undefined;
const fixture = `<!doctype html><html><head><link rel="stylesheet" href="/styles/website-to-scene.css">
<style>
html,body { margin:0; width:100%; height:100%; font:14px sans-serif; --z-index-canvas:0; }
#board {position:absolute;inset:0;background:#846440} #interface {position:relative;height:100%;pointer-events:none;}
#interface button {pointer-events:auto} #interface section {position:absolute;z-index:100;pointer-events:none}
#ui-left {left:0;top:0;height:100%} #scene-controls {position:absolute;left:16px;top:16px;width:72px;height:300px}
#scene-navigation {position:absolute;left:104px;top:16px;width:200px;height:100px}
#players {position:absolute;left:16px;bottom:16px;width:72px;height:100px}
#ui-right {right:0;top:0;height:100%} #sidebar {width:300px;height:100%;background:#303540;color:white;pointer-events:auto}
#ui-middle {inset:0;pointer-events:none} #hotbar {position:absolute;bottom:16px;left:400px;width:400px;height:52px}
button {padding:8px} #config {position:absolute;inset:80px 350px auto 340px;z-index:200;background:white;padding:12px}
.form-fields {margin:6px 0} .form-group label {display:block} fieldset {padding:15px} .hint {font-size:12px}
</style></head><body>
<div id="board"></div><div id="interface"><section id="ui-left"><div id="scene-controls"><button>Werkzeuge</button></div><div id="scene-navigation"><button>Roadmap</button><button>Karte</button></div><div id="players"><button>Spieler</button></div></section><section id="ui-middle"><div id="ui-top"></div><div id="ui-bottom"><div id="hotbar"><button>Makros</button></div></div></section><section id="ui-right"><div id="sidebar"><button id="chat">Chat</button></div></section></div>
<script>
const hooks = new Map();
globalThis.Hooks = { on(name,fn) { if(!hooks.has(name)) hooks.set(name,[]); hooks.get(name).push(fn); }, once(name,fn) {this.on(name,fn)}, call(name,...args) {for (const fn of hooks.get(name)||[]) fn(...args)} };
globalThis.calls = []; globalThis.messages = [];
globalThis.scene = {id:'roadmap',name:'Roadmap',config:{enabled:true,url:'/embedded'},getFlag(){return this.config}, async activate(options){calls.push(options)}};
globalThis.game = {user:{isGM:true},scenes:new Map([['roadmap',scene]])};
globalThis.canvas = {ready:true,scene};
globalThis.ui = {notifications:{warn:m=>messages.push(m),error:m=>messages.push(m),info:m=>messages.push(m)}};
document.querySelector('#chat').onclick=()=>calls.push('chat');
</script><script type="module">import "/scripts/main.js"; globalThis.moduleLoaded = true;</script></body></html>`;
// Serve only fixture assets loaded from fixed paths, never a request-derived filesystem path.
const assets = new Map(await Promise.all([
  "scripts/main.js", "scripts/url.js", "styles/website-to-scene.css"
].map(async file => ["/" + file, {
  type: file.endsWith(".js") ? "text/javascript" : "text/css",
  data: await readFile(new URL("../" + file, import.meta.url))
}])));
const server = createServer(async (req, res) => {
  try {
    if (req.url === "/") { res.setHeader("Content-Type", "text/html; charset=utf-8"); return res.end(fixture); }
    if (req.url === "/embedded") { res.setHeader("Content-Type", "text/html; charset=utf-8"); return res.end('<h1 style="margin-left:400px">Interaktive Roadmap</h1><button style="margin:150px 0 0 400px" onclick="this.textContent=\'Angeklickt\'">Eintrag öffnen</button>'); }
    const asset = assets.get(req.url);
    if (!asset) {res.writeHead(404);return res.end();}
    res.setHeader("Content-Type", asset.type);
    res.end(asset.data);
  } catch {res.writeHead(404);res.end();}
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  for (const route of ["/module.json", "/scripts/../module.json", "/scripts/%2e%2e%2fmodule.json", "/scripts/main.js?path=module.json"]) {
    assert.equal((await fetch(baseUrl + route)).status, 404, "Fixture must refuse unlisted assets");
  }
  browser = await browserType.launch({...(channel ? {channel} : {}),headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(baseUrl);
  await page.waitForFunction(() => globalThis.moduleLoaded === true);
  await page.evaluate(() => Hooks.call("canvasReady", canvas));
  await page.locator("#wts-overlay iframe").waitFor();
  await page.frameLocator("iframe").getByText("Eintrag öffnen").click();
  assert.equal(await page.frameLocator("iframe").locator("button").textContent(), "Angeklickt");
  await page.locator("#chat").click();
  await page.getByText('Werkzeuge',{exact:true}).click();
  await page.getByText('Roadmap',{exact:true}).click();
  await page.getByText('Makros',{exact:true}).click();
  assert.deepEqual(await page.evaluate(() => calls), ["chat"]);
  assert.equal(await page.getByText("Alle hierher holen", {exact:true}).count(), 0);
  assert.equal(await page.locator('.wts-toolbar, .wts-panel').count(), 0);
  assert.deepEqual(await page.locator('#wts-overlay iframe').boundingBox(), {x:0,y:0,width:1440,height:900});
  await page.setViewportSize({width:1100,height:700});
  assert.deepEqual(await page.locator('#wts-overlay iframe').boundingBox(), {x:0,y:0,width:1100,height:700});
  await page.setViewportSize({width:1440,height:900});
  // Unrelated document updates must preserve the browsing state.
  await page.evaluate(() => Hooks.call("updateScene", scene));
  assert.equal(await page.frameLocator("iframe").locator("button").textContent(), "Angeklickt");
  await page.evaluate(() => {
    const form=document.createElement('form');form.id='config';
    form.innerHTML='<nav><a data-action="tab" data-group="sheet" data-tab="basics">Grundlagen</a></nav><div class="tab active" data-group="sheet" data-tab="basics"></div>';
    form.querySelector('a').addEventListener('click', event => {event.preventDefault();calls.push('tab-click')});
    document.body.append(form);
    const app={id:'config',isEditable:true,document:scene};
    Hooks.call('renderSceneConfig',app,form);Hooks.call('renderSceneConfig',app,form);
  });
  assert.equal(await page.locator(".wts-config").count(), 1);
  assert.equal(await page.locator('nav .wts-config').count(), 0);
  assert.equal(await page.locator('.tab[data-tab="basics"] .wts-config').count(), 1);
  assert.equal(await page.getByRole('checkbox',{name:'Foundry-Menüs ausblenden',exact:true}).isChecked(), false);
  await page.getByRole('checkbox',{name:'Foundry-Menüs ausblenden',exact:true}).check();
  await page.getByLabel('Webseite als Szene anzeigen',{exact:true}).uncheck();
  await page.getByLabel('Webseite als Szene anzeigen',{exact:true}).check();
  assert.equal(await page.evaluate(() => calls.includes('tab-click')), false);
  await page.locator('input[type="text"]').fill("javascript:alert(1)");
  assert.equal(await page.locator("#config").evaluate(form => form.checkValidity()), false);
  await page.locator('input[type="text"]').fill("https://example.org/");
  assert.equal(await page.locator("#config").evaluate(form => form.checkValidity()), true);
  const data = await page.locator("#config").evaluate(form => Object.fromEntries(new FormData(form)));
  assert.equal(data["flags.website-to-scene.website.url"], "https://example.org/");
  assert.equal(data["flags.website-to-scene.website.hideMenus"], "on");
  await page.getByLabel('Webseite als Szene anzeigen',{exact:true}).uncheck();
  await page.locator('input[type="text"]').fill("");
  assert.equal(await page.locator("#config").evaluate(form => form.checkValidity()), true);
  await page.evaluate(() => document.querySelector("#config").remove());
  assert.equal(await page.locator('#wts-menu-toggle').isVisible(), false);
  await page.evaluate(() => {scene.config.hideMenus=true;Hooks.call('updateScene',scene)});
  assert.equal(await page.locator('#interface').isVisible(), false);
  assert.equal(await page.frameLocator('iframe').locator('button').textContent(), 'Angeklickt');
  await page.getByRole('button',{name:'Foundry-Menüs anzeigen',exact:true}).click();
  assert.equal(await page.locator('#interface').isVisible(), true);
  await page.locator('#chat').click();
  await page.evaluate(() => Hooks.call('updateScene',scene));
  assert.equal(await page.locator('#interface').isVisible(), true);
  await page.getByRole('button',{name:'Foundry-Menüs ausblenden',exact:true}).click();
  assert.equal(await page.locator('#interface').isVisible(), false);
  await page.frameLocator('iframe').getByText('Angeklickt',{exact:true}).click();
  await page.evaluate(() => {scene.config.hideMenus=false;Hooks.call('updateScene',scene)});
  assert.equal(await page.locator('#interface').isVisible(), true);
  assert.equal(await page.locator('#wts-menu-toggle').isVisible(), false);
  await mkdir("artifacts", {recursive:true});
  await page.screenshot({path:`artifacts/browser-check-${browserName}.png`});
  await page.evaluate(() => {
    Hooks.call('canvasTearDown');
    game.user.isGM=false;
    Hooks.call('canvasReady',canvas);
  });
  assert.equal(await page.getByText("Alle hierher holen", {exact:true}).count(), 0);
  await page.evaluate(() => {scene.config.enabled=false;Hooks.call('updateScene',scene)});
  assert.equal(await page.locator("#wts-overlay").count(), 0);
  await page.evaluate(() => {scene.config.enabled=true;scene.config.hideMenus=true;Hooks.call('canvasReady',canvas)});
  assert.equal(await page.locator('#interface').isVisible(), false);
  await page.evaluate(() => {Hooks.call('canvasTearDown');Hooks.call('canvasReady',{scene:{getFlag:()=>undefined}})});
  assert.equal(await page.locator("#wts-overlay").count(), 0);
  assert.equal(await page.locator('#wts-menu-toggle').count(), 0);
  assert.equal(await page.locator('#interface').isVisible(), true);
  assert.deepEqual(errors, []);
  console.log(`Browser checks passed (${browserName}, ${browser.version()}): interactive fullscreen iframe, reachable Foundry UI, responsive viewport, no extra toolbar, retained browsing state, config validation, player role, scene cleanup.`);
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
}
