"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { 
  FaChartBar, FaPlus, FaTags, FaGlobe, FaBars, FaTimes, FaSignOutAlt,FaNewspaper 
} from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Streamlined navigation links
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: FaChartBar },
    { name: 'Add New Bhajan', href: '/admin/add-bhajan', icon: FaPlus },
    { name: 'Site Metadata', href: '/admin/manage', icon: FaTags },
    { name: 'Articles', href: '/admin/articles', icon: FaNewspaper },
  ];

  // Functional Supabase Logout
  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        alert("Error logging out: " + error.message);
        setIsLoggingOut(false);
      } else {
        router.push('/'); // Redirect to the homepage after logging out
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* 1. Mobile Top Navbar (Visible only on small screens) */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <Link href="/admin" className="flex items-center gap-2 font-black text-lg tracking-wide">
          <GiLotusFlower className="text-orange-500 text-2xl" />
          <span>Admin<span className="text-orange-500">Panel</span></span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </header>

      {/* 2. Fixed Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-slate-300 flex flex-col z-40 
        transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        
        {/* Desktop Logo Area */}
        <div className="hidden md:flex items-center gap-3 p-6 mb-4 border-b border-slate-800">
          <GiLotusFlower className="text-orange-500 text-3xl" />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-black text-white tracking-wide">Admin</span>
            <span className="text-xs font-bold text-orange-500 tracking-widest uppercase">Dashboard</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 md:py-0 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-4 md:mt-0">Menu</p>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-900/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={isActive ? 'text-white' : 'text-slate-400'} size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions (Live Site & Logout) */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <FaGlobe size={18} />
            View Live Site
          </Link>
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors text-slate-400 disabled:opacity-50 text-left"
          >
            <FaSignOutAlt size={18} />
            {isLoggingOut ? 'Logging out...' : 'Secure Logout'}
          </button>
        </div>
      </aside>

      {/* 3. Mobile Backdrop (Closes sidebar when tapping outside) */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 4. Main Content Area */}
      {/* The md:ml-64 physically pushes the content over on desktops so the sidebar never overlaps it */}
      <main className="md:ml-64 p-4 md:p-8 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}