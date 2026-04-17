// Dynamic-imported exporters — keeps jsPDF/docx/html2canvas out of the main bundle.
import type {
  CurriculumBlueprint,
  IdeaReport,
  SalesPageDraft,
  EmailSequence,
  PricingPackages,
  GrowthPlan,
} from '@/types'

// ---------- PDF ----------
export const exportCurriculumPDF = async (c: CurriculumBlueprint) => {
  const [{ default: jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableMod.default || (autoTableMod as any)

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  // Cover
  doc.setFillColor(79, 70, 229)
  doc.rect(0, 0, pageW, 160, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text('ACADEMY CURRICULUM SUITE', 40, 50)
  doc.setFontSize(22)
  doc.text(c.title || 'Curriculum Blueprint', 40, 90)
  doc.setFontSize(11)
  doc.text(`Status: ${c.status}  |  Lean Score: ${c.leanScore}/100`, 40, 120)
  doc.text(`Updated: ${new Date(c.updatedAt).toLocaleDateString()}`, 40, 140)

  let y = 200
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(14)
  doc.text('Transformation Map', 40, y)
  y += 20
  doc.setFontSize(10)
  const tm = doc.splitTextToSize(c.transformationMap || '-', pageW - 80)
  doc.text(tm, 40, y)
  y += tm.length * 14 + 20

  doc.setFontSize(12)
  doc.text(`Starting Point:  ${c.startingPoint || '-'}`, 40, y); y += 16
  doc.text(`Destination:      ${c.destination || '-'}`, 40, y); y += 16
  doc.text(`Audience:          ${c.audience || '-'}`, 40, y); y += 16
  doc.text(`Duration:          ${c.duration || '-'}`, 40, y); y += 24

  // Modules table
  autoTable(doc, {
    startY: y,
    head: [['#', 'Module', 'Transformation', 'Objectives']],
    body: c.modules.map((m) => [
      String(m.order),
      m.title || '—',
      m.transformation || '—',
      m.objectives.map((o, i) => `${i + 1}. ${o.text}`).join('\n') || '—',
    ]),
    styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: { 0: { cellWidth: 24 }, 1: { cellWidth: 130 }, 2: { cellWidth: 150 } },
    theme: 'striped',
  })

  // Content pages
  c.modules.forEach((m, i) => {
    doc.addPage()
    doc.setFillColor(238, 242, 255)
    doc.rect(0, 0, pageW, 60, 'F')
    doc.setTextColor(79, 70, 229)
    doc.setFontSize(10)
    doc.text(`MODULE ${i + 1}`, 40, 30)
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(16)
    doc.text(m.title || '', 40, 50)

    let yy = 90
    doc.setFontSize(11)
    doc.setTextColor(100, 116, 139)
    doc.text('Summary', 40, yy); yy += 16
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(10)
    const sLines = doc.splitTextToSize(m.summary || '-', pageW - 80)
    doc.text(sLines, 40, yy); yy += sLines.length * 14 + 12

    doc.setFontSize(11)
    doc.setTextColor(100, 116, 139)
    doc.text('Content', 40, yy); yy += 16
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(10)
    const cLines = doc.splitTextToSize(m.content || '-', pageW - 80)
    doc.text(cLines, 40, yy); yy += cLines.length * 14 + 12

    doc.setFontSize(11)
    doc.setTextColor(100, 116, 139)
    doc.text('Learning Objectives', 40, yy); yy += 16
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(10)
    m.objectives.forEach((o, idx) => {
      const l = doc.splitTextToSize(`${idx + 1}. ${o.text}`, pageW - 80)
      doc.text(l, 40, yy)
      yy += l.length * 14
    })
  })

  doc.save(`${c.title || 'curriculum'}.pdf`)
}

// ---------- Word ----------
export const exportCurriculumWord = async (c: CurriculumBlueprint) => {
  const [{ Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle }, { saveAs }] =
    await Promise.all([import('docx'), import('file-saver')])

  const H = (t: string, level: any) =>
    new Paragraph({ text: t, heading: level, spacing: { before: 200, after: 120 } })
  const P = (t: string) => new Paragraph({ children: [new TextRun(t)], spacing: { after: 100 } })
  const B = (label: string, value: string) =>
    new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true }),
        new TextRun({ text: value || '-' }),
      ],
      spacing: { after: 80 },
    })

  const children: any[] = [
    new Paragraph({
      children: [new TextRun({ text: 'ACADEMY CURRICULUM SUITE', bold: true, color: '4f46e5' })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: c.title || 'Curriculum Blueprint', bold: true, size: 40 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
      border: {
        bottom: { color: '4f46e5', space: 4, style: BorderStyle.SINGLE, size: 8 },
      },
    }),
    B('Status', c.status),
    B('Lean Score', `${c.leanScore}/100`),
    B('Updated', new Date(c.updatedAt).toLocaleString()),
    H('Transformation Map', HeadingLevel.HEADING_1),
    P(c.transformationMap || '-'),
    B('Starting Point', c.startingPoint),
    B('Destination', c.destination),
    B('Audience', c.audience),
    B('Duration', c.duration),
    H('Modules', HeadingLevel.HEADING_1),
  ]

  c.modules.forEach((m, i) => {
    children.push(H(`Module ${i + 1}: ${m.title || ''}`, HeadingLevel.HEADING_2))
    children.push(B('Transformation', m.transformation))
    children.push(H('Summary', HeadingLevel.HEADING_3))
    children.push(P(m.summary || '-'))
    children.push(H('Content', HeadingLevel.HEADING_3))
    children.push(P(m.content || '-'))
    children.push(H('Learning Objectives', HeadingLevel.HEADING_3))
    m.objectives.forEach((o, idx) => children.push(P(`${idx + 1}. ${o.text}`)))
  })

  const doc = new Document({
    creator: 'Academy Curriculum Suite',
    title: c.title || 'Curriculum Blueprint',
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${c.title || 'curriculum'}.docx`)
}

// ---------- HTML export (branded, standalone) ----------
export const exportCurriculumHTML = async (c: CurriculumBlueprint) => {
  const { saveAs } = await import('file-saver')
  const esc = (s: string) =>
    (s || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!))

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.title || 'Curriculum')}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', 'Inter', system-ui, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.7; padding: 40px 20px; }
  .wrap { max-width: 860px; margin: 0 auto; }
  .cover { background: linear-gradient(135deg, #4f46e5, #ec4899); color: #fff; padding: 60px 40px; border-radius: 24px; margin-bottom: 40px; position: relative; overflow: hidden; }
  .cover::before { content: ''; position: absolute; inset: 0; background: radial-gradient(at 20% 20%, rgba(255,255,255,0.15), transparent 50%); }
  .eyebrow { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.8; }
  h1 { font-size: 42px; font-weight: 900; margin: 12px 0 20px; }
  .meta { display: flex; gap: 20px; flex-wrap: wrap; font-size: 13px; opacity: 0.9; }
  .meta span { background: rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 999px; backdrop-filter: blur(10px); }
  .section { background: #fff; border-radius: 20px; padding: 32px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
  h2 { font-size: 22px; font-weight: 800; margin-bottom: 16px; color: #4f46e5; }
  h3 { font-size: 16px; font-weight: 700; margin: 16px 0 8px; color: #1e293b; }
  .tmap { background: linear-gradient(135deg, #eef2ff, #fce7f3); padding: 24px; border-radius: 16px; font-size: 15px; }
  .kv { display: grid; grid-template-columns: 140px 1fr; gap: 8px; margin: 8px 0; font-size: 14px; }
  .kv strong { color: #64748b; font-weight: 600; }
  .module { border-right: 4px solid #4f46e5; padding-right: 20px; margin-bottom: 24px; }
  .module-num { display: inline-block; background: linear-gradient(135deg, #4f46e5, #ec4899); color: #fff; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 10px; font-weight: 800; margin-left: 12px; }
  .module h3 { display: inline-block; font-size: 18px; vertical-align: middle; }
  .transformation { background: #fef3c7; padding: 10px 14px; border-radius: 10px; font-size: 13px; margin: 10px 0; color: #92400e; }
  .content { color: #475569; font-size: 14px; margin: 10px 0; }
  ul.obj { list-style: none; padding: 0; }
  ul.obj li { padding: 8px 0; padding-right: 24px; position: relative; font-size: 14px; color: #334155; }
  ul.obj li::before { content: '✓'; position: absolute; right: 0; color: #4f46e5; font-weight: 800; }
  .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px; }
  @media print {
    body { background: #fff; padding: 0; }
    .section { box-shadow: none; border: 1px solid #e2e8f0; page-break-inside: avoid; }
    .cover { page-break-after: always; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="cover">
    <div class="eyebrow">ACADEMY CURRICULUM SUITE</div>
    <h1>${esc(c.title || 'Curriculum Blueprint')}</h1>
    <div class="meta">
      <span>Status: ${esc(c.status)}</span>
      <span>Lean Score: ${c.leanScore}/100</span>
      <span>${new Date(c.updatedAt).toLocaleDateString()}</span>
    </div>
  </div>

  <div class="section">
    <h2>خريطة التحوّل</h2>
    <div class="tmap">${esc(c.transformationMap) || '—'}</div>
    <div style="margin-top: 20px;">
      <div class="kv"><strong>نقطة البداية</strong><span>${esc(c.startingPoint) || '—'}</span></div>
      <div class="kv"><strong>الوجهة</strong><span>${esc(c.destination) || '—'}</span></div>
      <div class="kv"><strong>الجمهور</strong><span>${esc(c.audience) || '—'}</span></div>
      <div class="kv"><strong>المدة</strong><span>${esc(c.duration) || '—'}</span></div>
    </div>
  </div>

  <div class="section">
    <h2>الوحدات (${c.modules.length})</h2>
    ${c.modules
      .map(
        (m, i) => `
      <div class="module">
        <div><span class="module-num">${i + 1}</span><h3>${esc(m.title) || 'Untitled'}</h3></div>
        ${m.transformation ? `<div class="transformation">${esc(m.transformation)}</div>` : ''}
        ${m.summary ? `<p class="content"><strong>الملخص:</strong> ${esc(m.summary)}</p>` : ''}
        ${m.content ? `<p class="content">${esc(m.content)}</p>` : ''}
        ${
          m.objectives.length
            ? `<h3>أهداف التعلم</h3><ul class="obj">${m.objectives
                .map((o) => `<li>${esc(o.text) || '—'}</li>`)
                .join('')}</ul>`
            : ''
        }
      </div>
    `
      )
      .join('')}
  </div>

  <div class="footer">
    Generated by Academy Curriculum Suite · ${new Date().toLocaleString()}
  </div>
</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, `${c.title || 'curriculum'}.html`)
}

// ---------- PowerPoint export ----------
export const exportCurriculumPPT = async (c: CurriculumBlueprint) => {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_WIDE'
  pptx.defineSlideMaster({
    title: 'BRAND',
    background: { color: 'FFFFFF' },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.35, fill: { color: '4F46E5' } } },
      {
        text: {
          text: 'اختبر منتجك أو فكرتك بالبداية مع المهندس عبدالعزيز',
          options: { x: 0.4, y: 0.05, w: 10, h: 0.25, fontSize: 10, color: 'FFFFFF', fontFace: 'Arial' },
        },
      },
    ],
  })

  // Cover slide
  const cover = pptx.addSlide({ masterName: 'BRAND' })
  cover.background = { color: '4F46E5' }
  cover.addText(c.title || 'Curriculum Blueprint', {
    x: 0.5,
    y: 2,
    w: '90%',
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    fontFace: 'Arial',
  })
  cover.addText(
    [
      { text: `Status: ${c.status}`, options: { bullet: true } },
      { text: `Lean Score: ${c.leanScore}/100`, options: { bullet: true } },
      { text: `Modules: ${c.modules.length}`, options: { bullet: true } },
    ],
    { x: 1, y: 4, w: '80%', h: 2, fontSize: 18, color: 'E0E7FF', align: 'center' }
  )

  // Transformation Map slide
  const tmSlide = pptx.addSlide({ masterName: 'BRAND' })
  tmSlide.addText('خريطة التحوّل · Transformation Map', {
    x: 0.5,
    y: 0.6,
    w: '90%',
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: '4F46E5',
  })
  tmSlide.addText(c.transformationMap || '—', {
    x: 0.5,
    y: 1.5,
    w: '90%',
    h: 2,
    fontSize: 16,
    color: '1E293B',
  })
  tmSlide.addText(
    [
      { text: 'Starting: ', options: { bold: true } },
      { text: c.startingPoint || '-' },
      { text: '\nDestination: ', options: { bold: true } },
      { text: c.destination || '-' },
      { text: '\nAudience: ', options: { bold: true } },
      { text: c.audience || '-' },
    ],
    { x: 0.5, y: 4, w: '90%', h: 2, fontSize: 14, color: '475569' }
  )

  // One slide per module
  c.modules.forEach((m, i) => {
    const s = pptx.addSlide({ masterName: 'BRAND' })
    s.addText(`Module ${i + 1}`, {
      x: 0.5,
      y: 0.55,
      w: '90%',
      h: 0.35,
      fontSize: 12,
      color: 'EC4899',
      bold: true,
    })
    s.addText(m.title || 'Untitled', {
      x: 0.5,
      y: 0.95,
      w: '90%',
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: '1E293B',
    })
    if (m.transformation) {
      s.addText(`التحوّل: ${m.transformation}`, {
        x: 0.5,
        y: 1.85,
        w: '90%',
        h: 0.6,
        fontSize: 14,
        color: 'EC4899',
        italic: true,
      })
    }
    if (m.summary) {
      s.addText(m.summary, {
        x: 0.5,
        y: 2.6,
        w: '90%',
        h: 1.2,
        fontSize: 13,
        color: '475569',
      })
    }
    if (m.objectives.length) {
      s.addText('أهداف التعلم', {
        x: 0.5,
        y: 4,
        w: '90%',
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: '4F46E5',
      })
      s.addText(
        m.objectives.map((o) => ({ text: o.text || '-', options: { bullet: true } })),
        { x: 0.5, y: 4.5, w: '90%', h: 2, fontSize: 12, color: '334155' }
      )
    }
    // Speaker notes
    s.addNotes(
      `${m.title}\n\nTransformation: ${m.transformation}\n\nSummary: ${m.summary}\n\nContent: ${m.content}`
    )
  })

  // Thank you slide
  const end = pptx.addSlide({ masterName: 'BRAND' })
  end.background = { color: '4F46E5' }
  end.addText('شكراً · Thank You', {
    x: 0.5,
    y: 3,
    w: '90%',
    h: 1.5,
    fontSize: 54,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })
  end.addText('اختبر منتجك أو فكرتك بالبداية مع المهندس عبدالعزيز', {
    x: 0.5,
    y: 4.8,
    w: '90%',
    h: 0.6,
    fontSize: 16,
    color: 'E0E7FF',
    align: 'center',
  })

  await pptx.writeFile({ fileName: `${c.title || 'curriculum'}.pptx` })
}

// ---------- Course Bundle Export (all deliverables in one PDF) ----------
export interface CourseBundle {
  courseName: string
  curriculum?: CurriculumBlueprint
  idea?: IdeaReport
  sales?: SalesPageDraft
  email?: EmailSequence
  pricing?: PricingPackages
  growth?: GrowthPlan
}

export const exportCourseBundle = async (bundle: CourseBundle) => {
  const { default: jsPDF } = await import('jspdf')
  const autoTableMod = await import('jspdf-autotable')
  const autoTable = autoTableMod.default || (autoTableMod as any)

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  // ========== COVER PAGE ==========
  doc.setFillColor(79, 70, 229)
  doc.rect(0, 0, pageW, pageH, 'F')
  doc.setFillColor(236, 72, 153)
  doc.circle(pageW - 60, 80, 120, 'F')
  doc.setFillColor(99, 102, 241)
  doc.circle(60, pageH - 100, 100, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text('ACADEMY CURRICULUM SUITE', 40, 80)
  doc.text('COMPLETE COURSE BUNDLE', 40, 95)
  doc.setFontSize(32)
  doc.text(bundle.courseName, 40, 200, { maxWidth: pageW - 80 })
  doc.setFontSize(11)
  const sections: string[] = []
  if (bundle.idea) sections.push('• Idea Report')
  if (bundle.curriculum) sections.push('• Curriculum Blueprint')
  if (bundle.sales) sections.push('• Sales Page')
  if (bundle.email) sections.push('• Launch Email Sequence')
  if (bundle.pricing) sections.push('• Pricing Packages')
  if (bundle.growth) sections.push('• Growth Plan')
  sections.forEach((s, i) => doc.text(s, 40, 260 + i * 20))
  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, pageH - 60)

  const addHeader = (title: string) => {
    doc.addPage()
    doc.setFillColor(238, 242, 255)
    doc.rect(0, 0, pageW, 70, 'F')
    doc.setTextColor(79, 70, 229)
    doc.setFontSize(10)
    doc.text('SECTION', 40, 32)
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(18)
    doc.text(title, 40, 55)
  }

  // ========== IDEA REPORT ==========
  if (bundle.idea) {
    addHeader('Idea Discovery Report')
    let y = 100
    doc.setFontSize(11)
    doc.setTextColor(100, 116, 139)
    doc.text('Positioning Statement', 40, y); y += 18
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(10)
    const ps = doc.splitTextToSize(bundle.idea.positioningStatement || '-', pageW - 80)
    doc.text(ps, 40, y); y += ps.length * 14 + 20

    autoTable(doc, {
      startY: y,
      head: [['Idea', 'Demand', 'Gap', 'Strongest']],
      body: bundle.idea.ideas.map((i) => [i.title, i.demandSignal, i.gap, i.isStrongest ? '✓' : '']),
      styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
      headStyles: { fillColor: [79, 70, 229] },
      theme: 'striped',
    })
  }

  // ========== CURRICULUM ==========
  if (bundle.curriculum) {
    const c = bundle.curriculum
    addHeader('Curriculum Blueprint')
    let y = 100
    doc.setFontSize(11)
    doc.setTextColor(100, 116, 139)
    doc.text('Transformation Map', 40, y); y += 18
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(10)
    const tm = doc.splitTextToSize(c.transformationMap || '-', pageW - 80)
    doc.text(tm, 40, y); y += tm.length * 14 + 10
    doc.text(`Starting: ${c.startingPoint || '-'}`, 40, y); y += 14
    doc.text(`Destination: ${c.destination || '-'}`, 40, y); y += 14
    doc.text(`Audience: ${c.audience || '-'}`, 40, y); y += 20

    autoTable(doc, {
      startY: y,
      head: [['#', 'Module', 'Transformation', 'Objectives']],
      body: c.modules.map((m) => [
        String(m.order),
        m.title || '—',
        m.transformation || '—',
        m.objectives.map((o, i) => `${i + 1}. ${o.text}`).join('\n') || '—',
      ]),
      styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: { 0: { cellWidth: 24 }, 1: { cellWidth: 130 }, 2: { cellWidth: 140 } },
      theme: 'striped',
    })
  }

  // ========== SALES PAGE ==========
  if (bundle.sales) {
    const s = bundle.sales
    addHeader('Sales Page')
    let y = 100
    doc.setFontSize(10)
    const fields = [
      ['Headline', s.headline],
      ['Problem', s.problem],
      ['Solution', s.solution],
      ['CTA', s.cta],
    ]
    fields.forEach(([label, val]) => {
      doc.setTextColor(100, 116, 139)
      doc.text(label, 40, y); y += 14
      doc.setTextColor(30, 41, 59)
      const lines = doc.splitTextToSize(val || '-', pageW - 80)
      doc.text(lines, 40, y); y += lines.length * 14 + 10
    })
    doc.setTextColor(100, 116, 139)
    doc.text('Offer Structure', 40, y); y += 14
    doc.setTextColor(30, 41, 59)
    s.offerStructure.forEach((item) => {
      const lines = doc.splitTextToSize(`• ${item}`, pageW - 80)
      doc.text(lines, 40, y); y += lines.length * 14
    })
  }

  // ========== EMAIL SEQUENCE ==========
  if (bundle.email) {
    addHeader('Launch Email Sequence')
    autoTable(doc, {
      startY: 100,
      head: [['#', 'Subject', 'Timing', 'Job']],
      body: bundle.email.emails.map((e, i) => [String(i + 1), e.subject, e.timing, e.job]),
      styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
      headStyles: { fillColor: [79, 70, 229] },
      theme: 'striped',
    })
  }

  // ========== PRICING ==========
  if (bundle.pricing) {
    addHeader('Pricing & Packages')
    autoTable(doc, {
      startY: 100,
      head: [['Tier', 'Price', 'Upgrade Reason', 'Features']],
      body: bundle.pricing.tiers.map((t) => [
        t.name,
        `$${t.price}`,
        t.upgradeReason,
        t.features.join('\n'),
      ]),
      styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
      headStyles: { fillColor: [79, 70, 229] },
      theme: 'striped',
    })
  }

  // ========== GROWTH ==========
  if (bundle.growth) {
    const g = bundle.growth
    addHeader('First 100 Students Growth Plan')
    let y = 100
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text('Waitlist Strategy', 40, y); y += 14
    doc.setTextColor(30, 41, 59)
    const wl = doc.splitTextToSize(g.waitlistStrategy, pageW - 80)
    doc.text(wl, 40, y); y += wl.length * 14 + 10

    autoTable(doc, {
      startY: y,
      head: [['Channel', 'Reason']],
      body: g.channels.map((c) => [c.name, c.reason]),
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [79, 70, 229] },
      theme: 'striped',
    })

    autoTable(doc, {
      head: [['Week', 'Milestone']],
      body: g.milestones.map((m) => [`W${m.week}`, m.goal]),
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [236, 72, 153] },
      theme: 'striped',
    })
  }

  doc.save(`${bundle.courseName}-complete-bundle.pdf`)
}

// ---------- Generic JSON export for any deliverable ----------
export const exportJSON = async (name: string, data: any) => {
  const { saveAs } = await import('file-saver')
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  saveAs(blob, `${name}.json`)
}
