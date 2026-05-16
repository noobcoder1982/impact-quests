import * as React from "react"

export type Language = 'en' | 'hi' | 'or' | 'kn' | 'high_impact'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    dashboard: "Dashboard",
    quests: "Quest Board",
    chat: "Chat",
    settings: "Settings",
    welcome: "Welcome, Jane",
    mission_control: "Mission Control",
    impact: "Impact",
    active_sectors: "Active Sectors",
    start_mission: "Start Mission"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    quests: "मिशन बोर्ड",
    chat: "चैट",
    settings: "सेटिंग्स",
    welcome: "स्वागत है, जेन",
    mission_control: "मिशन कंट्रोल",
    impact: "प्रभाव",
    active_sectors: "सक्रिय क्षेत्र",
    start_mission: "मिशन शुरू करें"
  },
  or: {
    dashboard: "ଡ଼୍ୟାସବୋର୍ଡ",
    quests: "ମିଶନ ବୋର୍ଡ",
    chat: "ଚାଟ୍",
    settings: "ସେଟିଂସ",
    welcome: "ସ୍ଵାଗତ, ଜେନ୍",
    mission_control: "ମିଶନ କଣ୍ଟ୍ରୋଲ",
    impact: "ପ୍ରଭାବ",
    active_sectors: "ସକ୍ରିୟ କ୍ଷେତ୍ର",
    start_mission: "ମିଶନ ଆରମ୍ଭ"
  },
  kn: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    quests: "ಮಿಷನ್ ಬೋರ್ಡ್",
    chat: "ಚಾಟ್",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    welcome: "ಸ್ವಾಗತ, ಜೇನ್",
    mission_control: "ಮಿಷನ್ ಕಂಟ್ರೋಲ್",
    impact: "ಪ್ರಭಾವ",
    active_sectors: "ಸಕ್ರಿಯ ವಲಯಗಳು",
    start_mission: "ಮಿಷನ್ ಪ್ರಾರಂಭಿಸಿ"
  },
  high_impact: {
    dashboard: "STRAT-HUB",
    quests: "DEPLOYMENT GRID",
    chat: "COMMS LINK",
    settings: "CORE CONFIG",
    welcome: "GREETINGS, OPERATIVE",
    mission_control: "COMMAND CENTER",
    impact: "KINETIC FORCE",
    active_sectors: "TARGET ZONES",
    start_mission: "EXECUTE"
  }
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>('en')

  const t = (key: string) => {
    return (translations[language] as any)[key] || (translations['en'] as any)[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
