import React, { useState } from 'react';
import { Save, User, Mail, MapPin, Briefcase } from 'lucide-react';
import { User as UserType } from '../../types';

interface StaffProfileEditProps {
    userData: UserType;
    onUpdateProfile: (updatedData: Partial<UserType>) => Promise<boolean>;
    onUnderDev: () => void;
}

const StaffProfileEdit: React.FC<StaffProfileEditProps> = ({ userData, onUpdateProfile, onUnderDev }) => {
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
        region: userData?.region || 'NCR',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setStatus('idle');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus('idle');

        const success = await onUpdateProfile(formData);

        if (success) {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } else {
            setStatus('error');
        }

        setIsSaving(false);
    };

    return (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 p-1">
                <h2 className="text-3xl font-serif font-bold text-gkk-navy uppercase tracking-widest">My Profile</h2>
                <p className="text-gray-500 mt-2 font-medium">Update your professional information and regional assignment.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-[30px] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 bg-gkk-gold h-full"></div>

                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-gkk-navy/5 text-gkk-navy rounded-2xl ring-1 ring-gkk-navy/10">
                            <User size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gkk-navy font-serif">Account Information</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Role: {userData?.role?.replace(/_/g, ' ').toUpperCase() || 'STAF'}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl border border-gray-100 focus:border-gkk-gold focus:ring-4 focus:ring-gkk-gold/5 outline-none transition-all font-bold text-gkk-navy bg-gray-50/50 text-sm"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 outline-none font-bold text-gray-400 bg-gray-50/30 text-sm cursor-not-allowed italic"
                                    title="Email is managed by DOLE IT administrators"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Regional Assignment</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <select
                                    value={formData.region}
                                    onChange={(e) => handleChange('region', e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 focus:border-gkk-gold focus:ring-4 focus:ring-gkk-gold/5 outline-none transition-all font-bold text-gkk-navy bg-gray-50/50 text-sm appearance-none"
                                >
                                    <option value="NCR">NCR - National Capital Region</option>
                                    <option value="CAR">CAR - Cordillera Administrative Region</option>
                                    <option value="Region I">Region I - Ilocos Region</option>
                                    <option value="Region II">Region II - Cagayan Valley</option>
                                    <option value="Region III">Region III - Central Luzon</option>
                                    <option value="Region IV-A">Region IV-A - CALABARZON</option>
                                    <option value="Region IV-B">Region IV-B - MIMAROPA</option>
                                    <option value="Region V">Region V - Bicol Region</option>
                                    <option value="Region VI">Region VI - Western Visayas</option>
                                    <option value="Region VII">Region VII - Central Visayas</option>
                                    <option value="Region VIII">Region VIII - Eastern Visayas</option>
                                    <option value="Region IX">Region IX - Zamboanga Peninsula</option>
                                    <option value="Region X">Region X - Northern Mindanao</option>
                                    <option value="Region XI">Region XI - Davao Region</option>
                                    <option value="Region XII">Region XII - SOCCSKSARGEN</option>
                                    <option value="Region XIII">Region XIII - Caraga</option>
                                    <option value="BARMM">BARMM</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Access Level</label>
                            <div className="relative">
                                <Briefcase size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    value={userData?.role?.replace(/_/g, ' ').toUpperCase() || 'STAFF'}
                                    readOnly
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 outline-none font-bold text-gray-400 bg-gray-50/30 text-sm cursor-not-allowed italic"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                    <div className="flex items-center gap-3">
                        {status === 'success' && (
                            <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase animate-in fade-in slide-in-from-left-2">
                                <ShieldCheck size={16} />
                                Profile updated successfully
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase animate-in fade-in slide-in-from-left-2">
                                <ShieldAlert size={16} />
                                Update failed. Please try again.
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onUnderDev}
                            className="flex-1 sm:flex-none px-10 py-4 rounded-2xl font-bold text-gray-400 hover:text-gkk-navy transition-colors uppercase tracking-[0.2em] text-[10px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-12 py-4 bg-gkk-navy text-white rounded-2xl font-bold shadow-2xl shadow-gkk-navy/20 hover:shadow-gkk-navy/40 hover:-translate-y-1 transition-all uppercase tracking-[0.2em] text-[10px] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                                    Update Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default StaffProfileEdit;

// Helper Icons for feedback (simplified)
const ShieldCheck = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
);
const ShieldAlert = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
);
