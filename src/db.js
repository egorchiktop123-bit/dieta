import { supabase } from './supabase.js'

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function upsertProfile(userId, s) {
  return supabase.from('profiles').upsert({
    id:             userId,
    name:           s.name,
    sex:            s.sex,
    age:            s.age,
    height_cm:      s.h,
    weight_kg:      s.w,
    goal_weight_kg: s.wg,
    activity:       parseFloat(s.act),
    goal:           s.goal,
    units:          s.units,
    goal_kcal:      s.goalKcal,
    goal_protein:   s.gP,
    goal_carbs:     s.gC,
    goal_fat:       s.gF,
    updated_at:     new Date().toISOString()
  })
}

export async function loadProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return data
}

// ─── Diary ────────────────────────────────────────────────────────────────────

export async function saveDiaryEntry(userId, mealName, item) {
  return supabase.from('diary_entries').insert({
    user_id:    userId,
    meal_name:  mealName,
    food_name:  item.n,
    grams:      item.g,
    kcal:       item.k,
    protein_g:  item.p,
    carbs_g:    item.c,
    fat_g:      item.f,
    logged_date: new Date().toISOString().slice(0, 10)
  }).select()
}

export async function loadTodayDiary(userId) {
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_date', today)
    .order('logged_at', { ascending: true })
  return data || []
}

export async function deleteDiaryEntry(dbId) {
  return supabase.from('diary_entries').delete().eq('id', dbId)
}

// ─── Weight logs ──────────────────────────────────────────────────────────────

export async function saveWeightLog(userId, weightKg) {
  return supabase.from('weight_logs').insert({
    user_id:   userId,
    weight_kg: weightKg
  }).select()
}

export async function loadWeightLogs(userId) {
  const { data } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: true })
  return data || []
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export async function saveWorkout(userId, workout) {
  return supabase.from('workouts').insert({
    user_id:     userId,
    type:        workout.type,
    emoji:       workout.emoji,
    minutes:     workout.min,
    kcal_burned: workout.kcal,
    logged_date: new Date().toISOString().slice(0, 10)
  }).select()
}

export async function loadTodayWorkouts(userId) {
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_date', today)
    .order('logged_at', { ascending: true })
  return data || []
}

export async function deleteWorkout(dbId) {
  return supabase.from('workouts').delete().eq('id', dbId)
}

// ─── Norm history ─────────────────────────────────────────────────────────────

export async function saveNormAdjustment(userId, oldKcal, newKcal, reason) {
  return supabase.from('norm_history').insert({
    user_id:  userId,
    old_kcal: oldKcal,
    new_kcal: newKcal,
    reason
  })
}

export async function loadNormHistory(userId) {
  const { data } = await supabase
    .from('norm_history')
    .select('*')
    .eq('user_id', userId)
    .order('adjusted_at', { ascending: true })
  return data || []
}
