import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Collection {
  id: string;
  name: string;
  parentCommunityId?: string;
  items?: any[];
}

interface Community {
  id: string;
  name: string;
  introductoryText: string;
  collections: Collection[];
  subCommunities?: Community[];
}

export default function CommunityBrowser() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path');
  const communityId = searchParams.get('communityId');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/communities?path=${path || ''}`);
        let data: Community[] = await response.json();
        
        if (communityId) {
            data = data.filter(c => c.id === communityId);
        }
        
        setCommunities(data);
      } catch (error) {
        console.error("Failed to fetch communities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [path, communityId]);

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
      <div className="mb-20">
        <Link to="/" className="text-white/40 hover:text-white transition-colors mb-4 inline-block font-medium">
          ← Back to Paths
        </Link>
        <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
          {getPathTitle(path)}
        </h1>
        <p className="text-2xl text-white/40 mt-6 max-w-3xl font-medium leading-relaxed">
          Explore the communities and collections that preserve our musical heritage.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-96 rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {communities.map((community) => (
             <div 
              key={community.id}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
            >
              <div className="mb-8 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                🏛️
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-4 leading-tight">
                {community.name}
              </h3>
              
              {community.introductoryText && (
                <p className="text-white/50 text-sm mb-8 line-clamp-3 leading-relaxed">
                   {community.introductoryText}
                </p>
              )}
              
              <div className="mt-auto space-y-4">
                <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Collections</div>
                {community.collections && community.collections.length > 0 ? (
                  <div className="space-y-2">
                    {community.collections.map(col => (
                      <Link
                        key={col.id}
                        to={`/items?collectionId=${col.id}&pathName=${getPathTitle(path)}&communityName=${community.name}&collectionName=${col.name}`}
                        className="flex items-center gap-3 p-4 rounded-xl bg-black/20 hover:bg-white/10 transition-colors border border-white/5 group/link"
                      >
                        <div className="w-2 h-2 rounded-full bg-white/40 group-hover/link:bg-white transition-colors" />
                        <span className="text-white/80 font-medium text-sm group-hover/link:text-white transition-colors truncate">
                          {col.name}
                        </span>
                        <span className="ml-auto text-white/20 group-hover/link:text-white/60 transition-colors text-xs">View Items →</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                   <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-white/30 text-sm italic">
                     No collections available
                   </div>
                )}
              </div>

               {/* Recurse for Sub-Communities if handled in UI later, currently just simplified */}
               {community.subCommunities && community.subCommunities.length > 0 && (
                   <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Sub-Communities</div>
                       <div className="grid gap-2">
                           {community.subCommunities.map(sub => (
                               <div key={sub.id} className="text-white/60 text-sm pl-4 border-l-2 border-white/10">
                                   {sub.name}
                               </div>
                           ))}
                       </div>
                   </div>
               )}
            </div>
          ))}
        </div>
      )}
      
      {!loading && communities.length === 0 && (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">No communities found</h3>
            <p className="text-white/40">Try selecting a different path or check back later.</p>
          </div>
      )}
    </div>
  );
}
