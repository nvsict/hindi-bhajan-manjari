import { PACKAGES } from "../config";
import ScrollReveal from "@/components/ScrollReveal";
import { FaRegCheckCircle } from "react-icons/fa";
import { PackageButton } from "../LetterOrder";

export default function PricingPackages() {
  return (
    <ScrollReveal yOffset={40}>
      <div className="mb-24">
        <h2 className="font-hindi text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">सेवा और मूल्य</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PACKAGES.map((pkg) => (
            <div key={pkg.id} className={`bg-white rounded-[2rem] p-8 border-2 transition-all duration-300 relative flex flex-col ${pkg.badge ? 'border-orange-500 transform lg:-translate-y-4 shadow-2xl shadow-orange-500/20' : 'border-orange-100 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-900/5'}`}>
              
              {pkg.badge && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-md">
                  {pkg.badge}
                </div>
              )}
              
              <h3 className="font-hindi text-2xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
              <p className="font-hindi text-sm text-gray-500 font-medium mb-4 h-10">{pkg.blurb}</p>
              
              <div className="font-sans text-4xl font-black text-orange-600 mb-6">₹{pkg.price}</div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3">
                  <FaRegCheckCircle className={`mt-1 shrink-0 ${pkg.badge ? 'text-orange-500' : 'text-green-500'}`} /> 
                  <span className="font-hindi text-gray-800 font-medium">{pkg.words}</span>
                </li>
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <FaRegCheckCircle className={`mt-1 shrink-0 ${pkg.badge ? 'text-orange-500' : 'text-green-500'}`} /> 
                    <span className="font-hindi text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <PackageButton pkg={pkg.id} className={`w-full py-4 px-4 rounded-xl font-hindi font-bold text-lg transition-all text-center border ${pkg.badge ? 'bg-orange-600 text-white hover:bg-orange-700 border-orange-600 shadow-lg shadow-orange-600/30' : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'}`}>
                यह पैकेज चुनें
              </PackageButton>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}