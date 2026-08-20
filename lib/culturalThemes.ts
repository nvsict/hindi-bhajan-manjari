// ==========================================
// 🌟 CULTURAL THEME DICTIONARY (Regional UI Vibe)
// ==========================================

export interface CulturalTheme {
  id: string;
  name: string;
  vibe: string;
  colors: {
    background: string;       // मेन लिरिक्स कंटेनर का बैकग्राउंड
    border: string;           // कंटेनर का बॉर्डर
    wordHoverBg: string;      // शब्दों पर हॉवर/क्लिक करने का बैकग्राउंड
    textHover: string;        // शब्दों का हॉवर टेक्स्ट कलर
    divider: string;          // श्लोकों के बीच की लाइन का ग्रेडिएंट
    dropdownActive: string;   // ड्रॉपडाउन में सिलेक्टेड भाषा का रंग
  };
}

export const CULTURAL_THEMES: Record<string, CulturalTheme> = {
  
  // 🕉️ 1. Sanatan Classic (Saffron & Sandalwood)
  // उपयोग: देवनागरी, गुजराती, ओड़िया
  devanagari: {
    id: 'devanagari',
    name: 'Sanatan Classic',
    vibe: 'Ayodhya & Kashi',
    colors: {
      background: 'bg-orange-50/30',
      border: 'border-orange-100/50',
      wordHoverBg: 'active:bg-orange-200/80 lg:hover:bg-orange-100/60',
      textHover: 'lg:hover:text-orange-700',
      divider: 'from-transparent via-orange-300 to-transparent',
      dropdownActive: 'bg-orange-50 text-orange-600'
    }
  },
  gujarati: {
    id: 'gujarati',
    name: 'Sanatan Classic',
    vibe: 'Dwarka & Somnath',
    colors: {
      background: 'bg-orange-50/30',
      border: 'border-orange-100/50',
      wordHoverBg: 'active:bg-orange-200/80 lg:hover:bg-orange-100/60',
      textHover: 'lg:hover:text-orange-700',
      divider: 'from-transparent via-orange-300 to-transparent',
      dropdownActive: 'bg-orange-50 text-orange-600'
    }
  },
  oriya: {
    id: 'oriya',
    name: 'Sanatan Classic',
    vibe: 'Jagannath Puri',
    colors: {
      background: 'bg-orange-50/30',
      border: 'border-orange-100/50',
      wordHoverBg: 'active:bg-orange-200/80 lg:hover:bg-orange-100/60',
      textHover: 'lg:hover:text-orange-700',
      divider: 'from-transparent via-orange-300 to-transparent',
      dropdownActive: 'bg-orange-50 text-orange-600'
    }
  },

  // 🌺 2. Shakti Vibe (Alta Red & Sindoor)
  // उपयोग: बंगला, असमिया
  bengali: {
    id: 'bengali',
    name: 'Shakti Vibe',
    vibe: 'Dakshineswar & Durga Puja',
    colors: {
      background: 'bg-rose-50/30',
      border: 'border-rose-100/50',
      wordHoverBg: 'active:bg-rose-200/80 lg:hover:bg-rose-100/60',
      textHover: 'lg:hover:text-rose-700',
      divider: 'from-transparent via-rose-300 to-transparent',
      dropdownActive: 'bg-rose-50 text-rose-600'
    }
  },
  assamese: {
    id: 'assamese',
    name: 'Shakti Vibe',
    vibe: 'Kamakhya Peeth',
    colors: {
      background: 'bg-rose-50/30',
      border: 'border-rose-100/50',
      wordHoverBg: 'active:bg-rose-200/80 lg:hover:bg-rose-100/60',
      textHover: 'lg:hover:text-rose-700',
      divider: 'from-transparent via-rose-300 to-transparent',
      dropdownActive: 'bg-rose-50 text-rose-600'
    }
  },

  // 🪯 3. Khalsa Vibe (Golden Amber)
  // उपयोग: पंजाबी (Gurmukhi)
  gurmukhi: {
    id: 'gurmukhi',
    name: 'Khalsa Vibe',
    vibe: 'Golden Temple (Harmandir Sahib)',
    colors: {
      background: 'bg-amber-50/30',
      border: 'border-amber-200/40',
      wordHoverBg: 'active:bg-amber-200/80 lg:hover:bg-amber-100/60',
      textHover: 'lg:hover:text-amber-700',
      divider: 'from-transparent via-amber-400 to-transparent',
      dropdownActive: 'bg-amber-50 text-amber-600'
    }
  },

  // 🛕 4. Dravidian Vibe (Kumkum & Turmeric)
  // उपयोग: तमिल, तेलुगु
  tamil: {
    id: 'tamil',
    name: 'Dravidian Vibe',
    vibe: 'Meenakshi Amman',
    colors: {
      background: 'bg-yellow-50/30',
      border: 'border-yellow-200/50',
      wordHoverBg: 'active:bg-yellow-200/80 lg:hover:bg-yellow-100/60',
      textHover: 'lg:hover:text-yellow-700',
      divider: 'from-transparent via-yellow-400 to-transparent',
      dropdownActive: 'bg-yellow-50 text-yellow-700'
    }
  },
  telugu: {
    id: 'telugu',
    name: 'Dravidian Vibe',
    vibe: 'Tirupati Balaji',
    colors: {
      background: 'bg-yellow-50/30',
      border: 'border-yellow-200/50',
      wordHoverBg: 'active:bg-yellow-200/80 lg:hover:bg-yellow-100/60',
      textHover: 'lg:hover:text-yellow-700',
      divider: 'from-transparent via-yellow-400 to-transparent',
      dropdownActive: 'bg-yellow-50 text-yellow-700'
    }
  },

  // 🌿 5. Coastal Vibe (Emerald & Sandalwood)
  // उपयोग: मलयालम, कन्नड़
  malayalam: {
    id: 'malayalam',
    name: 'Coastal Vibe',
    vibe: 'Kerala Temples',
    colors: {
      background: 'bg-emerald-50/30',
      border: 'border-emerald-100/50',
      wordHoverBg: 'active:bg-emerald-200/80 lg:hover:bg-emerald-100/60',
      textHover: 'lg:hover:text-emerald-700',
      divider: 'from-transparent via-emerald-300 to-transparent',
      dropdownActive: 'bg-emerald-50 text-emerald-600'
    }
  },
  kannada: {
    id: 'kannada',
    name: 'Coastal Vibe',
    vibe: 'Mysore Sandalwood',
    colors: {
      background: 'bg-emerald-50/30',
      border: 'border-emerald-100/50',
      wordHoverBg: 'active:bg-emerald-200/80 lg:hover:bg-emerald-100/60',
      textHover: 'lg:hover:text-emerald-700',
      divider: 'from-transparent via-emerald-300 to-transparent',
      dropdownActive: 'bg-emerald-50 text-emerald-600'
    }
  },

  // 💻 6. Modern Seeker (Indigo / Neutral)
  // उपयोग: Hinglish
  hinglish: {
    id: 'hinglish',
    name: 'Modern Seeker',
    vibe: 'Digital & Neutral',
    colors: {
      background: 'bg-indigo-50/30',
      border: 'border-indigo-100/50',
      wordHoverBg: 'active:bg-indigo-200/80 lg:hover:bg-indigo-100/60',
      textHover: 'lg:hover:text-indigo-700',
      divider: 'from-transparent via-indigo-200 to-transparent',
      dropdownActive: 'bg-indigo-50 text-indigo-600'
    }
  }
};

// फॉलबैक के लिए एक डिफ़ॉल्ट थीम भी एक्सपोर्ट कर लेते हैं
export const DEFAULT_THEME = CULTURAL_THEMES['devanagari'];