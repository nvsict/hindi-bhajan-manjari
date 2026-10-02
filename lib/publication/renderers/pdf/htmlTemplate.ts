// ==========================================
// 🌟 ROYAL PARCHMENT THEME (Adaptive Print Engine - Per Chapter)
// ==========================================
import { PublicationDocument, ScriptLanguage } from '../../types';
import { printThemes, layoutConfig } from './theme';

/**
 * Bhasha ke anusaar sahi Google Font URL aur Font Family name lautata hai
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
  
  // 1. Font setup
  const fontConfig = getScriptFontConfig(config.script);
  
  // 2. 🌟 SMART THEME SWITCHER
  const activeThemeKey = config.theme || config.themeName || 'default';
  const selectedTheme = printThemes[activeThemeKey as keyof typeof printThemes] || printThemes.default;
  
  // Theme Variables
  const t = selectedTheme.colors;
  const l = layoutConfig;
  const fontSizeBase = `${17 * (config.fontSizeScale || 1.0)}px`;

  // Logo URL: Puppeteer needs an absolute path to load images correctly. 
  const logoUrl = 'https://www.hindibhajanmanjari.com/logo.png'; 

  // ==========================================
  // 🌟 SMART GROUPING ENGINE (By Deity)
  // ==========================================
  const groupsMap = new Map<string, any[]>();

  chapters.forEach((chapter: any) => {
    let deityName = 'विविध भजन (Miscellaneous)';
    
    if (chapter.deity) {
      deityName = typeof chapter.deity === 'string' ? chapter.deity : (chapter.deity.name_hindi || chapter.deity.name || deityName);
    } else if (chapter.metadata && chapter.metadata.deity) {
      deityName = typeof chapter.metadata.deity === 'string' ? chapter.metadata.deity : (chapter.metadata.deity.name_hindi || chapter.metadata.deity.name || deityName);
    } else if (chapter.categories && chapter.categories.length > 0) {
      deityName = chapter.categories[0].name_hindi || chapter.categories[0].name || deityName;
    }

    if (!groupsMap.has(deityName)) {
      groupsMap.set(deityName, []);
    }
    groupsMap.get(deityName)!.push(chapter);
  });

  const groupedIndex: { deity: string, chapters: any[] }[] = [];
  let globalCounter = 0;

  groupsMap.forEach((bhajans, deity) => {
    const processedBhajans = bhajans.map(bhajan => ({
      ...bhajan,
      globalIndex: globalCounter++,
      extractedDeity: deity
    }));
    groupedIndex.push({ deity, chapters: processedBhajans });
  });

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>${metadata.title || 'Bhajan Sangrah'}</title>

  <!-- 🌟 Dynamic Google Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontConfig.url}" rel="stylesheet">

  <style>
    @page { 
      size: ${config.pageSize || 'A4'} portrait; 
      margin: ${l.pageMargin}; 
      
      /* 🌟 UX Fix 1: Page Numbers (Standard Paged Media CSS) */
      @bottom-right {
        content: "Page " counter(page);
        font-family: '${fontConfig.name}', sans-serif;
        font-size: 9pt;
        color: ${t.accentDark};
      }
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

    /* 🌟 Global Background & Page Frame */
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
      font-size: 9pt; 
      font-weight: 600; 
      color: ${t.accentDark}; 
    }
    /* 🌟 UX Fix 5: Footer Clickable styling */
    .running-footer a {
      color: inherit;
      text-decoration: none;
      border-bottom: 1px dotted ${t.accentDark};
    }

    /* =======================================
       🌟 COVER PAGE STYLES
       ======================================= */
    .cover-page {
      position: relative;
      height: 95vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      break-after: page;
      text-align: center;
      padding: 40px;
    }
    .cover-border {
      border: 4px double ${t.accentGold};
      padding: 60px 40px;
      border-radius: 16px;
      width: 90%;
      background: rgba(255, 255, 255, 0.45);
      box-shadow: 0 10px 30px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .cover-logo {
      width: 130px;
      height: auto;
      margin-bottom: 24px;
      border-radius: 50%;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      border: 3px solid ${t.accentGold};
    }
    .cover-title {
      font-family: 'Rozha One', '${fontConfig.name}', serif;
      font-size: 3.8em;
      font-weight: 800;
      color: ${t.accentDark};
      margin-bottom: 16px;
      line-height: 1.2;
      text-shadow: 2px 2px 0px ${t.shadowLight};
    }
    .cover-subtitle {
      font-size: 1.4em;
      color: ${t.accentDark};
      font-weight: 600;
      margin-bottom: 40px;
    }
    .cover-branding {
      font-size: 1.1em;
      color: ${t.textMain};
      font-weight: 700;
      opacity: 0.85;
      margin-top: 20px;
    }

    /* =======================================
       🌟 INDEX PAGE STYLES
       ======================================= */
    .index-page {
      page-break-after: always;
      break-after: page;
      padding: 40px 60px;
    }
    .index-heading {
      font-family: 'Rozha One', '${fontConfig.name}', serif;
      font-size: 2.8em;
      font-weight: 800;
      color: ${t.accentDark};
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid ${t.accentGold};
      padding-bottom: 15px;
    }
    
    .index-deity-section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    .index-deity-header {
      font-family: 'Rozha One', '${fontConfig.name}', serif;
      font-size: 1.6em;
      font-weight: 700;
      color: ${t.accentGold};
      text-align: center;
      margin-bottom: 16px;
      background: linear-gradient(90deg, transparent, ${t.accentGold}20, transparent);
      padding: 6px 0;
      border-radius: 8px;
    }

    .index-list {
      column-count: 2;
      column-gap: 50px;
      column-rule: 1px dashed ${t.borderLight};
    }
    .index-item {
      display: flex;
      align-items: baseline;
      text-decoration: none; 
      color: ${t.textMain};
      font-size: 1.1em;
      font-weight: 600;
      margin-bottom: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .index-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 75%;
    }
    .index-dots {
      flex-grow: 1;
      border-bottom: 2px dotted ${t.borderLight};
      margin: 0 10px;
    }
    .index-click-hint {
      font-size: 0.75em;
      color: ${t.accentGold};
      font-weight: 700;
      white-space: nowrap;
    }

    /* =======================================
       🌟 UX Fix 3: DEITY DIVIDER PAGE STYLES 
       ======================================= */
    .deity-divider-page {
      position: relative;
      height: 95vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      break-after: page;
      text-align: center;
    }
    .deity-divider-border {
      border: 2px dashed ${t.accentGold};
      padding: 50px 80px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.7);
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }
    .deity-divider-title {
      font-family: 'Rozha One', '${fontConfig.name}', serif;
      font-size: 3.5em;
      font-weight: 800;
      color: ${t.accentDark};
      margin: 10px 0;
      text-shadow: 2px 2px 0px ${t.shadowLight};
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

    .deity-tag {
      font-size: 1.1em;
      font-weight: 700;
      color: ${t.accentGold};
      margin-bottom: 6px;
      letter-spacing: 0.5px;
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
      color: ${t.accentDark}; 
      margin-top: 4px; 
      opacity: 0.8;
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

    /* 🌟 UX Fix 2: BACK TO INDEX BUTTON */
    .back-to-index {
      display: inline-block;
      margin-top: 30px;
      padding: 10px 24px;
      font-size: 0.95em;
      color: ${t.accentDark};
      text-decoration: none;
      border: 1px solid ${t.accentGold};
      border-radius: 30px;
      background: ${t.chorusBg};
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(0,0,0,0.03);
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

  <!-- Global Background -->
  <div class="global-background">
    <div class="page-frame"></div>
    <div class="page-frame-inner"></div>
    <div class="watermark-center">ॐ</div>
    <!-- 🌟 UX Fix 5: Clickable Footer Link -->
    <div class="running-footer">॥ <a href="https://www.hindibhajanmanjari.com" target="_blank">hindibhajanmanjari.com</a> ॥</div>
  </div>

  <!-- =======================================
       🌟 1. BEAUTIFUL COVER PAGE (WITH LOGO)
       ======================================= -->
  <div class="cover-page">
    <div class="cover-border">
      <img src="${logoUrl}" alt="Hindi Bhajan Manjari" class="cover-logo" />
      <div class="cover-title">${metadata.title || 'भजन संग्रह'}</div>
      <div class="cover-subtitle">दिव्य भजनों और आरतियों का पावन संग्रह</div>
      
      <div class="ornamental-line" style="width: 50%;">
        <div class="line-dash"></div>
        <div class="line-diamond"></div>
        <div class="line-dash"></div>
      </div>
      
      <div class="cover-branding">
        संकलनकर्ता<br/>
        <b>Hindi Bhajan Manjari</b>
      </div>
    </div>
  </div>

  <!-- =======================================
       🌟 2. SMART GROUPED INDEX (WITH ID FOR NAVIGATION)
       ======================================= -->
  <!-- 🌟 ID Added Here For 'Back To Index' Linking -->
  <div id="index-page" class="index-page">
    <div class="index-heading">अनुक्रमणिका (Index)</div>
    
    ${groupedIndex.map(group => `
      <div class="index-deity-section">
        <div class="index-deity-header">॥ ${group.deity} ॥</div>
        <div class="index-list">
          ${group.chapters.map(ch => `
            <a href="#chapter-${ch.globalIndex}" class="index-item">
              <span class="index-text">${ch.globalIndex + 1}. ${ch.titleMain}</span>
              <span class="index-dots"></span>
              <span class="index-click-hint">पढ़ें 🔗</span>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('')}
    
  </div>

  <!-- =======================================
       🌟 3. ORDERED CHAPTERS & DIVIDERS
       ======================================= -->
  ${groupedIndex.map(group => `
    
    <!-- 🌟 UX Fix 3: DEITY SEPARATOR PAGE -->
    <div class="deity-divider-page">
      <div class="deity-divider-border">
        <div class="ornamental-line" style="width: 100%; margin: 0 auto 15px auto;">
          <div class="line-dash"></div><div class="line-diamond"></div><div class="line-dash"></div>
        </div>
        <div class="deity-divider-title">॥ ${group.deity} ॥</div>
        <div class="ornamental-line" style="width: 100%; margin: 15px auto 0 auto;">
          <div class="line-dash"></div><div class="line-diamond"></div><div class="line-dash"></div>
        </div>
      </div>
    </div>

    <!-- 🌟 BHAJANS FOR THIS DEITY -->
    ${group.chapters.map(chapter => `
      <div id="chapter-${chapter.globalIndex}" class="chapter dynamic-chapter layout-single-standard">
        
        <div class="header-branding">
          <div class="deity-tag">॥ ${chapter.extractedDeity} ॥</div>
          <div class="logo-title">${chapter.titleMain}</div>
          ${chapter.titleSecondary ? `<div class="sub-title">${chapter.titleSecondary}</div>` : ''}
          <div class="ornamental-line">
            <div class="line-dash"></div>
            <div class="line-diamond"></div>
            <div class="line-dash"></div>
          </div>
        </div>

        <div class="verses-container">
          ${chapter.verses.map((verse: any) => `
            <div class="verse-box">
              <div class="${verse.type === 'chorus' ? 'verse-chorus' : ''}">
                ${verse.lines.map((line: string) => `<span class="verse-line">${line}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 🌟 UX Fix 2: BACK TO INDEX BUTTON (At the end of each Bhajan) -->
        <div style="text-align: center; margin-top: 25px; page-break-inside: avoid;">
          <a href="#index-page" class="back-to-index">↑ विषय सूची (Index) पर जाएँ</a>
        </div>

      </div>
    `).join('')}

  `).join('')}

</body>
</html>`;
}