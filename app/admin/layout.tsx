"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { 
  FaChartBar, FaPlus, FaTags, FaGlobe, FaBars, FaTimes, 
  FaSignOutAlt, FaNewspaper, FaUserShield, FaBell, 
  FaExclamationTriangle, FaBookOpen, FaBullhorn, 
  FaShoppingBag, FaPenNib, FaClock, FaHeart, FaEnvelope
} from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🌟 Custom Modal States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🌟 UPDATED: Full Navigation reflecting your actual Next.js Routes
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: FaChartBar },
    { name: 'Add New Bhajan', href: '/admin/add-bhajan', icon: FaPlus },
    { name: 'Site Metadata', href: '/admin/manage', icon: FaTags },
    { name: 'Mere Vichar', href: '/admin/mere-vichar', icon: FaPenNib },
    { name: 'Gyan Articles', href: '/admin/articles', icon: FaNewspaper },
    { name: 'Dictionary', href: '/admin/dictionary', icon: FaBookOpen },
    { name: 'Campaigns', href: '/admin/campaign', icon: FaBullhorn }, 
    { name: 'Affiliates', href: '/admin/affiliates', icon: FaShoppingBag }, 
    { name: 'E-Book Generator', href: '/admin/ebooks', icon: FaBookOpen },
    { name: 'Broadcast Push', href: '/admin/broadcast', icon: FaBell },
    { name: 'Newsletter', href: '/admin/newsletter', icon: FaEnvelope },
  ];

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError("");
    
    try {
      // 1. ब्राउज़र से एडमिन कुकी (Cookie) डिलीट करें
      document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // 2. Supabase सेशन क्लियर करें (Promise.race ताकि नेटवर्क स्लो हो तो भी न अटके)
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      
      // 3. Hard Reload to clear memory and cache
      window.location.href = '/admin/login';
      
    } catch (error) {
      setLogoutError("Logout failed. Please clear your browser cookies manually.");
      setIsLoggingOut(false); 
    }
  };

  return (
    // 🌟 FIX: Updated background color slightly to better match your glassmorphism cards
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col md:flex-row selection:bg-orange-100 selection:text-orange-900">
      
      {/* ==========================================
          📱 MOBILE HEADER
          ========================================== */}
      <header className="md:hidden bg-white text-gray-900 px-6 py-4 flex justify-between items-center sticky top-0 z-40 border-b border-orange-100 shadow-sm">
        <Link href="/admin" className="flex items-center gap-2 font-black text-xl tracking-tighter">
          <GiLotusFlower className="text-orange-600 text-3xl drop-shadow-sm" />
          <span>Admin<span className="text-orange-600">Panel</span></span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl transition-all"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </header>

      {/* ==========================================
          🖥️ DESKTOP / MOBILE SIDEBAR
          ========================================== */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white text-gray-700 flex flex-col z-50 
        transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-gray-100 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.05)] md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:sticky md:top-0 md:h-screen shrink-0
      `}>
        
        {/* Logo Area */}
        <div className="hidden md:flex items-center gap-4 px-8 py-8 mb-2 border-b border-gray-50 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50/50 to-transparent pointer-events-none" />
          
          <GiLotusFlower className="text-orange-600 text-4xl drop-shadow-sm relative z-10" />
          <div className="flex flex-col leading-none relative z-10">
            <span className="text-2xl font-black text-gray-900 tracking-tighter">Admin<span className="text-orange-600">Panel</span></span>
            <span className="text-[9px] font-bold text-green-500 tracking-[0.2em] uppercase flex items-center gap-1.5 mt-1">
              <FaUserShield size={10} /> Secure Access
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-5 py-8 md:py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 mt-4 md:mt-0">Main Menu</p>
          
          {navItems.map((item) => {
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
              
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'text-white shadow-md shadow-orange-900/10 translate-x-1' 
                    : 'text-gray-500 hover:bg-orange-50/50 hover:text-orange-600'
                }`}
              >
                {/* Active Gradient Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl -z-10" />
                )}
                
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-white/20 text-white shadow-inner' : 'bg-gray-50 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600'
                }`}>
                  <item.icon size={15} />
                </div>
                <span className="relative z-10 text-[14px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-gray-50 bg-gray-50/30 space-y-3">
          <Link 
            href="/" 
            target="_blank"
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-600 font-bold hover:bg-white hover:shadow-sm hover:text-orange-600 border border-transparent hover:border-gray-100 transition-all group"
          >
            <div className="p-2 rounded-xl bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
              <FaGlobe size={16} />
            </div>
            View Live Site
          </Link>
          
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-600 font-bold hover:bg-red-50 hover:text-red-600 hover:shadow-sm border border-transparent hover:border-red-100 transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
              <FaSignOutAlt size={16} />
            </div>
            Secure Logout
          </button>
        </div>
      </aside>

      {/* ==========================================
          📱 MOBILE BACKDROP
          ========================================== */}
      <div 
        onClick={() => setIsMobileMenuOpen(false)} 
        className={`fixed inset-0 bg-gray-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      />

      {/* ==========================================
          ✨ MAIN CONTENT AREA (THE UI FIX)
          ========================================== */}
      <main className="flex-1 w-full min-w-0 transition-all duration-300 relative z-0">
        {/* 🌟 FIX: Removed h-screen and overflow constraints. 
            Now it uses smooth, natural browser scrolling! */}
        <div className="w-full p-4 md:p-8 lg:p-10">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      {/* ==========================================
          🚨 CUSTOM LOGOUT MODAL
          ========================================== */}
      {mounted && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${showLogoutModal ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
            onClick={() => !isLoggingOut && setShowLogoutModal(false)}
          />
          
          <div className={`bg-white rounded-[2rem] w-full max-w-sm p-8 relative z-10 shadow-2xl flex flex-col items-center text-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${showLogoutModal ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}>
            
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-50"></div>
              <FaExclamationTriangle className="text-3xl text-red-500 relative z-10" />
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Secure Logout</h2>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">
              Are you sure you want to securely close your session and exit the Command Center?
            </p>

            {logoutError && (
              <div className="w-full bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl mb-6">
                {logoutError}
              </div>
            )}

            <div className="w-full flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-3.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3.5 px-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl transition-all shadow-md shadow-red-500/20 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <><FaSignOutAlt className="animate-pulse" /> Exiting...</>
                ) : (
                  'Yes, Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}