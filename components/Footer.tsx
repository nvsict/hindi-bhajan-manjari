"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaArrowUp,
  FaEnvelope, FaGavel, FaShieldAlt, FaFileContract,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { GiLotusFlower } from 'react-icons/gi';
import { HiSparkles } from 'react-icons/hi';
// import { addSubscriber } from '../app/actions/subscribe';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    // const result = await addSubscriber(email);
    setTimeout(() => {
      setStatus('success');
      setMessage("Jai Shri Ram! You're subscribed.");
      setEmail('');
    }, 1500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0a0a0c] text-slate-400 mt-auto w-full border-t border-white/5 font-sans">

      {/* Top decorative line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      {/* Scroll to Top — sits just inside the footer, not overflowing */}
      <div className="max-w-7xl mx-auto px-6 relative">
        <button
          onClick={scrollToTop}
          className="absolute -top-5 right-6 md:right-0 bg-orange-600 text-white p-3 rounded-xl shadow-2xl hover:bg-orange-500 hover:-translate-y-1 transition-all z-20 group"
          aria-label="Scroll to top"
        >
          <FaArrowUp size={18} className="group-hover:animate-bounce" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* 1. Brand Identity */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center border border-orange-600/20 group-hover:bg-orange-600/20 transition-colors">
                <GiLotusFlower className="text-3xl text-orange-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight leading-none">
                  HINDI <span className="text-orange-500">BHAJAN</span>
                </span>
                <span className="text-[10px] text-slate-500 tracking-[0.2em] uppercase font-bold mt-1">
                  Manjari
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed pr-4">
              Your digital temple for authentic lyrics, meanings, and devotional content. Preserving the sacred tradition of Bhajans for generations to come.
            </p>
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Made with ❤️ in India</span>
            </div>
          </div>

          {/* 2. Devotional Hub */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
              <HiSparkles className="text-orange-500" /> Devotional Hub
            </h3>
            <ul className="space-y-4 text-sm">
              <li><FooterLink href="/category/aarti">Sampoorna Aarti</FooterLink></li>
              <li><FooterLink href="/category/chalisa">Chalisa Sangrah</FooterLink></li>
              <li><FooterLink href="/category/bhajan">Latest Bhajans</FooterLink></li>
              <li><FooterLink href="/category/festivals">Festival Specials</FooterLink></li>
              <li><FooterLink href="/deity/krishna">Krishna Bhajans</FooterLink></li>
            </ul>
          </div>

          {/* 3. Quick Links */}
          <div>
            {/* FIX: added icon to match the other headings' layout */}
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
              <HiSparkles className="text-orange-500" /> Quick Links
            </h3>
            <ul className="space-y-4 text-sm">
              <li><FooterLink href="/about" icon={<HiSparkles size={12} />}>About Our Mission</FooterLink></li>
              {/* FIX: Submit Lyrics now correctly renders in orange — overrideColor prop bypasses the default text color */}
              <li><FooterLink href="/submit" overrideColor="text-orange-400 font-bold">Submit Lyrics</FooterLink></li>
              <li><FooterLink href="/contact" icon={<FaEnvelope size={12} />}>Contact Support</FooterLink></li>
              <li><FooterLink href="/privacy" icon={<FaShieldAlt size={12} />}>Privacy Policy</FooterLink></li>
              <li><FooterLink href="/dmca" icon={<FaGavel size={12} />}>DMCA Notice</FooterLink></li>
              <li><FooterLink href="/terms" icon={<FaFileContract size={12} />}>Terms of Service</FooterLink></li>
            </ul>
          </div>

          {/* 4. Newsletter & Socials */}
          <div className="lg:pl-4">
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Stay Connected</h3>
            <p className="text-sm text-slate-500 mb-6">
              Join our newsletter for the latest additions and festival notifications.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              {/* FIX: removed pointless inner group div */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? 'Processing...' : 'Subscribe Now'}
              </button>
              {message && (
                <p className={`text-[11px] text-center font-bold ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {message}
                </p>
              )}
            </form>

            <div className="mt-8">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-4">Official Channels</p>
              <div className="flex gap-3 flex-wrap">
                <SocialIcon href="https://wa.me/918384844353" icon={<FaWhatsapp />} color="hover:bg-green-600" label="WhatsApp" />
                <SocialIcon href="#" icon={<FaYoutube />} color="hover:bg-red-600" label="YouTube" />
                <SocialIcon href="#" icon={<FaInstagram />} color="hover:bg-pink-600" label="Instagram" />
                <SocialIcon href="#" icon={<FaFacebook />} color="hover:bg-blue-600" label="Facebook" />
                <SocialIcon href="#" icon={<FaXTwitter />} color="hover:bg-slate-700" label="X (Twitter)" />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 font-medium">
            © {new Date().getFullYear()}{' '}
            <span className="text-slate-400">Hindi Bhajan Manjari</span>. Made with devotion for devotees.
          </p>
          <div className="flex items-center gap-6 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
            <Link href="/sitemap.xml" className="hover:text-slate-400 transition-colors">
              Sitemap
            </Link>
            {/* FIX: was a <span>, now a proper mailto <a> */}
            <a
              href="mailto:nvsict06@gmail.com"
              className="hover:text-slate-400 transition-colors underline underline-offset-4 decoration-orange-500/50"
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
  /** Pass a full Tailwind text color + weight class to override the default slate-400 color */
  overrideColor?: string;
  icon?: React.ReactNode;
}

function FooterLink({ href, children, overrideColor, icon }: FooterLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 hover:text-orange-500 hover:translate-x-1 transition-all duration-300 ${overrideColor ?? 'text-slate-400'}`}
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
      className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 ${color} hover:text-white transition-all duration-300 border border-white/5 hover:border-transparent hover:shadow-xl`}
    >
      {icon}
    </a>
  );
}