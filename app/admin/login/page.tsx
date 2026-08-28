"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaUser, FaSpinner, FaEye, FaEyeSlash, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
// 🌟 1. Supabase Browser Client Import किया
import { createBrowserClient } from '@supabase/ssr';

export default function AdminLoginPage() {
  const router = useRouter();
  
  // 🌟 2. Username को Email में बदल दिया (Supabase Auth के लिए)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Interactive States
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🌟 3. Client-Side Supabase Instance बनाया
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // For a smooth entrance animation
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 🌟 4. Custom API की जगह Supabase Auth का सीधा इस्तेमाल
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        // Supabase से जो एरर आएगा, वह दिखा देंगे
        setError(authError.message || 'Invalid credentials. Access Denied.');
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // 🌟 Trigger Success Animation
        setLoginSuccess(true);
        
        // Wait for half a second to show the success checkmark, then redirect
        setTimeout(() => {
  // 🌟 FIX: Hard redirect forces the browser to send the new cookie to proxy.ts
  window.location.href = '/admin';
}, 600);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 relative overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      
      {/* 🌟 Interactive Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite_reverse]"></div>
      </div>

      {/* Main Login Card with Glassmorphism Entrance */}
      <div className={`w-full max-w-[420px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'} relative z-10`}>
        
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(234,88,12,0.15)] border border-white ring-1 ring-black/5">
          
          {/* Header */}
          <div className="text-center mb-10 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-orange-100 rounded-full blur-xl opacity-50"></div>
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-inner relative z-10 transition-colors duration-500 ${loginSuccess ? 'bg-green-50 text-green-500' : 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 border border-orange-200'}`}>
              {loginSuccess ? (
                <FaCheckCircle className="text-4xl animate-[bounce_0.5s_ease-out]" />
              ) : (
                <FaShieldAlt className="text-4xl drop-shadow-sm" />
              )}
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Access</h1>
            <p className="text-gray-500 font-medium text-sm mt-2 tracking-wide">SECURE COMMAND CENTER</p>
          </div>

          {/* Error Message */}
          <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-24 mb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center border border-red-100 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {error}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Input */}
            <div className="group">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-orange-500 transition-colors">Admin Email</label>
              <div className="relative flex items-center">
                <FaUser className="absolute left-5 text-gray-500 group-focus-within:text-orange-500 transition-colors z-10" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || loginSuccess}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-bold text-gray-900 disabled:opacity-50"
                  placeholder="Enter admin email"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-orange-500 transition-colors">Password</label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-5 text-gray-500 group-focus-within:text-orange-500 transition-colors z-10" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || loginSuccess}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl pl-12 pr-12 py-4 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-bold text-gray-900 tracking-wider disabled:opacity-50"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {/* 🌟 Interactive Eye Toggle */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || loginSuccess}
                  className="absolute right-4 p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading || loginSuccess || !email || !password}
              className={`w-full py-4 md:py-5 rounded-2xl font-black text-[15px] tracking-wide uppercase flex items-center justify-center gap-3 transition-all duration-300 mt-8 outline-none ${
                loginSuccess 
                  ? 'bg-green-500 text-white shadow-[0_4px_15px_rgba(34,197,94,0.3)]'
                  : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_4px_20px_0_rgba(234,88,12,0.3)] hover:shadow-[0_6px_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 active:scale-[0.98]'
              } disabled:opacity-70 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed`}
            >
              {loginSuccess ? (
                <>Access Granted <FaCheckCircle className="animate-pulse" /></>
              ) : isLoading ? (
                <><FaSpinner className="animate-spin text-xl" /> Authenticating...</>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>

        </div>
        
        {/* Footer Note */}
        <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mt-8">
          Authorized Personnel Only
        </p>
      </div>

    </div>
  );
}