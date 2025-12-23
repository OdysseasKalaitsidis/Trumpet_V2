import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import ItemDetail from './ItemDetail';
import SearchBox from './components/SearchBox';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <header>
          <nav className="navbar-glass px-4 py-3">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between">
              <Link className="text-2xl font-bold text-white no-underline mr-8" to="/">Trumpet_UI</Link>

              <div className="flex-grow flex items-center justify-between">
                <ul className="flex space-x-4 list-none m-0 p-0">
                  <li>
                    <Link className="text-white hover:text-white/80 transition-colors no-underline font-medium" to="/">Home</Link>
                  </li>
                </ul>
                <div className="ml-4">
                  <SearchBox />
                </div>
              </div>
            </div>
          </nav>
        </header>

        <div className="flex-1 w-full max-w-7xl mx-auto px-4 pb-8">
          <main role="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/item/:id" element={<ItemDetail />} />
            </Routes>
          </main>
        </div>

        <footer className="border-t border-white/10 mt-auto py-4 text-white/50 text-sm">
          <div className="max-w-7xl mx-auto px-4 text-center">
            &copy; 2025 - Trumpet_UI
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
