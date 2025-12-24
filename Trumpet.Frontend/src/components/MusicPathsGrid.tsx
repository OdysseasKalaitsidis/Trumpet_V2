import { useNavigate } from 'react-router-dom';

interface Path {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  imgSrc: string;
  color: string;
}

const paths: Path[] = [
  {
    id: "ArtMusic",
    title: "Art Music",
    subtitle: "Η μουσική του άστεως",
    icon: "🎻",
    imgSrc: "/img/art_music.png",
    color: "from-blue-500/20 to-indigo-500/20"
  },
  {
    id: "UrbanPopular",
    title: "Urban Popular",
    subtitle: "Η αστικολαϊκή μουσική",
    icon: "🎺",
    imgSrc: "/img/urban_popular.png",
    color: "from-amber-500/20 to-orange-500/20"
  },
  {
    id: "RuralMusic",
    title: "Rural Music",
    subtitle: "Η μουσική της υπαίθρου",
    icon: "🪕",
    imgSrc: "/img/rural_music.png",
    color: "from-emerald-500/20 to-teal-500/20"
  },
  {
    id: "SacredMusic",
    title: "Sacred Music",
    subtitle: "Η εκκλησιαστική μουσική",
    icon: "⛪",
    imgSrc: "/img/sacred_music.png",
    color: "from-purple-500/20 to-pink-500/20"
  }
];

export default function MusicPathsGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 animate-fade-in">
      {paths.map((path) => (
        <button
          key={path.id}
          onClick={() => navigate(`/items?path=${path.id}&pathName=${encodeURIComponent(path.title)}`)}
          className="group relative h-[450px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 transition-all duration-700 hover:-translate-y-3 hover:shadow-3xl hover:border-white/30 text-left"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
            style={{ backgroundImage: `url(${path.imgSrc})` }}
          />
          
          {/* Gradients */}
          <div className={`absolute inset-0 bg-gradient-to-b ${path.color} opacity-40 mix-blend-overlay`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              {path.icon}
            </div>
            <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">
              {path.title}
            </h3>
            <p className="text-white/60 font-medium leading-tight">
              {path.subtitle}
            </p>
            
            <div className="mt-6 flex items-center gap-2 text-xs font-bold tracking-widest text-white/40 uppercase group-hover:text-white transition-colors">
              Explore Path <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
