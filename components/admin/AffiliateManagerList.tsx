'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabase'; // अपने Supabase क्लाइंट का पाथ दें
import { FaTrash, FaExternalLinkAlt, FaToggleOn, FaToggleOff, FaMousePointer } from 'react-icons/fa';

export default function AffiliateManagerList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 प्रोडक्ट्स और उनसे जुड़े देवी-देवताओं का डेटा फेच करें
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('affiliate_products')
      .select(`
        *,
        deities ( name_hinglish )
      `)
      .order('created_at', { ascending: false });

    if (data) setProducts(data);
    if (error) console.error("Error fetching products:", error);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🌟 प्रोडक्ट को ON/OFF (Active/Inactive) करने का लॉजिक
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('affiliate_products')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    } else {
      alert("स्टेटस अपडेट करने में समस्या आई!");
    }
  };

  // 🌟 प्रोडक्ट डिलीट करने का लॉजिक
  const deleteProduct = async (id: string) => {
    const confirmDelete = window.confirm("क्या आप वाकई इस प्रोडक्ट को हटाना चाहते हैं?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('affiliate_products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert("डिलीट करने में समस्या आई!");
    }
  };

  if (loading) return <div className="text-center py-10 font-bold text-gray-500">Loading Products...</div>;

  return (
    <div className="w-full p-4 sm:p-6 overflow-hidden">
      <h2 className="text-2xl font-black text-gray-900 dark:text-orange-50 mb-6">
        मैनेज एफिलिएट प्रोडक्ट्स ({products.length})
      </h2>

      <div className="grid gap-4 w-full">
        {products.length === 0 ? (
          <div className="bg-white dark:bg-[#1a120b] p-8 text-center rounded-3xl border border-gray-100 dark:border-white/10 text-gray-500 shadow-sm">
            अभी तक कोई प्रोडक्ट ऐड नहीं किया गया है।
          </div>
        ) : (
          products.map((product) => (
            <div 
              key={product.id} 
              // 🌟 यहाँ overflow-hidden जोड़ा गया है ताकि कुछ भी कार्ड के बाहर न जाए
              className={`flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-[#0c0804] p-4 rounded-2xl border ${product.is_active ? 'border-gray-200 dark:border-white/10' : 'border-red-200 dark:border-red-900/30 opacity-70'} transition-all hover:shadow-md overflow-hidden w-full`}
            >
              {/* Image Thumbnail */}
              <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5">
                <Image 
                  src={product.image_url} 
                  alt={product.title} 
                  fill 
                  sizes="80px" 
                  className="object-contain p-2" 
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 text-center sm:text-left min-w-0 w-full max-w-full">
                {/* 🌟 FIX: truncate हटाकर line-clamp-2 और break-words लगाया गया है */}
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 break-words text-sm sm:text-base" title={product.title}>
                  {product.title}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm">
                  {product.price && (
                    <span className="font-bold text-orange-600 dark:text-orange-400">{product.price}</span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium truncate max-w-[120px] sm:max-w-full">
                    {product.deities?.name_hinglish || 'General (All Pages)'}
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md shrink-0">
                    <FaMousePointer /> {product.clicks || 0} Clicks
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto shrink-0">
                <Link 
                  href={product.amazon_link} 
                  target="_blank" 
                  className="p-3 text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 bg-gray-50 dark:bg-white/5 rounded-xl transition-colors shrink-0"
                  title="View on Amazon"
                >
                  <FaExternalLinkAlt />
                </Link>
                
                <button 
                  onClick={() => toggleStatus(product.id, product.is_active)}
                  className={`p-3 rounded-xl flex items-center gap-2 font-bold transition-colors shrink-0 ${product.is_active ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400 hover:bg-gray-200'}`}
                  title={product.is_active ? "Click to Pause" : "Click to Activate"}
                >
                  {product.is_active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                  <span className="hidden md:inline text-xs">{product.is_active ? 'Active' : 'Paused'}</span>
                </button>

                <button 
                  onClick={() => deleteProduct(product.id)}
                  className="p-3 text-red-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl transition-colors shrink-0"
                  title="Delete Product"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}