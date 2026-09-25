// sources.js：各源进度（基线：取所有源的最大值当水位）
export function advance(sources) {
  const times = sources.map((source) => source.at);
  return { watermark: times.length ? Math.max(...times) : 0 };
}
