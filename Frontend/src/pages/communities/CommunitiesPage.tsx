import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchCommunities, getPathTitle } from './api';
import { Community } from './models';
import { useLanguage } from '../../hooks/useLanguage';
import { tr } from '../../i18n/translations';

export default function CommunitiesPage() {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const path = searchParams.get('path');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [manifestFiles, setManifestFiles] = useState<string[]>([]);

  useEffect(() => {
    fetch('/media/manifest.json')
      .then(res => res.json())
      .then(data => setManifestFiles(data.files || []))
      .catch(err => console.error('Failed to load media manifest:', err));
  }, []);

  useEffect(() => {
    const loadCommunities = async () => {
      setLoading(true);
      try {
        const data = await fetchCommunities(path || undefined);
        setCommunities(data);
      } catch (error) {
        console.error("Failed to fetch communities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCommunities();
  }, [path]);

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.introductoryText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in py-16 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-2xl">
                <nav className="mb-10">
                    <Link
                        to="/"
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-orange-600 transition-colors"
                    >
                        {tr(language, 'communities.backToHome')}
                    </Link>
                </nav>
                <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {getPathTitle(path, language)}
                </h1>
                <p className="text-xl text-zinc-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    {tr(language, 'communities.subtitle')}
                </p>
            </div>
            
            {/* Minimalist Search */}
            <div className="w-full md:w-96">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder={tr(language, 'communities.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-8 py-5 glass-card bg-white/20 dark:bg-zinc-900/20 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-bold text-xs uppercase tracking-widest text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400">
                        {searchTerm ? (
                            <button onClick={() => setSearchTerm('')} className="hover:text-orange-600 transition-colors text-lg">✕</button>
                        ) : (
                            <span className="text-xl opacity-30">🔍</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* Grid */}
      {loading ? (
        <div className="py-32 flex justify-center">
          <div className="w-12 h-12 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="py-32 text-center">
          <p className="text-2xl text-zinc-400 font-black uppercase tracking-tighter">{tr(language, 'communities.noResults')} "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-8 text-orange-600 font-black uppercase tracking-widest border-b-2 border-orange-600/30 pb-1"
          >
            {tr(language, 'communities.clearSearch')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCommunities.map((comm, i) => {
            const logoFile = manifestFiles.find(f => f.includes(comm.id));
            return (
                <Link
                key={comm.id}
                to={`/items?communityId=${comm.id}&pathName=${getPathTitle(path)}&communityName=${encodeURIComponent(comm.name)}`}
                className="group glass-card p-12 flex flex-col rounded-[3rem] no-underline"
                style={{ animationDelay: `${i * 50}ms` }}
                >
                <div className="flex justify-between items-start mb-10">
                    <div className="w-12 h-1 rounded-full bg-orange-600 group-hover:w-20 transition-all duration-700" />
                    {logoFile && (
                        <img 
                            src={`/media/${logoFile}`} 
                            alt={comm.name} 
                            className="w-16 h-16 object-contain rounded-2xl bg-white/20 dark:bg-zinc-800/20 backdrop-blur-md p-3 shadow-sm opacity-50 group-hover:opacity-100 transition-all duration-700 hover:scale-110" 
                        />
                    )}
                </div>

                <h3 className="text-3xl font-bold mb-6 dark:text-white group-hover:text-orange-600 transition-colors uppercase tracking-tighter leading-tight">
                    {comm.name}
                </h3>

                <p className="text-zinc-400 dark:text-zinc-500 text-sm leading-relaxed mb-10 line-clamp-3 font-medium">
                    {comm.introductoryText || tr(language, 'communities.fallbackDescription')}
                </p>

                <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span>{tr(language, 'communities.exploreCollection')}</span>
                    <span className="text-lg">→</span>
                </div>
                </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
