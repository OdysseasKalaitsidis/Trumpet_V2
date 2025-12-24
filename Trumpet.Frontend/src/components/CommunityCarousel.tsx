import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

interface Community {
  id: string;
  name: string;
  introductoryText: string;
}

export default function CommunityCarousel() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/communities`)
      .then(res => res.json())
      .then(data => {
        setCommunities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-white/20">Loading communities...</div>;

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Communities</h2>
          <p className="text-white/40 font-medium">Browse the entities preserving Corfiot music.</p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex gap-6 transition-transform duration-700 ease-out py-4"
          style={{ transform: `translateX(-${scrollPos}px)` }}
        >
          {communities.map((c) => (
            <Link
              key={c.id}
              to={`/items?communityId=${c.id}&communityName=${encodeURIComponent(c.name)}`}
              className="flex-shrink-0 w-80 p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                🏛️
              </div>
              <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
                {c.name}
              </h3>
              <p className="text-white/40 text-sm line-clamp-3 font-medium leading-relaxed">
                {c.introductoryText || "No description available."}
              </p>
            </Link>
          ))}
        </div>

        {/* Navigation Buttons for Carousel */}
        <button 
          onClick={() => setScrollPos(Math.max(0, scrollPos - 340))}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          ←
        </button>
        <button 
          onClick={() => setScrollPos(scrollPos + 340)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          →
        </button>
      </div>
    </div>
  );
}
