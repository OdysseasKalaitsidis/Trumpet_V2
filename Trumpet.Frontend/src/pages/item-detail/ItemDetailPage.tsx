import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Bitstream, Item } from '../../models/domain';
import { getMediaUrl } from '../../api/config';
import { useItem } from '../../hooks/useItem';
import { fetchRecommendations } from './api';
import { useLanguage } from '../../hooks/useLanguage';
import { tr } from '../../i18n/translations';
import { getLocalizedTitle, getLocalizedDescription, getLocalizedContributor, getLocalizedMetadata } from '../../i18n/localize';

import LeafletMap from '../../components/LeafletMap';

export default function ItemDetail() {
    const { id } = useParams<{ id: string }>();
    const { item, loading } = useItem(id);
    const { language } = useLanguage();
    const [selectedFile, setSelectedFile] = useState<Bitstream | null>(null);
    const [recommendations, setRecommendations] = useState<Item[]>([]);
    const [showMetadata, setShowMetadata] = useState(false);

    useEffect(() => {
        if (id) {
            fetchRecommendations(id).then(setRecommendations).catch(console.error);
        }
    }, [id]);

    if (loading) return <div className="container mt-5">Loading...</div>;
    if (!item) return <div className="container mt-5">Item not found.</div>;

    // Shorthand helpers using shared localize utilities
    const getMetadata = (field: string) => getLocalizedMetadata(item.metadata, field, language);
    const getContributors = () => getLocalizedContributor(item, language);

    const latStr = item.metadata.find(m => m.field === 'dc.coverage.spatiallatitude')?.value;
    const lonStr = item.metadata.find(m => m.field === 'dc.coverage.spatiallongitude')?.value;
    const latitude = latStr ? parseFloat(latStr) : null;
    const longitude = lonStr ? parseFloat(lonStr) : null;
    const hasLocation = latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);

    const imageBitstreams = item.bitstreams.filter(b =>
        (b.mimeType && b.mimeType.startsWith('image/')) ||
        b.name.match(/\.(jpg|jpeg|png|gif)$/i)
    );
    imageBitstreams.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
    const imageBitstream = imageBitstreams.length > 0 ? imageBitstreams[0] : undefined;
    const coverUrl = imageBitstream ? getMediaUrl(imageBitstream.localFilePath) : null;

    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi'];

    const audioFiles = item.bitstreams.filter(b =>
        b.mimeType?.startsWith('audio/') ||
        audioExtensions.some(ext => b.name.toLowerCase().endsWith(ext))
    );
    const videoFiles = item.bitstreams.filter(b =>
        b.mimeType?.startsWith('video/') ||
        videoExtensions.some(ext => b.name.toLowerCase().endsWith(ext))
    );

    const mainMedia = audioFiles.length > 0 ? audioFiles[0] : (videoFiles.length > 0 ? videoFiles[0] : null);
    const mainMediaType = audioFiles.length > 0 ? 'audio' : 'video';

    const openModal = (file: Bitstream) => setSelectedFile(file);
    const closeModal = () => setSelectedFile(null);

    return (
        <div className="py-12 animate-fade-in max-w-6xl mx-auto">
            <div className="mb-12">
                <Link to="/" className="text-theme-text-muted hover:text-theme-text transition-colors font-medium flex items-center gap-2">
                    <span className="text-xl">←</span> {tr(language, 'item.backToArchive')}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Column 1: Media & Map */}
                <div className="space-y-12">
                    <div className="relative group rounded-[2.5rem] overflow-hidden bg-theme-surface border border-theme-border shadow-3xl">
                        {coverUrl ? (
                            <img src={coverUrl} className="w-full h-auto aspect-square object-cover transition-transform duration-1000 group-hover:scale-105" alt="Cover" />
                        ) : (
                            <div className="w-full h-auto aspect-square bg-gradient-to-br from-white/10 to-transparent flex flex-col items-center justify-center">
                                <span className="text-8xl mb-4 group-hover:scale-110 transition-transform">🎵</span>
                                <p className="text-theme-text-muted font-medium">{tr(language, 'item.archivalAsset')}</p>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>

                    {hasLocation && (
                        <div className="rounded-[2.5rem] overflow-hidden h-80 border border-theme-border shadow-2xl relative z-0">
                            <LeafletMap latitude={latitude!} longitude={longitude!} popupText={item.name} />
                        </div>
                    )}
                </div>

                {/* Column 2: Information */}
                <div>
                    <div className="mb-12">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-theme-surface border border-theme-border text-xs font-bold tracking-widest text-theme-text-muted mb-6 uppercase">
                            {getMetadata('dc.type') || 'Musical Item'}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-theme-text leading-tight tracking-tighter mb-6">
                            {getLocalizedTitle(item, language)}
                        </h1>
                        <p className="text-2xl text-theme-text-muted font-medium leading-relaxed">
                            {getContributors() || tr(language, 'item.unknownArchivist')}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-6">
                            {item.metadata.filter(m => m.field === 'trumpet.tag').map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs font-bold text-white/80 uppercase tracking-wider">
                                    {tag.value}
                                </span>
                            ))}
                        </div>
                    </div>

                    {mainMedia && (
                        <div className="p-8 rounded-[2rem] bg-theme-surface backdrop-blur-2xl border border-theme-border mb-12 shadow-2xl group">
                            <div className="flex items-center gap-6 mb-8 text-theme-text-muted">
                                <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center text-xl shadow-lg ring-4 ring-theme-border">
                                    {mainMediaType === 'audio' ? '🔊' : '🎬'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-theme-text">{tr(language, 'item.mediaPlayback')}</h3>
                                    <p className="text-theme-text-muted text-sm font-medium truncate max-w-xs">{mainMedia.name}</p>
                                </div>
                            </div>

                            {mainMediaType === 'audio' ? (
                                <audio controls className="w-full opacity-90 hover:opacity-100 transition-opacity">
                                    <source src={getMediaUrl(mainMedia.localFilePath)} type={(mainMedia.mimeType && mainMedia.mimeType !== 'Unknown') ? mainMedia.mimeType : 'audio/mpeg'} />
                                </audio>
                            ) : (
                                <div className="aspect-video rounded-3xl overflow-hidden bg-black/40 border border-theme-border shadow-inner">
                                    <video controls className="w-full h-full">
                                        <source src={getMediaUrl(mainMedia.localFilePath)} type={(mainMedia.mimeType && mainMedia.mimeType !== 'Unknown') ? mainMedia.mimeType : 'video/mp4'} />
                                    </video>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-bold tracking-widest text-theme-text-light uppercase mb-4">{tr(language, 'item.metadataOverview')}</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-start py-4 border-b border-theme-border">
                                    <span className="text-theme-text-muted font-medium">{tr(language, 'item.musicPath')}</span>
                                    <span className="text-theme-text font-bold">{getMetadata('dc.musicsubpath') || '-'}</span>
                                </div>
                                <div className="flex justify-between items-start py-4 border-b border-theme-border">
                                    <span className="text-theme-text-muted font-medium">{tr(language, 'item.date')}</span>
                                    <span className="text-theme-text font-bold">{getMetadata('dc.date.issued') || '-'}</span>
                                </div>
                                <div className="flex flex-col gap-2 py-4">
                                    <span className="text-theme-text-muted font-medium">{tr(language, 'item.description')}</span>
                                    <span className="text-theme-text text-sm leading-relaxed font-medium">
                                        {getLocalizedDescription(item, language) || tr(language, 'item.noDescription')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold tracking-widest text-theme-text-light uppercase mb-6">{tr(language, 'item.archiveFiles')}</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {item.bitstreams.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => openModal(b)}
                                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-theme-surface border border-theme-border hover:bg-theme-bg-muted hover:border-theme-border transition-all duration-300 group shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-theme-bg flex items-center justify-center text-lg group-hover:scale-110 transition-transform">📄</div>
                                            <div className="text-left">
                                                <span className="font-bold text-theme-text block truncate max-w-[200px]">{b.name}</span>
                                                <span className="text-xs text-theme-text-light font-bold uppercase tracking-wider">{b.mimeType}</span>
                                            </div>
                                        </div>
                                        <div className="px-5 py-2 rounded-xl bg-theme-text text-theme-bg font-extrabold text-xs tracking-tighter hover:scale-105 transition-transform">
                                            VIEW
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="mt-32 border-t border-white/5 pt-16">
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-12 flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">✨</span>
                        {tr(language, 'item.youMightAlsoLike')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recommendations.map(rec => (
                            <Link
                                key={rec.id}
                                to={`/item/${rec.id}`}
                                className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                            >
                                <div className="aspect-[4/5] bg-white/5 flex items-center justify-center relative overflow-hidden">
                                    <span className="text-4xl group-hover:scale-110 transition-transform duration-700">🎵</span>
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-end">
                                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-tight">{rec.name}</h3>
                                    <p className="text-white/40 text-xs font-medium">
                                        {rec.metadata.find(m => m.field === "dc.contributor.author" && m.language?.startsWith(language))?.value
                                            || rec.metadata.find(m => m.field === "dc.contributor.author")?.value
                                            || tr(language, 'item.unknownArchive')}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Extended Metadata Table */}
            <div className="mt-32 pt-16 border-t border-theme-border">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-black text-theme-text tracking-tighter flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center text-sm">📊</span>
                        {tr(language, 'item.extendedRecord')}
                    </h2>
                    <button
                        onClick={() => setShowMetadata(!showMetadata)}
                        className="px-6 py-3 rounded-xl bg-theme-surface border border-theme-border text-theme-text font-bold text-sm tracking-wide hover:bg-theme-bg-muted transition-colors flex items-center gap-3"
                    >
                        {showMetadata ? tr(language, 'item.hideMetadata') : tr(language, 'item.viewFullRecord')}
                        <span className={`transform transition-transform duration-300 ${showMetadata ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                </div>

                {showMetadata && (
                    <div className="rounded-[2.5rem] overflow-hidden bg-theme-surface border border-theme-border backdrop-blur-3xl shadow-3xl animate-fade-in">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-theme-border">
                                    <th className="p-8 text-xs font-black tracking-widest text-theme-text-light uppercase">{tr(language, 'item.archivalField')}</th>
                                    <th className="p-8 text-xs font-black tracking-widest text-theme-text-light uppercase">{tr(language, 'item.recordValue')}</th>
                                    <th className="p-8 text-xs font-black tracking-widest text-theme-text-light uppercase w-32">{tr(language, 'item.index')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-theme-border">
                                {item.metadata.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-theme-bg-muted transition-colors group">
                                        <td className="p-8 font-mono text-xs text-theme-text-light group-hover:text-theme-text-muted transition-colors uppercase tracking-tight">{m.field}</td>
                                        <td className="p-8 text-sm font-bold text-theme-text leading-relaxed max-w-2xl">{m.value}</td>
                                        <td className="p-8 text-xs font-black text-theme-text-light">{m.language || 'LOC'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-2 md:p-8" onClick={closeModal}>
                    <div className="w-full max-w-7xl h-[90vh] bg-white rounded-[3rem] shadow-3xl overflow-hidden relative flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center text-gray-900 bg-white/80 backdrop-blur-md sticky top-0">
                            <div>
                                <h5 className="font-black text-2xl tracking-tighter truncate max-w-md">{selectedFile.name}</h5>
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{selectedFile.mimeType}</p>
                            </div>
                            <button
                                type="button"
                                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-black text-2xl hover:bg-black hover:text-white transition-all shadow-sm"
                                onClick={closeModal}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-50 relative">
                            <iframe src={getMediaUrl(selectedFile.localFilePath)} className="w-full h-full border-none shadow-inner" title="Archival Resource Viewer"></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
