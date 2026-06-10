import './styles/main.css'
import { state } from './state.js'
import { replay } from './utils.js'
import { initOnboarding } from './pages/onboarding.js'
import { buildWeek, renderMeals, renderSummary, renderWorkouts } from './pages/plan.js'
import { renderProgress } from './pages/progress.js'
import { renderCoach } from './pages/coach.js'
import { renderProfile } from './pages/profile.js'
import './components/sheets.js'

// Expose render functions so cross-module calls work
window.renderMeals = renderMeals
window.renderSummary = renderSummary
window.renderWorkouts = renderWorkouts
window.renderProgress = renderProgress
window.renderCoach = renderCoach
window.renderProfile = renderProfile

function startApp() {
  const w0 = state.w
  state.weightLogs = [
    { date: Date.now() - 28 * 864e5, weight: w0 },
    { date: Date.now() - 21 * 864e5, weight: +(w0 + 0.1).toFixed(1) },
    { date: Date.now() - 14 * 864e5, weight: +(w0 + 0.2).toFixed(1) },
    { date: Date.now() -  7 * 864e5, weight: +(w0 + 0.3).toFixed(1) },
    { date: Date.now(),               weight: +(w0 + 0.4).toFixed(1) }
  ]
  state.w = state.weightLogs[state.weightLogs.length - 1].weight

  document.getElementById('screenOb').classList.add('hidden')
  document.getElementById('screenApp').classList.remove('hidden')
  document.getElementById('tabbar').classList.remove('hidden')

  buildWeek()
  renderMeals()
  renderSummary()
  renderWorkouts()
  renderProgress()
  renderCoach()
  renderProfile()
  replay(document.getElementById('tabPlan'), 'anim-in')
}

// Tab switching
document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('on'))
  t.classList.add('on')
  ;['Plan', 'Progress', 'Coach', 'Profile'].forEach(n =>
    document.getElementById('tab' + n).classList.toggle('hidden', n !== t.dataset.tab)
  )
  replay(document.getElementById('tab' + t.dataset.tab), 'anim-in')
})

initOnboarding(startApp)
