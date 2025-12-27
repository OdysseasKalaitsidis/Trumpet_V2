import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import MusicPathsGrid from "../../components/MusicPathsGrid";
import CommunityCarousel from "../../components/CommunityCarousel";
import { useItems } from "../../hooks/useItems";
import { getMediaUrl } from "../../api/config";

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
      {/* Hero Section with parallax */}
      <section className="text-center pt-8 pb-16 mb-8 relative px-4">
        <div
          className="transition-transform duration-300"
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
        >
          <h1
            className="text-4xl md:text-6xl font-bold mb-8 leading-tight bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Discover Corfiot<br />Musical Paths
          </h1>
        </div>

        <div className="max-w-5xl mx-auto text-left">
          <p
            className="text-base md:text-lg leading-relaxed mb-12 text-center text-balance"
            style={{ color: 'var(--color-text-muted)' }}
          >
            The long-standing musical tradition of Corfu can be encoded in the framework of four distinct, but at the same time interconnected musical "paths", which through time sometimes converged and sometimes diverged, but always expressed the Corfiots’ musical instinct. These four musical paths are:
          </p>

          <MusicPathsGrid />
        </div>








        {/* Floating music notes */}
        <div className="absolute top-1/4 left-10 text-4xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>♪</div>
        <div className="absolute top-1/3 right-16 text-3xl opacity-20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>♫</div>
        <div className="absolute bottom-1/4 left-1/4 text-2xl opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>♬</div>
      </section>
      {/* Hero Search Bar */}


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
                className="group relative card p-0 block no-underline overflow-hidden dark:bg-black"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-500" />

                <div
                  className="w-full aspect-square flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  {(() => {
                    const imageBitstreams = item.bitstreams?.filter(b =>
                      (b.mimeType && b.mimeType.startsWith('image/')) ||
                      b.name.match(/\.(jpg|jpeg|png|gif)$/i)
                    ) || [];

                    // Sort by size desc (prefer higher quality)
                    imageBitstreams.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
                    const cover = imageBitstreams.length > 0 ? imageBitstreams[0] : null;
                    const coverUrl = cover ? getMediaUrl(cover.localFilePath) : null;

                    if (coverUrl) {
                      return (
                        <img
                          src={coverUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      );
                    }

                    return (
                      <div className="relative">
                        <svg
                          className="w-16 h-16 opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 group-hover:text-amber-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                        <div className="absolute inset-0 rounded-full border-2 border-amber-500/0 group-hover:border-amber-500/50 scale-100 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                      </div>
                    );
                  })()}
                </div>

                <div className="p-5">
                  <h3
                    className="font-semibold mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--color-text)' }}
                  >
                    {item.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {item.metadata.find(m => m.field === "dc.contributor.author")?.value || "Unknown"}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div >
  );
}


