import { useStore } from '../store/useStore.js'

/**
 * Signature "BOUGHT" feedback — one place, two entry points (Products list
 * checkbox + Shopping mode BOUGHT button both call markBoughtWithFeedback).
 *
 * Only fires when an item is being *completed*. Un-checking is silent.
 */

let ctx = null

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

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1100, now)
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.09)

    // short, crisp ~100ms blip — closer to a toggle "tick" than a "ding"
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.11)
  } catch {
    /* audio not available — ignore */
  }
}

function haptic() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(10)
    } catch {
      /* ignore */
    }
  }
}

/** Fire the subtle tap + tick. Call only when completing an item. */
export function boughtFeedback() {
  haptic()
  tick()
}

/**
 * The single bought action, shared by every screen.
 * `toggle` is the store's toggleBought(id).
 */
export function markBoughtWithFeedback(product, toggle) {
  const wasBought = product.is_bought
  toggle(product.id)
  if (!wasBought) boughtFeedback()
}
