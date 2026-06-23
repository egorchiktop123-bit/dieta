import { describe, it, expect, beforeEach } from 'vitest'
import { state } from '../../src/state.js'
import { calcTDEE, computeNorm, calcCorrection } from '../../src/calc.js'

// Базовый профиль для каждого теста: мужчина 63 кг, 178 см, 25 лет, средняя активность, цель — набор
beforeEach(() => {
  Object.assign(state, {
    sex: 'm', age: 25, h: 178, w: 63, wg: 70, act: 1.55, goal: 'gain',
    goalKcal: 0, weightLogs: []
  })
})

describe('calcTDEE (Миффлин → TDEE)', () => {
  it('считает базовый обмен и расход для мужчины', () => {
    // BMR = 10*63 + 6.25*178 - 5*25 + 5 = 1622.5; ×1.55 ≈ 2514.9
    expect(Math.round(calcTDEE())).toBe(2515)
  })

  it('у женщины BMR ниже на 166 (−161 vs +5)', () => {
    state.sex = 'f'
    expect(Math.round(calcTDEE())).toBe(Math.round((1622.5 - 166) * 1.55))
  })
})

describe('computeNorm (норма под цель)', () => {
  it('для набора даёт профицит ~12% и корректные БЖУ', () => {
    const n = computeNorm()
    expect(n.kcal).toBe(2815)            // round(2514.9*1.12 /5)*5
    expect(n.protein).toBe(126)          // 63 * 2 г/кг
    expect(n.fat).toBe(57)               // 63 * 0.9, округление
    expect(n.kcal).toBeGreaterThan(Math.round(calcTDEE())) // профицит
  })

  it('для снижения даёт дефицит относительно TDEE', () => {
    state.goal = 'lose'
    expect(computeNorm().kcal).toBeLessThan(Math.round(calcTDEE()))
  })

  it('углеводы не уходят в минус', () => {
    expect(computeNorm().carbs).toBeGreaterThanOrEqual(0)
  })
})

describe('calcCorrection (адаптивная коррекция)', () => {
  it('без двух замеров возвращает null', () => {
    expect(calcCorrection()).toBeNull()
  })

  it('предлагает коррекцию, когда набор идёт медленнее ожидаемого', () => {
    state.goalKcal = 2815
    const day = 86400000
    // 4 недели почти без прироста при заложенном профиците → коррекция вверх
    state.weightLogs = [
      { date: Date.now() - 28 * day, weight: 63.0 },
      { date: Date.now(),            weight: 63.2 }
    ]
    const corr = calcCorrection()
    expect(corr).not.toBeNull()
    expect(corr.newKcal).toBeGreaterThan(2815) // нужно есть больше
  })

  it('коррекция ограничена ±300 ккал (лимит безопасности)', () => {
    state.goalKcal = 2815
    const day = 86400000
    state.weightLogs = [
      { date: Date.now() - 28 * day, weight: 63.0 },
      { date: Date.now(),            weight: 62.0 } // сильно мимо
    ]
    const corr = calcCorrection()
    expect(Math.abs(corr.newKcal - 2815)).toBeLessThanOrEqual(300)
  })
})
