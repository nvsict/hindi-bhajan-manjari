import Link from 'next/link';
import { FaUserShield, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

interface AuthorBoxProps {
  authorName?: string;
  authorNameHindi?: string;
  authorSlug?: string;
  role?: string;
  roleHindi?: string;
  description?: string;
  descriptionHindi?: string;
  avatarUrl?: string; 
}

export default function AuthorBox({
  authorName = "Mohit Tarkar",
  authorNameHindi = "मोहित तरकर",
  authorSlug = "mohit-tarkar",
  role = "Founder & Chief Editor",
  roleHindi = "संस्थापक एवं मुख्य संपादक",
  description = "Fact-checked for religious accuracy and linguistic purity. Dedicated to preserving authentic Sanatan Dharma literature.",
  descriptionHindi = "धार्मिक सटीकता और भाषाई शुद्धता के लिए प्रमाणित। प्रामाणिक सनातन धर्म साहित्य के संरक्षण के लिए समर्पित।",
  avatarUrl = "https://i.ibb.co/NddGCY05/Whats-App-Image-2026-02-28-at-12-37-16-AM.jpg",
}: AuthorBoxProps) {
  return (
    // 🌟 SEO: Added Schema.org Microdata to define the "Person" entity directly in HTML
    <div 
      itemScope 
      itemType="https://schema.org/Person"
      className="relative mt-12 bg-gradient-to-br from-white to-orange-50/40 rounded-[2rem] p-6 md:p-10 shadow-xl shadow-orange-900/5 border border-orange-100/60 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center overflow-hidden group hover:shadow-2xl hover:shadow-orange-900/10 transition-all duration-500 hover:-translate-y-1"
    >
      
      {/* --- Decorative Background Glows --- */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-orange-200/40 to-red-200/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-orange-100/40 rounded-full blur-2xl pointer-events-none"></div>

      {/* --- Avatar Section --- */}
      <div className="relative shrink-0 z-10">
        <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-400 rounded-full p-[3px] shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow duration-500">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-[3px] border-white">
            {avatarUrl ? (
              <img 
                itemProp="image"
                src={avatarUrl} 
                alt={authorName} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
            ) : (
              <span className="text-3xl font-black text-orange-500">
                {authorName.charAt(0)}
              </span>
            )}
          </div>
        </div>
        
        {/* Verified Badge */}
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-50 group-hover:scale-110 transition-transform duration-300 delay-100">
          <FaCheckCircle className="text-blue-500 text-xl md:text-2xl drop-shadow-sm" title="Verified Publisher" />
        </div>
      </div>

      {/* --- Text Content --- */}
      <div className="flex-1 relative z-10 w-full">
        
        {/* Trust Tag */}
        <div className="inline-flex items-center gap-2 mb-3 bg-white px-3 py-1.5 rounded-lg border border-orange-100 shadow-sm">
          <FaUserShield className="text-orange-500 text-sm" />
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
            प्रमाणित प्रकाशक | Verified Publisher
          </span>
        </div>
        
        {/* Name & Role */}
        <div className="flex flex-col mb-4">
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
            <span itemProp="name">{authorNameHindi}</span>
            <span className="text-gray-300 text-xl font-normal hidden md:inline-block">|</span>
            <span className="text-lg md:text-2xl text-gray-700">{authorName}</span>
          </h3>
          <p className="text-sm font-bold text-gray-500 mt-1" itemProp="jobTitle">
            <span className="font-hindi text-orange-700">{roleHindi}</span> <span className="text-gray-400 mx-1">•</span> <span className="uppercase tracking-widest text-[11px]">{role}</span>
          </p>
        </div>
        
        {/* Description (Bilingual) */}
        <div className="mb-6 space-y-2">
          {/* 🌟 Hindi Primary Bio */}
          <p className="text-gray-800 text-base md:text-lg leading-[1.7] font-hindi font-medium" itemProp="description">
            {descriptionHindi}
          </p>
          {/* 🌟 English Secondary Bio */}
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>

        {/* E-E-A-T Link */}
        {/* 🌟 SEO: rel="author" tells Google exactly who wrote the page content */}
        <Link 
          href={`/author/${authorSlug}`} 
          rel="author"
          itemProp="url"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors group/link bg-white hover:bg-orange-50 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-orange-200 shadow-sm"
        >
          सम्पूर्ण प्रोफाइल देखें (View Full Profile)
          <FaArrowRight className="transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
        
      </div>
    </div>
  );
}