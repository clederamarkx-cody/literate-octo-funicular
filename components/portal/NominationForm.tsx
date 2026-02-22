import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Loader2, Mail, Lock, Eye, EyeOff, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { createUserProfile, createApplicant, activateAccessKey } from '../../services/dbService';
import { Applicant } from '../../types';

interface NominationFormProps {
  onBack: () => void;
}

const NominationForm: React.FC<NominationFormProps> = ({ onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [companyName, setCompanyName] = useState('Nominated Establishment');
  const [category, setCategory] = useState<Applicant['details']['nomineeCategory']>('private');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Generate unique internal ID
      const newId = 'user_' + Date.now().toString();

      // 2. Validate and Activate Key
      const isActivated = await activateAccessKey(accessKey.trim(), newId);
      if (!isActivated) {
        setError("Invalid or previously activated Access Key. Please contact DOLE if you need assistance.");
        setIsSubmitting(false);
        return;
      }

      // 3. Create User Profile
      await createUserProfile(newId, email.toLowerCase(), 'nominee');

      // 4. Create Applicant Record
      await createApplicant(newId, accessKey.trim(), companyName, category);

      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Failed to activate nomination:", err);
      setIsSubmitting(false);
      setError("System fault during activation. Please try again later.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in duration-300 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gkk-gold"></div>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-green-50">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gkk-navy mb-3">Nomination Activated!</h2>
          <div className="text-xs font-bold text-gkk-gold uppercase tracking-[0.3em] mb-8">Establishment Verified</div>
          <p className="text-gray-600 mb-10 leading-relaxed text-lg">
            Your organization has been successfully verified in the <span className="font-bold text-gkk-navy">14<sup>th</sup> GKK System</span>.
            <br /><br />
            You can now log in to the portal to upload your technical evidence and documentary requirements as requested by DOLE.
          </p>
          <button
            onClick={onBack}
            className="w-full py-4 bg-gkk-navy text-white font-bold rounded-2xl hover:bg-gkk-royalBlue transition-all shadow-xl shadow-gkk-navy/20 text-lg"
          >
            Proceed to Login Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-500 hover:text-gkk-navy transition-colors mb-8 group font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-bold text-gkk-navy leading-tight">
              Activate Invitation
            </h1>
            <p className="text-gray-500 font-medium">
              Verify your establishment using the Access Key from your DOLE Invitation Letter.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 ring-1 ring-black/5">
          <div className="h-2 bg-gradient-to-r from-gkk-gold via-yellow-400 to-gkk-goldDark"></div>

          <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8">

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4 ring-1 ring-blue-200/50">
              <KeyRound className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-blue-900 font-bold">Looking for your key?</p>
                <p className="text-xs text-blue-700 font-medium mt-1 leading-relaxed">
                  Access keys are provided exclusively via physical mail or official email by your respective DOLE Regional Office. If you haven't received one, your establishment may not yet be nominated for this cycle.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">DOLE Invitation Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-gkk-gold transition-colors" />
                  </div>
                  <input
                    required
                    type="text"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold focus:bg-white outline-none transition-all font-mono font-bold tracking-widest placeholder:text-gray-300"
                    placeholder="GKK-2024-XXXX-XXXX"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Account Administrator Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-gkk-gold transition-colors" />
                    </div>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold focus:bg-white outline-none transition-all font-medium placeholder:text-gray-300"
                      placeholder="safety.officer@establishment.ph"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Nominee Sector / Class</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Applicant['details']['nomineeCategory'])}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold focus:bg-white outline-none transition-all font-medium text-gkk-navy appearance-none"
                  >
                    <option value="private">Private Establishment</option>
                    <option value="government">Government Office</option>
                    <option value="micro">Micro Enterprise</option>
                    <option value="individual">Individual Professional</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Create Password</label>
                  <div className="relative group">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold focus:bg-white outline-none transition-all font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4 text-gray-300 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Confirm Password</label>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold focus:bg-white outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-500" />
                Secured by DOLE-OSHC
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center px-12 py-4 bg-gradient-to-r from-gkk-navy to-gkk-royalBlue text-white font-bold rounded-2xl shadow-2xl hover:shadow-gkk-navy/40 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 transition-all text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Activate
                    <ArrowLeft className="w-6 h-6 ml-3 rotate-180" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        <div className="text-center mt-12 pb-8">
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Access to this system is restricted to establishments nominated for the 14<sup>th</sup> GKK Award cycle. <br />
            By activating, you agree to the <a href="#" className="text-gkk-navy font-bold hover:underline">Data Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NominationForm;