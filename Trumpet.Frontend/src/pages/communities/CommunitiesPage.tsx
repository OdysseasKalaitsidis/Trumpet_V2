import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchCommunities, getPathTitle } from './api';
import { Community } from './models';

export default function CommunitiesPage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [manifestFiles, setManifestFiles] = useState<string[]>([]);

  useEffect(() => {
    // Fetch manifest
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
    <div className="animate-fade-in relative">
      {/* Floating background decorations */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -left-32 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="mb-12 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-all hover:gap-3"
          style={{ color: 'var(--color-accent)' }}
        >
          ← Back to Home
        </Link>

        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--color-text)' }}
        >
          {getPathTitle(path)}
        </h1>
        <p className="text-lg max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>
          Explore communities preserving Corfu's rich musical heritage. Each organization holds unique collections of recordings, documents, and artifacts.
        </p>

        {/* Search bar */}
        <div className="mt-8 max-w-md">
          <div
            className="relative flex items-center rounded-xl border overflow-hidden transition-all focus-within:ring-2 focus-within:ring-amber-500/50"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-warm)' }}
          >
            <span className="pl-4 opacity-50">🔍</span>
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border-none outline-none"
              style={{ color: 'var(--color-text)' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 opacity-50 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-6">
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{communities.length}</span> communities
          </div>
          {searchTerm && (
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <span className="font-bold text-lg text-amber-500">{filteredCommunities.length}</span> results
            </div>
          )}
        </div>
      </div>

      {/* Communities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="h-64 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--color-bg-muted)' }}
            />
          ))}
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="py-16 text-center" style={{ color: 'var(--color-text-muted)' }}>
          <div className="text-6xl mb-4 opacity-30">🔍</div>
          <p className="text-xl">No communities found matching "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 px-6 py-2 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((comm, i) => (
            <Link
              key={comm.id}
              to={`/items?communityId=${comm.id}&pathName=${getPathTitle(path)}&communityName=${encodeURIComponent(comm.name)}`}
              className="group relative p-6 rounded-2xl border overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 no-underline bg-[var(--color-bg-warm)] dark:bg-black"
              style={{
                borderColor: 'var(--color-border)',
                animation: `slideIn 0.5s ease-out ${i * 50}ms backwards`
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/10 transition-all duration-500" />

              {/* Community Logo */}
              {(() => {
                const logoFile = manifestFiles.find(f => f.includes(comm.id));
                return logoFile ? (
                  <img
                    src={`/media/${logoFile}`}
                    alt={`${comm.name} logo`}
                    className="absolute top-4 right-4 w-16 h-16 object-contain opacity-20 group-hover:opacity-100 transition-all duration-500 rounded-full bg-white/10 p-1"
                  />
                ) : (
                  <div
                    className="absolute top-4 right-4 text-3xl opacity-10 group-hover:opacity-30 transition-opacity"
                    style={{ animation: 'float 3s ease-in-out infinite' }}
                  >
                    🎵
                  </div>
                );
              })()}

              {/* Accent bar */}
              <div className="w-10 h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mb-5 group-hover:w-16 transition-all duration-500" />

              <h3
                className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors relative z-10"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--color-text)' }}
              >
                {comm.name}
              </h3>

              <p
                className="text-sm line-clamp-3 mb-6"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {comm.introductoryText || "Discover this community's unique musical heritage and explore their collection of archival materials."}
              </p>

              {/* Explore button */}
              <div className="flex items-center gap-2 text-amber-500 font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <span>Explore Collection</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>

              {/* Corner glow */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            </Link>
          ))}
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
