import { jsPDF } from 'jspdf'

export const SECTION_META = {
  titles: { label: 'Research Title Options' },
  abstract: { label: 'Abstract' },
  keywords: { label: 'Keywords' },
  objectives: { label: 'Research Objectives' },
  future_enhancements: { label: 'Future Enhancements' },
}
export const SECTION_ORDER = ['titles', 'abstract', 'keywords', 'objectives', 'future_enhancements']

/** jsPDF core fonts are Latin-1 only; normalise typographic characters. */
const clean = (s = '') =>
  String(s)
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/…/g, '...')
    .replace(/[   ]/g, ' ')
    .replace(/[•●]/g, '-')
    .replace(/[^\x09\x0A\x0D\x20-\x7E¡-ÿ]/g, '')

export const primaryTitle = (r) => r.result.titles?.[r.selectedTitle ?? 0] || r.result.titles?.[0] || 'Research Proposal'

const listText = (arr) => arr.map((v, i) => `${i + 1}. ${v}`).join('\n')

/** Plain text used for Copy buttons and the "Copy all" action. */
export function sectionText(research, key) {
  const v = research.result[key]
  if (!v) return ''
  if (key === 'abstract') return v
  if (key === 'keywords') return v.join(', ')
  return listText(v)
}

export function fullText(research, sections = SECTION_ORDER) {
  const { input } = research
  const domain = input.domain === 'Other' && input.customDomain ? input.customDomain : input.domain
  const head = [
    primaryTitle(research).toUpperCase(),
    `Domain: ${domain} | Level: ${input.level}`,
    `Project idea: ${input.idea}`,
    '',
  ]
  const body = sections
    .filter((k) => research.result[k])
    .map((k) => `${SECTION_META[k].label.toUpperCase()}\n${sectionText(research, k)}`)
  return [...head, body.join('\n\n')].join('\n')
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'research'

/** Build a formatted A4 PDF. `sections` limits content (per-card download) */
export function buildPdf(research, sections = SECTION_ORDER) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 56
  const CW = W - M * 2
  const { input, result } = research
  const domain = input.domain === 'Other' && input.customDomain ? input.customDomain : input.domain
  let y = 0

  const ensure = (need) => {
    if (y + need > H - 60) {
      doc.addPage()
      y = M
    }
  }

  // ---- header band ----
  doc.setFillColor(10, 15, 44)
  doc.rect(0, 0, W, 118, 'F')
  doc.setFillColor(139, 92, 246)
  doc.rect(0, 118, W * 0.55, 4, 'F')
  doc.setFillColor(47, 168, 255)
  doc.rect(W * 0.55, 118, W * 0.45, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('RESEARCHMATE AI', M, 38)
  const brandW = doc.getTextWidth('RESEARCHMATE AI')
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(167, 139, 250)
  doc.text('Smart Research Assistant', M + brandW + 12, 38)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  const titleLines = doc.splitTextToSize(clean(primaryTitle(research)), CW).slice(0, 3)
  doc.text(titleLines, M, 66, { lineHeightFactor: 1.25 })
  y = 150

  // ---- meta ----
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(100, 116, 139)
  const date = new Date(research.createdAt || Date.now()).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  doc.text(clean(`Domain: ${domain}   |   Level: ${input.level}   |   Generated: ${date}`), M, y)
  y += 20
  doc.setFont('helvetica', 'italic')
  const ideaLines = doc.splitTextToSize(clean(`Project idea: ${input.idea}`), CW)
  doc.text(ideaLines, M, y)
  y += ideaLines.length * 13 + 16

  const heading = (text) => {
    ensure(44)
    doc.setFillColor(139, 92, 246)
    doc.roundedRect(M, y - 11, 4, 16, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text(clean(text.toUpperCase()), M + 14, y + 1)
    y += 24
  }

  const paragraph = (text, indent = 0, size = 11) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    doc.setTextColor(30, 41, 59)
    const lines = doc.splitTextToSize(clean(text), CW - indent)
    lines.forEach((line) => {
      ensure(16)
      doc.text(line, M + indent, y)
      y += 16
    })
  }

  const numbered = (arr) =>
    arr.forEach((item, i) => {
      const lines = doc.splitTextToSize(clean(item), CW - 28)
      ensure(lines.length * 16 + 8)
      doc.setFillColor(237, 233, 254)
      doc.circle(M + 9, y - 4, 9, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(109, 40, 217)
      doc.text(String(i + 1), M + 9, y - 0.8, { align: 'center' })
      paragraph(item, 28)
      y += 6
    })

  sections.forEach((key) => {
    const v = result[key]
    if (!v) return
    heading(SECTION_META[key].label)
    if (key === 'abstract') {
      paragraph(v)
    } else if (key === 'keywords') {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      let x = M
      v.forEach((kw) => {
        const w = doc.getTextWidth(clean(kw)) + 20
        if (x + w > M + CW) {
          x = M
          y += 28
        }
        ensure(28)
        doc.setFillColor(237, 233, 254)
        doc.roundedRect(x, y - 13, w, 22, 11, 11, 'F')
        doc.setTextColor(91, 33, 182)
        doc.text(clean(kw), x + 10, y + 1.5)
        x += w + 8
      })
      y += 24
    } else {
      numbered(v)
    }
    y += 14
  })

  // ---- disclaimer ----
  ensure(50)
  doc.setDrawColor(226, 232, 240)
  doc.line(M, y, W - M, y)
  y += 16
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139)
  paragraph(
    'AI-generated research proposal. Methods and outcomes described are proposed, not completed results. Review, verify and refine before academic submission.',
    0, 8.5,
  )

  // ---- footer ----
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(148, 163, 184)
    doc.text('ResearchMate AI', M, H - 28)
    doc.text(`Page ${i} of ${pages}`, W - M, H - 28, { align: 'right' })
  }
  return doc
}

export function downloadPdf(research, sections = SECTION_ORDER, suffix = '') {
  const doc = buildPdf(research, sections)
  doc.save(`${slug(primaryTitle(research))}${suffix ? '-' + suffix : ''}.pdf`)
}
