
import React from 'react';
import { LayoutDashboard, FileCheck, Download, ShieldCheck } from 'lucide-react';

interface ApplicantSidebarProps {
    activeTab: 'dashboard' | 'entry' | 'profile';
    setActiveTab: (tab: 'dashboard' | 'entry' | 'profile') => void;
    onUnderDev: () => void;
}

const ApplicantSidebar: React.FC<ApplicantSidebarProps> = ({ activeTab, setActiveTab, onUnderDev }) => {
    return (
        <aside className="w-64 bg-gkk-navy text-white flex flex-col flex-shrink-0 border-r border-white/5">
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-gkk-gold to-yellow-200 rounded-lg flex items-center justify-center">
                        <span className="text-gkk-navy font-bold text-sm">14<sup>th</sup></span>
                    </div>
                    <span className="font-serif font-bold tracking-widest text-lg uppercase">Nominee</span>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <LayoutDashboard size={20} />
                    <span className="text-sm font-medium">Nominee Dashboard</span>
                </button>
                <button onClick={() => setActiveTab('entry')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'entry' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <FileCheck size={20} />
                    <span className="text-sm font-medium">Verify Records</span>
                </button>
                <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    <LayoutDashboard size={20} />
                    <span className="text-sm font-medium">Edit Profile</span>
                </button>
                <div className="pt-6 mt-6 border-t border-white/5">
                    <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">GKK Support</p>
                    <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                        <Download size={20} />
                        <span className="text-sm font-medium">Submission Kit</span>
                    </button>
                    <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                        <ShieldCheck size={20} />
                        <span className="text-sm font-medium">OSH Standards</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default ApplicantSidebar;
