import { useSearchParams, Link } from "react-router-dom";
import { useItems } from "../../hooks/useItems";
import { getPageTitle, getPageDescription } from "./api";
import { getMediaUrl } from "../../api/config";

import { useState, useEffect } from 'react';

export default function ItemsPage() {
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get("communityId") || "";
  const path = searchParams.get("path") || "";
  const search = searchParams.get("search") || "";
  const pathName = searchParams.get("pathName") || "Archive";
  const communityName = searchParams.get("communityName") || "";

  const { items, loading } = useItems(path, search, communityId);
  const [manifestFiles, setManifestFiles] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<string | null>(null);

  useEffect(() => {
    // Fetch manifest
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
  const pageDescription = getPageDescription({ search, communityName, pathName });

  return (
    <div className="animate-fade-in relative">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6 relative z-10" style={{ color: 'var(--color-text-muted)' }}>
        <Link to="/" className="hover:underline" style={{ color: 'var(--color-accent)' }}>Home</Link>
        <span>/</span>
        {search ? (
          <span>Search Results</span>
        ) : (
          <span>{communityName || pathName}</span>
        )}
      </nav>

      {/* Header */}
      <div className="mb-12 relative z-10">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--color-text)' }}
        >
          {logoFile && (
            <img
              src={`/media/${logoFile}`}
              alt={`${communityName} logo`}
              className="w-16 h-16 object-contain rounded-full bg-white/10 p-1"
            />
          )}
          {pageTitle}
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          {pageDescription}
        </p>

        {/* Results count */}
        {!loading && (
          <div className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{items.length}</span> items found
          </div>
        )}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className="h-64 rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--color-bg-muted)' }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center" style={{ color: 'var(--color-text-muted)' }}>
          <div className="text-6xl mb-4 opacity-30">🎵</div>
          <p className="text-xl mb-2">No items found</p>
          <p className="text-sm">
            {search
              ? `Try a different search term or browse our collections.`
              : `This collection appears to be empty.`}
          </p>
          <Link
            to="/"
            className="inline-block mt-6 px-6 py-2 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <Link
              key={item.id}
              to={`/item/${item.id}`}
              className="group relative rounded-2xl border overflow-hidden no-underline transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg-warm)',
                animation: `slideIn 0.4s ease-out ${i * 30}ms backwards`
              }}
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/10 transition-all duration-500" />

              {/* Image with Cover Logic */}
              <div
                className="w-full aspect-square flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                {(() => {
                  const imageBitstreams = item.bitstreams?.filter(b =>
                    (b.mimeType && b.mimeType.startsWith('image/')) ||
                    b.name.match(/\.(jpg|jpeg|png|gif)$/i)
                  ) || [];

                  // Sort by size desc (prefer higher quality)
                  imageBitstreams.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
                  const cover = imageBitstreams.length > 0 ? imageBitstreams[0] : null;
                  const coverUrl = cover ? getMediaUrl(cover.localFilePath) : null;

                  if (coverUrl) {
                    return (
                      <img
                        src={coverUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    );
                  }

                  return (
                    <div className="relative">
                      <svg
                        className="w-14 h-14 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                      <div className="absolute inset-0 rounded-full border-2 border-amber-500/0 group-hover:border-amber-500/30 scale-100 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    </div>
                  );
                })()}
              </div>

              {/* Content */}
              <div className="p-4 relative z-10">
                <h3
                  className="font-semibold mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors"
                  style={{ color: 'var(--color-text)' }}
                >
                  {item.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {item.metadata.find(m => m.field === "dc.contributor.author")?.value || "Unknown"}
                </p>

                {/* View arrow */}
                <div className="mt-2 flex items-center gap-1 text-amber-500 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  <span>View</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Corner glow */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
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
      `}</style>
    </div>
  );
}
