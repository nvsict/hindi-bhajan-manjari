import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Hind } from 'next/font/google';
import SuccessFlow from './SuccessFlow';

// 🌟 Initialize the Hind font with Devanagari support
const hind = Hind({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari', 'latin'],
  display: 'swap',
});

// Initialize Supabase Admin client safely on the server
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function DonatePage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string; payment_id?: string };
}) {
  const isSuccess = searchParams.success === 'true';
  const hasError = !!searchParams.error;
  const paymentId = searchParams.payment_id;

  let donatedAmount = 0;

  // ==========================================
  // 1. FETCH AMOUNT FROM SUPABASE (If Success)
  // ==========================================
  if (isSuccess && paymentId) {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('amount')
        .eq('razorpay_payment_id', paymentId)
        .single();
        
      if (data && data.amount) {
        donatedAmount = data.amount;
      } else {
        donatedAmount = 101; 
      }
    } catch (err) {
      console.error("Error fetching donation amount:", err);
      donatedAmount = 101;
    }

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
          <a href="/pay.html" className="block w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all mb-3">
            पुनः प्रयास करें
          </a>
          <Link href="/" className="block w-full py-3 text-gray-500 hover:text-gray-800 font-bold transition-all">
            मुख्य पृष्ठ पर लौटें
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. DEFAULT STATE (Rich Landing Page)
  // ==========================================
  return (
    <div className={`min-h-screen bg-[#fffaf5] pb-20 ${hind.className}`}>
      
      {/* Hero Section */}
      <div className="pt-16 pb-12 px-4 text-center max-w-3xl mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 text-orange-600 font-bold text-6xl flex items-center justify-center bg-orange-50 rounded-full border border-orange-200 shadow-sm">
          ॐ
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          धर्म कार्य में सहभागी बनें
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 font-medium leading-relaxed">
          हमारा उद्देश्य सनातन धर्म के अनमोल भजनों, स्तोत्रों और चालीसाओं को हर घर तक मुफ़्त और बिना किसी रुकावट के पहुँचाना है। इस डिजिटल महायज्ञ में आपकी एक छोटी सी आहुति बड़ा बदलाव ला सकती है।
        </p>
        
        <a 
          href="/pay.html" 
          className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xl rounded-full shadow-lg shadow-orange-600/30 transition-all"
        >
          <span>सहयोग राशि जमा करें</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          100% सुरक्षित भुगतान (Razorpay)
        </div>
      </div>

      {/* Impact Section - Why Donate? */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">आपका सहयोग कहाँ उपयोग होता है?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.485a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">विज्ञापन-मुक्त अनुभव</h3>
            <p className="text-gray-600 font-medium">
              ईश्वर की भक्ति में कोई बाधा न आए, इसलिए हम इस वेबसाइट को पूरी तरह से विज्ञापनों (Ads) से मुक्त रखते हैं।
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">सर्वर और सुरक्षा</h3>
            <p className="text-gray-600 font-medium">
              तेज़ रफ़्तार और सुरक्षित सर्वर का मासिक खर्च उठाने में आपका दान सीधा योगदान देता है।
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">नई सामग्री का संकलन</h3>
            <p className="text-gray-600 font-medium">
              नए भजनों, आरतियों और दुर्लभ स्तोत्रों को ढूँढकर उन्हें डिजिटल रूप में सहेजने के कार्य में मदद मिलती है।
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}