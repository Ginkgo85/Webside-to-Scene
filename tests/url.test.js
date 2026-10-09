import test from "node:test";
import assert from "node:assert/strict";
import { resolveWebsiteUrl } from "../scripts/url.js";

const base = "https://foundry.example/vtt/game";
test("web URLs and Data paths work behind a route prefix", () => {
  assert.equal(resolveWebsiteUrl(" https://example.org/map?a=1&b=2 ", base), "https://example.org/map?a=1&b=2");
  assert.equal(resolveWebsiteUrl("worlds/demo/index.html", base), "https://foundry.example/vtt/worlds/demo/index.html");
  assert.equal(resolveWebsiteUrl("http://example.org/", "http://localhost:30000/game"), "http://example.org/");
});
test("reject empty, executable, credential, mixed-content and ambiguous URLs", () => {
  for (const input of ["", "  ", "javascript:alert(1)", "data:text/html,test", "file:///C:/test.html", "https://user:pass@example.org", "http://example.org", "//example.org", "\\\\example.org", "https://example.org\\test"]) {
    assert.throws(() => resolveWebsiteUrl(input, base), undefined, input);
  }
});
