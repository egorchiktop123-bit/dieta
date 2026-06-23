import { state, DB, WDB } from '../state.js'
import { $, plural, countUp, replay, confetti, toast } from '../utils.js'
import { deleteWorkout } from '../db.js'

export function buildWeek() {
  const days = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В']
  const nums = [25, 26, 27, 28, 29, 30, 31]
  $('#weekStrip').innerHTML = nums.map((n, i) =>
    `<div class="day ${i === 4 ? 'on' : ''} ${i < 4 ? 'has' : ''}">
      <div class="d">${days[i]}</div>
      <div class="n">${n}</div>
      <div class="dot"></div></div>`
  ).join('')
}

export function renderMeals() {
  $('#meals').innerHTML = Object.keys(state.meals).map(name => {
    const items = state.meals[name]
    const tot = items.reduce((a, x) => ({ k: a.k + x.k, p: a.p + x.p, c: a.c + x.c, f: a.f + x.f }), { k: 0, p: 0, c: 0, f: 0 })
    return `<div class="meal"><div class="mh"><div>
      <h2>${name}</h2>
      <div class="mi"><span class="fire">🔥</span> ${Math.round(tot.k)} ккал ·
        ${Math.round(tot.p)}Б | ${Math.round(tot.c)}У | ${Math.round(tot.f)}Ж</div>
      </div></div>
      <div class="items">${items.map(x =>
        `<div class="item"><span>${x.n} · ${x.g} г</span><span>${Math.round(x.k)} ккал</span></div>`
      ).join('')}</div>
      <button class="add" onclick="openSheet('${name}')">+</button></div>`
  }).join('')
}

export function totalBurned() {
  return state.workouts.reduce((a, w) => a + w.kcal, 0)
}

export function renderSummary() {
  let k = 0, p = 0, c = 0, f = 0
  Object.values(state.meals).forEach(items => items.forEach(x => { k += x.k; p += x.p; c += x.c; f += x.f }))
  const burned = totalBurned()
  const g = state.goalKcal + burned
  countUp($('#sEaten'), k)
  countUp($('#sGoal'), g)
  const leftTxt = k <= g ? `осталось ${Math.round(g - k)} ккал` : `перебор ${Math.round(k - g)} ккал`
  $('#sLeft').innerHTML = burned > 0
    ? `${leftTxt} · норма ${state.goalKcal} + <span style="color:var(--accent)">${Math.round(burned)} 🔥</span>`
    : leftTxt
  $('#sBar').style.width = Math.min(100, k / g * 100) + '%'
  $('#sP').textContent = Math.round(p) + ' / ' + state.gP + ' г'
  $('#sC').textContent = Math.round(c) + ' / ' + state.gC + ' г'
  $('#sF').textContent = Math.round(f) + ' / ' + state.gF + ' г'

  const hit = k >= state.goalKcal * 0.97
  if (hit && !state._celebrated) {
    state._celebrated = true
    if (state.fx !== false) { confetti(); replay(document.querySelector('.summary'), 'celebrate') }
    toast('🎉 Дневная норма выполнена!')
  }
  if (!hit) state._celebrated = false
}

export function renderWorkouts() {
  const burned = totalBurned()
  countUp($('#wBurned'), burned)
  $('#wInfo').textContent = `за сегодня · ${state.workouts.length} ${plural(state.workouts.length, 'тренировка', 'тренировки', 'тренировок')}`
  $('#workouts').innerHTML = state.workouts.length
    ? state.workouts.map((w, i) =>
        `<div class="meal"><div class="mh"><div>
          <h2>${w.emoji} ${w.type}</h2>
          <div class="mi"><span class="run">🔥</span> ${Math.round(w.kcal)} ккал · ${w.min} мин</div>
        </div>
        <div class="plus" style="cursor:pointer;color:var(--muted);font-size:24px" onclick="removeWorkout(${i})">×</div>
        </div></div>`
      ).join('')
    : `<p class="sub" style="text-align:center;padding:20px 0">Сегодня тренировок нет. Добавь — и дневная норма калорий вырастет.</p>`
}

window.switchPlan = function (view) {
  const food = view === 'food'
  $('#planFood').classList.toggle('hidden', !food)
  $('#planWorkout').classList.toggle('hidden', food)
  $('#segKbju').classList.toggle('on', food)
  $('#segWorkout').classList.toggle('on', !food)
  replay(food ? $('#planFood') : $('#planWorkout'), 'anim-in')
}

window.removeWorkout = function (i) {
  const w = state.workouts[i]
  if (w._dbId) deleteWorkout(w._dbId).catch(console.error)
  state.workouts.splice(i, 1)
  renderWorkouts()
  renderSummary()
}
