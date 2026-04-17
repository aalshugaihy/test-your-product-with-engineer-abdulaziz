/**
 * Generic exporters for non-curriculum service outputs.
 * Produces branded PDF / Word / HTML / PPT from a simple structured payload.
 */

import type {
  IdeaReport,
  SalesPageDraft,
  EmailSequence,
  PricingPackages,
  GrowthPlan,
} from '@/types'

const BRAND = {
  primary: [79, 70, 229] as [number, number, number],
  accent: [236, 72, 153] as [number, number, number],
  appTitle: 'اختبر منتجك أو فكرتك بالبداية مع المهندس عبدالعزيز',
}

// ---------- Shared helpers ----------
const esc = (s: string) =>
  (s || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!))

const htmlShell = (title: string, bodyInner: string): string => `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', system-ui, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.7; padding: 40px 20px; }
  .wrap { max-width: 860px; margin: 0 auto; }
  .cover { background: linear-gradient(135deg, #4f46e5, #ec4899); color: #fff; padding: 50px 40px; border-radius: 24px; margin-bottom: 30px; }
  .eyebrow { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.8; }
  h1 { font-size: 36px; font-weight: 900; margin: 10px 0; }
  .section { background: #fff; border-radius: 20px; padding: 28px; margin-bottom: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
  h2 { font-size: 20px; font-weight: 800; margin-bottom: 12px; color: #4f46e5; }
  h3 { font-size: 15px; font-weight: 700; margin: 12px 0 6px; color: #1e293b; }
  p { font-size: 14px; color: #475569; margin-bottom: 8px; }
  ul { list-style: none; padding: 0; }
  ul li { padding: 6px 0; padding-right: 20px; position: relative; font-size: 14px; }
  ul li::before { content: '✓'; position: absolute; right: 0; color: #4f46e5; font-weight: 800; }
  .box { background: linear-gradient(135deg, #eef2ff, #fce7f3); padding: 16px; border-radius: 12px; font-size: 14px; margin: 10px 0; }
  .tag { display: inline-block; background: #eef2ff; color: #4f46e5; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; margin: 2px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: right; font-size: 13px; }
  th { background: #eef2ff; color: #4f46e5; font-weight: 700; }
  .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 11px; }
  @media print { body { background: #fff; padding: 0; } .section { box-shadow: none; } .cover { page-break-after: always; } }
</style>
</head>
<body>
<div class="wrap">
  <div class="cover">
    <div class="eyebrow">${esc(BRAND.appTitle)}</div>
    <h1>${esc(title)}</h1>
  </div>
  ${bodyInner}
  <div class="footer">Generated · ${new Date().toLocaleString()}</div>
</div>
</body>
</html>`

// ---------- Idea Report ----------
const buildIdeaHtml = (r: IdeaReport, courseName: string): string => {
  const inner = `
    <div class="section">
      <h2>Positioning Statement</h2>
      <div class="box">${esc(r.positioningStatement)}</div>
    </div>
    <div class="section">
      <h2>Validated Ideas</h2>
      ${r.ideas
        .map(
          (i) => `
        <div style="margin-bottom: 20px; padding: 16px; border-right: 4px solid ${i.isStrongest ? '#4f46e5' : '#e2e8f0'}; background: #f8fafc; border-radius: 8px;">
          <h3>${esc(i.title)} ${i.isStrongest ? '<span class="tag">👑 الأقوى</span>' : ''}</h3>
          <p><strong>إشارة الطلب:</strong> ${esc(i.demandSignal)}</p>
          <p><strong>ملاءمة المصداقية:</strong> ${esc(i.credibilityFit)}</p>
          <p><strong>فجوة السوق:</strong> ${esc(i.gap)}</p>
        </div>
      `
        )
        .join('')}
    </div>`
  return htmlShell(`${courseName} — Idea Report`, inner)
}

const buildSalesHtml = (s: SalesPageDraft, courseName: string): string => {
  const inner = `
    <div class="section"><h2>Headline</h2><p>${esc(s.headline)}</p></div>
    <div class="section"><h2>Problem</h2><p>${esc(s.problem)}</p></div>
    <div class="section"><h2>Solution</h2><p>${esc(s.solution)}</p></div>
    <div class="section"><h2>Offer Structure</h2><ul>${s.offerStructure.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></div>
    <div class="section"><h2>Objection Handling</h2>${s.objections.map((o) => `<div class="box">${esc(o)}</div>`).join('')}</div>
    <div class="section"><h2>Call to Action</h2><div class="box" style="text-align:center;font-size:18px;font-weight:700;">${esc(s.cta)}</div></div>
  `
  return htmlShell(`${courseName} — Sales Page`, inner)
}

const buildEmailHtml = (e: EmailSequence, courseName: string): string => {
  const inner = `
    <div class="section">
      <h2>Launch Email Sequence (${e.emails.length} emails)</h2>
      ${e.emails
        .map(
          (em, i) => `
        <div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <div class="tag">Email ${i + 1}</div>
          <div class="tag">${esc(em.timing)}</div>
          <div class="tag">Job: ${esc(em.job)}</div>
          <h3 style="margin-top:10px">Subject: ${esc(em.subject)}</h3>
          <p style="white-space: pre-wrap;">${esc(em.body)}</p>
        </div>
      `
        )
        .join('')}
    </div>`
  return htmlShell(`${courseName} — Launch Emails`, inner)
}

const buildPricingHtml = (p: PricingPackages, courseName: string): string => {
  const inner = `
    <div class="section">
      <h2>Outcome Value</h2>
      <div class="box">${esc(p.outcomeValue)}</div>
    </div>
    <div class="section">
      <h2>Pricing Tiers</h2>
      <table>
        <thead><tr><th>Tier</th><th>Price</th><th>Upgrade Reason</th><th>Features</th></tr></thead>
        <tbody>
          ${p.tiers
            .map(
              (t) => `<tr>
            <td><strong>${esc(t.name)}</strong></td>
            <td>$${t.price}</td>
            <td>${esc(t.upgradeReason)}</td>
            <td>${t.features.map((f) => `• ${esc(f)}`).join('<br/>')}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`
  return htmlShell(`${courseName} — Pricing`, inner)
}

const buildGrowthHtml = (g: GrowthPlan, courseName: string): string => {
  const inner = `
    <div class="section">
      <h2>Growth Plan — First 100 Students</h2>
      <p><strong>Current Audience:</strong> ${g.audienceSize} · <strong>Timeline:</strong> ${g.timelineWeeks} weeks</p>
    </div>
    <div class="section">
      <h2>Channels</h2>
      <ul>${g.channels.map((c) => `<li><strong>${esc(c.name)}</strong> — ${esc(c.reason)}</li>`).join('')}</ul>
    </div>
    <div class="section">
      <h2>Waitlist Strategy</h2>
      <div class="box">${esc(g.waitlistStrategy)}</div>
      <h2 style="margin-top:20px">Early Bird Offer</h2>
      <div class="box">${esc(g.earlyBird)}</div>
    </div>
    <div class="section">
      <h2>Weekly Milestones</h2>
      <table>
        <thead><tr><th>Week</th><th>Goal</th></tr></thead>
        <tbody>
          ${g.milestones.map((m) => `<tr><td>W${m.week}</td><td>${esc(m.goal)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>`
  return htmlShell(`${courseName} — Growth Plan`, inner)
}

// ---------- HTML export ----------
export const exportAssetHTML = async (
  kind: 'idea' | 'sales' | 'email' | 'pricing' | 'growth',
  data: any,
  courseName: string
) => {
  const { saveAs } = await import('file-saver')
  let html = ''
  switch (kind) {
    case 'idea':
      html = buildIdeaHtml(data, courseName)
      break
    case 'sales':
      html = buildSalesHtml(data, courseName)
      break
    case 'email':
      html = buildEmailHtml(data, courseName)
      break
    case 'pricing':
      html = buildPricingHtml(data, courseName)
      break
    case 'growth':
      html = buildGrowthHtml(data, courseName)
      break
  }
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, `${courseName}-${kind}.html`)
}

// ---------- PDF export ----------
export const exportAssetPDF = async (
  kind: 'idea' | 'sales' | 'email' | 'pricing' | 'growth',
  data: any,
  courseName: string
) => {
  const [{ default: jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableMod.default || (autoTableMod as any)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  // Cover
  doc.setFillColor(...BRAND.primary)
  doc.rect(0, 0, pageW, 140, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text(BRAND.appTitle, 40, 55)
  doc.setFontSize(22)
  doc.text(courseName, 40, 90)
  doc.setFontSize(12)
  doc.text(`${kind.toUpperCase()} REPORT`, 40, 115)

  let y = 180
  doc.setTextColor(30, 41, 59)

  if (kind === 'idea') {
    const r = data as IdeaReport
    doc.setFontSize(14)
    doc.text('Positioning Statement', 40, y)
    y += 18
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(r.positioningStatement || '-', pageW - 80)
    doc.text(lines, 40, y)
    y += lines.length * 14 + 20

    autoTable(doc, {
      startY: y,
      head: [['Idea', 'Demand', 'Credibility', 'Gap', 'Strongest']],
      body: r.ideas.map((i) => [i.title, i.demandSignal, i.credibilityFit, i.gap, i.isStrongest ? '✓' : '']),
      styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
      headStyles: { fillColor: BRAND.primary },
      theme: 'striped',
    })
  } else if (kind === 'sales') {
    const s = data as SalesPageDraft
    const fields: [string, string][] = [
      ['Headline', s.headline],
      ['Problem', s.problem],
      ['Solution', s.solution],
      ['CTA', s.cta],
    ]
    fields.forEach(([label, val]) => {
      doc.setFontSize(11)
      doc.setTextColor(100, 116, 139)
      doc.text(label, 40, y)
      y += 14
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(10)
      const lines = doc.splitTextToSize(val || '-', pageW - 80)
      doc.text(lines, 40, y)
      y += lines.length * 14 + 10
    })
    autoTable(doc, {
      startY: y,
      head: [['Offer Structure']],
      body: s.offerStructure.map((o) => [o]),
      headStyles: { fillColor: BRAND.primary },
      styles: { fontSize: 10 },
    })
  } else if (kind === 'email') {
    const e = data as EmailSequence
    autoTable(doc, {
      startY: y,
      head: [['#', 'Timing', 'Subject', 'Job']],
      body: e.emails.map((em, i) => [String(i + 1), em.timing, em.subject, em.job]),
      styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
      headStyles: { fillColor: BRAND.primary },
      theme: 'striped',
    })
    e.emails.forEach((em, i) => {
      doc.addPage()
      doc.setFillColor(238, 242, 255)
      doc.rect(0, 0, pageW, 55, 'F')
      doc.setTextColor(...BRAND.primary)
      doc.setFontSize(10)
      doc.text(`EMAIL ${i + 1} · ${em.timing}`, 40, 30)
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(14)
      doc.text(em.subject, 40, 50)
      doc.setFontSize(10)
      const lines = doc.splitTextToSize(em.body, pageW - 80)
      doc.text(lines, 40, 90)
    })
  } else if (kind === 'pricing') {
    const p = data as PricingPackages
    doc.setFontSize(12)
    doc.text('Outcome Value', 40, y); y += 16
    doc.setFontSize(10)
    const ol = doc.splitTextToSize(p.outcomeValue || '-', pageW - 80)
    doc.text(ol, 40, y); y += ol.length * 14 + 20
    autoTable(doc, {
      startY: y,
      head: [['Tier', 'Price', 'Upgrade Reason', 'Features']],
      body: p.tiers.map((t) => [t.name, `$${t.price}`, t.upgradeReason, t.features.join('\n')]),
      styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
      headStyles: { fillColor: BRAND.primary },
      theme: 'striped',
    })
  } else if (kind === 'growth') {
    const g = data as GrowthPlan
    doc.setFontSize(11)
    doc.text(`Audience: ${g.audienceSize} · Timeline: ${g.timelineWeeks} weeks`, 40, y)
    y += 20
    autoTable(doc, {
      startY: y,
      head: [['Channel', 'Reason']],
      body: g.channels.map((c) => [c.name, c.reason]),
      headStyles: { fillColor: BRAND.primary },
      styles: { fontSize: 10 },
    })
    autoTable(doc, {
      head: [['Week', 'Milestone']],
      body: g.milestones.map((m) => [`W${m.week}`, m.goal]),
      headStyles: { fillColor: BRAND.accent },
      styles: { fontSize: 10 },
    })
  }

  doc.save(`${courseName}-${kind}.pdf`)
}

// ---------- Word export ----------
export const exportAssetWord = async (
  kind: 'idea' | 'sales' | 'email' | 'pricing' | 'growth',
  data: any,
  courseName: string
) => {
  const [
    { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle },
    { saveAs },
  ] = await Promise.all([import('docx'), import('file-saver')])

  const H = (text: string, level: any) =>
    new Paragraph({ text, heading: level, spacing: { before: 200, after: 120 } })
  const P = (text: string) => new Paragraph({ children: [new TextRun(text)], spacing: { after: 100 } })
  const B = (label: string, value: string) =>
    new Paragraph({
      children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun({ text: value || '-' })],
      spacing: { after: 80 },
    })

  const children: any[] = [
    new Paragraph({
      children: [new TextRun({ text: BRAND.appTitle, bold: true, color: '4f46e5' })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: courseName, bold: true, size: 36 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
      border: { bottom: { color: '4f46e5', space: 4, style: BorderStyle.SINGLE, size: 8 } },
    }),
  ]

  if (kind === 'idea') {
    const r = data as IdeaReport
    children.push(H('Positioning Statement', HeadingLevel.HEADING_1))
    children.push(P(r.positioningStatement || '-'))
    children.push(H('Ideas', HeadingLevel.HEADING_1))
    r.ideas.forEach((i, idx) => {
      children.push(H(`${idx + 1}. ${i.title}${i.isStrongest ? ' ★' : ''}`, HeadingLevel.HEADING_2))
      children.push(B('Demand Signal', i.demandSignal))
      children.push(B('Credibility Fit', i.credibilityFit))
      children.push(B('Gap', i.gap))
    })
  } else if (kind === 'sales') {
    const s = data as SalesPageDraft
    children.push(H('Headline', HeadingLevel.HEADING_1))
    children.push(P(s.headline))
    children.push(H('Problem', HeadingLevel.HEADING_1))
    children.push(P(s.problem))
    children.push(H('Solution', HeadingLevel.HEADING_1))
    children.push(P(s.solution))
    children.push(H('Offer Structure', HeadingLevel.HEADING_1))
    s.offerStructure.forEach((o) => children.push(P(`• ${o}`)))
    children.push(H('Objection Handling', HeadingLevel.HEADING_1))
    s.objections.forEach((o) => children.push(P(`• ${o}`)))
    children.push(H('CTA', HeadingLevel.HEADING_1))
    children.push(P(s.cta))
  } else if (kind === 'email') {
    const e = data as EmailSequence
    e.emails.forEach((em, i) => {
      children.push(H(`Email ${i + 1}: ${em.subject}`, HeadingLevel.HEADING_2))
      children.push(B('Timing', em.timing))
      children.push(B('Job', em.job))
      children.push(P(em.body))
    })
  } else if (kind === 'pricing') {
    const p = data as PricingPackages
    children.push(H('Outcome Value', HeadingLevel.HEADING_1))
    children.push(P(p.outcomeValue))
    children.push(H('Tiers', HeadingLevel.HEADING_1))
    p.tiers.forEach((t) => {
      children.push(H(`${t.name} — $${t.price}`, HeadingLevel.HEADING_2))
      children.push(B('Upgrade Reason', t.upgradeReason))
      children.push(B('Value Justification', t.valueJustification))
      t.features.forEach((f) => children.push(P(`✓ ${f}`)))
    })
  } else if (kind === 'growth') {
    const g = data as GrowthPlan
    children.push(B('Audience Size', String(g.audienceSize)))
    children.push(B('Timeline (weeks)', String(g.timelineWeeks)))
    children.push(H('Channels', HeadingLevel.HEADING_1))
    g.channels.forEach((c) => children.push(P(`• ${c.name} — ${c.reason}`)))
    children.push(H('Waitlist Strategy', HeadingLevel.HEADING_1))
    children.push(P(g.waitlistStrategy))
    children.push(H('Early Bird', HeadingLevel.HEADING_1))
    children.push(P(g.earlyBird))
    children.push(H('Weekly Milestones', HeadingLevel.HEADING_1))
    g.milestones.forEach((m) => children.push(P(`Week ${m.week}: ${m.goal}`)))
  }

  const doc = new Document({
    creator: 'Test Your Product with Engineer Abdulaziz',
    title: `${courseName} - ${kind}`,
    sections: [{ children }],
  })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${courseName}-${kind}.docx`)
}

// ---------- PPT export (generic) ----------
export const exportAssetPPT = async (
  kind: 'idea' | 'sales' | 'email' | 'pricing' | 'growth',
  data: any,
  courseName: string
) => {
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
          text: BRAND.appTitle,
          options: { x: 0.4, y: 0.05, w: 12, h: 0.25, fontSize: 10, color: 'FFFFFF' },
        },
      },
    ],
  })

  // Cover
  const cover = pptx.addSlide({ masterName: 'BRAND' })
  cover.background = { color: '4F46E5' }
  cover.addText(courseName, {
    x: 0.5,
    y: 2.5,
    w: '90%',
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })
  cover.addText(`${kind.toUpperCase()} DELIVERABLE`, {
    x: 0.5,
    y: 4.2,
    w: '90%',
    h: 0.6,
    fontSize: 16,
    color: 'E0E7FF',
    align: 'center',
  })

  if (kind === 'idea') {
    const r = data as IdeaReport
    const ps = pptx.addSlide({ masterName: 'BRAND' })
    ps.addText('Positioning Statement', { x: 0.5, y: 0.6, w: '90%', h: 0.5, fontSize: 20, bold: true, color: '4F46E5' })
    ps.addText(r.positioningStatement, { x: 0.5, y: 1.3, w: '90%', h: 3, fontSize: 16, color: '1E293B' })
    r.ideas.forEach((i, idx) => {
      const s = pptx.addSlide({ masterName: 'BRAND' })
      s.addText(`Idea ${idx + 1}${i.isStrongest ? ' ★' : ''}`, { x: 0.5, y: 0.55, w: '90%', h: 0.35, fontSize: 12, color: 'EC4899', bold: true })
      s.addText(i.title, { x: 0.5, y: 0.95, w: '90%', h: 0.7, fontSize: 26, bold: true, color: '1E293B' })
      s.addText(
        [
          { text: 'Demand Signal: ', options: { bold: true } },
          { text: i.demandSignal + '\n' },
          { text: 'Credibility: ', options: { bold: true } },
          { text: i.credibilityFit + '\n' },
          { text: 'Gap: ', options: { bold: true } },
          { text: i.gap },
        ],
        { x: 0.5, y: 2, w: '90%', h: 3, fontSize: 14, color: '475569' }
      )
    })
  } else if (kind === 'sales') {
    const s = data as SalesPageDraft
    const fields: [string, string][] = [
      ['Headline', s.headline],
      ['Problem', s.problem],
      ['Solution', s.solution],
      ['CTA', s.cta],
    ]
    fields.forEach(([label, val]) => {
      const slide = pptx.addSlide({ masterName: 'BRAND' })
      slide.addText(label, { x: 0.5, y: 0.6, w: '90%', h: 0.5, fontSize: 16, color: 'EC4899', bold: true })
      slide.addText(val || '-', { x: 0.5, y: 1.3, w: '90%', h: 4, fontSize: 20, color: '1E293B' })
    })
  } else if (kind === 'email') {
    const e = data as EmailSequence
    e.emails.forEach((em, i) => {
      const s = pptx.addSlide({ masterName: 'BRAND' })
      s.addText(`Email ${i + 1} · ${em.timing}`, { x: 0.5, y: 0.55, w: '90%', h: 0.35, fontSize: 12, color: 'EC4899', bold: true })
      s.addText(em.subject, { x: 0.5, y: 0.95, w: '90%', h: 0.6, fontSize: 22, bold: true, color: '1E293B' })
      s.addText(`Job: ${em.job}`, { x: 0.5, y: 1.6, w: '90%', h: 0.4, fontSize: 12, italic: true, color: '4F46E5' })
      s.addText(em.body, { x: 0.5, y: 2.2, w: '90%', h: 4, fontSize: 11, color: '475569' })
    })
  } else if (kind === 'pricing') {
    const p = data as PricingPackages
    p.tiers.forEach((t) => {
      const s = pptx.addSlide({ masterName: 'BRAND' })
      s.addText(t.name, { x: 0.5, y: 0.6, w: '90%', h: 0.6, fontSize: 28, bold: true, color: '4F46E5' })
      s.addText(`$${t.price}`, { x: 0.5, y: 1.3, w: '90%', h: 1, fontSize: 48, bold: true, color: 'EC4899' })
      s.addText(t.valueJustification, { x: 0.5, y: 2.8, w: '90%', h: 0.8, fontSize: 14, italic: true, color: '475569' })
      s.addText(
        t.features.map((f) => ({ text: f, options: { bullet: true } })),
        { x: 0.5, y: 3.8, w: '90%', h: 3, fontSize: 12, color: '334155' }
      )
    })
  } else if (kind === 'growth') {
    const g = data as GrowthPlan
    const overview = pptx.addSlide({ masterName: 'BRAND' })
    overview.addText('Growth Overview', { x: 0.5, y: 0.6, w: '90%', h: 0.5, fontSize: 20, bold: true, color: '4F46E5' })
    overview.addText(
      [
        { text: 'Audience Size: ', options: { bold: true } },
        { text: String(g.audienceSize) + '\n' },
        { text: 'Timeline: ', options: { bold: true } },
        { text: `${g.timelineWeeks} weeks` },
      ],
      { x: 0.5, y: 1.4, w: '90%', h: 1, fontSize: 14, color: '475569' }
    )
    const channels = pptx.addSlide({ masterName: 'BRAND' })
    channels.addText('Channels', { x: 0.5, y: 0.6, w: '90%', h: 0.5, fontSize: 20, bold: true, color: '4F46E5' })
    channels.addText(
      g.channels.map((c) => ({ text: `${c.name} — ${c.reason}`, options: { bullet: true } })),
      { x: 0.5, y: 1.3, w: '90%', h: 4, fontSize: 13, color: '334155' }
    )
    const milestones = pptx.addSlide({ masterName: 'BRAND' })
    milestones.addText('Weekly Milestones', { x: 0.5, y: 0.6, w: '90%', h: 0.5, fontSize: 20, bold: true, color: '4F46E5' })
    milestones.addText(
      g.milestones.map((m) => ({ text: `Week ${m.week}: ${m.goal}`, options: { bullet: true } })),
      { x: 0.5, y: 1.3, w: '90%', h: 4, fontSize: 13, color: '334155' }
    )
  }

  await pptx.writeFile({ fileName: `${courseName}-${kind}.pptx` })
}
