/**
 * Build a rich HTML document for a CurriculumBlueprint — Arabic-ready,
 * print-optimized. Used as the source for both HTML export and PDF export
 * (via html2canvas → jsPDF in lib/htmlToPdf.ts).
 */

import type { CurriculumBlueprint, Module } from '@/types'
import { buildPrintableHtml } from './htmlToPdf'

const esc = (s: any): string =>
  String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!))

const formatMarkdownInline = (s: string): string => {
  if (!s) return ''
  let out = esc(s)
  // bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // italic *text*
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  // inline code `text`
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  // line breaks
  out = out.replace(/\n/g, '<br>')
  return out
}

const formatMarkdown = (md: string): string => {
  if (!md) return ''
  // Split by double newline → paragraphs
  const blocks = md.trim().split(/\n{2,}/)
  return blocks
    .map((block) => {
      const trimmed = block.trim()
      // Heading
      if (trimmed.startsWith('### ')) return `<h3>${formatMarkdownInline(trimmed.slice(4))}</h3>`
      if (trimmed.startsWith('## ')) return `<h2 style="border:none; padding:0; font-size:18px;">${formatMarkdownInline(trimmed.slice(3))}</h2>`
      if (trimmed.startsWith('# ')) return `<h2>${formatMarkdownInline(trimmed.slice(2))}</h2>`
      // Blockquote
      if (trimmed.startsWith('> ')) return `<blockquote>${formatMarkdownInline(trimmed.slice(2))}</blockquote>`
      // Code block
      if (trimmed.startsWith('```')) {
        const code = trimmed.replace(/```[a-z]*\n?/, '').replace(/```$/, '')
        return `<pre style="background:#f1f5f9; padding:12px; border-radius:8px; font-family:monospace; font-size:12px; white-space:pre-wrap; margin:10px 0;">${esc(code)}</pre>`
      }
      // Numbered list
      if (/^\d+\. /.test(trimmed)) {
        const items = trimmed.split('\n').map((l) => l.replace(/^\d+\. /, '').trim())
        return `<ol>${items.map((i) => `<li>${formatMarkdownInline(i)}</li>`).join('')}</ol>`
      }
      // Bullet list
      if (/^[-*] /.test(trimmed)) {
        const items = trimmed.split('\n').map((l) => l.replace(/^[-*] /, '').trim())
        return `<ul>${items.map((i) => `<li>${formatMarkdownInline(i)}</li>`).join('')}</ul>`
      }
      // Table (GFM-style with | separators)
      if (trimmed.includes('|') && trimmed.split('\n').length >= 2) {
        const lines = trimmed.split('\n').filter((l) => l.trim())
        const headerLine = lines[0]
        const separatorLine = lines[1]
        if (separatorLine && /^\|?[\s:|-]+\|?$/.test(separatorLine)) {
          const headers = headerLine.split('|').map((c) => c.trim()).filter(Boolean)
          const rows = lines.slice(2).map((l) => l.split('|').map((c) => c.trim()).filter(Boolean))
          return `<table>
            <thead><tr>${headers.map((h) => `<th>${formatMarkdownInline(h)}</th>`).join('')}</tr></thead>
            <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${formatMarkdownInline(c)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>`
        }
      }
      // Default paragraph
      return `<p>${formatMarkdownInline(trimmed)}</p>`
    })
    .join('\n')
}

const moduleHtml = (m: Module, index: number): string => {
  const bits: string[] = []

  bits.push(`
    <div class="module">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
        <span class="module-num">${index + 1}</span>
        <span class="module-title">${esc(m.title || 'وحدة بلا عنوان')}</span>
      </div>
      ${m.durationMins ? `<div class="tag">⏱ ${m.durationMins} دقيقة</div>` : ''}
      ${m.transformation ? `<div class="transformation-pill">🎯 التحوّل: ${esc(m.transformation)}</div>` : ''}
      ${m.summary ? `<p style="font-size:15px; color:#334155; margin:10px 0;">${formatMarkdownInline(m.summary)}</p>` : ''}
  `)

  if (m.keyConcepts?.length) {
    bits.push(`
      <h3>💡 المفاهيم الجوهرية</h3>
      <ul>${m.keyConcepts.map((c) => `<li>${formatMarkdownInline(c)}</li>`).join('')}</ul>
    `)
  }

  if (m.content) {
    bits.push(`
      <h3>📖 محتوى الوحدة</h3>
      ${formatMarkdown(m.content)}
    `)
  }

  if (m.lessonSections?.length) {
    m.lessonSections.forEach((sec, i) => {
      bits.push(`
        <div style="background:#ffffff; border:1px solid #e5e7eb; padding:18px 20px; border-radius:10px; margin:14px 0;">
          <h4 style="color:#4f46e5; font-size:15px; margin-bottom:10px;">الدرس ${i + 1}: ${esc(sec.heading)}</h4>
          ${formatMarkdown(sec.body)}
        </div>
      `)
    })
  }

  if (m.objectives?.length) {
    bits.push(`
      <h3>🎓 أهداف التعلم</h3>
      <ol>${m.objectives.map((o) => `<li>${formatMarkdownInline(o.text)}</li>`).join('')}</ol>
    `)
  }

  if (m.exercises?.length) {
    bits.push(`<h3>💪 التمارين التطبيقية</h3>`)
    m.exercises.forEach((ex, i) => {
      bits.push(`
        <div class="box">
          <div style="font-weight:700; color:#1e293b; font-size:15px; margin-bottom:8px;">
            تمرين ${i + 1}: ${esc(ex.title)}
            ${ex.estimatedMins ? `<span class="tag" style="margin-right:8px;">⏱ ${ex.estimatedMins} دقيقة</span>` : ''}
          </div>
          ${formatMarkdown(ex.instructions)}
          ${
            ex.successCriteria?.length
              ? `<h4 style="margin-top:12px;">معايير النجاح:</h4>
                 <ul>${ex.successCriteria.map((c) => `<li>${formatMarkdownInline(c)}</li>`).join('')}</ul>`
              : ''
          }
        </div>
      `)
    })
  }

  if (m.examples?.length) {
    bits.push(`
      <h3>🌟 أمثلة واقعية</h3>
      ${m.examples.map((e) => `<div class="box">${formatMarkdown(e)}</div>`).join('')}
    `)
  }

  if (m.commonMistakes?.length) {
    bits.push(`
      <h3>⚠️ أخطاء شائعة لتجنّبها</h3>
      <div class="highlight-box">
        <ul style="margin:0;">${m.commonMistakes.map((c) => `<li>${formatMarkdownInline(c)}</li>`).join('')}</ul>
      </div>
    `)
  }

  if (m.resources?.length) {
    bits.push(`
      <h3>📚 المصادر والمراجع</h3>
      <table>
        <thead><tr><th>النوع</th><th>العنوان</th><th>ملاحظة</th></tr></thead>
        <tbody>
          ${m.resources
            .map(
              (r) => `<tr>
            <td><span class="tag">${esc(r.type)}</span></td>
            <td><strong>${esc(r.title)}</strong></td>
            <td>${esc(r.note || '—')}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    `)
  }

  if (m.assessment?.length) {
    bits.push(`
      <h3>✅ معايير التقييم</h3>
      <table>
        <thead><tr><th>المعيار</th><th>الوزن</th><th>الوصف</th></tr></thead>
        <tbody>
          ${m.assessment
            .map(
              (a) => `<tr>
            <td><strong>${esc(a.criterion)}</strong></td>
            <td style="text-align:center;"><span class="tag">${a.weight}%</span></td>
            <td>${esc(a.description)}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    `)
  }

  if (m.instructorNotes) {
    bits.push(`
      <h3>👨‍🏫 ملاحظات للمدرّب</h3>
      <div class="highlight-box" style="background:#e0e7ff; color:#3730a3; border-color:#6366f1;">
        ${formatMarkdown(m.instructorNotes)}
      </div>
    `)
  }

  bits.push('</div>')
  return bits.join('\n')
}

export const buildCurriculumHtml = (c: CurriculumBlueprint): string => {
  const totalDuration = c.modules.reduce((s, m) => s + (m.durationMins || 0), 0)
  const totalObjectives = c.modules.reduce((s, m) => s + m.objectives.length, 0)
  const totalExercises = c.modules.reduce((s, m) => s + (m.exercises?.length || 0), 0)

  const inner = `
    <div class="cover">
      <div class="eyebrow">ACADEMY CURRICULUM SUITE · منهج تدريبي متكامل</div>
      <h1>${esc(c.title || 'منهج تدريبي')}</h1>
      <div class="meta">
        <span>📊 الحالة: ${esc(c.status)}</span>
        <span>⭐ مؤشر الكفاءة: ${c.leanScore}/100</span>
        <span>📅 ${new Date(c.updatedAt).toLocaleDateString('ar')}</span>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${c.modules.length}</div>
        <div class="stat-label">عدد الوحدات</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalObjectives}</div>
        <div class="stat-label">أهداف تعلم</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalExercises}</div>
        <div class="stat-label">تمارين تطبيقية</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(totalDuration / 60)}h</div>
        <div class="stat-label">مدة الدورة</div>
      </div>
    </div>

    <div class="section">
      <h2>🗺️ خريطة التحوّل</h2>
      <div class="box" style="font-size:15px; line-height:1.9;">${formatMarkdown(c.transformationMap || 'لم تُحدد بعد')}</div>
      <dl class="kv-grid">
        <dt>نقطة البداية</dt>
        <dd>${esc(c.startingPoint || '—')}</dd>
        <dt>الوجهة</dt>
        <dd>${esc(c.destination || '—')}</dd>
        <dt>الجمهور المستهدف</dt>
        <dd>${esc(c.audience || '—')}</dd>
        <dt>مدة التدريب</dt>
        <dd>${esc(c.duration || '—')}</dd>
        <dt>نمط التقديم</dt>
        <dd>${esc(c.modality || '—')}</dd>
      </dl>
    </div>

    <div class="section" style="padding:0; border:none;">
      <h2 style="padding:0 0 10px 0; border:none;">📚 وحدات المنهج التفصيلية</h2>
      ${c.modules.map((m, i) => moduleHtml(m, i)).join('\n')}
    </div>
  `

  return buildPrintableHtml(c.title || 'Curriculum Blueprint', inner, true)
}
