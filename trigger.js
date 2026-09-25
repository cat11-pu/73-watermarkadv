// trigger.js：按全局水位给记录分类（单次线性扫描，不嵌套重扫）
// 时间不高于水位 -> fired；高于水位却低于上次水位 -> late（迟到丢弃，
// 不算进已触发结果）；其余 -> gated（拦下等待后续推进）。
export function fire(records, watermark, previousWatermark = 0) {
  const fired = [];
  const late = [];
  const gated = [];
  for (const record of records) {
    if (record.at <= watermark) {
      fired.push(record.id);
    } else if (record.at < previousWatermark) {
      late.push(record.id);
    } else {
      gated.push(record.id);
    }
  }
  return { fired, late, gated };
}
