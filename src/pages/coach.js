import { state } from '../state.js'
import { $ } from '../utils.js'
import { calcCorrection } from '../calc.js'

export function renderCoach() {
  const corr = calcCorrection()
  const msgs = []

  msgs.push({
    text: `Доброе утро, ${state.name}! Сегодня твоя цель — <b>${state.goalKcal} ккал</b>. ` +
      (state.goal === 'gain' ? 'Ты набираешь вес — важно есть в профиците. Удачного дня 💪' :
       state.goal === 'lose' ? 'Ты снижаешь вес — держи дефицит. Удачного дня 💪' :
       'Держи норму поддержания. Удачного дня 💪'),
    time: '8:00'
  })

  msgs.push({
    text: `Обед был 3 часа назад. Ты съел только 40% нормы — до цели ещё ~${Math.round(state.goalKcal * 0.6)} ккал. ` +
      'Вот быстрая идея: творог 200 г + банан + горсть орехов ≈ 480 ккал.',
    time: '15:20'
  })

  if (corr) {
    const sign = corr.corr >= 0 ? '+' : ''
    msgs.push({
      text: `Анализ ${corr.weeksObserved} недель: ты движешься <b>${corr.actualPerWeek >= 0 ? '+' : ''}${corr.actualPerWeek} кг/нед</b> ` +
        `вместо ожидаемых <b>${corr.expectedPerWeek >= 0 ? '+' : ''}${corr.expectedPerWeek} кг/нед</b>. ` +
        `Рекомендую скорректировать норму: ${sign}${corr.corr} ккал → <b>${corr.newKcal} ккал/день</b>. ` +
        `Перейди в Прогресс, чтобы применить. 📊`,
      time: 'сегодня',
      highlight: true
    })
  } else {
    msgs.push({
      text: 'Отличная неделя! Ты держал норму 5 дней из 7. Агент проверит динамику веса через 2 недели и скорректирует норму под реальный результат.',
      time: 'вчера'
    })
  }

  $('#coachMessages').innerHTML = msgs.map(m =>
    `<div class="msg" ${m.highlight ? 'style="border:1px solid rgba(38,38,43,.28);background:linear-gradient(155deg,rgba(38,38,43,.08),rgba(255,255,255,.5))"' : ''}>
      ${m.text}<div class="t">${m.time}</div></div>`
  ).join('')
}
