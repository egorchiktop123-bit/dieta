import { state } from '../state.js'
import { $, wStr, replay, toast } from '../utils.js'
import { calcCorrection } from '../calc.js'
import { saveNormAdjustment } from '../db.js'

export function renderProgress() {
  const logs = [...state.weightLogs].sort((a, b) => a.date - b.date)
  const cur = logs.length ? logs[logs.length - 1].weight : state.w
  const start = logs.length ? logs[0].weight : state.w
  const goal = state.wg

  $('#pgW').textContent = wStr(cur)
  $('#pgGoal').textContent = wStr(goal)

  const range = Math.abs(goal - start)
  const done = Math.abs(cur - start)
  const prog = range > 0 ? Math.min(100, done / range * 100) : 0
  $('#pgBar').style.width = prog + '%'
  const diffKg = Math.abs(goal - cur)
  $('#pgLeft').textContent = `До цели осталось ${state.units === 'imperial' ? (diffKg * 2.20462).toFixed(1) + ' lb' : diffKg.toFixed(1) + ' кг'}`

  const chartLogs = logs.slice(-7)
  if (chartLogs.length > 1) {
    const vals = chartLogs.map(l => l.weight)
    const minV = Math.min(...vals) - 0.4
    const maxV = Math.max(...vals) + 0.4
    $('#pgChart').innerHTML = chartLogs.map((l, i) => {
      const h = ((l.weight - minV) / (maxV - minV)) * 88 + 12
      const lblV = state.units === 'imperial' ? (l.weight * 2.20462).toFixed(1) : l.weight.toFixed(1)
      return `<div class="col"><i style="height:${h}px;transform-origin:bottom;animation:growBar .5s ${i * 0.06}s both"></i><small>${lblV}</small></div>`
    }).join('')
  }

  const reversed = logs.slice().reverse().slice(0, 5)
  const logHtml = reversed.map((l, i) => {
    const prev = reversed[i + 1]
    const delta = prev ? (l.weight - prev.weight) : null
    const dUnit = state.units === 'imperial' ? 'lb' : 'кг'
    const dAbsVal = delta !== null ? (state.units === 'imperial' ? Math.abs(delta) * 2.20462 : Math.abs(delta)) : 0
    const dStr = delta !== null
      ? (delta >= 0 ? '+' : '−') + dAbsVal.toFixed(1) + ' ' + dUnit
      : '—'
    const onTrack = state.goal === 'gain' ? delta > 0 : delta < 0
    const dColor = delta === null ? 'var(--muted)' : (onTrack ? 'var(--accent)' : 'var(--muted)')
    const d = new Date(l.date)
    const lbl = d.toLocaleDateString('ru', { day: 'numeric', month: 'long' })
    return `<div class="wrow">
      <div><div class="wv">${wStr(l.weight)}</div><div class="wd">${lbl}</div></div>
      <div class="wdelta" style="color:${dColor}">${dStr}</div>
    </div>`
  }).join('')
  $('#pgLogs').innerHTML = `<div class="sub" style="margin-bottom:12px">История замеров</div>${logHtml}`

  if (state.normHistory.length > 0) {
    const normHtml = [...state.normHistory].reverse().map(n => {
      const d = new Date(n.date)
      const lbl = d.toLocaleDateString('ru', { day: 'numeric', month: 'long' })
      return `<div class="nrow">
        <div><div class="nv">${n.oldKcal} → ${n.newKcal} ккал</div><div class="nd">${lbl} · ${n.reason}</div></div>
        <div class="narrow">${n.newKcal > n.oldKcal ? '+' : ''}${n.newKcal - n.oldKcal}</div>
      </div>`
    }).join('')
    $('#pgNorms').innerHTML = `<div class="sub" style="margin-bottom:12px">История нормы калорий</div>${normHtml}`
    $('#pgNorms').classList.remove('hidden')
  }

  const corr = calcCorrection()
  const card = $('#corrCard')
  if (corr) {
    card.classList.remove('hidden')
    $('#corrKcal').textContent = corr.newKcal
    const sign = corr.corr >= 0 ? '+' : ''
    $('#corrDelta').textContent = sign + corr.corr + ' ккал'
    const dir = corr.gap < 0
      ? (state.goal === 'gain' ? 'Набираешь медленнее расчёта' : 'Снижаешь быстрее расчёта')
      : (state.goal === 'lose' ? 'Снижаешь медленнее расчёта' : 'Набираешь быстрее расчёта')
    $('#corrInfo').textContent =
      `За ${corr.weeksObserved} нед. наблюдений:\n` +
      `• Ожидаемое изменение: ${corr.expectedPerWeek >= 0 ? '+' : ''}${corr.expectedPerWeek} кг/нед\n` +
      `• Фактическое:             ${corr.actualPerWeek >= 0 ? '+' : ''}${corr.actualPerWeek} кг/нед\n\n` +
      `${dir} — рекомендуем скорректировать норму.`
  } else {
    card.classList.add('hidden')
  }
}

window.applyCorrection = function () {
  const corr = calcCorrection()
  if (!corr) return
  const reason = `Коррекция по ${corr.weeksObserved} нед. данным`
  state.normHistory.push({ date: Date.now(), oldKcal: state.goalKcal, newKcal: corr.newKcal, reason })
  saveNormAdjustment(state.userId, state.goalKcal, corr.newKcal, reason).catch(console.error)
  state.goalKcal = corr.newKcal
  state.gP = Math.round(state.w * (state.goal === 'gain' ? 2 : 1.8))
  state.gF = Math.round(state.w * 0.9)
  state.gC = Math.max(0, Math.round((corr.newKcal - state.gP * 4 - state.gF * 9) / 4))
  renderProgress()
  window.renderSummary?.()
  window.renderCoach?.()
  window.renderProfile?.()
  toast('✅ Норма обновлена: ' + corr.newKcal + ' ккал')
  $('#corrCard').classList.add('hidden')
}

window.dismissCorr = function () {
  $('#corrCard').classList.add('hidden')
}
