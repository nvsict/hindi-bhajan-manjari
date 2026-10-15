import Link from 'next/link';
import { FaFeatherAlt, FaEnvelopeOpenText } from 'react-icons/fa';

interface LetterPromoProps {
  variant?: 'banner' | 'sidebar';
  className?: string;
}

export default function LetterPromo({ variant = 'banner', className = '' }: LetterPromoProps) {
  const isSidebar = variant === 'sidebar';

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm hover:shadow-md transition-shadow group ${isSidebar ? 'flex flex-col p-6' : 'flex flex-col md:flex-row items-center gap-6 p-6 md:p-8'} ${className}`}>
      
      {/* 🌟 Decorative Background Icon */}
      <div className="absolute -top-8 -right-8 text-orange-200/40 transform rotate-12 group-hover:scale-110 group-hover:rotate-45 transition-transform duration-700 pointer-events-none">
        <FaFeatherAlt size={isSidebar ? 120 : 160} />
      </div>

      {/* 🌟 Content Section */}
      <div className="relative z-10 flex-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-bold text-[10px] uppercase tracking-wider mb-3 shadow-sm border border-orange-200/50">
          <FaFeatherAlt /> नई विशेष सेवा
        </div>
        
        <h3 className={`font-hindi font-black text-gray-900 mb-2 ${isSidebar ? 'text-2xl' : 'text-2xl md:text-3xl'}`}>
          ब्रज से <span className="text-orange-600">पत्र</span>
        </h3>
        
        <p className={`font-hindi text-gray-600 font-medium leading-relaxed ${isSidebar ? 'text-sm' : 'text-sm md:text-base max-w-lg'}`}>
          कुछ बातें कही नहीं जातीं... लिखी जाती हैं। आपके अपनों के लिए मोहित द्वारा हाथ से रचे गए विशेष पत्र।
        </p>
      </div>

      {/* 🌟 Call to Action Button */}
      <div className={`relative z-10 ${isSidebar ? 'mt-5 w-full' : 'mt-4 md:mt-0 w-full md:w-auto shrink-0'}`}>
        <Link 
          href="/letter-from-braj" 
          className="inline-flex items-center justify-center w-full gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-hindi font-bold py-3.5 px-6 rounded-xl transition-transform hover:scale-105 shadow-lg shadow-orange-600/25 active:scale-95"
        >
          <FaEnvelopeOpenText className="text-lg" /> अपना पत्र लिखवाएं
        </Link>
      </div>
    </div>
  );
}