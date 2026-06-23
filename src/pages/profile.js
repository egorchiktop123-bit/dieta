import { state } from '../state.js'
import { $, wStr, hStr, countUp, toast } from '../utils.js'
import { recalcNorm } from '../calc.js'
import { upsertProfile } from '../db.js'

export function renderProfile() {
  const goalTxt = { gain: 'Набор массы', lose: 'Снижение веса', keep: 'Поддержание' }[state.goal]
  const actTxt = { '1.2': 'Минимальная', '1.375': 'Лёгкая', '1.55': 'Средняя', '1.725': 'Высокая', '1.9': 'Очень высокая' }[state.act]
  const cur = state.weightLogs.length ? state.weightLogs[state.weightLogs.length - 1].weight : state.w
  $('#pfAvatar').textContent = (state.name[0] || '?').toUpperCase()
  $('#pfName').textContent = state.name
  $('#pfGoal').textContent = goalTxt
  $('#pfUid').textContent = '#' + state.userId
  $('#pfW').textContent = wStr(cur)
  $('#pfWg').textContent = wStr(state.wg)
  $('#pfH').textContent = hStr(state.h)
  $('#pfAge').textContent = state.age
  countUp($('#pfKcal'), state.goalKcal, 800)
  $('#pfP').textContent = state.gP
  $('#pfC').textContent = state.gC
  $('#pfF').textContent = state.gF
  $('#pfGoalRow').textContent = goalTxt + ' ›'
  $('#pfActRow').textContent = (actTxt || '—') + ' ›'
  $('#pfNotifRow').textContent = (state.notif ? 'Вкл' : 'Выкл') + ' ›'
  $('#pfUnitsRow').textContent = (state.units === 'imperial' ? 'lb, ft' : 'кг, см') + ' ›'
}

function openPicker(title, sub, options, current, onPick) {
  const wrap = document.createElement('div')
  wrap.className = 'sheet-wrap'; wrap.id = 'pickWrap'
  wrap.innerHTML = `<div class="sheet" onclick="event.stopPropagation()">
    <h2>${title}</h2>
    <p class="sub" style="margin-top:4px">${sub}</p>
    <div class="opts" style="margin-top:16px">${options.map(o =>
      `<div class="opt ${o.v === current ? 'sel' : ''}" data-v="${o.v}">${o.label}${o.note ? `<small>${o.note}</small>` : ''}</div>`
    ).join('')}</div></div>`
  wrap.onclick = () => wrap.remove()
  document.querySelector('.phone').appendChild(wrap)
  wrap.querySelectorAll('.opt').forEach(el => el.onclick = () => {
    onPick(el.dataset.v); wrap.remove()
  })
}

window.openGoalPicker = function () {
  openPicker('Цель', 'Норма КБЖУ пересчитается автоматически', [
    { v: 'gain', label: 'Набор массы', note: 'Профицит калорий' },
    { v: 'keep', label: 'Поддержание', note: 'Удержать вес' },
    { v: 'lose', label: 'Снижение веса', note: 'Дефицит калорий' }
  ], state.goal, v => {
    state.goal = v; recalcNorm()
    upsertProfile(state.userId, state).catch(console.error)
    toast('🎯 Цель обновлена · норма ' + state.goalKcal + ' ккал')
  })
}

window.openActPicker = function () {
  openPicker('Уровень активности', 'Влияет на суточный расход калорий', [
    { v: '1.2',   label: 'Минимальная',    note: 'Сидячий образ жизни' },
    { v: '1.375', label: 'Лёгкая',         note: '1–3 тренировки в неделю' },
    { v: '1.55',  label: 'Средняя',        note: '3–5 тренировок в неделю' },
    { v: '1.725', label: 'Высокая',        note: '6–7 тренировок в неделю' },
    { v: '1.9',   label: 'Очень высокая',  note: 'Физический труд + спорт' }
  ], String(state.act), v => {
    state.act = v; recalcNorm()
    upsertProfile(state.userId, state).catch(console.error)
    toast('🏃 Активность обновлена · норма ' + state.goalKcal + ' ккал')
  })
}

window.openUnitsPicker = function () {
  openPicker('Единицы измерения', 'Как показывать вес и рост', [
    { v: 'metric',   label: 'Метрические', note: 'килограммы, сантиметры' },
    { v: 'imperial', label: 'Имперские',   note: 'фунты, футы/дюймы' }
  ], state.units, v => {
    state.units = v
    renderProfile()
    window.renderProgress?.()
    toast('⚖️ Единицы: ' + (v === 'imperial' ? 'lb, ft' : 'кг, см'))
  })
}

window.toggleNotif = function () {
  state.notif = !state.notif
  renderProfile()
  toast(state.notif ? '🔔 Уведомления включены' : '🔕 Уведомления выключены')
}

window.openSettings = function () {
  const row = (ico, label, right, onclick) =>
    `<div class="lrow" ${onclick ? `onclick="${onclick}"` : ''}><div class="ll"><span class="ico">${ico}</span> ${label}</div><div class="lr">${right}</div></div>`
  const wrap = document.createElement('div')
  wrap.className = 'sheet-wrap'; wrap.id = 'setWrap'
  wrap.innerHTML = `<div class="sheet" onclick="event.stopPropagation()">
    <h2>Настройки</h2>
    <div class="list" style="margin-top:16px">
      ${row('🔔', 'Уведомления', state.notif ? 'Вкл' : 'Выкл', 'toggleNotifFromSettings()')}
      ${row('🎉', 'Праздничные анимации', state.fx ? 'Вкл' : 'Выкл', 'toggleFx()')}
      ${row('⚖️', 'Единицы', state.units === 'imperial' ? 'lb, ft' : 'кг, см', 'openUnitsPicker()')}
    </div>
    <div class="list">
      ${row('🔄', 'Сбросить день', '', 'resetDay()')}
      ${row('ℹ️', 'О приложении', 'v1', 'aboutApp()')}
    </div>
    <p class="sub" style="text-align:center;padding:4px 10px 8px;font-size:12px">
      Приложение не заменяет консультацию врача или диетолога.
    </p>
    <button class="btn ghost" onclick="closeSettings()">Закрыть</button>
  </div>`
  wrap.onclick = window.closeSettings
  document.querySelector('.phone').appendChild(wrap)
}

window.closeSettings = function () { const e = document.getElementById('setWrap'); if (e) e.remove() }

window.toggleNotifFromSettings = function () {
  state.notif = !state.notif; renderProfile(); window.closeSettings(); window.openSettings()
}

window.toggleFx = function () {
  state.fx = !state.fx; window.closeSettings(); window.openSettings()
  toast(state.fx ? '🎉 Анимации включены' : 'Анимации выключены')
}

window.resetDay = function () {
  state.meals = { 'Завтрак': [], 'Обед': [], 'Ужин': [], 'Перекусы': [] }
  state.workouts = []; state._celebrated = false
  window.renderMeals?.(); window.renderSummary?.(); window.renderWorkouts?.()
  window.closeSettings(); toast('🔄 День сброшен')
}

window.aboutApp = function () { window.closeSettings(); toast('КБЖУ-трекер · прототип v1') }
