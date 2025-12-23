import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Item } from './types';
import { fetchItems, getMediaUrl } from './api';
import PathCard from './components/PathCard';

export default function HomePage() {
    const [searchParams] = useSearchParams();
    const pathFilter = searchParams.get('path') || '';
    const searchQuery = searchParams.get('search') || '';
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [pathTitle, setPathTitle] = useState('All Archives');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchItems(pathFilter, searchQuery);
                setItems(data);

                // Set title
                let title = 'All Archives';
                switch (pathFilter) {
                    case 'ArtMusic': title = 'Η μουσική του άστεως (Art Music)'; break;
                    case 'UrbanPopular': title = 'Η αστικολαϊκή μουσική (Urban Popular Music)'; break;
                    case 'RuralMusic': title = 'Η μουσική της υπαίθρου (Rural Music)'; break;
                    case 'SacredMusic': title = 'Η εκκλησιαστική μουσική (Sacred Music)'; break;
                }

                if (searchQuery) {
                    setPathTitle(`${title} - Search: ${searchQuery}`);
                } else {
                    setPathTitle(title);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [pathFilter, searchQuery]);

    const getCoverUrl = (item: Item) => {
        // Find all image bitstreams
        const imageBitstreams = item.bitstreams.filter(b =>
            (b.mimeType && b.mimeType.startsWith('image/')) ||
            b.name.match(/\.(jpg|jpeg|png|gif)$/i)
        );

        // Sort by size (descending) to get the largest/clearest image
        imageBitstreams.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));

        // Start with the largest image
        const image = imageBitstreams.length > 0 ? imageBitstreams[0] : null;

        if (image) return getMediaUrl(image.localFilePath);

        // 2. Fallback to PDF
        const pdf = item.bitstreams.find(b => b.mimeType === 'application/pdf' || b.name.endsWith('.pdf'));
        if (pdf) {
            // We return PDF url, receiver handles it (needs PDF.js or just show icon?)
            // Razor had PDF.js render canvas. For now, simplfy: show generic music icon or PDF icon if needed.
            // Or return { type: 'pdf', url: ... }
            return null; // Let's stick to easy image or fail for now
        }
        return null;
    };

    return (
        <>
            <div className="text-center mb-12">
                <h1 className="display-title text-5xl mb-4">Corfiot Music Archive</h1>
                <p className="text-xl text-white/75">Select a Music Path to explore the archive.</p>
            </div>

            {/* Music Paths Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <PathCard title="Art Music" subtitle="Η μουσική του άστεως" imgSrc="/img/art_music.png" pathFilter="ArtMusic" />
                <PathCard title="Urban Popular Music" subtitle="Η αστικολαϊκή μουσική" imgSrc="/img/urban_popular.png" pathFilter="UrbanPopular" />
                <PathCard title="Rural Music" subtitle="Η μουσική της υπαίθρου" imgSrc="/img/rural_music.png" pathFilter="RuralMusic" />
                <PathCard title="Sacred Music" subtitle="Η εκκλησιαστική μουσική" imgSrc="/img/sacred_music.png" pathFilter="SacredMusic" />
            </div>

            <div className="flex flex-wrap items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h2 className="text-3xl font-bold">{pathTitle}</h2>
                {pathFilter && <Link to="/" className="btn-liquid border border-white/20 hover:bg-white/10 text-white no-underline text-sm">Show All Archives</Link>}
            </div>

            <p className="text-white/60 mb-8">Found {items.length} items in this path.</p>

            <div className="container p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? <p className="col-span-full text-center text-white/50">Loading...</p> : items.map(item => {
                        const coverUrl = getCoverUrl(item);
                        return (
                            <div className="col-span-1" key={item.id}>
                                <Link to={`/item/${item.id}`} className="text-decoration-none text-white block h-full">
                                    <div className="card-glass h-full item-card flex flex-col">
                                        {coverUrl ? (
                                            <>
                                                <img src={coverUrl} className="w-full h-64 object-cover" alt={item.name} onError={(e) => { e.currentTarget.style.display = 'none'; console.error('Image load failed:', coverUrl); }} />
                                                <small className="hidden">{coverUrl}</small>
                                            </>
                                        ) : (
                                            <div className="w-full h-64 bg-white/5 flex items-center justify-center">
                                                <span className="text-white/20 text-6xl">🎵</span>
                                            </div>
                                        )}
                                        <div className="p-4 flex-1">
                                            <h6 className="font-bold text-lg mb-1 truncate" title={item.name}>{item.name}</h6>
                                            <p className="text-sm text-white/60 truncate">
                                                {item.metadata.find(m => m.field === 'dc.contributor.author')?.value || ''}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
