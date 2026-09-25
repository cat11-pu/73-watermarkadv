// trigger.js：按水位触发（fired <= watermark；上次水位到水位之间迟到丢弃；其余 gated）
export function fire(records, watermark, previous = 0) {
  const fired = [];
  const late = [];
  const gated = [];
  for (const record of records) {
    if (record.at <= watermark) {
      fired.push(record.id);
    } else if (record.at < previous) {
      late.push(record.id);
    } else {
      gated.push(record.id);
    }
  }
  return { fired, late, gated };
}
