import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import ItemDetail from "./pages/item-detail/ItemDetailPage";
import SearchBox from "./components/SearchBox";
import CommunitiesPage from "./pages/communities/CommunitiesPage";
import MusicPathsPage from "./pages/music-paths/MusicPathsPage";
import ItemsPage from "./pages/items/ItemsPage";
import EventsPage from "./pages/events/EventsPage";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { LanguageProvider, useLanguage, LANGUAGES } from "./hooks/useLanguage";
import { tr } from "./i18n/translations";

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === language)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-9 h-9 rounded-full border flex items-center justify-center text-lg hover:shadow-md"
        style={{ borderColor: 'var(--color-border)' }}
        title="Change language"
      >
        {current.flag}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div
            className="absolute right-0 top-12 z-50 rounded-2xl border shadow-2xl overflow-hidden min-w-[160px]"
            style={{ backgroundColor: 'var(--color-bg-warm)', borderColor: 'var(--color-border)' }}
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-amber-500/10 text-left"
                style={{
                  color: lang.code === language ? 'var(--color-accent)' : 'var(--color-text)',
                  fontWeight: lang.code === language ? 700 : 500,
                  borderLeft: lang.code === language ? '3px solid var(--color-accent)' : '3px solid transparent',
                }}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-500 overflow-x-hidden">
      {/* Soft Ethereal Background */}
      <div className="soft-gradient-bg" />

      {/* Floating Glass Navbar */}
      <header className="floating-navbar w-[calc(100%-3rem)] md:w-max">
        <nav className="flex items-center gap-8 md:gap-12">
          <Link
            className="flex items-center gap-2 group no-underline"
            to="/"
          >
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center shadow-lg">
               <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <span className="hidden sm:block font-bold tracking-tighter text-zinc-900 dark:text-white uppercase group-hover:text-orange-600">
              Trumpet
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            <Link to="/communities" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 no-underline">
              {tr(language, 'nav.communities')}
            </Link>
            <Link to="/music-paths" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 no-underline">
              {tr(language, 'nav.musicPaths')}
            </Link>
            <Link to="/events" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-orange-600 no-underline">
              {tr(language, 'nav.events')}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg hover:bg-orange-500/10"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <SearchBox />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full pt-32 pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/music-paths" element={<MusicPathsPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/events" element={<EventsPage />} />
        </Routes>
      </main>

      {/* Ultra-Minimal Footer */}
      <footer className="py-20 border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-1 rounded-full bg-orange-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    Trumpet — The Corfiot music Archive
                </span>
                <div className="w-10 h-1 rounded-full bg-orange-600" />
            </div>
            
            <div className="flex gap-12">
                <a href="#" className="text-xs font-bold text-zinc-400 hover:text-orange-600 transition-colors uppercase tracking-widest">About</a>
                <a href="#" className="text-xs font-bold text-zinc-400 hover:text-orange-600 transition-colors uppercase tracking-widest">Contact</a>
                <a href="#" className="text-xs font-bold text-zinc-400 hover:text-orange-600 transition-colors uppercase tracking-widest">Privacy</a>
            </div>
            
            <p className="text-[10px] text-zinc-300 dark:text-zinc-700 font-bold uppercase tracking-widest">© 2025 All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
