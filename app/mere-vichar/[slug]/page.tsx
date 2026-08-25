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
  <div className="flex items-center justify-center w-full my-12 opacity-90 select-none pointer-events-none">
    <div className="h-[1px] w-full max-w-[120px] bg-gradient-to-r from-transparent to-[#D35400]/40"></div>
    <div className="px-4 text-[#D35400]/60 flex gap-2">
      <div className="w-2 h-2 rotate-45 bg-[#D35400]/60"></div>
      <div className="w-2 h-2 rotate-45 bg-[#D35400]/40"></div>
      <div className="w-2 h-2 rotate-45 bg-[#D35400]/60"></div>
    </div>
    <div className="h-[1px] w-full max-w-[120px] bg-gradient-to-l from-transparent to-[#D35400]/40"></div>
  </div>
);

const DecorativeCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const positioning = {
    tl: 'top-4 left-4 border-t-2 border-l-2',
    tr: 'top-4 right-4 border-t-2 border-r-2',
    bl: 'bottom-4 left-4 border-b-2 border-l-2',
    br: 'bottom-4 right-4 border-b-2 border-r-2',
  };
  return (
    <div className={`absolute w-8 h-8 md:w-12 md:h-12 border-[#D35400]/20 pointer-events-none ${positioning[position]}`}></div>
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
  
  // Reading Time Calculation (Roughly 150 words per minute)
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
      
      {/* JSON-LD Script Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ==========================================
          A. EDITORIAL HERO BACKGROUND
          ========================================== */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-[#F2E8DC] to-[#F9F8F6] -z-10 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D35400]/20 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-24">
        
        {/* ==========================================
            B. BREADCRUMBS & NAVIGATION
            ========================================== */}
        <nav className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-bold tracking-widest uppercase mb-10 text-[#8B7D72]">
          <Link href="/" className="hover:text-[#D35400] transition-colors">Home</Link>
          <span className="text-[#D35400]/40">/</span>
          <Link href="/mere-vichar" className="hover:text-[#D35400] transition-colors">मेरे विचार</Link>
          <span className="text-[#D35400]/40">/</span>
          <span className="text-[#D35400] truncate max-w-[150px] md:max-w-[300px]">{vichar.title_hindi}</span>
        </nav>

        {/* ==========================================
            C. THE MASTERPIECE CONTAINER (Kavya Box)
            ========================================== */}
        <article className="relative bg-white border border-[#EBE3D5] rounded-[2rem] md:rounded-[3rem] shadow-[0_30px_80px_rgba(44,39,36,0.06)] overflow-hidden">
          
          {/* Aesthetic Borders & Corners */}
          <div className="absolute inset-2 md:inset-3 border border-[#F2E8DC]/60 rounded-[1.5rem] md:rounded-[2.5rem] pointer-events-none"></div>
          <DecorativeCorner position="tl" />
          <DecorativeCorner position="tr" />
          <DecorativeCorner position="bl" />
          <DecorativeCorner position="br" />

          {/* Background Watermark */}
          <FaQuoteLeft className="absolute top-12 left-12 text-[150px] md:text-[250px] text-[#F9F8F6] z-0 pointer-events-none select-none" />

          <div className="relative z-10 p-8 md:p-16 lg:p-20 flex flex-col items-center text-center">
            
            {/* Meta Info (Date & Read Time) */}
            <div className="flex items-center gap-4 text-xs md:text-sm font-semibold tracking-widest text-[#A69B91] uppercase mb-8">
              <span className="flex items-center gap-1.5"><FaRegCalendar className="mb-0.5"/> {publishDate}</span>
              <span className="w-1 h-1 rounded-full bg-[#D35400]/30"></span>
              <span className="flex items-center gap-1.5"><FaRegClock className="mb-0.5"/> {readingTime} Min Read</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#3E2723] font-hindi leading-[1.3] text-balance mb-12 drop-shadow-sm">
              {vichar.title_hindi}
            </h1>

            {/* THE POEM (Perfectly Spaced & Centered) */}
            <div className="relative inline-block w-full max-w-2xl mx-auto px-4">
              <HiSparkles className="absolute -top-8 -left-4 text-3xl text-[#D35400]/30 animate-pulse hidden md:block" />
              
              <p className="font-hindi text-[24px] md:text-[34px] lg:text-[40px] font-bold text-[#4E342E] leading-[2.2] md:leading-[2.2] whitespace-pre-wrap tracking-wide drop-shadow-sm">
                {vichar.quote_text}
              </p>
              
              <HiSparkles className="absolute -bottom-8 -right-4 text-3xl text-[#D35400]/30 animate-pulse hidden md:block" />
            </div>

            <OrnateDivider />

            {/* Author Profile Block */}
            <div className="flex flex-col items-center bg-[#FDFBF7] border border-[#F2E8DC] px-8 py-5 rounded-2xl shadow-sm">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#A69B91] mb-2">रचनाकार</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D35400] to-[#E67E22] flex items-center justify-center text-white shadow-md">
                  <FaPenNib size={16} />
                </div>
                <div className="text-left">
                  <h3 className="font-hindi font-black text-lg md:text-xl text-[#3E2723] leading-none">मोहित तरकर</h3>
                  <p className="text-xs font-semibold text-[#8B7D72] mt-1">चीफ एडिटर, हिंदी भजन मंजरी</p>
                </div>
              </div>
            </div>

          </div>
        </article>

        {/* ==========================================
            D. FLOATING ENGAGEMENT BAR
            ========================================== */}
        <div className="flex justify-center -mt-8 relative z-20 mb-20">
          <div className="flex items-center gap-3 bg-white p-2 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-[#F2E8DC]">
            <a 
              href={whatsappShare} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-full font-bold tracking-wide text-sm transition-all hover:scale-105"
            >
              <FaWhatsapp size={20} /> <span className="hidden md:inline">शेयर करें</span>
            </a>
            <div className="w-px h-8 bg-[#F2E8DC]"></div>
            <a 
              href={facebookShare} target="_blank" rel="noopener noreferrer"
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F9F8F6] text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all"
              title="Share on Facebook"
            >
              <FaFacebookF size={18} />
            </a>
            <a 
              href={twitterShare} target="_blank" rel="noopener noreferrer"
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F9F8F6] text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-all"
              title="Share on Twitter"
            >
              <FaXTwitter size={18} />
            </a>
          </div>
        </div>

        {/* ==========================================
            E. THE EXPLANATION (Magazine Layout)
            ========================================== */}
        {vichar.explanation && (
          <section className="relative mt-8 max-w-3xl mx-auto">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#D35400] to-[#E5C2A4] rounded-full"></div>
            
            <div className="pl-8 md:pl-12 py-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#F2E8DC] text-[#D35400] p-3 rounded-xl">
                  <FaBookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-[#3E2723] font-hindi leading-none">रचना का मर्म</h2>
                  <p className="text-sm font-semibold text-[#8B7D72] mt-1">विस्तृत भावार्थ</p>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none prose-p:text-[#4E342E]">
                {/* 
                  Drop-Cap Effect Implementation:
                  The first letter of the explanation will be huge, bold, and colored, 
                  giving a true premium literary magazine feel.
                */}
                <p className="font-hindi text-[18px] md:text-[21px] leading-[2.1] font-medium whitespace-pre-wrap 
                  first-letter:text-7xl first-letter:font-black first-letter:text-[#D35400] 
                  first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:mb-[-12px]">
                  {vichar.explanation}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            F. FOOTER NAVIGATION
            ========================================== */}
        <div className="mt-24 border-t border-[#EBE3D5] pt-12 flex justify-center">
          <Link 
            href="/mere-vichar"
            className="group flex items-center gap-3 bg-white hover:bg-[#F2E8DC] text-[#3E2723] border border-[#EBE3D5] px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-sm hover:shadow-md"
          >
            <FaArrowLeft className="group-hover:-translate-x-2 transition-transform text-[#D35400]" /> 
            काव्य संग्रह में लौटें
          </Link>
        </div>

      </div>
    </div>
  );
}