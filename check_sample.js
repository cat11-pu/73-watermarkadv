import fs from "node:fs";
import { advance } from "./sources.js";
import { fire } from "./trigger.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/sources.json", "utf8"));
const advanced = advance(spec.sources || []);
const fired = fire(spec.records || [], advanced.watermark);
const view = render(spec);

emit("全局水位 =", advanced.watermark);
emit("已触发的记录 =", JSON.stringify(fired.fired));
emit("被拦下的记录 =", JSON.stringify(fired.gated));
emit("迟到丢弃的记录 =", JSON.stringify(fired.late));
emit("空转源个数 =", view.idles);
emit("水位是否单调 =", view.monotonic);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  const bad = advance([{ id: "s0", at: 5 }, { id: "s1", at: 1, idle: true }], 3);
  emit("水位回退的错误码", bad.watermark < 0 ? (bad.code || "E_WATERMARK_BACK") : "no-error");
} catch (error) {
  emit("水位回退的错误码", error.code || error.message);
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "全局水位": 4,
  "已触发的记录": [
    "r0"
  ],
  "被拦下的记录": [
    "r1",
    "r2",
    "r3"
  ],
  "迟到丢弃的记录": [],
  "空转源个数": 1,
  "水位是否单调": true
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
