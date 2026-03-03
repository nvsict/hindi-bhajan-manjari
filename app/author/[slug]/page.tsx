import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/utils/supabase';
import { FaTwitter, FaLinkedin, FaGlobe, FaCheckCircle, FaUserShield, FaPenNib, FaMusic } from 'react-icons/fa';

// ==========================================
// 🌟 CENTRAL AUTHOR CONFIGURATION
// You can move this to a separate file (e.g., config/authors.ts) later if you add more editors.
// ==========================================
export const AUTHORS: Record<string, any> = {
  'mohit-tarkar': {
    name: "Mohit Tarkar",
    nameHindi: "मोहित तरकर",
    role: "Founder & Chief Editor",
    bio: "A passionate seeker of Sanatan Dharma, Mohit has spent years documenting rare bhajans and explaining the deep spiritual meanings behind ancient stotrams. He ensures every piece of content on Hindi Bhajan Manjari is fact-checked for religious accuracy and linguistic purity.",
    expertise: ["Sanatan Dharma Literature", "Sanskrit Translation", "Bhajan Preservation"],
    image: "https://i.ibb.co/NddGCY05/Whats-App-Image-2026-02-28-at-12-37-16-AM.jpg",
    verified: true,
    social: {
      twitter: "#",
      linkedin: "#",
      website: "https://www.hindibhajanmanjari.com"
    }
  }
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
    title: `${author.name} - ${author.role} | Hindi Bhajan Manjari`,
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
  // 🌟 FETCH REAL CONTRIBUTIONS FROM SUPABASE
  // ==========================================
  // 1. Fetch Gyan Articles written by this author
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('title_hindi, title_hinglish, slug, read_time_minutes, created_at')
    .eq('author_slug', slug)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(4);

  // 2. Fetch recent Bhajans edited/verified by the Chief Editor
  const { data: recentBhajans } = await supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug, created_at')
    .order('created_at', { ascending: false })
    .limit(4);

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
    "sameAs": [
      author.social.website,
      author.social.twitter,
      author.social.linkedin
    ].filter(Boolean)
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-24">
      
      {/* INJECT SCHEMA TO DOM */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      {/* ==========================================
          🌟 ELITE PROFILE HEADER
          ========================================== */}
      <div className="bg-white border-b border-gray-100 pt-16 pb-16 relative overflow-hidden shadow-sm">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-100/40 to-red-50/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50/60 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative z-10">
          
          {/* Avatar Area */}
          <div className="relative shrink-0 group">
            <div className="absolute -inset-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-700"></div>
            <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-[4px] border-white shadow-xl bg-white">
              <Image 
                src={author.image} 
                alt={author.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 144px, 192px"
              />
            </div>
            {author.verified && (
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white p-1 rounded-full shadow-lg border border-gray-50" title="Verified Publisher">
                <FaCheckCircle className="text-blue-500 text-2xl drop-shadow-sm" />
              </div>
            )}
          </div>

          {/* Bio Area */}
          <div className="flex-1 text-center md:text-left pt-2 md:pt-4">
            
            <div className="inline-flex items-center gap-2 mb-4 bg-orange-50/50 px-4 py-2 rounded-xl border border-orange-100 shadow-sm">
              <FaUserShield className="text-orange-500 text-sm" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">
                Editorial Board Member
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tighter">
              {author.name}
            </h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-6">
              {author.role}
            </p>
            <p className="text-gray-700 leading-[1.8] max-w-2xl mb-6 font-medium text-lg md:text-xl">
              {author.bio}
            </p>
            
            {/* Expertise Tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-8">
              {author.expertise.map((skill: string) => (
                <span key={skill} className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-100">
                  {skill}
                </span>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              {author.social.website && author.social.website !== "#" && (
                <a href={author.social.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-500 hover:bg-orange-600 hover:text-white transition-all shadow-sm border border-gray-100 hover:border-transparent">
                  <FaGlobe size={20} />
                </a>
              )}
              {author.social.twitter && author.social.twitter !== "#" && (
                <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-500 hover:bg-blue-400 hover:text-white transition-all shadow-sm border border-gray-100 hover:border-transparent">
                  <FaTwitter size={20} />
                </a>
              )}
              {author.social.linkedin && author.social.linkedin !== "#" && (
                <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-500 hover:bg-blue-700 hover:text-white transition-all shadow-sm border border-gray-100 hover:border-transparent">
                  <FaLinkedin size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          🌟 RECENT CONTRIBUTIONS SECTION (Actual Data)
          ========================================== */}
      <div className="max-w-5xl mx-auto px-6 mt-16">
        
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Gyan Articles Column */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tighter">
              <FaPenNib className="text-orange-500" /> Latest Articles
            </h2>
            <div className="space-y-4">
              {recentArticles && recentArticles.length > 0 ? (
                recentArticles.map((article) => (
                  <Link 
                    key={article.slug} 
                    href={`/gyan/${article.slug}`}
                    className="block bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all group"
                  >
                    <h3 className="font-hindi text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1 leading-tight">
                      {article.title_hindi}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      <span>{article.read_time_minutes} Min Read</span>
                      <span>•</span>
                      <span>{new Date(article.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl text-center text-gray-500 text-sm font-medium">
                  No recent articles published yet.
                </div>
              )}
            </div>
          </div>

          {/* Edited Bhajans Column */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tighter">
              <FaMusic className="text-orange-500" /> Recent Editorial Reviews
            </h2>
            <div className="space-y-4">
              {recentBhajans && recentBhajans.length > 0 ? (
                recentBhajans.map((bhajan) => (
                  <Link 
                    key={bhajan.slug} 
                    href={`/bhajan/${bhajan.slug}`}
                    className="block bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all group"
                  >
                    <h3 className="font-hindi text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1 leading-tight">
                      {bhajan.title_hindi}
                    </h3>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      {bhajan.title_hinglish} Lyrics
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl text-center text-gray-500 text-sm font-medium">
                  No recent bhajans verified yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}