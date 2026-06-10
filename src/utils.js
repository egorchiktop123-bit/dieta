import { state } from './state.js'

export const $ = s => document.querySelector(s)
export const $$ = s => document.querySelectorAll(s)

export function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

export const lbFromKg = kg => kg * 2.20462
export const kgFromLb = lb => lb / 2.20462

export function wStr(kg) {
  return state.units === 'imperial'
    ? lbFromKg(kg).toFixed(1) + ' lb'
    : kg.toFixed(1) + ' кг'
}

export function hStr(cm) {
  if (state.units === 'imperial') {
    const tin = cm / 2.54, ft = Math.floor(tin / 12), inch = Math.round(tin - ft * 12)
    return `${ft}'${inch}"`
  }
  return Math.round(cm) + ' см'
}

export function countUp(el, to, dur = 650) {
  if (!el) return
  to = Math.round(to)
  const from = parseFloat((el.textContent || '0').replace(/[^\d.-]/g, '')) || 0
  if (from === to) { el.textContent = to; return }
  const t0 = performance.now();
  (function tick(t) {
    const p = Math.min(1, (t - t0) / dur)
    const e = 1 - Math.pow(1 - p, 3)
    el.textContent = Math.round(from + (to - from) * e)
    if (p < 1) requestAnimationFrame(tick)
  })(performance.now())
}

export function replay(el, cls) {
  if (!el) return
  el.classList.remove(cls)
  void el.offsetWidth
  el.classList.add(cls)
}

export function toast(msg) {
  const t = document.createElement('div')
  t.className = 'toast'
  t.textContent = msg
  document.querySelector('.phone').appendChild(t)
  setTimeout(() => {
    t.style.transition = 'opacity .4s,transform .4s'
    t.style.opacity = '0'
    t.style.transform = 'translate(-50%,-12px)'
  }, 1900)
  setTimeout(() => t.remove(), 2400)
}

export function confetti() {
  const host = document.querySelector('.phone')
  const shades = ['#26262b', '#52525c', '#8a8a94', '#c2c2cb', '#ffffff']
  for (let i = 0; i < 80; i++) {
    const d = document.createElement('i')
    d.className = 'confetti'
    const size = 6 + Math.random() * 7
    const dur = 1.5 + Math.random() * 1.3
    const delay = Math.random() * 0.35
    d.style.left = Math.random() * 100 + '%'
    d.style.width = size + 'px'
    d.style.height = (size * 0.5) + 'px'
    d.style.background = shades[i % shades.length]
    d.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg')
    d.style.animation = `confFall ${dur}s ${delay}s ease-in forwards`
    host.appendChild(d)
    setTimeout(() => d.remove(), (dur + delay) * 1000 + 200)
  }
}
