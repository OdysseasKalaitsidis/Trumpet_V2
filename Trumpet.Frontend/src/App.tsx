import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import ItemDetail from "./pages/item-detail/ItemDetailPage";
import SearchBox from "./components/SearchBox";
import CommunitiesPage from "./pages/communities/CommunitiesPage";
import MusicPathsPage from "./pages/music-paths/MusicPathsPage";
import ItemsPage from "./pages/items/ItemsPage";
import { ThemeProvider, useTheme } from "./hooks/useTheme";

function AppContent() {
  const { theme, toggleTheme } = useTheme();


  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: theme === 'dark' ? 'rgba(10,10,10,0.9)' : 'rgba(253,251,247,0.9)'
        }}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            className="text-xl font-semibold tracking-tight no-underline flex items-center gap-2"
            to="/"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--color-text)' }}
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </span>
            Trumpet
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/music-paths" className="transition-colors no-underline hover:text-amber-600" style={{ color: 'var(--color-text-muted)' }}>
                Music Paths
              </Link>
              <Link to="/communities" className="transition-colors no-underline hover:text-amber-600" style={{ color: 'var(--color-text-muted)' }}>
                Communities
              </Link>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-110"
              style={{ borderColor: 'var(--color-border)' }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <SearchBox />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/music-paths" element={<MusicPathsPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/item/:id" element={<ItemDetail />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-10 text-sm"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-warm)' }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
            <span className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </span>
            © 2025 Trumpet — The Corfiot Music Archive
          </div>
          <div className="flex items-center gap-6" style={{ color: 'var(--color-text-muted)' }}>
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}


