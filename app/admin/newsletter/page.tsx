"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getSubscriberCountAction, 
  getSubscribersListAction, 
  removeSubscriberAction, 
  sendTestEmailAction, 
  sendBulkNewsletterAction 
} from '@/app/actions/newsletterActions';
import { 
  FaPaperPlane, FaUsers, FaSpinner, FaCheckCircle, 
  FaExclamationTriangle, FaEnvelope, FaTrash, FaVial, 
  FaChevronLeft, FaChevronRight, FaEye, FaPen,
  FaMobileAlt, FaDesktop, FaBold, FaItalic, FaHeading,
  FaLink, FaListUl, FaQuoteRight, FaDownload, FaMagic,
  FaInfoCircle, FaThLarge, FaRegLightbulb
} from 'react-icons/fa';

// ============================================================================
// 🌟 PRE-BUILT DEVOTIONAL TEMPLATES
// ============================================================================
const TEMPLATES = [
  {
    id: 'app_launch',
    name: '📲 ऐप लॉन्च & डाउनलोड',
    badge: 'Recommended',
    subject: "🌸 खुशखबरी: 'हिंदी भजन मंजरी' का आधिकारिक Android App अब लाइव है — 100% Ad-Free & Offline!",
    content: `<p>सादर प्रणाम भक्तजनों, 🙏</p>

<p>हमें यह बताते हुए अत्यंत हर्ष और गर्व हो रहा है कि आप सभी के अपार स्नेह और सुझावों के बाद, <b>'हिंदी भजन मंजरी'</b> का आधिकारिक <b>Android App</b> अब आपके लिए उपलब्ध हो गया है!</p>

<p>अब नित्य पूजा, संध्या आरती और संकीर्तन के समय आपको इंटरनेट या ब्राउज़र खोलने की आवश्यकता नहीं होगी। आपका संपूर्ण भक्ति संसार अब सीधे आपके मोबाइल फ़ोन में रहेगा।</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; border-collapse: separate; border-spacing: 10px;">
  <tr>
    <td width="50%" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px; vertical-align: top;">
      <div style="font-size: 15px; font-weight: bold; color: #9a3412;">🚫 100% विज्ञापन-मुक्त</div>
      <div style="font-size: 13px; color: #7c2d12; margin-top: 4px;">भक्ति में कोई रुकावट नहीं — कोई कष्टप्रद विज्ञापन (Ads) नहीं।</div>
    </td>
    <td width="50%" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px; vertical-align: top;">
      <div style="font-size: 15px; font-weight: bold; color: #9a3412;">📶 100% ऑफ़लाइन पाठ</div>
      <div style="font-size: 13px; color: #7c2d12; margin-top: 4px;">बिना इंटरनेट के भी सभी भजन, आरती, चालीसा और स्तुतियां पढ़ें।</div>
    </td>
  </tr>
  <tr>
    <td width="50%" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px; vertical-align: top;">
      <div style="font-size: 15px; font-weight: bold; color: #9a3412;">🇮🇳 11 भारतीय लिपियां</div>
      <div style="font-size: 13px; color: #7c2d12; margin-top: 4px;">हिंदी, Hinglish, पंजाबी, गुजराती, बांग्ला, तमिल, तेलुगु आदि।</div>
    </td>
    <td width="50%" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px; vertical-align: top;">
      <div style="font-size: 15px; font-weight: bold; color: #9a3412;">🌙 पूजा डार्क मोड</div>
      <div style="font-size: 13px; color: #7c2d12; margin-top: 4px;">सुबह और रात्रि पूजा के समय आँखों को पूर्ण शांति देने वाला डार्क थीम।</div>
    </td>
  </tr>
</table>

<div style="text-align: center; margin: 32px 0;">
  <a href="https://www.hindibhajanmanjari.com/app" target="_blank" style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 16px 36px; font-size: 17px; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 6px 20px rgba(234, 88, 12, 0.4);">
    📲 अभी Android App डाउनलोड करें
  </a>
  <div style="font-size: 13px; color: #6b7280; margin-top: 10px;">
    आधिकारिक डाउनलोड लिंक: <a href="https://www.hindibhajanmanjari.com/app" style="color: #ea580c; font-weight: bold; text-decoration: underline;">hindibhajanmanjari.com/app</a>
  </div>
</div>

<div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
  <div style="font-size: 14px; font-weight: bold; color: #1e40af; margin-bottom: 4px;">📥 इनस्टॉल कैसे करें? (आसान 2 स्टेप्स)</div>
  <div style="font-size: 13px; color: #1e3a8a; line-height: 1.6;">
    1. ऊपर दिए बटन पर क्लिक करके सीधे हमारी वेबसाइट से सुरक्षित APK डाउनलोड करें।<br/>
    2. डाउनलोड पूरा होने पर फ़ाइल पर टैप करें और <b>'Install'</b> दबाएं। (यदि सुरक्षा चेतावनी आए, तो 'Install Anyway' चुनें)।
  </div>
</div>

<p>इस ऐप को अपनी दैनिक साधना का हिस्सा बनाएं और अपने परिवार व मित्रों के साथ भी साझा करें ताकि वे भी इसका लाभ उठा सकें।</p>

<p style="margin-top: 24px;">
प्रभु कृपा आप सभी पर सदैव बनी रहे!<br/>
<b>सादर आपका,</b><br/>
टीम हिंदी भजन मंजरी 🌺
</p>`
  },
  {
    id: 'daily_bhajan',
    name: '🌸 दैनिक भजन & सुविचार',
    badge: 'Popular',
    subject: "🌸 आज का पावन भजन एवं प्रातः सुविचार — हिंदी भजन मंजरी",
    content: `<p>जय श्री कृष्णा! सादर प्रणाम भक्तजनों, 🙏</p>

<p>आज के शुभ प्रभात में आपके दिन को मंगलमय बनाने के लिए प्रस्तुत है आज का पावन सुविचार और विशेष भजन:</p>

<div style="background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 18px 22px; margin: 20px 0;">
  <div style="font-size: 15px; font-weight: 600; color: #92400e; font-style: italic; line-height: 1.6;">
    "प्रसन्नता ईश्वर की वह कृपा है जो केवल उन्हीं को मिलती है जो सबके कल्याण की कामना करते हैं।"
  </div>
  <div style="font-size: 12px; color: #b45309; margin-top: 8px; font-weight: bold;">
    — आज का आध्यात्मिक विचार
  </div>
</div>

<div style="border: 1px solid #fed7aa; background-color: #fffaf0; border-radius: 14px; padding: 20px; margin: 20px 0; text-align: center;">
  <div style="font-size: 12px; font-weight: bold; color: #ea580c; text-transform: uppercase; letter-spacing: 1px;">आज का विशेष भजन</div>
  <div style="font-size: 18px; font-weight: 800; color: #7c2d12; margin: 6px 0;">श्री राम स्तुति — श्री रामचंद्र कृपालु भजु मन</div>
  <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 8px 0 16px;">
    श्री रामचंद्र कृपालु भजु मन हरण भवभय दारुणम्। नवकंज लोचन कंज मुख कर कंज पद कंजारुणम्॥
  </p>
  <a href="https://www.hindibhajanmanjari.com" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 10px 24px; border-radius: 8px;">
    वेबसाइट पर पूरा भजन पढ़ें &rarr;
  </a>
</div>

<p>आप यह सभी भजन हमारे नए <b>Android App</b> में बिना इंटरनेट के भी पढ़ सकते हैं।</p>

<div style="text-align: center; margin: 24px 0;">
  <a href="https://www.hindibhajanmanjari.com/app" target="_blank" style="background: #ea580c; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 15px; font-weight: bold; border-radius: 8px; display: inline-block;">
    📲 Free App Download करें
  </a>
</div>

<p>आपका दिन शुभ एवं भक्तिमय हो!</p>`
  },
  {
    id: 'festival_special',
    name: '🕉️ एकादशी / पर्व विशेष',
    badge: 'Festivals',
    subject: "🕉️ पावन एकादशी / पर्व की हार्दिक शुभकामनाएं एवं विशेष भजन संग्रह",
    content: `<p>सादर प्रणाम भक्तजनों, 🙏</p>

<p>समस्त <b>हिंदी भजन मंजरी</b> परिवार की ओर से आप सभी को इस पावन पर्व की हार्दिक शुभकामनाएं एवं मंगलकामनाएं!</p>

<div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 18px; margin: 20px 0;">
  <div style="font-size: 16px; font-weight: bold; color: #9a3412; margin-bottom: 6px;">✨ पर्व का आध्यात्मिक महत्व:</div>
  <p style="font-size: 14px; color: #7c2d12; line-height: 1.6; margin: 0;">
    आज का दिन प्रभु भक्ति, नाम जप और आत्म-शुद्धि का सर्वश्रेष्ठ अवसर है। आज के दिन किए गए संकीर्तन और भगवद् आराधना से जीवन के सभी क्लेश मिट जाते हैं और शांति प्राप्त होती है।
  </p>
</div>

<p>आज की विशेष पूजा के लिए हमने वेबसाइट और ऐप पर विशेष आरतियां, चालीसा और स्तुतियों का संग्रह तैयार किया है:</p>

<ul style="padding-left: 20px; line-height: 1.8; color: #374151;">
  <li><b>श्री विष्णु सहस्रनाम एवं स्तुति</b></li>
  <li><b>श्री कृष्ण एवं श्री राम पावन भजन</b></li>
  <li><b>आरती कुंजबिहारी की एवं संपूर्ण आरती संग्रह</b></li>
</ul>

<div style="text-align: center; margin: 28px 0;">
  <a href="https://www.hindibhajanmanjari.com/app" target="_blank" style="background: linear-gradient(135deg, #ea580c, #c2410c); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 10px; display: inline-block; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);">
    📲 पूजा में ऑफ़लाइन पढ़ने हेतु App डाउनलोड करें
  </a>
</div>

<p>प्रभु के श्री चरणों में आपकी भक्ति सदैव प्रगाढ़ रहे!</p>`
  },
  {
    id: 'blank',
    name: '📝 खाली ड्राफ्ट',
    badge: 'Blank',
    subject: '',
    content: `<p>सादर प्रणाम भक्तजनों, 🙏</p>\n\n<p>यहाँ अपना मुख्य संदेश लिखें...</p>`
  }
];

// ============================================================================
// 🌟 1-CLICK COMPONENT SNIPPETS FOR TOOLBAR
// ============================================================================
const SNIPPETS = {
  downloadButton: `<div style="text-align: center; margin: 28px 0;">
  <a href="https://www.hindibhajanmanjari.com/app" target="_blank" style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 16px 36px; font-size: 17px; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);">
    📲 Android App अभी डाउनलोड करें
  </a>
  <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">100% Ad-Free • 100% Offline • Direct APK Download</div>
</div>`,

  featuresGrid: `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; border-collapse: separate; border-spacing: 10px;">
  <tr>
    <td width="50%" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px; vertical-align: top;">
      <div style="font-size: 15px; font-weight: bold; color: #9a3412;">🚫 100% विज्ञापन-मुक्त</div>
      <div style="font-size: 13px; color: #7c2d12; margin-top: 4px;">भक्ति में कोई रुकावट नहीं — कोई कष्टप्रद विज्ञापन (Ads) नहीं।</div>
    </td>
    <td width="50%" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px; vertical-align: top;">
      <div style="font-size: 15px; font-weight: bold; color: #9a3412;">📶 100% ऑफ़लाइन पाठ</div>
      <div style="font-size: 13px; color: #7c2d12; margin-top: 4px;">बिना इंटरनेट के भी सभी भजन, आरती, चालीसा और स्तुतियां पढ़ें।</div>
    </td>
  </tr>
  <tr>
    <td width="50%" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px; vertical-align: top;">
      <div style="font-size: 15px; font-weight: bold; color: #9a3412;">🇮🇳 11 भारतीय लिपियां</div>
      <div style="font-size: 13px; color: #7c2d12; margin-top: 4px;">हिंदी, Hinglish, पंजाबी, गुजराती, बांग्ला, तमिल आदि।</div>
    </td>
    <td width="50%" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px; vertical-align: top;">
      <div style="font-size: 15px; font-weight: bold; color: #9a3412;">🌙 पूजा डार्क मोड</div>
      <div style="font-size: 13px; color: #7c2d12; margin-top: 4px;">सुबह व संध्या आरती के समय आँखों को सुकून देने वाला मोड।</div>
    </td>
  </tr>
</table>`,

  quoteBox: `<div style="background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 18px 22px; margin: 20px 0;">
  <div style="font-size: 16px; font-weight: 600; color: #92400e; font-style: italic; line-height: 1.6;">
    "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥"
  </div>
  <div style="font-size: 13px; color: #b45309; margin-top: 8px; font-weight: 500;">
    — श्रीमद्भगवद्गीता (अध्याय 2, श्लोक 47)
  </div>
</div>`,

  bhajanCard: `<div style="border: 1px solid #fed7aa; background-color: #fffaf0; border-radius: 14px; padding: 20px; margin: 20px 0; text-align: center;">
  <div style="font-size: 12px; font-weight: bold; color: #ea580c; text-transform: uppercase; letter-spacing: 1px;">आज का विशेष भजन</div>
  <div style="font-size: 18px; font-weight: 800; color: #7c2d12; margin: 6px 0;">श्री हनुमान चालीसा (पूर्ण अर्थ सहित)</div>
  <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 8px 0 16px;">
    जय हनुमान ज्ञान गुन सागर। जय कपीस तिहुं लोक उजागर॥
  </p>
  <a href="https://www.hindibhajanmanjari.com" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 10px 22px; border-radius: 8px;">
    पूरा भजन पढ़ें &rarr;
  </a>
</div>`,

  infoBox: `<div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
  <div style="font-size: 14px; font-weight: bold; color: #1e40af; margin-bottom: 4px;">ℹ️ महत्वपूर्ण सूचना / सहायता</div>
  <div style="font-size: 13px; color: #1e3a8a; line-height: 1.6;">
    यदि APK डाउनलोड करते समय 'Install from Unknown Sources' की चेतावनी दिखे, तो 'Allow' या 'Install Anyway' चुनें। यह हमारी आधिकारिक वेबसाइट से 100% सुरक्षित और वायरस-मुक्त फ़ाइल है।
  </div>
</div>`,

  divider: `<div style="text-align: center; margin: 28px 0;">
  <div style="display: inline-block; padding: 4px 18px; background-color: #fff7ed; border-radius: 20px; font-size: 13px; color: #c2410c; border: 1px solid #ffedd5;">
    🌸 ─── ॥ ॐ नमः शिवाय ॥ ─── 🌸
  </div>
</div>`
};

// ============================================================================
// 🌟 QUICK SUBJECT SUGGESTIONS
// ============================================================================
const SUBJECT_SUGGESTIONS = [
  "🌸 खुशखबरी: 'हिंदी भजन मंजरी' का आधिकारिक Android App अब लाइव है — 100% Ad-Free & Offline!",
  "📲 अब बिना इंटरनेट और विज्ञापनों के पढ़ें अपने पसंदीदा भजन — ऐप डाउनलोड करें",
  "🙏 जय श्री कृष्णा: आपका संपूर्ण भक्ति संग्रह अब Android App में उपलब्ध!",
  "✨ विशेष आध्यात्मिक संदेश: नित्य भजन, आरती एवं सुविचार संग्रह"
];

export default function FullNewsletterAdmin() {
  // ==========================================
  // 🌟 STATE MANAGEMENT
  // ==========================================
  const [activeTab, setActiveTab] = useState<'compose' | 'audience'>('compose');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Compose State (Default loaded with App Launch Template!)
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [content, setContent] = useState(TEMPLATES[0].content);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('app_launch');

  // Audience State
  const [subscribers, setSubscribers] = useState<Array<{ email: string; created_at: string }>>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingAudience, setIsLoadingAudience] = useState(true);

  // Textarea Ref for cursor insertion
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ==========================================
  // 🌟 DATA FETCHING
  // ==========================================
  const fetchAudienceData = useCallback(async (page: number) => {
    try {
      const countRes = await getSubscriberCountAction();
      if (countRes.success) setTotalCount(countRes.count);

      const listRes = await getSubscribersListAction(page, 20);
      if (listRes.success) {
        setSubscribers((listRes.subscribers as Array<{ email: string; created_at: string }>) || []);
        setTotalPages(listRes.totalPages || 1);
      }
    } finally {
      setIsLoadingAudience(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const countRes = await getSubscriberCountAction();
      if (isMounted && countRes.success) setTotalCount(countRes.count);

      const listRes = await getSubscribersListAction(currentPage, 20);
      if (isMounted) {
        if (listRes.success) {
          setSubscribers((listRes.subscribers as Array<{ email: string; created_at: string }>) || []);
          setTotalPages(listRes.totalPages || 1);
        }
        setIsLoadingAudience(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 8000); 
  };

  // ==========================================
  // 🌟 TEXT EDITOR HELPERS
  // ==========================================
  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + '\n\n' + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;

    const updated = current.substring(0, start) + textToInsert + current.substring(end);
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + textToInsert.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 50);
  };

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || 'टेक्स्ट';
    const wrapped = before + selected + after;

    const updated = textarea.value.substring(0, start) + wrapped + textarea.value.substring(end);
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const applyTemplate = (templateId: string) => {
    const selected = TEMPLATES.find(t => t.id === templateId);
    if (!selected) return;

    if (content.trim().length > 30) {
      if (!window.confirm("क्या आप इस नए टेम्पलेट को लोड करना चाहते हैं? वर्तमान टेक्स्ट बदल जाएगा।")) return;
    }

    setSubject(selected.subject);
    setContent(selected.content);
    setActiveTemplateId(selected.id);
    showNotification('success', `'${selected.name}' टेम्पलेट लोड कर दिया गया!`);
  };

  // ==========================================
  // 🌟 SMART EMAIL HTML GENERATOR (CLIENT & MOBILE COMPLIANT)
  // ==========================================
  const formatEmailBody = (raw: string) => {
    if (!raw || !raw.trim()) {
      return '<p style="color: #9ca3af; font-style: italic;">यहाँ आपका मुख्य संदेश दिखेगा...</p>';
    }

    const hasBlockHtml = /<\/?(div|p|table|ul|ol|h[1-6]|blockquote|hr)[^>]*>/i.test(raw);
    if (hasBlockHtml) {
      return raw;
    }

    // Convert plain text paragraphs
    return raw
      .split(/\n\s*\n/)
      .map(para => `<p style="margin: 0 0 16px; line-height: 1.75; font-size: 16px; color: #374151;">${para.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  };

  const getFormattedHtml = () => `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject || 'Hindi Bhajan Manjari Newsletter'}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #fdfaf6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Devanagari', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2d3748;">
      <div style="background-color: #fdfaf6; padding: 24px 12px;">
        <!-- Main Email Container -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(217, 119, 6, 0.08); border: 1px solid #fee2e2;">
          
          <!-- Top Saffron Spiritual Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #d97706 100%); background-color: #ea580c; padding: 10px 24px; text-align: center;">
              <span style="color: #fef3c7; font-size: 13px; font-weight: bold; letter-spacing: 2px;">॥ श्री हरिः ॥ &nbsp; ॐ नमः शिवाय &nbsp; ॥ जय श्री राम ॥</span>
            </td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td style="background-color: #fffaf0; padding: 28px 24px 20px; text-align: center; border-bottom: 2px solid #fef3c7;">
              <a href="https://www.hindibhajanmanjari.com" target="_blank" style="text-decoration: none; display: inline-block;">
                <div style="font-size: 26px; font-weight: 900; color: #9a3412; letter-spacing: -0.5px; line-height: 1.2;">
                  हिंदी <span style="color: #ea580c;">भजन</span> मंजरी
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #b45309; margin-top: 4px; letter-spacing: 1px; text-transform: uppercase;">
                  ॥ आध्यात्मिक भजनों एवं स्तुतियों का पवित्र संग्रह ॥
                </div>
              </a>
            </td>
          </tr>

          <!-- Subject Title Banner -->
          <tr>
            <td style="padding: 24px 28px 10px;">
              <h1 style="color: #7c2d12; font-size: 21px; font-weight: 800; line-height: 1.4; margin: 0 0 14px;">
                ${subject || 'यहाँ आपका विषय (Subject) दिखेगा'}
              </h1>
              <div style="height: 3px; width: 60px; background: linear-gradient(to right, #ea580c, #fbbf24); border-radius: 2px;"></div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 16px 28px 28px; font-size: 16px; line-height: 1.75; color: #374151;">
              ${formatEmailBody(content)}
            </td>
          </tr>

          <!-- Devotional Accent Divider -->
          <tr>
            <td style="text-align: center; padding: 0 28px 20px;">
              <div style="display: inline-block; padding: 4px 16px; background-color: #fff7ed; border-radius: 20px; font-size: 13px; color: #c2410c; border: 1px solid #ffedd5;">
                🌸 ─── ॥ सर्वे भवन्तु सुखिनः ॥ ─── 🌸
              </div>
            </td>
          </tr>

          <!-- Quick Action Bar -->
          <tr>
            <td style="background-color: #fffbeb; padding: 20px 24px; text-align: center; border-top: 1px solid #fde68a; border-bottom: 1px solid #fde68a;">
              <div style="font-size: 14px; font-weight: bold; color: #92400e; margin-bottom: 10px;">
                📲 आधिकारिक Android App डाउनलोड करें:
              </div>
              <a href="https://www.hindibhajanmanjari.com/app" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 12px 28px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);">
                ⚡ Get Free Android APK (100% Ad-Free)
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 28px 24px; text-align: center; font-size: 13px; color: #6b7280; line-height: 1.6;">
              <div style="margin-bottom: 12px;">
                <a href="https://www.hindibhajanmanjari.com" style="color: #ea580c; text-decoration: none; font-weight: 600; margin: 0 8px;">होमपेज</a> •
                <a href="https://www.hindibhajanmanjari.com/app" style="color: #ea580c; text-decoration: none; font-weight: 600; margin: 0 8px;">एंड्रॉइड ऐप</a> •
                <a href="https://www.hindibhajanmanjari.com/category/aarti" style="color: #ea580c; text-decoration: none; font-weight: 600; margin: 0 8px;">आरती संग्रह</a> •
                <a href="https://www.hindibhajanmanjari.com/mere-vichar" style="color: #ea580c; text-decoration: none; font-weight: 600; margin: 0 8px;">दैनिक सुविचार</a>
              </div>
              <p style="margin: 0 0 8px; font-size: 12px;">
                आप यह ईमेल इसलिए प्राप्त कर रहे हैं क्योंकि आप <b>Hindi Bhajan Manjari</b> परिवार के सम्मानित सदस्य हैं।
              </p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                © 2026 Hindi Bhajan Manjari • सर्वाधिकार सुरक्षित
              </p>
            </td>
          </tr>

        </table>
      </div>
    </body>
    </html>
  `;

  // ==========================================
  // 🌟 SEND HANDLERS
  // ==========================================
  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content || !testEmail) {
      return showNotification('error', 'Subject, Content, और Test Email भरना अनिवार्य है।');
    }
    
    setIsTesting(true);
    const res = await sendTestEmailAction(testEmail, subject, getFormattedHtml());
    if (res.success) {
      showNotification('success', `टेस्ट ईमेल ${testEmail} पर सफलतापूर्वक भेज दिया गया! इनबॉक्स चेक करें।`);
    } else {
      showNotification('error', `टेस्ट ईमेल फेल: ${res.error}`);
    }
    setIsTesting(false);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) {
      return showNotification('error', 'Subject और Content भरना अनिवार्य है।');
    }
    
    if (!window.confirm(`⚠️ चेतावनी: क्या आप सच में ${totalCount} सब्सक्राइबर्स को यह ईमेल ब्रॉडकास्ट (Broadcast) करना चाहते हैं?`)) {
      return;
    }

    setIsBroadcasting(true);
    const res = await sendBulkNewsletterAction(subject, getFormattedHtml());
    
    if (res.success) {
      showNotification('success', `🎉 बधाई हो! ${res.totalSent} सब्सक्राइबर्स को आपका न्यूज़लेटर सफलतापूर्वक भेज दिया गया।`);
      setViewMode('edit');
    } else {
      showNotification('error', `ब्रॉडकास्ट फेल: ${res.error}`);
    }
    setIsBroadcasting(false);
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!window.confirm(`क्या आप ${email} को लिस्ट से हटाना चाहते हैं?`)) return;
    
    const res = await removeSubscriberAction(email);
    if (res.success) {
      showNotification('success', `${email} को सब्सक्राइबर्स लिस्ट से हटा दिया गया है।`);
      fetchAudienceData(currentPage);
    } else {
      showNotification('error', `डिलीट करने में समस्या हुई: ${res.error}`);
    }
  };

  // ==========================================
  // 🌟 RENDER UI
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans">
      
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
              Pro Studio v2.0
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mt-1">
            Newsletter HQ & Email Studio
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            आकर्षक एवं भक्तिमय ईमेल डिज़ाइन करें, टेस्ट करें और पाठकों को ब्रॉडकास्ट करें।
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-orange-500/20 text-white">
          <FaUsers size={28} className="opacity-90" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Total Subscribers</p>
            <p className="text-2xl font-black leading-none">{totalCount}</p>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-xl font-bold flex items-center gap-3 border shadow-sm animate-fade-in-up ${
          message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
        }`}>
          {message.type === 'success' ? <FaCheckCircle size={18} /> : <FaExclamationTriangle size={18} />}
          {message.text}
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('compose')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'compose' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <FaPaperPlane /> Compose & Design
        </button>
        <button 
          onClick={() => setActiveTab('audience')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'audience' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <FaUsers /> Audience List ({totalCount})
        </button>
      </div>

      {/* ==========================================
          TAB 1: COMPOSE & SEND STUDIO
          ========================================== */}
      {activeTab === 'compose' && (
        <div className="space-y-6">
          
          {/* 🌟 1. TEMPLATES SELECTOR BAR */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <FaMagic className="text-orange-500" /> 1-Click Pre-Built Templates (रेडीमेड टेम्पलेट्स)
              </span>
              <span className="text-xs text-gray-400">क्लिक करते ही पूरा डिज़ाइन लोड हो जाएगा</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    activeTemplateId === t.id 
                      ? 'border-orange-500 bg-orange-50/50 shadow-sm ring-2 ring-orange-500/20' 
                      : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-orange-600 border border-orange-200">
                      {t.badge}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-gray-900 mt-2">{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 🌟 2. MAIN EDITOR & PREVIEW */}
            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
              
              {/* View Mode Toggle Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-3">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setViewMode('edit')}
                    className={`flex items-center gap-2 font-bold pb-2 border-b-2 transition-all ${
                      viewMode === 'edit' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FaPen size={14} /> Write & Edit
                  </button>
                  <button 
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-2 font-bold pb-2 border-b-2 transition-all ${
                      viewMode === 'preview' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FaEye size={14} /> Live Email Preview
                  </button>
                </div>

                {/* Device Switcher in Preview Mode */}
                {viewMode === 'preview' && (
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        previewDevice === 'desktop' ? 'bg-white text-orange-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <FaDesktop size={12} /> Desktop (600px)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        previewDevice === 'mobile' ? 'bg-white text-orange-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <FaMobileAlt size={12} /> Mobile Phone (375px)
                    </button>
                  </div>
                )}
              </div>

              {viewMode === 'edit' ? (
                <div className="space-y-6">
                  
                  {/* SUBJECT FIELD */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subject (ईमेल का विषय)
                    </label>
                    <input 
                      type="text" 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="उदा: आज के नए भजन और सुविचार..."
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-800"
                    />

                    {/* Quick Subject Suggestions */}
                    <div className="mt-2.5">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <FaRegLightbulb className="text-amber-500" /> सुझाए गए विषय (Click to Apply):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {SUBJECT_SUGGESTIONS.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSubject(s)}
                            className="text-left text-xs bg-orange-50/70 hover:bg-orange-100/70 text-orange-800 px-2.5 py-1 rounded-lg border border-orange-200/60 transition-colors"
                          >
                            {s.length > 55 ? s.slice(0, 55) + '...' : s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 🌟 3. RICH VISUAL BLOCKS INSERTION TOOLBAR */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                        <FaThLarge className="text-orange-500" /> 1-Click Visual Blocks (क्लिक करके जोड़ें):
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400">
                        कर्सर की जगह पर इन्सर्ट होगा
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 p-2.5 bg-orange-50/40 rounded-xl border border-orange-100">
                      <button
                        type="button"
                        onClick={() => insertAtCursor(SNIPPETS.downloadButton)}
                        className="flex items-center gap-1.5 bg-white hover:bg-orange-50 text-orange-800 border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-95"
                      >
                        <FaDownload className="text-orange-600" /> + 📲 डाउनलोड बटन
                      </button>

                      <button
                        type="button"
                        onClick={() => insertAtCursor(SNIPPETS.featuresGrid)}
                        className="flex items-center gap-1.5 bg-white hover:bg-orange-50 text-orange-800 border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-95"
                      >
                        <FaThLarge className="text-orange-600" /> + 📦 4-फीचर्स ग्रिड
                      </button>

                      <button
                        type="button"
                        onClick={() => insertAtCursor(SNIPPETS.quoteBox)}
                        className="flex items-center gap-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-95"
                      >
                        <FaQuoteRight className="text-amber-600" /> + 🌸 सुविचार बॉक्स
                      </button>

                      <button
                        type="button"
                        onClick={() => insertAtCursor(SNIPPETS.bhajanCard)}
                        className="flex items-center gap-1.5 bg-white hover:bg-orange-50 text-orange-800 border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-95"
                      >
                        + 🎵 भजन कार्ड
                      </button>

                      <button
                        type="button"
                        onClick={() => insertAtCursor(SNIPPETS.infoBox)}
                        className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-95"
                      >
                        <FaInfoCircle className="text-blue-600" /> + 📌 सूचना बॉक्स
                      </button>

                      <button
                        type="button"
                        onClick={() => insertAtCursor(SNIPPETS.divider)}
                        className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-95"
                      >
                        + ➖ डिवाइर
                      </button>
                    </div>
                  </div>

                  {/* 🌟 4. INLINE FORMATTING TOOLBAR & MESSAGE TEXTAREA */}
                  <div>
                    <div className="flex items-center justify-between bg-gray-100 p-2 rounded-t-xl border border-b-0 border-gray-200">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => wrapSelection('<b>', '</b>')}
                          title="Bold (गहरा)"
                          className="p-2 hover:bg-white rounded text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <FaBold size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => wrapSelection('<i>', '</i>')}
                          title="Italic (तिरछा)"
                          className="p-2 hover:bg-white rounded text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <FaItalic size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => wrapSelection('<h3 style="color: #9a3412; margin: 18px 0 8px;">', '</h3>')}
                          title="Heading 3"
                          className="p-2 hover:bg-white rounded text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <FaHeading size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = window.prompt("लिंक (URL) डालें:", "https://www.hindibhajanmanjari.com/app");
                            if (url) wrapSelection(`<a href="${url}" target="_blank" style="color: #ea580c; font-weight: bold; text-decoration: underline;">`, '</a>');
                          }}
                          title="Insert Link"
                          className="p-2 hover:bg-white rounded text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <FaLink size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertAtCursor('<ul style="padding-left: 20px; line-height: 1.8;">\n  <li>बिंदु 1</li>\n  <li>बिंदु 2</li>\n</ul>')}
                          title="Bullet List"
                          className="p-2 hover:bg-white rounded text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <FaListUl size={13} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-500">
                          Supports Plain Text & HTML
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("क्या आप संदेश खाली करना चाहते हैं?")) setContent('');
                          }}
                          className="text-[11px] text-red-500 hover:text-red-700 font-bold px-2 py-1 hover:bg-red-50 rounded"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <textarea 
                      ref={textareaRef}
                      rows={14} 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="यहाँ अपना न्यूज़लेटर संदेश लिखें... (Enter दबाने पर नई लाइन अपने आप बन जाएगी, या ऊपर दिए गए 1-Click बटन्स से सुंदर कार्ड्स जोड़ें)"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-b-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-mono text-sm leading-relaxed text-gray-800 resize-y"
                    ></textarea>

                    <div className="flex justify-between items-center text-xs text-gray-400 mt-1.5 px-1">
                      <span>अक्षर (Characters): {content.length}</span>
                      <span>सुझाव: &ldquo;Live Email Preview&rdquo; टैब दबाकर मोबाइल और डेस्कटॉप लुक देखें</span>
                    </div>
                  </div>

                </div>
              ) : (
                /* 🌟 5. LIVE PREVIEW RENDERER (DESKTOP & MOBILE FRAME) */
                <div className="bg-gray-100 p-4 md:p-8 rounded-2xl flex justify-center overflow-x-auto min-h-[500px]">
                  {previewDevice === 'desktop' ? (
                    <div className="w-full max-w-[620px] shadow-lg rounded-2xl overflow-hidden bg-white">
                      <div 
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: getFormattedHtml() }} 
                      />
                    </div>
                  ) : (
                    /* SMARTPHONE MOCKUP FRAME */
                    <div className="w-[380px] bg-gray-900 p-3.5 rounded-[40px] shadow-2xl border-4 border-gray-800">
                      {/* Top Phone Speaker / Camera Island */}
                      <div className="flex justify-center mb-2">
                        <div className="w-24 h-4 bg-black rounded-full"></div>
                      </div>
                      <div className="bg-white rounded-[28px] overflow-hidden max-h-[640px] overflow-y-auto">
                        <div 
                          className="w-full"
                          dangerouslySetInnerHTML={{ __html: getFormattedHtml() }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 🌟 6. ACTION COLUMN (TEST & BROADCAST) */}
            <div className="space-y-6">
              
              {/* Step 1: Test Email */}
              <div className="bg-blue-50/60 p-6 rounded-[2rem] border border-blue-100 shadow-sm">
                <h3 className="font-black text-blue-900 mb-2 flex items-center gap-2">
                  <FaVial className="text-blue-500" /> 1. Send Test Draft
                </h3>
                <p className="text-xs text-blue-700 mb-4 font-medium leading-relaxed">
                  सबको भेजने से पहले खुद के ईमेल पर भेजकर बटन, फॉन्ट और लुक चेक करें।
                </p>
                <form onSubmit={handleTestSend} className="space-y-3">
                  <input 
                    type="email" 
                    value={testEmail} 
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="आपका पर्सनल ईमेल..." 
                    required
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl outline-none text-sm font-medium focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  />
                  <button 
                    type="submit" 
                    disabled={isTesting} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isTesting ? <FaSpinner className="animate-spin" /> : <FaEnvelope />} 
                    {isTesting ? 'Sending Test Draft...' : 'Send Test Draft'}
                  </button>
                </form>
              </div>

              {/* Step 2: Broadcast */}
              <div className="bg-orange-50/60 p-6 rounded-[2rem] border border-orange-100 shadow-sm">
                <h3 className="font-black text-orange-900 mb-2 flex items-center gap-2">
                  <FaPaperPlane className="text-orange-500" /> 2. Broadcast to All
                </h3>
                <p className="text-xs text-orange-700 mb-4 font-medium leading-relaxed">
                  यह बटन दबाते ही यह सुंदर ईमेल आपके सभी <b>{totalCount}</b> सब्सक्राइबर्स के इनबॉक्स में तुरंत चला जाएगा।
                </p>
                <button 
                  onClick={handleBroadcast} 
                  disabled={isBroadcasting || totalCount === 0}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-xl font-black text-sm shadow-[0_4px_15px_rgba(234,88,12,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(234,88,12,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isBroadcasting ? <FaSpinner className="animate-spin text-lg" /> : 'Send Live Broadcast'}
                </button>
              </div>

              {/* Quick Summary / Safety Card */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/70 text-xs text-gray-500 space-y-2">
                <div className="font-bold text-gray-700 flex items-center gap-1.5">
                  <FaInfoCircle className="text-orange-500" /> प्रो टिप्स:
                </div>
                <p>• जीमेल (Gmail) और आउटलुक (Outlook) दोनों पर यह ईमेल 100% रिस्पॉन्सिव दिखेगा।</p>
                <p>• डाउनलोड बटन पर क्लिक करने पर सीधे <code>hindibhajanmanjari.com/app</code> खुलेगा।</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: AUDIENCE MANAGER
          ========================================== */}
      {activeTab === 'audience' && (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-gray-900">Subscriber Database</h2>
              <p className="text-xs text-gray-500 mt-1">कुल {totalCount} सब्सक्राइबर्स जुड़े हुए हैं।</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500">
                  <th className="p-4 pl-8 font-bold">Email Address</th>
                  <th className="p-4 font-bold">Joined Date</th>
                  <th className="p-4 pr-8 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingAudience ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-400 font-medium"><FaSpinner className="animate-spin inline text-xl mr-2"/> Loading data...</td></tr>
                ) : subscribers.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-400 font-medium">कोई सब्सक्राइबर नहीं मिला।</td></tr>
                ) : (
                  subscribers.map((sub, i) => (
                    <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 pl-8 font-semibold text-gray-800">{sub.email}</td>
                      <td className="p-4 text-sm font-medium text-gray-500">
                        {new Date(sub.created_at).toLocaleDateString('hi-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4 pr-8 text-right">
                        <button 
                          onClick={() => handleDeleteSubscriber(sub.email)}
                          className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove Subscriber"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-100"
              >
                <FaChevronLeft /> Previous
              </button>
              <span className="text-sm font-bold text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-100"
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
