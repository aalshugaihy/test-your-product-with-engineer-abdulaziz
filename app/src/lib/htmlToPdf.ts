/**
 * HTML → PDF renderer that handles Arabic text correctly.
 *
 * Strategy: render the HTML document inside a hidden iframe using the
 * browser's native text engine (which handles Arabic/RTL, ligatures, and
 * font fallback perfectly), then capture each page area to canvas via
 * html2canvas, and stitch the canvases into a multi-page A4 PDF with jsPDF.
 *
 * Why not jsPDF directly? jsPDF's default Helvetica doesn't support Arabic,
 * and embedding a custom Arabic font (e.g. Cairo) balloons the bundle and
 * still renders glyphs with broken shaping. Using the browser engine gives
 * us native-quality Arabic rendering for free.
 */

export interface HtmlToPdfOptions {
  filename: string
  pageFormat?: 'a4' | 'letter'
  marginMm?: number
  scale?: number // html2canvas scale, default 2 for sharp output
}

export const htmlToPdf = async (html: string, opts: HtmlToPdfOptions) => {
  const [{ default: jsPDF }, html2canvasMod, { saveAs }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
    import('file-saver'),
  ])
  const html2canvas = (html2canvasMod as any).default || html2canvasMod

  const { filename, pageFormat = 'a4', marginMm = 12, scale = 2 } = opts

  // Create an offscreen iframe for clean rendering context
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.top = '-10000px'
  iframe.style.left = '0'
  iframe.style.width = '794px' // A4 width at 96dpi
  iframe.style.height = '1123px' // A4 height at 96dpi
  iframe.style.border = '0'
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument!
    doc.open()
    doc.write(html)
    doc.close()

    // Wait for webfonts to load inside the iframe
    await new Promise<void>((resolve) => {
      if ((doc as any).fonts?.ready) {
        ;(doc as any).fonts.ready.then(() => resolve())
      } else {
        setTimeout(resolve, 400)
      }
    })
    // Extra beat for layout to settle
    await new Promise((r) => setTimeout(r, 150))

    const target = doc.body
    // Canvas from the iframe body
    const canvas = await html2canvas(target, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight,
    })

    // Build the PDF — slice the canvas into A4 pages
    const pdf = new jsPDF({ unit: 'mm', format: pageFormat, orientation: 'portrait' })
    const pageW = pdf.internal.pageSize.getWidth() - marginMm * 2
    const pageH = pdf.internal.pageSize.getHeight() - marginMm * 2

    const imgWmm = pageW
    const imgHmm = (canvas.height * imgWmm) / canvas.width

    if (imgHmm <= pageH) {
      // Fits on one page
      const img = canvas.toDataURL('image/png')
      pdf.addImage(img, 'PNG', marginMm, marginMm, imgWmm, imgHmm, undefined, 'FAST')
    } else {
      // Slice vertically into pages
      const pageHeightPx = Math.floor((pageH * canvas.width) / imgWmm)
      const totalPages = Math.ceil(canvas.height / pageHeightPx)

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage()
        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = canvas.width
        sliceCanvas.height = Math.min(pageHeightPx, canvas.height - i * pageHeightPx)
        const ctx = sliceCanvas.getContext('2d')!
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
        ctx.drawImage(
          canvas,
          0,
          i * pageHeightPx,
          canvas.width,
          sliceCanvas.height,
          0,
          0,
          canvas.width,
          sliceCanvas.height
        )
        const sliceImg = sliceCanvas.toDataURL('image/png')
        const sliceHmm = (sliceCanvas.height * imgWmm) / sliceCanvas.width
        pdf.addImage(sliceImg, 'PNG', marginMm, marginMm, imgWmm, sliceHmm, undefined, 'FAST')
      }
    }

    const blob = pdf.output('blob')
    saveAs(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
  } finally {
    document.body.removeChild(iframe)
  }
}

/**
 * Build a complete HTML document with embedded Arabic-ready fonts.
 * Use for anything that will be rendered to PDF or saved as standalone HTML.
 */
export const buildPrintableHtml = (title: string, bodyInner: string, rtl = true): string => `<!doctype html>
<html lang="${rtl ? 'ar' : 'en'}" dir="${rtl ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: 'Cairo', 'Tajawal', 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
    background: #ffffff;
    line-height: 1.85;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: 'kern' 1, 'liga' 1;
    text-rendering: optimizeLegibility;
  }
  body { padding: 0; }
  .page { padding: 28px 32px; max-width: 794px; margin: 0 auto; }
  .cover {
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #ec4899 100%);
    color: #fff;
    padding: 60px 48px;
    margin-bottom: 28px;
    border-radius: 0;
    position: relative;
    overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: -80px;
    ${rtl ? 'left' : 'right'}: -80px;
    width: 240px; height: 240px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%);
  }
  .cover::after {
    content: '';
    position: absolute;
    bottom: -100px;
    ${rtl ? 'right' : 'left'}: -100px;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(236,72,153,0.25), transparent 70%);
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.85;
    margin-bottom: 10px;
    position: relative;
  }
  h1 { font-size: 38px; font-weight: 900; margin: 12px 0 16px; line-height: 1.2; position: relative; }
  .meta { font-size: 13px; opacity: 0.9; position: relative; display: flex; gap: 16px; flex-wrap: wrap; }
  .meta span { background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 999px; backdrop-filter: blur(10px); }
  .section {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 24px 28px;
    margin: 14px 0;
    page-break-inside: avoid;
  }
  h2 {
    font-size: 22px;
    font-weight: 800;
    color: #4f46e5;
    margin: 0 0 14px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #eef2ff;
  }
  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin: 14px 0 8px;
  }
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin: 12px 0 6px;
  }
  p {
    font-size: 14px;
    color: #334155;
    margin: 8px 0;
    line-height: 1.85;
  }
  ul { list-style: none; padding: 0; margin: 8px 0; }
  ul li {
    padding: 6px 0;
    padding-${rtl ? 'right' : 'left'}: 22px;
    position: relative;
    font-size: 14px;
    line-height: 1.7;
    color: #334155;
  }
  ul li::before {
    content: '';
    position: absolute;
    ${rtl ? 'right' : 'left'}: 0;
    top: 14px;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f46e5, #ec4899);
  }
  ol { padding-${rtl ? 'right' : 'left'}: 24px; margin: 8px 0; }
  ol li { font-size: 14px; line-height: 1.7; padding: 4px 0; color: #334155; }
  .tag {
    display: inline-block;
    background: #eef2ff;
    color: #4338ca;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    margin: 2px 4px 2px 0;
    border: 1px solid #e0e7ff;
  }
  .box {
    background: linear-gradient(135deg, #eef2ff 0%, #fce7f3 100%);
    padding: 18px 22px;
    border-radius: 12px;
    font-size: 14px;
    margin: 12px 0;
    border-${rtl ? 'right' : 'left'}: 4px solid #6366f1;
  }
  .highlight-box {
    background: #fef3c7;
    border-${rtl ? 'right' : 'left'}: 4px solid #f59e0b;
    padding: 14px 18px;
    border-radius: 8px;
    margin: 10px 0;
    font-size: 13px;
    color: #78350f;
  }
  .module {
    background: #f8fafc;
    border-radius: 12px;
    padding: 22px 26px;
    margin: 16px 0;
    border-${rtl ? 'right' : 'left'}: 6px solid;
    border-image: linear-gradient(to bottom, #4f46e5, #ec4899) 1 100%;
    page-break-inside: avoid;
  }
  .module-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #4f46e5, #ec4899);
    color: #fff;
    font-weight: 800;
    border-radius: 12px;
    margin-${rtl ? 'left' : 'right'}: 14px;
    vertical-align: middle;
    box-shadow: 0 4px 12px rgba(79,70,229,0.25);
  }
  .module-title { display: inline; font-size: 20px; font-weight: 800; color: #1e293b; vertical-align: middle; }
  .transformation-pill {
    display: inline-block;
    background: #fef3c7;
    color: #92400e;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    margin: 10px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 13px;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #e5e7eb;
    padding: 10px 12px;
    text-align: ${rtl ? 'right' : 'left'};
    vertical-align: top;
  }
  th {
    background: linear-gradient(135deg, #eef2ff, #fce7f3);
    color: #4338ca;
    font-weight: 700;
  }
  tr:nth-child(even) td { background: #f9fafb; }
  .footer {
    margin-top: 30px;
    padding: 20px;
    text-align: center;
    color: #94a3b8;
    font-size: 11px;
    border-top: 1px solid #e5e7eb;
  }
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin: 14px 0;
  }
  .stat-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
  }
  .stat-value { font-size: 26px; font-weight: 800; background: linear-gradient(135deg, #4f46e5, #ec4899); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .stat-label { font-size: 11px; color: #64748b; margin-top: 4px; }
  blockquote {
    border-${rtl ? 'right' : 'left'}: 3px solid #6366f1;
    padding: 10px 18px;
    margin: 12px 0;
    color: #475569;
    font-style: italic;
    background: #f8fafc;
    border-radius: 4px;
  }
  code {
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: #4f46e5;
    font-family: 'Menlo', 'Monaco', monospace;
  }
  .kv-grid {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 10px 18px;
    margin: 10px 0;
  }
  .kv-grid dt { font-weight: 600; color: #6b7280; font-size: 13px; }
  .kv-grid dd { font-size: 13px; color: #1e293b; }
</style>
</head>
<body>
  <div class="page">
    ${bodyInner}
    <div class="footer">
      اختبر منتجك أو فكرتك بالبداية مع المهندس عبدالعزيز · Test Your Product with Engineer Abdulaziz<br>
      Generated on ${new Date().toLocaleString(rtl ? 'ar' : 'en')}
    </div>
  </div>
</body>
</html>`
