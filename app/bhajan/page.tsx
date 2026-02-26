import { supabase } from '../../utils/supabase';
import Sidebar from '../../components/Sidebar';
import BhajanList from '../../components/BhajanList';

export default async function AllBhajansPage() {
  const { data: initialBhajans } = await supabase
    .from('bhajans')
    .select(`*, deities(name_hinglish), categories(name_hinglish)`)
    .order('title_hinglish', { ascending: true })
    .range(0, 11); // Show 12 initially for the "All" page

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
      <main className="flex-1">
        <h1 className="text-4xl font-black mb-8">All <span className="text-orange-600">Bhajans</span></h1>
        <BhajanList initialBhajans={initialBhajans || []} />
      </main>
      <Sidebar />
    </div>
  );
}