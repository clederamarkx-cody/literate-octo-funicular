import React, { useRef, useEffect } from 'react';
import { ChevronRight, Bell, ChevronDown, User, Building2, LogOut } from 'lucide-react';

interface ApplicantProfileHeaderProps {
    activeTab: 'dashboard' | 'entry';
    profileData: any;
    isProfileDropdownOpen: boolean;
    setIsProfileDropdownOpen: (open: boolean) => void;
    onUnderDev: () => void;
    onLogout: () => void;
}

const ApplicantProfileHeader: React.FC<ApplicantProfileHeaderProps> = ({
    activeTab,
    profileData,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
    onUnderDev,
    onLogout
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsProfileDropdownOpen]);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-40">
            <div className="flex items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                <span>Nomination Portal</span>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-gkk-navy">{activeTab === 'dashboard' ? 'Summary' : 'Stage 1 Verification'}</span>
            </div>

            <div className="flex items-center space-x-4">
                <button onClick={onUnderDev} className="relative p-2 text-gray-400 hover:text-gkk-navy transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="flex items-center space-x-3 group bg-gray-50 hover:bg-gray-100 p-1 rounded-2xl transition-all pr-4"
                    >
                        <div className="w-10 h-10 bg-gkk-navy rounded-xl flex items-center justify-center text-white font-bold border-2 border-gkk-gold group-hover:scale-105 transition-transform">
                            {profileData.representative.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-bold text-gkk-navy leading-none">{profileData.representative}</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Nominee Lead</p>
                        </div>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 animate-in slide-in-from-top-2 duration-300 overflow-hidden ring-4 ring-black/5">
                            <div className="px-5 py-3 border-b border-gray-50 mb-2 bg-gray-50/50">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nominated via DOLE</p>
                                <p className="text-sm font-bold text-gkk-navy mt-1 truncate">{profileData.email}</p>
                            </div>
                            <div className="px-2 space-y-1">
                                <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gkk-navy rounded-xl transition-colors">
                                    <User size={18} className="text-gray-400" />
                                    <span className="font-medium">Account Settings</span>
                                </button>
                                <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gkk-navy rounded-xl transition-colors">
                                    <Building2 size={18} className="text-gray-400" />
                                    <span className="font-medium">Establishment Info</span>
                                </button>
                            </div>
                            <div className="h-px bg-gray-50 my-2 mx-3"></div>
                            <div className="px-2">
                                <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors group">
                                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="font-bold">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ApplicantProfileHeader;
