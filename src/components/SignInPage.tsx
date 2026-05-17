import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft01Icon as ChevronLeft,
  AppleIcon as Apple,
  GlobeIcon as Globe,
  Loading02Icon as LoadingSpinner
} from "hugeicons-react"
import { Button } from "./ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "../lib/firebase"
import { apiRequest } from "../lib/api"

export default function SignInPage({ onLogin }: { onLogin: (user?: any) => void }) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resetSent, setResetSent] = React.useState(false);
  const [role, setRole] = React.useState<'volunteer' | 'ngo' | 'customer'>('volunteer');
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const passwordRules = React.useMemo(() => [
    { label: "Min 6 characters", checked: formData.password.length >= 6 },
    { label: "At least 1 number", checked: /\d/.test(formData.password) },
    { label: "At least 1 symbol", checked: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
    { label: "At least 1 uppercase", checked: /[A-Z]/.test(formData.password) }
  ], [formData.password]);
  const navigate = useNavigate();

  const syncWithBackend = async (token: string, additionalData?: any) => {
    const response = await apiRequest('/auth/firebase-login', {
      method: 'POST',
      body: JSON.stringify({ token, role, ...additionalData }),
    });

    if (response.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } else {
      throw new Error(response.message || 'Failed to sync with backend');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await syncWithBackend(token);
    } catch (err: any) {
      setError(err.message || 'Google Authentication failed');
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate password rules for Signup only
    if (!isLogin) {
      const password = formData.password;
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
      }
      if (!/\d/.test(password)) {
        setError("Password must contain at least one number.");
        setIsLoading(false);
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setError("Password must contain at least one special character (symbol).");
        setIsLoading(false);
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError("Password must contain at least one uppercase letter.");
        setIsLoading(false);
        return;
      }
    }

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      }
      
      const token = await userCredential.user.getIdToken();
      
      const additionalData = !isLogin ? { 
        name: formData.name, 
        organizationName: role === 'ngo' ? (formData.organizationName || formData.name) : undefined 
      } : {};

      await syncWithBackend(token, additionalData);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first to reset your password.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      setResetSent(false);
      await sendPasswordResetEmail(auth, formData.email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Ensure your email is correct.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const mockUser = {
      _id: 'guest123',
      name: 'Guest Volunteer',
      email: 'guest@impactquest.org',
      role: 'volunteer',
      isOnboarded: true,
      skills: ['General Support'],
      location: 'Global',
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('accessToken', 'guest-token-123');
    onLogin(mockUser);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
        <Link to="/" className="text-xl font-black tracking-tight text-foreground">ImpactQ.</Link>
        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">← Back</Link>
      </div>

      {/* Form area */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 md:items-center">
        <div className="w-full max-w-md">

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  {isLogin ? 'Welcome back.' : 'Join ImpactQuest.'}
                </h1>
                <p className="text-base text-muted-foreground font-medium">
                  {isLogin
                    ? 'Sign in to access your dashboard.'
                    : 'Create an account and start making impact.'}
                </p>
              </div>

              {/* Google + Guest */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="h-13 py-3.5 rounded-2xl border border-border bg-card hover:bg-secondary/50 flex items-center justify-center gap-2.5 transition-all text-sm font-bold active:scale-95"
                >
                  <svg viewBox="0 0 48 48" className="h-4 w-4 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  Google
                </button>
                <div className="relative group/guest">
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className={cn(
                      "w-full h-13 py-3.5 rounded-2xl border border-border bg-card flex items-center justify-center gap-2.5 transition-all text-sm font-bold active:scale-95",
                      (import.meta.env.PROD || window.location.search.includes('prod-preview'))
                        ? "hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <Globe className="h-4 w-4" /> Guest
                  </button>
                  {(import.meta.env.PROD || window.location.search.includes('prod-preview')) && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[200px] pointer-events-none opacity-0 translate-y-2 group-hover/guest:opacity-100 group-hover/guest:translate-y-0 transition-all duration-300 ease-out z-30">
                      <div className="bg-red-500 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-lg shadow-red-500/20 text-center relative">
                        only for testing
                        {/* Little triangle arrow at the bottom */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-red-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-medium text-muted-foreground">or continue with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">

                {/* Role selector — signup only */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      <div className="flex gap-1.5 p-1 bg-secondary/50 rounded-2xl border border-border/40">
                        {(['volunteer', 'ngo', 'customer'] as const).map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all capitalize",
                              role === r ? "bg-white dark:bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                            {role === 'volunteer' ? 'Full Name' : 'Contact Name'}
                          </label>
                          <input
                            required
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={role === 'volunteer' ? 'Jane Doe' : 'Contact person'}
                            className="w-full h-14 bg-card text-foreground border border-border rounded-2xl px-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-muted-foreground/30"
                          />
                        </div>
                        {role === 'ngo' && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Organization Name</label>
                            <input
                              required
                              name="organizationName"
                              type="text"
                              value={formData.organizationName}
                              onChange={handleInputChange}
                              placeholder="Global Aid Network"
                              className="w-full h-14 bg-card text-foreground border border-border rounded-2xl px-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-muted-foreground/30"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Email</label>
                  <input
                    required
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jane@example.com"
                    className="w-full h-14 bg-card text-foreground border border-border rounded-2xl px-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-muted-foreground/30"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Password</label>
                    {isLogin && (
                      <button type="button" onClick={handleForgotPassword} className="text-xs font-bold text-indigo-600 hover:underline">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      required
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full h-14 bg-card text-foreground border border-border rounded-2xl pl-4 pr-12 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-muted-foreground/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground active:scale-95 transition-all p-1.5 rounded-xl hover:bg-secondary/40"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {!isLogin && (
                    <div className="mt-3 grid grid-cols-2 gap-2 p-3.5 bg-secondary/30 rounded-2xl border border-border/40">
                      {passwordRules.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] font-medium transition-colors duration-200">
                          <div className={`h-2 w-2 rounded-full transition-all duration-300 ${rule.checked ? 'bg-emerald-500 scale-110 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-muted-foreground/30'}`} />
                          <span className={rule.checked ? 'text-emerald-500 font-bold' : 'text-muted-foreground/60'}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error / Reset notices */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm font-medium text-red-500">
                    {error}
                  </div>
                )}
                {resetSent && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-sm font-medium text-emerald-500">
                    Password reset email sent! Check your inbox.
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading
                    ? <LoadingSpinner className="h-5 w-5 animate-spin" />
                    : (isLogin ? 'Log In' : 'Create Account')}
                </button>
              </form>

              {/* Toggle */}
              <p className="text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(null); setResetSent(false); }}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  {isLogin ? 'Register' : 'Log In'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-border/30 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
          © 2026 ImpactQuest · Your data is encrypted and secure
        </p>
      </div>
    </div>
  )
}

