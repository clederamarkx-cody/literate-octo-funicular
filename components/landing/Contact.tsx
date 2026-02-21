import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gkk-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gkk-gold text-sm font-bold tracking-widest uppercase">Support Center</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gkk-navy mt-2 mb-4">Contact Us</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Have questions about your nomination or the validation process? Our Secretariat is ready to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-10">
            <div className="bg-gray-50 rounded-[40px] p-10 border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-serif font-bold text-gkk-navy mb-8">The Secretariat</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gkk-gold group-hover:bg-gkk-navy group-hover:text-white transition-all duration-300">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Office Location</p>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      Occupational Safety and Health Center<br />
                      North Avenue corner Science Road, Diliman,<br />
                      Quezon City, 1101 Philippines
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gkk-gold group-hover:bg-gkk-navy group-hover:text-white transition-all duration-300">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hotline Number</p>
                    <p className="text-gray-700 font-bold text-lg">(02) 8929-6036</p>
                    <p className="text-xs text-gray-400 mt-1">Available Mon-Fri, 8AM - 5PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gkk-gold group-hover:bg-gkk-navy group-hover:text-white transition-all duration-300">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Inquiry</p>
                    <p className="text-gray-700 font-bold text-lg">gkk@oshc.dole.gov.ph</p>
                    <p className="text-xs text-gray-400 mt-1">Official Cycle Communications</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gkk-navy rounded-[40px] p-8 text-white relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-gkk-gold/10 rounded-tl-full blur-2xl"></div>
              <p className="text-gkk-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Regional Support</p>
              <h4 className="text-xl font-serif font-bold mb-4 leading-tight">Need to speak with your Regional Office?</h4>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Nominations are initiated at the regional level. If you are inquiring about a specific nomination in your area, we can redirect you to your local OSH Center.
              </p>
              <a href="https://oshc.dole.gov.ph/contact-us/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-bold text-gkk-gold hover:text-white transition-colors uppercase tracking-widest group">
                Regional Directory <Send size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-100 shadow-2xl rounded-[40px] p-10 md:p-14 ring-1 ring-black/5">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-gkk-navy mb-4">Message Transmitted</h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  Your inquiry has been received by the National Secretariat. We will respond within 24-48 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold focus:bg-white outline-none transition-all font-medium" 
                      placeholder="Juan Dela Cruz"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold focus:bg-white outline-none transition-all font-medium" 
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Inquiry Subject</label>
                  <select 
                    required 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold focus:bg-white outline-none transition-all font-medium appearance-none"
                  >
                    <option value="">Select a topic</option>
                    <option value="nomination">Nomination Process</option>
                    <option value="portal">Portal Access Support</option>
                    <option value="technical">Technical Verification Criteria</option>
                    <option value="ceremony">Awarding Ceremony Details</option>
                    <option value="other">Other Inquiries</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                  <textarea 
                    required 
                    rows={4}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold focus:bg-white outline-none transition-all font-medium resize-none" 
                    placeholder="Describe your inquiry in detail..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-gkk-navy text-white font-bold rounded-2xl shadow-xl shadow-gkk-navy/20 hover:bg-gkk-royalBlue hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm"
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Transmit Inquiry
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                  Privacy Protected • Official Communication
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;