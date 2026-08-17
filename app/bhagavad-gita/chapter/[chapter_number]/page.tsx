import React from 'react';
import { FaArrowLeft, FaPlayCircle, FaBookOpen } from 'react-icons/fa';
import Link from 'next/link';

export default function ChapterDetailBasePage() {
  // डमी डेटा (इसे आप params.chapter_number के आधार पर डेटाबेस से फेच करेंगे)
  const chapterData = {
    number: 1,
    name: "अर्जुनविषादयोग",
    translation: "Arjuna Visada Yoga",
    meaning: "अर्जुन विषाद योग",
    summary: "भगवद गीता का पहला अध्याय अर्जुन विषाद योग उन पात्रों और परिस्थितियों का परिचय कराता है जिनके कारण पांडवों और कौरवों के बीच महाभारत का महासंग्राम हुआ। जब अर्जुन दोनों पक्षों के योद्धाओं को देखते हैं, तो वह अपने ही रिश्तेदारों को खोने के डर से दुखी हो जाते हैं...",
    totalVerses: 47
  };

  // 1 से 47 श्लोकों की डमी लिस्ट बनाने के लिए
  const versesList = Array.from({ length: chapterData.totalVerses }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-[#fafaf9] text-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* बैक बटन और हेडर */}
        <div className="flex items-center gap-4">
          <Link href="/bhagavad-gita" className="p-3 bg-white border border-gray-200 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm">
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-hindi text-gray-900">
              अध्याय {chapterData.number}: {chapterData.name}
            </h1>
            <p className="text-gray-500 font-bold text-sm mt-1">{chapterData.translation} • {chapterData.meaning}</p>
          </div>
        </div>

        {/* अध्याय का सारांश (Summary Card) */}
        <div className="bg-white border border-orange-100 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-orange-500/5 pointer-events-none">
            <FaBookOpen size={200} />
          </div>
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-orange-800 mb-3 uppercase tracking-wider text-sm">अध्याय का सार</h2>
            <p className="text-gray-700 leading-relaxed font-hindi text-base sm:text-lg">
              {chapterData.summary}
            </p>
          </div>
        </div>

        {/* श्लोकों की ग्रिड (Verses List) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-gray-900 font-hindi">सभी श्लोक ({chapterData.totalVerses})</h3>
            <button className="flex items-center gap-2 text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors">
              <FaPlayCircle size={16} /> पूरा अध्याय सुनें
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {versesList.map((verseNum) => (
              <Link 
                key={verseNum}
                href={`/bhagavad-gita/chapter/${chapterData.number}/verse/${verseNum}`}
                className="bg-white border border-gray-200 p-4 rounded-2xl flex flex-col items-center justify-center hover:border-orange-400 hover:shadow-md hover:text-orange-600 transition-all group"
              >
                <span className="text-gray-400 text-xs font-bold mb-1">श्लोक</span>
                <span className="text-2xl font-black font-hindi text-gray-800 group-hover:text-orange-600 transition-colors">
                  {chapterData.number}.{verseNum}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}