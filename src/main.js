import './styles/main.css'
import { state } from './state.js'
import { replay } from './utils.js'
import { initOnboarding } from './pages/onboarding.js'
import { buildWeek, renderMeals, renderSummary, renderWorkouts } from './pages/plan.js'
import { renderProgress } from './pages/progress.js'
import { renderCoach } from './pages/coach.js'
import { renderProfile } from './pages/profile.js'
import './components/sheets.js'
import {
  loadProfile, upsertProfile,
  loadTodayDiary, loadWeightLogs, loadTodayWorkouts, loadNormHistory
} from './db.js'

window.renderMeals    = renderMeals
window.renderSummary  = renderSummary
window.renderWorkouts = renderWorkouts
window.renderProgress = renderProgress
window.renderCoach    = renderCoach
window.renderProfile  = renderProfile

// ─── ID пользователя ─────────────────────────────────────────────────────────
const savedId = localStorage.getItem('kbju_user_id')
if (savedId) {
  state.userId = parseInt(savedId)
} else {
  state.userId = Math.floor(10000 + Math.random() * 89999)
  localStorage.setItem('kbju_user_id', state.userId)
}

// ─── Tab switching ────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('on'))
  t.classList.add('on')
  ;['Plan', 'Progress', 'Coach', 'Profile'].forEach(n =>
    document.getElementById('tab' + n).classList.toggle('hidden', n !== t.dataset.tab)
  )
  replay(document.getElementById('tab' + t.dataset.tab), 'anim-in')
})

// ─── Показать главный экран ───────────────────────────────────────────────────
function showApp() {
  document.getElementById('screenLoad').classList.add('hidden')
  document.getElementById('screenOb').classList.add('hidden')
  document.getElementById('screenApp').classList.remove('hidden')
  document.getElementById('tabbar').classList.remove('hidden')
  buildWeek(); renderMeals(); renderSummary(); renderWorkouts()
  renderProgress(); renderCoach(); renderProfile()
  replay(document.getElementById('tabPlan'), 'anim-in')
}

// ─── Загрузка данных из Supabase ──────────────────────────────────────────────
async function boot() {
  // Скрываем онбординг, показываем спиннер
  document.getElementById('screenOb').classList.add('hidden')

  let profile = null
  try { profile = await loadProfile(state.userId) } catch (e) { console.error(e) }

  if (profile) {
    // Восстанавливаем профиль
    state.name     = profile.name
    state.sex      = profile.sex
    state.age      = profile.age
    state.h        = parseFloat(profile.height_cm)
    state.w        = parseFloat(profile.weight_kg)
    state.wg       = parseFloat(profile.goal_weight_kg)
    state.act      = String(profile.activity)
    state.goal     = profile.goal
    state.units    = profile.units
    state.goalKcal = profile.goal_kcal
    state.gP       = profile.goal_protein
    state.gC       = profile.goal_carbs
    state.gF       = profile.goal_fat

    // Загружаем замеры веса
    const weightRows = await loadWeightLogs(state.userId).catch(() => [])
    state.weightLogs = weightRows.map(r => ({
      date:   new Date(r.logged_at).getTime(),
      weight: parseFloat(r.weight_kg),
      _dbId:  r.id
    }))
    if (state.weightLogs.length) {
      state.w = state.weightLogs[state.weightLogs.length - 1].weight
    }

    // Загружаем дневник за сегодня
    const diaryRows = await loadTodayDiary(state.userId).catch(() => [])
    state.meals = { 'Завтрак': [], 'Обед': [], 'Ужин': [], 'Перекусы': [] }
    diaryRows.forEach(r => {
      if (state.meals[r.meal_name]) {
        state.meals[r.meal_name].push({
          n: r.food_name, g: r.grams,
          k: parseFloat(r.kcal),   p: parseFloat(r.protein_g),
          c: parseFloat(r.carbs_g), f: parseFloat(r.fat_g),
          _dbId: r.id
        })
      }
    })

    // Загружаем тренировки за сегодня
    const workoutRows = await loadTodayWorkouts(state.userId).catch(() => [])
    state.workouts = workoutRows.map(r => ({
      type: r.type, emoji: r.emoji,
      min: r.minutes, kcal: parseFloat(r.kcal_burned),
      _dbId: r.id
    }))

    // Загружаем историю нормы
    const normRows = await loadNormHistory(state.userId).catch(() => [])
    state.normHistory = normRows.map(r => ({
      date:    new Date(r.adjusted_at).getTime(),
      oldKcal: r.old_kcal,
      newKcal: r.new_kcal,
      reason:  r.reason,
      _dbId:   r.id
    }))

    showApp()
  } else {
    // Новый пользователь → онбординг
    document.getElementById('screenLoad').classList.add('hidden')
    document.getElementById('screenOb').classList.remove('hidden')

    initOnboarding(async () => {
      // Демо-данные веса для нового пользователя
      const w0 = state.w
      state.weightLogs = [
        { date: Date.now() - 28 * 864e5, weight: w0 },
        { date: Date.now() - 21 * 864e5, weight: +(w0 + 0.1).toFixed(1) },
        { date: Date.now() - 14 * 864e5, weight: +(w0 + 0.2).toFixed(1) },
        { date: Date.now() -  7 * 864e5, weight: +(w0 + 0.3).toFixed(1) },
        { date: Date.now(),               weight: +(w0 + 0.4).toFixed(1) }
      ]
      state.w = state.weightLogs[state.weightLogs.length - 1].weight
      await upsertProfile(state.userId, state).catch(console.error)
      showApp()
    })
  }
}

boot()
