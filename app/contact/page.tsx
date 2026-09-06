"use client";

import { useState, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { FaEnvelope, FaWhatsapp, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import { GiLotusFlower } from 'react-icons/gi';
import Link from 'next/link';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: 'General Enquiry',
    message: ''
  });

  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(30); 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Prepending reason to message to ensure compatibility with existing database schema
      const formattedMessage = `[Reason: ${formData.reason}]\n\n${formData.message.trim()}`;

      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          { 
            name: formData.name.trim(), 
            email: formData.email.trim(), 
            message: formattedMessage
          }
        ]);

      if (error) throw error;

      setSubmitted(true);
      setFormData({ name: '', email: '', reason: 'General Enquiry', message: '' });
    } catch (error) {
      alert("Something went wrong. Please try again or use WhatsApp.");
      console.error("Submission Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const contactTopics = [
    { title: "भजन या सामग्री में सुधार", desc: "यदि किसी भजन, आरती, चालीसा, स्तोत्र या अन्य पृष्ठ में शब्दों, वर्तनी, शीर्षक, कलाकार, भाषा या अन्य जानकारी से संबंधित कोई त्रुटि दिखाई देती है, तो कृपया हमें बताएं।" },
    { title: "नया भजन या सामग्री सुझाव", desc: "यदि आप चाहते हैं कि किसी विशेष भजन या devotional content को हमारी वेबसाइट पर शामिल करने पर विचार किया जाए, तो उसका नाम और उपलब्ध जानकारी साझा कर सकते हैं।" },
    { title: "कॉपीराइट या अधिकार संबंधी चिंता", desc: "यदि आप किसी सामग्री के अधिकार धारक हैं या आपको लगता है कि हमारी वेबसाइट पर उपलब्ध सामग्री आपके अधिकारों का उल्लंघन करती है, तो कृपया हमारी DMCA & Copyright Policy में दिए गए निर्देशों के अनुसार जानकारी भेजें।" },
    { title: "तकनीकी समस्या", desc: "यदि कोई पृष्ठ नहीं खुल रहा, लिंक काम नहीं कर रहा, सामग्री गलत दिखाई दे रही है या वेबसाइट में कोई अन्य तकनीकी समस्या है, तो हमें समस्या का विवरण और संबंधित पृष्ठ का लिंक भेजें।" },
    { title: "सामान्य सुझाव और प्रतिक्रिया", desc: "हम वेबसाइट को बेहतर बनाने के लिए उपयोगी सुझावों और रचनात्मक प्रतिक्रिया का स्वागत करते हैं।" },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      
      <title>Contact Us - Hindi Bhajan Manjari | Suggestions & Support</title>
      <meta name="description" content="Get in touch with Hindi Bhajan Manjari. Suggest new bhajans, report corrections, or reach out to our editorial team." />

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 text-orange-500/5 pointer-events-none">
        <GiLotusFlower size={400} />
      </div>

      <div className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 md:mb-20 max-w-4xl mx-auto">
          <span className="inline-block bg-orange-50 border border-orange-100 text-orange-600 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-6">
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-hindi text-gray-900 mb-8 tracking-tighter leading-tight">
            हमसे <span className="text-orange-600">संपर्क करें</span>
          </h1>
          
          <div className="text-gray-700 text-lg md:text-xl leading-[1.8] font-hindi font-medium space-y-4">
            <p>
              Hindi Bhajan Manjari से संपर्क करने के लिए आपका स्वागत है। यदि आपको किसी भजन, आरती, चालीसा या अन्य सामग्री में त्रुटि दिखाई देती है, किसी सामग्री के संबंध में जानकारी साझा करनी है, नया भजन सुझाना है, या कोई सामान्य प्रश्न पूछना है, तो आप हमें संदेश भेज सकते हैं।
            </p>
            <p>
              हम पाठकों, भक्तों, रचनाकारों और अधिकार धारकों से प्राप्त उपयोगी सुझावों और सुधारों का स्वागत करते हैं। यदि आप किसी पृष्ठ के संबंध में संपर्क कर रहे हैं, तो कृपया उस पृष्ठ का सटीक लिंक (URL) भी साझा करें, ताकि हम आपके अनुरोध की सही सामग्री की समीक्षा कर सकें।
            </p>
            <p className="font-sans text-base text-gray-500 mt-4">
              For general enquiries, content corrections, suggestions and website-related support, you can contact us using the details or form below.
            </p>
          </div>
        </div>

        {/* --- WHAT CAN YOU CONTACT US ABOUT --- */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 text-center font-hindi">आप किन विषयों के लिए हमसे संपर्क कर सकते हैं?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactTopics.map((topic, idx) => (
              <div key={idx} className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100/50">
                <h3 className="font-bold text-gray-900 mb-2 font-hindi text-lg">{topic.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-hindi">{topic.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid xl:grid-cols-5 gap-12 items-start">
          
          {/* --- INFO SIDE (2 Columns) --- */}
          <div className="xl:col-span-2 space-y-6">
            
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-orange-900/5 hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-sm">
                <FaEnvelope size={24} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Email Us</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed font-medium">
                For detailed enquiries, content corrections, copyright-related concerns, technical issues, or other website-related matters, please contact us by email.
                <br /><br />
                <span className="italic">For faster review, please include a clear subject and, where relevant, the exact URL of the page you are contacting us about.</span>
              </p>
              <a href="mailto:support@hindibhajanmanjari.com" className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors">
                support@hindibhajanmanjari.com <HiArrowRight />
              </a>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-green-900/5 hover:-translate-y-1 hover:border-green-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#25D366] group-hover:text-white transition-colors shadow-sm">
                <FaWhatsapp size={28} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">WhatsApp</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed font-medium">
                For quick website-related questions, typo corrections, suggestions, or feedback, you can contact us on WhatsApp. 
                <br /><br />
                <span className="font-bold text-gray-700">Please avoid sending sensitive personal or financial information through WhatsApp.</span> For detailed copyright concerns or requests requiring supporting information, email may be more suitable.
              </p>
              <a 
                href="https://wa.me/918384844353" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition-colors"
              >
                +91 8384844353 <HiArrowRight />
              </a>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                <FaMapMarkerAlt size={24} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Our Location</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed font-medium">
                Hindi Bhajan Manjari is independently operated from:
                <br /><br />
                <strong className="text-gray-800">Farah, Mathura, Uttar Pradesh, India</strong>
                <br /><br />
                Our website serves readers and devotees online. This location information is provided to help visitors understand where the website is operated from and is not intended as a public customer-service office or walk-in location unless explicitly stated otherwise.
              </p>
            </div>

          </div>

          {/* --- FORM SIDE (3 Columns) --- */}
          <div className="xl:col-span-3">
            {submitted ? (
              <div className="bg-white p-12 md:p-16 rounded-[2.5rem] border border-orange-100 text-center shadow-2xl shadow-orange-900/10 animate-fade-in-up">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <FaCheckCircle size={48} />
                </div>
                <h2 className="text-4xl font-black font-hindi text-gray-900 mb-4 tracking-tighter">धन्यवाद! आपका संदेश प्राप्त हो गया है।</h2>
                <p className="text-gray-600 text-lg mb-8 font-medium font-hindi">
                  हम आपके संदेश की समीक्षा करेंगे। यदि आपके अनुरोध के लिए उत्तर आवश्यक होगा और आपने सही संपर्क जानकारी प्रदान की है, तो हम उचित होने पर आपसे संपर्क कर सकते हैं।
                </p>
                <button 
                  onClick={() => { triggerHaptic(); setSubmitted(false); }}
                  className="px-8 py-3 bg-orange-50 text-orange-600 font-bold rounded-full hover:bg-orange-100 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-900/5">
                
                <div className="mb-8 border-b border-gray-100 pb-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Send Us a Message</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Please provide accurate contact information and describe your request clearly. If your message relates to a specific page on Hindi Bhajan Manjari, please include the full page URL in your message. This helps us identify the correct content and review your request more efficiently.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Mohit Tarkar"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-900" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-900" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Reason for Contact</label>
                    <select
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Content Correction">Content Correction</option>
                      <option value="Suggest Content">Suggest Content</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Copyright Concern">Copyright Concern</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Your Message</label>
                    <textarea 
                      required
                      placeholder="कृपया अपना संदेश स्पष्ट रूप से लिखें। यदि आपका संदेश किसी विशेष पृष्ठ से संबंधित है, तो उस पृष्ठ का पूरा लिंक (URL) भी शामिल करें।"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all resize-none font-medium font-hindi text-gray-900"
                    ></textarea>
                  </div>

                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-orange-600 text-white font-black py-4 md:py-5 rounded-2xl hover:bg-orange-500 transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.3)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.4)] flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:shadow-none hover:-translate-y-0.5 active:scale-[0.98] group text-lg"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin text-2xl" />
                    ) : (
                      <>
                        Send Message 
                        <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 mt-6 border border-gray-100">
                    <FaInfoCircle className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-[12px] font-medium text-gray-600 leading-relaxed m-0">
                      <strong>Privacy Notice:</strong> The information you submit through this form will be used to review and respond to your enquiry in accordance with our <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>. By submitting this form, you acknowledge that you have read our Privacy Policy.
                    </p>
                  </div>

                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}