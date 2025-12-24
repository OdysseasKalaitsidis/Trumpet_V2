import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Item } from './types';
import { fetchItems, getMediaUrl } from './api';
import PathCard from './components/PathCard';

export default function HomePage() {
    const [searchParams] = useSearchParams();
    const pathFilter = searchParams.get('path') || '';
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [pathTitle, setPathTitle] = useState('All Archives');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchItems(pathFilter);
                setItems(data);

                // Set title
                switch (pathFilter) {
                    case 'ArtMusic': setPathTitle('Η μουσική του άστεως (Art Music)'); break;
                    case 'UrbanPopular': setPathTitle('Η αστικολαϊκή μουσική (Urban Popular Music)'); break;
                    case 'RuralMusic': setPathTitle('Η μουσική της υπαίθρου (Rural Music)'); break;
                    case 'SacredMusic': setPathTitle('Η εκκλησιαστική μουσική (Sacred Music)'); break;
                    default: setPathTitle('All Archives');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [pathFilter]);

    const getCoverUrl = (item: Item) => {
        // Same logic as Index.cshtml
        // 1. Check for Image bitstream (usually first one or by assumption)
        // In Razor: ImageHelper.GetBestCoverImage(item)
        // We'll mimic strict logic: find bitstream with mime starting 'image/' or name ending .jpg/png

        // Let's use name extension or mimetype if available
        const image = item.bitstreams.find(b =>
            (b.mimeType && b.mimeType.startsWith('image/')) ||
            b.name.match(/\.(jpg|jpeg|png|gif)$/i)
        );

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
            <div className="text-center mb-5">
                <h1 className="display-4">Corfiot Music Archive</h1>
                <p className="lead">Select a Music Path to explore the archive.</p>
            </div>

            {/* Music Paths Navigation */}
            <div className="row mb-5 justify-content-center">
                <PathCard title="Art Music" subtitle="Η μουσική του άστεως" imgSrc="/img/art_music.png" pathFilter="ArtMusic" />
                <PathCard title="Urban Popular Music" subtitle="Η αστικολαϊκή μουσική" imgSrc="/img/urban_popular.png" pathFilter="UrbanPopular" />
                <PathCard title="Rural Music" subtitle="Η μουσική της υπαίθρου" imgSrc="/img/rural_music.png" pathFilter="RuralMusic" />
                <PathCard title="Sacred Music" subtitle="Η εκκλησιαστική μουσική" imgSrc="/img/sacred_music.png" pathFilter="SacredMusic" />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <h2>{pathTitle}</h2>
                {pathFilter && <Link to="/" className="btn btn-outline-secondary">Show All Archives</Link>}
            </div>

            <p className="text-muted mb-4">Found {items.length} items in this path.</p>

            <div className="container">
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                    {loading ? <p>Loading...</p> : items.map(item => {
                        const coverUrl = getCoverUrl(item);
                        return (
                            <div className="col" key={item.id}>
                                <Link to={`/item/${item.id}`} className="text-decoration-none text-dark">
                                    <div className="card h-100 shadow-sm border-0 item-card">
                                        {coverUrl ? (
                                            <>
                                                <img src={coverUrl} className="card-img-top" alt={item.name} style={{ height: '250px', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; console.error('Image load failed:', coverUrl); }} />
                                                <small className="d-none">{coverUrl}</small>
                                            </>
                                        ) : (
                                            <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                                                <span className="text-muted fs-1">🎵</span>
                                            </div>
                                        )}
                                        <div className="card-body">
                                            <h6 className="card-title text-truncate" title={item.name}>{item.name}</h6>
                                            <p className="card-text small text-muted text-truncate">
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
