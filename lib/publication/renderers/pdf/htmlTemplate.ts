// ==========================================
// 🌟 ROYAL PARCHMENT THEME (Multi-Script Dynamic Font Engine)
// ==========================================
import { PublicationDocument, ScriptLanguage } from '../../types';

/**
 * भाषा के अनुसार सही Google Font URL और Font Family नेम लौटाता है
 */
function getScriptFontConfig(script: ScriptLanguage) {
  const fontConfigs: Record<ScriptLanguage, { name: string; url: string }> = {
    devanagari: {
      name: 'Noto Sans Devanagari',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@500;600;700;800&family=Rozha+One&display=swap',
    },
    gujarati: {
      name: 'Noto Sans Gujarati',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@500;600;700;800&family=Rozha+One&display=swap',
    },
    bengali: {
      name: 'Noto Sans Bengali',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@500;600;700;800&family=Rozha+One&display=swap',
    },
    telugu: {
      name: 'Noto Sans Telugu',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@500;600;700;800&family=Rozha+One&display=swap',
    },
    gurmukhi: {
      name: 'Noto Sans Gurmukhi',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@500;600;700;800&family=Rozha+One&display=swap',
    },
    hinglish: {
      name: 'Noto Sans',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@500;600;700;800&family=Rozha+One&display=swap',
    },
    kannada: {
      name: 'Noto Sans Kannada',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@500;600;700;800&display=swap',
    },
    tamil: {
      name: 'Noto Sans Tamil',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@500;600;700;800&display=swap',
    },
    oriya: {
      name: 'Noto Sans Oriya',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Oriya:wght@500;600;700;800&display=swap',
    },
    assamese: {
      name: 'Noto Sans Bengali',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@500;600;700;800&display=swap',
    },
    malayalam: {
      name: 'Noto Sans Malayalam',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@500;600;700;800&display=swap',
    },
  };

  return fontConfigs[script] || fontConfigs.devanagari;
}

export function generatePrintHTML(doc: PublicationDocument): string {
  const { config, metadata, chapters } = doc;
  const SITE_URL = 'https://hindibhajanmanjari.com';

  // 🌟 भाषा के अनुसार फॉन्ट का चयन
  const fontConfig = getScriptFontConfig(config.script);

  // Royal Devotional Palette
  const textColor = '#2C1810';
  const accentGold = '#D97706';
  const accentDark = '#9A3412';
  const bgColor = '#FFF9EF';

  const marginTop = '20mm';
  const marginSide = '18mm';
  const fontSizeBase = `${17 * (config.fontSizeScale || 1.0)}px`;
  const totalChapters = chapters.length;

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>${metadata.title}</title>

  <!-- 🌟 Dynamic Google Font for Selected Language -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontConfig.url}" rel="stylesheet">

  <style>
    @page {
      size: ${config.pageSize || 'A4'} portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      /* 🌟 डायनामिक रूप से लोड हुआ फॉन्ट फैमिली लागू करें */
      font-family: '${fontConfig.name}', sans-serif;
      color: ${textColor};
      background: ${bgColor};
      line-height: 1.9;
      font-size: ${fontSizeBase};
      font-weight: 600;
      -webkit-font-smoothing: antialiased;
    }

    .chapter {
      position: relative;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
    }
    .chapter:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    .page-inner {
      position: relative;
      z-index: 10;
      min-height: 100%;
      padding: ${marginTop} ${marginSide};
    }

    .page-frame,
    .page-frame-inner {
      position: absolute;
      pointer-events: none;
      z-index: 50;
    }
    .page-frame {
      top: 6mm; left: 6mm; right: 6mm; bottom: 6mm;
      border: 1.5px solid ${accentGold};
      border-radius: 4px;
    }
    .page-frame-inner {
      top: 7.5mm; left: 7.5mm; right: 7.5mm; bottom: 7.5mm;
      border: 0.5px solid #FDBA74;
    }

    /* --- WATERMARKS --- */
    .watermark-center {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 130px;
      font-weight: 800;
      color: ${accentGold};
      opacity: 0.035;
      z-index: 0;
      pointer-events: none;
      user-select: none;
    }
    .watermark-lotus-left {
      position: absolute;
      bottom: 0; left: 0;
      width: 180px; height: 180px;
      background: radial-gradient(circle, rgba(217,119,6,0.10) 0%, rgba(255,255,255,0) 70%);
      z-index: 0; pointer-events: none;
    }
    .watermark-temple-right {
      position: absolute;
      bottom: 0; right: 0;
      width: 220px; height: 220px;
      background: radial-gradient(circle, rgba(180,83,9,0.12) 0%, rgba(255,255,255,0) 70%);
      z-index: 0; pointer-events: none;
    }

    .running-header {
      position: absolute;
      top: 8mm; left: 0; right: 0;
      text-align: center;
      font-size: 8.5pt;
      font-weight: 600;
      color: #B45309;
      z-index: 10;
    }

    .running-footer {
      position: absolute;
      bottom: 8mm; left: 0; right: 0;
      text-align: center;
      font-size: 8.5pt;
      font-weight: 600;
      color: ${accentDark};
      z-index: 10;
    }
    .running-footer a {
      color: ${accentDark};
      text-decoration: none;
      border-bottom: 1px dotted ${accentGold};
    }

    .header-branding {
      text-align: center;
      margin-bottom: 20px;
    }

    .logo-title {
      font-family: 'Rozha One', '${fontConfig.name}', serif;
      font-size: 2.2em;
      font-weight: 800;
      color: ${accentDark};
      line-height: 1.3;
      text-shadow: 1px 1px 0px rgba(253, 186, 116, 0.4);
      overflow-wrap: break-word;
      max-width: 100%;
    }

    .sub-title {
      font-size: 1em;
      font-weight: 700;
      color: #B45309;
      margin-top: 6px;
    }

    .site-link-pill {
      display: inline-block;
      margin-top: 10px;
      padding: 4px 14px;
      font-size: 0.62em;
      font-weight: 700;
      letter-spacing: 0.3px;
      color: ${accentDark};
      background: rgba(217, 119, 6, 0.08);
      border: 1px solid rgba(217, 119, 6, 0.35);
      border-radius: 999px;
      text-decoration: none;
    }

    .ornamental-line {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 14px auto 28px auto;
      width: 60%;
    }
    .line-dash {
      flex: 1; height: 1px;
      background: linear-gradient(90deg, transparent, ${accentGold}, transparent);
    }
    .line-diamond {
      width: 6px; height: 6px;
      background: ${accentGold};
      transform: rotate(45deg);
      margin: 0 10px;
    }

    .verse-box {
      text-align: center;
      margin-bottom: 26px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .verse-chorus {
      font-weight: 800;
      color: ${accentDark};
      font-size: 1.08em;
      display: inline-block;
      padding: 6px 18px;
      border-left: 3px solid ${accentGold};
      border-radius: 2px;
    }

    .verse-line {
      display: block;
      margin-bottom: 3px;
      letter-spacing: 0.3px;
      overflow-wrap: break-word;
      max-width: 100%;
    }

    .bhavarth-box {
      margin-top: 36px;
      padding: 18px 22px;
      background: rgba(255, 237, 213, 0.55);
      border: 1px solid #FDBA74;
      border-radius: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
      text-align: center;
    }
    .bhavarth-title {
      font-weight: 800;
      color: ${accentDark};
      margin-bottom: 8px;
      font-size: 1.05em;
    }
    .bhavarth-text {
      font-size: 0.95em;
      color: #374151;
      line-height: 1.8;
      font-weight: 500;
      text-align: left;
    }
  </style>
</head>
<body>

  ${chapters
    .map(
      (chapter, index) => `
    <div class="chapter">

      <div class="page-frame"></div>
      <div class="page-frame-inner"></div>
      <div class="watermark-center">ॐ</div>
      <div class="watermark-lotus-left"></div>
      <div class="watermark-temple-right"></div>

      <div class="running-header">${metadata.title}</div>
      <div class="running-footer">
        ॥ हिंदी भजन मंजरी •
        <a href="${SITE_URL}">hindibhajanmanjari.com</a>
        ॥&nbsp;&nbsp;|&nbsp;&nbsp;पृष्ठ ${index + 1} / ${totalChapters}
      </div>

      <div class="page-inner">

        <div class="header-branding">
          <div class="logo-title">${chapter.titleMain}</div>
          ${chapter.titleSecondary ? `<div class="sub-title">${chapter.titleSecondary}</div>` : ''}

          <a class="site-link-pill" href="${SITE_URL}">🌐 hindibhajanmanjari.com</a>

          <div class="ornamental-line">
            <div class="line-dash"></div>
            <div class="line-diamond"></div>
            <div class="line-dash"></div>
          </div>
        </div>

        ${chapter.verses
          .map(
            (verse) => `
          <div class="verse-box">
            <div class="${verse.type === 'chorus' ? 'verse-chorus' : ''}">
              ${verse.lines.map((line) => `<span class="verse-line">${line}</span>`).join('')}
            </div>
          </div>
        `
          )
          .join('')}

        ${
          chapter.explanation && config.includeMeaning
            ? `
          <div class="bhavarth-box">
            <div class="bhavarth-title">॥ भावार्थ ॥</div>
            <div class="bhavarth-text">${chapter.explanation}</div>
          </div>
        `
            : ''
        }

      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;
}