import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import ItemDetail from "./pages/item-detail/ItemDetailPage";
import SearchBox from "./components/SearchBox";
import CommunityBrowser from "./pages/CommunityBrowser";
import ItemsBrowser from "./pages/ItemsBrowser";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/5">
          <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link
              className="text-2xl font-black tracking-tighter text-white no-underline flex items-center gap-2 group"
              to="/"
            >
              <span className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center text-lg transition-transform group-hover:rotate-12">🎺</span>
              <span className="hidden sm:inline">TRUMPET</span>
            </Link>

            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-wide">
                <Link to="/" className="text-white/40 hover:text-white transition-colors no-underline">ARCHIVE</Link>
                <Link to="/" className="text-white/40 hover:text-white transition-colors no-underline">COMMUNITIES</Link>
                <Link to="/" className="text-white/40 hover:text-white transition-colors no-underline">ABOUT</Link>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <SearchBox />
            </div>
          </nav>
        </header>

        <div className="flex-1 w-full max-w-7xl mx-auto px-6 pb-20">
          <main role="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<CommunityBrowser />} />
              <Route path="/items" element={<ItemsBrowser />} />
              <Route path="/item/:id" element={<ItemDetail />} />
            </Routes>
          </main>
        </div>

        <footer className="border-t border-white/5 py-12 text-white/20 text-sm font-medium">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-xl grayscale opacity-50">🎺</span>
              &copy; 2025 The Corfiot Music Archive Project.
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
