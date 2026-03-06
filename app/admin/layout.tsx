"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { 
  FaChartBar, FaPlus, FaTags, FaGlobe, FaBars, FaTimes, FaSignOutAlt, FaNewspaper, FaUserShield, FaBell 
} from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 🌟 UPGRADED: Added the new Broadcast Push tab!
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: FaChartBar },
    { name: 'Add New Bhajan', href: '/admin/add-bhajan', icon: FaPlus },
    { name: 'Site Metadata', href: '/admin/manage', icon: FaTags },
    { name: 'Gyan Articles', href: '/admin/articles', icon: FaNewspaper },
    { name: 'Broadcast Push', href: '/admin/broadcast', icon: FaBell },
  ];

  const handleLogout = async () => {
    if (confirm("Are you sure you want to securely log out of the Command Center?")) {
      setIsLoggingOut(true);
      
      try {
        // 1. Destroy the secure JWT cookie we created in the login step
        document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // 2. Clear Supabase session just in case it's active
        await supabase.auth.signOut();
        
        // 3. Force a hard browser reload. 
        // This completely wipes the React cache from memory for maximum security.
        window.location.href = '/admin/login';
        
      } catch (error) {
        alert("Error during logout. Please clear your browser cookies.");
        setIsLoggingOut(false); // Only reset the button if an error occurs
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row">
      
      {/* ==========================================
          📱 MOBILE HEADER (Only visible on mobile)
          ========================================== */}
      <header className="md:hidden bg-white text-gray-900 px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <Link href="/admin" className="flex items-center gap-2 font-black text-xl tracking-tighter">
          <GiLotusFlower className="text-orange-600 text-3xl drop-shadow-sm" />
          <span>Admin<span className="text-orange-600">Panel</span></span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 bg-gray-50 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </header>

      {/* ==========================================
          🖥️ DESKTOP / MOBILE SIDEBAR (The Dark Panel)
          ========================================== */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-gray-900 text-gray-300 flex flex-col z-40 
        transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:sticky md:top-0 md:h-screen shrink-0
      `}>
        
        {/* Logo Area */}
        <div className="hidden md:flex items-center gap-3 px-8 py-8 mb-4 border-b border-gray-800/60 bg-gray-900/50">
          <GiLotusFlower className="text-orange-500 text-4xl drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-black text-white tracking-tighter">Admin</span>
            <span className="text-[10px] font-bold text-orange-500 tracking-widest uppercase flex items-center gap-1 mt-0.5">
              <FaUserShield size={10} /> Secure Access
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 md:py-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 mt-4 md:mt-0">Main Menu</p>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-900/20' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-800 group-hover:bg-gray-700'}`}>
                  <item.icon size={16} />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions (Live Site & Logout) */}
        <div className="p-4 border-t border-gray-800/60 bg-gray-900/50 space-y-3">
          <Link 
            href="/" 
            target="_blank"
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-gray-400 font-bold hover:bg-gray-800 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-xl bg-gray-800 group-hover:bg-gray-700 transition-colors">
              <FaGlobe size={16} />
            </div>
            View Live Site
          </Link>
          
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-gray-400 font-bold hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50 text-left group"
          >
            <div className="p-2 rounded-xl bg-gray-800 group-hover:bg-red-500/20 transition-colors">
              <FaSignOutAlt size={16} className={isLoggingOut ? "animate-pulse" : ""} />
            </div>
            {isLoggingOut ? 'Terminating...' : 'Secure Logout'}
          </button>
        </div>
      </aside>

      {/* ==========================================
          📱 MOBILE BACKDROP
          ========================================== */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-gray-900/80 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* ==========================================
          ✨ MAIN CONTENT AREA
          ========================================== */}
      <main className="flex-1 w-full min-w-0 transition-all duration-300">
        <div className="h-full">
          {children}
        </div>
      </main>

    </div>
  );
}