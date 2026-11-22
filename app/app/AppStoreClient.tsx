"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaAndroid,
  FaArrowLeft,
  FaArrowRight,
  FaBell,
  FaBookOpen,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaCloudDownloadAlt,
  FaCopy,
  FaDownload,
  FaGlobeAsia,
  FaHandHoldingHeart,
  FaHeart,
  FaInfoCircle,
  FaLock,
  FaMicrophoneAlt,
  FaMoon,
  FaPalette,
  FaRedo,
  FaShieldAlt,
  FaSyncAlt,
  FaTimes,
  FaWifi,
} from "react-icons/fa";
import type { AppReleaseManifest } from "@/lib/appRelease";

type Lang = "hi" | "en";

interface AppStoreClientProps {
  release: AppReleaseManifest;
}

interface PreviewSlide {
  id: string;
  labelHi: string;
  labelEn: string;
  captionHi: string;
  captionEn: string;
  darkFrame?: boolean;
}

const PREVIEW_SLIDES: PreviewSlide[] = [
  {
    id: "home",
    labelHi: "होम व त्योहार विशेष",
    labelEn: "Home & Festival Mode",
    captionHi:
      "पंचांग के अनुसार स्वतः बदलती त्योहार थीम, आज का पावन भजन और त्वरित खोज",
    captionEn:
      "Auto-adapting Panchang festival banner, daily bhajan, and sticky quick search",
  },
  {
    id: "reader",
    labelHi: "11 लिपि व शब्दकोश",
    labelEn: "11 Scripts & Dictionary",
    captionHi:
      "किसी भी शब्द पर टैप करके अर्थ जानें, फ़ॉन्ट ज़ूम करें और स्क्रीन को ऑन रखें",
    captionEn:
      "Tap any word for instant meaning, switch between 11 Indian scripts, and zoom text",
  },
  {
    id: "sangrah",
    labelHi: "ऑफ़लाइन संग्रह व सिंक",
    labelEn: "Offline Sangrah & Sync",
    captionHi:
      "सहेजे गए व हाल के 20 भजन बिना इंटरनेट पढ़ें — 2 डिवाइस पर स्वतः क्लाउड सिंक",
    captionEn:
      "Saved & recent 20 bhajans always ready offline with 2-device cloud sync",
  },
  {
    id: "artists",
    labelHi: "भक्ति कलाकार",
    labelEn: "Artists Directory",
    captionHi:
      "अपने पसंदीदा गायक व गीतकार के अनुसार संपूर्ण भजन सूची एक स्थान पर",
    captionEn:
      "Browse complete singer and lyricist discographies with role filters",
  },
  {
    id: "dark",
    labelHi: "पूजा संध्या डार्क मोड",
    labelEn: "Pooja Sandhya Dark Mode",
    captionHi:
      "संध्या आरती व रात्रि पाठ के लिए आँखों को सुकून देने वाला गहन डार्क मोड",
    captionEn:
      "Calm low-glare reading theme crafted for evening aarti and night recitation",
    darkFrame: true,
  },
];

const COPY = {
  hi: {
    breadcrumbHome: "मुख्य पृष्ठ",
    breadcrumbApp: "एंड्रॉइड ऐप",
    heroEyebrow: "आधिकारिक एंड्रॉइड ऐप · hindibhajanmanjari.com",
    heroHeading: "हिंदी भजन मंजरी ऐप",
    heroSub: "भक्ति अब हर पल आपके साथ — बिना इंटरनेट, 11 भारतीय लिपियों में।",
    officialBadge: "100% सत्यापित आधिकारिक APK",
    downloadBtn: "Android APK डाउनलोड करें",
    downloadPendingBtn: "APK डाउनलोड व इंस्टॉल गाइड देखें",
    installGuideBtn: "इंस्टॉल चरण देखें",
    stableLabel: "आधिकारिक स्थिर संस्करण",
    metaVersion: "संस्करण",
    metaSize: "आकार",
    metaAndroid: "एंड्रॉइड",
    metaScripts: "लिपियाँ",
    metaScriptsVal: "11 भारतीय",
    trustLine:
      "सीधे hindibhajanmanjari.com से डिजिटल हस्ताक्षरित (Signed) APK — Play Store के बिना सुरक्षित इंस्टॉल।",
    playNoteBadge: "हमारा ईमानदार निवेदन",
    playNoteTitle: "यह ऐप अभी Google Play Store पर क्यों नहीं है?",
    playNoteBody:
      "हिंदी भजन मंजरी ब्रज भूमि से एक स्वतंत्र भक्ति पहल है। Google Play Console पर ऐप प्रकाशित करने के लिए $25 (लगभग ₹2,100) का one-time शुल्क लगता है, जिसे हम फिलहाल वहन नहीं कर पा रहे हैं — इसलिए यह आधिकारिक ऐप अभी सीधे हमारी वेबसाइट से सुरक्षित Signed APK के रूप में उपलब्ध है।",
    playNoteBody2:
      "यदि यह ऐप आपकी दैनिक पूजा में सहायक है और आप इसे और बेहतर बनाने व जल्द ही Google Play Store पर लाने में हमारा साथ देना चाहते हैं, तो अपनी श्रद्धा से छोटा-सा योगदान (Donate) कर सकते हैं।",
    playNoteCta: "Play Store लॉन्च के लिए सहयोग (Donate) करें",
    secPreviews: "ऐप की झलक",
    secPreviewsSub: "बाएँ-दाएँ स्वाइप करके वास्तविक मोबाइल स्क्रीन देखें",
    secAbout: "इस ऐप के बारे में",
    aboutP1:
      "हिंदी भजन मंजरी एंड्रॉइड ऐप को दैनिक पूजा, सुबह-संध्या आरती, सत्संग और यात्रा के दौरान शांतिपूर्ण भजन पाठ के लिए बनाया गया है। बिना भारी विज्ञापनों या उलझे मेनू के, यह ऐप आपको देवनागरी और 10 अन्य भारतीय लिपियों में प्रामाणिक बोल और भावार्थ देता है।",
    aboutP2:
      "वरिष्ठ जनों के लिए बड़ा फ़ॉन्ट ज़ूम, मंदिर या यात्रा के लिए 100% ऑफ़लाइन संग्रह, और 2 फ़ोन तक सुरक्षित क्लाउड सिंक इसे हर सनातन परिवार का विश्वसनीय साथी बनाते हैं।",
    secFeatures: "मुख्य विशेषताएँ",
    secInstall: "डाउनलोड के बाद 4 आसान चरणों में इंस्टॉल करें",
    secInstallSub:
      "हर चरण का चित्र देखकर कोई भी व्यक्ति 30 सेकंड में ऐप इंस्टॉल कर सकता है",
    secWhatsNew: "नया क्या है (Changelog)",
    secTech: "तकनीकी विवरण व सुरक्षा",
    techPackage: "पैकेज आईडी",
    techVersion: "नवीनतम संस्करण",
    techSize: "फ़ाइल आकार",
    techMinAndroid: "न्यूनतम Android",
    techArch: "आर्किटेक्चर",
    techDate: "रिलीज़ तिथि",
    techSource: "आधिकारिक स्रोत",
    shaLabel: "SHA-256 चेकसम (फ़ाइल सत्यापन)",
    copyBtn: "कॉपी करें",
    copiedBtn: "कॉपी हो गया",
    permTitle: "अनुमतियाँ एवं गोपनीयता",
    permDesc:
      "हम केवल वही न्यूनतम अनुमतियाँ माँगते हैं जो भजन पाठ और रिमाइंडर के लिए आवश्यक हैं। कोई कॉन्टैक्ट्स, लोकेशन या एड ट्रैकर नहीं।",
    secUpdatesTitle: "भविष्य के अपडेट अपने आप कैसे मिलेंगे",
    secUpdatesBody:
      "छोटे सुधार, नए त्योहार थीम और बग-फ़िक्स ऐप के अंदर स्वतः (Instant OTA) लागू हो जाते हैं। नए APK संस्करण के आने पर ऐप के मेनू → 'ऐप अपडेट जाँचें' में सीधा अपडेट लिंक दिखता है।",
    secFaq: "अक्सर पूछे जाने वाले प्रश्न (FAQ)",
    stickyBtn: "APK डाउनलोड",
    footerHelp: "इंस्टॉल या सब्सक्रिप्शन में किसी सहायता के लिए हमसे संपर्क करें",
    footerPrivacy: "गोपनीयता नीति",
    footerTerms: "नियम व शर्तें",
    footerContact: "संपर्क करें",
    // Post-download overlay copy
    modalStartedTitle: "डाउनलोड शुरू हो गया है",
    modalStartedSub:
      "जब तक फ़ाइल डाउनलोड हो रही है, नीचे के 4 सरल चित्र चरण देख लें:",
    modalPreviewTitle: "इंस्टॉल गाइड (Signed APK शीघ्र उपलब्ध)",
    modalPreviewSub:
      "पहला Signed v1.0.0 APK अंतिम जाँच में है। रिलीज़ होते ही इसी बटन से सीधा डाउनलोड शुरू होगा — देखें इंस्टॉल प्रक्रिया कितनी सरल है:",
    modalDownloadAgain: "डाउनलोड शुरू न हो तो यहाँ टैप करें",
    modalPrev: "पिछला",
    modalNext: "अगला चरण",
    modalDone: "समझ गया, बंद करें",
  },
  en: {
    breadcrumbHome: "Home",
    breadcrumbApp: "Android App",
    heroEyebrow: "Official Android App · hindibhajanmanjari.com",
    heroHeading: "Hindi Bhajan Manjari App",
    heroSub: "Daily bhajans, aartis & chalisas — 100% offline in 11 Indian scripts.",
    officialBadge: "100% Verified Official Signed APK",
    downloadBtn: "Download Android APK",
    downloadPendingBtn: "Download APK & View Install Steps",
    installGuideBtn: "See install steps",
    stableLabel: "Official Stable Release",
    metaVersion: "Version",
    metaSize: "Size",
    metaAndroid: "Android",
    metaScripts: "Scripts",
    metaScriptsVal: "11 Indic",
    trustLine:
      "Digitally signed official release distributed directly from hindibhajanmanjari.com — no Play Store required.",
    playNoteBadge: "An honest note from us",
    playNoteTitle: "Why isn't this app on Google Play Store yet?",
    playNoteBody:
      "Hindi Bhajan Manjari is an independent devotional effort built from Braj. Publishing on Google Play requires a one-time $25 (~₹2,100) developer registration fee that we cannot afford right now — so we distribute the exact same signed, official Android app directly from our website.",
    playNoteBody2:
      "If you would like to help us improve the app further and bring Hindi Bhajan Manjari to the Google Play Store soon, any small contribution through Donate makes a real difference.",
    playNoteCta: "Support & Donate for Play Store Launch",
    secPreviews: "App screenshots",
    secPreviewsSub: "Swipe horizontally to preview the mobile reading experience",
    secAbout: "About this app",
    aboutP1:
      "Hindi Bhajan Manjari for Android is built for calm daily worship, morning and sandhya aarti, satsang, and travel reading. Every screen puts clear Devanagari and 10 regional Indian scripts first without intrusive clutter.",
    aboutP2:
      "With elderly-friendly font zoom, 100% offline Sangrah storage for temples or low-signal areas, and automatic 2-device cloud sync, your personal devotional library stays with you everywhere.",
    secFeatures: "Key features",
    secInstall: "Install in 4 simple visual steps",
    secInstallSub:
      "Clear visual guide so anyone can install the official APK in under 30 seconds",
    secWhatsNew: "What's new",
    secTech: "App details & security",
    techPackage: "Package ID",
    techVersion: "Latest version",
    techSize: "Download size",
    techMinAndroid: "Minimum Android",
    techArch: "Architecture",
    techDate: "Release date",
    techSource: "Official source",
    shaLabel: "SHA-256 checksum (verify authenticity)",
    copyBtn: "Copy",
    copiedBtn: "Copied",
    permTitle: "Permissions & privacy",
    permDesc:
      "Only essential permissions required for devotional reading and optional reminders. No contacts access, no location tracking, and no third-party ad SDKs.",
    secUpdatesTitle: "How app updates work automatically",
    secUpdatesBody:
      "Design refinements, festival themes, and bug fixes arrive quietly inside the app via Instant OTA updates. When a major native APK release ships, the in-app Menu ('Check for Update') notifies you with a 1-tap link to this page.",
    secFaq: "Frequently asked questions",
    stickyBtn: "Download APK",
    footerHelp: "Need help installing or verifying the APK?",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms",
    footerContact: "Contact Support",
    modalStartedTitle: "Your APK download has started",
    modalStartedSub:
      "Keep this screen open — follow these 4 quick visual steps once download finishes:",
    modalPreviewTitle: "Install Guide (Signed APK Releasing Soon)",
    modalPreviewSub:
      "The signed v1.0.0 release APK is completing final checks. Once live, this button starts the direct download — preview the 4 simple steps below:",
    modalDownloadAgain: "Download didn't start? Tap here",
    modalPrev: "Back",
    modalNext: "Next step",
    modalDone: "Got it, close",
  },
} as const;

const FEATURES = [
  {
    icon: FaGlobeAsia,
    titleHi: "11 भारतीय लिपियाँ व ऑटो-टाइपोग्राफी",
    titleEn: "11 Indian scripts & Indic typography",
    descHi:
      "देवनागरी, Hinglish, पंजाबी, गुजराती, बांग्ला, असमिया, उड़िया, तमिल, तेलुगु, कन्नड़ और मलयालम में बिना मात्रा कटे पाठ।",
    descEn:
      "Read seamlessly in Devanagari, Hinglish, Gurmukhi, Gujarati, Bengali, Assamese, Odia, Tamil, Telugu, Kannada, and Malayalam.",
  },
  {
    icon: FaWifi,
    titleHi: "100% ऑफ़लाइन संग्रह व 2-डिवाइस सिंक",
    titleEn: "Offline Sangrah & 2-device cloud sync",
    descHi:
      "सुरक्षित किए गए व हाल के 20 भजन बिना नेटवर्क पढ़ें। लॉगिन करने पर आपका संग्रह 2 फ़ोन पर स्वतः सिंक रहता है।",
    descEn:
      "Read saved and recent 20 bhajans without internet. Sign in once to keep your collection synced across up to 2 devices.",
  },
  {
    icon: FaMicrophoneAlt,
    titleHi: "समर्पित कलाकार (Artists) निर्देशिका",
    titleEn: "Dedicated Artists directory",
    descHi:
      "गायक व गीतकार के अनुसार संपूर्ण भजन संग्रह खोजें — गायन व लेखन फ़िल्टर और कलाकार परिचय के साथ।",
    descEn:
      "Browse bhajans by devotional singers and lyricists with role filters, bios, and popularity sorting.",
  },
  {
    icon: FaPalette,
    titleHi: "त्योहार विशेष मोड (पंचांग आधारित)",
    titleEn: "Festival Special Mode (IST Panchang)",
    descHi:
      "जन्माष्टमी, नवरात्रि, महाशिवरात्रि, रामनवमी, दीपावली व एकादशी पर ऐप की होम स्क्रीन स्वतः पावन रूप लेती है।",
    descEn:
      "Built-in 2026–2030 IST Panchang automatically dresses Home with authentic themes, shlokas, and curated bhajans.",
  },
  {
    icon: FaBell,
    titleHi: "सुबह व संध्या आरती रिमाइंडर",
    titleEn: "Smart Morning & Sandhya reminders",
    descHi:
      "वार, त्योहार और आपके पसंदीदा देव के अनुसार शांत लोकल नोटिफिकेशन — बिना किसी स्पैम के।",
    descEn:
      "Calm, customizable local reminders tailored to the weekday, upcoming festival, and your favorite deity.",
  },
  {
    icon: FaMoon,
    titleHi: "पूजा संध्या डार्क मोड व वेक-लॉक",
    titleEn: "Pooja Sandhya Dark Mode & Keep-Awake",
    descHi:
      "भजन पढ़ते समय स्क्रीन स्वतः बंद नहीं होती और रात्रि पाठ के लिए शांत डार्क थीम 1 टैप में चालू होती है।",
    descEn:
      "Screen stays awake while reciting lyrics, paired with a low-glare dark mode designed for evening worship.",
  },
  {
    icon: FaBookOpen,
    titleHi: "शब्दार्थ शब्दकोश व सुविचार कार्ड",
    titleEn: "Tap-to-Meaning Shabdkosh & Status Cards",
    descHi:
      "किसी भी कठिन शब्द पर टैप करके तुरंत सरल अर्थ जानें और सुंदर व्हाट्सएप सुविचार कार्ड बनाएँ।",
    descEn:
      "Tap any lyrical word for an instant Hindi/English meaning, and export curated quote cards for WhatsApp.",
  },
  {
    icon: FaSyncAlt,
    titleHi: "त्वरित OTA और इन-ऐप अपडेट जाँच",
    titleEn: "Instant OTA & in-app update checks",
    descHi:
      "बिना बार-बार APK डाउनलोड किए नए सुधार व त्योहार थीम अपने आप ऐप में अपडेट होते रहते हैं।",
    descEn:
      "Most UI refinements and festival updates arrive quietly over the air, with built-in checks for new APK releases.",
  },
];

const INSTALL_STEPS = [
  {
    id: "download",
    step: "1",
    titleHi: "Chrome में 'Download anyway' दबाएँ (फोन के नीचे)",
    titleEn: "Tap 'Download anyway' in Chrome (screen bottom)",
    bodyHi:
      "डाउनलोड बटन दबाते ही Chrome आपके फ़ोन के निचले हिस्से में एक सुरक्षा संदेश दिखाएगा। वहाँ बेझिझक नीले 'Download anyway' पर टैप करें।",
    bodyEn:
      "Chrome displays a routine security notice at the bottom of your phone. Tap the blue 'Download anyway' button to save the file.",
  },
  {
    id: "open",
    step: "2",
    titleHi: "डाउनलोड पूरा होने पर 'Open' टैप करें",
    titleEn: "Tap 'Open' when download finishes",
    bodyHi:
      "फ़ोन की ऊपर वाली नोटिफिकेशन पट्टी में या Downloads फ़ोल्डर में hindi-bhajan-manjari.apk पर टैप करके खोलें।",
    bodyEn:
      "Tap 'Open' on the browser completion banner, or open hindi-bhajan-manjari.apk from your Downloads folder.",
  },
  {
    id: "allow",
    step: "3",
    titleHi: "'Allow from this source' चालू करें (केवल 1 बार)",
    titleEn: "Enable 'Allow from this source' (one-time)",
    bodyHi:
      "यदि Android अनुमति माँगे, तो Settings पर जाएँ, 'Allow from this source' बटन को ON करें और वापस लौटें।",
    bodyEn:
      "If Android asks for permission, tap Settings, switch 'Allow from this source' ON, and press Back once.",
  },
  {
    id: "install",
    step: "4",
    titleHi: "'Install' दबाएँ और भजन पाठ शुरू करें",
    titleEn: "Tap 'Install' and open the app",
    bodyHi:
      "'Install' बटन पर टैप करें। 5–10 सेकंड में कमल चिह्न वाला हिंदी भजन मंजरी ऐप आपकी स्क्रीन पर खुल जाएगा।",
    bodyEn:
      "Tap 'Install'. Within seconds, Hindi Bhajan Manjari with its Lotus icon appears on your home screen.",
  },
];

const PERMISSIONS = [
  {
    name: "INTERNET",
    hi: "नए भजन, कलाकार सूची और 2-डिवाइस क्लाउड सिंक के लिए।",
    en: "Fetch new bhajans, artist profiles, and sync your saved Sangrah across 2 devices.",
  },
  {
    name: "POST_NOTIFICATIONS",
    hi: "केवल आपके द्वारा चालू किए गए सुबह/संध्या आरती रिमाइंडर के लिए (वैकल्पिक)।",
    en: "Deliver optional Morning & Sandhya Aarti local reminders when you enable them.",
  },
  {
    name: "VIBRATE & AUDIO",
    hi: "कोमल टैप फ़ीडबैक, मंदिर घंटी ध्वनि और भक्तों के ऑडियो कवर सुनने के लिए।",
    en: "Gentle tactile feedback, optional temple chime sound, and playing devotional audio covers.",
  },
];

const FAQS = [
  {
    qHi: "यह ऐप Play Store पर क्यों नहीं है और क्या यह APK सुरक्षित है?",
    qEn: "Why is this app not on Play Store yet, and is the APK safe?",
    aHi: "Google Play Console का $25 (~₹2,100) का one-time registration शुल्क फिलहाल वहन न कर पाने के कारण हम ऐप को सीधे अपनी आधिकारिक वेबसाइट (hindibhajanmanjari.com) से Signed APK के रूप में दे रहे हैं। जैसे ही भक्तों के सहयोग से यह राशि पूरी होती है, हम ऐप को Play Store पर भी लाएँगे। यह APK 100% सुरक्षित और हमारे आधिकारिक सर्वर से हस्ताक्षरित है।",
    aEn: "Google Play Console charges a one-time $25 (~₹2,100) registration fee that we cannot afford right now, so we distribute the official signed APK directly from hindibhajanmanjari.com. Once community support helps us cover this fee, we will publish it on Play Store too. This APK is 100% safe and digitally signed by us.",
  },
  {
    qHi: "डाउनलोड या इंस्टॉल के समय Android चेतावनी क्यों दिखाता है?",
    qEn: "Why does Android show a warning when installing an APK?",
    aHi: "Play Store के बाहर से डाउनलोड होने वाले हर वैध APK के लिए Android यह सामान्य सुरक्षा संदेश दिखाता है। ब्राउज़र के लिए एक बार 'Allow from this source' अनुमति देने के बाद इंस्टॉल सामान्य रूप से पूरा हो जाता है।",
    aEn: "Android displays a standard confirmation for every APK installed outside Play Store. Allowing your browser once via 'Allow from this source' lets the installation complete normally.",
  },
  {
    qHi: "भविष्य के नए अपडेट मुझे कैसे मिलेंगे?",
    qEn: "How will I receive future updates?",
    aHi: "अधिकांश सुधार, नए त्योहार थीम और बग-फ़िक्स ऐप खोलते ही स्वतः (Instant OTA) अपडेट हो जाते हैं। किसी बड़े नए APK संस्करण के आने पर ऐप के मेनू → 'ऐप अपडेट जाँचें' में सूचना मिलेगी और आप इसी पेज से नया APK डाउनलोड कर सकेंगे — आपका कोई भी डेटा या संग्रह नहीं मिटेगा।",
    aEn: "Most UI fixes and festival themes arrive silently via Instant OTA updates. For major native releases, the in-app Menu ('Check for Update') notifies you and links straight to this page. Installing the newer signed APK updates in place without losing your saved Sangrah.",
  },
  {
    qHi: "सदस्यता भुगतान (Bhakti Pass) कैसे होता है?",
    qEn: "How does Bhakti Pass billing work?",
    aHi: "ऐप में 24 घंटे का निःशुल्क पावन दर्शन (भक्ति पास) मिलता है। उसके बाद आप ऐप के अंदर ही सुरक्षित Razorpay द्वारा PhonePe, Google Pay, Paytm, किसी भी UPI या कार्ड से तुरंत पास सक्रिय कर सकते हैं और कभी भी निरस्त कर सकते हैं।",
    aEn: "You get a complimentary 24-hour devotional pass. Afterwards, you can activate a pass right inside the app via Razorpay using PhonePe, Google Pay, Paytm, any UPI app, or card, with instant activation and anytime cancellation.",
  },
  {
    qHi: "क्या मेरे सहेजे गए भजन और सब्सक्रिप्शन 2 फ़ोन पर चलेंगे?",
    qEn: "Can I use my account and saved bhajans on 2 phones?",
    aHi: "जी हाँ। आप अपने एक ही खाते से अधिकतम 2 डिवाइस पर लॉगिन कर सकते हैं और आपका पूरा भजन संग्रह दोनों फ़ोन पर क्लाउड-सिंक रहता है।",
    aEn: "Yes. A single account works across up to 2 linked devices, and your saved Sangrah stays cloud-synced automatically.",
  },
  {
    qHi: "यदि 'App not installed' या 'Parse error' आए तो क्या करें?",
    qEn: "What if I see 'App not installed' or a parse error?",
    aHi: "सुनिश्चित करें कि आपका फ़ोन Android 8.0 या उससे ऊपर है, कम से कम 100 MB स्टोरेज खाली है, और APK फ़ाइल पूरी डाउनलोड हुई है। यदि पहले कोई पुराना टेस्ट बिल्ड इंस्टॉल था, तो उसे अनइंस्टॉल करके यह आधिकारिक रिलीज़ इंस्टॉल करें।",
    aEn: "Verify your phone runs Android 8.0+, has at least 100 MB free storage, and finished downloading completely. If an older test build was installed earlier, uninstall it first before installing this official release.",
  },
];

/**
 * Miniature visual Android UI diagram for each installation step so even first-time users
 * immediately recognize what button/toggle to tap on their own phone.
 */
function InstallStepVisual({
  stepId,
  lang,
  version,
  onTriggerDownload,
}: {
  stepId: string;
  lang: Lang;
  version: string;
  onTriggerDownload?: () => void;
}) {
  if (stepId === "download") {
    return (
      <div className="rounded-2xl bg-gray-50/90 dark:bg-[#1a0e08] border border-orange-200/80 dark:border-orange-900/50 p-3.5 shadow-inner">
        <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
          <span>{lang === "hi" ? "📱 फ़ोन के निचले हिस्से में ऐसा दिखेगा:" : "📱 Look at bottom of your phone:"}</span>
          <span className="text-orange-600 dark:text-orange-400 font-bold">{lang === "hi" ? "Chrome सूचना" : "Chrome Prompt"}</span>
        </div>
        <div className="rounded-xl bg-white dark:bg-black/50 border border-gray-200 dark:border-gray-800 p-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/70 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-400">
              <FaShieldAlt size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {lang === "hi"
                  ? "File might be harmful (फ़ाइल हानिकारक हो सकती है?)"
                  : "File might be harmful (routine security notice)"}
              </div>
              <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate mt-0.5">
                hindi-bhajan-manjari-v{version}.apk
              </div>
              <div className="mt-2.5 flex items-center justify-end gap-2">
                <span className="text-[11px] font-medium text-gray-400 px-2 py-1">
                  Cancel
                </span>
                <button
                  type="button"
                  onClick={onTriggerDownload}
                  className="inline-flex items-center gap-1.5 text-xs font-black bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer ring-2 ring-blue-300 dark:ring-blue-500/40"
                  title={lang === "hi" ? "यहाँ टैप करके भी APK डाउनलोड कर सकते हैं" : "Click here to download APK directly"}
                >
                  <span>Download anyway</span>
                  <FaDownload size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 text-center font-medium">
          {lang === "hi"
            ? "👆 अपने फ़ोन के नीचे आने वाले इस बटन पर टैप करें (या सीधे ऊपर नीले बटन पर भी टैप कर सकते हैं)।"
            : "👆 Tap this button at the bottom of your phone (or tap the blue button above directly)."}
        </p>
      </div>
    );
  }

  if (stepId === "open") {
    return (
      <div className="rounded-2xl bg-[#fffcf5] dark:bg-[#1a0d06] border border-orange-200/80 dark:border-orange-900/50 p-3.5 shadow-inner">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-400">
              <FaCheckCircle size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-gray-900 dark:text-orange-50 truncate">
                {lang === "hi" ? "डाउनलोड पूर्ण हुआ" : "Download complete"}
              </div>
              <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">
                hindi-bhajan-manjari-v{version}.apk
              </div>
            </div>
          </div>
          <span className="shrink-0 text-xs font-extrabold bg-orange-600 text-white px-3.5 py-1.5 rounded-lg shadow-sm ring-2 ring-orange-300 dark:ring-orange-500/40">
            {lang === "hi" ? "Open (खोलें)" : "Open"}
          </span>
        </div>
      </div>
    );
  }

  if (stepId === "allow") {
    return (
      <div className="rounded-2xl bg-[#fffcf5] dark:bg-[#1a0d06] border border-orange-200/80 dark:border-orange-900/50 p-3.5 shadow-inner">
        <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-2">
          Android Settings · Chrome / Files
        </div>
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#120804] rounded-xl px-3 py-2.5 border border-orange-100 dark:border-orange-900/40">
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-900 dark:text-orange-50">
              Allow from this source
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              {lang === "hi"
                ? "इस स्रोत से इंस्टॉल अनुमति चालू करें"
                : "Toggle ON once, then tap Back"}
            </div>
          </div>
          {/* Visual ON Switch */}
          <div className="w-11 h-6 rounded-full bg-orange-600 p-0.5 flex items-center justify-end shrink-0 ring-2 ring-orange-300 dark:ring-orange-500/40">
            <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center">
              <FaCheck size={9} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Install dialog with real Lotus icon
  return (
    <div className="rounded-2xl bg-[#fffcf5] dark:bg-[#1a0d06] border border-orange-200/80 dark:border-orange-900/50 p-3.5 shadow-inner">
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-orange-200 dark:border-orange-800 shrink-0 bg-[#FFF7ED]">
          <Image
            src="/images/app/app-icon.png"
            alt="Hindi Bhajan Manjari Lotus Icon"
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold text-gray-900 dark:text-orange-50">
            Hindi Bhajan Manjari
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            {lang === "hi"
              ? "क्या आप इस ऐप को इंस्टॉल करना चाहते हैं?"
              : "Do you want to install this app?"}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <span className="text-[11px] font-semibold text-gray-400 px-2.5 py-1">
          Cancel
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-orange-600 text-white px-4 py-1.5 rounded-lg shadow-sm ring-2 ring-orange-300 dark:ring-orange-500/40">
          <FaCheck size={10} />
          {lang === "hi" ? "Install (इंस्टॉल करें)" : "Install"}
        </span>
      </div>
    </div>
  );
}

/**
 * Handcrafted realistic mobile app preview frames reflecting the real Hindi Bhajan Manjari screens.
 */
function MobilePreviewMock({ slide }: { slide: PreviewSlide }) {
  const isDark = Boolean(slide.darkFrame);
  const bg = isDark
    ? "bg-[#0B1120] text-[#F5F3EE]"
    : "bg-[#fffcf5] text-[#1C1917]";
  const card = isDark
    ? "bg-[#131B2E] border-white/10"
    : "bg-white border-orange-100";
  const muted = isDark ? "text-stone-400" : "text-stone-500";

  return (
    <div
      className={`relative w-[248px] h-[440px] rounded-[28px] border-[6px] ${
        isDark ? "border-[#2a150b]" : "border-[#2a1106]"
      } shadow-lg shadow-orange-950/15 overflow-hidden flex flex-col ${bg}`}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1.5 text-[10px] font-mono opacity-75">
        <span>9:41</span>
        <div className="w-12 h-3 rounded-full bg-current opacity-15" />
        <span>5G</span>
      </div>

      <div className="flex-1 px-3 py-1.5 overflow-hidden flex flex-col gap-2.5">
        {slide.id === "home" && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="relative w-5 h-5 rounded-md overflow-hidden border border-orange-200 bg-[#FFF7ED]">
                  <Image
                    src="/images/app/app-icon.png"
                    alt=""
                    fill
                    sizes="20px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-[10.5px] font-bold leading-none">
                    हिंदी भजन मंजरी
                  </div>
                  <div className={`text-[8.5px] ${muted}`}>दैनिक भक्ति संग्रह</div>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center">
                <FaBookOpen size={9} />
              </div>
            </div>
            <div className="rounded-xl p-2.5 bg-gradient-to-br from-[#172554] to-[#1E3A8A] text-white border border-amber-400/30">
              <div className="text-[8px] text-amber-300 font-semibold">
                त्योहार विशेष · पंचांग सक्रिय
              </div>
              <div className="text-[12px] font-bold mt-0.5">
                श्री कृष्ण जन्माष्टमी
              </div>
              <div className="text-[9px] text-blue-100/85 mt-0.5 leading-snug">
                अच्युतं केशवं कृष्ण दामोदरम् — विशेष भजन एवं आरती संग्रह
              </div>
            </div>
            <div className={`rounded-xl border p-2.5 ${card}`}>
              <div className="h-16 rounded-lg bg-gradient-to-br from-orange-700 to-red-700 flex items-center justify-center text-amber-100 text-xs font-bold">
                श्री हनुमान चालीसा
              </div>
              <div className="mt-2 text-[11px] font-bold leading-tight">
                श्री हनुमान चालीसा (भावार्थ सहित)
              </div>
              <div className={`text-[9px] mt-0.5 ${muted}`}>
                श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि...
              </div>
            </div>
            <div className={`rounded-xl border p-2 ${card}`}>
              <div className="text-[10px] font-bold">
                ॐ जय जगदीश हरे आरती
              </div>
              <div className={`text-[8.5px] ${muted}`}>आरती · ऑफ़लाइन उपलब्ध</div>
            </div>
          </>
        )}

        {slide.id === "reader" && (
          <>
            <div className="flex items-center justify-between border-b border-orange-100 pb-1.5">
              <span className="text-[10px] font-bold">श्री राम स्तुति</span>
              <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-bold">
                11 लिपियाँ
              </span>
            </div>
            <div className="flex gap-1 text-[8.5px]">
              <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white font-semibold">
                हिंदी
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-900">
                ગુજરાતી
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-900">
                বাংলা
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-900">
                தமிழ்
              </span>
            </div>
            <div className={`rounded-xl border p-3 ${card}`}>
              <p className="text-[12px] leading-relaxed font-semibold text-center">
                श्री रामचन्द्र कृपालु भजुमन
                <br />
                हरण भवभय दारुणम् ।
                <br />
                नव कंज लोचन कंज मुख
                <br />
                कर कंज पद कंजारुणम् ॥
              </p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-2.5">
              <div className="text-[8.5px] text-orange-700 font-bold">
                शब्दकोश · टैप शब्दार्थ
              </div>
              <div className="text-[11px] font-bold text-stone-900 mt-0.5">
                कंज (Kanj)
              </div>
              <div className="text-[9px] text-stone-600 leading-snug">
                कमल का पुष्प — जो जल से उत्पन्न होता है (Lotus flower)
              </div>
            </div>
          </>
        )}

        {slide.id === "sangrah" && (
          <>
            <div className={`rounded-xl border p-2.5 ${card}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold">
                    मेरा संग्रह (ऑफ़लाइन)
                  </div>
                  <div className={`text-[8.5px] ${muted}`}>
                    18 सुरक्षित · 20 हाल ही में पढ़े
                  </div>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  क्लाउड सिंक
                </span>
              </div>
            </div>
            {[
              { title: "श्री बजरंग बाण", sub: "हनुमान जी · ऑफ़लाइन तैयार" },
              { title: "शिव ताण्डव स्तोत्रम्", sub: "महादेव · ऑफ़लाइन तैयार" },
              { title: "अच्युतम् केशवम्", sub: "श्री कृष्ण · ऑफ़लाइन तैयार" },
              { title: "अम्बे तू है जगदम्बे काली", sub: "माँ दुर्गा · ऑफ़लाइन तैयार" },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-xl border px-2.5 py-2 flex items-center justify-between ${card}`}
              >
                <div className="min-w-0">
                  <div className="text-[10.5px] font-bold truncate">
                    {item.title}
                  </div>
                  <div className={`text-[8.5px] ${muted}`}>{item.sub}</div>
                </div>
                <FaHeart className="text-orange-600 shrink-0" size={11} />
              </div>
            ))}
          </>
        )}

        {slide.id === "artists" && (
          <>
            <div>
              <div className="text-[11px] font-bold">भक्ति कलाकार</div>
              <div className={`text-[8.5px] ${muted}`}>
                गायक, संत एवं गीतकार संग्रह
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { glyph: "कि", name: "किशोरी रमण", count: "24 भजन" },
                { glyph: "र", name: "रसिका पागल", count: "18 भजन" },
                { glyph: "सू", name: "सूरदास जी", count: "42 पद" },
                { glyph: "मी", name: "मीराबाई", count: "31 भजन" },
              ].map((a) => (
                <div key={a.name} className={`rounded-xl border overflow-hidden ${card}`}>
                  <div className="h-14 bg-gradient-to-br from-[#431407] to-[#9A3412] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-amber-200/50 bg-black/20 flex items-center justify-center text-amber-200 text-xs font-bold">
                      {a.glyph}
                    </div>
                  </div>
                  <div className="p-1.5 text-center">
                    <div className="text-[9.5px] font-bold truncate">
                      {a.name}
                    </div>
                    <div className={`text-[8px] ${muted}`}>{a.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {slide.id === "dark" && (
          <>
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-[10px] font-bold text-amber-200">
                पूजा संध्या मोड
              </span>
              <FaMoon size={10} className="text-amber-300" />
            </div>
            <div className={`rounded-xl border p-3 ${card} space-y-1.5`}>
              <div className="text-[9px] text-orange-400 font-semibold">
                संध्या आरती · स्क्रीन वेक-लॉक सक्रिय
              </div>
              <div className="text-[12px] font-bold text-stone-100">
                आरती कुंजबिहारी की
              </div>
              <p className="text-[10.5px] leading-relaxed text-stone-300 pt-1">
                आरती कुंजबिहारी की,
                <br />
                श्री गिरिधर कृष्ण मुरारी की ।
                <br />
                गले में बैजंती माला,
                <br />
                बजावै मुरली मधुर बाला ॥
              </p>
            </div>
            <div className="mt-auto rounded-full bg-[#131B2E] border border-white/10 px-3 py-1.5 flex items-center justify-between text-[9px] text-stone-300">
              <span>A-</span>
              <span>A+</span>
              <span className="text-amber-300">संध्या</span>
              <FaHeart size={9} className="text-red-400" />
            </div>
          </>
        )}
      </div>

      {/* Bottom 5-tab bar */}
      <div
        className={`px-3 py-2 border-t flex items-center justify-between text-[8px] ${
          isDark
            ? "bg-[#0E121B] border-white/10 text-stone-400"
            : "bg-white border-orange-100 text-stone-500"
        }`}
      >
        <span className={slide.id === "home" ? "text-orange-600 font-bold" : ""}>
          होम
        </span>
        <span>खोजें</span>
        <span className={slide.id === "artists" ? "text-orange-600 font-bold" : ""}>
          कलाकार
        </span>
        <span className={slide.id === "sangrah" ? "text-orange-600 font-bold" : ""}>
          संग्रह
        </span>
        <span>मेनू</span>
      </div>
    </div>
  );
}

export default function AppStoreClient({ release }: AppStoreClientProps) {
  const [lang, setLang] = useState<Lang>("hi");
  const [activeSlide, setActiveSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedSha, setCopiedSha] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // In-page active download state & in-app browser detection
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  const heroCtaRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const t = COPY[lang];
  const hasLiveApk = Boolean(release.apkDownloadUrl?.trim());
  const isShaPublished =
    Boolean(release.sha256) &&
    !release.sha256.toLowerCase().includes("will be published");

  useEffect(() => {
    if (typeof window === "undefined" || !navigator) return;
    const ua =
      navigator.userAgent || navigator.vendor || (window as any).opera || "";
    const inApp = /WhatsApp|FBAN|FBAV|Instagram|Telegram|Line/i.test(ua);
    setIsInAppBrowser(inApp);
  }, []);

  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const triggerApkFileDownload = () => {
    if (!hasLiveApk) return;
    setIsDownloading(true);
    const a = document.createElement("a");
    a.href = release.apkDownloadUrl;
    a.setAttribute(
      "download",
      `hindi-bhajan-manjari-v${release.latestVersion}.apk`,
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadClick = () => {
    setIsDownloading(true);
  };

  const handleCopySha = async () => {
    try {
      await navigator.clipboard.writeText(release.sha256);
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2000);
    } catch {
      // ignore clipboard errors on restricted origins
    }
  };

  const scrollToSlide = (idx: number) => {
    setActiveSlide(idx);
    const container = carouselRef.current;
    if (!container) return;
    const child = container.children[idx] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const handleCarouselScroll = () => {
    const container = carouselRef.current;
    if (!container) return;
    const idx = Math.round(container.scrollLeft / 264);
    if (idx >= 0 && idx < PREVIEW_SLIDES.length && idx !== activeSlide) {
      setActiveSlide(idx);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcf5] dark:bg-[#0c0804] text-gray-900 dark:text-orange-50 pb-28 sm:pb-20 font-hindi">
      {/* ⚠️ In-App Browser (WhatsApp / Social Media) Top Alert */}
      {isInAppBrowser && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md z-40 relative">
          <div className="flex items-center gap-2.5 max-w-3xl mx-auto w-full">
            <span className="text-base sm:text-lg shrink-0">⚠️</span>
            <span>
              {lang === "hi"
                ? "आप WhatsApp / सोशल मीडिया ब्राउज़र में हैं। सीधा APK डाउनलोड करने के लिए ऊपर दाएँ 3 डॉट्स (⋮) दबाकर 'Open in Chrome / ब्राउज़र में खोलें' चुनें।"
                : "You are in an in-app browser. Tap the 3 dots (⋮) top-right and select 'Open in Chrome' for seamless APK download."}
            </span>
          </div>
        </div>
      )}
      {/* =================================================================
          1. WEBSITE-CONSISTENT SAFFRON HERO BANNER (Mobile-First)
         ================================================================= */}
      <header className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 dark:from-[#1a0500] dark:via-[#431407] dark:to-[#882b0f] text-white pt-6 pb-24 sm:pt-10 sm:pb-28 px-4 rounded-b-[2rem] sm:rounded-b-[3rem] shadow-lg">
        {/* Signature website subtle dot pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.14] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl">
          {/* Top Breadcrumb + Bilingual Toggle */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-semibold text-orange-100/90"
            >
              <Link href="/" className="hover:text-white transition-colors">
                {t.breadcrumbHome}
              </Link>
              <span className="opacity-60">/</span>
              <span className="text-white">{t.breadcrumbApp}</span>
            </nav>

            <div
              role="group"
              aria-label="Language"
              className="inline-flex items-center rounded-xl bg-black/20 border border-white/20 p-0.5 text-xs backdrop-blur-sm"
            >
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  lang === "hi"
                    ? "bg-white text-orange-700"
                    : "text-orange-100 hover:text-white"
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  lang === "en"
                    ? "bg-white text-orange-700"
                    : "text-orange-100 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold bg-black/20 border border-white/20 px-3.5 py-1 rounded-full text-orange-50 mb-3">
              <FaAndroid size={13} className="text-amber-200" />
              <span>{t.heroEyebrow}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm leading-tight">
              {t.heroHeading}
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-orange-50/95 font-medium max-w-xl mx-auto leading-relaxed">
              {t.heroSub}
            </p>
          </div>
        </div>
      </header>

      {/* =================================================================
          2. MAIN MOBILE-FIRST CONTAINER (Overlapping App Listing Card)
         ================================================================= */}
      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-20 space-y-8 sm:space-y-10">
        {/* APP LISTING CARD (Play-Store Clarity + Website Styling + Real Lotus Icon!) */}
        <section className="rounded-3xl border border-orange-100 dark:border-orange-900/40 bg-white dark:bg-[#120804] p-5 sm:p-7 shadow-xl shadow-orange-950/10 dark:shadow-black/40">
          {/* App Identity Row */}
          <div className="flex items-center gap-4">
            <div className="relative w-[78px] h-[78px] sm:w-[92px] sm:h-[92px] rounded-[22px] overflow-hidden border-2 border-orange-200 dark:border-orange-800/70 bg-[#FFF7ED] shrink-0 shadow-md">
              <Image
                src="/images/app/app-icon.png"
                alt="Hindi Bhajan Manjari Official Lotus App Icon"
                fill
                priority
                sizes="92px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border border-orange-200/70 dark:border-orange-900/50 px-2.5 py-0.5 rounded-full">
                <FaCheckCircle size={11} />
                <span className="truncate">{t.officialBadge}</span>
              </div>

              <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-orange-50 leading-tight">
                {lang === "hi" ? release.appNameHi : release.appName}
              </h2>

              <p className="mt-0.5 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {lang === "hi"
                  ? `${release.appName} · ${t.stableLabel}`
                  : `${release.appNameHi} · ${t.stableLabel}`}
              </p>
            </div>
          </div>

          {/* 4-Column Store Spec Strip */}
          <div className="mt-5 grid grid-cols-4 divide-x divide-orange-200/70 dark:divide-orange-900/40 rounded-2xl bg-orange-50/70 dark:bg-[#1a0d06] border border-orange-100 dark:border-orange-900/40 py-3 text-center">
            <div className="px-1">
              <div className="text-sm sm:text-base font-extrabold tabular-nums text-gray-900 dark:text-orange-50">
                v{release.latestVersion}
              </div>
              <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {t.metaVersion}
              </div>
            </div>
            <div className="px-1">
              <div className="text-sm sm:text-base font-extrabold tabular-nums text-gray-900 dark:text-orange-50">
                {release.apkSizeLabel}
              </div>
              <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {t.metaSize}
              </div>
            </div>
            <div className="px-1">
              <div className="text-sm sm:text-base font-extrabold tabular-nums text-gray-900 dark:text-orange-50">
                8.0+
              </div>
              <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {t.metaAndroid}
              </div>
            </div>
            <div className="px-1">
              <div className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-orange-50">
                {t.metaScriptsVal}
              </div>
              <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {t.metaScripts}
              </div>
            </div>
          </div>

          {/* Primary & Secondary Actions */}
          <div
            ref={heroCtaRef}
            className="mt-5 flex flex-col sm:flex-row gap-3"
          >
            <a
              href={hasLiveApk ? release.apkDownloadUrl : "#install-guide"}
              download={hasLiveApk ? `hindi-bhajan-manjari-v${release.latestVersion}.apk` : undefined}
              onClick={handleDownloadClick}
              className={`w-full sm:flex-1 min-h-[54px] px-5 rounded-2xl font-extrabold text-[15px] sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer ${
                isDownloading
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/25"
                  : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 active:scale-[0.99] text-white shadow-orange-600/25"
              }`}
            >
              <FaDownload size={16} className={isDownloading ? "animate-bounce" : ""} />
              <span>
                {isDownloading
                  ? lang === "hi"
                    ? "फ़ाइल डाउनलोड हो रही है... ⏳"
                    : "Downloading APK file... ⏳"
                  : hasLiveApk
                    ? t.downloadBtn
                    : t.downloadPendingBtn}
              </span>
            </a>

            <a
              href="#install-guide"
              className="w-full sm:w-auto min-h-[48px] px-5 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/60 dark:bg-orange-950/30 hover:bg-orange-100/70 dark:hover:bg-orange-950/50 text-orange-800 dark:text-orange-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <FaInfoCircle size={14} />
              <span>{t.installGuideBtn}</span>
            </a>
          </div>

          {/* Direct Fallback link if download doesn't trigger */}
          {hasLiveApk && (
            <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {lang === "hi"
                  ? "यदि ऊपर से डाउनलोड शुरू न हो:"
                  : "If download does not begin above:"}
              </span>
              <a
                href={release.apkDownloadUrl}
                download={`hindi-bhajan-manjari-v${release.latestVersion}.apk`}
                onClick={handleDownloadClick}
                className="font-bold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FaDownload size={11} />
                <span>{lang === "hi" ? "यहाँ से सीधे APK डाउनलोड करें" : "Direct APK Link"}</span>
              </a>
            </div>
          )}

          {/* Active Download In-Page Assistant Card */}
          {isDownloading && (
            <div className="mt-4 rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-50 via-[#f0fdf4] to-teal-50 dark:from-[#052216] dark:via-[#071d14] dark:to-[#041910] p-4.5 sm:p-5 shadow-lg shadow-emerald-950/5 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-black text-sm sm:text-base">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>
                  {lang === "hi"
                    ? `⬇️ डाउनलोड प्रारंभ हो गया! (v${release.latestVersion} · ${release.apkSizeLabel})`
                    : `⬇️ Download started! (v${release.latestVersion} · ${release.apkSizeLabel})`}
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                <div className="flex items-start gap-2 bg-white/80 dark:bg-black/30 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">1.</span>
                  <div>
                    <strong className="block font-bold text-gray-900 dark:text-white">
                      {lang === "hi" ? "📱 अपने फ़ोन के नीचे देखें:" : "📱 Look at bottom of your phone:"}
                    </strong>
                    {lang === "hi"
                      ? "यदि Chrome पूछे 'File might be harmful?' तो बिना डरे फ़ोन के नीचे नीले रंग के 'Download anyway (फिर भी डाउनलोड करें)' बटन पर टैप करें।"
                      : "If Chrome asks 'File might be harmful?', tap the blue 'Download anyway' button at the bottom of your phone."}
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/80 dark:bg-black/30 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">2.</span>
                  <div>
                    <strong className="block font-bold text-gray-900 dark:text-white">
                      {lang === "hi" ? "📲 प्रोग्रेस कहाँ दिखेगी:" : "📲 Where to see progress:"}
                    </strong>
                    {lang === "hi"
                      ? "अपने फ़ोन का ऊपर वाला पर्दा (Notification Bar) नीचे खींचें। वहाँ डाउनलोड प्रोग्रेस प्रतिशत दिखाई देगा (20-30 सेकंड प्रतीक्षा करें)।"
                      : "Pull down your phone's notification bar to see the download progress (takes 20-30 seconds)."}
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/80 dark:bg-black/30 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">3.</span>
                  <div>
                    <strong className="block font-bold text-gray-900 dark:text-white">
                      {lang === "hi" ? "✅ डाउनलोड पूरा होने के बाद:" : "✅ After download completes:"}
                    </strong>
                    {lang === "hi"
                      ? "नोटिफिकेशन में फ़ाइल पर टैप करें और 'Install' दबाएँ। (यदि 'Allow from this source' पूछे, तो ऑन कर दें)।"
                      : "Tap the completed notification and tap 'Install' (enable 'Allow from this source' if prompted)."}
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span>{lang === "hi" ? "फ़ाइल डाउनलोड नहीं हुई?" : "Did not download?"}</span>
                <button
                  type="button"
                  onClick={triggerApkFileDownload}
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FaRedo size={10} />
                  <span>{lang === "hi" ? "दोबारा डाउनलोड करें" : "Download Again"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Chrome Warning Reassurance Banner */}
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <FaShieldAlt className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={15} />
            <div className="leading-relaxed">
              <strong className="font-bold block text-amber-950 dark:text-amber-100">
                {lang === "hi"
                  ? "🛡️ 100% सुरक्षित एवं वायरस-मुक्त आधिकारिक ऐप"
                  : "🛡️ 100% Safe, Virus-Free Official Release"}
              </strong>
              {lang === "hi"
                ? "डाउनलोड दबाने पर Chrome 'File might be harmful?' पूछ सकता है। यह Play Store के बाहर हर APK पर आने वाला सामान्य सुरक्षा संदेश है — बेझिझक 'Download anyway (फिर भी डाउनलोड करें)' चुनें।"
                : "Chrome may ask 'File might be harmful?'. This is standard for direct APK downloads — tap 'Download anyway' with complete peace of mind."}
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
            <FaShieldAlt
              size={14}
              className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5"
            />
            <span>{t.trustLine}</span>
          </p>
        </section>

        {/* =================================================================
            2B. TRANSPARENT FOUNDER NOTE — WHY DIRECT APK + DONATE FOR PLAY STORE
           ================================================================= */}
        <section
          aria-labelledby="playstore-note-heading"
          className="rounded-3xl border-2 border-orange-200/90 dark:border-orange-800/60 bg-gradient-to-br from-orange-50 via-[#fffcf5] to-amber-50/70 dark:from-[#1d0d05] dark:via-[#150904] dark:to-[#1f1006] p-5 sm:p-7 shadow-md space-y-3.5"
        >
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-orange-700 dark:text-orange-300 bg-white/80 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/50 px-3 py-1 rounded-full">
            <FaHandHoldingHeart size={13} />
            <span>{t.playNoteBadge}</span>
          </div>

          <h2
            id="playstore-note-heading"
            className="text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-orange-50 leading-snug"
          >
            {t.playNoteTitle}
          </h2>

          <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-gray-200 font-medium">
            {t.playNoteBody}
          </p>

          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {t.playNoteBody2}
          </p>

          <div className="pt-1">
            <Link
              href="/donate"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-[0.99] text-white font-extrabold text-sm sm:text-[15px] inline-flex items-center justify-center gap-2.5 shadow-md shadow-orange-600/20 transition-all"
            >
              <FaHandHoldingHeart size={16} />
              <span>{t.playNoteCta}</span>
            </Link>
          </div>
        </section>

        {/* =================================================================
            3. STREAMLINED VISUAL 4-STEP INSTALLATION GUIDE (PROMINENT!)
           ================================================================= */}
        <section
          id="install-guide"
          aria-labelledby="install-heading"
          className="scroll-mt-24 space-y-4"
        >
          <div>
            <h2
              id="install-heading"
              className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-orange-50"
            >
              {t.secInstall}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
              {t.secInstallSub}
            </p>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {INSTALL_STEPS.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl sm:rounded-3xl border border-orange-100 dark:border-orange-900/40 bg-white dark:bg-[#120804] p-4 sm:p-5 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-mono text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                    {item.step}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-orange-50 leading-snug">
                      {lang === "hi" ? item.titleHi : item.titleEn}
                    </h3>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {lang === "hi" ? item.bodyHi : item.bodyEn}
                    </p>
                  </div>
                </div>

                {/* Miniature illustrated Android screen diagram */}
                <div className="mt-auto">
                  <InstallStepVisual
                    stepId={item.id}
                    lang={lang}
                    version={release.latestVersion}
                    onTriggerDownload={triggerApkFileDownload}
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* =================================================================
            4. SWIPEABLE MOBILE SCREENSHOT GALLERY
           ================================================================= */}
        <section aria-labelledby="previews-heading" className="space-y-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2
                id="previews-heading"
                className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-orange-50"
              >
                {t.secPreviews}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                {t.secPreviewsSub}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2.5 py-1 rounded-full tabular-nums">
              {activeSlide + 1} / {PREVIEW_SLIDES.length}
            </span>
          </div>

          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PREVIEW_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="snap-center shrink-0 flex flex-col items-center w-[252px]"
              >
                <MobilePreviewMock slide={slide} />
                <div className="mt-3 text-center px-2">
                  <div className="text-sm font-extrabold text-gray-900 dark:text-orange-50">
                    {lang === "hi" ? slide.labelHi : slide.labelEn}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {lang === "hi" ? slide.captionHi : slide.captionEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {PREVIEW_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={lang === "hi" ? s.labelHi : s.labelEn}
                onClick={() => scrollToSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx
                    ? "w-7 bg-orange-600"
                    : "w-2 bg-orange-200 dark:bg-orange-900/60"
                }`}
              />
            ))}
          </div>
        </section>

        {/* =================================================================
            5. APP OVERVIEW
           ================================================================= */}
        <section
          aria-labelledby="about-heading"
          className="rounded-3xl border border-orange-100 dark:border-orange-900/40 bg-white dark:bg-[#120804] p-5 sm:p-7 shadow-sm space-y-3"
        >
          <h2
            id="about-heading"
            className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-orange-50"
          >
            {t.secAbout}
          </h2>
          <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
            {t.aboutP1}
          </p>
          <p className="text-sm sm:text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
            {t.aboutP2}
          </p>
        </section>

        {/* =================================================================
            6. KEY FEATURES
           ================================================================= */}
        <section aria-labelledby="features-heading" className="space-y-4">
          <h2
            id="features-heading"
            className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-orange-50"
          >
            {t.secFeatures}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.titleEn}
                  className="rounded-2xl sm:rounded-3xl border border-orange-100 dark:border-orange-900/40 bg-white dark:bg-[#120804] p-4 sm:p-5 shadow-sm flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-orange-50 leading-snug">
                      {lang === "hi" ? feat.titleHi : feat.titleEn}
                    </h3>
                    <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-gray-600 dark:text-gray-400">
                      {lang === "hi" ? feat.descHi : feat.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================
            7. WHAT'S NEW (CHANGELOG)
           ================================================================= */}
        <section
          aria-labelledby="changelog-heading"
          className="rounded-3xl border border-orange-100 dark:border-orange-900/40 bg-white dark:bg-[#120804] p-5 sm:p-7 shadow-sm space-y-4"
        >
          <h2
            id="changelog-heading"
            className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-orange-50"
          >
            {t.secWhatsNew}
          </h2>

          <div className="space-y-5">
            {release.changelog.map((entry) => (
              <div
                key={entry.version}
                className="border-l-2 border-orange-500 pl-4 space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200/70 dark:border-orange-900/40">
                    v{entry.version}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {lang === "hi" ? entry.dateHi : entry.date}
                  </span>
                </div>
                <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-orange-50">
                  {lang === "hi" ? entry.titleHi : entry.titleEn}
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {(lang === "hi"
                    ? entry.highlightsHi
                    : entry.highlightsEn
                  ).map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                      <span className="leading-relaxed">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================
            8. TECHNICAL DETAILS + SECURITY & AUTHENTICITY
           ================================================================= */}
        <section
          aria-labelledby="security-heading"
          className="rounded-3xl border border-orange-100 dark:border-orange-900/40 bg-white dark:bg-[#120804] p-5 sm:p-7 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-2.5">
            <FaLock size={16} className="text-orange-600 dark:text-orange-400" />
            <h2
              id="security-heading"
              className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-orange-50"
            >
              {t.secTech}
            </h2>
          </div>

          <dl className="divide-y divide-orange-100 dark:divide-orange-900/30 text-xs sm:text-sm">
            {[
              {
                label: t.techVersion,
                value: `${release.latestVersion} (Build ${release.versionCode})`,
              },
              { label: t.techPackage, value: release.packageId, mono: true },
              { label: t.techSize, value: release.apkSizeLabel },
              { label: t.techMinAndroid, value: release.minAndroid },
              { label: t.techArch, value: release.architecture },
              {
                label: t.techDate,
                value:
                  lang === "hi" ? release.releaseDateHi : release.releaseDate,
              },
              {
                label: t.techSource,
                value: "hindibhajanmanjari.com/app",
                mono: true,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="py-2.5 flex items-center justify-between gap-4"
              >
                <dt className="text-gray-500 dark:text-gray-400 font-medium shrink-0">
                  {row.label}
                </dt>
                <dd
                  className={`text-right font-bold text-gray-900 dark:text-orange-50 break-all ${
                    row.mono ? "font-mono text-xs" : ""
                  }`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* SHA-256 Checksum */}
          <div className="rounded-2xl bg-orange-50/70 dark:bg-[#1a0d06] border border-orange-200/70 dark:border-orange-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-800 dark:text-orange-100">
                {t.shaLabel}
              </span>
              {isShaPublished && (
                <button
                  type="button"
                  onClick={handleCopySha}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  {copiedSha ? <FaCheck size={11} /> : <FaCopy size={11} />}
                  <span>{copiedSha ? t.copiedBtn : t.copyBtn}</span>
                </button>
              )}
            </div>
            <code className="block font-mono text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 break-all select-all">
              {release.sha256}
            </code>
          </div>

          {/* Permissions Breakdown */}
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-orange-50">
                {t.permTitle}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                {t.permDesc}
              </p>
            </div>
            <div className="space-y-2">
              {PERMISSIONS.map((perm) => (
                <div
                  key={perm.name}
                  className="rounded-xl border border-orange-100 dark:border-orange-900/40 bg-[#fffcf5] dark:bg-[#1a0d06] px-3.5 py-2.5"
                >
                  <div className="font-mono text-[11px] font-extrabold text-orange-700 dark:text-orange-300">
                    {perm.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {lang === "hi" ? perm.hi : perm.en}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How Updates Work Note */}
          <div className="rounded-2xl border border-orange-200 dark:border-orange-800/50 bg-orange-50 dark:bg-orange-950/30 p-4 flex items-start gap-3">
            <FaCloudDownloadAlt
              size={18}
              className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-orange-50">
                {t.secUpdatesTitle}
              </h3>
              <p className="text-xs sm:text-[13px] text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                {t.secUpdatesBody}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================================
            9. FAQ ACCORDION
           ================================================================= */}
        <section aria-labelledby="faq-heading" className="space-y-4">
          <h2
            id="faq-heading"
            className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-orange-50"
          >
            {t.secFaq}
          </h2>

          <div className="divide-y divide-orange-100 dark:divide-orange-900/30 rounded-3xl border border-orange-100 dark:border-orange-900/40 bg-white dark:bg-[#120804] overflow-hidden shadow-sm">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={item.qEn}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-[15px] font-bold text-gray-900 dark:text-orange-50 leading-snug">
                      {lang === "hi" ? item.qHi : item.qEn}
                    </span>
                    <FaChevronDown
                      size={12}
                      className={`text-orange-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {lang === "hi" ? item.aHi : item.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 10. DEVELOPER & LEGAL BAR */}
        <section className="rounded-2xl border border-orange-100 dark:border-orange-900/40 bg-white dark:bg-[#120804] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm shadow-sm">
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            {t.footerHelp}
          </div>
          <div className="flex flex-wrap items-center gap-4 font-bold">
            <Link
              href="/privacy"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600"
            >
              {t.footerPrivacy}
            </Link>
            <Link
              href="/terms"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600"
            >
              {t.footerTerms}
            </Link>
            <Link
              href="/contact"
              className="text-orange-600 dark:text-orange-400 hover:underline"
            >
              {t.footerContact}
            </Link>
          </div>
        </section>
      </main>

      {/* =================================================================
          STICKY MOBILE BOTTOM DOWNLOAD BAR
         ================================================================= */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-orange-200/80 dark:border-orange-900/50 bg-white/95 dark:bg-[#120804]/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-200 ${
          showStickyBar ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-orange-200 dark:border-orange-800 shrink-0 bg-[#FFF7ED]">
              <Image
                src="/images/app/app-icon.png"
                alt="Hindi Bhajan Manjari"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-gray-900 dark:text-orange-50 truncate">
                {lang === "hi" ? release.appNameHi : release.appName}
              </div>
              <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                v{release.latestVersion} · {release.apkSizeLabel}
              </div>
            </div>
          </div>

          <a
            href={hasLiveApk ? release.apkDownloadUrl : "#install-guide"}
            download={hasLiveApk ? `hindi-bhajan-manjari-v${release.latestVersion}.apk` : undefined}
            onClick={handleDownloadClick}
            className={`min-h-[44px] px-4 rounded-xl text-white text-sm font-extrabold flex items-center gap-2 shrink-0 shadow-md cursor-pointer transition-all ${
              isDownloading
                ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                : "bg-gradient-to-r from-orange-600 to-red-600 active:scale-95"
            }`}
          >
            <FaDownload size={12} className={isDownloading ? "animate-bounce" : ""} />
            <span>
              {isDownloading
                ? lang === "hi"
                  ? "डाउनलोड चालू है..."
                  : "Downloading..."
                : t.stickyBtn}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
