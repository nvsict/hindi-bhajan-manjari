import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { FaMusic } from 'react-icons/fa';

interface Props {
  currentBhajanId: string;
  deitySlug?: string;
}

export default async function RelatedBhajans({ currentBhajanId, deitySlug }: Props) {
  if (!deitySlug) return null;

  // 🌟 SPEED BOOST: Fetch 3 related bhajans using the superfast Materialized View
  const { data: relatedBhajans, error } = await supabase
    .from('mv_bhajan_details') // 👈 Switched from 'bhajans' to 'mv_bhajan_details'
    .select(`
      id,
      title_hindi,
      title_hinglish,
      slug
    `)
    .eq('deity->>slug', deitySlug) // 👈 Smart filtering inside the JSONB object
    .neq('id', currentBhajanId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !relatedBhajans || relatedBhajans.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      <h3 className="text-2xl font-black text-gray-900 mb-6">
        More <span className="text-orange-600">Related Bhajans</span>
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {relatedBhajans.map((bhajan) => (
          <Link 
            key={bhajan.id} 
            href={`/bhajan/${bhajan.slug}`}
            className="group block bg-white border border-orange-50 hover:border-orange-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <FaMusic size={14} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {bhajan.title_hindi}
            </h4>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1 line-clamp-1 group-hover:text-orange-400 transition-colors">
              {bhajan.title_hinglish}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}