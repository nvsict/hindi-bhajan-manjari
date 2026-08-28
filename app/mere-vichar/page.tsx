import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { 
  FaQuoteLeft, 
  FaWhatsapp, 
  FaArrowRight, 
  FaPenNib,
  FaRegCalendar
} from 'react-icons/fa6';
import { HiSparkles } from 'react-icons/hi';

// 🌟 Cache Revalidation (60 seconds)
export const revalidate = 60;

// ==========================================
// 🌟 SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'मेरे विचार (Mere Vichar) - Mohit Tarkar | Hindi Bhajan Manjari',
  description: 'चीफ एडिटर मोहित तरकर की स्वरचित कविताएँ, प्रेरणादायक सुविचार और भक्तिमय रचनाएँ। जीवन और अध्यात्म पर गहरे विचार पढ़ें।',
  openGraph: {
    title: 'मेरे विचार - स्वरचित कविताएँ | Hindi Bhajan Manjari',
    description: 'सनातन धर्म, भक्ति और जीवन दर्शन पर मोहित तरकर की कुछ अपनी पंक्तियाँ और उनके गहरे भावार्थ।',
    type: 'website',
  }
};

// ==========================================
// 🌟 HELPER COMPONENT: ORNATE DIVIDER
// ==========================================
const OrnateDivider = () => (
  // 🌟 FIX: Reduced vertical margin from my-6 to my-4
  <div className="flex items-center justify-center w-full my-4 opacity-70 select-none pointer-events-none">
    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D35400]/40"></div>
    <div className="px-3 text-[#D35400]/50 flex gap-1.5">
      <div className="w-1.5 h-1.5 rotate-45 bg-[#D35400]/50"></div>
      <div className="w-1.5 h-1.5 rotate-45 bg-[#D35400]/50"></div>
    </div>
    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D35400]/40"></div>
  </div>
);

// ==========================================
// 🌟 MAIN SERVER COMPONENT
// ==========================================
export default async function MereVicharPage() {
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
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#2C2724] selection:bg-[#E5C2A4] selection:text-[#2C2724] pb-20">
      
      {/* ==========================================
          🌟 1. EDITORIAL HERO SECTION (Space Optimized)
          ========================================== */}
      {/* 🌟 FIX: Drastically reduced padding: pt-24->pt-12, pb-24->pb-10 */}
      <div className="relative pt-12 md:pt-16 pb-8 md:pb-12 overflow-hidden border-b border-[#EBE3D5] bg-white">
        
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#F2E8DC] via-[#E5C2A4]/20 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-[#F2E8DC] to-transparent rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 mb-5 bg-[#FDFBF7] px-4 py-2 rounded-full border border-[#EBE3D5] shadow-sm">
            <FaPenNib className="text-[#D35400] text-xs" />
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-[#8B7D72]">
              The Poetry Journal of Mohit Tarkar
            </span>
          </div>
          
          {/* 🌟 FIX: Slightly smaller text to prevent wrapping on smaller screens, reduced bottom margin */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#3E2723] tracking-tight font-hindi mb-4 flex justify-center items-center gap-3 md:gap-5 drop-shadow-sm">
            <HiSparkles className="text-[#D35400]/40 text-2xl sm:text-3xl hidden sm:block animate-pulse" />
            मेरे विचार
            <HiSparkles className="text-[#D35400]/40 text-2xl sm:text-3xl hidden sm:block animate-pulse" />
          </h1>
          
          {/* 🌟 FIX: Reduced text size slightly for a tighter look */}
          <p className="text-[#6D6055] font-hindi text-base md:text-lg max-w-2xl mx-auto leading-[1.8] font-medium">
            भक्ति, वैराग्य और जीवन के दर्शन पर उकेरे गए मेरे मन के भाव।<br className="hidden md:block"/> 
            यहाँ सिर्फ शब्द नहीं, बल्कि आत्मा की पुकार है।
          </p>

          <OrnateDivider />
        </div>
      </div>

      {/* ==========================================
          🌟 2. THE EDITORIAL MASONRY GRID
          ========================================== */}
      {/* 🌟 FIX: Pulled the grid closer to the hero section (mt-12 -> mt-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-10">
        
        {vichars && vichars.length > 0 ? (
          
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
            
            {vichars.map((vichar) => {
              
              const publishDate = new Date(vichar.created_at).toLocaleDateString('hi-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
              });

              const teaser = vichar.quote_text.split('\n').slice(0, 4).join('\n');
              const shareMessage = `${shareTextBase}${vichar.title_hindi}* ✨\n\n${teaser}\n...\n\n📖 *पूरा भावार्थ पढ़ें:* \n${process.env.NEXT_PUBLIC_SITE_URL}/mere-vichar/${vichar.slug}\n\n✍️ *- मोहित तरकर*`;
              const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;

              return (
                <article 
                  key={vichar.slug} 
                  className="break-inside-avoid mb-8 bg-white rounded-[2rem] p-7 md:p-8 border border-[#EBE3D5] shadow-[0_10px_30px_rgba(44,39,36,0.03)] hover:shadow-[0_20px_50px_rgba(44,39,36,0.08)] hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden flex flex-col"
                >
                  <FaQuoteLeft className="absolute -top-4 -left-4 text-[120px] text-[#F9F8F6] z-0 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[-5deg]" />
                  
                  <div className="relative z-10 flex-1">
                    
                    <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-[#A69B91] mb-5">
                      <FaRegCalendar className="text-[#D35400]/60" />
                      {publishDate}
                    </div>

                    <Link href={`/mere-vichar/${vichar.slug}`} className="block">
                      <h2 className="font-hindi text-xl md:text-2xl font-black text-[#3E2723] mb-4 leading-[1.3] group-hover:text-[#D35400] transition-colors decoration-[#D35400]/30 underline-offset-8 group-hover:underline">
                        {vichar.title_hindi}
                      </h2>
                    </Link>
                    
                    <div className="font-hindi text-[#4E342E] text-[16px] md:text-[17px] leading-[2.1] font-medium whitespace-pre-line line-clamp-5 mb-6">
                      {vichar.quote_text}
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto pt-5 border-t border-[#F2E8DC] flex items-center justify-between gap-4">
                    
                    <a 
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-[#FDFBF7] text-[#25D366] border border-[#EBE3D5] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all shadow-sm"
                      title="WhatsApp पर शेयर करें"
                    >
                      <FaWhatsapp size={18} />
                    </a>

                    <Link 
                      href={`/mere-vichar/${vichar.slug}`}
                      className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.15em] text-[10px] md:text-[11px] text-[#D35400] bg-[#FDFBF7] border border-[#EBE3D5] hover:bg-[#F2E8DC] px-5 py-2.5 rounded-full transition-all flex-1 sm:flex-none text-center"
                    >
                      भावार्थ पढ़ें <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 md:py-24 px-4 bg-white rounded-[3rem] border border-[#EBE3D5] shadow-sm max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#EBE3D5]">
              <FaPenNib className="text-2xl text-[#D35400]/50" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-[#3E2723] font-hindi mb-3">अभी यहाँ कोई रचना नहीं है</h3>
            <p className="text-sm md:text-base text-[#8B7D72] font-hindi max-w-md mx-auto leading-[1.8]">
              मोहित भाई जल्द ही अपनी डायरी के पन्नों से पहली रचना यहाँ प्रकाशित करेंगे।
            </p>
          </div>
        )}
      </div>

    </div>
  );
}