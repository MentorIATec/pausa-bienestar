import test from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, recordColors, colorBands, monthCells, shiftMonth, inMonth } from '../mi-pausa/history.js';
test('month alignment and leap years', () => { assert.equal(monthCells('2024-02').filter(Boolean).length,29);assert.equal(monthCells('2026-02').filter(Boolean).length,28);assert.deepEqual(monthCells('2026-09').slice(0,3),[null,'2026-09-01','2026-09-02']); });
test('month navigation crosses years',()=>{assert.equal(shiftMonth('2026-01',-1),'2025-12');assert.equal(shiftMonth('2026-12',1),'2027-01');});
test('local dates used instead of UTC buckets',()=>{const d=new Date(2026,8,14,23,30);assert.equal(dayKey(d),'2026-09-14');assert.equal(inMonth([{date:d.toISOString()}],'2026-09').length,1);});
test('old records recognize exact vocabulary only',()=>{assert.deepEqual(recordColors({emotion:'Entusiasmo · Nervios'}),['yellow','red']);assert.deepEqual(recordColors({emotion:'No siento calma'}),['neutral']);});
test('new free text is neutral even if it resembles a map word',()=>{assert.deepEqual(recordColors({emotionWords:['Nervios'],ownEmotionText:'Calma'}),['red','neutral']);});
test('mixed days retain every category without a dominant mood',()=>{assert.deepEqual(colorBands([{emotion:'Calma'},{emotion:'Tristeza'},{emotion:'No lo tengo claro'}]),['blue','green','neutral']);assert.deepEqual(colorBands([]),[]);});
