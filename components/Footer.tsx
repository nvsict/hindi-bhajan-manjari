"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLenis } from 'lenis/react';
import { supabase } from '@/utils/supabase'; 
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaArrowUp,
  FaEnvelope,
  FaGavel,
  FaShieldAlt,
  FaFileContract,
  FaHeart,
  FaExclamationCircle,
  FaBook,
  FaEnvelopeOpenText,
  FaPenNib,
  FaPrint
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const lenis = useLenis();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email: email.toLowerCase().trim() }]);

      if (error) {
        if (error.code === '23505' || error.message.includes('unique')) {
          setStatus('success');
          setMessage("🙏 आप पहले से ही हमारी संगत में जुड़े हुए हैं!");
          setEmail('');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setMessage("✨ जय श्री राम! आप हमारी संगत से जुड़ चुके हैं।");
        setEmail('');
      }
    } catch (err: any) {
      console.error("Newsletter Error:", err);
      setStatus('error');
      setMessage("सर्वर में कुछ समस्या है, कृपया थोड़ी देर बाद प्रयास करें।");
    }
  };

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { 
        duration: 1.2, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0a0a0c] text-slate-300 mt-auto w-full border-t border-white/5 font-sans relative">

      {/* Top decorative glowing line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-600/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-orange-400/80 to-transparent blur-[2px]" />

      {/* Scroll to Top Button */}
      <div className="max-w-7xl mx-auto px-6 relative">
        <button
          onClick={scrollToTop}
          className="absolute -top-5 right-6 md:right-0 bg-gradient-to-br from-orange-600 to-orange-700 text-white p-3 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_25px_rgba(234,88,12,0.6)] hover:-translate-y-1 transition-all z-20 group outline-none focus-visible:ring-2 focus-visible:ring-orange-400 border border-orange-400/50"
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
            <Link
              href="/"
              className="flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg w-fit"
            >
              <div className="relative flex items-center justify-center origin-left transition-transform duration-300 group-hover:-rotate-3 w-12 h-12 bg-white/5 rounded-xl border border-white/10 p-2 shadow-inner">
                <Image 
                  src="/favicon.ico" 
                  alt="Hindi Bhajan Manjari" 
                  width={40} 
                  height={40} 
                  className="object-contain drop-shadow-md brightness-110"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tighter leading-none transition-colors group-hover:text-orange-50">
                  HINDI <span className="text-orange-500">BHAJAN</span>
                </span>

                <span className="text-[10px] text-slate-400 tracking-[0.2em] uppercase font-bold mt-1">
                  Manjari
                </span>
              </div>
            </Link>
            
            <p className="text-sm leading-[1.8] pr-4 text-slate-300 font-hindi">
              आपके प्रिय भजनों, आरती और चालीसा का सावधानीपूर्वक संकलित डिजिटल संग्रह। सनातन संस्कृति और भक्ति परंपरा से जुड़े पाठ, अर्थ और उपयोगी जानकारी को सरल रूप में प्रस्तुत करने का एक प्रयास।
            </p>

            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 shadow-inner backdrop-blur-sm w-fit mt-2">
              <span className="text-[13px] font-medium text-slate-200 flex items-center gap-2 font-hindi tracking-wide">
                ब्रज भूमि में <FaHeart className="text-red-500/90 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" size={12} /> के साथ निर्मित
              </span>
            </div>
          </div>

          {/* 2. Sacred Collections & Services */}
          <div className="lg:pl-4 flex flex-col gap-10">
            {/* Sacred Collections */}
            <div>
              <h3 className="text-white font-black mb-5 text-lg md:text-xl font-hindi flex items-center gap-2">
                <HiSparkles className="text-orange-500 text-base" /> भक्ति सागर
              </h3>
              <ul className="space-y-3.5 text-sm">
                <li><FooterLink href="/category/aarti">सम्पूर्ण आरती संग्रह</FooterLink></li>
                <li><FooterLink href="/category/chalisa">श्री चालीसा पाठ</FooterLink></li>
                <li><FooterLink href="/category/navratri-special">नवरात्रि स्पेशल</FooterLink></li>
                <li><FooterLink href="/category/stotram">दिव्य स्तोत्रम</FooterLink></li>
                <li><FooterLink href="/deity/shri-radha-krishna">राधा-कृष्ण भजन</FooterLink></li>
              </ul>
            </div>

            {/* 🌟 Premium Services (NEW) */}
            <div>
              <h3 className="text-white font-black mb-5 text-lg md:text-xl font-hindi flex items-center gap-2">
                <HiSparkles className="text-orange-500 text-base" /> विशेष सेवाएँ
              </h3>
              <ul className="space-y-3.5 text-sm">
                <li>
                  <FooterLink 
                    href="/letter-from-braj" 
                    icon={<FaEnvelopeOpenText size={12} />}
                    overrideColor="text-orange-400 font-bold"
                  >
                    ब्रज से पत्र (New)
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/publication-test" icon={<FaPrint size={12} />}>
                    प्रकाशन सेवा
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/submit" icon={<FaPenNib size={12} />}>
                    अपने भजन भेजें
                  </FooterLink>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Quick Links (Legal & Help) */}
          <div>
            <h3 className="text-white font-black mb-6 text-lg md:text-xl font-hindi flex items-center gap-2">
              <HiSparkles className="text-orange-500 text-base" /> कानूनी एवं सहायता
            </h3>

            <ul className="space-y-4 text-sm">
              <li>
                <FooterLink href="/about" icon={<HiSparkles size={12} />}>
                  हमारी यात्रा (About Us)
                </FooterLink>
              </li>

              <li>
                <FooterLink href="/contact" icon={<FaEnvelope size={12} />}>
                  संपर्क करें (Contact Us)
                </FooterLink>
              </li>

              <li>
                <FooterLink href="/privacy" icon={<FaShieldAlt size={12} />}>
                  गोपनीयता नीति (Privacy)
                </FooterLink>
              </li>

              <li>
                <FooterLink href="/dmca" icon={<FaGavel size={12} />}>
                  कॉपीराइट (DMCA)
                </FooterLink>
              </li>

              <li>
                <FooterLink href="/terms" icon={<FaFileContract size={12} />}>
                  नियम व शर्तें (Terms)
                </FooterLink>
              </li>

              <li>
                <FooterLink href="/disclaimer" icon={<FaExclamationCircle size={12} />}>
                  अस्वीकरण (Disclaimer)
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* 4. Newsletter & Socials */}
          <div>
            <h3 className="text-white font-black mb-4 text-lg md:text-xl font-hindi">
              नियमित अपडेट्स पाएं
            </h3>

            <p className="text-sm text-slate-300 mb-6 leading-[1.8] font-hindi">
              नए भजनों के लिरिक्स, उनका अर्थ और आगामी त्यौहारों की विशेष जानकारी सीधे अपने इनबॉक्स में प्राप्त करें।
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== 'idle') {
                      setStatus('idle');
                      setMessage('');
                    }
                  }}
                  placeholder="अपना ईमेल दर्ज़ करें..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-hindi placeholder:font-hindi placeholder:text-slate-400"
                  required
                  aria-label="ईमेल पता"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-orange-700 hover:bg-orange-600 disabled:opacity-60 text-white font-bold font-hindi text-base md:text-lg py-3 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.3)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.4)] flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                {status === 'loading' ? 'प्रतीक्षा करें...' : 'हमारी संगत से जुड़ें'}
              </button>

              {message && (
                <p
                  className={`text-sm text-center font-bold font-hindi mt-2 ${
                    status === 'success'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                  role="status"
                >
                  {message}
                </p>
              )}
            </form>

            {/* Newsletter Privacy Note */}
            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed font-hindi">
              आपके ईमेल का उपयोग वेबसाइट से संबंधित अपडेट भेजने के लिए किया जाता है। अधिक जानकारी के लिए{" "}
              <Link
                href="/privacy"
                className="text-slate-400 hover:text-orange-400 underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </Link>{" "}
              देखें।
            </p>

            <div className="mt-10">
              <p className="text-sm text-slate-300 font-bold mb-4 font-hindi">
                सोशल मीडिया पर जुड़ें
              </p>

              <div className="flex gap-3 flex-wrap">
                <SocialIcon
                  href="https://wa.me/918384844353"
                  icon={<FaWhatsapp size={18} />}
                  color="hover:bg-[#25D366] hover:border-[#25D366]"
                  label="WhatsApp"
                />

                <SocialIcon
                  href="https://www.instagram.com/hindibhajanmanjari/?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  icon={<FaInstagram size={18} />}
                  color="hover:bg-[#E1306C] hover:border-[#E1306C]"
                  label="Instagram"
                />

                <SocialIcon
                  href="https://www.facebook.com/mohit.tarkar.7121/"
                  icon={<FaFacebook size={18} />}
                  color="hover:bg-[#1877F2] hover:border-[#1877F2]"
                  label="Facebook"
                />
              </div>
            </div>
          </div>

        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          
          <div className="text-center md:text-left">
            <p className="text-sm text-slate-400 font-medium font-hindi leading-relaxed">
              © {new Date().getFullYear()}{' '}
              <span className="text-slate-300 font-bold font-sans">
                Hindi Bhajan Manjari
              </span>. 
              <br className="md:hidden" /> दुनिया भर के भक्तों के लिए भक्ति भाव से निर्मित।
            </p>
            
            <p className="text-[11px] text-slate-500 mt-2 max-w-lg leading-tight font-sans">
              As an Amazon Associate, I earn from qualifying purchases. 
              <br/>
              एक अमेज़न एसोसिएट के रूप में, हम योग्य खरीद से कमीशन प्राप्त करते हैं।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] font-bold text-slate-300 font-hindi">
            <Link
              href="/sitemap.xml"
              className="hover:text-orange-400 transition-colors"
            >
              साइटमैप (Sitemap)
            </Link>

            <Link
              href="/disclaimer"
              className="hover:text-orange-400 transition-colors"
            >
              Disclaimer
            </Link>

            <a
              href="mailto:support@hindibhajanmanjari.com"
              className="hover:text-orange-400 transition-colors underline underline-offset-4 decoration-orange-500/30"
            >
              support@hindibhajanmanjari.com
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

function FooterLink({
  href,
  children,
  overrideColor,
  icon
}: FooterLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 font-hindi text-[15px] hover:text-orange-400 hover:translate-x-1 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded w-fit ${
        overrideColor ?? 'text-slate-300'
      }`}
    >
      {icon && (
        <span className="text-orange-500/70 shrink-0">
          {icon}
        </span>
      )}

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

function SocialIcon({
  href,
  icon,
  color,
  label
}: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 transition-all duration-300 border border-white/5 hover:text-white ${color} hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-orange-500`}
    >
      {icon}
    </a>
  );
}