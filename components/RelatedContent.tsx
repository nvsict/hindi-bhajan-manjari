import Link from 'next/link';
import { supabase } from '../utils/supabase';
import { FaMusic, FaBookOpen, FaArrowRight, FaClock } from 'react-icons/fa';

interface Props {
  deityId: string;
  currentSlug: string;
}

export default async function RelatedContent({ deityId, currentSlug }: Props) {
  const [
    { data: bhajans, error: bhajansError },
    { data: articles, error: articlesError }
  ] = await Promise.all([
    supabase
      .from('mv_bhajan_details')
      .select('title_hindi, title_hinglish, slug')
      .eq('deity_id', deityId)
      .neq('slug', currentSlug)
      .order('title_hindi', { ascending: true })
      .limit(2),

    supabase
      .from('articles')
      .select('title_hindi, title_hinglish, slug, read_time_minutes')
      .eq('deity_id', deityId)
      .eq('is_published', true)
      .neq('slug', currentSlug)
      .order('title_hindi', { ascending: true })
      .limit(1),
  ]);

  if ((!bhajans || bhajans.length === 0) && (!articles || articles.length === 0)) {
    return null;
  }

  return (
    <div className="mt-12 mb-8 bg-white p-8 rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden">
      <div 
        aria-hidden="true" 
        className="absolute -right-10 -top-10 w-40 h-40 bg-orange-50 rounded-full blur-2xl pointer-events-none"
      ></div>

      <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-orange-50 pb-4">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight font-hindi">
          आगे पढ़ें <span className="text-orange-600 font-sans text-xl">(Read Next)</span>
        </h3>
      </div>

      {/* Added `items-start` to the grid so cards can naturally grow based on their content height without stretching weirdly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-start">
        
        {bhajans?.map((bhajan) => (
          <Link 
            href={`/bhajan/${bhajan.slug}`}
            key={bhajan.slug}
            className="flex flex-col p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group h-full"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              <FaMusic aria-hidden="true" className="text-orange-400" /> Bhajan
            </div>
            {/* FIXED: Removed line-clamp-2 */}
            <h4 className="font-hindi text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
              {bhajan.title_hindi}
            </h4>
            {/* FIXED: Removed line-clamp-1 */}
            <p className="text-sm text-gray-500 mt-auto pt-2">
              {bhajan.title_hinglish}
            </p>
          </Link>
        ))}

        {articles?.map((article) => (
          <Link 
            href={`/gyan/${article.slug}`} 
            key={article.slug}
            className="flex flex-col p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200 hover:border-orange-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden h-full"
          >
            <div aria-hidden="true" className="absolute -right-4 -bottom-4 opacity-10 text-orange-600">
              <FaBookOpen size={80} />
            </div>
            
            <div className="flex items-center justify-between text-xs font-bold text-orange-600 uppercase tracking-widest mb-3 relative z-10">
              <span className="flex items-center gap-2">
                <FaBookOpen aria-hidden="true" /> Sanatan Gyan
              </span>
              
              {article.read_time_minutes && (
                <span className="flex items-center gap-1 opacity-75">
                  <FaClock aria-hidden="true" /> {article.read_time_minutes} Min
                </span>
              )}
            </div>
            
            {/* FIXED: Removed line-clamp-3 */}
            <h4 className="font-hindi text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-orange-700 transition-colors relative z-10">
              {article.title_hindi}
            </h4>
            
            <div className="mt-auto pt-4 flex items-center text-sm font-bold text-orange-600 relative z-10">
              लेख पढ़ें (Read Article) <FaArrowRight aria-hidden="true" className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}

      </div>
    </div>
  );
}