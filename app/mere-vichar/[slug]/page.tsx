import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { 
  FaWhatsapp, 
  FaArrowLeft, 
  FaPenNib, 
  FaQuoteLeft,
  FaBookOpen,
  FaFacebookF,
  FaXTwitter,
  FaRegClock,
  FaRegCalendar 
} from 'react-icons/fa6';
import { HiSparkles } from 'react-icons/hi';

// 🌟 Cache Strategy
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ==========================================
// 1. DYNAMIC & RICH SEO METADATA
// ==========================================
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: vichar } = await supabase
    .from('mere_vichar')
    .select('title_hindi, seo_title, meta_description, quote_text, created_at')
    .eq('slug', slug)
    .single();
  
  if (!vichar) return { title: 'रचना नहीं मिली | Hindi Bhajan Manjari' };
  
  const pageTitle = vichar.seo_title || `${vichar.title_hindi} - मोहित तरकर के विचार`;
  const pageDesc = vichar.meta_description || vichar.quote_text.substring(0, 160).replace(/\n/g, ' ') + '...';
  
  return {
    title: pageTitle,
    description: pageDesc,
    authors: [{ name: 'Mohit Tarkar' }],
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      type: 'article',
      publishedTime: vichar.created_at,
      authors: ['Mohit Tarkar'],
    }
  };
}

// ==========================================
// 2. HELPER COMPONENTS (Micro-Design Elements)
// ==========================================
const OrnateDivider = () => (
  // 🌟 FIX: Reduced margin from my-12 to my-8 for a tighter layout
  <div className="flex items-center justify-center w-full my-8 opacity-80 select-none pointer-events-none">
    <div className="h-[1px] w-full max-w-[80px] bg-gradient-to-r from-transparent to-[#D35400]/40"></div>
    <div className="px-3 text-[#D35400]/60 flex gap-1.5">
      <div className="w-1.5 h-1.5 rotate-45 bg-[#D35400]/60"></div>
      <div className="w-1.5 h-1.5 rotate-45 bg-[#D35400]/40"></div>
      <div className="w-1.5 h-1.5 rotate-45 bg-[#D35400]/60"></div>
    </div>
    <div className="h-[1px] w-full max-w-[80px] bg-gradient-to-l from-transparent to-[#D35400]/40"></div>
  </div>
);

const DecorativeCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const positioning = {
    tl: 'top-3 left-3 border-t-2 border-l-2',
    tr: 'top-3 right-3 border-t-2 border-r-2',
    bl: 'bottom-3 left-3 border-b-2 border-l-2',
    br: 'bottom-3 right-3 border-b-2 border-r-2',
  };
  return (
    <div className={`absolute w-6 h-6 md:w-8 md:h-8 border-[#D35400]/20 pointer-events-none ${positioning[position]}`}></div>
  );
};

// ==========================================
// 3. MAIN SERVER COMPONENT
// ==========================================
export default async function MereVicharDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 🌟 Deep Data Fetching
  const { data: vichar, error } = await supabase
    .from('mere_vichar')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !vichar) notFound();

  // 🌟 Derived Data for UI
  const publishDate = new Date(vichar.created_at).toLocaleDateString('hi-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  
  // Reading Time Calculation
  const wordCount = (vichar.quote_text.split(/\s+/).length) + (vichar.explanation ? vichar.explanation.split(/\s+/).length : 0);
  const readingTime = Math.max(1, Math.ceil(wordCount / 150));

  // 🌟 Social Sharing Links
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com'}/mere-vichar/${vichar.slug}`;
  const shareText = `✨ *${vichar.title_hindi}* ✨\n\n${vichar.quote_text}\n\n✍️ *- मोहित तरकर*\n\n📖 *पूरा भावार्थ पढ़ें:*\n${pageUrl}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const twitterShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(vichar.title_hindi)}&url=${encodeURIComponent(pageUrl)}`;

  // 🌟 Schema Markup (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": vichar.title_hindi,
    "author": { "@type": "Person", "name": "Mohit Tarkar" },
    "datePublished": vichar.created_at,
    "description": vichar.meta_description || vichar.title_hindi,
    "publisher": { "@type": "Organization", "name": "Hindi Bhajan Manjari" }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#2C2724] selection:bg-[#E5C2A4] selection:text-[#2C2724]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 🌟 FIX: Reduced background bloat from 60vh to a soft 400px gradient */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#F2E8DC]/80 to-transparent -z-10 pointer-events-none"></div>

      {/* 🌟 FIX: Slashed top padding from pt-32 to pt-8/pt-12 to pull content up */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-16">
        
        {/* ==========================================
            B. BREADCRUMBS & NAVIGATION
            ========================================== */}
        {/* 🌟 FIX: Reduced bottom margin of breadcrumbs (mb-10 -> mb-5) */}
        <nav className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-5 text-[#8B7D72]">
          <Link href="/" className="hover:text-[#D35400] transition-colors">Home</Link>
          <span className="text-[#D35400]/40">/</span>
          <Link href="/mere-vichar" className="hover:text-[#D35400] transition-colors">मेरे विचार</Link>
          <span className="text-[#D35400]/40">/</span>
          <span className="text-[#D35400] truncate max-w-[120px] md:max-w-[250px]">{vichar.title_hindi}</span>
        </nav>

        {/* ==========================================
            C. THE MASTERPIECE CONTAINER (Kavya Box)
            ========================================== */}
        <article className="relative bg-white border border-[#EBE3D5] rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_20px_60px_rgba(44,39,36,0.04)] overflow-hidden">
          
          <div className="absolute inset-2 md:inset-3 border border-[#F2E8DC]/60 rounded-[1rem] md:rounded-[2rem] pointer-events-none"></div>
          <DecorativeCorner position="tl" />
          <DecorativeCorner position="tr" />
          <DecorativeCorner position="bl" />
          <DecorativeCorner position="br" />

          {/* Background Watermark (Scaled down slightly) */}
          <FaQuoteLeft className="absolute top-8 left-8 text-[100px] md:text-[180px] text-[#F9F8F6] z-0 pointer-events-none select-none" />

          {/* 🌟 FIX: Drastically reduced internal padding (p-16 -> p-8 md:p-12) */}
          <div className="relative z-10 p-8 md:p-10 lg:p-12 flex flex-col items-center text-center">
            
            {/* Meta Info (Date & Read Time) */}
            <div className="flex items-center gap-3 text-[10px] md:text-xs font-semibold tracking-widest text-[#A69B91] uppercase mb-5">
              <span className="flex items-center gap-1.5"><FaRegCalendar className="mb-0.5"/> {publishDate}</span>
              <span className="w-1 h-1 rounded-full bg-[#D35400]/30"></span>
              <span className="flex items-center gap-1.5"><FaRegClock className="mb-0.5"/> {readingTime} Min Read</span>
            </div>

            {/* 🌟 FIX: Tightened Title margin and adjusted sizing to prevent excessive wrapping */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-[#3E2723] font-hindi leading-[1.2] text-balance mb-8 drop-shadow-sm">
              {vichar.title_hindi}
            </h1>

            {/* THE POEM */}
            <div className="relative inline-block w-full max-w-2xl mx-auto px-2 md:px-4">
              <HiSparkles className="absolute -top-6 -left-2 text-2xl text-[#D35400]/30 animate-pulse hidden md:block" />
              
              {/* 🌟 FIX: Reduced line-height from 2.2 to 1.9 to make the poem read more naturally */}
              <p className="font-hindi text-[20px] md:text-[28px] lg:text-[32px] font-bold text-[#4E342E] leading-[1.8] md:leading-[1.9] whitespace-pre-wrap tracking-wide drop-shadow-sm">
                {vichar.quote_text}
              </p>
              
              <HiSparkles className="absolute -bottom-6 -right-2 text-2xl text-[#D35400]/30 animate-pulse hidden md:block" />
            </div>

            <OrnateDivider />

            {/* Author Profile Block (Compacted) */}
            <div className="flex items-center gap-4 bg-[#FDFBF7] border border-[#F2E8DC] px-6 py-4 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D35400] to-[#E67E22] flex items-center justify-center text-white shadow-md shrink-0">
                <FaPenNib size={14} />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A69B91] block mb-0.5">रचनाकार</span>
                <h3 className="font-hindi font-black text-lg md:text-xl text-[#3E2723] leading-none">मोहित तरकर</h3>
              </div>
            </div>

          </div>
        </article>

        {/* ==========================================
            D. FLOATING ENGAGEMENT BAR
            ========================================== */}
        <div className="flex justify-center -mt-6 relative z-20 mb-12">
          <div className="flex items-center gap-2 md:gap-3 bg-white p-1.5 md:p-2 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-[#F2E8DC]">
            <a 
              href={whatsappShare} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-5 py-2.5 rounded-full font-bold tracking-wide text-xs md:text-sm transition-all hover:scale-105"
            >
              <FaWhatsapp size={18} /> <span className="hidden md:inline">शेयर करें</span>
            </a>
            <div className="w-px h-6 bg-[#F2E8DC]"></div>
            <a 
              href={facebookShare} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#F9F8F6] text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all"
              title="Share on Facebook"
            >
              <FaFacebookF size={16} />
            </a>
            <a 
              href={twitterShare} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#F9F8F6] text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-all"
              title="Share on Twitter"
            >
              <FaXTwitter size={16} />
            </a>
          </div>
        </div>

        {/* ==========================================
            E. THE EXPLANATION (Magazine Layout)
            ========================================== */}
        {vichar.explanation && (
          <section className="relative mt-8 max-w-3xl mx-auto px-2">
            <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full bg-gradient-to-b from-[#D35400] to-[#E5C2A4] rounded-full"></div>
            
            <div className="pl-6 md:pl-10 py-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#F2E8DC] text-[#D35400] p-2.5 rounded-xl">
                  <FaBookOpen size={18} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#3E2723] font-hindi leading-none">रचना का मर्म</h2>
                  <p className="text-[11px] md:text-xs font-semibold text-[#8B7D72] mt-1 tracking-wider uppercase">विस्तृत भावार्थ</p>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none prose-p:text-[#4E342E]">
                <p className="font-hindi text-[17px] md:text-[20px] leading-[2.1] font-medium whitespace-pre-wrap 
                  first-letter:text-6xl md:first-letter:text-7xl first-letter:font-black first-letter:text-[#D35400] 
                  first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:mb-[-8px]">
                  {vichar.explanation}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            F. FOOTER NAVIGATION
            ========================================== */}
        <div className="mt-16 border-t border-[#EBE3D5] pt-10 flex justify-center">
          <Link 
            href="/mere-vichar"
            className="group flex items-center gap-2 md:gap-3 bg-white hover:bg-[#F2E8DC] text-[#3E2723] border border-[#EBE3D5] px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[11px] md:text-xs transition-all shadow-sm hover:shadow-md"
          >
            <FaArrowLeft className="group-hover:-translate-x-2 transition-transform text-[#D35400]" size={14} /> 
            काव्य संग्रह में लौटें
          </Link>
        </div>

      </div>
    </div>
  );
}