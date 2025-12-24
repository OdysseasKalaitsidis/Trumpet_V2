import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Community {
  id: string;
  name: string;
  introductoryText: string;
}

export default function CommunityBrowser() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/communities?path=${path || ''}`);
        const data = await response.json();
        setCommunities(data);
      } catch (error) {
        console.error("Failed to fetch communities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [path]);

  const getPathTitle = (pathKey: string | null) => {
    switch (pathKey) {
      case 'ArtMusic': return 'Art Music';
      case 'UrbanPopular': return 'Urban Popular Music';
      case 'RuralMusic': return 'Rural Music';
      case 'SacredMusic': return 'Sacred Music';
      default: return 'Archive Communities';
    }
  };

  return (
    <div className="py-12 animate-fade-in">
      <div className="mb-16">
        <Link to="/" className="text-white/40 hover:text-white transition-colors mb-4 inline-block font-medium">
          ← Back to Paths
        </Link>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
          {getPathTitle(path)}
        </h1>
        <p className="text-xl text-white/50 mt-4 max-w-2xl font-medium">
          Choose a community to unfold its unique collection of musical heritage.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communities.map((comm) => (
             <div 
              key={comm.id}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col h-full"
            >
              <div className="mb-6 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📍
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2">
                {comm.name}
              </h3>
              <p className="text-white/40 text-sm line-clamp-3 mb-8 flex-grow leading-relaxed font-medium">
                {comm.introductoryText || "Discover more about this community's musical legacy."}
              </p>
              <Link 
                to={`/items?communityId=${comm.id}&pathName=${getPathTitle(path)}&communityName=${comm.name}`}
                className="w-full py-4 rounded-2xl bg-white text-black font-bold text-center group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 transition-all"
              >
                Unfold Community
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
