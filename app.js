// app.js：渲染结果
import { advance } from "./sources.js";
import { fire } from "./trigger.js";

export function render(spec) {
  const sources = spec.sources || [];
  const previousWatermark = spec.previous || 0;
  const advanced = advance(sources, previousWatermark);
  const fired = fire(spec.records || [], advanced.watermark, previousWatermark);
  const idles = sources.filter((source) => source.idle).length;
  return { watermark: advanced.watermark, fired: fired.fired, late: fired.late,
           gated: fired.gated, idles, monotonic: advanced.watermark >= previousWatermark };
}
