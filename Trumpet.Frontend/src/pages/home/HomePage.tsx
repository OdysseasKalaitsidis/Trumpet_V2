import { Link } from "react-router-dom";
import MusicPathsGrid from "../../components/MusicPathsGrid";
import CommunityCarousel from "../../components/CommunityCarousel";
import { useItems } from "../../hooks/useItems";

export default function HomePage() {
  const { items, loading } = useItems("", "");

  return (
    <div className="pt-12 animate-fade-in">
      <div className="text-center mb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
          Trumpet
        </h1>
        <p className="text-2xl md:text-3xl text-white/40 font-bold max-w-2xl mx-auto leading-tight tracking-tight italic">
          "The unfolding story of Corfiot musical tradition."
        </p>
      </div>

      <MusicPathsGrid />

      <div className="mb-24">
        <CommunityCarousel />
      </div>

      <div className="border-t border-white/5 pt-16 mt-20">
         <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Editor's Choice</h2>
              <p className="text-white/40 font-medium">Recently added gems from the archive.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-full py-20 text-center text-white/20 text-2xl animate-pulse">
                Preparing the archive...
              </div>
            ) : (
              items.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  to={`/item/${item.id}`}
                  className="group relative h-96 rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 z-10Opacity transition-opacity group-hover:opacity-60" />
                  <div className="p-8 absolute bottom-0 z-20 w-full transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-white/50 text-sm font-medium">
                      {item.metadata.find(m => m.field === "dc.contributor.author")?.value || "Unknown Artist"}
                    </p>
                  </div>
                </Link>
              ))
            )}
         </div>
      </div>
    </div>
  );
}
