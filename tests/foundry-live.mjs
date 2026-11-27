import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {chromium,firefox} from 'playwright';
import {createServer} from 'node:http';
// Opt-in integration test. Requires a separately prepared, disposable Foundry world.
// Never point this at a campaign: identities below are checked before document writes.
if (!process.argv.includes('--test-world')) throw new Error('Use --test-world with the isolated wts-compatibility world; see VALIDIERUNG.md.');
const manifest=JSON.parse(await readFile('module.json','utf8'));
const expectedCore = process.env.TEST_FOUNDRY_VERSION ?? '14.371';
assert.ok(['14.370', '14.371'].includes(expectedCore), 'Unsupported Foundry test version');
const artifactDir = `artifacts/foundry-${expectedCore}`;
const fixture=await readFile('tests/fixtures/manual-scene.html');
const server=createServer((req,res)=>{
  if (!['/','/?changed=1'].includes(req.url)) {res.writeHead(404);return res.end();}
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fixture);
});
const ID='website-to-scene';
const browserName=process.env.TEST_BROWSER || 'chromium';
assert.ok(['chromium','firefox'].includes(browserName),'TEST_BROWSER must be chromium or firefox');
let browser;
const errors=[];
const evidence=[];
async function login(name) {
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>d.accept());
  await page.goto('http://127.0.0.1:30001');
  await page.locator('[name=userId]').selectOption({label:name});
  await page.locator('button[name=join]').click();
  await page.waitForFunction(()=>globalThis.game?.ready);
  assert.equal(await page.evaluate(()=>game.world.id),'wts-compatibility');
  assert.equal(await page.evaluate(()=>game.version),expectedCore);
  assert.equal(await page.evaluate(()=>game.system.id),'dnd5e');
  assert.equal(await page.evaluate(()=>game.system.version),'6.0.6');
  assert.equal(await page.evaluate(id=>game.modules.get(id)?.active,ID),true);
  assert.equal(await page.evaluate(id=>game.modules.get(id)?.version,ID),manifest.version);
  return page;
}
async function until(page, fn, arg) {await page.waitForFunction(fn,arg,{timeout:30000});}
try {
  await mkdir(artifactDir,{recursive:true});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(30002,'127.0.0.1',resolve);});
  browser=await ({chromium,firefox}[browserName]).launch({headless:true});
  const gm=await login('Gamemaster');
  console.log('Logged in');
  for(const file of ['scripts/main.js','scripts/url.js','styles/website-to-scene.css','lang/de.json','lang/en.json']) {
    const response=await gm.request.get('http://127.0.0.1:30001/modules/'+ID+'/'+file);
    assert.deepEqual(await response.body(),await readFile(file),file+' must match repository');
  }
  await gm.evaluate(async()=>{
    if(!game.users.getName('WTS Player')) await game.users.documentClass.create({name:'WTS Player',role:1});
    await game.togglePause(false,{broadcast:true});
    for(const app of Object.values(foundry.applications.api.ApplicationV2.instances)) await app.close();
  });
  // Only installed Core languages. The simulated test covers the French fallback.
  for(const language of ['en','de']) {
    console.log('Language',language);
    await gm.evaluate(async language=>{await game.settings.set('core','language',language);},language);
    await gm.reload();await until(gm,()=>game.ready);
    console.log('Reloaded');
    const ids=await gm.evaluate(async()=>{
      const scene=await game.scenes.documentClass.create({name:'WTS Website',width:1600,height:1000,navigation:true,ownership:{default:2}});
      const other=await game.scenes.documentClass.create({name:'WTS Normal',width:1600,height:1000,navigation:true,ownership:{default:2}});
      await scene.activate();
      return {web:scene.id,normal:other.id};
    });
    console.log('Created scenes',ids);
    await until(gm,id=>canvas.ready && canvas.scene?.id===id,ids.web);
    await gm.evaluate(async id=>{await game.scenes.get(id).sheet.render(true);},ids.web);
    const form=gm.locator('.scene-config');
    await form.locator('.wts-config').waitFor();
    console.log('Opened config');
    assert.equal(await form.locator('nav .wts-config').count(),0);
    assert.equal(await form.locator('.tab[data-tab=basics][data-group=sheet] .wts-config').count(),1);
    const labels=await form.locator('.wts-config label').allTextContents();
    assert.ok(labels.includes(language==='de'?'Webseite als Szene anzeigen':'Display website as a scene'));
    const enabled=form.locator('[name="flags.website-to-scene.website.enabled"]');
    const hidden=form.locator('[name="flags.website-to-scene.website.hideMenus"]');
    const url=form.locator('[name="flags.website-to-scene.website.url"]');
    await enabled.check();
    await url.fill('javascript:alert(1)');
    assert.equal(await url.evaluate(n=>n.checkValidity()),false);
    await url.fill('http://127.0.0.1:30002/');
    await hidden.check();
    await gm.screenshot({path:`${artifactDir}/config-${browserName}-${language}.png`});
    await gm.evaluate(async id=>{await game.scenes.get(id).sheet.submit();},ids.web);
    console.log('Submitted');
    await until(gm,()=>document.body.classList.contains('wts-hide-ui'));
    assert.deepEqual(await gm.evaluate(id=>game.scenes.get(id).getFlag('website-to-scene','website'),ids.web),{enabled:true,hideMenus:true,url:'http://127.0.0.1:30002/'});
    await gm.evaluate(async id=>{await game.scenes.get(id).sheet.render(true);},ids.web);
    await form.locator('.wts-config').waitFor();
    assert.equal(await url.inputValue(),'http://127.0.0.1:30002/');
    assert.equal(await hidden.isChecked(),true);
    await gm.evaluate(async id=>{await game.scenes.get(id).sheet.close();},ids.web);
    const player=await login('WTS Player');
    await until(player,()=>!!document.querySelector('#wts-overlay iframe'));
    await gm.frameLocator('#wts-overlay iframe').locator('#counter').click();
    await gm.frameLocator('#wts-overlay iframe').locator('#note').fill('state survives');
    assert.equal(await player.frameLocator('#wts-overlay iframe').locator('#counter').textContent(),'Klicks: 0');
    await gm.evaluate(()=>{globalThis.wtsUpdateCount=0;Hooks.on('updateScene',()=>wtsUpdateCount++);});
    await gm.locator('#wts-menu-toggle').click();
    assert.equal(await gm.locator('#interface').isVisible(),true);
    assert.equal(await player.locator('#interface').isVisible(),false);
    assert.equal(await gm.evaluate(()=>wtsUpdateCount),0);
    await gm.evaluate(async id=>{await game.scenes.get(id).update({name:'WTS renamed'});},ids.web);
    await until(gm,()=>document.querySelector('#wts-overlay iframe')?.title.includes('WTS renamed'));
    assert.equal(await gm.locator('#interface').isVisible(),true);
    assert.equal(await gm.frameLocator('#wts-overlay iframe').locator('#note').inputValue(),'state survives');
    assert.deepEqual(await gm.locator('#wts-overlay iframe').boundingBox(),{x:0,y:0,width:1440,height:1000});
    await gm.setViewportSize({width:1100,height:700});
    assert.deepEqual(await gm.locator('#wts-overlay iframe').boundingBox(),{x:0,y:0,width:1100,height:700});
    await gm.setViewportSize({width:1440,height:1000});
    await gm.locator('#wts-menu-toggle').click();
    await gm.screenshot({path:`${artifactDir}/scene-${browserName}-${language}.png`});
    await gm.evaluate(async id=>{await game.scenes.get(id).activate();},ids.normal);
    for(const p of [gm,player]) {
      await until(p,()=>canvas.ready && !document.querySelector('#wts-overlay'));
      assert.equal(await p.locator('#interface').isVisible(),true);
      assert.equal(await p.locator('#wts-menu-toggle').count(),0);
    }
    // A player may independently view an accessible navigation scene.
    await player.evaluate(async id=>{await game.scenes.get(id).view();},ids.web);
    await until(player,()=>document.body.classList.contains('wts-hide-ui'));
    assert.equal(await gm.locator('#wts-overlay').count(),0);
    await gm.evaluate(async id=>{await game.scenes.get(id).activate();},ids.web);
    await until(gm,()=>document.body.classList.contains('wts-hide-ui'));
    await gm.evaluate(async id=>{await game.scenes.get(id).setFlag('website-to-scene','website.url','http://127.0.0.1:30002/?changed=1');},ids.web);
    for(const p of [gm,player]) await until(p,()=>document.querySelector('#wts-overlay iframe')?.src.endsWith('?changed=1'));
    await gm.evaluate(async id=>{await game.scenes.get(id).setFlag('website-to-scene','website.enabled',false);},ids.web);
    for(const p of [gm,player]) {await until(p,()=>!document.querySelector('#wts-overlay'));assert.equal(await p.locator('#interface').isVisible(),true);}
    await gm.evaluate(async id=>{await game.scenes.get(id).setFlag('website-to-scene','website.enabled',true);},ids.web);
    await until(gm,()=>!!document.querySelector('#wts-overlay'));
    await gm.evaluate(async id=>{await game.scenes.get(id).delete();},ids.web);
    for(const p of [gm,player]) {await until(p,()=>!document.querySelector('#wts-overlay'));assert.equal(await p.locator('#interface').isVisible(),true);}
    await player.context().close();
    await gm.evaluate(async id=>{await game.scenes.get(id).delete();},ids.normal);
    evidence.push({language,browser:browserName,version:browser.version(),module:manifest.version,foundry:expectedCore,system:'dnd5e 6.0.6',result:'passed'});
    console.log(JSON.stringify(evidence.at(-1)));
  }
  assert.deepEqual(errors,[]);
  await writeFile(`${artifactDir}/result-${browserName}.json`,JSON.stringify({evidence,errors},null,2));
} finally {
  await browser?.close();
  if(server.listening) await new Promise(resolve=>server.close(resolve));
}
