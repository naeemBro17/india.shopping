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
