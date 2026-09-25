// trigger.js：触发（基线：每条记录都触发、不判迟到）
export function fire(records, watermark) {
  return { fired: records.map((record) => record.id), late: [], gated: [] };
}
