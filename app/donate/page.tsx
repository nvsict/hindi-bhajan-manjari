import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Hind } from 'next/font/google';
import SuccessFlow from './SuccessFlow';
import DonationCheckout from '@/components/DonationCheckout'; // 🌟 NEW: Imported our new Client Component

// 🌟 1. FORCE DYNAMIC RENDERING: This tells Next.js NEVER to cache this page.
// It will always read the live URL parameters.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const hind = Hind({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari', 'latin'],
  display: 'swap',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🌟 3-Second Fast-Fail Helper
async function fetchAmountFast(paymentId: string, fallbackAmount: number): Promise<number> {
  try {
    const fetchPromise = supabase
      .from('supporters')
      .select('amount')
      .eq('razorpay_payment_id', paymentId)
      .maybeSingle();

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timeout (3s)')), 3000)
    );

    const result: any = await Promise.race([fetchPromise, timeoutPromise]);

    if (result && result.data && result.data.amount) {
      return result.data.amount;
    }
    return fallbackAmount;
  } catch (err) {
    console.warn('[DonatePage] Fast-fail triggered, using URL amount:', err);
    return fallbackAmount;
  }
}

export default async function DonatePage({
  searchParams,
}: {
  searchParams:
    | Promise<{ success?: string; error?: string; payment_id?: string; amount?: string }>
    | { success?: string; error?: string; payment_id?: string; amount?: string };
}) {
  const params = await searchParams;
  const isSuccess = params?.success === 'true';
  const hasError = !!params?.error;
  const paymentId = params?.payment_id;

  const urlAmount = params?.amount ? parseInt(params.amount, 10) : 0;
  let donatedAmount = 0;

  // ==========================================
  // 1. FETCH AMOUNT FROM SUPABASE (If Success)
  // ==========================================
  if (isSuccess && paymentId) {
    donatedAmount = await fetchAmountFast(paymentId, urlAmount);

    return (
      <div className={hind.className}>
        <SuccessFlow paymentId={paymentId} amount={donatedAmount} />
      </div>
    );
  }

  // ==========================================
  // 2. ERROR STATE
  // ==========================================
  if (hasError) {
    return (
      <div className={`min-h-[70vh] flex flex-col items-center justify-center p-4 ${hind.className}`}>
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">भुगतान विफल</h1>
          <p className="text-gray-600 mb-8 font-medium">
            क्षमा करें, आपका पेमेंट पूरा नहीं हो पाया या हम इसे प्रमाणित नहीं कर सके। कृपया पुनः प्रयास करें।
          </p>
          <a
            href="#checkout-section"
            className="block w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all mb-3"
          >
            पुनः प्रयास करें
          </a>
          <Link href="/" className="block w-full py-3.5 text-gray-500 hover:text-gray-800 font-bold transition-all">
            मुख्य पृष्ठ पर लौटें
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. DEFAULT STATE (World-Class Storytelling & Appeal Page)
  // ==========================================
  return (
    <div className={`min-h-screen bg-[#fffaf5] text-gray-900 pb-24 ${hind.className}`}>
      
      {/* --- HERO HEADER: EMOTIONAL HOOK --- */}
      <section className="relative overflow-hidden pt-16 md:pt-24 pb-14 px-4 border-b border-orange-100 bg-gradient-to-b from-orange-50/70 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-xs md:text-sm font-bold uppercase tracking-widest mb-6">
            🪔 हिंदी भजन मंजरी की कहानी
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">
            यह मंच पूरी तरह मुफ़्त है — <br className="hidden sm:inline" />
            <span className="text-orange-600">पर इसे चलाना मुफ़्त नहीं है।</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
            होस्टिंग, डोमेन, डेटाबेस और निरंतर परिश्रम — सब कुछ एक विद्यार्थी अपनी सीमित पॉकेट मनी से अकेले वहन कर रहा है। आज इस भक्ति आंदोलन को जीवित रखने के लिए आपके साथ की आवश्यकता है।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#checkout-section"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-lg rounded-2xl shadow-lg shadow-orange-600/25 transition-all cursor-pointer scroll-smooth"
            >
              <span>सहयोग राशि जमा करें</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <a
              href="#story-section"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white hover:bg-orange-50 border border-orange-200 text-gray-800 font-bold text-base rounded-2xl transition-all scroll-smooth"
            >
              <span>पूरी कहानी पढ़ें ↓</span>
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            100% सुरक्षित एवं ऐच्छिक सहयोग (Powered by Razorpay)
          </div>
        </div>
      </section>

      {/* 🌟 NEW: THE DONATION CHECKOUT COMPONENT */}
      <section id="checkout-section" className="px-4 py-12 md:py-16 -mt-8 relative z-10 scroll-mt-24">
        <DonationCheckout mode="donation" returnPath="/donate" />
      </section>

      {/* --- SECTION 1: THE STORY (FATEHA TO THE WORLD) --- */}
      <section id="story-section" className="max-w-4xl mx-auto px-4 py-8 md:py-16 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-orange-200/80 p-6 sm:p-10 md:p-14 shadow-sm space-y-8">
          
          <div className="border-l-4 border-orange-600 pl-4 md:pl-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
              फतेहा से शुरुआत — एक विद्यार्थी का संकल्प
            </h2>
            <p className="text-sm font-bold text-orange-700 uppercase tracking-wider">
              मथुरा (श्री कृष्ण की जन्मभूमि) के एक छोटे से गांव की कहानी
            </p>
          </div>

          <div className="prose prose-orange max-w-none text-gray-700 text-base sm:text-lg leading-relaxed space-y-6">
            <p>
              नमस्कार, मेरा नाम <strong>मोहित तरकर</strong> है। मैं मथुरा जिले के एक छोटे से गांव <strong>&apos;फतेहा&apos;</strong> का रहने वाला एक विद्यार्थी हूँ। जब मैंने <strong>हिंदी भजन मंजरी</strong> की शुरुआत की, तो मेरा सपना बहुत सीधा था—भक्तों, गायकों और रचनाकारों के लिए एक ऐसा प्रामाणिक मंच बनाना जहाँ सनातन धर्म के भजन, आरती और स्तोत्र बिना किसी अशुद्धि या रुकावट के उपलब्ध हों।
            </p>

            <p>
              इंटरनेट पर अधिकांश धार्मिक वेबसाइटें विज्ञापनों (Ads) और पॉप-अप्स से भरी होती हैं, जो ईश्वर के ध्यान में खलल डालती हैं। इसी को बदलने के लिए मैंने अपनी पॉकेट मनी और बचत का एक-एक रुपया लगाकर इस डिजिटल धरोहर को तैयार किया। मैंने इसके सभी प्रीमियम फीचर्स, शुद्ध पीडीएफ डाउनलोड और भावार्थ संग्रह को पूरी तरह मुफ़्त रखा—ताकि भक्ति हर किसी के लिए सुलभ हो।
            </p>

            <div className="bg-orange-50/80 rounded-2xl p-6 border border-orange-200 text-gray-800 font-medium">
              &quot;मुफ़्त सेवा देना मेरा नैतिक निर्णय है, लेकिन इंटरनेट की दुनिया का एक कठोर सच यह भी है कि सर्वर, डोमेन और तकनीकी संसाधनों का खर्च कभी मुफ़्त नहीं होता।&quot;
            </div>

            <p>
              एक विद्यार्थी होने के नाते, मासिक सर्वर होस्टिंग, डोमेन शुल्क और डेटाबेस रखरखाव का खर्च अकेले उठाना अब कठिन होता जा रहा है। होस्टिंग कंपनियाँ या तकनीकी सेवा प्रदाता धर्म के नाम पर बिल माफ़ नहीं करते। बिना सामुदायिक सहयोग के, इस निस्वार्थ सेवा को लंबे समय तक जारी रख पाना असंभव हो जाएगा।
            </p>
          </div>

        </div>
      </section>

      {/* --- SECTION 2: TRANSPARENT COST BREAKDOWN --- */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4">
            आपका सहयोग कहाँ उपयोग होता है?
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            हम पूर्ण पारदर्शिता में विश्वास रखते हैं। आपके द्वारा दिया गया प्रत्येक रुपया सीधे इस डिजिटल धरोहर को जीवित रखने में लगाया जाता है।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm hover:border-orange-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center font-black text-xl mb-6">
                01
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">होस्टिंग और सर्वर खर्च</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                हज़ारों भक्तों को बिना किसी देरी के तेज़ स्पीड में भजन और भारी पीडीएफ उपलब्ध कराने के लिए क्लाउड सर्वर का मासिक शुल्क।
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-bold text-orange-600 uppercase tracking-wider">
              निरंतर निर्बाध सेवा
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm hover:border-orange-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-black text-xl mb-6">
                02
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">विज्ञापन-मुक्त पवित्रता</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                वेबसाइट पर कोई विज्ञापन (Ads) न हो, ताकि पाठ करते समय ध्यान भंग न हो। आपके सहयोग से ही हम विज्ञापन कंपनियों से मुक्त रहते हैं।
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-bold text-amber-600 uppercase tracking-wider">
              100% Ad-Free अनुभव
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm hover:border-orange-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center font-black text-xl mb-6">
                03
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">साहित्य संकलन एवं विस्तार</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                नए देवी-देवताओं के स्तोत्र, सटीक भावार्थ लेखन और प्रामाणिक ग्रंथों के डिजिटलीकरण का कार्य जारी रखने के लिए संसाधन।
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-bold text-green-600 uppercase tracking-wider">
              सनातन ज्ञान की रक्षा
            </div>
          </div>

        </div>
      </section>

      {/* --- SECTION 3: THE CROSSROADS & FINAL APPEAL --- */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-3xl p-8 sm:p-12 md:p-16 text-white text-center shadow-xl relative overflow-hidden">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              एक विनम्र आमंत्रण
            </span>

            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              क्या आप इस डिजिटल महायज्ञ में सहभागी बनेंगे?
            </h2>

            <p className="text-orange-100 text-base sm:text-lg leading-relaxed">
              अगर इस मंच से कभी भी आपकी प्रार्थना, गायन या आध्यात्मिक अध्ययन में थोड़ी भी सहायता हुई है, तो कृपया इसे जीवित रखने में अपना सहयोग दें। आपका छोटा सा योगदान भी इस विद्यापीठ को आने वाले वर्षों तक मुफ़्त और सुरक्षित रखेगा।
            </p>

            <div className="pt-4">
              <a
                href="#checkout-section"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-orange-700 hover:bg-orange-50 active:scale-95 font-black text-lg sm:text-xl rounded-2xl shadow-lg transition-all cursor-pointer scroll-smooth"
              >
                <span>सहयोग राशि जमा करें →</span>
              </a>
            </div>

            <p className="text-xs text-orange-200/80 pt-2 font-medium">
              आप ₹50, ₹100, ₹500 या अपनी इच्छानुसार कोई भी राशि सहयोग कर सकते हैं।
            </p>
          </div>

        </div>
      </section>

      {/* --- SECTION 4: FREQUENTLY ASKED QUESTIONS --- */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-8">
          अक्सर पूछे जाने वाले प्रश्न (FAQ)
        </h2>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">
              क्या सहयोग करना अनिवार्य है?
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              बिल्कुल नहीं। हिंदी भजन मंजरी का उपयोग हर भक्त के लिए हमेशा मुफ़्त रहेगा। यह सहयोग पूरी तरह से ऐच्छिक है, ताकि हम बिना किसी पेवॉल (Paywall) के सेवा जारी रख सकें।
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">
              मैं किस माध्यम से सहयोग राशि भेज सकता हूँ?
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              हम Razorpay गेटवे का उपयोग करते हैं। आप किसी भी UPI ऐप (Google Pay, PhonePe, Paytm), डेबिट/क्रेडिट कार्ड या नेट बैंकिंग के माध्यम से सुरक्षित भुगतान कर सकते हैं।
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">
              क्या मुझे सहयोग के बाद कोई रसीद मिलेगी?
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              हाँ, भुगतान सफल होते ही आपको स्क्रीन पर पेमेंट पावती (Payment ID) प्राप्त होगी और साथ ही Razorpay द्वारा आपके ईमेल पर एक डिजिटल पावती भेज दी जाएगी।
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER BACK LINK --- */}
      <div className="text-center pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-bold text-sm transition-colors"
        >
          <span>← मुख्य पृष्ठ पर वापस जाएँ</span>
        </Link>
      </div>

    </div>
  );
}