import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { FaQuoteLeft, FaWhatsapp, FaArrowRight, FaPenNib } from 'react-icons/fa6';
import { HiSparkles } from 'react-icons/hi';

// 🌟 Cache Revalidation: नया विचार डालते ही 60 सेकंड में पेज अपडेट हो जाएगा
export const revalidate = 60;

// 🌟 SEO Metadata (गूगल सर्च के लिए)
export const metadata: Metadata = {
  title: 'मेरे विचार (Mere Vichar) - Mohit Tarkar | Hindi Bhajan Manjari',
  description: 'चीफ एडिटर मोहित तरकर की स्वरचित कविताएँ, प्रेरणादायक सुविचार और भक्तिमय रचनाएँ। जीवन और अध्यात्म पर गहरे विचार पढ़ें।',
  openGraph: {
    title: 'मेरे विचार - स्वरचित कविताएँ | Hindi Bhajan Manjari',
    description: 'सनातन धर्म, भक्ति और जीवन दर्शन पर मोहित तरकर की कुछ अपनी पंक्तियाँ और उनके गहरे भावार्थ।',
    type: 'website',
  }
};

export default async function MereVicharPage() {
  // डेटाबेस से कविताएँ Fetch करना
  const { data: vichars, error } = await supabase
    .from('mere_vichar')
    .select('title_hindi, slug, quote_text, created_at, view_count')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching vichars:", error);
  }

  const shareTextBase = "✨ *";

  return (
    <div className="min-h-screen bg-[#faf9f8] pb-24 font-sans selection:bg-orange-200">
      
      {/* ==========================================
          🌟 1. HERO SECTION (100% Responsive)
          ========================================== */}
      <div className="relative pt-20 md:pt-28 pb-12 md:pb-20 overflow-hidden border-b border-orange-100/50 bg-white shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
        <div className="absolute top-0 right-0 w-64 md:w-[500px] h-64 md:h-[500px] bg-gradient-to-br from-orange-50 via-red-50/20 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 md:w-96 h-48 md:h-96 bg-amber-50/50 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-orange-100 shadow-sm transition-transform hover:scale-105">
            <FaPenNib className="text-orange-500 text-xs md:text-sm" />
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-orange-700">
              Original Writings by Mohit Tarkar
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter font-hindi mb-4 md:mb-6 flex justify-center items-center gap-2 md:gap-4">
            <HiSparkles className="text-orange-400 text-2xl sm:text-3xl lg:text-4xl hidden sm:block animate-pulse" />
            मेरे विचार
            <HiSparkles className="text-orange-400 text-2xl sm:text-3xl lg:text-4xl hidden sm:block animate-pulse" />
          </h1>
          
          <p className="text-gray-600 font-hindi text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-[1.8] px-2">
            भक्ति, वैराग्य और जीवन के दर्शन पर मेरे मन की कुछ पंक्तियाँ। 
            यहाँ सिर्फ शब्द नहीं, बल्कि मेरी आत्मा के भाव हैं।
          </p>
        </div>
      </div>

      {/* ==========================================
          🌟 2. MASONRY GRID (Pinterest Style - Bug Fixed)
          ========================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 md:mt-16">
        
        {vichars && vichars.length > 0 ? (
          // 🌟 FIX: CSS Columns Layout. `gap-6` for horizontal, `mb-6` on child for vertical
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            
            {vichars.map((vichar) => {
              const teaser = vichar.quote_text.split('\n').slice(0, 4).join('\n');
              const shareMessage = `${shareTextBase}${vichar.title_hindi}* ✨\n\n${teaser}\n...\n\n📖 *पूरा भावार्थ पढ़ें:* \n${process.env.NEXT_PUBLIC_SITE_URL}/mere-vichar/${vichar.slug}\n\n✍️ *- मोहित तरकर*`;
              const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;

              return (
                <div 
                  key={vichar.slug} 
                  // 🌟 FIX: `mb-6` added here to ensure perfect vertical spacing in masonry
                  className="break-inside-avoid mb-6 bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:border-orange-200 transition-all duration-300 group relative overflow-hidden flex flex-col"
                >
                  {/* Background Watermark Quote Icon */}
                  <FaQuoteLeft className="absolute -top-4 -left-4 text-[100px] md:text-[120px] text-gray-50 opacity-60 group-hover:text-orange-50 group-hover:scale-110 transition-all duration-500 pointer-events-none -z-0" />
                  
                  <div className="relative z-10 flex-1">
                    <h2 className="font-hindi text-xl md:text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-orange-600 transition-colors">
                      {vichar.title_hindi}
                    </h2>
                    
                    {/* The Poem / Quote */}
                    <div className="font-hindi text-gray-700 text-[16px] md:text-[17px] leading-[1.8] font-medium whitespace-pre-line line-clamp-6 mb-6">
                      {vichar.quote_text}
                    </div>
                  </div>

                  {/* 🌟 FIX: Flex-wrap added for ultra-small screens */}
                  <div className="relative z-10 mt-auto pt-5 md:pt-6 border-t border-gray-50 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                    
                    <a 
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                      title="WhatsApp पर शेयर करें"
                    >
                      <FaWhatsapp size={18} />
                    </a>

                    <Link 
                      href={`/mere-vichar/${vichar.slug}`}
                      className="inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] md:text-[11px] text-orange-600 bg-orange-50 hover:bg-orange-100 px-5 py-2.5 rounded-full transition-colors flex-1 sm:flex-none text-center"
                    >
                      भावार्थ पढ़ें <FaArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ==========================================
             🌟 EMPTY STATE (Responsive & Polished)
             ========================================== */
          <div className="text-center py-16 md:py-24 px-4 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm max-w-3xl mx-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
              <FaPenNib className="text-2xl md:text-3xl text-gray-300" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-800 font-hindi mb-2">अभी यहाँ कोई रचना नहीं है</h3>
            <p className="text-sm md:text-base text-gray-500 font-hindi max-w-md mx-auto leading-relaxed">
              मोहित भाई जल्द ही अपनी पहली कविता यहाँ प्रकाशित करेंगे। तब तक, साइट पर मौजूद अन्य भजनों का आनंद लें।
            </p>
          </div>
        )}
      </div>

    </div>
  );
}