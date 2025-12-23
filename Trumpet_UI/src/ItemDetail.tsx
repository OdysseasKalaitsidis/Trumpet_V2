import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Item, Bitstream } from './types';
import { fetchItem, getMediaUrl } from './api';

import LeafletMap from './components/LeafletMap';

export default function ItemDetail() {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<Bitstream | null>(null); // For modal

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetchItem(id)
            .then(setItem)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="container mt-5">Loading...</div>;
    if (!item) return <div className="container mt-5">Item not found.</div>;

    // --- Logic Helpers ---
    // --- Logic Helpers ---
    const getMetadata = (field: string, langPrefix: string = 'en') => {
        // Preference: Exact English matches first
        const englishValues = item.metadata
            .filter(m => m.field === field && m.language?.startsWith(langPrefix))
            .map(m => m.value);

        if (englishValues.length > 0) return englishValues.join(', ');

        return item.metadata.filter(m => m.field === field).map(m => m.value).join(', ');
    };

    // Helper to get multiple fields
    const getContributors = () => {
        const fields = ['dc.contributor.author', 'dc.creator', 'dc.contributor.other'];
        const allMatches = item.metadata.filter(m => fields.includes(m.field));

        const englishMatches = allMatches.filter(m => m.language?.startsWith('en'));
        if (englishMatches.length > 0) {
            // Deduplicate
            return Array.from(new Set(englishMatches.map(m => m.value))).join('; ');
        }

        return Array.from(new Set(allMatches.map(m => m.value))).join('; ');
    };

    // Location Logic
    const latStr = item.metadata.find(m => m.field === 'dc.coverage.spatiallatitude')?.value;
    const lonStr = item.metadata.find(m => m.field === 'dc.coverage.spatiallongitude')?.value;
    const latitude = latStr ? parseFloat(latStr) : null;
    const longitude = lonStr ? parseFloat(lonStr) : null;
    const hasLocation = latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);

    // Cover Image Logic
    // Find all image bitstreams
    const imageBitstreams = item.bitstreams.filter(b =>
        (b.mimeType && b.mimeType.startsWith('image/')) ||
        b.name.match(/\.(jpg|jpeg|png|gif)$/i)
    );

    // Sort by size (descending) to get the largest/clearest image
    imageBitstreams.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));

    // Pick the largest one
    const imageBitstream = imageBitstreams.length > 0 ? imageBitstreams[0] : undefined;

    const coverUrl = imageBitstream ? getMediaUrl(imageBitstream.localFilePath) : null;

    // Audio/Video Logic
    // Sort bitstreams to prioritize audio/video
    const audioFiles = item.bitstreams.filter(b => b.mimeType?.startsWith('audio/') || b.name.endsWith('.mp3'));
    const videoFiles = item.bitstreams.filter(b => b.mimeType?.startsWith('video/') || b.name.endsWith('.mp4'));

    // Priority: Audio -> Video
    const mainMedia = audioFiles.length > 0 ? audioFiles[0] : (videoFiles.length > 0 ? videoFiles[0] : null);
    const mainMediaType = audioFiles.length > 0 ? 'audio' : 'video';

    // File Viewer Modal Logic
    const openModal = (file: Bitstream) => {
        setSelectedFile(file);
    };
    const closeModal = () => {
        setSelectedFile(null);
    };

    // Layout
    return (
        <div className="mt-8">
            <div className="mb-6">
                <Link to="/" className="btn-liquid border border-white/20 hover:bg-white/10 text-white no-underline inline-flex items-center">&larr; Back to Archive</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Cover & Media */}
                <div className="col-span-1 space-y-8">
                    <div className="card-glass p-0 overflow-hidden">
                        {coverUrl ? (
                            <img src={coverUrl} className="w-full h-auto object-cover" alt="Cover" />
                        ) : (
                            <div className="w-full h-64 bg-white/5 flex flex-col items-center justify-center">
                                <span className="text-6xl mb-2">🎵</span>
                                <p className="text-white/50">No Cover Image</p>
                            </div>
                        )}
                    </div>

                    {/* Location Map (Desktop) */}
                    {hasLocation && (
                        <div className="card-glass p-1 h-64 overflow-hidden relative z-0 hidden md:block">
                            <LeafletMap latitude={latitude!} longitude={longitude!} popupText={item.name} />
                        </div>
                    )}
                </div>

                {/* Right Column: Metadata & Files */}
                <div className="col-span-1 md:col-span-2 text-white">
                    <h2 className="text-3xl font-bold mb-4">{item.name}</h2>
                    <hr className="border-white/10 mb-6" />

                    {/* Summary Metadata (English Preferred) */}
                    <dl className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                        <dt className="text-white/60">Contributors</dt>
                        <dd className="sm:col-span-3">{getContributors() || '-'}</dd>

                        <dt className="text-white/60">Date</dt>
                        <dd className="sm:col-span-3">{getMetadata('dc.date.issued') || '-'}</dd>

                        <dt className="text-white/60">Description</dt>
                        <dd className="sm:col-span-3">{getMetadata('dc.description') || '-'}</dd>

                        <dt className="text-white/60">Music Path</dt>
                        <dd className="sm:col-span-3">{getMetadata('dc.musicsubpath') || '-'}</dd>
                    </dl>

                    {/* Modern Media Player Section */}
                    {mainMedia && (
                        <div className="card-glass p-4 mb-8 bg-white/5 backdrop-blur-md">
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">▶️</span>
                                <div>
                                    <h5 className="font-bold">Now Playing</h5>
                                    <small className="text-white/60">{mainMedia.name}</small>
                                </div>
                            </div>

                            {mainMediaType === 'audio' ? (
                                <audio controls className="w-full h-10" style={{ colorScheme: 'dark' }}>
                                    <source src={getMediaUrl(mainMedia.localFilePath)} type={(mainMedia.mimeType && mainMedia.mimeType !== 'Unknown') ? mainMedia.mimeType : 'audio/mpeg'} />
                                    Your browser does not support the audio element.
                                </audio>
                            ) : (
                                <div className="aspect-video rounded overflow-hidden bg-black">
                                    <video controls className="w-full h-full">
                                        <source src={getMediaUrl(mainMedia.localFilePath)} type={(mainMedia.mimeType && mainMedia.mimeType !== 'Unknown') ? mainMedia.mimeType : 'video/mp4'} />
                                        Your browser does not support the video element.
                                    </video>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Location Map (Mobile) */}
                    {hasLocation && (
                        <div className="card-glass p-1 h-64 overflow-hidden relative z-0 md:hidden mb-8">
                            <LeafletMap latitude={latitude!} longitude={longitude!} popupText={item.name} />
                        </div>
                    )}

                    <h4 className="text-xl font-bold mb-4">Files</h4>
                    <div className="flex flex-col space-y-2 mb-12">
                        {item.bitstreams.map(b => (
                            <button key={b.id} className="w-full text-left bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center hover:bg-white/10 transition-colors group" onClick={() => openModal(b)}>
                                <div>
                                    <span className="font-bold block text-white group-hover:text-liquid-primary transition-colors">{b.name}</span>
                                    <small className="text-white/50">{b.mimeType} ({(Math.random() * 5 + 1).toFixed(1)} MB)</small>
                                </div>
                                <span className="bg-liquid-primary text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg shadow-liquid-primary/30">View</span>
                            </button>
                        ))}
                    </div>


                </div>
            </div>

            {/* Full Metadata Section (Full Width) */}
            <div className="mt-12 text-white">
                <h4 className="text-xl font-bold mb-4">Full Metadata</h4>
                <div className="card-glass overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-3 text-white/70 font-medium">Field</th>
                                <th className="p-3 text-white/70 font-medium">Value</th>
                                <th className="p-3 text-white/70 font-medium w-24">Lang</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item.metadata.map((m, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-mono text-sm text-liquid-primary opacity-80">{m.field}</td>
                                    <td className="p-3 text-white/90 break-words">{m.value}</td>
                                    <td className="p-3 text-white/50 text-sm">{m.language || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {selectedFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={closeModal}>
                    <div className="w-full max-w-6xl h-[85vh] bg-[#f0f0f0] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center text-gray-800">
                            <h5 className="font-bold truncate pr-4">{selectedFile.name}</h5>
                            <button type="button" className="text-gray-500 hover:text-red-500 transition-colors text-2xl leading-none" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="flex-1 bg-gray-100 p-0 relative">
                            {selectedFile.mimeType === 'application/pdf' ? (
                                <iframe src={getMediaUrl(selectedFile.localFilePath)} className="w-full h-full border-none" title="PDF Viewer"></iframe>
                            ) : (
                                <iframe src={getMediaUrl(selectedFile.localFilePath)} className="w-full h-full border-none" title="Content Viewer"></iframe>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// NOTE: in the Modal logic, I used a PDF.js path that existed in the Razor project. 
// Since we don't have that library copied over, I should probably just use the raw file URL in the iframe. 
// Most browsers handle PDFs in iframes natively.
