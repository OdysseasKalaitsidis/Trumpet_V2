import { tr } from "../../i18n/translations";
import { useLanguage } from "../../hooks/useLanguage";

export interface CorfuEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
  category: 'festival' | 'concert' | 'workshop' | 'exhibition';
}

const MOCK_EVENTS: CorfuEvent[] = [
  {
    id: '1',
    title: 'Corfu International Music Festival',
    date: '2025-07-15',
    location: 'Old Fortress, Corfu Town',
    description: 'A celebration of classical and contemporary music featuring world-renowned artists in the historic Old Fortress.',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf289ad?auto=format&fit=crop&w=800&q=80',
    category: 'festival'
  },
  {
    id: '2',
    title: 'Philharmonic Society "Mantzaros" Concert',
    date: '2025-04-12',
    location: 'Spianada Square',
    description: 'An open-air evening concert by one of Corfu\'s most prestigious philharmonic bands.',
    imageUrl: 'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?auto=format&fit=crop&w=800&q=80',
    category: 'concert'
  },
  {
    id: '3',
    title: 'Byzantine Chant Workshop',
    date: '2025-05-20',
    location: 'Ionian University, Music Dept.',
    description: 'A hands-on workshop exploring the "Creto-Ionian" liturgical music tradition.',
    imageUrl: 'https://images.unsplash.com/photo-1507838596058-a96249c711f2?auto=format&fit=crop&w=800&q=80',
    category: 'workshop'
  },
  {
    id: '4',
    title: 'Musical Carnival of Corfu',
    date: '2025-03-02',
    location: 'Liston & Spianada',
    description: 'The annual carnival featuring traditional Venetian-style parades and local musical troupes.',
    category: 'festival'
  }
];

export default function EventsPage() {
  const { language } = useLanguage();

  return (
    <div className="animate-fade-in py-16 px-6 max-w-7xl mx-auto">
      <header className="max-w-4xl mb-24">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-zinc-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          {tr(language, 'events.title')}
        </h1>
        <p className="text-xl text-zinc-400 font-medium leading-relaxed uppercase tracking-[0.2em]">
          {tr(language, 'events.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {MOCK_EVENTS.map((event) => (
          <div 
            key={event.id}
            className="group glass-card flex flex-col rounded-[2.5rem] overflow-hidden no-underline"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 relative">
              {event.imageUrl ? (
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10 group-hover:opacity-30 transition-all duration-700">
                    <span className="text-6xl">🎭</span>
                </div>
              )}
              <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white shadow-sm border border-white/20">
                      {event.category}
                  </span>
              </div>
            </div>
            
            <div className="p-10 flex flex-col h-full">
              <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                {new Date(event.date).toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              
              <h3 className="text-2xl font-bold mb-4 dark:text-white group-hover:text-orange-600 transition-colors tracking-tighter uppercase">
                {event.title}
              </h3>
              
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-8 font-medium line-clamp-2">
                {event.description}
              </p>
              
              <div className="mt-auto flex items-center gap-2 text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                <span className="text-lg">📍</span>
                {event.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
