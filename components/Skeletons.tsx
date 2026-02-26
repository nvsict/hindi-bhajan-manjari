// components/Skeletons.tsx

export function BhajanCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
      
      {/* ⚡️ The Pulse Wrapper */}
      <div className="animate-pulse flex flex-col h-full">
        
        {/* Top Row: Tag & Icon */}
        <div className="flex justify-between items-start mb-4">
          {/* Simulated Orange Deity Tag */}
          <div className="h-5 bg-orange-100/60 rounded w-16"></div>
          {/* Simulated Music Icon */}
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
        </div>
        
        {/* Title Blocks (Hindi & Hinglish) */}
        <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-100 rounded-md w-1/2 mb-6"></div>
        
        {/* Bottom Row: "Read Lyrics ->" */}
        <div className="mt-auto pt-2 flex items-center gap-2">
          <div className="h-4 bg-orange-50 rounded-md w-20"></div>
          <div className="h-3 w-3 bg-orange-50 rounded-full"></div>
        </div>

      </div>
    </div>
  );
}

export function BhajanGridSkeleton() {
  return (
    // Matches the exact grid layout of your actual pages
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {/* Rendering 6 cards fills the average screen instantly */}
      {[...Array(6)].map((_, i) => (
        <BhajanCardSkeleton key={i} />
      ))}
    </div>
  );
}