/**
 * Generic exporters for non-curriculum service outputs.
 * Arabic-safe via HTML-first rendering for PDF/HTML.
 * Word uses docx with RTL + Cairo font.
 * PPT uses pptxgenjs with rtlMode.
 */

import type {
  IdeaReport,
  SalesPageDraft,
  EmailSequence,
  PricingPackages,
  GrowthPlan,
} from '@/types'
import { buildPrintableHtml, htmlToPdf } from './htmlToPdf'

const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!))

// ---------- HTML builders per kind ----------
const buildIdeaInner = (r: IdeaReport, courseName: string): string => `
  <div class="cover">
    <div class="eyebrow">ACADEMY SUITE · تقرير اكتشاف الفكرة</div>
    <h1>${esc(courseName)}</h1>
    <div class="meta"><span>${r.ideas.length} أفكار مُتحقق منها</span><span>${new Date(r.updatedAt).toLocaleDateString('ar')}</span></div>
  </div>

  <div class="section">
    <h2>💎 بيان الموضعة (Positioning)</h2>
    <div class="box" style="font-size:15px;">${esc(r.positioningStatement)}</div>
  </div>

  <div class="section">
    <h2>🧠 الأفكار المقترحة</h2>
    ${r.ideas.map((i, idx) => `
      <div class="module">
        <div><span class="module-num">${idx + 1}</span><span class="module-title">${esc(i.title)}${i.isStrongest ? ' <span class="tag" style="background:#fef3c7; color:#92400e;">👑 الأقوى</span>' : ''}</span></div>
        <h3>إشارة الطلب</h3><p>${esc(i.demandSignal)}</p>
        <h3>ملاءمة المصداقية</h3><p>${esc(i.credibilityFit)}</p>
        <h3>فجوة السوق</h3><p>${esc(i.gap)}</p>
      </div>
    `).join('')}
  </div>
`

const buildSalesInner = (s: SalesPageDraft, courseName: string): string => `
  <div class="cover">
    <div class="eyebrow">ACADEMY SUITE · مخطط صفحة المبيعات</div>
    <h1>${esc(courseName)}</h1>
  </div>

  <div class="section">
    <h2>🎯 العنوان الرئيسي (Headline)</h2>
    <div class="box" style="font-size:20px; font-weight:700; text-align:center; color:#1e293b;">${esc(s.headline)}</div>
  </div>

  <div class="section">
    <h2>❓ إطار المشكلة</h2>
    <p>${esc(s.problem)}</p>
  </div>

  <div class="section">
    <h2>💡 عرض الحل</h2>
    <p>${esc(s.solution)}</p>
  </div>

  <div class="section">
    <h2>📦 هيكل العرض</h2>
    <ul>${s.offerStructure.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
  </div>

  <div class="section">
    <h2>🛡️ معالجة الاعتراضات</h2>
    ${s.objections.map((o) => `<div class="box">${esc(o)}</div>`).join('')}
  </div>

  <div class="section">
    <h2>🚀 الدعوة للعمل (CTA)</h2>
    <div class="box" style="background:linear-gradient(135deg,#4f46e5,#ec4899); color:#fff; text-align:center; font-size:18px; font-weight:700; padding:28px;">
      ${esc(s.cta)}
    </div>
  </div>
`

const buildEmailInner = (e: EmailSequence, courseName: string): string => `
  <div class="cover">
    <div class="eyebrow">ACADEMY SUITE · تسلسل الإطلاق البريدي</div>
    <h1>${esc(courseName)}</h1>
    <div class="meta"><span>${e.emails.length} رسائل</span></div>
  </div>

  <div class="section">
    <h2>📧 السلسلة الكاملة</h2>
    <table>
      <thead><tr><th>#</th><th>التوقيت</th><th>العنوان</th><th>المهمة</th></tr></thead>
      <tbody>${e.emails.map((em, i) => `<tr><td>${i + 1}</td><td>${esc(em.timing)}</td><td><strong>${esc(em.subject)}</strong></td><td>${esc(em.job)}</td></tr>`).join('')}</tbody>
    </table>
  </div>

  ${e.emails.map((em, i) => `
    <div class="module">
      <div><span class="module-num">${i + 1}</span><span class="module-title">${esc(em.subject)}</span></div>
      <div class="tag">${esc(em.timing)}</div>
      <div class="tag">${esc(em.job)}</div>
      <h3>محتوى الرسالة</h3>
      <div style="background:#f9fafb; padding:18px; border-radius:8px; white-space:pre-wrap; font-size:14px; line-height:1.8;">${esc(em.body)}</div>
    </div>
  `).join('')}
`

const buildPricingInner = (p: PricingPackages, courseName: string): string => `
  <div class="cover">
    <div class="eyebrow">ACADEMY SUITE · حزم التسعير</div>
    <h1>${esc(courseName)}</h1>
    <div class="meta"><span>${p.tiers.length} باقات</span></div>
  </div>

  <div class="section">
    <h2>💰 قيمة النتيجة</h2>
    <div class="box">${esc(p.outcomeValue)}</div>
  </div>

  <div class="section">
    <h2>📊 مقارنة الباقات</h2>
    <table>
      <thead><tr><th>الباقة</th><th>السعر</th><th>سبب الترقية</th><th>المميزات</th></tr></thead>
      <tbody>
        ${p.tiers.map((t, i) => `<tr>
          <td><strong style="font-size:16px; color:${i === 1 ? '#ec4899' : '#4f46e5'};">${esc(t.name)}${i === 1 ? ' ⭐' : ''}</strong></td>
          <td style="font-size:20px; font-weight:800;">$${t.price}</td>
          <td>${esc(t.upgradeReason)}</td>
          <td>${t.features.map((f) => `✓ ${esc(f)}`).join('<br>')}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  ${p.tiers.map((t, i) => `
    <div class="module">
      <div><span class="module-num">${i + 1}</span><span class="module-title">${esc(t.name)} — $${t.price}</span></div>
      <h3>مبرر القيمة</h3><p>${esc(t.valueJustification)}</p>
      <h3>المميزات المتضمنة</h3><ul>${t.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
    </div>
  `).join('')}
`

const buildGrowthInner = (g: GrowthPlan, courseName: string): string => `
  <div class="cover">
    <div class="eyebrow">ACADEMY SUITE · خطة أول 100 طالب</div>
    <h1>${esc(courseName)}</h1>
    <div class="meta"><span>${g.timelineWeeks} أسبوع</span><span>${g.audienceSize} في الجمهور الحالي</span></div>
  </div>

  <div class="section">
    <h2>📊 نظرة عامة</h2>
    <dl class="kv-grid">
      <dt>حجم الجمهور الحالي</dt><dd>${g.audienceSize}</dd>
      <dt>الإطار الزمني</dt><dd>${g.timelineWeeks} أسبوع</dd>
      <dt>الهدف</dt><dd>100 طالب مسجّل</dd>
    </dl>
  </div>

  <div class="section">
    <h2>📡 قنوات النمو</h2>
    <table>
      <thead><tr><th>القناة</th><th>السبب</th></tr></thead>
      <tbody>${g.channels.map((c) => `<tr><td><strong>${esc(c.name)}</strong></td><td>${esc(c.reason)}</td></tr>`).join('')}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>⏳ استراتيجية قائمة الانتظار</h2>
    <div class="box">${esc(g.waitlistStrategy)}</div>
    <h2 style="margin-top:18px;">🎟 عرض التبكير</h2>
    <div class="highlight-box" style="background:#fef3c7;">${esc(g.earlyBird)}</div>
  </div>

  <div class="section">
    <h2>🗓️ المحطات الأسبوعية</h2>
    <table>
      <thead><tr><th>الأسبوع</th><th>الهدف</th></tr></thead>
      <tbody>${g.milestones.map((m) => `<tr><td><strong>W${m.week}</strong></td><td>${esc(m.goal)}</td></tr>`).join('')}</tbody>
    </table>
  </div>
`

type AssetKind = 'idea' | 'sales' | 'email' | 'pricing' | 'growth'

const buildInner = (kind: AssetKind, data: any, courseName: string): string => {
  switch (kind) {
    case 'idea': return buildIdeaInner(data, courseName)
    case 'sales': return buildSalesInner(data, courseName)
    case 'email': return buildEmailInner(data, courseName)
    case 'pricing': return buildPricingInner(data, courseName)
    case 'growth': return buildGrowthInner(data, courseName)
  }
}

// ---------- HTML export ----------
export const exportAssetHTML = async (kind: AssetKind, data: any, courseName: string) => {
  const { saveAs } = await import('file-saver')
  const html = buildPrintableHtml(`${courseName} — ${kind}`, buildInner(kind, data, courseName), true)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, `${courseName}-${kind}.html`)
}

// ---------- PDF export (Arabic-safe via HTML render) ----------
export const exportAssetPDF = async (kind: AssetKind, data: any, courseName: string) => {
  const html = buildPrintableHtml(`${courseName} — ${kind}`, buildInner(kind, data, courseName), true)
  await htmlToPdf(html, { filename: `${courseName}-${kind}.pdf` })
}

// ---------- Word export (Arabic + RTL) ----------
export const exportAssetWord = async (kind: AssetKind, data: any, courseName: string) => {
  const [
    { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle },
    { saveAs },
  ] = await Promise.all([import('docx'), import('file-saver')])

  const arRun = (text: string, opts: any = {}) =>
    new TextRun({ text, font: { name: 'Cairo', hint: 'cs' }, rightToLeft: true, ...opts })
  const p = (text: string, opts: any = {}) =>
    new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT, children: [arRun(text, opts)], spacing: { after: 100, line: 340 } })
  const h = (text: string, level: any) =>
    new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT, heading: level, children: [arRun(text, { bold: true })], spacing: { before: 240, after: 120 } })
  const kv = (label: string, value: string) =>
    new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT, children: [arRun(`${label}: `, { bold: true, color: '6b7280' }), arRun(value || '-')], spacing: { after: 80 } })

  const children: any[] = [
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [arRun('اختبر منتجك أو فكرتك بالبداية مع المهندس عبدالعزيز', { bold: true, color: '4f46e5' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [arRun(courseName, { bold: true, size: 44 })], border: { bottom: { color: '4f46e5', space: 4, style: BorderStyle.SINGLE, size: 12 } }, spacing: { after: 400 } }),
  ]

  if (kind === 'idea') {
    const r = data as IdeaReport
    children.push(h('بيان الموضعة', HeadingLevel.HEADING_1))
    children.push(p(r.positioningStatement))
    children.push(h('الأفكار', HeadingLevel.HEADING_1))
    r.ideas.forEach((i, idx) => {
      children.push(h(`${idx + 1}. ${i.title}${i.isStrongest ? ' ★' : ''}`, HeadingLevel.HEADING_2))
      children.push(kv('إشارة الطلب', i.demandSignal))
      children.push(kv('ملاءمة المصداقية', i.credibilityFit))
      children.push(kv('فجوة السوق', i.gap))
    })
  } else if (kind === 'sales') {
    const s = data as SalesPageDraft
    children.push(h('العنوان الرئيسي', HeadingLevel.HEADING_1))
    children.push(p(s.headline))
    children.push(h('إطار المشكلة', HeadingLevel.HEADING_1))
    children.push(p(s.problem))
    children.push(h('عرض الحل', HeadingLevel.HEADING_1))
    children.push(p(s.solution))
    children.push(h('هيكل العرض', HeadingLevel.HEADING_1))
    s.offerStructure.forEach((o) => children.push(p(`• ${o}`)))
    children.push(h('الاعتراضات', HeadingLevel.HEADING_1))
    s.objections.forEach((o) => children.push(p(`• ${o}`)))
    children.push(h('الدعوة للعمل', HeadingLevel.HEADING_1))
    children.push(p(s.cta))
  } else if (kind === 'email') {
    const e = data as EmailSequence
    e.emails.forEach((em, i) => {
      children.push(h(`رسالة ${i + 1}: ${em.subject}`, HeadingLevel.HEADING_2))
      children.push(kv('التوقيت', em.timing))
      children.push(kv('المهمة', em.job))
      em.body.split('\n').forEach((line) => {
        if (line.trim()) children.push(p(line))
      })
    })
  } else if (kind === 'pricing') {
    const pk = data as PricingPackages
    children.push(h('قيمة النتيجة', HeadingLevel.HEADING_1))
    children.push(p(pk.outcomeValue))
    children.push(h('الباقات', HeadingLevel.HEADING_1))
    pk.tiers.forEach((t) => {
      children.push(h(`${t.name} — $${t.price}`, HeadingLevel.HEADING_2))
      children.push(kv('سبب الترقية', t.upgradeReason))
      children.push(kv('مبرر القيمة', t.valueJustification))
      t.features.forEach((f) => children.push(p(`✓ ${f}`)))
    })
  } else if (kind === 'growth') {
    const g = data as GrowthPlan
    children.push(kv('حجم الجمهور', String(g.audienceSize)))
    children.push(kv('الإطار الزمني (أسبوع)', String(g.timelineWeeks)))
    children.push(h('القنوات', HeadingLevel.HEADING_1))
    g.channels.forEach((c) => children.push(p(`• ${c.name} — ${c.reason}`)))
    children.push(h('قائمة الانتظار', HeadingLevel.HEADING_1))
    children.push(p(g.waitlistStrategy))
    children.push(h('عرض التبكير', HeadingLevel.HEADING_1))
    children.push(p(g.earlyBird))
    children.push(h('المحطات الأسبوعية', HeadingLevel.HEADING_1))
    g.milestones.forEach((m) => children.push(p(`أسبوع ${m.week}: ${m.goal}`)))
  }

  const doc = new Document({
    creator: 'Test Your Product with Engineer Abdulaziz',
    title: `${courseName} - ${kind}`,
    styles: { default: { document: { run: { font: { name: 'Cairo' } } } } },
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${courseName}-${kind}.docx`)
}

// ---------- PPT export (Arabic + RTL) ----------
export const exportAssetPPT = async (kind: AssetKind, data: any, courseName: string) => {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.rtlMode = true
  pptx.defineSlideMaster({
    title: 'BRAND',
    background: { color: 'FFFFFF' },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.4, fill: { color: '4F46E5' } } },
      {
        text: {
          text: 'اختبر منتجك أو فكرتك بالبداية مع المهندس عبدالعزيز',
          options: { x: 0.4, y: 0.05, w: 12, h: 0.3, fontSize: 10, color: 'FFFFFF', fontFace: 'Cairo', align: 'right', rtlMode: true },
        },
      },
    ],
  })

  const tp = { fontFace: 'Cairo', align: 'right' as const, rtlMode: true }

  const cover = pptx.addSlide({ masterName: 'BRAND' })
  cover.background = { color: '4F46E5' }
  cover.addText(courseName, { x: 0.5, y: 2.5, w: '90%', h: 1.5, fontSize: 48, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Cairo', rtlMode: true })
  cover.addText(`${kind.toUpperCase()}`, { x: 0.5, y: 4.5, w: '90%', h: 0.5, fontSize: 16, color: 'E0E7FF', align: 'center', fontFace: 'Cairo', rtlMode: true })

  if (kind === 'idea') {
    const r = data as IdeaReport
    const psSlide = pptx.addSlide({ masterName: 'BRAND' })
    psSlide.addText('بيان الموضعة', { x: 0.5, y: 0.7, w: '90%', h: 0.6, fontSize: 24, bold: true, color: '4F46E5', ...tp })
    psSlide.addText(r.positioningStatement, { x: 0.5, y: 1.6, w: '90%', h: 3, fontSize: 15, color: '1E293B', ...tp })
    r.ideas.forEach((i, idx) => {
      const s = pptx.addSlide({ masterName: 'BRAND' })
      s.addText(`الفكرة ${idx + 1}${i.isStrongest ? ' ★' : ''}`, { x: 0.5, y: 0.55, w: '90%', h: 0.35, fontSize: 12, color: 'EC4899', bold: true, ...tp })
      s.addText(i.title, { x: 0.5, y: 0.95, w: '90%', h: 0.8, fontSize: 26, bold: true, color: '1E293B', ...tp })
      s.addText(
        [
          { text: 'إشارة الطلب: ', options: { bold: true } }, { text: i.demandSignal + '\n' },
          { text: 'المصداقية: ', options: { bold: true } }, { text: i.credibilityFit + '\n' },
          { text: 'فجوة السوق: ', options: { bold: true } }, { text: i.gap },
        ],
        { x: 0.5, y: 2.2, w: '90%', h: 4, fontSize: 13, color: '475569', ...tp }
      )
    })
  } else if (kind === 'sales') {
    const s = data as SalesPageDraft
    const fields: [string, string][] = [
      ['العنوان الرئيسي', s.headline],
      ['المشكلة', s.problem],
      ['الحل', s.solution],
      ['الدعوة للعمل', s.cta],
    ]
    fields.forEach(([label, val]) => {
      const sl = pptx.addSlide({ masterName: 'BRAND' })
      sl.addText(label, { x: 0.5, y: 0.7, w: '90%', h: 0.6, fontSize: 20, color: 'EC4899', bold: true, ...tp })
      sl.addText(val || '-', { x: 0.5, y: 1.5, w: '90%', h: 5, fontSize: 18, color: '1E293B', ...tp })
    })
  } else if (kind === 'email') {
    const e = data as EmailSequence
    e.emails.forEach((em, i) => {
      const sl = pptx.addSlide({ masterName: 'BRAND' })
      sl.addText(`رسالة ${i + 1} · ${em.timing}`, { x: 0.5, y: 0.55, w: '90%', h: 0.35, fontSize: 12, color: 'EC4899', bold: true, ...tp })
      sl.addText(em.subject, { x: 0.5, y: 0.95, w: '90%', h: 0.8, fontSize: 22, bold: true, color: '1E293B', ...tp })
      sl.addText(`المهمة: ${em.job}`, { x: 0.5, y: 1.8, w: '90%', h: 0.5, fontSize: 13, italic: true, color: '4F46E5', ...tp })
      sl.addText(em.body, { x: 0.5, y: 2.4, w: '90%', h: 4.5, fontSize: 12, color: '475569', ...tp })
    })
  } else if (kind === 'pricing') {
    const p = data as PricingPackages
    p.tiers.forEach((t) => {
      const sl = pptx.addSlide({ masterName: 'BRAND' })
      sl.addText(t.name, { x: 0.5, y: 0.7, w: '90%', h: 0.7, fontSize: 30, bold: true, color: '4F46E5', ...tp })
      sl.addText(`$${t.price}`, { x: 0.5, y: 1.6, w: '90%', h: 1.2, fontSize: 56, bold: true, color: 'EC4899', ...tp })
      sl.addText(t.valueJustification, { x: 0.5, y: 3, w: '90%', h: 0.8, fontSize: 14, italic: true, color: '475569', ...tp })
      sl.addText(t.features.map((f) => ({ text: f, options: { bullet: true } })), { x: 0.5, y: 4, w: '90%', h: 3, fontSize: 13, color: '334155', ...tp })
    })
  } else if (kind === 'growth') {
    const g = data as GrowthPlan
    const o = pptx.addSlide({ masterName: 'BRAND' })
    o.addText('نظرة عامة', { x: 0.5, y: 0.7, w: '90%', h: 0.6, fontSize: 24, bold: true, color: '4F46E5', ...tp })
    o.addText(`${g.audienceSize} في الجمهور · ${g.timelineWeeks} أسبوع`, { x: 0.5, y: 1.5, w: '90%', h: 0.8, fontSize: 18, color: '1E293B', ...tp })
    const ch = pptx.addSlide({ masterName: 'BRAND' })
    ch.addText('القنوات', { x: 0.5, y: 0.7, w: '90%', h: 0.6, fontSize: 24, bold: true, color: '4F46E5', ...tp })
    ch.addText(g.channels.map((c) => ({ text: `${c.name} — ${c.reason}`, options: { bullet: true } })), { x: 0.5, y: 1.5, w: '90%', h: 5, fontSize: 14, color: '334155', ...tp })
    const ms = pptx.addSlide({ masterName: 'BRAND' })
    ms.addText('المحطات الأسبوعية', { x: 0.5, y: 0.7, w: '90%', h: 0.6, fontSize: 24, bold: true, color: '4F46E5', ...tp })
    ms.addText(g.milestones.map((m) => ({ text: `W${m.week}: ${m.goal}`, options: { bullet: true } })), { x: 0.5, y: 1.5, w: '90%', h: 5, fontSize: 14, color: '334155', ...tp })
  }

  await pptx.writeFile({ fileName: `${courseName}-${kind}.pptx` })
}
