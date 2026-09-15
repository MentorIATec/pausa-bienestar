export const HISTORY_KEY = 'mi-pausa.history.v2';
const SOURCES = [HISTORY_KEY, 'mi-pausa.history.v1', 'mi-pausa-history-v1'];
const text = value => typeof value === 'string' ? value : '';
export function normalize(row, source) {
  if (!row || typeof row !== 'object' || typeof row.id !== 'string' || !row.id || !Number.isFinite(Date.parse(row.date))) throw new Error('No se pudo leer un registro del historial.');
  const legacyPublished = source === 'mi-pausa-history-v1';
  return {
    id: row.id, date: row.date, source,
    moment: text(row.moment),
    emotionWords: Array.isArray(row.emotionWords) ? row.emotionWords.filter(word => typeof word === "string") : null,
    ownEmotionText: text(row.ownEmotionText),
    emotion: legacyPublished ? text(row.ownEmotion).trim() || text(row.emotion) : text(row.emotion),
    reason: legacyPublished ? [text(row.reason), text(row.detail)].filter(Boolean).join(' · ') : text(row.reason),
    need: legacyPublished ? text(row.ownNeed).trim() || text(row.need) : text(row.need),
    action: text(row.action), dimension: text(row.dimension), when: text(row.when), recognition: text(row.recognition),
  };
}
function readSource(storage, key) {
  const raw = storage.getItem(key);
  if (raw === null) return [];
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows)) throw new Error('El historial no tiene el formato esperado.');
  rows.forEach(row => normalize(row, key));
  return rows;
}
export function loadHistory(storage) {
  const records = [], unavailable = [];
  for (const key of SOURCES) {
    try { records.push(...readSource(storage, key).map(row => normalize(row, key))); }
    catch { unavailable.push(key); }
  }
  return { records: records.sort((a, b) => new Date(b.date) - new Date(a.date)), unavailable };
}
export function saveRecord(storage, record, id, date) {
  const rows = readSource(storage, HISTORY_KEY);
  const saved = { ...record, id, date };
  normalize(saved, HISTORY_KEY);
  storage.setItem(HISTORY_KEY, JSON.stringify([saved, ...rows]));
  return { ...saved, source: HISTORY_KEY };
}
export function deleteRecord(storage, record) {
  if (!SOURCES.includes(record.source)) throw new Error('Origen de historial desconocido.');
  const rows = readSource(storage, record.source);
  storage.setItem(record.source, JSON.stringify(rows.filter(row => row.id !== record.id)));
}
export function clearHistory(storage) {
  // Only remove this application's keys, never other apps on the GitHub Pages origin.
  for (const key of SOURCES) storage.removeItem(key);
}
