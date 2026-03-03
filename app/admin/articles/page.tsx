"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaBookOpen } from 'react-icons/fa';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title_hindi, title_hinglish, slug, is_published, read_time_minutes, published_at')
      .order('created_at', { ascending: false });

    if (!error && data) setArticles(data);
    setLoading(false);
  };

  const deleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    await supabase.from('articles').delete().eq('id', id);
    fetchArticles();
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
            <FaBookOpen className="text-orange-500" /> Manage Sanatan Gyan
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Write and publish deep-dive articles for your Knowledge Graph.</p>
        </div>
        <Link 
          href="/admin/articles/new"
          className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
        >
          <FaPlus /> Write New Article
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-16 bg-gray-100 rounded-2xl w-full"></div>
            <div className="h-16 bg-gray-100 rounded-2xl w-full"></div>
            <div className="h-16 bg-gray-100 rounded-2xl w-full"></div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-widest text-[11px] font-bold">
                <th className="p-5">Title (Hindi / Hinglish)</th>
                <th className="p-5">Status</th>
                <th className="p-5">Read Time</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors group">
                  <td className="p-5">
                    <p className="font-bold text-gray-900 font-hindi text-lg leading-tight mb-1">{article.title_hindi}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{article.title_hinglish}</p>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full ${article.is_published ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                      {article.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-gray-600 font-bold">
                    {article.read_time_minutes} Min
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* 🌟 FIX: Updated link to match dynamic route folder structure /[id]/edit */}
                      <Link 
                        href={`/admin/articles/${article.id}/edit`} 
                        className="text-blue-500 hover:text-white p-2.5 bg-blue-50 hover:bg-blue-500 rounded-xl transition-all shadow-sm"
                        title="Edit Article"
                      >
                        <FaEdit />
                      </Link>
                      <button 
                        onClick={() => deleteArticle(article.id)} 
                        className="text-red-500 hover:text-white p-2.5 bg-red-50 hover:bg-red-500 rounded-xl transition-all shadow-sm"
                        title="Delete Article"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500 font-medium">
                    No articles found. Click "Write New Article" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}