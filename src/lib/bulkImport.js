/**
 * Pure text parser for Bulk Import. No AI/API calls — fully offline, instant.
 *
 * Understands numbered/bulleted markdown-style product lines such as:
 *   1. **Revize Micro Gel (0.025% or 0.04%)** — Tretinoin (Glenmark) - for
 *      facial anti-aging and glass-skin texture.
 * and skips pure section-header lines such as:
 *   **1. Clinical Skincare (pharmacy only)**
 *
 * Supports both English and Bengali numerals/punctuation.
 */

// A leading "1." / "12)" / "৬." style marker, optionally preceded by a bullet char.
const LEADING_NUMBER = /^[*\-•]?\s*([0-9]+|[০-৯]+)[.)]\s*/
const LEADING_BULLET = /^[*\-•]\s+/
// dash-ish separators: hyphen, en dash, em dash
const DASH_CHARS = '\\-\u2013\u2014'
const LEADING_DASH_PUNCT = new RegExp(`^[\\s${DASH_CHARS}:।,]+`)

function stripLeadingDash(text) {
  return text.replace(LEADING_DASH_PUNCT, '')
}

/**
 * Parses one line into { name, notes } or null if it should be skipped
 * (blank line, or a pure section header with no real product content).
 */
function parseLine(rawLine) {
  const line = rawLine.trim()
  if (!line) return null

  // 1. Strip a leading number+period marker, if present.
  let rest = line
  let hadNumber = false
  const numMatch = line.match(LEADING_NUMBER)
  if (numMatch) {
    rest = line.slice(numMatch[0].length)
    hadNumber = true
  } else {
    const bulletMatch = line.match(LEADING_BULLET)
    if (bulletMatch) rest = line.slice(bulletMatch[0].length)
  }

  // 2. Pull out the bold **name** at the start, if any.
  const boldMatch = rest.match(/^\*\*(.+?)\*\*/)

  if (!boldMatch) {
    // No bold marker. Best-effort: only treat as a product if it looked like
    // a genuine list item (numbered or bulleted) with real content — never
    // silently drop a line that looks meant to be a product.
    const plain = rest.replace(/\*\*/g, '').trim()
    if (hadNumber && plain.length > 2) {
      return { name: plain, notes: '' }
    }
    return null
  }

  const boldText = boldMatch[1].trim()
  let after = rest.slice(boldMatch[0].length)
  const trailing = after.replace(/\*\*/g, '').trim()
  const hasDash = new RegExp(`[${DASH_CHARS}]`).test(trailing)

  // A pure section header is short bold text with nothing (or nothing
  // meaningful) after it — no leading number, no dash-introduced description.
  if (!hadNumber && (!trailing || trailing.length < 8 || !hasDash)) {
    return null
  }
  if (!trailing) return null

  // 3. Everything after the bold name, dash stripped from the front.
  after = stripLeadingDash(after)

  // 4. The "lead segment" is the text up to the first " - " (a plain hyphen
  // separator, distinct from the em-dash right after the bold name) — a
  // brand parenthetical, if any, lives in this segment.
  const sepIdx = after.indexOf(' - ')
  const leadSegment = sepIdx === -1 ? after : after.slice(0, sepIdx)

  let brand = ''
  const parenMatch = leadSegment.match(/\(([^)]+)\)/)
  if (parenMatch) brand = parenMatch[1].trim()

  const name = brand ? `${boldText} (${brand})` : boldText

  let notes = after
  if (parenMatch) notes = notes.replace(parenMatch[0], '')
  notes = stripLeadingDash(notes).replace(/\s{2,}/g, ' ').trim()

  return { name, notes }
}

/** Parses pasted text into an array of { name, notes } products. */
export function parseBulkImport(raw) {
  if (!raw) return []
  return raw
    .split(/\r?\n/)
    .map(parseLine)
    .filter(Boolean)
    .filter((p) => p.name)
}
