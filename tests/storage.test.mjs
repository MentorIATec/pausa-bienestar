import test from 'node:test';
import assert from 'node:assert/strict';
import { HISTORY_KEY, loadHistory, saveRecord, deleteRecord, clearHistory } from '../mi-pausa/storage.js';
const store = (items = {}) => {
  const map = new Map(Object.entries(items));
  return { map, getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) };
};
const record = { moment: 'Al comenzar', emotion: 'Calma', need: 'Claridad', reason: '', action: 'Pedir un ejemplo', dimension: '', when: 'Ahora', recognition: '' };
const day = '2026-09-15T00:00:00Z';
test('loads the deployed and ChatGPT history formats without rewriting either source', () => {
  const old = JSON.stringify([{ id: 'deployed', date: day, moment: 'Al comenzar', emotion: 'Otra emoción', ownEmotion: 'Curiosidad', reason: 'Una tarea', detail: 'Primer día', need: 'Apoyo', ownNeed: 'Un ejemplo', action: 'Preguntar' }]);
  const chatgpt = JSON.stringify([{ id: 'chatgpt', date: day, ...record, dimension: 'Intelectual' }]);
  const s = store({ 'mi-pausa-history-v1': old, 'mi-pausa.history.v1': chatgpt });
  const result = loadHistory(s);
  assert.equal(result.records.length, 2); assert.equal(result.unavailable.length, 0);
  const r = result.records.find(r => r.id === 'deployed');
  assert.equal(r.emotion, 'Curiosidad'); assert.equal(r.need, 'Un ejemplo'); assert.equal(r.reason, 'Una tarea · Primer día');
  assert.equal(s.getItem('mi-pausa-history-v1'), old); assert.equal(s.getItem('mi-pausa.history.v1'), chatgpt); assert.equal(s.getItem(HISTORY_KEY), null);
});
test('reading empty history never creates storage', () => { const s = store(); assert.equal(loadHistory(s).records.length, 0); assert.equal(s.map.size, 0); });
test('explicit saving adds one current-format record and preserves old entries', () => { const s = store({ 'mi-pausa.history.v1': '[]' }); saveRecord(s, record, 'one', day); assert.equal(loadHistory(s).records.length, 1); assert.equal(s.getItem('mi-pausa.history.v1'), '[]'); });
test('a damaged source does not hide healthy sources or get overwritten', () => {
  const s = store({ 'mi-pausa.history.v1': '{broken' }); saveRecord(s, record, 'one', day);
  const result = loadHistory(s); assert.equal(result.records.length, 1); assert.deepEqual(result.unavailable, ['mi-pausa.history.v1']); assert.equal(s.getItem('mi-pausa.history.v1'), '{broken');
});
test('a damaged destination blocks saving and preserves its exact bytes', () => { const s = store({ [HISTORY_KEY]: '{broken' }); assert.throws(() => saveRecord(s, record, 'one', day)); assert.equal(s.getItem(HISTORY_KEY), '{broken'); });
test('deletion removes only the selected record in its own source', () => {
  const legacy = JSON.stringify([{ ...record, id: 'same-id', date: day }]);
  const s = store({ 'mi-pausa.history.v1': legacy }); const current = saveRecord(s, record, 'same-id', day); deleteRecord(s, current);
  assert.equal(loadHistory(s).records.length, 1); assert.equal(s.getItem('mi-pausa.history.v1'), legacy);
});
test('clear removes only Mi pausa keys, protecting the original check-in and other apps', () => {
  const s = store({ [HISTORY_KEY]: '[]', 'mi-pausa.history.v1': '[]', 'mi-pausa-history-v1': '[]', 'bienestar-checkin-client-key': 'keep', 'another-app': 'keep' });
  clearHistory(s); assert.deepEqual([...s.map.keys()], ['bienestar-checkin-client-key', 'another-app']);
});
test('blocked/quota-exceeded writes report failure', () => {
  const s = store(); s.setItem = () => { throw Error('QuotaExceededError'); }; assert.throws(() => saveRecord(s, record, 'one', day)); assert.equal(loadHistory(s).records.length, 0);
});
test('invalid dates never reach history formatting', () => { const s = store({ [HISTORY_KEY]: JSON.stringify([{ id: 'bad', date: 'not a date' }]) }); assert.deepEqual(loadHistory(s).unavailable, [HISTORY_KEY]); });
