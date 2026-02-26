import { GiLotusFlower, GiMeditation, GiTempleGate } from 'react-icons/gi';
import { FaEye, FaHeart, FaUniversalAccess, FaMobileAlt, FaCloudSun } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Link from 'next/link';
import Image from 'next/image'; // 🌟 Imported Next.js Image
import { Metadata } from 'next'; // 🌟 Imported Metadata

// ==========================================
// 🌟 1. SEO METADATA (Only works on Server Components)
// ==========================================
export const metadata: Metadata = {
  title: 'About Us | Hindi Bhajan Manjari',
  description: 'Learn about our mission to preserve sacred Hindu lyrics and provide a pure, distraction-free digital space for devotees worldwide.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/about',
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-orange-100 selection:text-orange-900">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-600 to-orange-500 py-24 px-4">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10 pointer-events-none">
          <GiLotusFlower size={400} className="text-white" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-700/30 backdrop-blur-sm border border-orange-400/30 px-4 py-1.5 rounded-full text-orange-50 text-sm font-bold mb-8 uppercase tracking-widest">
            <HiSparkles /> Our Spiritual Mission
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-sm">
            Preserving Devotion <br /> For the <span className="text-orange-200">Digital Age</span>
          </h1>
          <p className="text-orange-50 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-90">
            Hindi Bhajan Manjari is a digital temple dedicated to the preservation of sacred Hindu lyrics, offering a serene, ad-free environment for devotees worldwide.
          </p>
        </div>
      </section>

      {/* --- STATS / QUICK INFO --- */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <GiTempleGate />, label: "Traditional Roots", text: "Curating timeless bhajans from ancient traditions." },
            { icon: <GiMeditation />, label: "Soulful Experience", text: "Clean interface designed for deep contemplation." },
            { icon: <FaEye />, label: "Clarity First", text: "High-contrast text and zero visual clutter." }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-xl shadow-orange-900/5 border border-orange-50 flex flex-col items-center text-center">
              <div className="text-4xl text-orange-500 mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.label}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- CORE STORY SECTION --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
            The Vision Behind <br />
            <span className="text-orange-600">Hindi Bhajan Manjari</span>
          </h2>
          <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
            <p>
              In an era where spiritual content is often buried under cluttered websites and aggressive advertisements, we saw the need for a <strong>"Pure Digital Space."</strong>
            </p>
            <p>
              Spirituality requires focus. Whether you are performing a morning Aarti, participating in a Satsang, or learning a new Chalisa, the technology should never get in the way of your connection with the divine.
            </p>
            <p>
              We cross-reference every lyric with traditional scriptures and popular renditions to ensure that what you read is accurate and faithful to the original composition.
            </p>
          </div>
        </div>
        
        <div className="bg-orange-100 rounded-[2rem] p-4 relative">
            {/* 🌟 2. Implemented Next.js Image with a landscape aspect ratio */}
            <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden shadow-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-700 border border-orange-200">
              <Image 
                src="https://images.unsplash.com/photo-1545063914-a1a6ec821c88?auto=format&fit=crop&q=80&w=800" 
                alt="Spiritual Culture" 
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl hidden md:block border border-orange-50 z-10">
              <p className="text-orange-600 font-black text-2xl">100%</p>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-tighter">Verified Content</p>
            </div>
        </div>
      </section>

      {/* --- UNIQUE FEATURES GRID --- */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">A Better Way to Worship</h2>
            <p className="text-gray-500">Built with modern technology for timeless traditions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FaMobileAlt />}
              title="Screen Wake Lock"
              desc="Your screen won't dim or lock while you are reading a long Aarti or Chalisa."
            />
            <FeatureCard 
              icon={<FaUniversalAccess />}
              title="Dual Language"
              desc="Seamlessly switch between Hindi script and Hinglish (Romanized) for easier reading."
            />
            <FeatureCard 
              icon={<FaHeart />}
              title="Personal Favorites"
              desc="Save the bhajans you love to your personal library for offline access during puja."
            />
            <FeatureCard 
              icon={<FaCloudSun />}
              title="Morning/Night Modes"
              desc="Adjustable font sizes and soft colors to protect your eyes during early morning prayers."
            />
            <FeatureCard 
              icon={<HiSparkles />}
              title="Spiritual Meaning"
              desc="We don't just provide lyrics; we provide the 'Bhavarth' to help you understand the depth."
            />
            <FeatureCard 
              icon={<HiSparkles />}
              title="Verified Accuracy"
              desc="Curated by experts to ensure every 'Matra' and 'Shlok' is linguistically correct."
            />
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-orange-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-orange-200">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Become Part of the Manjari</h2>
            <p className="text-orange-100 mb-10 text-lg">
              Our collection grows every day through the contributions and suggestions of devotees like you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/submit" 
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-orange-50 transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                Submit a Bhajan
              </Link>
              <Link 
                href="/contact" 
                className="bg-orange-700 text-white border border-orange-500 px-8 py-4 rounded-full font-bold hover:bg-orange-800 transition-all hover:scale-105 active:scale-95"
              >
                Contact Us
              </Link>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500 rounded-full opacity-50 pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-700 rounded-full opacity-50 pointer-events-none"></div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 transition-all group">
      <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 text-2xl mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}