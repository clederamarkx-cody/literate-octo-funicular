import React, { useState } from 'react';
import { Save, User, Building2, MapPin, Briefcase, Mail, Phone, Users } from 'lucide-react';

interface NomineeProfileEditProps {
    profileData: any;
    onUpdateProfile: (updatedData: any) => void;
    onUnderDev: () => void;
}

const NomineeProfileEdit: React.FC<NomineeProfileEditProps> = ({ profileData, onUpdateProfile, onUnderDev }) => {
    const [formData, setFormData] = useState({
        details: {
            companyName: profileData?.details?.companyName || '',
            companyAddress: profileData?.details?.companyAddress || '',
            region: profileData?.details?.region || '',
            industry: profileData?.details?.industry || '',
            workforceSize: profileData?.details?.workforceSize || '',
            nomineeCategory: profileData?.details?.nomineeCategory || 'private',
        },
        representative: profileData?.representative || '',
        email: profileData?.email || '',
        phone: profileData?.phone || '',
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (section: 'details' | 'root', field: string, value: string) => {
        setFormData(prev => {
            if (section === 'root') {
                return { ...prev, [field]: value };
            }
            return {
                ...prev,
                details: {
                    ...prev.details,
                    [field]: value
                }
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const updatedProfile = {
            ...profileData,
            ...formData,
            details: {
                ...profileData.details,
                ...formData.details
            }
        };

        onUpdateProfile(updatedProfile);
        setIsSaving(false);
    };

    return (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-gkk-navy uppercase tracking-widest">Edit Profile</h2>
                <p className="text-gray-500 mt-2 font-medium">Update your organization's details and contact information.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Organization Details */}
                <div className="bg-white rounded-[30px] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Building2 size={24} /></div>
                        <h3 className="text-xl font-bold text-gkk-navy font-serif">Organization Profile</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Organization Name</label>
                            <input
                                type="text"
                                value={formData.details.companyName}
                                onChange={(e) => handleChange('details', 'companyName', e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gkk-navy focus:ring-2 focus:ring-gkk-navy/10 outline-none transition-all font-medium text-gkk-navy bg-gray-50/50"
                                placeholder="Enter organization name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1 flex items-center justify-between">
                                Nominee Category
                                <span className="flex items-center gap-1 text-[8px] text-gkk-gold bg-gold-50 px-1.5 py-0.5 rounded-md border border-gkk-gold/20">
                                    <Lock size={8} /> Fixed by Admin
                                </span>
                            </label>
                            <div className="relative">
                                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.details.nomineeCategory ? (formData.details.nomineeCategory.charAt(0).toUpperCase() + formData.details.nomineeCategory.slice(1)) : 'Private Industry'}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-400 font-bold cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Complete Address</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.details.companyAddress}
                                    onChange={(e) => handleChange('details', 'companyAddress', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-gkk-navy focus:ring-2 focus:ring-gkk-navy/10 outline-none transition-all font-medium text-gkk-navy bg-gray-50/50"
                                    placeholder="Street, City, Province"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Region</label>
                            <select
                                value={formData.details.region}
                                onChange={(e) => handleChange('details', 'region', e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gkk-navy focus:ring-2 focus:ring-gkk-navy/10 outline-none transition-all font-medium text-gkk-navy bg-gray-50/50 appearance-none"
                                required
                            >
                                <option value="">Select Region</option>
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
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Industry Sector</label>
                            <div className="relative">
                                <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.details.industry}
                                    onChange={(e) => handleChange('details', 'industry', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-gkk-navy focus:ring-2 focus:ring-gkk-navy/10 outline-none transition-all font-medium text-gkk-navy bg-gray-50/50"
                                    placeholder="e.g. Manufacturing, Construction"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Workforce Size</label>
                            <div className="relative">
                                <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="string"
                                    value={formData.details.workforceSize}
                                    onChange={(e) => handleChange('details', 'workforceSize', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-gkk-navy focus:ring-2 focus:ring-gkk-navy/10 outline-none transition-all font-medium text-gkk-navy bg-gray-50/50"
                                    placeholder="Total Number of Employees"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Person Details */}
                <div className="bg-white rounded-[30px] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-xl"><User size={24} /></div>
                        <h3 className="text-xl font-bold text-gkk-navy font-serif">Primary Focal Person</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.representative}
                                onChange={(e) => handleChange('root', 'representative', e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gkk-navy focus:ring-2 focus:ring-gkk-navy/10 outline-none transition-all font-medium text-gkk-navy bg-gray-50/50"
                                placeholder="Enter authorized representative"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1 flex items-center justify-between">
                                Email Address
                                <span className="flex items-center gap-1 text-[8px] text-gkk-gold bg-gold-50 px-1.5 py-0.5 rounded-md border border-gkk-gold/20">
                                    <Lock size={8} /> Verified
                                </span>
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="email"
                                    readOnly
                                    value={formData.email}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-400 font-bold cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Phone / Mobile</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('root', 'phone', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-gkk-navy focus:ring-2 focus:ring-gkk-navy/10 outline-none transition-all font-medium text-gkk-navy bg-gray-50/50"
                                    placeholder="+63 9XX XXX XXXX"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onUnderDev}
                        className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:text-gkk-navy hover:bg-gray-100 transition-colors uppercase tracking-widest text-xs"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-10 py-3 bg-gkk-navy text-white rounded-2xl font-bold shadow-xl hover:shadow-gkk-navy/40 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Profile
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NomineeProfileEdit;
