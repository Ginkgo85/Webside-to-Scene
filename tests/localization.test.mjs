import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolveWebsiteUrl, WebsiteUrlError} from "../scripts/url.js";

const manifest = JSON.parse(await readFile("module.json", "utf8"));
const dictionaries = Object.fromEntries(await Promise.all(manifest.languages.map(async language => [
  language.lang, JSON.parse(await readFile(language.path, "utf8"))
])));

test("German and English catalogs cover the same namespaced texts and format variables", () => {
  assert.deepEqual(manifest.languages.map(language => language.lang).sort(), ["de", "en"]);
  assert.deepEqual(Object.keys(dictionaries.de).sort(), Object.keys(dictionaries.en).sort());
  for (const [key, value] of Object.entries(dictionaries.en)) {
    assert.ok(key.startsWith("website-to-scene."), key);
    assert.equal(typeof value, "string");
    assert.ok(value.trim());
    assert.equal(typeof dictionaries.de[key], "string");
    assert.ok(dictionaries.de[key].trim());
    assert.deepEqual(value.match(/\{[^}]+\}/g), dictionaries.de[key].match(/\{[^}]+\}/g), key);
  }
  assert.equal(dictionaries.de["website-to-scene.Scene.Enabled"], "Webseite als Szene anzeigen");
  assert.equal(dictionaries.en["website-to-scene.Scene.Enabled"], "Display website as a scene");
});

test("every URL failure has a translated error key without exposing the submitted address", () => {
  for (const [input, reason] of [["", "Required"], ["//example.org", "Ambiguous"],
    ["javascript:alert(1)", "Protocol"], ["https://user:pass@example.org", "Credentials"],
    ["http://example.org", "MixedContent"], ["https://[invalid", "InvalidUrl"]]) {
    assert.throws(() => resolveWebsiteUrl(input, "https://foundry.example/game"), error => {
      assert.ok(error instanceof WebsiteUrlError);
      assert.equal(error.message, "website-to-scene.Errors." + reason);
      for (const dictionary of Object.values(dictionaries)) assert.ok(dictionary[error.message]);
      return true;
    });
  }
});
