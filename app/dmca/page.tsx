import { FaGavel, FaPaperPlane, FaExclamationTriangle } from 'react-icons/fa';

export default function DMCAPage() {
  const adminEmail = "nvsict06@gmail.com";

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FaGavel size={30} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">DMCA Policy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Hindi Bhajan Manjari respects the intellectual property of creators and expects our users to do the same.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-900/5">
          <div className="p-8 md:p-16">
            
            <div className="prose prose-red max-w-none text-gray-600 leading-relaxed">
              
              <section className="mb-10">
                <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <FaExclamationTriangle className="text-orange-500 text-xl" /> 
                  Reporting Infringement
                </h2>
                <p>
                  If you are a copyright owner or an agent thereof and believe that any content on our website infringes upon your copyrights, you may submit a notification pursuant to the Digital Millennium Copyright Act ("DMCA") by providing our Copyright Agent with the following information in writing:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  {[
                    "A physical or electronic signature of the authorized person.",
                    "Identification of the copyrighted work claimed to have been infringed.",
                    "Identification of the material that is claimed to be infringing (URL).",
                    "Information reasonably sufficient to contact you (Email/Phone).",
                    "A statement that you have a good faith belief that use is not authorized.",
                    "A statement that the information in the notification is accurate."
                  ].map((item, index) => (
                    <div key={index} className="flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                      <span className="font-bold text-red-600">{index + 1}.</span>
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <FaPaperPlane className="text-blue-500 text-xl" /> 
                  Designated Agent Contact
                </h2>
                <p>
                  Please send all infringement notices to our designated agent via email. We aim to process and remove infringing material within 24-48 hours.
                </p>
                
                <div className="bg-gray-900 rounded-2xl p-8 mt-6 relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Send Notice To:</p>
                    <a 
                      href={`mailto:${adminEmail}`} 
                      className="text-2xl md:text-3xl font-mono text-white hover:text-orange-400 transition-colors break-all"
                    >
                      {adminEmail}
                    </a>
                    <p className="text-gray-500 text-sm mt-4 italic">
                      Subject Line: "DMCA Takedown Request - [Bhajan Title]"
                    </p>
                  </div>
                  {/* Subtle Background Icon */}
                  <FaGavel className="absolute right-[-20px] bottom-[-20px] text-white/5 text-9xl rotate-12" />
                </div>
              </section>

              <hr className="my-10 border-gray-100" />

              <section className="text-sm bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <h4 className="font-bold text-orange-800 mb-2">Ownership Clarification:</h4>
                <p className="text-orange-700 m-0 leading-relaxed">
                  Most lyrics found on this platform are traditional compositions that have existed for centuries and are considered to be in the <strong>Public Domain</strong>. We do not claim ownership of these ancient texts. Our platform provides modern formatting, transliterations, and meanings to help preserve this heritage. However, we respect copyright for specific translations or modern musical arrangements.
                </p>
              </section>

            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            Interested in contributing? <a href="/submit" className="text-orange-600 font-bold hover:underline">Submit a Bhajan</a>
          </p>
        </div>
      </div>
    </div>
  );
}