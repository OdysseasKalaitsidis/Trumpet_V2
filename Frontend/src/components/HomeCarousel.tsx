import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Path {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  imgSrc: string;
}

const paths: Path[] = [
  {
    id: "ArtMusic",
    title: "Art Music",
    subtitle: "Η μουσική του άστεως",
    icon: "🎻",
    imgSrc: "/img/art_music.png"
  },
  {
    id: "UrbanPopular",
    title: "Urban Popular Music",
    subtitle: "Η αστικολαϊκή μουσική",
    icon: "🎺",
    imgSrc: "/img/urban_popular.png"
  },
  {
    id: "RuralMusic",
    title: "Rural Music",
    subtitle: "Η μουσική της υπαίθρου",
    icon: "🪕",
    imgSrc: "/img/rural_music.png"
  },
  {
    id: "SacredMusic",
    title: "Sacred Music",
    subtitle: "Η εκκλησιαστική μουσική",
    icon: "⛪",
    imgSrc: "/img/sacred_music.png"
  }
];

export default function HomeCarousel() {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const handleExplore = (path: string) => {
    navigate(`/browse?path=${path}`);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-3xl group mb-20 bg-black/20 backdrop-blur-sm border border-white/10 shadow-2xl">
      {/* Background Images with Crossfade */}
      {paths.map((path, idx) => (
        <div
          key={path.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === active ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          }`}
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%), url(${path.imgSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-8 md:p-16 flex flex-col md:flex-row items-end justify-between transition-transform duration-700 translate-y-0">
        <div className="max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white/80 mb-4 animate-fade-in">
            {paths[active].icon} Music Path
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 tracking-tight animate-slide-up">
            {paths[active].title}
          </h1>
          <p className="text-xl md:text-2xl text-white/70 mb-8 font-medium animate-slide-up delay-100">
            {paths[active].subtitle}
          </p>
          <button
            onClick={() => handleExplore(paths[active].id)}
            className="group relative overflow-hidden bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all active:scale-95"
          >
            Explore the Path
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-3 mt-8 md:mt-0">
          {paths.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 bg-white ${
                idx === active ? 'w-12' : 'w-4 opacity-30 hover:opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Side Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full px-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <button
          onClick={() => setActive((prev) => (prev - 1 + paths.length) % paths.length)}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white pointer-events-auto hover:bg-white hover:text-black transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={() => setActive((prev) => (prev + 1) % paths.length)}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white pointer-events-auto hover:bg-white hover:text-black transition-all"
        >
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
