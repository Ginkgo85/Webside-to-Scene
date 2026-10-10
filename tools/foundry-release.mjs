import {execFileSync} from "node:child_process";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {assertMain} from "./release.mjs";
import {releaseInfo, verifyRelease} from "./verify-release.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const repository = "Ginkgo85/Webside-to-Scene";
const endpoint = "https://foundryvtt.com/_api/packages/release_version/";
const command = (name, args) => execFileSync(name, args, {
  encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]
}).trim();
const readManifest = async () => JSON.parse(await readFile(path.join(root, "module.json"), "utf8"));
const readAsset = name => readFile(path.join(root, "release", name));

// Public release checks send no authentication headers, including across CDN redirects.
async function githubGet(route) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/${route}`, {
      headers: {Accept: "application/vnd.github+json"}, signal: AbortSignal.timeout(30000)
    });
    return {status: response.status, data: await response.json()};
  } catch { throw new Error("Public GitHub release metadata could not be read."); }
}
async function download(url) {
  try {
    const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
    if (!response.ok) throw new Error();
    return Buffer.from(await response.arrayBuffer());
  } catch { throw new Error("A public GitHub release asset could not be downloaded."); }
}
async function foundryPost(token, body) {
  try {
    const response = await fetch(endpoint, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(30000),
      headers: {Authorization: token, "Content-Type": "application/json"},
      body: JSON.stringify(body)
    });
    return {status: response.status, data: await response.json()};
  } catch { throw new Error("Foundry response could not be confirmed. Check its package page before retrying."); }
}

// Only boundary functions are injectable; tests cannot bypass the publication guards.
export async function notifyFoundry({publish = false, env = process.env, run = command,
  info = releaseInfo, verify = verifyRelease, manifest = readManifest, asset = readAsset,
  github = githubGet, get = download, post = foundryPost} = {}) {
  assertMain(env, run("git", ["rev-parse", "HEAD"]));
  if (env.GITHUB_EVENT_NAME !== "workflow_dispatch") {
    throw new Error("Foundry submission requires a manually dispatched release workflow.");
  }
  const token = env.FOUNDRY_RELEASE_TOKEN;
  // Foundry tokens may contain punctuation. Reject whitespace and control characters.
  if (typeof token !== "string" || !token.startsWith("fvtt" + "p_")
    || token.length < 22 || /[^\x21-\x7e]/.test(token)) {
    throw new Error("The repository secret FOUNDRY_RELEASE_TOKEN is missing or invalid.");
  }
  const {version, tag} = await info();
  await verify();
  const source = await manifest();
  if (source.id !== "website-to-scene" || source.version !== version || tag !== "v" + version) {
    throw new Error("Foundry submission metadata does not match the checked module.");
  }
  const releaseUrl = `https://github.com/${repository}/releases`;
  const manifestUrl = `${releaseUrl}/download/${tag}/module.json`;
  const zipUrl = `${releaseUrl}/download/${tag}/website-to-scene.zip`;
  if (source.download !== zipUrl) throw new Error("The module download does not match the planned release.");

  if (publish) {
    const remoteTag = await github("git/ref/tags/" + tag);
    if (remoteTag.status !== 200 || remoteTag.data.object?.type !== "commit"
      || remoteTag.data.object.sha !== env.GITHUB_SHA) {
      throw new Error("The published tag does not match the checked commit. Nothing submitted to Foundry.");
    }
    const release = await github("releases/tags/" + tag);
    const expected = {"module.json": manifestUrl, "website-to-scene.zip": zipUrl};
    if (release.status !== 200 || release.data.draft !== false || release.data.prerelease !== false
      || release.data.tag_name !== tag || release.data.assets?.length !== 2
      || Object.entries(expected).some(([name, url]) =>
        !release.data.assets.some(file => file.name === name && file.browser_download_url === url))) {
      throw new Error("The public GitHub release and its two assets were not confirmed.");
    }
    // Compare anonymous downloads to the same local ZIP already checked against sources.
    for (const [name, url] of Object.entries(expected)) {
      const [publicBytes, localBytes] = await Promise.all([get(url), asset(name)]);
      if (!Buffer.from(publicBytes).equals(Buffer.from(localBytes))) {
        throw new Error("A public release asset differs from the checked build. Nothing submitted to Foundry.");
      }
    }
  }

  const body = {
    id: source.id, ...(!publish ? {"dry-run": true} : {}),
    release: {version, manifest: manifestUrl, notes: `${releaseUrl}/tag/${tag}`,
      compatibility: source.compatibility}
  };
  let response;
  try { response = await post(token, body); }
  catch { throw new Error("Foundry response could not be confirmed. Check its package page before retrying."); }
  // Never print raw responses: they may echo credentials, URLs or request headers.
  if (response.status !== 200 || response.data?.status !== "success"
    || !["https://foundryvtt.com/packages/website-to-scene/edit/",
      "https://foundryvtt.com/packages/website-to-scene/edit"].includes(response.data.page)
    || (!publish && response.data.message !== "Dry run completed successfully. To save, submit the request again without dry-run")) {
    const status = Number.isInteger(response.status) ? response.status : "unknown";
    throw new Error(`Foundry did not confirm the request (HTTP ${status}). Check the package page; existing versions are never replaced.`);
  }
  return {version, published: publish};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3 || !["--dry-run", "--publish"].includes(process.argv[2])) {
      throw new Error("Use --dry-run to validate without saving, or --publish after verified GitHub publication.");
    }
    const result = await notifyFoundry({publish: process.argv[2] === "--publish"});
    console.log(result.published ? `Foundry version confirmed: ${result.version}`
      : `Foundry API check passed for ${result.version}. No version saved.`);
  } catch (error) {
    console.error(error.status !== undefined || error.code ? "Foundry release command failed; no credentials shown." : error.message);
    process.exitCode = 1;
  }
}
