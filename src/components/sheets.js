import { state, DB, WDB } from '../state.js'
import { $, wStr, kgFromLb, replay, toast } from '../utils.js'

let curMeal = null

window.openSheet = function (meal) {
  curMeal = meal
  const wrap = document.createElement('div')
  wrap.className = 'sheet-wrap'; wrap.id = 'sheetWrap'
  wrap.innerHTML = `<div class="sheet" onclick="event.stopPropagation()">
    <h2>Добавить в «${meal}»</h2>
    <p class="sub">Выбери продукт из базы — граммовку можно ввести</p>
    <input class="search" id="foodSearch" placeholder="Поиск продукта...">
    <div id="foodList"></div></div>`
  wrap.onclick = window.closeSheet
  document.querySelector('.phone').appendChild(wrap)
  renderFoods('')
  document.getElementById('foodSearch').oninput = e => renderFoods(e.target.value)
}

function renderFoods(q) {
  const list = DB.filter(f => f[0].toLowerCase().includes(q.toLowerCase()))
  document.getElementById('foodList').innerHTML = list.map(f => {
    const idx = DB.indexOf(f)
    return `<div class="food" onclick="addFood(${idx})"><div>
      <div class="fn">${f[0]}</div>
      <div class="fk">${f[1]} ккал · ${f[2]}Б ${f[3]}У ${f[4]}Ж / 100г</div>
    </div><div class="plus">+</div></div>`
  }).join('') || `<p class="sub" style="padding:20px 0">Ничего не найдено</p>`
}

window.addFood = function (idx) {
  const f = DB[idx]
  const g = parseInt(prompt(`Сколько грамм «${f[0]}»?`, '150'))
  if (!g || g <= 0) return
  const k = f[1] * g / 100, p = f[2] * g / 100, c = f[3] * g / 100, fa = f[4] * g / 100
  state.meals[curMeal].push({ n: f[0], g, k, p, c, f: fa })
  const mealIdx = Object.keys(state.meals).indexOf(curMeal)
  window.closeSheet()
  window.renderMeals?.()
  window.renderSummary?.()
  const card = document.getElementById('meals')?.children[mealIdx]
  if (card) replay(card, 'pop-in')
}

window.closeSheet = function () {
  const w = document.getElementById('sheetWrap'); if (w) w.remove()
}

window.openWorkoutSheet = function () {
  const wrap = document.createElement('div')
  wrap.className = 'sheet-wrap'; wrap.id = 'woWrap'
  wrap.innerHTML = `<div class="sheet" onclick="event.stopPropagation()">
    <h2>Добавить тренировку</h2>
    <p class="sub">Выбери активность — длительность укажешь дальше</p>
    <div style="margin-top:14px">${WDB.map((w, i) =>
      `<div class="food" onclick="addWorkout(${i})"><div>
        <div class="fn">${w[1]} ${w[0]}</div>
        <div class="fk">~${w[2]} ккал / мин</div>
      </div><div class="plus">+</div></div>`).join('')}</div></div>`
  wrap.onclick = window.closeWorkoutSheet
  document.querySelector('.phone').appendChild(wrap)
}

window.addWorkout = function (i) {
  const w = WDB[i]
  const min = parseInt(prompt(`Сколько минут «${w[0]}»?`, '45'))
  if (!min || min <= 0) return
  state.workouts.push({ type: w[0], emoji: w[1], min, kcal: w[2] * min })
  window.closeWorkoutSheet()
  window.renderWorkouts?.()
  window.renderSummary?.()
  const cards = document.getElementById('workouts')?.children
  if (cards?.length) cards[cards.length - 1].classList.add('pop-in')
}

window.closeWorkoutSheet = function () {
  const el = document.getElementById('woWrap'); if (el) el.remove()
}

window.openWeightSheet = function () {
  const curKg = state.weightLogs.length
    ? state.weightLogs[state.weightLogs.length - 1].weight
    : state.w
  const imp = state.units === 'imperial'
  const curVal = imp ? curKg * 2.20462 : curKg
  const wrap = document.createElement('div')
  wrap.className = 'sheet-wrap'; wrap.id = 'weightWrap'
  wrap.innerHTML = `<div class="sheet" onclick="event.stopPropagation()">
    <h2>Записать вес</h2>
    <p class="sub" style="margin-top:6px">Взвешивайся утром, натощак, в одно и то же время</p>
    <div class="field" style="margin-top:22px">
      <label>Вес, ${imp ? 'lb' : 'кг'}</label>
      <input id="weightInput" type="number" step="0.1"
        value="${curVal.toFixed(1)}"
        style="font-size:36px;text-align:center;font-weight:800">
    </div>
    <button class="btn" onclick="saveWeight()">Сохранить</button>
    <button class="btn ghost" style="margin-top:8px" onclick="closeWeightSheet()">Отмена</button>
  </div>`
  wrap.onclick = window.closeWeightSheet
  document.querySelector('.phone').appendChild(wrap)
  setTimeout(() => document.getElementById('weightInput')?.select(), 50)
}

window.saveWeight = function () {
  const raw = parseFloat(document.getElementById('weightInput').value)
  if (!raw || raw <= 0) return
  const w = state.units === 'imperial' ? kgFromLb(raw) : raw
  state.w = w
  state.weightLogs.push({ date: Date.now(), weight: w })
  window.closeWeightSheet()
  window.renderProgress?.()
  window.renderCoach?.()
  window.renderProfile?.()
  const pgW = document.getElementById('pgW')
  if (pgW) { pgW.classList.remove('bump'); void pgW.offsetWidth; pgW.classList.add('bump') }
  toast('⚖️ Вес записан: ' + wStr(w))
}

window.closeWeightSheet = function () {
  const el = document.getElementById('weightWrap'); if (el) el.remove()
}
