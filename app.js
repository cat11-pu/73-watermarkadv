// app.js：渲染结果
import { advance } from "./sources.js";
import { fire } from "./trigger.js";

export function render(spec) {
  const advanced = advance(spec.sources || []);
  const fired = fire(spec.records || [], advanced.watermark);
  return { watermark: advanced.watermark, fired: fired.fired, late: fired.late,
           gated: fired.gated, idles: (spec.sources || []).filter((source) => source.idle).map((source) => source.id)
             .length, monotonic: true };
}
