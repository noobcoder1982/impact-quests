import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  GlobeIcon as Globe, 
  Notification01Icon as Bell, 
  LockIcon as Lock, 
  ComputerIcon as Monitor, 
  ComputerTerminal01Icon as Terminal, 
  Shield01Icon as Shield, 
  Tick01Icon as Check,
  PaintBoardIcon as Palette,
  FlashIcon as ZapIcon,
  ArrowRight01Icon as ChevronRight,
  UserIcon as User,
  CpuIcon as Cpu,
  ViewIcon as Eye,
  FloppyDiskIcon as Save,
  Rotate01Icon as RotateCcw,
  Key01Icon as Key,
  FingerPrintIcon as Fingerprint,
  RefreshIcon as RefreshCw
} from "hugeicons-react"
import { Button } from "./ui/button"
import { useLanguage } from "../contexts/LanguageContext"
import { useTheme, type ColorVariant, type Theme } from "../contexts/ThemeContext"
import { useSound } from "../hooks/useSound"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage()
  const { theme, variant, setTheme, setVariant } = useTheme()
  const { playSound } = useSound()
  
  const [activeTab, setActiveTab] = React.useState('appearance')
  const [isSaving, setIsSaving] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)
  const isSaved = React.useRef(false)

  // Memoize initial state to revert if navigating away without saving
  const initialTheme = React.useRef<Theme>(theme)
  const initialVariant = React.useRef<ColorVariant>(variant)

  // Security State
  const [passwords, setPasswords] = React.useState({
    current: '',
    new: '',
    repeat: ''
  })
  const [securityStatus, setSecurityStatus] = React.useState<string | null>(null)

  const variants: { id: ColorVariant; name: string; colors: string[] }[] = [
    { id: 'standard', name: 'Professional Indigo', colors: ['#4f46e5', '#1e1b4b'] },
    { id: 'graphite', name: 'Deep Graphite', colors: ['#4b5563', '#111827'] },
    { id: 'slate', name: 'Cool Slate', colors: ['#334155', '#0f172a'] },
    { id: 'onyx', name: 'True Onyx', colors: ['#171717', '#0a0a0a'] },
  ]

  // Revert preview on unmount if not saved
  React.useEffect(() => {
    return () => {
      if (!isSaved.current) {
        setTheme(initialTheme.current)
        setVariant(initialVariant.current)
      }
    }
  }, [setTheme, setVariant])

  const handleApplyVariant = (v: ColorVariant) => {
    setVariant(v)
    playSound('select')
  }

  const handleSaveChanges = async () => {
     setIsSaving(true)
     try {
        const response = await apiRequest('/auth/update-profile', {
           method: 'PUT',
           body: { theme, themeVariant: variant }
        })
        if (response.success) {
           isSaved.current = true
           initialTheme.current = theme
           initialVariant.current = variant
           localStorage.setItem('user', JSON.stringify(response.data.user))
           playSound('success')
           setShowToast(true)
           setTimeout(() => setShowToast(false), 2300)
        } else {
           alert("Synchronization failed: " + (response.message || "Unknown error"))
        }
     } catch (err: any) {
        console.error("Synchronization failed:", err)
        alert("Verification failed: " + err.message)
     } finally {
        setIsSaving(false)
     }
  }

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.repeat) {
      setSecurityStatus("New passwords do not match.")
      return
    }
    setSecurityStatus("Updating...")
    try {
      const response = await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: { 
          currentPassword: passwords.current, 
          newPassword: passwords.new 
        }
      })
      if (response.success) {
        setSecurityStatus("Security credentials updated.")
        setPasswords({ current: '', new: '', repeat: '' })
        playSound('success')
      } else {
        setSecurityStatus(response.message || "Update failed.")
      }
    } catch (err) {
      setSecurityStatus("An error occurred during verification.")
    }
  }

  const sections = [
    { id: 'general', label: 'Platform Basics', icon: Globe },
    { id: 'appearance', label: 'Interface Design', icon: Palette },
    { id: 'security', label: 'Security & Auth', icon: Lock },
    { id: 'nodes', label: 'Platform Modules', icon: Cpu },
  ]

  return (
    <>
    {/* ── Mobile Settings ── */}
    <div className="md:hidden flex flex-col bg-background text-foreground overflow-y-auto scrollbar-hide mobile-page">

      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-1">System</p>
        <h1 className="text-2xl font-black tracking-tight">Settings</h1>
      </div>

      {/* ── Appearance ── */}
      <div className="px-5 mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-muted-foreground/40 mb-3">Appearance</p>
      </div>

      {/* Light / Dark toggle row */}
      <div className="mx-5 mb-3 flex items-center justify-between bg-secondary/30 rounded-2xl px-4 py-3.5 border border-border/40">
        <span className="text-sm font-bold">Color Mode</span>
        <div className="flex bg-background rounded-xl p-0.5 border border-border/40">
          {(['light','dark'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTheme(t); playSound('select') }}
              className={cn(
                "px-4 py-1.5 rounded-[10px] text-[11px] font-black uppercase tracking-widest transition-all",
                theme === t ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >{t === 'light' ? 'Light' : 'Dark'}</button>
          ))}
        </div>
      </div>

      {/* Variant strip */}
      <div className="mb-5">
        <div className="flex gap-2.5 px-5 overflow-x-auto scrollbar-hide pb-1">
          {variants.map(v => (
            <button
              key={v.id}
              onClick={() => handleApplyVariant(v.id)}
              className={cn(
                "shrink-0 flex flex-col gap-2 p-3.5 rounded-2xl border-2 transition-all w-28",
                variant === v.id
                  ? "border-indigo-600 bg-indigo-600/5"
                  : "border-border/40 bg-secondary/20"
              )}
            >
              <div className="flex gap-1.5">
                {v.colors.map((c,i) => (
                  <div key={i} className="h-5 w-5 rounded-md border border-white/10" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className={cn(
                "text-[10px] font-black leading-tight",
                variant === v.id ? "text-indigo-600" : "text-muted-foreground"
              )}>{v.name}</span>
              {variant === v.id && (
                <div className="h-1 w-full rounded-full bg-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Language ── */}
      <div className="px-5 mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-muted-foreground/40 mb-3">Language</p>
      </div>
      <div className="mx-5 mb-5 flex gap-2">
        {[
          { id: 'en', name: 'English' },
          { id: 'ru', name: 'Russian' },
          { id: 'high_impact', name: 'Standard Ω' },
        ].map(lang => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            className={cn(
              "flex-1 py-3 rounded-2xl border-2 text-xs font-black transition-all",
              language === lang.id
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-border/40 bg-secondary/20 text-muted-foreground"
            )}
          >{lang.name}</button>
        ))}
      </div>

      {/* ── Security ── */}
      <div className="px-5 mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-muted-foreground/40 mb-3">Security</p>
      </div>
      <div className="mx-5 mb-2 space-y-2">
        {[
          { key: 'current' as const, label: 'Current password', placeholder: 'Enter current password' },
          { key: 'new'     as const, label: 'New password',     placeholder: 'Enter new password' },
          { key: 'repeat'  as const, label: 'Confirm password', placeholder: 'Repeat new password' },
        ].map(f => (
          <div key={f.key}>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1.5 px-1">{f.label}</p>
            <input
              type="password"
              value={passwords[f.key]}
              onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full h-12 bg-secondary/30 border border-border/40 rounded-2xl px-4 text-sm font-medium focus:outline-none focus:border-indigo-600 transition-all"
            />
          </div>
        ))}
      </div>

      {securityStatus && (
        <div className={cn(
          "mx-5 mb-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest",
          securityStatus.includes('updated') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
        )}>{securityStatus}</div>
      )}

      <button
        onClick={handleChangePassword}
        className="mx-5 mb-8 h-12 rounded-2xl bg-secondary/40 border border-border/40 text-sm font-black uppercase tracking-widest text-foreground active:scale-95 transition-all"
      >
        Update Password
      </button>

      {/* ── Save bar ── */}
      <div className="mx-5 mb-4 flex gap-2">
        <button
          onClick={() => { setTheme(initialTheme.current); setVariant(initialVariant.current); playSound('select') }}
          className="flex-1 h-12 rounded-2xl border border-border/40 bg-secondary/30 text-sm font-black uppercase tracking-widest text-muted-foreground active:scale-95 transition-all"
        >Discard</button>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="flex-[2] h-12 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all"
        >{isSaving ? 'Saving...' : 'Save'}</button>
      </div>

    </div>

    {/* ── Desktop Settings (unchanged) ── */}
    <div className="hidden md:block flex-1 overflow-y-auto pt-10 pb-20 px-8 md:px-12 lg:px-20 font-body text-foreground bg-background transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Configuration */}
        <header className="mb-16">
           <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-6 rounded-md bg-indigo-500/10 flex items-center justify-center">
                 <ZapIcon className="h-4 w-4 text-indigo-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/60 leading-none">System Administration</span>
           </div>
           <h1 className="text-5xl font-bold tracking-tight mb-2">Platform Management</h1>
           <p className="text-muted-foreground/60 font-medium">Fine-tune the workspace environment and security protocols.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-20">
          
          {/* Internal Navigation */}
          <aside className="space-y-2">
             {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all group",
                    activeTab === section.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "hover:bg-secondary/60 text-muted-foreground/60 hover:text-foreground"
                  )}
                >
                   <div className="flex items-center gap-3">
                      <section.icon className="h-4.5 w-4.5" />
                      {section.label}
                   </div>
                   <ChevronRight className={cn("h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity", activeTab === section.id && "opacity-100")} />
                </button>
             ))}
          </aside>

          {/* Active Settings Panel */}
          <main className="space-y-16">
            
            <AnimatePresence mode="wait">
              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <section>
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
                       <div className="space-y-1">
                          <h3 className="text-xl font-bold">Visual Language</h3>
                          <p className="text-xs text-muted-foreground/60 font-medium italic">Select a design variant that fits your workflow.</p>
                       </div>
                       <div className="flex p-1 bg-secondary rounded-full border border-border">
                          <button 
                            onClick={() => setTheme('light')}
                            className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", theme === 'light' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}
                          >Standard Mode</button>
                          <button 
                            onClick={() => setTheme('dark')}
                            className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", theme === 'dark' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}
                          >Focus Mode</button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                       {variants.map((v) => (
                         <div
                           key={v.id}
                           onClick={() => handleApplyVariant(v.id)}
                           className={cn(
                             "relative p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all flex flex-col group overflow-hidden",
                             variant === v.id ? 'border-indigo-600 bg-indigo-600/5 shadow-xl shadow-indigo-600/5' : 'bg-card border-border hover:border-indigo-500/40'
                           )}
                         >
                            <div className="flex justify-between items-start mb-10">
                               <span className={cn("text-base font-bold", variant === v.id ? 'text-indigo-600' : 'text-foreground')}>{v.name}</span>
                               {variant === v.id && (
                                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center animate-in zoom-in duration-300">
                                     <Check className="h-3 w-3" />
                                  </div>
                               )}
                            </div>
                            
                            <div className="flex gap-2 mb-2">
                               {v.colors.map((c, i) => (
                                 <div key={i} className="h-10 w-10 rounded-xl border border-white/10" style={{ backgroundColor: c }} />
                               ))}
                            </div>
                            
                            <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                               <RefreshCw className="h-5 w-5 text-indigo-500" />
                            </div>
                         </div>
                       ))}
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <section className="max-w-[600px] space-y-8">
                     <div className="space-y-1 pb-4 border-b border-border/40">
                        <h3 className="text-xl font-bold">Authentication Protocol</h3>
                        <p className="text-xs text-muted-foreground/60 font-medium italic">Ensure your platform access remains secure.</p>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Current Credentials</label>
                           <div className="relative">
                              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                              <input 
                                type="password" 
                                value={passwords.current}
                                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                className="w-full h-14 bg-card border border-border rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-600 transition-all font-medium" 
                                placeholder="Verify current password" 
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">New Access Key</label>
                              <input 
                                type="password" 
                                value={passwords.new}
                                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                className="w-full h-14 bg-card border border-border rounded-2xl px-4 text-sm focus:outline-none focus:border-indigo-600 transition-all font-medium" 
                                placeholder="New password" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Repeat Key</label>
                              <input 
                                type="password" 
                                value={passwords.repeat}
                                onChange={(e) => setPasswords({...passwords, repeat: e.target.value})}
                                className="w-full h-14 bg-card border border-border rounded-2xl px-4 text-sm focus:outline-none focus:border-indigo-600 transition-all font-medium" 
                                placeholder="Confirm new password" 
                              />
                           </div>
                        </div>

                        {securityStatus && (
                          <div className={cn(
                            "text-[10px] font-black uppercase p-3 rounded-xl",
                            securityStatus.includes("updated") ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                             {securityStatus}
                          </div>
                        )}

                        <Button 
                          onClick={handleChangePassword}
                          className="h-14 px-10 rounded-full bg-slate-900 text-white font-bold gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 w-full md:w-auto"
                        >
                           <Fingerprint className="h-5 w-5" /> Update Security Credentials
                        </Button>
                     </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'general' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                   <section className="space-y-8">
                       <h3 className="text-xl font-bold">Localization Layer</h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { id: 'en', name: 'English', sub: 'Standard' },
                            { id: 'ru', name: 'Russian', sub: 'Cyrillic' },
                            { id: 'high_impact', name: 'Standard Ω', sub: 'Technical' },
                          ].map((lang) => (
                            <button
                              key={lang.id}
                              onClick={() => setLanguage(lang.id)}
                              className={cn(
                                "p-8 rounded-[2rem] border-2 text-left transition-all",
                                language === lang.id ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-card border-border hover:border-indigo-500/40"
                              )}
                            >
                               <span className="text-2xl font-bold block mb-1">{lang.name}</span>
                               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{lang.sub} Profile</span>
                            </button>
                          ))}
                       </div>
                   </section>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Application Command Bar */}
            <div className="pt-12 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">System synchronized: April 2026</span>
               </div>
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <Button 
                   variant="outline" 
                   onClick={() => {
                     setTheme(initialTheme.current)
                     setVariant(initialVariant.current)
                     playSound('select')
                   }}
                   className="flex-1 md:flex-none h-14 px-8 rounded-full border-border/60 hover:bg-secondary font-bold gap-2"
                  >
                    <RotateCcw className="h-4 w-4" /> Discard Changes
                 </Button>
                 <Button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex-1 md:flex-none h-14 px-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-3 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                 >
                    {isSaving ? <RotateCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} 
                    {isSaving ? 'Synchronizing...' : 'Save Configuration'}
                 </Button>
               </div>
            </div>
          </main>
        </div>
      </div>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-600/30 font-bold tracking-wide border border-indigo-500/50"
          >
            Saved Theme
            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  )
}
