import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import MusicPathsGrid from "../../components/MusicPathsGrid";
import CommunityCarousel from "../../components/CommunityCarousel";
import { useItems } from "../../hooks/useItems";

export default function HomePage() {
  const { items, loading } = useItems("", "");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse for parallax effect
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
    <div className="animate-fade-in relative overflow-hidden">
      {/* Floating background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ 
            background: 'linear-gradient(to right, #f59e0b, #ea580c)',
            top: '10%',
            left: '20%',
            transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ 
            background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
            bottom: '20%',
            right: '10%',
            transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`,
            transition: 'transform 0.4s ease-out'
          }}
        />
      </div>

      {/* Hero Section with parallax */}
      <section className="text-center py-20 mb-16 relative">
        <div 
          className="transition-transform duration-300"
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
        >
          <h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Discover Corfiot<br />Musical Heritage
          </h1>
        </div>
        
        <p 
          className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Explore centuries of musical tradition from Corfu — from sacred chants 
          to urban melodies, preserved in digital archives.
        </p>

       
        
        <div className="flex justify-center gap-4">
          <Link 
            to="/browse" 
            className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{ background: 'linear-gradient(to right, #f59e0b, #ea580c)' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Exploring 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
          
          <button 
            className="px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-105"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            Watch Preview
          </button>
        </div>


        

        {/* Floating music notes */}
        <div className="absolute top-1/4 left-10 text-4xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>♪</div>
        <div className="absolute top-1/3 right-16 text-3xl opacity-20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>♫</div>
        <div className="absolute bottom-1/4 left-1/4 text-2xl opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>♬</div>
      </section>
       {/* Hero Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.querySelector('input') as HTMLInputElement;
            if (input.value.trim()) {
              window.location.href = `/items?search=${encodeURIComponent(input.value)}`;
            }
          }}
          className="max-w-xl mx-auto mb-10"
        >
          <div 
            className="flex items-center rounded-2xl border-2 overflow-hidden shadow-lg transition-all focus-within:ring-4 focus-within:ring-amber-500/20 focus-within:border-amber-500"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-warm)' }}
          >
            <span className="pl-5 text-xl opacity-50">🔍</span>
            <input
              type="search"
              placeholder="Search the archive... (e.g., 'concerto', 'hymn', 'folk')"
              className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-base"
              style={{ color: 'var(--color-text)' }}
            />
            <button
              type="submit"
              className="px-6 py-4 font-semibold text-white transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(to right, #f59e0b, #ea580c)' }}
            >
              Search
            </button>
          </div>
          <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Discover recordings, documents, and artifacts from Corfu's musical heritage
          </p>
        </form>



      

      {/* Music Paths */}
      <section className="mb-20 relative">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="section-title">Musical Paths</h2>
            <p className="section-subtitle">Four distinct traditions of Corfiot music</p>
          </div>
          <Link to="/browse" className="link-arrow text-sm">View all</Link>
        </div>
        <MusicPathsGrid />
      </section>

      {/* Communities */}
      <section className="mb-20">
        <CommunityCarousel />
      </section>

      {/* Featured Items with hover magic */}
      <section className="py-16 border-t relative" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="section-title">From the Archive</h2>
            <p className="section-subtitle">Recently added treasures from our collections</p>
          </div>
          <Link to="/items" className="link-arrow text-sm">Browse all</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center" style={{ color: 'var(--color-text-muted)' }}>
              <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4">Loading archive...</p>
            </div>
          ) : (
            items.slice(0, 4).map((item, i) => (
              <Link
                key={item.id}
                to={`/item/${item.id}`}
                className="group relative card p-0 block no-underline overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-500" />
                
                <div 
                  className="w-full aspect-square flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  {/* Animated icon */}
                  <div className="relative">
                    <svg 
                      className="w-16 h-16 opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 group-hover:text-amber-500" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/0 group-hover:border-amber-500/50 scale-100 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 
                    className="font-semibold mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {item.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {item.metadata.find(m => m.field === "dc.contributor.author")?.value || "Unknown"}
                  </p>
                  
                  {/* Sliding arrow */}
                  <div className="mt-3 flex items-center gap-2 text-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                    <span className="text-sm font-medium">View item</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}


