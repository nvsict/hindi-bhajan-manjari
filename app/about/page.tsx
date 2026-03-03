import { GiLotusFlower, GiMeditation, GiTempleGate } from 'react-icons/gi';
import { FaHeart, FaUniversalAccess, FaMobileAlt, FaShieldAlt, FaFont } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Link from 'next/link';
import Image from 'next/image'; 
import { Metadata } from 'next'; 
import AuthorBox from '@/components/AuthorBox'; 

// ==========================================
// 🌟 1. SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'About Us - Our Spiritual Mission | Hindi Bhajan Manjari',
  description: 'Learn about our mission to preserve sacred Hindu lyrics and provide a high-quality, easily accessible digital space for devotees worldwide.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/about',
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-orange-100 selection:text-orange-900">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-600 to-orange-500 py-24 px-4">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10 pointer-events-none">
          <GiLotusFlower size={400} className="text-white" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-700/30 backdrop-blur-sm border border-orange-400/30 px-5 py-2 rounded-full text-orange-50 text-xs md:text-sm font-bold mb-8 uppercase tracking-widest shadow-sm">
            <HiSparkles /> हमारी आध्यात्मिक यात्रा (Our Mission)
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 drop-shadow-sm tracking-tighter leading-tight">
            Preserving Devotion <br /> For the <span className="text-orange-200">Digital Age</span>
          </h1>
          <p className="text-orange-50 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-95 font-medium">
            Hindi Bhajan Manjari is a digital temple dedicated to the preservation of sacred Hindu lyrics, offering a beautifully formatted, user-friendly environment for devotees worldwide.
          </p>
        </div>
      </section>

      {/* --- STATS / QUICK INFO --- */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <GiTempleGate />, label: "Traditional Roots", text: "Curating timeless bhajans from ancient scriptures and traditions." },
            { icon: <GiMeditation />, label: "Soulful Experience", text: "A clean, modern interface designed for reading comfort." },
            { icon: <FaShieldAlt />, label: "Verified Accuracy", text: "Every lyric is fact-checked for linguistic and spiritual purity." }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-orange-900/5 border border-orange-50 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl text-orange-500 mb-4 bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">{item.icon}</div>
              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">{item.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- CORE STORY SECTION (🌟 BILINGUAL & PREMIUM) --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 tracking-tighter leading-tight">
            The Vision Behind <br />
            <span className="text-orange-600">Hindi Bhajan Manjari</span>
          </h2>
          
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
            <p>
              In an era where spiritual content is often scattered across poorly formatted websites with inaccurate translations, we saw the immediate need for a <strong>Dedicated Digital Space.</strong>
            </p>
            
            {/* 🌟 THE HINDI CONNECTION: Shows cultural authenticity */}
            <div className="bg-orange-50/50 border-l-4 border-orange-500 p-6 rounded-r-2xl my-8">
              <p className="font-hindi text-xl leading-[1.8] text-gray-800">
                "आज के डिजिटल युग में जहाँ इंटरनेट पर असीमित जानकारी है, एक शुद्ध और प्रामाणिक भक्ति मंच की आवश्यकता थी। हमारा उद्देश्य सनातन धर्म की अमूल्य धरोहर—हमारे प्राचीन भजन, आरती और स्तोत्र—को उनके शुद्धतम रूप में सहेजना है।"
              </p>
            </div>

            <p>
              Spirituality requires focus. Whether you are performing a morning Aarti, participating in a Satsang, or learning a new Chalisa, the technology should support your connection with the divine. We cross-reference every lyric with traditional scriptures to ensure that what you read is accurate and faithful to the original composition.
            </p>
          </div>
        </div>
        
        <div className="bg-orange-100 rounded-[2.5rem] p-4 relative shadow-inner">
            <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl grayscale-[15%] hover:grayscale-0 transition-all duration-700 border-2 border-white">
              <Image 
                src="https://plus.unsplash.com/premium_photo-1691763916216-d64cfad0f42e?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Spiritual Culture" 
                fill
                className="object-cover hover:scale-105 transition-transform duration-1000"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl hidden md:block border border-orange-50 z-10 animate-fade-in-up">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  <FaShieldAlt />
                </div>
                <div>
                  <p className="text-gray-900 font-black text-2xl">100%</p>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Verified Content</p>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* --- 🌟 E-E-A-T SECTION: THE EDITORIAL TEAM --- */}
      <section className="bg-orange-50/30 py-20 px-6 border-y border-orange-100/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">Meet the Editor</h2>
            <p className="text-gray-500 font-medium">Committed to cultural preservation and editorial excellence.</p>
          </div>
          {/* This component alone satisfies major Google AdSense trust requirements */}
          <AuthorBox />
        </div>
      </section>

      {/* --- UNIQUE FEATURES GRID --- */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter">A Better Way to Worship</h2>
            <p className="text-gray-500 font-medium text-lg">Built with modern technology for timeless traditions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FaMobileAlt />}
              title="Screen Wake Lock"
              desc="Your screen won't dim or lock while you are reading a long Aarti, Chalisa, or Stotram."
            />
            {/* 🌟 CORRECTED: Updated to Multi-Script Support */}
            <FeatureCard 
              icon={<FaUniversalAccess />}
              title="Multi-Script Support"
              desc="Read instantly in Devanagari, Romanized (English), Gujarati, Bengali, Telugu, Kannada, Malayalam, and Odia."
            />
            <FeatureCard 
              icon={<FaHeart />}
              title="Personal Favorites"
              desc="Save the bhajans you love to your personal library (Sangrah) for easy access during daily puja."
            />
            {/* 🌟 CORRECTED: Removed Night Mode, kept Adjustable Font Size */}
            <FeatureCard 
              icon={<FaFont />}
              title="Adjustable Text Size"
              desc="Easily increase or decrease the lyric font sizes for a comfortable, strain-free reading experience."
            />
            <FeatureCard 
              icon={<HiSparkles />}
              title="Spiritual Meaning"
              desc="We don't just provide lyrics; we provide the 'Bhavarth' (meaning) to help you understand the depth of the composition."
            />
            <FeatureCard 
              icon={<FaShieldAlt />}
              title="Verified Accuracy"
              desc="Curated by experts to ensure every 'Matra' and 'Shlok' is linguistically and culturally correct."
            />
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-24 px-6 text-center bg-gray-50">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-600 to-orange-700 rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-orange-900/20">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">Become Part of the Manjari</h2>
            <p className="text-orange-100 mb-10 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
              Our collection grows every day through the contributions and suggestions of devoted readers like you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/submit" 
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
              >
                Submit a Bhajan
              </Link>
              <Link 
                href="/contact" 
                className="bg-orange-800/50 backdrop-blur-md text-white border border-orange-400/50 px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-orange-800 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
              >
                Contact Us
              </Link>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500 rounded-full opacity-50 pointer-events-none blur-2xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-800 rounded-full opacity-50 pointer-events-none blur-2xl"></div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-300 hover:-translate-y-1 group">
      <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 text-2xl mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm font-medium">
        {desc}
      </p>
    </div>
  );
}