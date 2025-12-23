import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBox() {
    const [term, setTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (term.trim()) {
            navigate(`/?search=${encodeURIComponent(term)}`);
        }
    };

    const toggleSearch = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Focus logic could go here if we had a ref
        }
    };

    return (
        <div className={`flex items-center transition-all duration-500 ease-liquid ${isOpen ? 'w-full md:w-96' : 'w-10'}`}>
            {isOpen ? (
                <form className="flex-1 flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full pl-2 pr-4 py-1" onSubmit={handleSubmit}>
                    <button
                        type="button"
                        onClick={toggleSearch}
                        className="p-2 text-white/70 hover:text-white transition-colors mr-2 rounded-full hover:bg-white/10"
                    >
                        {/* Arrow Left Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <input
                        autoFocus
                        className="bg-transparent border-none text-white placeholder-white/50 focus:outline-none w-full text-base ml-1 h-8"
                        type="search"
                        placeholder="Search artworks..."
                        aria-label="Search"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                    />
                    <button type="submit" className="ml-2 text-white/70 hover:text-white transition-colors">
                        {/* Search Icon (Small) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </form>
            ) : (
                <button
                    onClick={toggleSearch}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110"
                    aria-label="Open Search"
                >
                    {/* Search Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            )}
        </div>
    );
}
