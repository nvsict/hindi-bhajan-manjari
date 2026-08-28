// ==========================================
// 🎨 PRINT THEMES CONFIGURATION (Smart Engine Compatible)
// ==========================================

export const printThemes = {
  // 1. क्लासिक थीम (Classic Gutka)
  default: {
    colors: {
      background: '#FFFFFF',
      textMain: '#2C1810',
      accentGold: '#D97706',
      accentDark: '#9A3412',
      borderLight: '#FDBA74',
      shadowLight: 'rgba(253, 186, 116, 0.4)',
      columnDivider: 'rgba(217, 119, 6, 0.25)',
      chorusBg: 'rgba(253, 186, 116, 0.12)',
    }
  },

  // 2. सावन थीम (Green & Divine - शिवजी के लिए)
  sawan: {
    colors: {
      background: '#F0FFF4',             // हल्का हरा (Mint Green)
      textMain: '#064E3B',               // गहरा हरा (Dark Emerald)
      accentGold: '#10B981',             // पन्ना हरा (Emerald Accent)
      accentDark: '#047857',             // शिव-तत्व हरा (Deep Green)
      borderLight: '#6EE7B7',            // लाइट ग्रीन बॉर्डर
      shadowLight: 'rgba(110, 231, 183, 0.4)',
      columnDivider: 'rgba(16, 185, 129, 0.25)',
      chorusBg: 'rgba(110, 231, 183, 0.15)',
    }
  },

  // 3. नवरात्रि / दीवाली थीम (Red & Gold - देवी माँ के लिए)
  navratri: {
    colors: {
      background: '#FFF5F5',             // हल्का लाल/गुलाबी
      textMain: '#450A0A',               // गहरा कत्थई (Maroon)
      accentGold: '#F59E0B',             // पीला/स्वर्ण (Gold)
      accentDark: '#DC2626',             // लाल (Red)
      borderLight: '#FCA5A5',
      shadowLight: 'rgba(245, 158, 11, 0.4)',
      columnDivider: 'rgba(245, 158, 11, 0.25)',
      chorusBg: 'rgba(254, 226, 226, 0.5)',
    }
  }
};

// ==========================================
// 📏 GLOBAL LAYOUT CONFIGURATION
// ==========================================
export const layoutConfig = {
  // A4 पेज मार्जिन्स
  pageMargin: '22mm 16mm',
  
  // बैकग्राउंड फ्रेम के लिए ऑफसेट
  globalOffsetTB: '-22mm',
  globalOffsetLR: '-16mm',
  
  // फुटर की पोज़िशन
  footerBottom: '9mm',
  
  // 🌟 Puppeteer Measurement Limit
  // A4 (1123px) - Top/Bottom Margins (~166px) = 957px (Safe: 960px)
  maxSafeHeightPx: 960, 
};