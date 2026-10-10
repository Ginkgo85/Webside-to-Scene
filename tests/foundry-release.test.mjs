import test from "node:test";
import assert from "node:assert/strict";
import {notifyFoundry} from "../tools/foundry-release.mjs";

const sha = "a".repeat(40);
const token = "fvtt" + "p_" + "synthetic".repeat(5);
const releaseUrl = "https://github.com/Ginkgo85/Webside-to-Scene/releases";
const manifestUrl = releaseUrl + "/download/v1.1.0/module.json";
const zipUrl = releaseUrl + "/download/v1.1.0/website-to-scene.zip";
const page = "https://foundryvtt.com/packages/website-to-scene/edit/";
const dryMessage = "Dry run completed successfully. To save, submit the request again without dry-run";

function fixture() {
  const calls = [];
  const files = {"module.json": Buffer.from("synthetic manifest"), "website-to-scene.zip": Buffer.from("synthetic ZIP")};
  return {
    calls,
    env: {GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_REF: "refs/heads/main",
      GITHUB_REPOSITORY: "Ginkgo85/Webside-to-Scene", GITHUB_SHA: sha, FOUNDRY_RELEASE_TOKEN: token},
    run: () => sha,
    info: async () => ({version: "1.1.0", tag: "v1.1.0"}),
    verify: async () => {calls.push("verify");},
    manifest: async () => ({id: "website-to-scene", version: "1.1.0", download: zipUrl,
      compatibility: {minimum: "14.369", verified: "14.369", maximum: "14"}}),
    asset: async name => files[name],
    github: async route => {
      calls.push({route});
      return {status: 200, data: route.startsWith("git/ref/") ? {object: {type: "commit", sha}}
        : {tag_name: "v1.1.0", draft: false, prerelease: false, assets: [
          {name: "module.json", browser_download_url: manifestUrl},
          {name: "website-to-scene.zip", browser_download_url: zipUrl}]} };
    },
    get: async url => {calls.push({url});return files[url.split("/").at(-1)];},
    post: async (secret, body) => {
      assert.equal(secret, token);
      calls.push({body});
      return {status: 200, data: {status: "success", page, ...(body["dry-run"] ? {message: dryMessage} : {})}};
    }
  };
}
const submissions = f => f.calls.filter(call => call.body);

test("Foundry dry-run sends precise planned metadata without publishing or requesting public assets", async () => {
  const f = fixture();
  assert.deepEqual(await notifyFoundry(f), {version: "1.1.0", published: false});
  assert.deepEqual(f.calls.map(call => typeof call === "string" ? call : Object.keys(call)[0]), ["verify", "body"]);
  assert.deepEqual(submissions(f)[0].body, {id: "website-to-scene", "dry-run": true,
    release: {version: "1.1.0", manifest: manifestUrl, notes: releaseUrl + "/tag/v1.1.0",
      compatibility: {minimum: "14.369", verified: "14.369", maximum: "14"}}});
  assert.equal(JSON.stringify(submissions(f)[0].body).includes(token), false);
});

test("Foundry publication follows verified tag, public release and both exact anonymous downloads", async () => {
  const f = fixture();
  assert.deepEqual(await notifyFoundry({...f, publish: true}), {version: "1.1.0", published: true});
  assert.deepEqual(f.calls.map(call => typeof call === "string" ? call : Object.keys(call)[0]),
    ["verify", "route", "route", "url", "url", "body"]);
  assert.deepEqual(f.calls.filter(call => call.url).map(call => call.url), [manifestUrl, zipUrl]);
  assert.equal(submissions(f)[0].body["dry-run"], undefined);
  assert.equal(submissions(f).length, 1);
});

test("unsafe context, missing secret or unverified build prevent every Foundry request", async () => {
  for (const overrides of [{GITHUB_ACTIONS: "false"}, {GITHUB_EVENT_NAME: "push"},
    {GITHUB_REF: "refs/heads/feature"}, {GITHUB_REPOSITORY: "other/repo"},
    {GITHUB_SHA: "b".repeat(40)}, {FOUNDRY_RELEASE_TOKEN: ""}, {FOUNDRY_RELEASE_TOKEN: "bad"},
    {FOUNDRY_RELEASE_TOKEN: token + "\n"}, {FOUNDRY_RELEASE_TOKEN: token + " "},
    {FOUNDRY_RELEASE_TOKEN: token + "\u0000"}]) {
    const f = fixture();
    await assert.rejects(notifyFoundry({...f, publish: true, env: {...f.env, ...overrides}}));
    assert.deepEqual(f.calls, []);
  }
  const f = fixture();
  await assert.rejects(notifyFoundry({...f, publish: true, verify: async () => {throw new Error("Bad ZIP");}}));
  assert.deepEqual(f.calls, []);
});

test("Foundry punctuation tokens are passed unchanged only in the authorization boundary", async () => {
  const f = fixture();
  const punctuationToken = "fvtt" + "p_" + "synthetic!@#$%^&*()[]{},:;?";
  const env = {...f.env, FOUNDRY_RELEASE_TOKEN: punctuationToken};
  let count = 0;
  assert.deepEqual(await notifyFoundry({...f, env, post: async (secret, body) => {
    assert.equal(secret, punctuationToken);
    assert.equal(JSON.stringify(body).includes(secret), false);
    count++;
    return {status: 200, data: {status: "success", page, message: dryMessage}};
  }}), {version: "1.1.0", published: false});
  assert.equal(count, 1);
});

test("wrong module, version, tag or download prevents submission", async () => {
  for (const change of [{id: "other-module"}, {version: "1.0.2"}, {download: "https://example.org/file.zip"}]) {
    const f = fixture(), original = f.manifest;
    await assert.rejects(notifyFoundry({...f, manifest: async () => ({...await original(), ...change})}));
    assert.equal(submissions(f).length, 0);
  }
  const f = fixture();
  await assert.rejects(notifyFoundry({...f, info: async () => ({version: "1.1.0", tag: "v1.0.2"})}));
  assert.equal(submissions(f).length, 0);
});

test("wrong, unavailable or annotated GitHub tag prevents Foundry publication", async () => {
  for (const result of [{status: 404, data: {}}, {status: 200, data: {object: {type: "tag", sha}}},
    {status: 200, data: {object: {type: "commit", sha: "b".repeat(40)}}}]) {
    const f = fixture();
    await assert.rejects(notifyFoundry({...f, publish: true, github: async () => result}));
    assert.equal(submissions(f).length, 0);
  }
});

test("draft, prerelease, mismatched tag or missing and additional assets prevent publication", async () => {
  for (const change of [{draft: true}, {prerelease: true}, {tag_name: "v1.0.2"},
    {assets: []}, {assets: [{name: "module.json", browser_download_url: "https://example.org"}]},
    {assets: [{name: "module.json", browser_download_url: manifestUrl},
      {name: "website-to-scene.zip", browser_download_url: zipUrl}, {name: "extra"}]}]) {
    const f = fixture(), original = f.github;
    await assert.rejects(notifyFoundry({...f, publish: true, github: async route => {
      const result = await original(route);
      return route.startsWith("releases/") ? {...result, data: {...result.data, ...change}} : result;
    }}));
    assert.equal(submissions(f).length, 0);
    assert.equal(f.calls.some(call => call.url), false);
  }
});

test("missing or modified anonymous downloads prevent Foundry submission", async () => {
  for (const name of ["module.json", "website-to-scene.zip"]) {
    for (const missing of [false, true]) {
      const f = fixture(), original = f.get;
      await assert.rejects(notifyFoundry({...f, publish: true, get: async url => {
        if (url.endsWith(name)) {
          if (missing) throw new Error("Missing asset");
          return Buffer.from("changed bytes");
        }
        return original(url);
      }}));
      assert.equal(submissions(f).length, 0);
    }
  }
});

test("Foundry errors and uncertain responses never leak secrets or trigger automatic POST retries", async () => {
  for (const result of [{status: 400, data: {status: "error", token}}, {status: 429, data: {token}},
    {status: 500, data: {token}}, {status: 200, data: {status: "error", token}},
    {status: 200, data: {status: "success", page: "https://example.org/", token}},
    {status: 200, data: {status: "success", page}}]) {
    const f = fixture();
    let count = 0;
    await assert.rejects(notifyFoundry({...f, post: async () => {count++;return result;}}), error => {
      assert.equal(error.message.includes(token), false);return true;
    });
    assert.equal(count, 1);
  }
  const f = fixture();
  await assert.rejects(notifyFoundry({...f, post: async () => {throw new Error(token);}}), error => {
    assert.equal(error.message.includes(token), false);return true;
  });
});
