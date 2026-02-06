import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

interface Community {
  id: string;
  name: string;
  introductoryText: string;
}

export default function CommunityCarousel() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [manifestFiles, setManifestFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fetch manifest
    fetch('/media/manifest.json')
      .then(res => res.json())
      .then(data => setManifestFiles(data.files || []))
      .catch(err => console.error('Failed to load media manifest:', err));

    fetch(`${API_BASE_URL}/api/communities`)
      .then(res => res.json())
      .then(data => {
        setCommunities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-rotate every 4 seconds with transition effect
  useEffect(() => {
    if (communities.length === 0 || isHovered) {
      setProgress(0);
      return;
    }

    // Progress bar animation (updates every 50ms)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + (100 / 80); // 4000ms / 50ms = 80 steps
      });
    }, 50);

    const rotateInterval = setInterval(() => {
      setIsTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % communities.length);
        setIsTransitioning(false);
      }, 300);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(rotateInterval);
    };
  }, [communities.length, isHovered]);

  if (loading) {
    return (
      <div className="py-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4">Loading communities...</p>
      </div>
    );
  }

  // Get 3 communities for display (with loop)
  const getVisibleCommunities = () => {
    const visible: Community[] = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % communities.length;
      visible.push(communities[index]);
    }
    return visible;
  };

  const visibleCommunities = communities.length >= 3 ? getVisibleCommunities() : communities;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      {/* Animated background decoration */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="section-title flex items-center gap-3">
            Communities
            <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </h2>
          <p className="section-subtitle">Organizations preserving Corfiot music</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Navigation arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(prev => prev === 0 ? communities.length - 1 : prev - 1);
                  setIsTransitioning(false);
                }, 200);
              }}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:scale-110"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              title="Previous"
            >
              ←
            </button>
            <button
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(prev => (prev + 1) % communities.length);
                  setIsTransitioning(false);
                }, 200);
              }}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:scale-110"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              title="Next"
            >
              →
            </button>
          </div>

          {/* View All button */}
          <Link
            to="/communities"
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(to right, #f59e0b, #ea580c)',
              color: 'white'
            }}
          >
            View All
          </Link>

          {/* Progress dots */}
          <div className="hidden md:flex gap-2">
            {communities.slice(0, Math.min(6, communities.length)).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(i);
                    setIsTransitioning(false);
                  }, 200);
                }}
                className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex % communities.length
                  ? 'w-8 bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-amber-300'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <div className="relative overflow-hidden">
        <div 
          className="flex gap-6 transition-transform duration-700 ease-out py-4"
          style={{ transform: `translateX(-${scrollPos}px)` }}
        >
          {communities.map((c) => (
            <Link
              key={c.id}
              to={`/browse?communityId=${c.id}`}
              className="flex-shrink-0 w-80 p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
=======
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
        {visibleCommunities.map((c, i) => (
          <Link
            key={`${c.id}-${currentIndex}-${i}`}
            to={`/items?communityId=${c.id}&communityName=${encodeURIComponent(c.name)}`}
            className="group relative p-6 rounded-2xl border bg-white dark:bg-black no-underline overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            style={{
              borderColor: 'var(--color-border)',
              animation: `slideIn 0.5s ease-out ${i * 100}ms backwards`
            }}
          >
            {/* Animated gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-orange-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/10 transition-all duration-700" />

            {/* Animated accent bar */}
            <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mb-5 group-hover:w-20 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>

            {/* Floating decorative element */}
            <div
              className="absolute top-4 right-4 text-4xl opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500"
              style={{ animation: 'float 3s ease-in-out infinite', animationDelay: `${i * 200}ms` }}
>>>>>>> 5dd90944b3a00ebaa33fd1a726e1e8cb20bf0166
            >
              🎵
            </div>

            <div className="flex items-center gap-4 mb-2 relative z-10">
              {(() => {
                const logoFile = manifestFiles.find(f => f.includes(c.id));
                return (
                  <img
                    src={logoFile ? `/media/${logoFile}` : `/media/${c.id}.png`}
                    alt={`${c.name} logo`}
                    className="w-12 h-12 object-contain rounded-full bg-white/10 p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                );
              })()}
              <h3
                className="text-lg font-bold line-clamp-2 group-hover:text-amber-600 transition-colors"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: 'var(--color-text)'
                }}
              >
                {c.name}
              </h3>
            </div>
            <p
              className="text-sm line-clamp-2 mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {c.introductoryText || "Explore this community's musical archive."}
            </p>

            {/* Animated explore button */}
            <div className="flex items-center gap-2 text-amber-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <span className="text-sm font-semibold">Explore</span>
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>

            {/* Corner glow effect */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500" />
          </Link>
        ))}
      </div>

      {/* Progress bar showing time until next rotation */}
      <div className="mt-6">
        <div
          className="h-0.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              width: isHovered ? '0%' : `${progress}%`,
              background: 'linear-gradient(to right, #f59e0b, #ea580c)'
            }}
          />
        </div>

      </div>

      {/* CSS Keyframes (injected via style tag) */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}



