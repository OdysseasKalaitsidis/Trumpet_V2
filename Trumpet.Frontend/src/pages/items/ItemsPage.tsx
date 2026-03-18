import { useSearchParams, Link } from "react-router-dom";
import { useItems } from "../../hooks/useItems";
import { getPageTitle, getPageDescription } from "./api";
import { paths } from "../../components/MusicPathsGrid";
import { getMediaUrl } from "../../api/config";
import { useLanguage } from "../../hooks/useLanguage";
import { getLocalizedTitle, getLocalizedContributor } from "../../i18n/localize";
import { tr } from "../../i18n/translations";
import { useState, useEffect } from 'react';

export default function ItemsPage() {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const communityId = searchParams.get("communityId") || "";
  const path = searchParams.get("path") || "";
  const search = searchParams.get("search") || "";
  const pathName = searchParams.get("pathName") || "Archive";
  const communityName = searchParams.get("communityName") || "";

  const { items, loading } = useItems(path, search, communityId);
  const [manifestFiles, setManifestFiles] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<string | null>(null);

  useEffect(() => {
    fetch('/media/manifest.json')
      .then(res => res.json())
      .then(data => setManifestFiles(data.files || []))
      .catch(err => console.error('Failed to load media manifest:', err));
  }, []);

  useEffect(() => {
    if (communityId && manifestFiles.length > 0) {
      const found = manifestFiles.find(f => f.includes(communityId));
      setLogoFile(found || null);
    } else {
      setLogoFile(null);
    }
  }, [communityId, manifestFiles]);

  const pageTitle = getPageTitle({ search, communityName, pathName });
  const pathMeta = paths.find(p => p.id === path);
  const pageDescription = pathMeta
    ? tr(language, pathMeta.descriptionKey)
    : getPageDescription({ search, communityName, pathName });

  return (
    <div className="animate-fade-in py-16 px-6 max-w-7xl mx-auto">
      {/* Breadcrumb / Nav */}
      <nav className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <span className="opacity-30">/</span>
            {search ? (
                <span className="text-zinc-900 dark:text-white">Search Results</span>
            ) : (
                <span className="text-zinc-900 dark:text-white">{communityName || pathName}</span>
            )}
        </div>

        {!loading && (
            <div className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 glass-card bg-orange-600/10 text-orange-600 rounded-full">
                {items.length} Archival Items
            </div>
        )}
      </nav>

      {/* Header */}
      <header className="mb-24">
        <div className="flex items-center gap-10 mb-8">
            {logoFile && (
                <img
                src={`/media/${logoFile}`}
                alt={`${communityName} logo`}
                className="w-24 h-24 object-contain rounded-[2.5rem] glass-card p-4 shadow-sm"
                />
            )}
            <h1 
                className="text-5xl md:text-8xl font-bold tracking-tighter text-zinc-900 dark:text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
            >
                {pageTitle}
            </h1>
        </div>
        <p className="text-xl text-zinc-400 font-bold uppercase tracking-[0.2em] max-w-3xl leading-relaxed">
            {pageDescription}
        </p>
      </header>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className="aspect-[4/5] rounded-[3rem] animate-pulse bg-zinc-50 dark:bg-zinc-950"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-32 text-center">
            <div className="text-8xl mb-12 opacity-10 animate-float">🎺</div>
            <p className="text-3xl text-zinc-400 font-black mb-12 uppercase tracking-tighter">Silence in this collection.</p>
            <Link
                to="/"
                className="inline-flex px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-black text-[10px] tracking-[0.3em] uppercase hover:scale-105 transition-transform"
            >
                Back to Home
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {items.map((item, i) => {
            const imageBitstreams = item.bitstreams?.filter(b =>
                (b.mimeType && b.mimeType.startsWith('image/')) ||
                b.name.match(/\.(jpg|jpeg|png|gif)$/i)
            ) || [];
            imageBitstreams.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
            const cover = imageBitstreams.length > 0 ? imageBitstreams[0] : null;
            const coverUrl = cover ? getMediaUrl(cover.localFilePath) : null;

            return (
                <Link
                key={item.id}
                to={`/item/${item.id}`}
                className="group glass-card flex flex-col h-full rounded-[3rem] overflow-hidden no-underline"
                style={{ animationDelay: `${i * 30}ms` }}
                >
                <div className="aspect-[4/5] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center relative overflow-hidden">
                    {coverUrl ? (
                        <img
                        src={coverUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                    ) : (
                        <span className="text-5xl opacity-10 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700">📜</span>
                    )}
                </div>

                <div className="p-10 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors uppercase tracking-tighter">
                        {getLocalizedTitle(item, language)}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        {getLocalizedContributor(item, language) || 'Unknown Author'}
                    </p>
                    
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Explore <span className="text-lg">→</span>
                    </div>
                </div>
                </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
