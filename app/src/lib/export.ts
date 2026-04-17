// Dynamic-imported exporters with full Arabic support via HTML-first rendering.
import type {
  CurriculumBlueprint,
  IdeaReport,
  SalesPageDraft,
  EmailSequence,
  PricingPackages,
  GrowthPlan,
} from '@/types'
import { buildCurriculumHtml } from './curriculumHtml'
import { htmlToPdf } from './htmlToPdf'

// ---------- PDF (Arabic-safe, via HTML render) ----------
export const exportCurriculumPDF = async (c: CurriculumBlueprint) => {
  const html = buildCurriculumHtml(c)
  await htmlToPdf(html, { filename: `${c.title || 'curriculum'}.pdf` })
}

// ---------- HTML (Arabic-ready, branded) ----------
export const exportCurriculumHTML = async (c: CurriculumBlueprint) => {
  const { saveAs } = await import('file-saver')
  const html = buildCurriculumHtml(c)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, `${c.title || 'curriculum'}.html`)
}

// ---------- Word (docx supports Arabic natively) ----------
export const exportCurriculumWord = async (c: CurriculumBlueprint) => {
  const [
    { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType },
    { saveAs },
  ] = await Promise.all([import('docx'), import('file-saver')])

  // Helpers. All text runs default to RTL + Arabic font stack.
  const arRun = (text: string, opts: any = {}) =>
    new TextRun({
      text,
      font: { name: 'Cairo', hint: 'cs' },
      rightToLeft: true,
      ...opts,
    })
  const p = (text: string, opts: any = {}) =>
    new Paragraph({
      bidirectional: true,
      alignment: AlignmentType.RIGHT,
      children: [arRun(text, opts)],
      spacing: { after: 100, line: 360 },
      ...opts.paragraph,
    })
  const h = (text: string, level: any) =>
    new Paragraph({
      bidirectional: true,
      alignment: AlignmentType.RIGHT,
      heading: level,
      children: [arRun(text, { bold: true, size: level === HeadingLevel.HEADING_1 ? 32 : 26 })],
      spacing: { before: 240, after: 120 },
    })
  const kv = (label: string, value: string) =>
    new Paragraph({
      bidirectional: true,
      alignment: AlignmentType.RIGHT,
      children: [arRun(`${label}: `, { bold: true, color: '6b7280' }), arRun(value || '-')],
      spacing: { after: 80 },
    })

  const children: any[] = []

  // Cover
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [arRun('اختبر منتجك أو فكرتك بالبداية مع المهندس عبدالعزيز', { bold: true, color: '4f46e5', size: 22 })],
      spacing: { after: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      children: [arRun(c.title || 'منهج تدريبي', { bold: true, size: 48 })],
      border: { bottom: { color: '4f46e5', space: 4, style: BorderStyle.SINGLE, size: 12 } },
      spacing: { after: 400 },
    })
  )

  children.push(
    kv('الحالة', c.status),
    kv('مؤشر الكفاءة', `${c.leanScore}/100`),
    kv('آخر تحديث', new Date(c.updatedAt).toLocaleString('ar'))
  )

  children.push(h('خريطة التحوّل', HeadingLevel.HEADING_1))
  children.push(p(c.transformationMap || '-'))
  children.push(
    kv('نقطة البداية', c.startingPoint || '-'),
    kv('الوجهة', c.destination || '-'),
    kv('الجمهور المستهدف', c.audience || '-'),
    kv('المدة', c.duration || '-')
  )

  // Modules
  children.push(h('وحدات المنهج التفصيلية', HeadingLevel.HEADING_1))
  c.modules.forEach((m, i) => {
    children.push(h(`الوحدة ${i + 1}: ${m.title || 'بلا عنوان'}`, HeadingLevel.HEADING_2))
    if (m.durationMins) children.push(kv('المدة', `${m.durationMins} دقيقة`))
    if (m.transformation) children.push(kv('التحوّل', m.transformation))
    if (m.summary) children.push(p(m.summary))

    if (m.keyConcepts?.length) {
      children.push(h('المفاهيم الجوهرية', HeadingLevel.HEADING_3))
      m.keyConcepts.forEach((c) => children.push(p(`• ${c}`)))
    }

    if (m.content) {
      children.push(h('محتوى الوحدة', HeadingLevel.HEADING_3))
      m.content.split('\n').forEach((line) => {
        if (line.trim()) children.push(p(line))
      })
    }

    if (m.lessonSections?.length) {
      m.lessonSections.forEach((sec, idx) => {
        children.push(h(`الدرس ${idx + 1}: ${sec.heading}`, HeadingLevel.HEADING_3))
        sec.body.split('\n').forEach((line) => {
          if (line.trim()) children.push(p(line))
        })
      })
    }

    if (m.objectives?.length) {
      children.push(h('أهداف التعلم', HeadingLevel.HEADING_3))
      m.objectives.forEach((o, j) => children.push(p(`${j + 1}. ${o.text}`)))
    }

    if (m.exercises?.length) {
      children.push(h('التمارين التطبيقية', HeadingLevel.HEADING_3))
      m.exercises.forEach((ex, j) => {
        children.push(
          new Paragraph({
            bidirectional: true,
            alignment: AlignmentType.RIGHT,
            children: [arRun(`تمرين ${j + 1}: ${ex.title}`, { bold: true, size: 26 })],
            spacing: { before: 120, after: 80 },
          })
        )
        if (ex.estimatedMins) children.push(kv('الوقت المقدر', `${ex.estimatedMins} دقيقة`))
        ex.instructions.split('\n').forEach((line) => {
          if (line.trim()) children.push(p(line))
        })
        if (ex.successCriteria?.length) {
          children.push(p('معايير النجاح:', { bold: true }))
          ex.successCriteria.forEach((c) => children.push(p(`✓ ${c}`)))
        }
      })
    }

    if (m.examples?.length) {
      children.push(h('أمثلة واقعية', HeadingLevel.HEADING_3))
      m.examples.forEach((e) => children.push(p(e)))
    }

    if (m.commonMistakes?.length) {
      children.push(h('أخطاء شائعة', HeadingLevel.HEADING_3))
      m.commonMistakes.forEach((c) => children.push(p(`⚠ ${c}`)))
    }

    if (m.resources?.length) {
      children.push(h('المصادر', HeadingLevel.HEADING_3))
      m.resources.forEach((r) => children.push(p(`[${r.type}] ${r.title}${r.note ? ' — ' + r.note : ''}`)))
    }

    if (m.assessment?.length) {
      children.push(h('معايير التقييم', HeadingLevel.HEADING_3))
      m.assessment.forEach((a) => children.push(p(`${a.criterion} (${a.weight}%) — ${a.description}`)))
    }

    if (m.instructorNotes) {
      children.push(h('ملاحظات للمدرّب', HeadingLevel.HEADING_3))
      children.push(p(m.instructorNotes))
    }
  })

  const doc = new Document({
    creator: 'Test Your Product with Engineer Abdulaziz',
    title: c.title || 'Curriculum Blueprint',
    styles: {
      default: {
        document: { run: { font: { name: 'Cairo' } } },
      },
    },
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${c.title || 'curriculum'}.docx`)
}

// ---------- PowerPoint (Cairo font + RTL alignment) ----------
export const exportCurriculumPPT = async (c: CurriculumBlueprint) => {
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
          options: {
            x: 0.4, y: 0.05, w: 12, h: 0.3,
            fontSize: 10, color: 'FFFFFF',
            fontFace: 'Cairo', align: 'right',
            rtlMode: true,
          },
        },
      },
    ],
  })

  const textProps = { fontFace: 'Cairo', align: 'right' as const, rtlMode: true }

  // Cover
  const cover = pptx.addSlide({ masterName: 'BRAND' })
  cover.background = { color: '4F46E5' }
  cover.addText(c.title || 'منهج تدريبي', {
    x: 0.5, y: 2, w: '90%', h: 1.8,
    fontSize: 48, bold: true, color: 'FFFFFF',
    align: 'center', fontFace: 'Cairo', rtlMode: true,
  })
  cover.addText(
    [
      { text: `${c.modules.length} وحدات تدريبية`, options: { bullet: { type: 'number' } } },
      { text: `${c.modules.reduce((s, m) => s + m.objectives.length, 0)} هدف تعلم`, options: { bullet: { type: 'number' } } },
      { text: `مؤشر كفاءة: ${c.leanScore}/100`, options: { bullet: { type: 'number' } } },
    ],
    { x: 1, y: 4.2, w: '80%', h: 2.5, fontSize: 20, color: 'E0E7FF', align: 'center', fontFace: 'Cairo', rtlMode: true }
  )

  // Transformation map
  const tmSlide = pptx.addSlide({ masterName: 'BRAND' })
  tmSlide.addText('خريطة التحوّل', { x: 0.5, y: 0.7, w: '90%', h: 0.6, fontSize: 28, bold: true, color: '4F46E5', ...textProps })
  tmSlide.addText(c.transformationMap || '—', { x: 0.5, y: 1.5, w: '90%', h: 2.5, fontSize: 16, color: '1E293B', ...textProps })
  tmSlide.addText(
    [
      { text: `نقطة البداية: `, options: { bold: true } },
      { text: (c.startingPoint || '-') + '\n' },
      { text: `الوجهة: `, options: { bold: true } },
      { text: (c.destination || '-') + '\n' },
      { text: `الجمهور: `, options: { bold: true } },
      { text: c.audience || '-' },
    ],
    { x: 0.5, y: 4.3, w: '90%', h: 2, fontSize: 14, color: '475569', ...textProps }
  )

  // One slide per module
  c.modules.forEach((m, i) => {
    const s = pptx.addSlide({ masterName: 'BRAND' })
    s.addText(`الوحدة ${i + 1}`, { x: 0.5, y: 0.55, w: '90%', h: 0.35, fontSize: 12, color: 'EC4899', bold: true, ...textProps })
    s.addText(m.title || '—', { x: 0.5, y: 0.95, w: '90%', h: 0.7, fontSize: 30, bold: true, color: '1E293B', ...textProps })
    if (m.transformation) {
      s.addText(`🎯 ${m.transformation}`, { x: 0.5, y: 1.8, w: '90%', h: 0.6, fontSize: 14, italic: true, color: 'EC4899', ...textProps })
    }
    if (m.summary) {
      s.addText(m.summary, { x: 0.5, y: 2.5, w: '90%', h: 1.2, fontSize: 13, color: '475569', ...textProps })
    }
    if (m.objectives.length) {
      s.addText('أهداف التعلم', { x: 0.5, y: 3.9, w: '90%', h: 0.4, fontSize: 14, bold: true, color: '4F46E5', ...textProps })
      s.addText(
        m.objectives.map((o) => ({ text: o.text, options: { bullet: true } })),
        { x: 0.5, y: 4.4, w: '90%', h: 2, fontSize: 12, color: '334155', ...textProps }
      )
    }
    s.addNotes(
      [
        `${m.title}`,
        m.transformation ? `التحوّل: ${m.transformation}` : '',
        m.summary ? `الملخص: ${m.summary}` : '',
        m.content ? `المحتوى: ${m.content.slice(0, 500)}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
    )
  })

  // Content deep-dive per module (if rich content exists)
  c.modules.forEach((m, i) => {
    if (m.lessonSections?.length) {
      m.lessonSections.forEach((sec, j) => {
        const slide = pptx.addSlide({ masterName: 'BRAND' })
        slide.addText(`الوحدة ${i + 1} · الدرس ${j + 1}`, { x: 0.5, y: 0.55, w: '90%', h: 0.35, fontSize: 11, color: 'EC4899', bold: true, ...textProps })
        slide.addText(sec.heading, { x: 0.5, y: 0.95, w: '90%', h: 0.6, fontSize: 24, bold: true, color: '1E293B', ...textProps })
        // Strip markdown for PPT
        const bodyText = sec.body.replace(/\*\*/g, '').replace(/##\s*/g, '').replace(/```[\s\S]*?```/g, '').trim()
        slide.addText(bodyText, { x: 0.5, y: 1.7, w: '90%', h: 5, fontSize: 12, color: '334155', ...textProps })
      })
    }
  })

  // Closing slide
  const end = pptx.addSlide({ masterName: 'BRAND' })
  end.background = { color: '4F46E5' }
  end.addText('شكراً لكم', { x: 0.5, y: 3, w: '90%', h: 1.5, fontSize: 60, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Cairo', rtlMode: true })
  end.addText('اختبر منتجك أو فكرتك بالبداية مع المهندس عبدالعزيز', { x: 0.5, y: 4.8, w: '90%', h: 0.6, fontSize: 18, color: 'E0E7FF', align: 'center', fontFace: 'Cairo', rtlMode: true })

  await pptx.writeFile({ fileName: `${c.title || 'curriculum'}.pptx` })
}

// ---------- Course Bundle (all deliverables) ----------
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
  // Build one master HTML with all sections and use htmlToPdf
  const parts: string[] = []

  parts.push(`
    <div class="cover">
      <div class="eyebrow">ACADEMY CURRICULUM SUITE · الحزمة الكاملة للمنتج</div>
      <h1>${bundle.courseName}</h1>
      <div class="meta">
        <span>حزمة متكاملة</span>
        <span>${new Date().toLocaleDateString('ar')}</span>
      </div>
    </div>
  `)

  if (bundle.idea) {
    parts.push(`
      <div class="section">
        <h2>🌱 المرحلة 1: اكتشاف الفكرة</h2>
        <div class="box"><strong>بيان الموضعة:</strong> ${bundle.idea.positioningStatement}</div>
        ${bundle.idea.ideas.map((i, idx) => `
          <div class="module" style="margin:12px 0;">
            <div><span class="module-num">${idx + 1}</span><span class="module-title">${i.title}${i.isStrongest ? ' 👑' : ''}</span></div>
            <p><strong>إشارة الطلب:</strong> ${i.demandSignal}</p>
            <p><strong>فجوة السوق:</strong> ${i.gap}</p>
          </div>
        `).join('')}
      </div>
    `)
  }

  if (bundle.curriculum) {
    const c = bundle.curriculum
    parts.push(`
      <div class="section">
        <h2>📚 المرحلة 2: المنهج التدريبي — ${c.modules.length} وحدات</h2>
        <div class="box">${c.transformationMap}</div>
        ${c.modules.map((m, i) => `
          <div class="module">
            <div><span class="module-num">${i + 1}</span><span class="module-title">${m.title}</span></div>
            ${m.transformation ? `<div class="transformation-pill">🎯 ${m.transformation}</div>` : ''}
            <p>${m.summary || ''}</p>
            ${m.objectives.map((o) => `<li>${o.text}</li>`).join('')}
          </div>
        `).join('')}
      </div>
    `)
  }

  if (bundle.sales) {
    parts.push(`
      <div class="section">
        <h2>📣 المرحلة 3: صفحة المبيعات</h2>
        <h3>العنوان الرئيسي</h3><p>${bundle.sales.headline}</p>
        <h3>المشكلة</h3><p>${bundle.sales.problem}</p>
        <h3>الحل</h3><p>${bundle.sales.solution}</p>
        <h3>هيكل العرض</h3><ul>${bundle.sales.offerStructure.map((o) => `<li>${o}</li>`).join('')}</ul>
        <div class="box"><strong>الدعوة للعمل:</strong> ${bundle.sales.cta}</div>
      </div>
    `)
  }

  if (bundle.email) {
    parts.push(`
      <div class="section">
        <h2>✉️ المرحلة 4: تسلسل الإطلاق البريدي</h2>
        <table>
          <thead><tr><th>#</th><th>التوقيت</th><th>العنوان</th><th>المهمة</th></tr></thead>
          <tbody>
            ${bundle.email.emails.map((e, i) => `<tr><td>${i + 1}</td><td>${e.timing}</td><td><strong>${e.subject}</strong></td><td>${e.job}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `)
  }

  if (bundle.pricing) {
    parts.push(`
      <div class="section">
        <h2>💰 المرحلة 5: التسعير والحزم</h2>
        <div class="box"><strong>قيمة النتيجة:</strong> ${bundle.pricing.outcomeValue}</div>
        <table>
          <thead><tr><th>الباقة</th><th>السعر</th><th>سبب الترقية</th><th>المميزات</th></tr></thead>
          <tbody>
            ${bundle.pricing.tiers.map((t) => `<tr><td><strong>${t.name}</strong></td><td>$${t.price}</td><td>${t.upgradeReason}</td><td>${t.features.map((f) => `• ${f}`).join('<br>')}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `)
  }

  if (bundle.growth) {
    parts.push(`
      <div class="section">
        <h2>🚀 المرحلة 6: خطة أول 100 طالب</h2>
        <p><strong>الجمهور الحالي:</strong> ${bundle.growth.audienceSize} · <strong>الإطار الزمني:</strong> ${bundle.growth.timelineWeeks} أسبوع</p>
        <h3>القنوات</h3>
        <ul>${bundle.growth.channels.map((c) => `<li><strong>${c.name}</strong> — ${c.reason}</li>`).join('')}</ul>
        <h3>المحطات الأسبوعية</h3>
        <table>
          <thead><tr><th>الأسبوع</th><th>الهدف</th></tr></thead>
          <tbody>${bundle.growth.milestones.map((m) => `<tr><td>W${m.week}</td><td>${m.goal}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    `)
  }

  const { buildPrintableHtml } = await import('./htmlToPdf')
  const html = buildPrintableHtml(`${bundle.courseName} — الحزمة الكاملة`, parts.join('\n'), true)

  await htmlToPdf(html, { filename: `${bundle.courseName}-bundle.pdf` })
}

// ---------- Generic JSON export ----------
export const exportJSON = async (name: string, data: any) => {
  const { saveAs } = await import('file-saver')
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  saveAs(blob, `${name}.json`)
}
