import Image from 'next/image';
import Link from 'next/link';

interface AffiliateCardProps {
  title: string;
  imageUrl: string;
  affiliateUrl: string;
  price?: string;
}

export default function AffiliateCard({ title, imageUrl, affiliateUrl, price }: AffiliateCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center bg-white dark:bg-[#1a120b] border border-orange-200 dark:border-orange-900/50 rounded-2xl p-4 gap-4 shadow-sm hover:shadow-md transition-shadow my-6 max-w-2xl mx-auto">
      {/* Product Image */}
      <div className="relative w-32 h-32 flex-shrink-0 bg-orange-50 dark:bg-black/20 rounded-xl overflow-hidden">
        <Image 
          src={imageUrl} 
          alt={title} 
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 100vw, 128px"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 text-center sm:text-left">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-orange-50 line-clamp-2">
          {title}
        </h4>
        {price && <p className="text-orange-600 dark:text-orange-400 font-medium mt-1">{price}</p>}
        
        <Link 
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer nofollow" // SEO के लिए nofollow बहुत ज़रूरी है
          className="mt-3 inline-block bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2 px-6 rounded-full transition-colors w-fit mx-auto sm:mx-0 shadow-sm"
        >
          Amazon पर देखें
        </Link>
      </div>
    </div>
  );
}