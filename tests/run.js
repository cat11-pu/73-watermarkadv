import assert from "node:assert";
import { advance } from "../sources.js";
import { fire } from "../trigger.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const sources = [{ id: "s0", at: 5 }, { id: "s1", at: 2 }];

check("advance returns watermark", () => {
  assert.strictEqual(typeof advance(sources).watermark, "number");
});

check("advance handles empty input", () => {
  assert.strictEqual(advance([]).watermark, 0);
});

check("fire returns fired list", () => {
  assert.ok(Array.isArray(fire([], 0).fired));
});

check("fire reports late", () => {
  assert.ok(Array.isArray(fire([], 0).late));
});

check("render exposes gated", () => {
  assert.ok(Array.isArray(render({ sources: sources, records: [] }).gated));
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
