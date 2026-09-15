import { zones } from './data.js?v=20260914-6';
export const emotionColors = { red: '#b54965', yellow: '#d5a72b', blue: '#668dc1', green: '#439272', neutral: '#847c94' };
const vocabulary = new Map(zones.flatMap(zone => zone.feelings.map(([word]) => [word.toLocaleLowerCase('es'), zone.id])));
export function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function recordColors(record) {
  const words = Array.isArray(record.emotionWords) ? [...record.emotionWords, ...(record.ownEmotionText ? [null] : [])] : (record.emotion || '').split(' · ');
  const colors = [...new Set(words.map(word => word === null ? 'neutral' : vocabulary.get(word.trim().toLocaleLowerCase('es')) || 'neutral'))];
  return colors.length ? colors : ['neutral'];
}
export function colorBands(records) {
  return [...new Set(records.flatMap(recordColors))].sort((a, b) => Object.keys(emotionColors).indexOf(a) - Object.keys(emotionColors).indexOf(b));
}
export function monthCells(month) {
  const [year, number] = month.split('-').map(Number);
  const first = new Date(year, number - 1, 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(year, number, 0, 12).getDate();
  return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];
}
export function shiftMonth(month, delta) {
  const [year, number] = month.split('-').map(Number);
  return dayKey(new Date(year, number - 1 + delta, 1, 12)).slice(0, 7);
}
export function inMonth(records, month) { return records.filter(r => dayKey(r.date).startsWith(month)); }
