import { state } from './state.js'

export function calcTDEE() {
  const { sex, age, h, w, act } = state
  const bmr = 10 * w + 6.25 * h - 5 * age + (sex === 'm' ? 5 : -161)
  return bmr * parseFloat(act)
}

export function computeNorm() {
  const tdee = calcTDEE()
  let kcal = state.goal === 'gain' ? tdee * 1.12 : state.goal === 'lose' ? tdee * 0.82 : tdee
  kcal = Math.round(kcal / 5) * 5
  const protein = Math.round(state.w * (state.goal === 'gain' ? 2 : 1.8))
  const fat = Math.round(state.w * 0.9)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { kcal, protein, fat, carbs }
}

export function calcCorrection() {
  if (state.weightLogs.length < 2) return null
  const logs = [...state.weightLogs].sort((a, b) => a.date - b.date)
  const first = logs[0], last = logs[logs.length - 1]
  const days = (last.date - first.date) / 86400000
  if (days < 14) return null

  const weeks = days / 7
  const actualPerWeek = (last.weight - first.weight) / weeks
  const tdee = calcTDEE()
  const expectedPerWeek = (state.goalKcal - tdee) * 7 / 7700
  const gap = actualPerWeek - expectedPerWeek

  if (Math.abs(gap) < 0.12) return null

  let corr = Math.round(-gap * 7700 / 7 / 25) * 25
  corr = Math.max(-300, Math.min(300, corr))

  const MIN_KCAL = state.sex === 'm' ? 1500 : 1200
  const newKcal = Math.max(MIN_KCAL, state.goalKcal + corr)

  return {
    actualPerWeek: +actualPerWeek.toFixed(2),
    expectedPerWeek: +expectedPerWeek.toFixed(2),
    gap: +gap.toFixed(2),
    corr: newKcal - state.goalKcal,
    newKcal,
    weeksObserved: Math.round(weeks)
  }
}

export function recalcNorm() {
  const n = computeNorm()
  state.goalKcal = n.kcal
  state.gP = n.protein
  state.gC = n.carbs
  state.gF = n.fat
  window.renderProfile?.()
  window.renderSummary?.()
  window.renderCoach?.()
}
