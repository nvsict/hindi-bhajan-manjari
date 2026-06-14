'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

interface AffiliateSlotProps {
  deityId?: string | null; // अगर हनुमान जी का पेज है तो उनका ID
  layout?: 'inline' | 'card' | 'sidebar'; // यह कहाँ दिख रहा है?
}

export default function AffiliateSlot({ deityId, layout = 'inline' }: AffiliateSlotProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestProduct = async () => {
      setLoading(true);
      try {
        // 1. पहले कोशिश करो कि इस देवता (Deity) का कोई एक्टिव प्रोडक्ट मिल जाए
        let query = supabase.from('affiliate_products').select('*').eq('is_active', true);
        
        if (deityId) {
          query = query.eq('deity_id', deityId);
        } else {
          query = query.is('deity_id', null); // General products
        }

        const { data, error } = await query;

        if (data && data.length > 0) {
          // अगर एक से ज़्यादा प्रोडक्ट हैं, तो कोई एक रैंडम (Random) दिखाओ ताकि बोरियत न हो
          const randomProduct = data[Math.floor(Math.random() * data.length)];
          setProduct(randomProduct);
        } else if (deityId) {
          // 2. अगर इस देवता का कोई प्रोडक्ट नहीं मिला, तो चुपचाप 'General' प्रोडक्ट दिखा दो (Fallback)
          const { data: generalData } = await supabase.from('affiliate_products').select('*').eq('is_active', true).is('deity_id', null);
          if (generalData && generalData.length > 0) {
            setProduct(generalData[Math.floor(Math.random() * generalData.length)]);
          }
        }
      } catch (err) {
        console.error("Affiliate Slot Error:", err);
      }
      setLoading(false);
    };

    fetchBestProduct();
  }, [deityId]);

  const handleAdClick = async () => {
    if (!product) return;

    // 1. Supabase में क्लिक बढ़ाएं (Background में)
    supabase.rpc('increment_click', { product_id: product.id }).then(); 
    // (नोट: इसके लिए हम बाद में एक छोटा सा SQL फंक्शन बनाएंगे, अभी यह चुपचाप काम करेगा)

    // 2. GA4 (Google Analytics) में इवेंट भेजें
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        product_name: product.title,
        placement: layout,
      });
    }
  };

  // अगर कोई प्रोडक्ट नहीं मिला या लोड हो रहा है, तो कुछ मत दिखाओ (ताकि जगह खाली न दिखे)
  if (loading || !product) return null;

  // 🌟 INLINE LAYOUT (भजन के पैराग्राफ्स के बीच के लिए)
  // 🌟 INLINE LAYOUT (अंदर का कोड यहाँ रिप्लेस करें)
  if (layout === 'inline') {
    return (
      <Link 
        href={product.amazon_link} 
        target="_blank" 
        onClick={handleAdClick}
        rel="noopener noreferrer nofollow"
        className="my-8 block relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-[#1a120b] dark:to-[#1f150d] border border-orange-100 dark:border-white/10 shadow-sm p-4 sm:p-5 group transition-all hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 active:scale-[0.99]"
      >
        <div className="absolute top-0 right-0 bg-orange-100 dark:bg-white/10 text-[10px] text-orange-600 dark:text-gray-400 px-2 py-0.5 rounded-bl-lg font-medium opacity-60">
          Recommended
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-white dark:bg-black/20 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5">
            <Image src={product.image_url} alt={product.title} fill sizes="112px" className="object-contain p-2" />
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-orange-50 line-clamp-2 mb-2 leading-snug">
              {product.title}
            </h4>
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <span className="text-orange-600 dark:text-orange-400 font-black text-lg">
                {product.price}
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-orange-600 transition-colors">
                अभी देखें →
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }
  // (भविष्य में हम यहाँ 'card' और 'sidebar' लेआउट्स भी जोड़ सकते हैं)
  return null; 
}