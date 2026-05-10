import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { tr } from '../i18n/translations';

type PathKey = 'ArtMusic' | 'UrbanPopular' | 'RuralMusic' | 'SacredMusic';

interface Path {
  id: PathKey;
  titleKey: 'path.artMusic.title' | 'path.urbanPopular.title' | 'path.ruralMusic.title' | 'path.sacredMusic.title';
  subtitleKey: 'path.artMusic.subtitle' | 'path.urbanPopular.subtitle' | 'path.ruralMusic.subtitle' | 'path.sacredMusic.subtitle';
  descriptionKey: 'path.artMusic.description' | 'path.urbanPopular.description' | 'path.ruralMusic.description' | 'path.sacredMusic.description';
  gradient: string;
  emoji: string;
}

export const paths: Path[] = [
  {
    id: "ArtMusic",
    titleKey: "path.artMusic.title",
    subtitleKey: "path.artMusic.subtitle",
    descriptionKey: "path.artMusic.description",
    gradient: "from-blue-500 to-indigo-600",
    emoji: "🎻"
  },
  {
    id: "UrbanPopular",
    titleKey: "path.urbanPopular.title",
    subtitleKey: "path.urbanPopular.subtitle",
    descriptionKey: "path.urbanPopular.description",
    gradient: "from-amber-500 to-orange-600",
    emoji: "🎺"
  },
  {
    id: "RuralMusic",
    titleKey: "path.ruralMusic.title",
    subtitleKey: "path.ruralMusic.subtitle",
    descriptionKey: "path.ruralMusic.description",
    gradient: "from-emerald-500 to-teal-600",
    emoji: "🪕"
  },
  {
    id: "SacredMusic",
    titleKey: "path.sacredMusic.title",
    subtitleKey: "path.sacredMusic.subtitle",
    descriptionKey: "path.sacredMusic.description",
    gradient: "from-purple-500 to-pink-600",
    emoji: "⛪"
  }
];

export default function MusicPathsGrid() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paths.map((path) => {
        const title = tr(language, path.titleKey);
        return (
          <button
            key={path.id}
            onClick={() => navigate(`/items?path=${path.id}&pathName=${encodeURIComponent(title)}`)}
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
                  {title}
                </h3>
                <p
                  className="text-sm mb-2 italic"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {tr(language, path.subtitleKey)}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {tr(language, path.descriptionKey)}
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
        );
      })}
    </div>
  );
}


