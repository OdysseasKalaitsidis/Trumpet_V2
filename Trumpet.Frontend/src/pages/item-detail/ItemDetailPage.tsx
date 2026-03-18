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

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!item) return <div className="container py-32 text-center text-zinc-400 font-bold uppercase tracking-widest">Item not found.</div>;

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

    const audioFiles = item.bitstreams.filter(b =>
        b.mimeType?.startsWith('audio/') ||
        ['.mp3', '.wav', '.ogg', '.m4a', '.flac'].some(ext => b.name.toLowerCase().endsWith(ext))
    );
    const videoFiles = item.bitstreams.filter(b =>
        b.mimeType?.startsWith('video/') ||
        ['.mp4', '.mov', '.webm', '.avi'].some(ext => b.name.toLowerCase().endsWith(ext))
    );

    const mainMedia = audioFiles.length > 0 ? audioFiles[0] : (videoFiles.length > 0 ? videoFiles[0] : null);
    const mainMediaType = audioFiles.length > 0 ? 'audio' : 'video';

    const openModal = (file: Bitstream) => setSelectedFile(file);
    const closeModal = () => setSelectedFile(null);

    return (
        <div className="animate-fade-in pb-32">
            {/* Ultra-Minimal Top Nav */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <Link to="/communities" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-orange-600 transition-colors inline-block">
                    ← {tr(language, 'item.backToArchive')}
                </Link>
            </div>

            <main className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                    
                    {/* Visual Media Column (7/12) */}
                    <div className="lg:col-span-7 space-y-16">
                        <div className="glass-card rounded-[3.5rem] overflow-hidden group shadow-sm">
                            {coverUrl ? (
                                <img 
                                    src={coverUrl} 
                                    className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-[2s] group-hover:scale-105" 
                                    alt="Cover" 
                                />
                            ) : (
                                <div className="w-full aspect-[4/3] flex flex-col items-center justify-center opacity-10">
                                    <span className="text-9xl mb-4 animate-float">📄</span>
                                    <p className="font-black tracking-[0.4em] uppercase text-[10px]">{tr(language, 'item.archivalAsset')}</p>
                                </div>
                            )}
                        </div>

                        {mainMedia && (
                            <div className="p-12 glass-card rounded-[3.5rem]">
                                <div className="flex items-center gap-8 mb-12">
                                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-2xl shadow-xl">
                                        {mainMediaType === 'audio' ? '🔊' : '🎬'}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold dark:text-white uppercase tracking-tighter">{tr(language, 'item.mediaPlayback')}</h3>
                                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1">{mainMedia.name}</p>
                                    </div>
                                </div>

                                {mainMediaType === 'audio' ? (
                                    <audio controls className="w-full h-12">
                                        <source src={getMediaUrl(mainMedia.localFilePath)} type={(mainMedia.mimeType && mainMedia.mimeType !== 'Unknown') ? mainMedia.mimeType : 'audio/mpeg'} />
                                    </audio>
                                ) : (
                                    <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-black ring-1 ring-white/10 shadow-3xl">
                                        <video controls className="w-full h-full">
                                            <source src={getMediaUrl(mainMedia.localFilePath)} type={(mainMedia.mimeType && mainMedia.mimeType !== 'Unknown') ? mainMedia.mimeType : 'video/mp4'} />
                                        </video>
                                    </div>
                                )}
                            </div>
                        )}

                        {hasLocation && (
                            <div className="rounded-[3.5rem] overflow-hidden h-[500px] glass-card relative z-0">
                                <LeafletMap latitude={latitude!} longitude={longitude!} popupText={item.name} />
                            </div>
                        )}
                    </div>

                    {/* Information Column (5/12) */}
                    <div className="lg:col-span-5 space-y-20">
                        <section>
                            <div className="inline-flex px-4 py-1.5 rounded-full bg-orange-600/10 text-[10px] font-black tracking-widest text-orange-600 mb-10 uppercase border border-orange-600/20">
                                {getMetadata('dc.type') || 'Musical Item'}
                            </div>
                            <h1 
                                className="text-6xl md:text-8xl font-bold text-zinc-900 dark:text-white leading-[1] tracking-tighter mb-10"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {getLocalizedTitle(item, language)}
                            </h1>
                            <p className="text-2xl text-zinc-400 font-bold uppercase tracking-tight">
                                {getContributors() || tr(language, 'item.unknownArchivist')}
                            </p>

                            <div className="flex flex-wrap gap-3 mt-12">
                                {item.metadata.filter(m => m.field === 'trumpet.tag').map((tag, idx) => (
                                    <span key={idx} className="px-5 py-2 rounded-full glass-card text-[10px] font-black text-zinc-400 uppercase tracking-widest border border-white/40">
                                        {tag.value}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-10 pt-16 border-t border-zinc-100 dark:border-zinc-900">
                            <h4 className="text-[10px] font-black tracking-[0.3em] text-zinc-300 uppercase leading-none">{tr(language, 'item.metadataOverview')}</h4>
                            
                            <div className="space-y-10">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Description</span>
                                    <p className="text-xl text-zinc-500 font-medium leading-relaxed italic">
                                        {getLocalizedDescription(item, language) || tr(language, 'item.noDescription')}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Region</span>
                                        <span className="text-xl font-bold dark:text-white uppercase tracking-tighter">{getMetadata('dc.musicsubpath') || '-'}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Issued</span>
                                        <span className="text-xl font-bold dark:text-white uppercase tracking-tighter">{getMetadata('dc.date.issued') || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <h4 className="text-[10px] font-black tracking-[0.3em] text-zinc-300 uppercase leading-none">Archival files</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {item.bitstreams.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => openModal(b)}
                                        className="w-full flex items-center justify-between p-8 rounded-[2.5rem] glass-card text-left group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">📄</div>
                                            <div>
                                                <span className="font-bold text-lg text-zinc-900 dark:text-white block tracking-tighter uppercase">{b.name}</span>
                                                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{b.mimeType}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                                            Open
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <section className="mt-40">
                        <div className="flex items-center gap-4 mb-20">
                            <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-900" />
                            <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-zinc-300">
                                Discover More
                            </h2>
                            <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-900" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                            {recommendations.map(rec => (
                                <Link
                                    key={rec.id}
                                    to={`/item/${rec.id}`}
                                    className="group glass-card rounded-[3rem] overflow-hidden no-underline flex flex-col"
                                >
                                    <div className="aspect-square bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center relative overflow-hidden">
                                        <span className="text-4xl opacity-10 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700">📜</span>
                                    </div>
                                    <div className="p-10">
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-2 uppercase tracking-tighter leading-tight group-hover:text-orange-600 transition-colors">
                                            {rec.name}
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            {rec.metadata.find(m => m.field === "dc.contributor.author")?.value || 'Archival Item'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Glass Modal */}
            {selectedFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-3xl p-8 md:p-20 transition-all animate-fade-in" onClick={closeModal}>
                    <div className="w-full max-w-7xl h-full glass-card rounded-[4rem] shadow-4xl overflow-hidden relative flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="px-16 py-12 flex justify-between items-center border-b border-white/20">
                            <div>
                                <h5 className="font-bold text-3xl tracking-tighter dark:text-white uppercase">{selectedFile.name}</h5>
                                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1">{selectedFile.mimeType}</p>
                            </div>
                            <button
                                type="button"
                                className="w-16 h-16 rounded-full bg-white/20 dark:bg-zinc-800/20 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all text-3xl"
                                onClick={closeModal}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex-1 bg-white/10">
                            <iframe src={getMediaUrl(selectedFile.localFilePath)} className="w-full h-full border-none" title="Archive Viewer"></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
