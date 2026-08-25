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
  description: 'चीफ एडिटर मोहित तरकर की स्वरचित कविताएँ, प्रेरणादायक सुविचार और भक्तिमय रचनाएँ। जीवन और अध्यात्म पर गहरे विचार पढ़ें।',
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
  <div className="flex items-center justify-center w-full my-6 opacity-70 select-none pointer-events-none">
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
  // डेटाबेस से कविताएँ Fetch करना (Latest First)
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
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#2C2724] selection:bg-[#E5C2A4] selection:text-[#2C2724] pb-24">
      
      {/* ==========================================
          🌟 1. EDITORIAL HERO SECTION
          ========================================== */}
      <div className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden border-b border-[#EBE3D5] bg-white">
        
        {/* Subtle Background Gradients matching the detail page */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#F2E8DC] via-[#E5C2A4]/20 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-[#F2E8DC] to-transparent rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 mb-8 bg-[#FDFBF7] px-5 py-2.5 rounded-full border border-[#EBE3D5] shadow-sm">
            <FaPenNib className="text-[#D35400] text-sm" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#8B7D72]">
              The Poetry Journal of Mohit Tarkar
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#3E2723] tracking-tight font-hindi mb-6 flex justify-center items-center gap-3 md:gap-5 drop-shadow-sm">
            <HiSparkles className="text-[#D35400]/40 text-3xl sm:text-4xl hidden sm:block animate-pulse" />
            मेरे विचार
            <HiSparkles className="text-[#D35400]/40 text-3xl sm:text-4xl hidden sm:block animate-pulse" />
          </h1>
          
          <p className="text-[#6D6055] font-hindi text-lg md:text-xl max-w-2xl mx-auto leading-[1.9] font-medium">
            भक्ति, वैराग्य और जीवन के दर्शन पर उकेरे गए मेरे मन के भाव।<br className="hidden md:block"/> 
            यहाँ सिर्फ शब्द नहीं, बल्कि आत्मा की पुकार है।
          </p>

          <OrnateDivider />
        </div>
      </div>

      {/* ==========================================
          🌟 2. THE EDITORIAL MASONRY GRID
          ========================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
        
        {vichars && vichars.length > 0 ? (
          
          /* CSS Columns Layout for Masonry Grid */
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
            
            {vichars.map((vichar) => {
              
              // Formatting Date for the Card
              const publishDate = new Date(vichar.created_at).toLocaleDateString('hi-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
              });

              // WhatsApp Share Configuration
              const teaser = vichar.quote_text.split('\n').slice(0, 4).join('\n');
              const shareMessage = `${shareTextBase}${vichar.title_hindi}* ✨\n\n${teaser}\n...\n\n📖 *पूरा भावार्थ पढ़ें:* \n${process.env.NEXT_PUBLIC_SITE_URL}/mere-vichar/${vichar.slug}\n\n✍️ *- मोहित तरकर*`;
              const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;

              return (
                <article 
                  key={vichar.slug} 
                  className="break-inside-avoid mb-8 bg-white rounded-[2rem] p-8 md:p-10 border border-[#EBE3D5] shadow-[0_10px_30px_rgba(44,39,36,0.03)] hover:shadow-[0_20px_50px_rgba(44,39,36,0.08)] hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden flex flex-col"
                >
                  {/* Subtle Background Watermark Quote */}
                  <FaQuoteLeft className="absolute -top-4 -left-4 text-[120px] text-[#F9F8F6] z-0 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[-5deg]" />
                  
                  <div className="relative z-10 flex-1">
                    
                    {/* Date & Meta */}
                    <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-[#A69B91] mb-6">
                      <FaRegCalendar className="text-[#D35400]/60" />
                      {publishDate}
                    </div>

                    {/* Title */}
                    <Link href={`/mere-vichar/${vichar.slug}`} className="block">
                      <h2 className="font-hindi text-2xl md:text-[28px] font-black text-[#3E2723] mb-5 leading-[1.2] group-hover:text-[#D35400] transition-colors decoration-[#D35400]/30 underline-offset-8 group-hover:underline">
                        {vichar.title_hindi}
                      </h2>
                    </Link>
                    
                    {/* The Poetry Snippet */}
                    <div className="font-hindi text-[#4E342E] text-[17px] md:text-[19px] leading-[2.1] font-medium whitespace-pre-line line-clamp-5 mb-8">
                      {vichar.quote_text}
                    </div>
                  </div>

                  {/* Footer of the Card: Action Bar */}
                  <div className="relative z-10 mt-auto pt-6 border-t border-[#F2E8DC] flex items-center justify-between gap-4">
                    
                    <a 
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-[#FDFBF7] text-[#25D366] border border-[#EBE3D5] hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all shadow-sm"
                      title="WhatsApp पर शेयर करें"
                    >
                      <FaWhatsapp size={20} />
                    </a>

                    <Link 
                      href={`/mere-vichar/${vichar.slug}`}
                      className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.15em] text-[11px] text-[#D35400] bg-[#FDFBF7] border border-[#EBE3D5] hover:bg-[#F2E8DC] px-6 py-3 rounded-full transition-all flex-1 sm:flex-none text-center"
                    >
                      भावार्थ पढ़ें <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* ==========================================
             🌟 EMPTY STATE (Poetic & Aesthetic)
             ========================================== */
          <div className="text-center py-20 md:py-32 px-4 bg-white rounded-[3rem] border border-[#EBE3D5] shadow-sm max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-8 border border-[#EBE3D5]">
              <FaPenNib className="text-3xl text-[#D35400]/50" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-[#3E2723] font-hindi mb-4">अभी यहाँ कोई रचना नहीं है</h3>
            <p className="text-base md:text-lg text-[#8B7D72] font-hindi max-w-md mx-auto leading-[1.8]">
              मोहित भाई जल्द ही अपनी डायरी के पन्नों से पहली रचना यहाँ प्रकाशित करेंगे।
            </p>
          </div>
        )}
      </div>

    </div>
  );
}