import { Link } from 'react-router-dom';
import MusicPathsGrid from '../../components/MusicPathsGrid';
import { useLanguage } from '../../hooks/useLanguage';
import { tr } from '../../i18n/translations';

export default function MusicPathsPage() {
    const { language } = useLanguage();

    return (
        <div className="animate-fade-in py-16 px-6 max-w-7xl mx-auto min-h-[80vh]">
            <header className="mb-24 px-6 md:px-0">
                <nav className="mb-10">
                    <Link
                        to="/"
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-orange-600 transition-colors"
                    >
                        {tr(language, 'communities.backToHome')}
                    </Link>
                </nav>
                <div className="max-w-3xl">
                    <h1 
                        className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter text-zinc-900 dark:text-white"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Music Paths
                    </h1>
                    <p className="text-xl text-zinc-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                        Explore the four traditions that make up the rich tapestry of Corfu's musical heritage.
                    </p>
                </div>
            </header>

            <div className="relative group">
                <MusicPathsGrid />
            </div>
        </div>
    );
}
