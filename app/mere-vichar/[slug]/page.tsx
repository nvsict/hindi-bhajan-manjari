import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { FaQuoteLeft, FaQuoteRight, FaWhatsapp, FaArrowLeft, FaPenNib } from 'react-icons/fa6';
import { FaHandsPraying } from 'react-icons/fa6';

// 🌟 Cache Revalidation (60 seconds)
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ==========================================
// 🌟 DYNAMIC SEO METADATA (Google Search Optimization)
// ==========================================
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: vichar } = await supabase
    .from('mere_vichar')
    .select('title_hindi, seo_title, meta_description, quote_text')
    .eq('slug', slug)
    .single();

  if (!vichar) return { title: 'रचना नहीं मिली | Hindi Bhajan Manjari' };

  // SEO Fallbacks if specific metadata is missing
  const pageTitle = vichar.seo_title || `${vichar.title_hindi} - मोहित तरकर के विचार`;
  const pageDesc = vichar.meta_description || vichar.quote_text.substring(0, 150).replace(/\n/g, ' ') + '...';

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      type: 'article',
      authors: ['Mohit Tarkar'],
    }
  };
}

// ==========================================
// 🌟 SERVER COMPONENT
// ==========================================
export default async function MereVicharDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // डेटाबेस से फुल डेटा Fetch करना
  const { data: vichar, error } = await supabase
    .from('mere_vichar')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !vichar) {
    notFound(); // अगर URL गलत है तो 404 पेज पर भेज दो
  }

  // 🌟 Schema Markup (JSON-LD) - Google को बताने के लिए कि यह एक ओरिजिनल कोट है
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quotation",
    "text": vichar.quote_text,
    "author": {
      "@type": "Person",
      "name": "Mohit Tarkar"
    },
    "about": {
      "@type": "Thing",
      "name": vichar.title_hindi,
      "description": vichar.explanation
    },
    "datePublished": vichar.created_at
  };

  // WhatsApp शेयरिंग मैसेज
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com'}/mere-vichar/${vichar.slug}`;
  const shareMessage = `✨ *${vichar.title_hindi}* ✨\n\n${vichar.quote_text}\n\n✍️ *- मोहित तरकर*\n\n📖 *पूरा भावार्थ यहाँ पढ़ें:*\n${pageUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="min-h-screen bg-[#faf9f8] pb-24 font-sans selection:bg-orange-200">
      
      {/* 🌟 Schema Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 md:pt-32">
        
        {/* ==========================================
            🌟 TOP NAVIGATION (Back Button)
            ========================================== */}
        <Link 
          href="/mere-vichar" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold uppercase tracking-widest text-xs mb-8 md:mb-12 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
        >
          <FaArrowLeft /> सभी रचनाएँ
        </Link>

        {/* ==========================================
            🌟 THE QUOTE SECTION (Center Aligned Masterpiece)
            ========================================== */}
        <div className="relative bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border border-orange-100/60 shadow-[0_10px_40px_rgb(0,0,0,0.03)] overflow-hidden text-center">
          
          {/* Aesthetic Background Touches */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-50 to-transparent rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
          <FaQuoteLeft className="absolute top-4 left-4 md:top-8 md:left-8 text-[80px] md:text-[140px] text-gray-50 opacity-40 pointer-events-none -z-0" />
          
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black text-orange-600 font-hindi mb-10 tracking-wide">
              {vichar.title_hindi}
            </h1>

            {/* The Poetry */}
            <div className="inline-block relative">
              <FaQuoteLeft className="absolute -top-4 -left-6 md:-left-10 text-xl md:text-2xl text-orange-300" />
              <p className="font-hindi text-[22px] md:text-[32px] font-bold text-gray-900 leading-[1.8] md:leading-[1.8] whitespace-pre-line px-4">
                {vichar.quote_text}
              </p>
              <FaQuoteRight className="absolute -bottom-4 -right-6 md:-right-10 text-xl md:text-2xl text-orange-300" />
            </div>

            {/* Author Signature */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="w-10 h-[1px] bg-gray-300"></div>
              <span className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-gray-500">
                <FaPenNib className="text-orange-400" /> मोहित तरकर
              </span>
              <div className="w-10 h-[1px] bg-gray-300"></div>
            </div>
          </div>
        </div>

        {/* ==========================================
            🌟 SHARE BAR (Floating-style inline bar)
            ========================================== */}
        <div className="flex justify-center -mt-6 relative z-20 mb-16">
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <FaWhatsapp size={20} />
            <span className="font-bold tracking-wide text-sm">WhatsApp पर शेयर करें</span>
          </a>
        </div>

        {/* ==========================================
            🌟 THE EXPLANATION (Left Aligned, Magazine Style)
            ========================================== */}
        {vichar.explanation && (
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                <FaHandsPraying size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 font-hindi">
                भावार्थ (Explanation)
              </h2>
            </div>
            
            <div className="prose prose-lg prose-orange max-w-none">
              <p className="font-hindi text-[17px] md:text-[19px] leading-[2] text-gray-700 font-medium whitespace-pre-line">
                {vichar.explanation}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}