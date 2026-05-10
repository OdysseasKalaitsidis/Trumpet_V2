import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { tr } from "../../i18n/translations";

export default function HomePage() {
  const { language } = useLanguage();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 relative">
      <div className="max-w-6xl w-full relative z-10 py-12">
        <header className="text-center mb-32 animate-fade-in">
          <h1 
            className="text-7xl md:text-9xl font-bold mb-10 tracking-tighter text-zinc-900 dark:text-white leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Trumpet
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-[0.3em]">
            Archive — Paths — Events
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: Archives */}
          <Link 
            to="/communities" 
            className="group glass-card p-12 flex flex-col rounded-[3rem] no-underline"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-600/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
               <span className="text-2xl">📦</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 tracking-tighter dark:text-white uppercase">Archives</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-8 font-medium">
              Browse through historical collections and manuscripts from local musical communities.
            </p>
            <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              Explore <span className="text-lg">→</span>
            </div>
          </Link>

          {/* Pillar 2: Music Paths */}
          <Link 
            to="/music-paths" 
            className="group glass-card p-12 flex flex-col rounded-[3rem] no-underline"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-600/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
               <span className="text-2xl">🗺️</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 tracking-tighter dark:text-white uppercase">Paths</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-8 font-medium">
              Navigate the island's musical map and discover soundscapes from different regions.
            </p>
            <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              Discover <span className="text-lg">→</span>
            </div>
          </Link>

          {/* Pillar 3: Corfu Events */}
          <Link 
            to="/events" 
            className="group glass-card p-12 flex flex-col rounded-[3rem] no-underline"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-600/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
               <span className="text-2xl">🗓️</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 tracking-tighter dark:text-white uppercase">Events</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-8 font-medium">
              Upcoming concerts, festivals, and cultural activities happening across Corfu.
            </p>
            <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              View <span className="text-lg">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
