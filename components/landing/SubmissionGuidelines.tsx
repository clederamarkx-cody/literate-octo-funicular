import React from 'react';
import { FileType, Check, Upload, AlertCircle } from 'lucide-react';

interface SubmissionGuidelinesProps {
  onUnderDev?: () => void;
}

const SubmissionGuidelines: React.FC<SubmissionGuidelinesProps> = ({ onUnderDev }) => {
  return (
    <section id="guidelines" className="py-24 bg-white relative overflow-hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
                <span className="text-gkk-gold text-sm font-bold tracking-widest uppercase">Requirements</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gkk-navy mt-2 mb-6">Document Submission Guidelines</h2>
                <div className="flex justify-center mt-4">
                  <button 
                    onClick={onUnderDev}
                    className="text-xs font-bold text-gkk-gold hover:text-gkk-navy border border-gkk-gold/30 hover:border-gkk-navy px-4 py-2 rounded-lg transition-all"
                  >
                    Download Submission Templates
                  </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left: Technical Specs */}
                <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center mb-8 pb-4 border-b border-gray-200">
                        <div className="w-10 h-10 bg-gkk-navy/10 rounded-lg flex items-center justify-center text-gkk-navy mr-4">
                            <FileType size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gkk-navy font-serif">File Specifications</h3>
                    </div>
                    
                    <ul className="space-y-6">
                        <li className="flex items-start">
                            <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-green-600" />
                            </div>
                            <div>
                                <strong className="text-gkk-navy block mb-1 text-sm uppercase tracking-wider">Accepted File Formats</strong>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">PDF</span>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded uppercase">PPTX</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">JPG</span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase">PNG</span>
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start">
                             <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-green-600" />
                            </div>
                            <div>
                                <strong className="text-gkk-navy block mb-1 text-sm uppercase tracking-wider">File Size Limits</strong>
                                <p className="text-gray-600 text-sm font-medium">Maximum of <span className="font-bold text-gkk-navy">25MB</span> per individual file upload.</p>
                            </div>
                        </li>
                         <li className="flex items-start">
                             <div className="mt-1 mr-4 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-green-600" />
                            </div>
                            <div>
                                <strong className="text-gkk-navy block mb-1 text-sm uppercase tracking-wider">Naming Convention</strong>
                                <p className="text-gray-600 text-xs mb-2">Please use the following format for all uploads:</p>
                                <code className="block bg-gray-200 text-gray-700 px-3 py-2 rounded text-[10px] font-mono break-all font-bold">
                                    [Category]_[CompanyName]_[DocumentType].pdf
                                </code>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Right: Submission Process */}
                <div>
                     <div className="flex items-center mb-8 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-gkk-gold/20 rounded-lg flex items-center justify-center text-gkk-navy mr-4">
                            <Upload size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gkk-navy font-serif">How to Submit</h3>
                    </div>

                    <div className="space-y-8 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100"></div>

                        <div className="relative pl-12 group">
                            <span className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gkk-navy text-white flex items-center justify-center text-xs font-bold border-4 border-white shadow-sm group-hover:bg-gkk-gold transition-colors">1</span>
                            <h4 className="font-bold text-gkk-navy text-lg leading-none">Register Nominee</h4>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                                DOLE nominated establishments receive an Invitation Key to register on this portal.
                            </p>
                        </div>
                         <div className="relative pl-12 group">
                            <span className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white text-gray-400 flex items-center justify-center text-xs font-bold border-4 border-gray-100 shadow-sm group-hover:border-gkk-gold group-hover:text-gkk-navy transition-colors">2</span>
                            <h4 className="font-bold text-gkk-navy text-lg leading-none">Document Upload</h4>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                                Navigate to the "Evidence Repository" to upload the required technical artifacts.
                            </p>
                        </div>
                         <div className="relative pl-12 group">
                            <span className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white text-gray-400 flex items-center justify-center text-xs font-bold border-4 border-gray-100 shadow-sm group-hover:border-gkk-gold group-hover:text-gkk-navy transition-colors">3</span>
                            <h4 className="font-bold text-gkk-navy text-lg leading-none">Validation</h4>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                                Regional judges conduct technical validation of documents before final selection.
                            </p>
                        </div>
                    </div>

                    {/* Warning/Note */}
                    <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start">
                        <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            <strong>Note:</strong> While digital submission is the primary method, the Regional Selection Committee may request <strong>physical verification</strong> of original documents during onsite visits.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default SubmissionGuidelines;