import React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBox() {
  const [term, setTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      navigate(`/items?search=${encodeURIComponent(term)}`);
      setIsOpen(false);
      setTerm("");
    }
  };

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative flex items-center transition-all duration-300 ${isOpen ? "w-64" : "w-10"}`}>
      {isOpen ? (
        <form
          className="flex-1 flex items-center rounded-xl border overflow-hidden transition-all"
          style={{ 
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-warm)'
          }}
          onSubmit={handleSubmit}
        >
          <button
            type="button"
            onClick={toggleSearch}
            className="p-2.5 transition-colors hover:bg-black/5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ←
          </button>
          <input
            ref={inputRef}
            className="bg-transparent border-none focus:outline-none w-full text-sm py-2"
            style={{ color: 'var(--color-text)' }}
            type="search"
            placeholder="Search items..."
            aria-label="Search items"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <button
            type="submit"
            className="p-2.5 transition-all hover:text-amber-500"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
      ) : (
        <button
          onClick={toggleSearch}
          className="group flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 hover:scale-110 hover:border-amber-500 hover:bg-amber-500/10"
          style={{ borderColor: 'var(--color-border)' }}
          aria-label="Open Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors group-hover:stroke-amber-500"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      )}
    </div>
  );
}

