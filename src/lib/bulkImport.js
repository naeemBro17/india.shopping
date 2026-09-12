/**
 * Pure text parser for Bulk Import. No AI/API calls — fully offline, instant.
 *
 * Understands numbered markdown-style product lines such as:
 *   1. **Revize Micro Gel (0.025% or 0.04%)** — Tretinoin (Glenmark) - for
 *      facial anti-aging and glass-skin texture.
 *
 * and skips category/section header lines, which always share the same
 * numbering style but are NEVER wrapped in ** bold markdown **, e.g.:
 *   ৬. বিজনেস ও ডায়েট (সুপারমার্কেট / অ্যামাজন)
 *   **1. Clinical Skincare (pharmacy only)**
 *
 * The defining signal of a real product line is a **bold** span immediately
 * after the leading number — that's the primary filter, not just "starts
 * with a number". Supports both English and Bengali numerals/punctuation.
 */

// A leading "1." / "12)" / "৬." style marker (Arabic or Bengali digits).
const LEADING_NUMBER = /^([0-9]+|[০-৯]+)[.)]\s*/
// dash-ish separators: hyphen, en dash, em dash
const DASH_CHARS = '\\-\u2013\u2014'
const LEADING_DASH_PUNCT = new RegExp(`^[\\s${DASH_CHARS}:।,]+`)

function stripLeadingDash(text) {
  return text.replace(LEADING_DASH_PUNCT, '')
}

/**
 * Parses one line into { name, notes } or null if it should be skipped
 * (blank line, or a category header — see module doc above).
 */
function parseLine(rawLine) {
  const line = rawLine.trim()
  if (!line) return null

  // A real product line always starts with a plain number+period — headers
  // that are wrapped in ** (e.g. "**1. Clinical Skincare**") fail this match
  // immediately since the line starts with "*", not a digit.
  const numMatch = line.match(LEADING_NUMBER)
  if (!numMatch) return null
  const rest = line.slice(numMatch[0].length)

  // The number must be followed directly by a **bold** span — this is the
  // one signal that reliably tells a product line apart from a category
  // header using the same numbering (headers never carry ** markdown).
  const boldMatch = rest.match(/^\*\*(.+?)\*\*/)
  if (!boldMatch) return null

  const boldText = boldMatch[1].trim()
  if (!boldText) return null

  // Everything after the bold name, dash stripped from the front.
  let after = stripLeadingDash(rest.slice(boldMatch[0].length))

  // The "lead segment" is the text up to the first " - " (a plain hyphen
  // separator, distinct from the em-dash right after the bold name). A
  // brand parenthetical only counts as a brand when it's followed by a
  // further " - " description — otherwise a parenthetical here is just
  // part of the description itself (e.g. a packaging note) and must stay
  // in notes untouched, not get folded into the name.
  const sepIdx = after.indexOf(' - ')
  let brand = ''
  if (sepIdx !== -1) {
    const leadSegment = after.slice(0, sepIdx)
    const parenMatch = leadSegment.match(/\(([^)]+)\)/)
    if (parenMatch) {
      brand = parenMatch[1].trim()
      after = after.replace(parenMatch[0], '')
    }
  }

  const name = brand ? `${boldText} (${brand})` : boldText
  const notes = stripLeadingDash(after).replace(/\s{2,}/g, ' ').trim()

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
