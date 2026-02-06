import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Bitstream, Item } from '../../models/domain';
import { getMediaUrl } from '../../api/config';
import { useItem } from '../../hooks/useItem';
import { fetchRecommendations } from '../home/api';

import LeafletMap from '../../components/LeafletMap';

export default function ItemDetail() {
    const { id } = useParams<{ id: string }>();
    const { item, loading } = useItem(id);
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

    const getMetadata = (field: string, langPrefix: string = 'en') => {
        const englishValues = item.metadata
            .filter(m => m.field === field && m.language?.startsWith(langPrefix))
            .map(m => m.value);

        if (englishValues.length > 0) return englishValues.join(', ');

        return item.metadata.filter(m => m.field === field).map(m => m.value).join(', ');
    };

    const getContributors = () => {
        const fields = ['dc.contributor.author', 'dc.creator', 'dc.contributor.other'];
        const allMatches = item.metadata.filter(m => fields.includes(m.field));

        const englishMatches = allMatches.filter(m => m.language?.startsWith('en'));
        if (englishMatches.length > 0) {
            return Array.from(new Set(englishMatches.map(m => m.value))).join('; ');
        }

        return Array.from(new Set(allMatches.map(m => m.value))).join('; ');
    };

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

    const openModal = (file: Bitstream) => {
        setSelectedFile(file);
    };
    const closeModal = () => {
        setSelectedFile(null);
    };

    return (
        <div className="py-12 animate-fade-in max-w-6xl mx-auto">
            <div className="mb-12">
                <Link to="/" className="text-white/40 hover:text-white transition-colors font-medium flex items-center gap-2">
                    <span className="text-xl">←</span> Back to Archive
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Column 1: Media & Map */}
                <div className="space-y-12">
                    <div className="relative group rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 shadow-3xl">
                        {coverUrl ? (
                            <img src={coverUrl} className="w-full h-auto aspect-square object-cover transition-transform duration-1000 group-hover:scale-105" alt="Cover" />
                        ) : (
                            <div className="w-full h-auto aspect-square bg-gradient-to-br from-white/10 to-transparent flex flex-col items-center justify-center">
                                <span className="text-8xl mb-4 group-hover:scale-110 transition-transform">🎵</span>
                                <p className="text-white/30 font-medium">Archival Asset</p>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>

                    {hasLocation && (
                        <div className="rounded-[2.5rem] overflow-hidden h-80 border border-white/10 shadow-2xl relative z-0">
                            <LeafletMap latitude={latitude!} longitude={longitude!} popupText={item.name} />
                        </div>
                    )}
                </div>

                {/* Column 2: Information */}
                <div>
                    <div className="mb-12">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest text-white/70 mb-6 uppercase">
                            {getMetadata('dc.type') || 'Musical Item'}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-6">
                            {item.name}
                        </h1>
                        <p className="text-2xl text-white/50 font-medium leading-relaxed">
                            {getContributors() || 'Unknown Archivist'}
                        </p>
                        
                        {/* Tags Display */}
                        <div className="flex flex-wrap gap-2 mt-6">
                            {item.metadata.filter(m => m.field === 'trumpet.tag').map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs font-bold text-white/80 uppercase tracking-wider">
                                    {tag.value}
                                </span>
                            ))}
                        </div>
                    </div>

                    {mainMedia && (
                        <div className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 mb-12 shadow-2xl group">
                            <div className="flex items-center gap-6 mb-8 text-white/80">
                                <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center text-xl shadow-lg ring-4 ring-white/10">
                                    {mainMediaType === 'audio' ? '🔊' : '🎬'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">Media Playback</h3>
                                    <p className="text-white/40 text-sm font-medium truncate max-w-xs">{mainMedia.name}</p>
                                </div>
                            </div>

                            {mainMediaType === 'audio' ? (
                                <audio controls className="w-full opacity-90 hover:opacity-100 transition-opacity">
                                    <source src={getMediaUrl(mainMedia.localFilePath)} type={(mainMedia.mimeType && mainMedia.mimeType !== 'Unknown') ? mainMedia.mimeType : 'audio/mpeg'} />
                                </audio>
                            ) : (
                                <div className="aspect-video rounded-3xl overflow-hidden bg-black/40 border border-white/5 shadow-inner">
                                    <video controls className="w-full h-full">
                                        <source src={getMediaUrl(mainMedia.localFilePath)} type={(mainMedia.mimeType && mainMedia.mimeType !== 'Unknown') ? mainMedia.mimeType : 'video/mp4'} />
                                    </video>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-bold tracking-widest text-white/30 uppercase mb-4">Metadata Overview</h4>
                            <div className="space-y-4">
                               <div className="flex justify-between items-start py-4 border-b border-white/5">
                                   <span className="text-white/40 font-medium">Music Path</span>
                                   <span className="text-white font-bold">{getMetadata('dc.musicsubpath') || '-'}</span>
                               </div>
                               <div className="flex justify-between items-start py-4 border-b border-white/5">
                                   <span className="text-white/40 font-medium">Date</span>
                                   <span className="text-white font-bold">{getMetadata('dc.date.issued') || '-'}</span>
                               </div>
                               <div className="flex flex-col gap-2 py-4">
                                   <span className="text-white/40 font-medium">Description</span>
                                   <span className="text-white/70 text-sm leading-relaxed font-medium">{getMetadata('dc.description') || 'No description available for this archival item.'}</span>
                               </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold tracking-widest text-white/30 uppercase mb-6">Archive Files</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {item.bitstreams.map(b => (
                                    <button 
                                        key={b.id} 
                                        onClick={() => openModal(b)}
                                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">📄</div>
                                            <div className="text-left">
                                                <span className="font-bold text-white block truncate max-w-[200px]">{b.name}</span>
                                                <span className="text-xs text-white/30 font-bold uppercase tracking-wider">{b.mimeType}</span>
                                            </div>
                                        </div>
                                        <div className="px-5 py-2 rounded-xl bg-white text-black font-extrabold text-xs tracking-tighter hover:scale-105 transition-transform">
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
                        You Might Also Like
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
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                                        {rec.name}
                                    </h3>
                                    <p className="text-white/40 text-xs font-medium">
                                        {rec.metadata.find(m => m.field === "dc.contributor.author")?.value || "Unknown Archive"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Expanded Metadata Table */}
            <div className="mt-32 pt-16 border-t border-white/5">
                <div className="flex items-center justify-between mb-12">
                     <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">📊</span>
                        Extended Archival Record
                    </h2>
                    <button 
                        onClick={() => setShowMetadata(!showMetadata)}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm tracking-wide hover:bg-white/10 transition-colors flex items-center gap-3"
                    >
                        {showMetadata ? 'Hide Metadata' : 'View Full Record'}
                        <span className={`transform transition-transform duration-300 ${showMetadata ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                </div>
                
                {showMetadata && (
                    <div className="rounded-[2.5rem] overflow-hidden bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-3xl animate-fade-in">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="p-8 text-xs font-black tracking-widest text-white/30 uppercase">Archival Field</th>
                                    <th className="p-8 text-xs font-black tracking-widest text-white/30 uppercase">Record Value</th>
                                    <th className="p-8 text-xs font-black tracking-widest text-white/30 uppercase w-32">Index</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {item.metadata.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="p-8 font-mono text-xs text-white/20 group-hover:text-white/60 transition-colors uppercase tracking-tight">{m.field}</td>
                                        <td className="p-8 text-sm font-bold text-white/80 leading-relaxed max-w-2xl">{m.value}</td>
                                        <td className="p-8 text-xs font-black text-white/10">{m.language || 'LOC'}</td>
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
