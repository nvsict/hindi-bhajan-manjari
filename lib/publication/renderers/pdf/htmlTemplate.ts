// ==========================================
// 🌟 ROYAL PARCHMENT THEME (Adaptive Print Engine - Per Chapter)
// ==========================================
import { PublicationDocument, ScriptLanguage } from '../../types';
import { printThemes, layoutConfig } from './theme';

/**
 * भाषा के अनुसार सही Google Font URL और Font Family नेम लौटाता है
 */
function getScriptFontConfig(script: ScriptLanguage) {
  const fontConfigs: Record<ScriptLanguage, { name: string; url: string }> = {
    devanagari: { 
      name: 'Mukta', 
      url: 'https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800&family=Rozha+One&display=swap' 
    },
    gujarati: { 
      name: 'Mukta Vaani', 
      url: 'https://fonts.googleapis.com/css2?family=Mukta+Vaani:wght@400;500;600;700;800&family=Rozha+One&display=swap' 
    },
    bengali: { 
      name: 'Noto Sans Bengali', 
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@500;600;700;800&family=Rozha+One&display=swap' 
    },
    telugu: { 
      name: 'Noto Sans Telugu', 
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@500;600;700;800&family=Rozha+One&display=swap' 
    },
    hinglish: { 
      name: 'Mukta', 
      url: 'https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800&family=Rozha+One&display=swap' 
    },
  };
  return fontConfigs[script] || fontConfigs.devanagari;
}

export function generatePrintHTML(doc: PublicationDocument): string {
  const { config, metadata, chapters } = doc;
  
  // 1. फॉन्ट सेट करें
  const fontConfig = getScriptFontConfig(config.script);
  
  // 2. 🌟 SMART THEME SWITCHER
  const activeThemeKey = config.theme || config.themeName || 'default';
  const selectedTheme = printThemes[activeThemeKey as keyof typeof printThemes] || printThemes.default;
  
  // थीम वेरिएबल्स
  const t = selectedTheme.colors;
  const l = layoutConfig;
  const fontSizeBase = `${17 * (config.fontSizeScale || 1.0)}px`;

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>${metadata.title}</title>

  <!-- 🌟 Dynamic Google Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontConfig.url}" rel="stylesheet">

  <style>
    @page { 
      size: ${config.pageSize || 'A4'} portrait; 
      margin: ${l.pageMargin}; 
    }

    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }

    html, body { 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact; 
      background: ${t.background}; 
    }

    body { 
      font-family: '${fontConfig.name}', sans-serif; 
      color: ${t.textMain}; 
      font-size: ${fontSizeBase}; 
      font-weight: 600; 
      -webkit-font-smoothing: antialiased; 
    }

    /* 🌟 ग्लोबल बैकग्राउंड और पेज फ्रेम */
    .global-background { 
      position: fixed; 
      top: ${l.globalOffsetTB}; bottom: ${l.globalOffsetTB}; 
      left: ${l.globalOffsetLR}; right: ${l.globalOffsetLR}; 
      z-index: -10; 
      pointer-events: none; 
    }
    .page-frame { 
      position: absolute; 
      top: 6mm; bottom: 6mm; left: 6mm; right: 6mm; 
      border: 1.5px solid ${t.accentGold}; 
      border-radius: 4px; 
    }
    .page-frame-inner { 
      position: absolute; 
      top: 7.5mm; bottom: 7.5mm; left: 7.5mm; right: 7.5mm; 
      border: 0.5px solid ${t.borderLight}; 
    }

    .watermark-center { 
      position: absolute; 
      top: 50%; left: 50%; 
      transform: translate(-50%, -50%); 
      font-size: 140px; 
      font-weight: 800; 
      color: ${t.accentGold}; 
      opacity: 0.035; 
    }

    .running-footer { 
      position: absolute; 
      bottom: ${l.footerBottom}; 
      left: 0; right: 0; 
      text-align: center; 
      font-size: 8.5pt; 
      font-weight: 600; 
      color: ${t.accentDark}; 
    }

    /* --- CONTENT BASE STYLES --- */
    .chapter { 
      position: relative; 
      page-break-after: always; 
      break-after: page; 
      padding-top: 5px; 
    }
    .chapter:last-child { 
      page-break-after: avoid; 
      break-after: avoid; 
    }

    .header-branding { 
      text-align: center; 
      margin-bottom: 24px; 
      column-span: all; 
    }

    .logo-title { 
      font-family: 'Rozha One', '${fontConfig.name}', serif; 
      font-size: 2.4em; 
      font-weight: 800; 
      color: ${t.accentDark}; 
      line-height: 1.3; 
      text-shadow: 1px 1px 0px ${t.shadowLight}; 
    }

    .sub-title { 
      font-size: 1.1em; 
      font-weight: 700; 
      color: ${t.accentGold}; 
      margin-top: 4px; 
    }

    .ornamental-line { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      margin: 16px auto 28px auto; 
      width: 70%; 
    }
    .line-dash { 
      flex: 1; height: 1.5px; 
      background: linear-gradient(90deg, transparent, ${t.accentGold}, transparent); 
    }
    .line-diamond { 
      width: 6px; height: 6px; 
      background: ${t.accentGold}; 
      transform: rotate(45deg); 
      margin: 0 10px; 
    }

    /* 🌟 ADAPTIVE LAYOUT PROFILES 🌟 */
    
    .verses-container { width: 100%; }
    .verse-box { text-align: center; page-break-inside: avoid; break-inside: avoid; }
    .verse-line { display: block; letter-spacing: 0.2px; overflow-wrap: break-word; }
    .verse-chorus { 
      font-weight: 800; 
      color: ${t.accentDark}; 
      display: inline-block; 
      padding: 4px 12px; 
      border-left: 3px solid ${t.accentGold}; 
      background: ${t.chorusBg}; 
      border-radius: 4px; 
    }

    /* PROFILE A: Standard Single Column */
    .layout-single-standard .verses-container { column-count: 1; max-width: 85%; margin: 0 auto; }
    .layout-single-standard .verse-box { margin-bottom: 28px; }
    .layout-single-standard .verse-line { font-size: 1em; line-height: 1.35; margin-bottom: 3px; }
    .layout-single-standard .verse-chorus { font-size: 1.05em; }

    /* PROFILE B: Compact Single Column */
    .layout-single-compact .verses-container { column-count: 1; max-width: 90%; margin: 0 auto; }
    .layout-single-compact .verse-box { margin-bottom: 20px; }
    .layout-single-compact .verse-line { font-size: 0.9em; line-height: 1.3; margin-bottom: 2px; }
    .layout-single-compact .verse-chorus { font-size: 0.95em; }

    /* PROFILE C: Two Column Standard */
    .layout-two-column .verses-container { column-count: 2; column-gap: 36px; column-rule: 1px dashed ${t.columnDivider}; }
    .layout-two-column .verse-box { margin-bottom: 24px; }
    .layout-two-column .verse-line { font-size: 0.95em; line-height: 1.35; margin-bottom: 3px; }
    .layout-two-column .verse-chorus { font-size: 1em; }

    /* PROFILE D: Two Column Compact */
    .layout-two-column-compact .verses-container { column-count: 2; column-gap: 30px; column-rule: 1px dashed ${t.columnDivider}; }
    .layout-two-column-compact .verse-box { margin-bottom: 16px; }
    .layout-two-column-compact .verse-line { font-size: 0.85em; line-height: 1.25; margin-bottom: 2px; }
    .layout-two-column-compact .verse-chorus { font-size: 0.9em; }
  </style>
</head>
<body>

  <!-- ग्लोबल बैकग्राउंड -->
  <div class="global-background">
    <div class="page-frame"></div>
    <div class="page-frame-inner"></div>
    <div class="watermark-center">ॐ</div>
    <div class="running-footer">॥ हिंदी भजन मंजरी • hindibhajanmanjari.com ॥</div>
  </div>

  <!-- 🌟 PER-CHAPTER DYNAMIC WRAPPERS -->
  <!-- पपेटियर हर एक '.dynamic-chapter' की हाइट नापेगा और उसके लेआउट को एडजस्ट करेगा -->
  ${chapters.map((chapter, index) => {
    return `
      <div id="chapter-${index}" class="chapter dynamic-chapter layout-single-standard">
        
        <div class="header-branding">
          <div class="logo-title">${chapter.titleMain}</div>
          ${chapter.titleSecondary ? `<div class="sub-title">${chapter.titleSecondary}</div>` : ''}
          <div class="ornamental-line">
            <div class="line-dash"></div>
            <div class="line-diamond"></div>
            <div class="line-dash"></div>
          </div>
        </div>

        <div class="verses-container">
          ${chapter.verses.map(verse => `
            <div class="verse-box">
              <div class="${verse.type === 'chorus' ? 'verse-chorus' : ''}">
                ${verse.lines.map(line => `<span class="verse-line">${line}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }).join('')}

</body>
</html>`;
}