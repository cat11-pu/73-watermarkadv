// sources.js：各源进度推进（取非空转源进度的最小值，水位单调不减）
export function advance(sources, previous = 0) {
  let min = null;
  for (const source of sources) {
    if (source.idle) continue;
    if (min === null || source.at < min) min = source.at;
  }
  const watermark = min === null ? previous : min;
  if (watermark < previous) {
    const error = new Error("E_WATERMARK_BACK: watermark " + watermark + " < previous " + previous);
    error.code = "E_WATERMARK_BACK";
    throw error;
  }
  return { watermark };
}
