import assert from "node:assert/strict";
import {readFile, writeFile, mkdir, mkdtemp, lstat} from "node:fs/promises";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {releaseFiles, validateManifest} from "./build-release.mjs";
import {assertNoSecrets} from "./verify-release.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const targetFoundry = "14.359";
const hash = data => createHash("sha256").update(data).digest("hex");

// Local preparation only: no network calls, installed-module edits or release mutations.
export async function prepareFoundryTest() {
  const sourceManifest = await readFile(path.join(root, "module.json"));
  const manifest = JSON.parse(sourceManifest);
  validateManifest(manifest, JSON.parse(await readFile(path.join(root, "package.json"), "utf8")));
  const sourceRevision = execFileSync("git", ["rev-parse", "HEAD"], {cwd: root, encoding: "utf8"}).trim();
  const inputs = new Map();
  for (const file of releaseFiles) {
    assert.equal((await lstat(path.join(root, file))).isSymbolicLink(), false);
    const data = await readFile(path.join(root, file));
    assertNoSecrets(data.toString("utf8"), file);
    inputs.set(file, data);
  }
  assert.deepEqual(inputs.get("module.json"), sourceManifest);
  // Preserve ID, version, flags and runtime. Only the test copy bypasses the minimum.
  manifest.compatibility.minimum = targetFoundry;
  delete manifest.manifest;
  delete manifest.download;
  const artifacts = path.join(root, "artifacts");
  await mkdir(artifacts, {recursive: true});
  const directory = await mkdtemp(path.join(artifacts, "foundry-14.359-"));
  const moduleDirectory = path.join(directory, "Data/modules/website-to-scene");
  const sourceHashes = {}, testHashes = {};
  for (const [file, source] of inputs) {
    const data = file === "module.json" ? Buffer.from(JSON.stringify(manifest, null, 2) + "\n") : source;
    const destination = path.join(moduleDirectory, file);
    await mkdir(path.dirname(destination), {recursive: true});
    await writeFile(destination, data);
    assert.deepEqual(await readFile(destination), data);
    sourceHashes[file] = hash(source);
    testHashes[file] = hash(data);
  }
  const fixture = path.join(directory, "Data/assets/website-to-scene-test/index.html");
  await mkdir(path.dirname(fixture), {recursive: true});
  await writeFile(fixture, await readFile(path.join(root, "tests/fixtures/manual-scene.html")));
  await writeFile(path.join(directory, "TESTPLAN.md"), await readFile(path.join(root, "docs/FOUNDRY-14.359-TEST.md")));
  const provenance = {
    targetFoundry, moduleVersion: manifest.version, sourceRevision,
    liveStatus: "not-run", sourceHashes, testHashes,
    manifestChanges: {minimum: targetFoundry, removed: ["manifest", "download"]}
  };
  await writeFile(path.join(directory, "provenance.json"), JSON.stringify(provenance, null, 2) + "\n");
  assert.deepEqual(await readFile(path.join(root, "module.json")), sourceManifest);
  return {directory, moduleDirectory, provenance};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await prepareFoundryTest();
  console.log(`Test copy prepared: ${path.relative(root, result.directory)}\nFoundry 14.359 live test: NOT RUN. Nothing installed or published.`);
}
