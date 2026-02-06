import { Link } from 'react-router-dom';
import MusicPathsGrid from '../../components/MusicPathsGrid';

export default function MusicPathsPage() {
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
                    Corfiot Music Paths
                </h1>
                <p className="text-lg max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>
                    Explore the four distinct yet interconnected traditions that make up the rich tapestry of Corfu's musical heritage.
                </p>
            </div>

            <MusicPathsGrid />
        </div>
    );
}
