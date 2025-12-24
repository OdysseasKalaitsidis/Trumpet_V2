import { useSearchParams, Link } from "react-router-dom";
import { useItems } from "../hooks/useItems";

export default function ItemsBrowser() {
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get("communityId") || "";
  const path = searchParams.get("path") || "";
  const pathName = searchParams.get("pathName") || "Archive";
  const communityName = searchParams.get("communityName") || "";
  
  const { items, loading } = useItems(path, "", communityId);

  const pageTitle = communityName || pathName || "Archive Items";
  const showBreadcrumbs = !!communityName && !!pathName;

  return (
    <div className="py-12 animate-fade-in">
      <div className="mb-16">
        {showBreadcrumbs ? (
          <nav className="flex items-center gap-2 text-white/40 font-medium mb-4 text-sm">
            <Link to="/" className="hover:text-white transition-colors">Paths</Link>
            <span>/</span>
            <span className="text-white/60">{pathName}</span>
            <span>/</span>
            <span className="text-white/60">{communityName}</span>
          </nav>
        ) : (
          <nav className="flex items-center gap-2 text-white/40 font-medium mb-4 text-sm">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/60">{pageTitle}</span>
          </nav>
        )}
        
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-xl text-white/50 mt-4 max-w-2xl font-medium">
          {communityName 
            ? `Explore the curated musical assets and archival records of ${communityName}.`
            : `Discover all items belonging to the ${pathName} music path.`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-80 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/item/${item.id}`}
              className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
            >
              <div className="aspect-[4/5] bg-white/5 flex items-center justify-center relative overflow-hidden">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-700">🎵</span>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="p-6 flex-grow flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                  {item.name}
                </h3>
                <p className="text-white/40 text-sm font-medium">
                  {item.metadata.find(m => m.field === "dc.contributor.author")?.value || "Unknown Archive"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="py-20 text-center text-white/20 text-2xl font-medium">
          No items found in this community.
        </div>
      )}
    </div>
  );
}
