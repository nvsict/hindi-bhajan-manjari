import Link from 'next/link';
import { FaTrophy } from 'react-icons/fa';

interface TrendingBhajan {
  title_hindi: string;
  title_hinglish: string;
  slug: string;
}

interface Props {
  bhajans: TrendingBhajan[];
  deityNameHindi: string;
}

export default function TrendingBhajans({ bhajans, deityNameHindi }: Props) {
  if (!bhajans || bhajans.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Clean, authoritative header */}
      <div className="flex items-center gap-3 mb-6">
        <FaTrophy className="text-orange-500 text-2xl md:text-3xl" />
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          प्रसिद्ध {deityNameHindi} भजन (Top Picks)
        </h2>
      </div>
      
      {/* 🌟 THE FIX: Responsive Grid instead of horizontal scroll. 
          1 column on mobile, 2 on tablets, 3 on large desktop screens. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bhajans.map((bhajan, index) => (
          <Link 
            href={`/bhajan/${bhajan.slug}`} 
            key={bhajan.slug}
            className="flex items-center p-4 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 hover:-translate-y-0.5 transition-all duration-200 group"
          >
            {/* Elegant Rank Badge */}
            <div className="w-12 h-12 shrink-0 bg-orange-50 text-orange-600 font-black text-xl rounded-full flex items-center justify-center mr-4 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
              {index + 1}
            </div>
            
            {/* Minimalist Text Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-hindi font-bold text-lg md:text-xl text-gray-900 truncate mb-1 group-hover:text-orange-600 transition-colors">
                {bhajan.title_hindi}
              </h3>
              <p className="text-sm text-gray-500 truncate font-medium">
                {bhajan.title_hinglish}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}