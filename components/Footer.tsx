"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useLenis } from 'lenis/react'; // 🌟 Imported Lenis for the Back to Top button
import {
  FaFacebook, FaInstagram, FaWhatsapp, FaArrowUp,
  FaEnvelope, FaGavel, FaShieldAlt, FaFileContract, FaHeart
} from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';
import { HiSparkles } from 'react-icons/hi';
// import { addSubscriber } from '../app/actions/subscribe';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  // 🌟 Grab the active Lenis instance
  const lenis = useLenis();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    // const result = await addSubscriber(email);
    setTimeout(() => {
      setStatus('success');
      setMessage("✨ जय श्री राम! आप हमारी संगत से जुड़ चुके हैं।");
      setEmail('');
    }, 1500);
  };

  // 🌟 Premium "Back to Top" glide using Lenis
  const scrollToTop = () => {
    if (lenis) {
      // Use Lenis for buttery-smooth scrolling to the very top (0px)
      lenis.scrollTo(0, { 
        duration: 1.2, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
      });
    } else {
      // Fallback just in case Lenis isn't ready
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0a0a0c] text-slate-400 mt-auto w-full border-t border-white/5 font-sans">

      {/* Top decorative line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      {/* 🌟 Scroll to Top Button */}
      <div className="max-w-7xl mx-auto px-6 relative">
        <button
          onClick={scrollToTop}
          className="absolute -top-5 right-6 md:right-0 bg-orange-600 text-white p-3 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:bg-orange-500 hover:-translate-y-1 transition-all z-20 group outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          aria-label="ऊपर जाएं (Back to top)"
        >
          <FaArrowUp size={18} className="group-hover:animate-bounce" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* 1. Brand Identity */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg w-fit">
              <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center border border-orange-600/20 group-hover:bg-orange-600/20 transition-colors">
                <GiLotusFlower className="text-3xl text-orange-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tighter leading-none">
                  HINDI <span className="text-orange-500">BHAJAN</span>
                </span>
                <span className="text-[10px] text-slate-500 tracking-[0.2em] uppercase font-bold mt-1">
                  Manjari
                </span>
              </div>
            </Link>
            <p className="text-sm leading-[1.8] pr-4 text-slate-400 font-hindi">
              आपके प्रिय भजनों, आरती और चालीसा का प्रामाणिक डिजिटल संग्रह। सनातन संस्कृति और भक्ति परंपरा को आने वाली पीढ़ियों के लिए संजोने का एक छोटा सा प्रयास।
            </p>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5 font-hindi">
                ब्रज भूमि में <FaHeart className="text-red-500 text-[12px]" /> के साथ निर्मित
              </span>
            </div>
          </div>

          {/* 2. Sacred Collections (भक्ति सागर) */}
          <div>
            <h3 className="text-white font-black mb-6 text-lg md:text-xl font-hindi flex items-center gap-2">
              <HiSparkles className="text-orange-500 text-base" /> भक्ति सागर
            </h3>
            <ul className="space-y-4 text-sm">
              <li><FooterLink href="/category/aarti">सम्पूर्ण आरती संग्रह</FooterLink></li>
              <li><FooterLink href="/category/chalisa">श्री चालीसा पाठ</FooterLink></li>
              <li><FooterLink href="/category/bhajan">लोकप्रिय भजन</FooterLink></li>
              <li><FooterLink href="/category/festivals">त्यौहार विशेष गीत</FooterLink></li>
              <li><FooterLink href="/deity/krishna">राधा-कृष्ण रसिया</FooterLink></li>
            </ul>
          </div>

          {/* 3. Quick Links (महत्वपूर्ण लिंक्स) */}
          <div>
            <h3 className="text-white font-black mb-6 text-lg md:text-xl font-hindi flex items-center gap-2">
              <HiSparkles className="text-orange-500 text-base" /> सहायता एवं जानकारी
            </h3>
            <ul className="space-y-4 text-sm">
              <li><FooterLink href="/about" icon={<HiSparkles size={12} />}>हमारी यात्रा (About Us)</FooterLink></li>
              <li><FooterLink href="/submit" overrideColor="text-orange-400 font-bold">✍️ अपने भजन भेजें</FooterLink></li>
              <li><FooterLink href="/contact" icon={<FaEnvelope size={12} />}>संपर्क करें (Contact)</FooterLink></li>
              <li><FooterLink href="/privacy" icon={<FaShieldAlt size={12} />}>गोपनीयता नीति (Privacy)</FooterLink></li>
              <li><FooterLink href="/dmca" icon={<FaGavel size={12} />}>कॉपीराइट (DMCA)</FooterLink></li>
              <li><FooterLink href="/terms" icon={<FaFileContract size={12} />}>नियम व शर्तें (Terms)</FooterLink></li>
            </ul>
          </div>

          {/* 4. Newsletter & Socials (भक्ति रस से जुड़ें) */}
          <div className="lg:pl-4">
            <h3 className="text-white font-black mb-4 text-lg md:text-xl font-hindi">नियमित अपडेट्स पाएं</h3>
            <p className="text-sm text-slate-400 mb-6 leading-[1.8] font-hindi">
              नए भजनों के लिरिक्स, उनका अर्थ और आगामी त्यौहारों की विशेष जानकारी सीधे अपने इनबॉक्स में प्राप्त करें।
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="अपना ईमेल दर्ज़ करें..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-hindi placeholder:font-hindi placeholder:text-slate-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-bold font-hindi text-base md:text-lg py-3 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.3)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.4)] flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]"
              >
                {status === 'loading' ? 'कृपया प्रतीक्षा करें...' : 'हमारी संगत से जुड़ें'}
              </button>
              {message && (
                <p className={`text-sm text-center font-bold font-hindi mt-2 ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {message}
                </p>
              )}
            </form>

            <div className="mt-10">
              <p className="text-sm text-slate-500 font-bold mb-4 font-hindi">सोशल मीडिया पर जुड़ें</p>
              <div className="flex gap-3 flex-wrap">
                <SocialIcon href="https://wa.me/918384844353" icon={<FaWhatsapp />} color="hover:bg-green-600" label="WhatsApp" />
                <SocialIcon href="https://www.instagram.com/imp.erfecto_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" icon={<FaInstagram />} color="hover:bg-pink-600" label="Instagram" />
                <SocialIcon href="https://www.facebook.com/mohit.tarkar.7121/" icon={<FaFacebook />} color="hover:bg-blue-600" label="Facebook" />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium text-center md:text-left font-hindi leading-relaxed">
            © {new Date().getFullYear()}{' '}
            <span className="text-slate-300 font-bold font-sans">Hindi Bhajan Manjari</span>. 
            <br className="md:hidden" /> दुनिया भर के भक्तों के लिए भक्ति भाव से निर्मित।
          </p>
          <div className="flex items-center gap-6 text-[13px] font-bold text-slate-500 font-hindi">
            <Link href="/sitemap.xml" className="hover:text-orange-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded">
              साइटमैप (Sitemap)
            </Link>
            <a
              href="mailto:nvsict06@gmail.com"
              className="hover:text-orange-400 font-sans tracking-wide transition-colors underline underline-offset-4 decoration-orange-500/30 hover:decoration-orange-500 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
            >
              nvsict06@gmail.com
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

// --- Helper Components ---

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  overrideColor?: string;
  icon?: React.ReactNode;
}

function FooterLink({ href, children, overrideColor, icon }: FooterLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 font-hindi text-base hover:text-orange-400 hover:translate-x-1 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded w-fit ${overrideColor ?? 'text-slate-400'}`}
    >
      {icon && <span className="text-slate-500">{icon}</span>}
      {children}
    </Link>
  );
}

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  color: string;
  label: string;
}

function SocialIcon({ href, icon, color, label }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 ${color} hover:text-white transition-all duration-300 border border-white/5 hover:border-transparent hover:shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-orange-500`}
    >
      {icon}
    </a>
  );
}