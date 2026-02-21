import React, { useState } from 'react';
/* Added missing Loader2 to the lucide-react import list */
import { Eye, EyeOff, Shield, User, Lock, ArrowRight, LayoutDashboard, KeyRound, Zap, Loader2, Building2, AlertCircle } from 'lucide-react';
import { getUserByEmail } from '../../services/dbService';
interface LoginProps {
    onLogin?: (role: 'applicant' | 'evaluator', email?: string) => void;
    onRegisterClick?: () => void;
    onQuickRegister?: (companyName: string) => void;
    onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick, onQuickRegister, onBack }) => {
    const [role, setRole] = useState<'applicant' | 'evaluator' | 'quick' | 'admin'>('applicant');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDemoFill = () => {
        setError(null);
        if (role === 'applicant') {
            // Toggle between applicant 1 and 2 for demo purposes
            if (email === 'applicant@applicant.com') {
                setEmail('applicant2@applicant.com');
                setPassword('applicant2');
            } else {
                setEmail('applicant@applicant.com');
                setPassword('applicant');
            }
        } else if (role === 'evaluator') {
            setEmail('admin@admin.com');
            setPassword('admin');
            setAccessCode('GKK-AUTH-2024');
        } else if (role === 'admin') {
            setEmail('mark@data.com');
            setPassword('data');
            setAccessCode('GKK-AUTH-2024');
        } else {
            setCompanyName('Acme Global Solutions Phils.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (role === 'quick' && onQuickRegister) {
                onQuickRegister(companyName);
                setIsLoading(false);
                return;
            }

            // Hardcoded check for newly requested user
            if (email === 'carlo@data.com' && password === 'data') {
                if (role === 'evaluator' || role === 'applicant') {
                    if (onLogin) onLogin('evaluator', 'user_carlo_mock');
                }
                setIsLoading(false);
                return;
            }

            if (email === 'mark@data.com' && password === 'data') {
                if (role === 'admin' || role === 'evaluator' || role === 'applicant') {
                    if (onLogin) onLogin('evaluator', 'user_mark_admin');
                }
                setIsLoading(false);
                return;
            }

            if (email === 'abyguel@scd.com' && password === 'scd123') {
                if (role === 'evaluator' || role === 'applicant') {
                    if (onLogin) onLogin('applicant', 'user_abyguel_mock');
                }
                setIsLoading(false);
                return;
            }

            // Hardcoded check for admin login for now (for demo purposes)
            if (email === 'admin@admin.com' && password === 'admin') {
                if (onLogin) onLogin('evaluator', 'admin_uid_mock');
                setIsLoading(false);
                return;
            }

            // Query database for user
            const user = await getUserByEmail(email);

            if (!user) {
                setError("No account found with this email.");
                setIsLoading(false);
                return;
            }



            // Check role assignment
            if (role === 'evaluator' || role === 'admin') {
                const staffRoles = ['evaluator', 'admin', 'reu', 'dole', 'scd'];
                if (staffRoles.includes(user.role)) {
                    if (accessCode === 'GKK-AUTH-2024') {
                        if (onLogin) onLogin('evaluator', user.uid);
                    } else {
                        setError("Invalid Judge Credentials.");
                    }
                } else {
                    setError("This account does not have " + (role === 'admin' ? "Admin" : "Evaluator") + " privileges.");
                }
            } else if (role === 'applicant') {
                if (user.role === 'nominee') {
                    if (onLogin) onLogin('applicant', user.uid);
                } else {
                    setError("This account does not have Nominee privileges.");
                }
            }

        } catch (err) {
            console.error(err);
            setError("System error during authentication.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gkk-navy/5 skew-x-12 transform origin-top-right"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gkk-gold/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gkk-navy rounded-2xl flex items-center justify-center mx-auto shadow-xl ring-4 ring-white">
                        <Shield className="text-gkk-gold" size={32} />
                    </div>
                    <h2 className="mt-6 text-3xl font-serif font-bold text-gkk-navy">
                        GKK Nominee Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                        Access the official 14<sup>th</sup> GKK validation system
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Role Toggle */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => { setRole('applicant'); setError(null); }}
                            className={`flex-1 py-5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${role === 'applicant' ? 'bg-white text-gkk-navy border-b-2 border-gkk-gold' : 'bg-gray-50/50 text-gray-400 hover:text-gray-600'}`}
                        >
                            <Building2 size={18} />
                            Nominee
                        </button>
                        <button
                            onClick={() => { setRole('evaluator'); setError(null); }}
                            className={`flex-1 py-5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${role === 'evaluator' ? 'bg-white text-gkk-navy border-b-2 border-gkk-gold' : 'bg-gray-50/50 text-gray-400 hover:text-gray-600'}`}
                        >
                            <Shield size={18} />
                            Evaluator
                        </button>
                        <button
                            onClick={() => { setRole('admin'); setError(null); }}
                            className={`flex-1 py-5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-white text-gkk-navy border-b-2 border-gkk-navy' : 'bg-gray-50/50 text-gray-400 hover:text-gray-600'}`}
                        >
                            <Shield size={18} />
                            Admin
                        </button>
                        <button
                            onClick={() => { setRole('quick'); setError(null); }}
                            className={`flex-1 py-5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${role === 'quick' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' : 'bg-gray-50/50 text-gray-400 hover:text-gray-600'}`}
                        >
                            <Zap size={18} />
                            Test Lab
                        </button>
                    </div>

                    <form className="p-10 space-y-6" onSubmit={handleSubmit}>

                        {error && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 animate-shake">
                                <AlertCircle size={18} className="text-red-500" />
                                <p className="text-xs text-red-700 font-bold">{error}</p>
                            </div>
                        )}

                        {role === 'quick' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4 ring-1 ring-blue-200/50">
                                    <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-blue-900 font-bold">Simulator Ready</p>
                                        <p className="text-xs text-blue-700 font-medium mt-1 leading-relaxed">
                                            Simulate a nomination activation for testing the document upload workflow and security policies.
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nominated Entity Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="block w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-gray-300"
                                        placeholder="e.g. Acme Tech Phils."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Official Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-300" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold outline-none transition-all font-medium placeholder:text-gray-300"
                                            placeholder="name@organization.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Security Key</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-300" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold outline-none transition-all font-medium placeholder:text-gray-300"
                                            placeholder="••••••••"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer group" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff className="h-5 w-5 text-gray-300 group-hover:text-gkk-navy" /> : <Eye className="h-5 w-5 text-gray-300 group-hover:text-gkk-navy" />}
                                        </div>
                                    </div>
                                </div>

                                {(role === 'evaluator' || role === 'admin') && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 pt-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Judge Credentials</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <KeyRound className="h-5 w-5 text-gkk-gold" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={accessCode}
                                                onChange={(e) => setAccessCode(e.target.value)}
                                                className="block w-full pl-12 pr-4 py-4 border border-gkk-gold/30 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold outline-none transition-all font-bold bg-amber-50/30 placeholder:text-gray-300"
                                                placeholder="GKK-AUTH-XXXX"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-gkk-navy focus:ring-gkk-gold border-gray-300 rounded-md"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            Trusted Device
                                        </label>
                                    </div>

                                    <div className="text-xs">
                                        <a href="#" className="font-bold text-gkk-navy hover:text-gkk-gold transition-colors uppercase tracking-wide">
                                            Recovery
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 ${role === 'quick' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-500/20' : 'bg-gkk-navy hover:bg-gkk-royalBlue focus:ring-gkk-gold shadow-gkk-navy/20'}`}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {role === 'quick' ? 'Initialize Simulation' : 'Sign In to Portal'}
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleDemoFill}
                                className="w-full py-3 px-4 border border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 hover:text-gkk-navy hover:border-gkk-navy hover:bg-gray-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Autofill Demo Account
                            </button>
                        </div>
                    </form>

                    {role === 'applicant' && (
                        <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">
                                Already Nominated?{' '}
                                <button onClick={onRegisterClick} className="text-gkk-navy hover:text-gkk-gold transition-colors border-b-2 border-gkk-gold/30">
                                    Activate Your Access Key
                                </button>
                            </p>
                        </div>
                    )}
                </div>

                <div className="text-center pt-4">
                    <button onClick={onBack} className="text-xs font-bold text-gray-400 hover:text-gkk-navy transition-colors uppercase tracking-[0.2em]">
                        ← Return to Main Site
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;