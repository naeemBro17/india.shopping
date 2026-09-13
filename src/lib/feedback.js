import { useStore } from '../store/useStore.js'

/**
 * The signature "checked it off" feedback. One place, used by every checkbox
 * (Products list + Shopping mode both call markBoughtWithFeedback).
 *
 * Fires ONLY when an item is being completed. Un-checking is silent.
 */

let ctx = null

/**
 * A short, clean "tk" — single high sine note, ~1000Hz, ~75ms, quick fade.
 * No chime, no melody. Like a checkbox click in Notion / Things 3.
 */
function tick() {
  if (useStore.getState().settings.muted) return
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = ctx || new AC()
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1000, now)

    // fast attack, short body, quick exponential fade — a soft "tk"
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.1, now + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.08)
  } catch {
    /* audio not available — ignore */
  }
}

/** Short vibration. Must be called synchronously inside the tap handler. */
function haptic() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(15)
    } catch {
      /* ignore */
    }
  }
}

/** Fire haptic + tick. Call only when completing an item. */
export function boughtFeedback() {
  haptic()
  tick()
}

/**
 * The single bought action, shared by every screen.
 * `toggle` is the store's toggleBought(id). Feedback fires first, synchronously
 * on the tap, so the vibrate API sees a direct user gesture.
 */
export function markBoughtWithFeedback(product, toggle) {
  if (!product.is_bought) boughtFeedback()
  toggle(product.id)
}

/**
 * "Shopping mode on" cue — a short rising two-note tone, distinct from the
 * checkbox tick and reserved for the bigger "the trip has begun" moment.
 * Total runtime stays well under 400ms.
 */
function risingTone() {
  if (useStore.getState().settings.muted) return
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = ctx || new AC()
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const notes = [
      { freq: 660, start: 0, dur: 0.13 },
      { freq: 990, start: 0.12, dur: 0.16 },
    ]
    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + start)
      gain.gain.setValueAtTime(0.0001, now + start)
      gain.gain.exponentialRampToValueAtTime(0.09, now + start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + dur + 0.02)
    })
  } catch {
    /* audio not available — ignore */
  }
}

/** Short double-pulse vibration — bigger than the single checkbox tap. */
function startShoppingHaptic() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([15, 40, 25])
    } catch {
      /* ignore */
    }
  }
}

/** Fire haptic + tone for the "Start Shopping" moment. */
export function startShoppingFeedback() {
  startShoppingHaptic()
  risingTone()
}
