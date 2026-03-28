import { BhajanGridSkeleton } from '../../../components/Skeletons';
import Sidebar from '../../../components/Sidebar';
import { FaHashtag } from 'react-icons/fa';

export default function Loading() {
  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Fake Breadcrumbs */}
        <div className="h-4 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>

        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          <main className="flex-1">
            
            {/* Fake Tag Header */}
            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm mb-8 animate-pulse">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <FaHashtag className="text-orange-600 text-2xl" />
                </div>
                {/* Fake Title */}
                <div className="h-10 bg-gray-200 rounded-xl w-64"></div>
              </div>
              {/* Fake Subtitle */}
              <div className="h-4 bg-gray-100 rounded w-40 mt-4"></div>
            </div>

            {/* 🌟 YOUR HIGH-FIDELITY GRID SKELETON */}
            <BhajanGridSkeleton />
            
          </main>

          {/* If your Sidebar takes time to load, you can put a skeleton here too, 
              but usually, we just render the real sidebar if it's static */}
          <Sidebar />
          
        </div>
      </div>
    </div>
  );
}