// sources.js：各源进度推进全局水位
// 空转源需显式标记 idle，不参与取最小值（否则水位会被迟迟不来数据的源拖住）。
// 水位取所有活动源进度的最小值，且相对上次水位只许单调不减；回退报 E_WATERMARK_BACK。
export function advance(sources, previousWatermark = 0) {
  let watermark = null;
  for (const source of sources) {
    if (source.idle) continue;
    if (watermark === null || source.at < watermark) watermark = source.at;
  }
  // 没有任何活动源时维持上次水位，而不是退回 0。
  if (watermark === null) watermark = previousWatermark;
  if (watermark < previousWatermark) {
    const error = new Error(
      "watermark moved back: " + watermark + " < " + previousWatermark
    );
    error.code = "E_WATERMARK_BACK";
    throw error;
  }
  return { watermark };
}
