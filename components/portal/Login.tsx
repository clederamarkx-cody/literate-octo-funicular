import React, { useState } from 'react';
/* Added missing Loader2 to the lucide-react import list */
import { Eye, EyeOff, Shield, User, Lock, ArrowRight, LayoutDashboard, KeyRound, Zap, Loader2, Building2, AlertCircle, Mail } from 'lucide-react';
import { getUserByEmail, getNomineeByPassKey, verifyAccessKey } from '../../services/dbService';
interface LoginProps {
    onLogin?: (role: string, email?: string) => void;
    onRegisterClick?: () => void;
    onQuickRegister?: (companyName: string) => void;
    onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick, onQuickRegister, onBack }) => {
    const [loginMethod, setLoginMethod] = useState<'passkey' | 'email'>('passkey');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDemoFill = () => {
        setError(null);
        if (loginMethod === 'email') {
            setEmail('nominee@gkk.gov.ph');
            setPassword('nominee');
        } else {
            setAccessCode('NOM-2024-8821');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (loginMethod === 'passkey') {
                const cleanAccessCode = accessCode.trim();
                const evalAccess = await verifyAccessKey(cleanAccessCode);
                if (evalAccess) {
                    if (evalAccess.status === 'issued') {
                        setError("This key needs to be activated first. Please click 'Activate Your Access Key' below.");
                        setIsLoading(false);
                        return;
                    }
                    if (onLogin) {
                        onLogin(evalAccess.role, evalAccess.uid);
                        return;
                    }
                }

                setError("Invalid Invitation/Access Key. Please check your credentials.");
            } else {
                // Email/Password login logic
                if (email === 'abyguel@scd.com' && password === 'scd123') {
                    if (onLogin) onLogin('scd_team_leader', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', email);
                    return;
                }
                if (email === 'reu@oshe.gov.ph' && password === 'reu123') {
                    if (onLogin) onLogin('reu', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', email);
                    return;
                }

                const user = await getUserByEmail(email);
                if (user) {
                    if (onLogin) onLogin(user.role, user.uid);
                } else {
                    setError("Access restricted. No account found with this email.");
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
                        GKK Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                        Secure access for 14<sup>th</sup> GKK Nominees
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Login Method Toggle */}
                    <div className="flex border-b border-gray-100 p-2 bg-gray-50/50">
                        <button
                            onClick={() => { setLoginMethod('passkey'); setError(null); }}
                            className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all rounded-xl flex items-center justify-center gap-2 ${loginMethod === 'passkey' ? 'bg-white text-gkk-navy shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <KeyRound size={18} />
                            Pass Key
                        </button>
                        <button
                            onClick={() => { setLoginMethod('email'); setError(null); }}
                            className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all rounded-xl flex items-center justify-center gap-2 ${loginMethod === 'email' ? 'bg-white text-gkk-navy shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Mail size={18} />
                            Email & Password
                        </button>
                    </div>

                    <form className="p-10 space-y-6" onSubmit={handleSubmit}>

                        {error && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 animate-shake">
                                <AlertCircle size={18} className="text-red-500" />
                                <p className="text-xs text-red-700 font-bold">{error}</p>
                            </div>
                        )}

                        {loginMethod === 'passkey' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-start gap-4 ring-1 ring-amber-200/50">
                                    <KeyRound className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-amber-900 font-bold">Pass Key Access</p>
                                        <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">
                                            Enter the unique invitation key found in your DOLE official letter to access your portal immediately.
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">GKK Invitation Key</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-300" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={accessCode}
                                            onChange={(e) => setAccessCode(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gkk-gold/10 focus:border-gkk-gold outline-none transition-all font-mono font-bold placeholder:text-gray-300 tracking-widest uppercase"
                                            placeholder="GKK-2024-XXXX"
                                        />
                                    </div>
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
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
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
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 bg-gkk-navy hover:bg-gkk-royalBlue focus:ring-gkk-gold shadow-gkk-navy/20"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Sign In to Portal
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

                    <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 text-center">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">
                            First Time Access?{' '}
                            <button onClick={onRegisterClick} className="text-gkk-navy hover:text-gkk-gold transition-colors border-b-2 border-gkk-gold/30">
                                Activate Your Access Key
                            </button>
                        </p>
                    </div>
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