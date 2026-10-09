import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {buildRelease, validateManifest, releaseFiles} from '../tools/build-release.mjs';
import {verifyRelease} from '../tools/verify-release.mjs';

const manifest = JSON.parse(await readFile('module.json','utf8'));
const pkg = JSON.parse(await readFile('package.json','utf8'));

test('final module identity, author, npm publication disabled and tested Foundry generation match', () => {
  validateManifest(manifest,pkg);
  assert.equal(manifest.id,'website-to-scene');
  assert.equal(pkg.private,true);
  assert.equal(pkg.author,'Ginkgo85');
  assert.deepEqual(manifest.compatibility,{minimum:'14.369',verified:'14.369',maximum:'14'});
  assert.equal(manifest.license,'LICENSE');
  assert.equal(pkg.license,'MIT');
});

test('runtime references and relative README images/links are shipped and resolve', async () => {
  for (const file of [...manifest.esmodules,...manifest.styles,manifest.readme,manifest.license]) {
    await access(file);
    assert.ok(releaseFiles.includes(file), file);
  }
  const readme=await readFile('README.md','utf8');
  assert.ok(readme.includes('Version '+manifest.version));
  for (const match of readme.matchAll(/\]\(([^)]+)\)/g)) {
    const target=match[1];
    if (/^(https?:|#)/.test(target)) continue;
    await access(target);
    assert.ok(releaseFiles.includes(target), 'README target missing from ZIP: '+target);
  }
  for (const file of manifest.esmodules) {
    const source=await readFile(file,'utf8');
    for (const match of source.matchAll(/from "(\.[^"]+)"/g)) await access(path.resolve(path.dirname(file),match[1]));
  }
});

test('repeated builds are byte identical and contain only the explicit runtime files', async () => {
  const directory=await mkdtemp(path.join(tmpdir(),'wts-release-test-'));
  const first=await buildRelease(directory);
  const second=await buildRelease(directory);
  assert.deepEqual(first.zip,second.zip);
  assert.deepEqual(await verifyRelease(directory), releaseFiles);
  assert.equal(releaseFiles.length,8);
  assert.ok(releaseFiles.includes('docs/images/scene-settings.png'));
  assert.ok(releaseFiles.every(file=>!/(^|\/)(tests|tools|artifacts|node_modules|\.github)(\/|$)/.test(file)));
});

test('repository ignore rules exclude private local data, prototypes and output', async () => {
  const rules=(await readFile('.gitignore','utf8')).split(/\r?\n/);
  for (const rule of ['/release/','*.zip','node_modules/','/artifacts/','/website-to-scene/','.env','/Data/','/Config/','*.har']) assert.ok(rules.includes(rule),rule);
});
