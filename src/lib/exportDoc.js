/**
 * Reusable PDF document builder/downloader — shared by the Shopping receipt
 * (Part A) and the Travel expenses report (Part B). Keep this the ONE place
 * that knows how to lay out a title + tabular sections + totals as a PDF.
 *
 * buildAndDownloadDocument({
 *   filename,   // without extension, e.g. 'shopping-receipt-2026-09-13'
 *   title,      // big heading at the top
 *   subtitle,   // e.g. a date line, shown muted under the title
 *   sections: [
 *     {
 *       heading,      // optional section heading, e.g. "India (₹ INR)"
 *       table: {      // optional table
 *         columns: [{ label, align: 'left' | 'right', width }], // width = fraction of content width
 *         rows: [[cell, cell, ...], ...],
 *       },
 *       lines,        // optional plain text lines (e.g. category subtotals)
 *     },
 *   ],
 *   totals: [{ label, emphasize }],   // bottom block, below a divider
 *   note,        // optional small italic note at the very bottom
 * })
 *
 * Returns a Promise. jsPDF is loaded via dynamic import so it stays out of
 * the main app bundle and is only fetched the first time someone actually
 * downloads a document.
 */

const MARGIN = 14
const LINE_H = 6

function ensureSpace(doc, y, needed = LINE_H) {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (y + needed > pageHeight - MARGIN) {
    doc.addPage()
    return MARGIN
  }
  return y
}

function drawTable(doc, table, x, y, width) {
  const { columns, rows } = table
  const colWidths = columns.map((c) => (c.width || 1 / columns.length) * width)
  const colX = []
  let cursor = x
  colWidths.forEach((w) => {
    colX.push(cursor)
    cursor += w
  })

  y = ensureSpace(doc, y, 10)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(90)
  columns.forEach((c, i) => {
    const align = c.align === 'right' ? 'right' : 'left'
    const tx = align === 'right' ? colX[i] + colWidths[i] : colX[i]
    doc.text(c.label, tx, y, { align })
  })
  y += 4
  doc.setDrawColor(210)
  doc.line(x, y, x + width, y)
  y += 5

  doc.setFont('courier', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(20)
  rows.forEach((row) => {
    y = ensureSpace(doc, y)
    row.forEach((cell, i) => {
      const align = columns[i].align === 'right' ? 'right' : 'left'
      const tx = align === 'right' ? colX[i] + colWidths[i] : colX[i]
      doc.text(String(cell), tx, y, { align })
    })
    y += LINE_H
  })
  return y + 2
}

export async function buildAndDownloadDocument({
  filename,
  title,
  subtitle,
  sections = [],
  totals = [],
  note,
}) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - MARGIN * 2
  let y = MARGIN

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(20)
  doc.text(title, MARGIN, y)
  y += 8

  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(110)
    doc.text(subtitle, MARGIN, y)
    doc.setTextColor(20)
    y += 8
  }

  sections.forEach((section) => {
    y = ensureSpace(doc, y, 10)
    if (section.heading) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(20)
      doc.text(section.heading, MARGIN, y)
      y += 7
    }

    if (section.table) {
      y = drawTable(doc, section.table, MARGIN, y, contentWidth)
    }

    if (section.lines && section.lines.length) {
      doc.setFont('courier', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(60)
      section.lines.forEach((line) => {
        y = ensureSpace(doc, y)
        doc.text(line, MARGIN, y)
        y += LINE_H
      })
      doc.setTextColor(20)
      y += 2
    }

    y += 3
  })

  if (totals.length) {
    y = ensureSpace(doc, y, 6)
    doc.setDrawColor(190)
    doc.line(MARGIN, y, MARGIN + contentWidth, y)
    y += 8
    totals.forEach((t) => {
      y = ensureSpace(doc, y, 9)
      doc.setFont('helvetica', t.emphasize ? 'bold' : 'normal')
      doc.setFontSize(t.emphasize ? 14 : 11)
      doc.setTextColor(20)
      doc.text(t.label, MARGIN, y)
      y += t.emphasize ? 9 : 7
    })
  }

  if (note) {
    y = ensureSpace(doc, y, 10)
    y += 2
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(120)
    const wrapped = doc.splitTextToSize(note, contentWidth)
    doc.text(wrapped, MARGIN, y)
    doc.setTextColor(20)
  }

  doc.save(`${filename}.pdf`)
}
