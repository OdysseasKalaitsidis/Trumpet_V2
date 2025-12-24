import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import ItemDetail from './ItemDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <header>
          <nav className="navbar navbar-expand-sm navbar-toggleable-sm navbar-light bg-white border-bottom box-shadow mb-3">
            <div className="container">
              <Link className="navbar-brand" to="/">Trumpet_UI</Link>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target=".navbar-collapse" aria-controls="navbarSupportedContent"
                aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="navbar-collapse collapse d-sm-inline-flex justify-content-between">
                <ul className="navbar-nav flex-grow-1">
                  <li className="nav-item">
                    <Link className="nav-link text-dark" to="/">Home</Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </header>

        <div className="container main-container">
          <main role="main" className="pb-3">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/item/:id" element={<ItemDetail />} />
            </Routes>
          </main>
        </div>

        <footer className="border-top footer text-muted mt-auto">
          <div className="container">
            &copy; 2025 - Trumpet_UI
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
