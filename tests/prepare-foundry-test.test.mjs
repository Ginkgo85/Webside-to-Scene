import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {prepareFoundryTest} from "../tools/prepare-foundry-test.mjs";
import {releaseFiles} from "../tools/build-release.mjs";

test("legacy test preparation preserves production metadata and runtime bytes", async () => {
  const source = await readFile(new URL("../module.json", import.meta.url));
  const {moduleDirectory, directory, provenance} = await prepareFoundryTest();
  const original = JSON.parse(source);
  const prepared = JSON.parse(await readFile(path.join(moduleDirectory, "module.json"), "utf8"));
  const expected = structuredClone(original);
  expected.compatibility.minimum = "14.359";
  delete expected.manifest;
  delete expected.download;
  assert.deepEqual(prepared, expected);
  assert.deepEqual(await readFile(new URL("../module.json", import.meta.url)), source);
  for (const file of releaseFiles.filter(file => file !== "module.json")) {
    assert.deepEqual(await readFile(path.join(moduleDirectory, file)), await readFile(new URL("../" + file, import.meta.url)));
    assert.equal(provenance.sourceHashes[file], provenance.testHashes[file]);
  }
  assert.equal(provenance.liveStatus, "not-run");
  assert.match(provenance.sourceRevision, /^[a-f0-9]{40}$/);
  assert.match(await readFile(path.join(directory, "TESTPLAN.md"), "utf8"), /Noch nicht durchgeführt/);
  assert.match(await readFile(path.join(directory, "Data/assets/website-to-scene-test/index.html"), "utf8"), /Klicks: 0/);
});
