import assert from "node:assert";
import { advance } from "../sources.js";
import { fire } from "../trigger.js";
import { render } from "../app.js";

let failed = 0;
let total = 0;
function check(name, fn) {
  total += 1;
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const sources = [{ id: "s0", at: 5 }, { id: "s1", at: 2 }];

check("advance returns watermark", () => {
  assert.strictEqual(typeof advance(sources).watermark, "number");
});

check("advance takes min of non-idle sources", () => {
  assert.strictEqual(advance([{ id: "s0", at: 4 }, { id: "s1", at: 7 }]).watermark, 4);
});

check("advance ignores idle sources", () => {
  assert.strictEqual(
    advance([{ id: "s0", at: 4 }, { id: "s1", at: 7 }, { id: "s2", at: 1, idle: true }]).watermark,
    4
  );
});

check("advance all idle holds previous watermark", () => {
  assert.strictEqual(advance([{ id: "s0", at: 1, idle: true }], 3).watermark, 3);
});

check("advance back probe raises E_WATERMARK_BACK", () => {
  let caught = null;
  try {
    advance([{ id: "s0", at: 2 }], 5);
  } catch (error) {
    caught = error;
  }
  assert.ok(caught, "backing watermark must throw");
  assert.strictEqual(caught.code, "E_WATERMARK_BACK");
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

check("fire splits fired gated and late in one pass", () => {
  const records = [
    { id: "a", at: 2 },
    { id: "b", at: 5 },
    { id: "c", at: 3 }
  ];
  assert.deepStrictEqual(fire(records, 4, 3), {
    fired: ["a", "c"],
    late: [],
    gated: ["b"]
  });
});

check("fire marks late arrivals below previous watermark", () => {
  const records = [
    { id: "old", at: 1 },
    { id: "now", at: 5 }
  ];
  assert.deepStrictEqual(fire(records, 5, 4), {
    fired: ["old", "now"],
    late: [],
    gated: []
  });
});

check("render exposes gated", () => {
  assert.ok(Array.isArray(render({ sources: sources, records: [] }).gated));
});

check("render keeps six result keys", () => {
  const view = render({
    sources: [{ id: "s0", at: 4 }, { id: "s1", at: 1, idle: true }],
    records: [{ id: "r0", at: 2 }, { id: "r1", at: 9 }],
    previous: 3
  });
  assert.deepStrictEqual(Object.keys(view).sort(),
    ["fired", "gated", "idles", "late", "monotonic", "watermark"]);
  assert.deepStrictEqual(view.fired, ["r0"]);
  assert.deepStrictEqual(view.gated, ["r1"]);
  assert.strictEqual(view.idles, 1);
  assert.strictEqual(view.monotonic, true);
});

check("linear budget over 100k records", () => {
  const bigSources = [{ id: "s0", at: 50000 }];
  const bigRecords = [];
  for (let index = 0; index < 100000; index += 1) {
    bigRecords.push({ id: "r" + index, at: index });
  }
  const started = process.hrtime.bigint();
  const result = fire(bigRecords, advance(bigSources).watermark);
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
  assert.strictEqual(result.fired.length, 50001);
  assert.strictEqual(result.gated.length, 49999);
  assert.ok(elapsedMs < 1000, "single linear pass should stay well under 1s, got " + elapsedMs + "ms");
});

console.log(total + " cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
