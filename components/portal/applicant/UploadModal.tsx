import React from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';

interface DocumentSlot {
    id: string;
    category: 'Reportorial Compliance' | 'Legal & Administrative' | 'OSH Systems';
    label: string;
    fileName: string | null;
    status: 'pending' | 'uploaded';
    lastUpdated: string;
    previewUrl: string | null;
    type: string;
    round: number;
    remarks?: string;
}

interface UploadModalProps {
    isUploadModalOpen: boolean;
    handleCloseUpload: () => void;
    uploadStatus: 'idle' | 'encrypting' | 'uploading' | 'success';
    documents: DocumentSlot[];
    selectedDocId: string | null;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedFile: File | null;
    uploadRemarks: string;
    setUploadRemarks: (val: string) => void;
    uploadProgress: number;
    handleUpload: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
    isUploadModalOpen,
    handleCloseUpload,
    uploadStatus,
    documents,
    selectedDocId,
    handleFileSelect,
    selectedFile,
    uploadRemarks,
    setUploadRemarks,
    uploadProgress,
    handleUpload
}) => {
    if (!isUploadModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gkk-navy/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3"><div className="p-2 bg-gkk-navy rounded-xl text-white"><Upload size={24} /></div><h3 className="text-xl font-bold text-gkk-navy font-serif uppercase tracking-wider">Secure Upload</h3></div>
                    <button onClick={handleCloseUpload} className="p-2 text-gray-400 hover:text-gkk-navy"><X size={24} /></button>
                </div>
                <div className="p-10">
                    {uploadStatus === 'success' ? (
                        <div className="text-center py-10"><div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div><h4 className="text-2xl font-bold text-gkk-navy uppercase tracking-widest">Success</h4><p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Document Verified</p></div>
                    ) : (
                        <div className="space-y-8">
                            <div className="relative group border-4 border-dashed border-gray-200 rounded-[35px] p-12 text-center hover:border-gkk-gold transition-all cursor-pointer">
                                <input type="file" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept={documents.find(d => d.id === selectedDocId)?.round === 3 ? ".pdf" : ".pdf,.png,.jpg"} />
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-400 group-hover:text-gkk-gold transition-colors"><Upload size={32} /></div>
                                    <p className="text-sm font-bold text-gkk-navy uppercase tracking-widest">{selectedFile ? selectedFile.name : 'Select Artifact'}</p>
                                </div>
                            </div>
                            {uploadStatus === 'idle' && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Selected File</p>
                                    <div className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gkk-navy font-bold">
                                        {selectedFile ? selectedFile.name : 'No file selected.'}
                                    </div>

                                    {selectedFile && (
                                        <div className="mt-4 text-left">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Reviewer Remarks (Optional)</label>
                                            <textarea
                                                value={uploadRemarks}
                                                onChange={(e) => setUploadRemarks(e.target.value)}
                                                placeholder="Add any notes here regarding this submission..."
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gkk-navy font-medium focus:outline-none focus:ring-2 focus:ring-gkk-gold/50 resize-none h-24"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            {(uploadStatus === 'uploading' || uploadStatus === 'encrypting') && (
                                <div className="space-y-3"><div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest"><span>{uploadStatus === 'encrypting' ? 'Encrypting...' : 'Uploading...'}</span><span>{uploadProgress}%</span></div><div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-gkk-gold h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div></div></div>
                            )}
                        </div>
                    )}
                </div>
                <div className="p-8 bg-gray-50 flex justify-end gap-4">
                    {uploadStatus !== 'success' && (
                        <>
                            <button onClick={handleCloseUpload} className="px-8 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Cancel</button>
                            <button onClick={handleUpload} disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'encrypting'} className="px-10 py-3 bg-gkk-navy text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl disabled:opacity-20">{(uploadStatus === 'uploading' || uploadStatus === 'encrypting') ? '...' : 'Upload'}</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
