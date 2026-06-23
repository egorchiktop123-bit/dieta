import { state } from '../state.js'
import { $, $$ } from '../utils.js'
import { computeNorm, calcTDEE } from '../calc.js'
import { countUp, replay } from '../utils.js'

function shake(el) {
  el.classList.remove('shake')
  void el.offsetWidth
  el.classList.add('shake')
}

const steps = ['obStep0', 'obStep1', 'obStep2', 'obStep3', 'obStep4', 'obResult']
let step = 0
let _onComplete = null

function bindSeg(id, key) {
  $$('#' + id + ' .opt').forEach(o => o.onclick = () => {
    $$('#' + id + ' .opt').forEach(x => x.classList.remove('sel'))
    o.classList.add('sel')
    state[key] = o.dataset.v
  })
}

function showStep(i) {
  steps.forEach((s, n) => $('#' + s).classList.toggle('hidden', n !== i))
  replay($('#' + steps[i]), 'anim-in')
  $('#obBar').style.width = ((i + 1) / steps.length * 100) + '%'
  $('#obNext').textContent = i === 4 ? 'Рассчитать' : i === 5 ? 'Начать вести дневник' : 'Далее'
}

function calcResult() {
  const n = computeNorm()
  const tdee = calcTDEE()
  state.goalKcal = n.kcal; state.gP = n.protein; state.gC = n.carbs; state.gF = n.fat
  countUp($('#rKcal'), n.kcal, 900)
  countUp($('#rP'), n.protein)
  countUp($('#rC'), n.carbs)
  countUp($('#rF'), n.fat)
  replay($('#ringFill'), 'ring-anim')
  const tdeeR = Math.round(tdee)
  $('#rNote').textContent = state.goal === 'gain'
    ? `Стартовая норма — профицит ~${n.kcal - tdeeR} ккал. Через 2–4 недели агент проверит фактическую динамику веса и скорректирует цифру.`
    : state.goal === 'lose'
    ? `Стартовая норма — дефицит ~${tdeeR - n.kcal} ккал. Через 2–4 недели агент скорректирует по реальному снижению веса.`
    : 'Норма поддержания. Агент скорректирует по реальной динамике.'
}

export function initOnboarding(onComplete) {
  _onComplete = onComplete

  bindSeg('segSex', 'sex')
  bindSeg('optAct', 'act')
  bindSeg('optGoal', 'goal')

  $('#obNext').onclick = () => {
    if (step === 0) {
      state.name = $('#inName').value.trim() || 'Друг'
    }
    if (step === 1) {
      const age = +$('#inAge').value
      if (!age || age < 10 || age > 99) { shake($('#inAge')); return }
      state.age = age
    }
    if (step === 2) {
      const h = +$('#inH').value, w = +$('#inW').value, wg = +$('#inWg').value
      if (!h || h < 100 || h > 250) { shake($('#inH')); return }
      if (!w || w < 30 || w > 300)  { shake($('#inW')); return }
      if (!wg || wg < 30 || wg > 300) { shake($('#inWg')); return }
      state.h = h
      state.w = w
      state.wg = wg
      const g = state.wg > state.w ? 'gain' : state.wg < state.w ? 'lose' : 'keep'
      state.goal = g
      $$('#optGoal .opt').forEach(o => o.classList.toggle('sel', o.dataset.v === g))
      $('#goalHint').textContent = g === 'gain'
        ? 'По весу мы подобрали: набор массы. Можешь изменить.'
        : g === 'lose'
        ? 'По весу мы подобрали: снижение веса. Можешь изменить.'
        : 'Поддержание веса. Можешь изменить.'
    }
    if (step === 4) calcResult()
    if (step === 5) { _onComplete?.(); return }
    step++
    showStep(step)
  }

  showStep(0)
}
