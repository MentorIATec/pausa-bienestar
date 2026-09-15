import { dayKey, colorBands, emotionColors, monthCells, shiftMonth, inMonth } from './history.js?v=20260914-4';
import { zones, definitions, reasons, needs, dimensions, moments } from './data.js?v=20260914-4';
import { HISTORY_KEY, loadHistory, saveRecord, deleteRecord, clearHistory } from './storage.js?v=20260914-4';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const newState = (moment = 'inicio') => ({ moment, step: 0, zone: '', allFeelings: false, emotions: [], ownEmotion: '', uncertainEmotion: false, reasons: [], reasonText: '', uncertainReason: false, dimension: '', need: '', ownNeed: '', uncertainNeed: false, action: '', ownAction: '', when: '', recognition: '', savedSignature: '', savedId: '' });
let state = newState();
let view = 'reflection';
let historyReturn = 'reflection';
let historyRecords = [];
let historyMode = 'calendar';
let historyMonth = dayKey(new Date()).slice(0, 7);
let selectedDay = '';
const dateName = key => new Date(key + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
let returnFocus = null;

function button(action, label, classes = 'chip', value = '', pressed = null) {
  return `<button type="button" class="${classes}" data-action="${action}" data-value="${esc(value)}"${pressed === null ? '' : ` aria-pressed="${pressed}"`}>${label}</button>`;
}
const needPhrases = { Claridad: 'tener más claridad', Descanso: 'tener un momento de descanso', Compañía: 'tener compañía', 'Espacio personal': 'tener un poco de espacio personal', Movimiento: 'moverme un momento', Apoyo: 'recibir apoyo', 'Reconocer un avance': 'reconocer un avance', 'Seguir como estoy': 'continuar con lo que me está ayudando' };
function needPhrase() { return needPhrases[state.need] || state.ownNeed.trim() || 'tener un momento'; }
function recordNow() {
  return {
    moment: moments[state.moment].label,
    emotionWords: [...state.emotions],
    ownEmotionText: state.ownEmotion.trim(),
    emotion: state.uncertainEmotion ? 'No lo tengo claro todavía' : [...state.emotions, state.ownEmotion.trim()].filter(Boolean).join(' · '),
    reason: state.uncertainReason ? 'No lo tengo claro todavía' : [...state.reasons, state.reasonText.trim()].filter(Boolean).join(' · '),
    dimension: state.dimension,
    need: state.uncertainNeed ? 'Todavía no sé qué necesito' : state.ownNeed.trim() || state.need,
    action: state.ownAction.trim() || state.action,
    when: state.when,
    recognition: state.moment === 'cierre' ? state.recognition.trim() : '',
  };
}
function setFeedback(message, focus = false) {
  $('feedback').textContent = message;
  if (focus) { $('feedback').tabIndex = -1; $('feedback').focus(); }
}
function canContinue() {
  if (state.step === 0) return state.uncertainEmotion || state.emotions.length > 0 || !!state.ownEmotion.trim();
  if (state.step === 2) return state.uncertainNeed || !!state.need || !!state.ownNeed.trim();
  return true;
}
function field(id, label, value, max, placeholder = '', area = false, help = '') {
  return `<div class="field"><label for="${id}">${label} <span class="optional">(opcional)</span></label>${area
    ? `<textarea id="${id}" data-field="${id}" maxlength="${max}" placeholder="${esc(placeholder)}"${help ? ` aria-describedby="${id}-help"` : ''}>${esc(value)}</textarea>`
    : `<input id="${id}" data-field="${id}" type="text" maxlength="${max}" autocomplete="off" value="${esc(value)}" placeholder="${esc(placeholder)}"${help ? ` aria-describedby="${id}-help"` : ''}>`}${help ? `<p class="field-help" id="${id}-help">${help}</p>` : ''}</div>`;
}
function nav(label, optional = '') {
  return `<div class="nav-actions">${state.step > 0 ? button('back', 'Volver', 'outline') : '<span class="nav-start">Sin respuestas correctas.</span>'}${button('next', `${label} <span aria-hidden="true">→</span>`, 'primary')}</div>${optional ? button('skip-reason', optional, 'text-button') : ''}`;
}
function updateCompanion() {
  const r = recordNow();
  $('companion').innerHTML = `<section class="companion-card"><p class="eyebrow">Tu hilo de reflexión</p><h2>Lo que vas reconociendo</h2><p class="lead-note">Puedes volver y ajustar tus palabras cuando quieras.</p><dl class="companion-list">${[
    ['Siento', r.emotion, 'Una palabra, una mezcla…'],
    ['Puede estar influyendo', r.reason, 'No hace falta saber por qué.'],
    ['Me ayudaría', r.need, 'Lo que tenga sentido para ti.'],
    ['Puedo', r.action, 'Un paso pequeño y posible.'],
  ].map(([label, value, empty]) => `<div><dt>${label}</dt><dd${value ? '' : ' class="placeholder"'}>${esc(value || empty)}</dd></div>`).join('')}</dl></section><div class="companion-bottom"><div class="helper-rule"></div><strong>Tu emoción no es una calificación.</strong>La pausa puede servirte aunque sigas sintiendo lo mismo. No tienes que cambiar de zona ni explicar algo personal.</div>`;
}
function updateHeader() {
  $('greeting').textContent = moments[state.moment].title;
  $('invitation').textContent = moments[state.moment].description;
  $('moments').innerHTML = Object.entries(moments).map(([key, moment]) => button('moment', moment.label, '', key, state.moment === key)).join('');
  $('progress').innerHTML = state.step === 3 ? '<p class="summary-label">Reconocer · comprender · elegir</p>' : `<ol class="stepper" aria-label="Pasos de mi pausa">${['Reconocer', 'Comprender', 'Elegir'].map((label, i) => `<li class="${state.step === i ? 'current' : i < state.step ? 'complete' : ''}"${state.step === i ? ' aria-current="step"' : ''}><button type="button" data-action="go-step" data-value="${i}"${i > state.step ? ' disabled' : ''}><span class="step-number" aria-hidden="true">${i < state.step ? '✓' : i + 1}</span>${label}<span class="sr-only">, paso ${i + 1} de 3</span></button></li>`).join('')}</ol>`;
}
function emotionScreen() {
  const pool = state.allFeelings ? zones.flatMap(zone => zone.feelings) : (zones.find(zone => zone.id === state.zone)?.feelings || []);
  return `<h2 tabindex="-1">Reconoce lo que sientes</h2><p class="screen-intro">Observa tu energía y qué tan agradable se siente este momento. El mapa te ayuda a explorar palabras; no decide por ti.</p>
    <div class="meter-wrap" role="group" aria-label="Mapa de energía y agrado">
      <div class="energy-label">↑ Más energía</div><div class="meter-columns"><span>Desagradable</span><span>Agradable</span></div>
      <div class="meter">${zones.map(zone => button('zone', `<strong>${zone.title}</strong><span>${zone.energy} · ${zone.pleasantness.toLowerCase()}</span>`, `zone ${zone.id}`, zone.id, state.zone === zone.id && !state.allFeelings)).join('')}</div>
      <div class="energy-label">↓ Menos energía</div>
    </div><p class="meter-note">La energía es tu nivel de activación; no qué tan intensa es la emoción.</p><details class="starting-hint"><summary>Una pista si no sé por dónde empezar</summary><p>Observa tu postura, tu ritmo y tus ganas de moverte. ¿Notas mucha activación o poca energía? Después, pregúntate si la experiencia se siente agradable, desagradable o como una mezcla.</p><p>No hace falta encajar en una zona. Puedes ver todas las palabras o elegir «No lo tengo claro».</p></details>
    ${pool.length ? `<div class="section-label"><h3>¿Qué palabras se acercan?</h3><span>Elige hasta dos del mapa.</span></div><p id="emotion-feedback" class="feedback" role="status" aria-live="polite"></p><div class="chips" role="group" aria-label="Palabras para mis emociones">${pool.map(([word]) => button('emotion', esc(word), 'chip', word, state.emotions.includes(word))).join('')}</div>` : '<p class="screen-intro">Toca una zona para explorar, o ve directamente a todas las palabras.</p>'}
    ${state.emotions.length ? `<div class="selected-feelings" aria-label="Mis emociones elegidas">${state.emotions.map(word => `<button type="button" class="remove-feeling" data-action="remove-emotion" data-value="${esc(word)}" aria-label="Quitar ${esc(word)}">${esc(word)}<span aria-hidden="true">×</span></button>`).join('')}</div><div class="definition">${state.emotions.map(word => `<p><strong>${esc(word)}.</strong> ${esc(definitions[word])}</p>`).join('')}<p class="field-help">Estas descripciones orientan; tu experiencia puede ser distinta.</p></div>` : ''}
    <div class="choice-footer">${button('all-feelings', state.allFeelings ? 'Ver palabras por zona' : 'Ver todas las emociones', 'text-button')}${button('uncertain-emotion', 'No lo tengo claro', 'unknown', '', state.uncertainEmotion)}</div>
    ${field('ownEmotion', 'O usa tus propias palabras', state.ownEmotion, 100, 'Siento una mezcla de…')}
    ${nav('Continuar')}${button('pass', 'Prefiero pasar esta vez', 'text-button')}`;
}
function reasonScreen() {
  const emotion = recordNow().emotion;
  return `<h2 tabindex="-1">${moments[state.moment].reason}</h2><p class="screen-intro">Explora una posible relación, sin tener que encontrar una explicación. Puedes elegir varias opciones o pasar este paso.</p>
    <div class="bridge-note"><p>Has reconocido: <strong>${esc(emotion)}</strong>.</p></div>
    <div class="chips" role="group" aria-label="Posibles razones">${reasons.map(reason => button('reason', esc(reason), 'chip', reason, state.reasons.includes(reason))).join('')}</div>
    <div class="choice-footer">${button('uncertain-reason', 'No lo tengo claro', 'unknown', '', state.uncertainReason)}</div>
    ${field('reasonText', 'Si quieres, añade algo', state.reasonText, 300, 'Creo que tiene que ver con…', true)}
    <details class="expand" ${state.dimension ? 'open' : ''}><summary>Conectarlo con mi bienestar <span class="optional">(opcional)</span></summary><p>Una emoción es una experiencia del momento. Relacionarla con un área no significa evaluar de nuevo esa dimensión.</p><div class="field"><label for="dimension">Área con la que lo relaciono</label><select id="dimension" data-field="dimension"><option value="">Sin elegir</option>${dimensions.map(d => `<option${state.dimension === d ? ' selected' : ''}>${d}</option>`).join('')}</select></div></details>
    ${nav('Continuar', 'Prefiero omitir esta reflexión')}`;
}
function actionSuggestions() {
  if (state.ownNeed.trim()) return ['Pedir lo que necesito de forma concreta', 'Dar tiempo a lo que siento'];
  return needs.find(need => need.name === state.need)?.actions || ['Dar tiempo a lo que siento', 'Volver a hacer una pausa si lo necesito'];
}
function renderActionOptions() {
  return actionSuggestions().map(action => button('action', esc(action), 'chip', action, state.action === action)).join('');
}
function needScreen() {
  return `<h2 tabindex="-1">${moments[state.moment].need}</h2><p class="screen-intro">Una misma emoción puede acompañarse de necesidades distintas. Elige lo que tenga sentido para ti.</p>
    <div class="need-grid" role="group" aria-label="Lo que me ayudaría">${needs.map(need => button('need', `${esc(need.name)}<small>${esc(need.hint)}</small>`, 'chip', need.name, state.need === need.name)).join('')}</div>
    <div class="choice-footer">${button('uncertain-need', 'Todavía no sé', 'unknown', '', state.uncertainNeed)}</div>
    ${field('ownNeed', 'Otra necesidad', state.ownNeed, 120, 'Me ayudaría…')}
    <section class="action-block" aria-label="Mi siguiente paso"><h3>Un paso que sí sea posible</h3><p class="screen-intro" id="action-hint">${state.need || state.ownNeed.trim() || state.uncertainNeed ? 'Estas son ideas para explorar, no instrucciones. Puedes adaptarlas o cerrar sin elegir una acción.' : 'Primero puedes elegir una necesidad. Si aún no la tienes clara, también puedes escribir una acción propia.'}</p>
      <div class="action-options" id="action-options">${state.need || state.ownNeed.trim() || state.uncertainNeed ? renderActionOptions() : ''}</div>
      ${field('ownAction', 'Mi propia acción', state.ownAction, 180, 'Puedo…')}
      <fieldset class="timing" id="timing" ${state.action || state.ownAction.trim() ? '' : 'hidden'}><legend class="field-label">¿Cuándo podría hacerlo? <span class="optional">(opcional)</span></legend><div class="chips">${['Ahora', 'En el próximo descanso', 'Más tarde hoy', ...(state.moment === 'cierre' ? ['Mañana'] : [])].map(when => button('when', when, 'chip', when, state.when === when)).join('')}</div></fieldset>
    </section>
    ${state.moment === 'cierre' ? `<section class="action-block"><h3>Algo que quiero reconocer</h3><p class="screen-intro">Puede ser algo que te ayudó, un esfuerzo o un límite que cuidaste. No tiene que haber sido un día fácil.</p>${field('recognition', 'Me llevo de hoy', state.recognition, 220, 'Hoy reconozco…', true)}</section>` : ''}
    ${nav('Ver mi pausa')}`;
}
function summaryRow(label, value, step) {
  return `<div class="summary-row"><div><dt>${label}</dt><dd>${esc(value || 'Lo dejo abierto por ahora.')}</dd></div>${button('go-step', 'Revisar', 'text-button', String(step))}</div>`;
}
function summaryScreen() {
  const r = recordNow();
  const isSaved = state.savedSignature === JSON.stringify(r);
  return `<h2 tabindex="-1">Esto reconozco ahora</h2><p class="screen-intro">${esc(r.moment)}. No necesitas sentirte diferente para llevarte algo de esta pausa.</p>
    <dl class="summary-list">${summaryRow('Cómo me siento', r.emotion, 0)}${r.reason || r.dimension ? summaryRow('Puede estar influyendo', [r.reason, r.dimension ? `Lo relaciono con: ${r.dimension}` : ''].filter(Boolean).join('\n'), 1) : ''}${summaryRow('Me ayudaría', r.need, 2)}
      <div class="action-summary"><dt>Mi siguiente paso</dt><dd>${esc(r.action || 'Todavía no elijo una acción.')}</dd>${r.when ? `<p>${esc(r.when)}</p>` : ''}</div>
      ${r.recognition ? summaryRow('Me llevo de hoy', r.recognition, 2) : ''}
    </dl>
    <details class="expand"><summary>Si quiero expresarlo a alguien</summary><p>Puedes compartir solo tu necesidad. Tú eliges con quién, cómo y cuánto contar.</p><div class="bridge-note"><p>${r.need && !state.uncertainNeed ? `«Me ayudaría ${esc(needPhrase())}. ¿Podemos ver una opción posible?»` : '«Todavía estoy tratando de entender qué necesito. Me ayudaría tener un momento.»'}</p></div><p>Esta frase es un punto de partida: ajústala a tu forma de hablar. No se envía a nadie desde aquí.</p></details>
    <section class="saving" aria-label="Guardar mi pausa"><h3>¿Quieres volver a leerla?</h3><p>Se guarda en este navegador. Puedes borrarla desde Mi historial.</p><button type="button" class="outline" data-action="save" ${isSaved ? 'disabled' : ''}>${isSaved ? 'Pausa guardada en este dispositivo' : 'Guardar en este dispositivo'}</button><p class="save-result" id="save-result" role="status" aria-live="polite">${isSaved ? 'Disponible en Mi historial.' : 'Todavía no se ha guardado esta versión.'}</p></section>
    <div class="summary-end">${button('go-step', 'Revisar mi siguiente paso', 'text-button', '2')}${button('finish', 'Terminar mi pausa', 'primary')}</div>`;
}
function render({ focus = true, preserveScroll = false } = {}) {
  const active = document.activeElement;
  const focusTarget = active?.dataset.action ? { action: active.dataset.action, value: active.dataset.value } : null;
  view = 'reflection';
  document.querySelector('.skip-link').hidden = false;
  $('intro').hidden = false;
  $('workspace').hidden = false;
  $('history-panel').hidden = true;
  $('finished').hidden = true;
  updateHeader();
  $('screen').innerHTML = [emotionScreen, reasonScreen, needScreen, summaryScreen][state.step]();
  updateCompanion();
  setFeedback('');
  if (focus) {
    $('screen').querySelector('h2').focus({ preventScroll: true });
    if (!preserveScroll) $('reflection').scrollIntoView({ block: 'start', behavior: 'instant' });
  } else if (focusTarget) {
    const candidate = [...document.querySelectorAll('[data-action]')].find(el => el.dataset.action === focusTarget.action && el.dataset.value === focusTarget.value);
    candidate?.focus({ preventScroll: true });
  }
}
function finish(passed = false) {
  const saved = !!state.savedId;
  const moment = state.moment;
  state = newState(moment); // Remove the in-memory reflection when the person ends it.
  view = 'finished';
  document.querySelector('.skip-link').hidden = true;
  $('intro').hidden = true;
  $('workspace').hidden = true;
  $('history-panel').hidden = true;
  $('finished').hidden = false;
  $('screen').replaceChildren();
  $('companion').replaceChildren();
  $('finished').innerHTML = `<img class="pause-mark" src="./pause.svg" alt=""><p class="eyebrow">A tu ritmo</p><h1 tabindex="-1">${passed ? 'También está bien pasar.' : 'Llévate lo que te sirva.'}</h1><p>${passed ? 'Puedes volver cuando tenga sentido para ti. Participar no implica tener que nombrar o explicar lo que sientes.' : 'Un poco más de claridad, una necesidad reconocida o una acción posible. Eso puede ser suficiente por ahora.'}</p><p class="private-note">Las respuestas de esta sesión se han retirado de la pantalla.${saved ? ' La copia que elegiste guardar permanece en Mi historial.' : ' Esta pausa no se guardó.'}</p><div class="finished-actions">${button('restart', 'Hacer otra pausa', 'primary')}<a class="outline" href="../">Volver al inicio</a></div>`;
  $('finished').querySelector('h1').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function safeHistory() {
  try { return loadHistory(window.localStorage); }
  catch { return { records: [], unavailable: ['storage'] }; }
}
function bandsMarkup(records) {
  return colorBands(records).map(color => `<span style="background:${emotionColors[color]}" aria-hidden="true"></span>`).join('');
}
function calendarMarkup(records) {
  const monthRecords = inMonth(records, historyMonth);
  const days = new Set(monthRecords.map(r => dayKey(r.date)));
  const monthName = new Date(historyMonth + '-01T12:00:00').toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const byDay = new Map([...days].map(day => [day, monthRecords.filter(r => dayKey(r.date) === day)]));
  return `<section class="calendar" aria-label="Calendario de emociones"><div class="calendar-top"><div><h2 id="calendar-month" aria-live="polite">${esc(monthName)}</h2><p>${monthRecords.length} ${monthRecords.length === 1 ? 'pausa' : 'pausas'} · ${days.size} ${days.size === 1 ? 'día con registros' : 'días con registros'}</p></div><div class="month-nav">${button('month', '‹', 'outline', '-1')}${button('month-today', 'Hoy', 'quiet')}${button('month', '›', 'outline', '1')}</div></div>
    <div class="weekdays" aria-hidden="true">${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => `<span>${day}</span>`).join('')}</div><div class="calendar-grid" aria-labelledby="calendar-month">${monthCells(historyMonth).map(day => {
      if (!day) return '<span class="calendar-spacer" aria-hidden="true"></span>';
      const entries = byDay.get(day) || [];
      return `<button type="button" class="calendar-day ${entries.length ? 'has-records' : ''}" data-action="day" data-value="${day}" aria-pressed="${selectedDay === day}" aria-label="${esc(dateName(day))}: ${entries.length ? `${entries.length} ${entries.length === 1 ? 'pausa' : 'pausas'}. ${entries.map(r => r.emotion).join('; ')}` : 'Sin pausas guardadas'}" ${day === dayKey(new Date()) ? 'aria-current="date"' : ''}><span class="day-number">${Number(day.slice(-2))}</span><span class="day-bands">${bandsMarkup(entries)}</span><small>${entries.length || '<span aria-hidden="true">—</span>'}</small></button>`;
    }).join('')}</div><div class="calendar-legend">${[['red', 'Más energía · desagradable'], ['yellow', 'Más energía · agradable'], ['blue', 'Menos energía · desagradable'], ['green', 'Menos energía · agradable'], ['neutral', 'Palabras propias o sin clasificar']].map(([color, label]) => `<span><i style="background:${emotionColors[color]}" aria-hidden="true"></i>${label}</span>`).join('')}</div><p class="calendar-help">Cada casilla reúne las emociones de ese día. Tócala para ver cada pausa en orden. Un día sin registros solo significa que no guardaste una pausa.</p><details class="calendar-explanation"><summary>Cómo leer los colores</summary><p>Las franjas muestran las zonas de las palabras elegidas, sin promediarlas ni decidir cuál fue tu emoción principal. Una mezcla conserva sus colores. Los textos propios y las emociones no reconocidas se muestran en gris.</p><p>En registros anteriores, el color se reconstruye únicamente cuando la palabra coincide con el vocabulario del mapa. Los colores describen lo registrado; no indican progreso ni mejoría.</p></details></section>`;
}
function historyView({ focus = true, message = '' } = {}) {
  const active = document.activeElement;
  const oldAction = active?.dataset.action, oldValue = active?.dataset.value;
  if (view !== 'history') historyReturn = view;
  view = 'history';
  document.querySelector('.skip-link').hidden = true;
  const result = safeHistory();
  const allRecords = result.records;
  historyRecords = historyMode === 'calendar' ? (selectedDay ? allRecords.filter(r => dayKey(r.date) === selectedDay).reverse() : inMonth(allRecords, historyMonth)) : allRecords;
  $('intro').hidden = true; $('workspace').hidden = true; $('finished').hidden = true;
  const panel = $('history-panel'); panel.hidden = false;
  panel.innerHTML = `<div class="view-heading"><div><p class="eyebrow">Lo que has elegido guardar</p><h1 tabindex="-1">Mi historial</h1><p>Tus pausas, día a día.</p></div>${button('return', 'Volver a mi pausa', 'outline')}</div>
    <div class="history-view-picker" role="group" aria-label="Vista del historial">${button('history-mode', 'Calendario', 'chip', 'calendar', historyMode === 'calendar')}${button('history-mode', 'Lista', 'chip', 'list', historyMode === 'list')}</div>
    ${result.unavailable.length ? '<p class="warning">Hay datos que no se pudieron leer. Se conservan sin cambios. Borrar todo también eliminará esos datos.</p>' : ''}
    ${historyMode === 'calendar' ? calendarMarkup(allRecords) : ''}
    <div class="history-tools"><span>${selectedDay && historyMode === 'calendar' ? esc(dateName(selectedDay)) + ' · ' : ''}${historyRecords.length} ${historyRecords.length === 1 ? 'pausa' : 'pausas'}${historyMode === 'calendar' && !selectedDay ? ' este mes' : ''}</span>${selectedDay && historyMode === 'calendar' ? button('all-days', 'Ver todo el mes', 'text-button') : ''}${allRecords.length || result.unavailable.length ? button('clear-request', 'Borrar todo el historial', 'text-button danger') : ''}</div><div id="clear-confirm"></div><p id="history-status" class="toast" role="status" aria-live="polite">${esc(message)}</p>
    <div class="history-timeline">${historyRecords.length ? historyRecords.map((record, i) => `<article class="entry"><div class="entry-colors" aria-hidden="true">${bandsMarkup([record])}</div><time datetime="${esc(record.date)}">${esc(new Date(record.date).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }))}</time><span class="moment-label"> · ${esc(record.moment)}</span><h2>${esc(record.emotion || 'Sin una palabra todavía')}</h2><dl>${[
      ['Puede estar influyendo', record.reason], ['Lo relaciono con', record.dimension], ['Me ayudaría', record.need], ['Mi siguiente paso', record.action], ['Cuándo', record.when], ['Me llevo de hoy', record.recognition],
    ].filter(([, value]) => value).map(([label, value]) => `<div${label === 'Mi siguiente paso' ? ' class="saved-action"' : ''}><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${button('delete-request', 'Borrar esta pausa', 'text-button danger', String(i))}<div id="delete-confirm-${i}"></div></article>`).join('') : `<div class="history-empty"><h2>${allRecords.length ? 'No hay pausas en este período.' : 'Aquí caben tus momentos.'}</h2><p>${allRecords.length ? 'Puedes explorar otro mes o ver todos tus registros en Lista.' : 'Al terminar una pausa, puedes elegir guardarla. El calendario se irá formando con tus propios registros.'}</p></div>`}</div><p class="private-note">Guardado en este navegador. No se sincroniza con el check-in de siete dimensiones.</p>`;
  panel.querySelector('[data-action="month"][data-value="-1"]')?.setAttribute('aria-label', 'Mes anterior');
  panel.querySelector('[data-action="month"][data-value="1"]')?.setAttribute('aria-label', 'Mes siguiente');
  if (focus) { panel.querySelector('h1').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
  else if (oldAction) [...panel.querySelectorAll('[data-action]')].find(el => el.dataset.action === oldAction && el.dataset.value === oldValue)?.focus({ preventScroll: true });
}
function showDialog() {
  const dialog = $('info-dialog');
  returnFocus = document.activeElement;
  $('dialog-content').innerHTML = `<h2 id="dialog-title">Sobre esta pausa y tus datos</h2>
    <h3>Una herramienta de reflexión</h3><p>Mi pausa acompaña el reconocimiento y la expresión de emociones, la exploración de posibles razones y la elección de una respuesta. La reflexión sobre necesidades forma parte de esta propuesta pedagógica.</p><p>Se inspira en las habilidades de RULER y en los ejes de energía y agrado del Mood Meter. No es una herramienta oficial de Yale ni equivale a implementar el programa completo. No es una evaluación ni un diagnóstico.</p><p><a href="https://rulerapproach.org/about/what-is-ruler/" target="_blank" rel="noopener noreferrer">Conocer el marco RULER ↗</a></p>
    <h3>Tú decides qué guardar</h3><p>No se solicita nombre ni matrícula. Tus respuestas permanecen en la sesión, salvo que elijas guardar una copia. Al terminar o recargar la página se retira la reflexión en curso; lo guardado permanece en este navegador.</p><p>Las respuestas no se envían a un servidor ni a tu docente. El alojamiento puede registrar datos técnicos de visita; eso no incluye los campos de tu reflexión.</p><p>Quien use este navegador podría ver el historial. Borrar los datos del navegador lo elimina; no se sincroniza entre dispositivos. Puedes borrar una pausa o todas desde Mi historial.</p><p>Se reconocen los formatos anteriores de Mi pausa en este mismo navegador y dirección. El historial de un archivo descargado, otro dominio o el check-in original no se transfiere automáticamente.</p>
    <h3>Si necesitas acompañamiento</h3><p>Puedes acudir a una persona de confianza o a tu mentor o mentora. La pausa no sustituye ese acompañamiento.</p><a href="https://tqueremos.tec.mx/es" target="_blank" rel="noopener noreferrer">Consultar recursos de bienestar · TQueremos ↗</a>`;
  dialog.showModal();
  $('close-dialog').focus();
}
function restoreAfterHistory() {
  if (historyReturn === 'finished') {
    view = 'finished'; $('history-panel').hidden = true; $('finished').hidden = false;
    $('finished').querySelector('h1')?.focus();
  } else render();
}
function removeSavedMarker(id = null) {
  if (id === null || state.savedId === id) { state.savedId = ''; state.savedSignature = ''; }
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, value } = target.dataset;
  switch (action) {
    case 'history-mode': historyMode = value; historyView({ focus: false }); break;
    case 'month': historyMonth = shiftMonth(historyMonth, Number(value)); selectedDay = ''; historyView({ focus: false }); break;
    case 'month-today': historyMonth = dayKey(new Date()).slice(0, 7); selectedDay = dayKey(new Date()); historyView({ focus: false }); break;
    case 'day': selectedDay = selectedDay === value ? '' : value; historyView({ focus: false, message: selectedDay ? 'Pausas del día en orden, de la primera a la última.' : 'Mostrando el mes completo.' }); break;
    case 'all-days': selectedDay = ''; historyView({ focus: false }); break;
    case 'moment': state.moment = value; render({ focus: false }); break;
    case 'zone': state.zone = value; state.allFeelings = false; render({ focus: false }); break;
    case 'all-feelings': state.allFeelings = !state.allFeelings; render({ focus: false }); break;
    case 'emotion': {
      if (state.emotions.includes(value)) state.emotions = state.emotions.filter(word => word !== value);
      else {
        if (state.emotions.length === 2) { $('emotion-feedback').textContent = 'Ya elegiste dos palabras. Quita una de tus elecciones si quieres añadir otra.'; return; }
        state.emotions.push(value);
      }
      state.uncertainEmotion = false; render({ focus: false }); break;
    }
    case 'remove-emotion': state.emotions = state.emotions.filter(word => word !== value); render({ focus: false }); $('screen').querySelector('[data-action="all-feelings"]')?.focus({ preventScroll: true }); break;
    case 'uncertain-emotion': state.uncertainEmotion = !state.uncertainEmotion; if (state.uncertainEmotion) { state.emotions = []; state.ownEmotion = ''; } render({ focus: false }); break;
    case 'reason': state.reasons = state.reasons.includes(value) ? state.reasons.filter(reason => reason !== value) : [...state.reasons, value]; state.uncertainReason = false; render({ focus: false }); break;
    case 'uncertain-reason': state.uncertainReason = !state.uncertainReason; if (state.uncertainReason) { state.reasons = []; state.reasonText = ''; } render({ focus: false }); break;
    case 'need': state.need = state.need === value ? '' : value; state.ownNeed = ''; state.uncertainNeed = false; state.action = ''; state.when = ''; render({ focus: false }); break;
    case 'uncertain-need': state.uncertainNeed = !state.uncertainNeed; if (state.uncertainNeed) { state.need = ''; state.ownNeed = ''; state.action = ''; state.when = ''; } render({ focus: false }); break;
    case 'action': state.action = state.action === value ? '' : value; state.ownAction = ''; if (!state.action) state.when = ''; render({ focus: false, preserveScroll: true }); break;
    case 'when': state.when = state.when === value ? '' : value; render({ focus: false }); break;
    case 'next':
      if (!canContinue()) { setFeedback(state.step === 0 ? 'Elige una palabra, escribe la tuya o usa «No lo tengo claro».' : 'Elige una necesidad, escribe la tuya o usa «Todavía no sé».', true); return; }
      state.step++; render(); break;
    case 'back': state.step = Math.max(0, state.step - 1); render(); break;
    case 'go-step': if (Number(value) <= state.step) { state.step = Number(value); render(); } break;
    case 'skip-reason': state.reasons = []; state.reasonText = ''; state.uncertainReason = false; state.dimension = ''; state.step++; render(); break;
    case 'pass': finish(true); break;
    case 'finish': finish(); break;
    case 'restart': state = newState(state.moment); render(); break;
    case 'save': {
      const record = recordNow();
      if (state.savedSignature === JSON.stringify(record)) return;
      try {
        const saved = saveRecord(window.localStorage, record, crypto.randomUUID(), new Date().toISOString());
        state.savedId = saved.id; state.savedSignature = JSON.stringify(record);
        target.disabled = true; target.textContent = 'Pausa guardada en este dispositivo';
        $('save-result').textContent = 'Guardada. Puedes consultarla y borrarla en Mi historial.';
      } catch { $('save-result').textContent = 'No se pudo guardar. El almacenamiento puede estar bloqueado o lleno, o contener datos que no se pueden leer. Tu reflexión sigue aquí y no se ha borrado el historial.'; }
      break;
    }
    case 'return': restoreAfterHistory(); break;
    case 'clear-request':
      $('clear-confirm').innerHTML = `<div class="confirm-box"><p>Se borrarán todas las pausas de Mi pausa guardadas en este navegador, incluidas las de versiones anteriores. No se puede deshacer.</p>${button('clear-confirm', 'Sí, borrar todo', 'outline danger')}${button('clear-cancel', 'Cancelar', 'outline')}</div>`;
      $('clear-confirm').querySelector('[data-action="clear-cancel"]').focus(); break;
    case 'clear-cancel': $('clear-confirm').replaceChildren(); $('history-panel').querySelector('[data-action="clear-request"]').focus(); break;
    case 'clear-confirm':
      try { clearHistory(window.localStorage); removeSavedMarker(); historyView({ message: 'Historial borrado.' }); }
      catch { historyView({ message: 'No se pudo completar el borrado. Revisa los registros que siguen disponibles.' }); }
      break;
    case 'delete-request': {
      const holder = $(`delete-confirm-${value}`);
      holder.innerHTML = `<div class="confirm-box"><p>¿Borrar esta pausa? No se puede deshacer.</p>${button('delete-confirm', 'Sí, borrar esta pausa', 'outline danger', value)}${button('delete-cancel', 'Cancelar', 'outline', value)}</div>`;
      holder.querySelector('[data-action="delete-cancel"]').focus(); break;
    }
    case 'delete-cancel': $(`delete-confirm-${value}`).replaceChildren(); $('history-panel').querySelector(`[data-action="delete-request"][data-value="${value}"]`).focus(); break;
    case 'delete-confirm': {
      const record = historyRecords[Number(value)];
      if (!record) return;
      try { deleteRecord(window.localStorage, record); if (record.source === HISTORY_KEY) removeSavedMarker(record.id); historyView({ message: 'Pausa borrada.' }); }
      catch { $('history-status').textContent = 'No se pudo borrar la pausa. Los registros disponibles siguen aquí.'; }
      break;
    }
  }
});

function handleField(event) {
  const key = event.target.dataset.field;
  if (!key || !(key in state)) return;
  state[key] = event.target.value;
  if (key === 'ownEmotion' && state.ownEmotion.trim()) {
    state.uncertainEmotion = false;
    $('screen').querySelector('[data-action="uncertain-emotion"]')?.setAttribute('aria-pressed', 'false');
  }
  if (key === 'reasonText' && state.reasonText.trim()) {
    state.uncertainReason = false;
    $('screen').querySelector('[data-action="uncertain-reason"]')?.setAttribute('aria-pressed', 'false');
  }
  if (key === 'ownNeed') {
    if (state.ownNeed.trim()) {
      state.need = ''; state.uncertainNeed = false; state.action = ''; state.when = '';
      $('screen').querySelectorAll('[data-action="when"]').forEach(el => el.setAttribute('aria-pressed', 'false'));
      $('screen').querySelectorAll('[data-action="need"], [data-action="uncertain-need"]').forEach(el => el.setAttribute('aria-pressed', 'false'));
    }
    $('action-options').innerHTML = state.need || state.ownNeed.trim() || state.uncertainNeed ? renderActionOptions() : '';
    $('action-hint').textContent = 'Estas son ideas para explorar, no instrucciones. Puedes adaptarlas o cerrar sin elegir una acción.';
    $('timing').hidden = !state.ownAction.trim() && !state.action;
  }
  if (key === 'ownAction') {
    if (state.ownAction.trim()) {
      state.action = '';
      $('screen').querySelectorAll('[data-action="action"]').forEach(el => el.setAttribute('aria-pressed', 'false'));
    }
    $('timing').hidden = !state.ownAction.trim() && !state.action;
    if ($('timing').hidden) state.when = '';
  }
  setFeedback('');
  updateCompanion();
}
$('screen').addEventListener('input', handleField);
$('screen').addEventListener('change', event => { if (event.target.tagName === 'SELECT') handleField(event); });
$('open-history').addEventListener('click', () => historyView());
$('open-about').addEventListener('click', () => showDialog());
$('close-dialog').addEventListener('click', () => $('info-dialog').close());
$('info-dialog').addEventListener('close', () => returnFocus?.focus());
render({ focus: false });
