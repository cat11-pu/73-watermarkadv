// app.js：渲染结果
import { advance } from "./sources.js";
import { fire } from "./trigger.js";

export function render(spec) {
  const sources = spec.sources || [];
  const records = spec.records || [];
  const previous = spec.previous || 0;
  const advanced = advance(sources, previous);
  const fired = fire(records, advanced.watermark, previous);
  const idleCount = sources.reduce((count, source) => count + (source.idle ? 1 : 0), 0);
  return {
    watermark: advanced.watermark,
    fired: fired.fired,
    late: fired.late,
    gated: fired.gated,
    idles: idleCount,
    monotonic: advanced.watermark >= previous
  };
}
