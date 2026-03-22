import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/utils/supabase';
import { 
  FaGlobe, FaInstagram, FaEnvelope, 
  FaFacebookF, FaWhatsapp, // 🌟 नए इम्पोर्ट्स 
  FaCheckCircle, FaUserShield, FaPenNib, 
  FaMusic, FaQuoteLeft 
} from 'react-icons/fa';
import { FaOm, FaHandsPraying } from 'react-icons/fa6';

// ==========================================
// 🌟 CENTRAL AUTHOR CONFIGURATION (Enhanced)
// ==========================================
// ==========================================
// 🌟 CENTRAL AUTHOR CONFIGURATION
// ==========================================
export const AUTHORS: Record<string, any> = {
  'mohit-tarkar': {
    name: "Mohit Tarkar",
    nameHindi: "मोहित तरकर",
    role: "Founder & Chief Editor",
    bio: "A passionate seeker of Sanatan Dharma, Mohit Tarkar has spent years documenting rare bhajans and explaining the deep spiritual meanings behind ancient stotrams. He ensures every piece of content on Hindi Bhajan Manjari is fact-checked for religious accuracy and linguistic purity.",
    quote: "Sanatan Dharma is not just a religion, it's the ultimate science of life and cosmos.",
    expertise: ["Sanatan Dharma Literature", "Bhajan Preservation", "Vedic Philosophy"],
    image: "https://i.ibb.co/NddGCY05/Whats-App-Image-2026-02-28-at-12-37-16-AM.jpg",
    verified: true,
    stats: {
      articles: "5+",
      bhajans: "100+",
      experience: "5+ Years"
    },
    // 🌟 आपका नया Social Data
    social: {
      website: "https://www.hindibhajanmanjari.com",
      facebook: "https://www.facebook.com/mohit.tarkar.7121/",
      instagram: "https://www.instagram.com/imp.erfecto",
      whatsapp: "https://wa.me/918384844353",
      email: "mailto:nvsict06@gmail.com"
    }
  }
};

// ==========================================
// 🌟 DYNAMIC SOCIAL STYLES MAP
// ==========================================
// यहाँ हम हर प्लेटफ़ॉर्म का अपना ब्रांड कलर और आइकॉन सेट करते हैं
const SOCIAL_STYLES: Record<string, { icon: any, color: string, label: string }> = {
  website: { icon: FaGlobe, color: 'hover:bg-slate-800 hover:text-white', label: 'Website' },
  facebook: { icon: FaFacebookF, color: 'hover:bg-[#1877F2] hover:text-white text-blue-600', label: 'Facebook' },
  instagram: { icon: FaInstagram, color: 'hover:bg-[#E1306C] hover:text-white text-pink-600', label: 'Instagram' },
  whatsapp: { icon: FaWhatsapp, color: 'hover:bg-[#25D366] hover:text-white text-green-600', label: 'WhatsApp' },
  email: { icon: FaEnvelope, color: 'hover:bg-orange-500 hover:text-white text-orange-500', label: 'Email' }
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ==========================================
// 🌟 DYNAMIC SEO METADATA
// ==========================================
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = AUTHORS[slug];

  if (!author) return { title: 'Author Not Found' };

  return {
    title: `${author.name} (${author.nameHindi}) - ${author.role} | Hindi Bhajan Manjari`,
    description: author.bio,
    openGraph: {
      title: `${author.name} | Verified Publisher`,
      description: author.bio,
      images: [{ url: author.image, width: 800, height: 800 }],
      type: 'profile',
    }
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = AUTHORS[slug];

  if (!author) notFound();

  // ==========================================
  // 🌟 OPTIMIZATION: PARALLEL DATA FETCHING
  // Supabase queries now run at the EXACT same time!
  // ==========================================
  const [
    { data: recentArticles },
    { data: recentBhajans }
  ] = await Promise.all([
    supabase
      .from('articles')
      .select('title_hindi, title_hinglish, slug, read_time_minutes, created_at')
      .eq('author_slug', slug)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('bhajans')
      .select('title_hindi, title_hinglish, slug, created_at')
      .order('created_at', { ascending: false })
      .limit(4) // Assuming recent edits globally. Add .eq('editor_slug', slug) if you track it!
  ]);

  // ==========================================
  // 🌟 KNOWLEDGE GRAPH SCHEMA (JSON-LD)
  // ==========================================
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "alternateName": author.nameHindi,
    "jobTitle": author.role,
    "worksFor": {
      "@type": "Organization",
      "name": "Hindi Bhajan Manjari"
    },
    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/author/${slug}`,
    "image": author.image,
    "description": author.bio,
    "sameAs": Object.values(author.social).filter(Boolean) // Dynamically adds all active socials
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] pb-24 font-sans">
      
      {/* INJECT SCHEMA TO DOM */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      {/* ==========================================
          🌟 ELITE PROFILE HEADER
          ========================================== */}
      <div className="bg-white border-b border-gray-100/50 pt-20 pb-20 relative overflow-hidden shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100/40 via-red-50/20 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50/50 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute top-1/2 left-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent -translate-x-1/2"></div>

        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 relative z-10">
          
          {/* Avatar Area */}
          <div className="relative shrink-0 group flex flex-col items-center">
            <div className="absolute -inset-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition duration-700"></div>
            <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-[6px] border-white shadow-2xl bg-white">
              <Image 
                src={author.image} 
                alt={author.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 160px, 224px"
              />
            </div>
            {author.verified && (
              <div className="absolute bottom-4 right-2 md:bottom-8 md:right-4 bg-white p-1.5 rounded-full shadow-lg border border-gray-100 flex items-center gap-1.5 px-3" title="Verified Publisher">
                <FaCheckCircle className="text-blue-500 text-lg" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700">Verified</span>
              </div>
            )}
          </div>

          {/* Bio Area */}
          <div className="flex-1 text-center md:text-left pt-2 md:pt-4">
            
            <div className="inline-flex items-center gap-2 mb-5 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-xl border border-orange-100/50 shadow-sm">
              <FaUserShield className="text-orange-500 text-sm" />
              <span className="text-[11px] font-black uppercase tracking-widest text-orange-700">
                Editorial Board Member
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-3 justify-center md:justify-start">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">
                {author.name}
              </h1>
              <span className="text-xl md:text-2xl font-hindi text-gray-400 font-bold mb-1">
                ({author.nameHindi})
              </span>
            </div>

            <p className="text-orange-600 font-bold text-sm md:text-base uppercase tracking-[0.2em] mb-6">
              {author.role}
            </p>

            {/* Quick Stats Banner */}
            {author.stats && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 mb-8 pb-8 border-b border-gray-100">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-900">{author.stats.articles}</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Articles</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-900">{author.stats.bhajans}</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Bhajans Verified</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-900">{author.stats.experience}</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Experience</span>
                </div>
              </div>
            )}

            <p className="text-gray-600 leading-[1.8] max-w-3xl mb-8 font-medium text-lg md:text-xl">
              {author.bio}
            </p>

            {/* Author Quote */}
            {author.quote && (
              <div className="bg-gray-50/80 rounded-2xl p-6 border-l-4 border-orange-400 mb-8 max-w-3xl relative">
                <FaQuoteLeft className="absolute top-6 left-6 text-gray-200 text-4xl -z-10" />
                <p className="text-gray-700 italic font-medium text-lg relative z-10 pl-6">
                  "{author.quote}"
                </p>
              </div>
            )}
            
            {/* Expertise Tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-8">
              {author.expertise.map((skill: string) => (
                <span key={skill} className="bg-white text-gray-600 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 shadow-sm flex items-center gap-2">
                  <FaOm className="text-orange-400" /> {skill}
                </span>
              ))}
            </div>

            {/* Dynamic Social Links */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              {Object.entries(author.social).map(([platform, url]) => {
                if (!url || url === "#") return null;
                const style = SOCIAL_STYLES[platform];
                if (!style) return null;
                const Icon = style.icon;

                return (
                  <a 
                    key={platform}
                    href={url as string} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-gray-500 transition-all shadow-sm border border-gray-200 hover:-translate-y-1 hover:shadow-md ${style.color}`}
                    title={style.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          🌟 RECENT CONTRIBUTIONS SECTION
          ========================================== */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Gyan Articles Column */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                <span className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 shadow-inner">
                  <FaPenNib size={20} />
                </span>
                Latest Articles
              </h2>
            </div>
            
            <div className="space-y-4">
              {recentArticles && recentArticles.length > 0 ? (
                recentArticles.map((article) => (
                  <Link 
                    key={article.slug} 
                    href={`/gyan/${article.slug}`}
                    className="block bg-white p-6 rounded-[1.5rem] border border-gray-100/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-orange-200 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <h3 className="font-hindi text-xl md:text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-3 leading-tight">
                        {article.title_hindi}
                      </h3>
                      <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        <span className="flex items-center gap-1.5"><FaHandsPraying className="text-orange-400"/> {article.read_time_minutes} Min Read</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{new Date(article.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white border border-dashed border-gray-200 p-10 rounded-[2rem] text-center">
                  <FaPenNib className="mx-auto text-gray-300 text-3xl mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No recent articles published yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Edited Bhajans Column */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                <span className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shadow-inner">
                  <FaCheckCircle size={20} />
                </span>
                Verified Bhajans
              </h2>
            </div>

            <div className="space-y-4">
              {recentBhajans && recentBhajans.length > 0 ? (
                recentBhajans.map((bhajan) => (
                  <Link 
                    key={bhajan.slug} 
                    href={`/bhajan/${bhajan.slug}`}
                    className="flex items-center gap-5 bg-white p-4 pr-6 rounded-[1.5rem] border border-gray-100/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                      <FaMusic size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-hindi text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 leading-tight line-clamp-1">
                        {bhajan.title_hindi}
                      </h3>
                      <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 line-clamp-1">
                        {bhajan.title_hinglish}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white border border-dashed border-gray-200 p-10 rounded-[2rem] text-center">
                  <FaMusic className="mx-auto text-gray-300 text-3xl mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No recent bhajans verified yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}