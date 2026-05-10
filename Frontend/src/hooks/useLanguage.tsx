import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'fr' | 'de' | 'it' | 'el';

export const LANGUAGES: { code: Language; flag: string; label: string }[] = [
       { code: 'en', flag: '🇬🇧', label: 'English' },
       { code: 'fr', flag: '🇫🇷', label: 'Français' },
       { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
       { code: 'it', flag: '🇮🇹', label: 'Italiano' },
       { code: 'el', flag: '🇬🇷', label: 'Ελληνικά' },
];

interface LanguageContextType {
       language: Language;
       setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
       const [language, setLanguageState] = useState<Language>(() => {
              if (typeof window !== 'undefined') {
                     const saved = localStorage.getItem('trumpet-language') as Language;
                     if (saved && ['en', 'fr', 'de', 'it', 'el'].includes(saved)) return saved;
              }
              return 'en';
       });

       const setLanguage = (lang: Language) => {
              setLanguageState(lang);
              localStorage.setItem('trumpet-language', lang);
       };

       return (
              <LanguageContext.Provider value={{ language, setLanguage }}>
                     {children}
              </LanguageContext.Provider>
       );
}

export function useLanguage() {
       const context = useContext(LanguageContext);
       if (!context) throw new Error('useLanguage must be used within LanguageProvider');
       return context;
}
