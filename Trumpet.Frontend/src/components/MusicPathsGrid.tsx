import { useNavigate } from 'react-router-dom';

interface Path {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  emoji: string;
}

export const paths: Path[] = [
  {
    id: "ArtMusic",
    title: "Art Music",
    subtitle: "Η μουσική του άστεως",
    description: "Music ensembles and musical compositions of arty, “entechno”, music, local composers, and organized music training",
    gradient: "from-blue-500 to-indigo-600",
    emoji: "🎻"
  },
  {
    id: "UrbanPopular",
    title: "Urban Popular",
    subtitle: "Η αστικολαϊκή μουσική",
    description: "Bands, choirs, choruses with mandolins and, more recently, improvised jazz, pop and rock bands, as well as other forms of non-structured and experiential music training",
    gradient: "from-amber-500 to-orange-600",
    emoji: "🎺"
  },
  {
    id: "RuralMusic",
    title: "Rural Music",
    subtitle: "Η μουσική της υπαίθρου",
    description: "Music related to the annual performances in the, mainly agricultural and pastoral, exurban Corfiot communities of the past and how these have made it to today’s reality",
    gradient: "from-emerald-500 to-teal-600",
    emoji: "🪕"
  },
  {
    id: "SacredMusic",
    title: "Sacred Music",
    subtitle: "Η εκκλησιαστική μουσική",
    description: "Primarily of the Orthodox faith, especially in the form of the local \"Creto-Ionian\" chant. Similarly, the liturgical music of the Catholic, Protestant and Israelite communities",
    gradient: "from-purple-500 to-pink-600",
    emoji: "⛪"
  }
];

export default function MusicPathsGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paths.map((path) => (
        <button
          key={path.id}
          onClick={() => navigate(`/items?path=${path.id}&pathName=${encodeURIComponent(path.title)}`)}
          className="group relative p-6 rounded-2xl text-left overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
          style={{
            backgroundColor: 'var(--color-bg-warm)',
            border: '1px solid var(--color-border)'
          }}
        >
          {/* Animated gradient bg on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${path.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

          {/* Animated border glow */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${path.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl -z-10 scale-110`} />

          {/* Content */}
          <div className="relative z-10 flex gap-4">
            {/* Icon with glow */}
            <div className="relative">
              <span
                className="text-4xl group-hover:scale-125 transition-transform duration-500 block"
                style={{ filter: 'drop-shadow(0 0 0px transparent)' }}
              >
                {path.emoji}
              </span>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-lg`}>
                <span className="text-4xl">{path.emoji}</span>
              </div>
            </div>

            <div className="flex-1">
              <h3
                className="text-xl font-bold mb-1 group-hover:text-amber-600 transition-colors"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--color-text)' }}
              >
                {path.title}
              </h3>
              <p
                className="text-sm mb-2 italic"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {path.subtitle}
              </p>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {path.description}
              </p>

              {/* Arrow slides in */}
              <div className="mt-3 flex items-center gap-2 text-amber-500 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                <span className="text-sm font-semibold">Explore path</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>

          {/* Decorative corner elements */}
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${path.gradient} opacity-0 group-hover:opacity-20 rounded-bl-full transition-all duration-500`} />
        </button>
      ))}
    </div>
  );
}


