import { LETTER_TYPES } from "../config";
import ScrollReveal from "@/components/ScrollReveal";
import { FaQuoteLeft } from "react-icons/fa";

export default function LetterTypes() {
  return (
    <ScrollReveal yOffset={40}>
      <div className="mb-24">
        <h2 className="font-hindi text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">हम क्या लिखते हैं?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LETTER_TYPES.map((type) => (
            <div key={type.id} className="group relative bg-orange-50/40 rounded-[2rem] p-8 border border-orange-100/50 hover:bg-orange-50 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 -mt-2 -mr-2 text-orange-200/30 group-hover:text-orange-200/60 transition-colors duration-500">
                <FaQuoteLeft size={100} />
              </div>
              <h3 className="font-hindi text-2xl font-bold text-gray-900 mb-1 relative z-10">{type.name}</h3>
              <p className="text-sm font-bold text-orange-600 mb-6 uppercase tracking-wider relative z-10">{type.en}</p>
              
              <p className="font-hindi text-gray-700 text-lg italic mb-8 relative z-10 leading-relaxed">"{type.line}"</p>
              
              <div className="relative z-10 border-t border-orange-200/50 pt-4 mt-auto">
                <p className="font-hindi text-sm text-gray-500 font-semibold mb-1">अक्सर इन अवसरों पर:</p>
                <p className="font-hindi text-sm text-gray-800 font-medium leading-relaxed">{type.occasions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}