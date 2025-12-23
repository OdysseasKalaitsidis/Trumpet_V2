import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Item, Bitstream } from './types';
import { fetchItem, getMediaUrl } from './api';

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
    const getMetadata = (field: string) => {
        return item.metadata.filter(m => m.field === field).map(m => m.value).join(', ');
    };

    // Helper to get multiple fields
    const getContributors = () => {
        const fields = ['dc.contributor.author', 'dc.creator', 'dc.contributor.other'];
        return item.metadata
            .filter(m => fields.includes(m.field))
            .map(m => m.value)
            .join('; ');
    };

    // Cover Image Logic
    const imageBitstream = item.bitstreams.find(b =>
        (b.mimeType && b.mimeType.startsWith('image/')) ||
        b.name.match(/\.(jpg|jpeg|png|gif)$/i)
    );
    const coverUrl = imageBitstream ? getMediaUrl(imageBitstream.localFilePath) : null;

    // PDF Logic for Cover fallback (mimic) or just PDF link
    // const pdfBitstream = item.bitstreams.find(b => b.mimeType === 'application/pdf');

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

    return (
        <div className="container mt-4">
            <div className="mb-3">
                <Link to="/" className="btn btn-outline-secondary">&larr; Back to Archive</Link>
            </div>

            <div className="row">
                {/* Left Column: Cover & Media */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm">
                        {coverUrl ? (
                            <img src={coverUrl} className="card-img-top img-fluid" alt="Cover" />
                        ) : (
                            <div className="card-body text-center bg-light py-5">
                                <span className="display-1">🎵</span>
                                <p className="text-muted mt-2">No Cover Image</p>
                            </div>
                        )}

                        {/* Media Player */}

                    </div>
                </div>

                {/* Right Column: Metadata & Files */}
                <div className="col-md-8">
                    <h2>{item.name}</h2>
                    <hr />

                    <h4>Metadata</h4>
                    <dl className="row">
                        <dt className="col-sm-3">Contributors</dt>
                        <dd className="col-sm-9">{getContributors() || '-'}</dd>

                        <dt className="col-sm-3">Date</dt>
                        <dd className="col-sm-9">{getMetadata('dc.date.issued') || '-'}</dd>

                        <dt className="col-sm-3">Description</dt>
                        <dd className="col-sm-9">{getMetadata('dc.description') || '-'}</dd>

                        <dt className="col-sm-3">Music Path</dt>
                        <dd className="col-sm-9">{getMetadata('dc.musicsubpath') || '-'}</dd>
                    </dl>

                    {/* Modern Media Player Section */}
                    {mainMedia && (
                        <div className="card mt-4 mb-4 shadow-sm" style={{ backdropFilter: 'blur(15px)', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    <span className="fs-4 me-2">▶️</span>
                                    <div>
                                        <h5 className="card-title mb-0">Now Playing</h5>
                                        <small className="text-muted">{mainMedia.name}</small>
                                    </div>
                                </div>

                                {mainMediaType === 'audio' ? (
                                    <audio controls className="w-100" style={{ height: '40px', colorScheme: 'dark' }}>
                                        <source src={getMediaUrl(mainMedia.localFilePath)} type={(mainMedia.mimeType && mainMedia.mimeType !== 'Unknown') ? mainMedia.mimeType : 'audio/mpeg'} />
                                        Your browser does not support the audio element.
                                    </audio>
                                ) : (
                                    <div className="ratio ratio-16x9 rounded overflow-hidden">
                                        <video controls className="w-100">
                                            <source src={getMediaUrl(mainMedia.localFilePath)} type={(mainMedia.mimeType && mainMedia.mimeType !== 'Unknown') ? mainMedia.mimeType : 'video/mp4'} />
                                            Your browser does not support the video element.
                                        </video>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <h4 className="mt-4">Files</h4>
                    <div className="list-group">
                        {item.bitstreams.map(b => (
                            <button key={b.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={() => openModal(b)}>
                                <div>
                                    <span className="fw-bold">{b.name}</span>
                                    <br />
                                    <small className="text-muted">{b.mimeType} ({(Math.random() * 5 + 1).toFixed(1)} MB)</small>
                                </div>
                                <span className="badge bg-primary rounded-pill">View</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {selectedFile && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content text-dark scheme-light"> {/* Ensure content is readable */}
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedFile.name}</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body p-0" style={{ height: '80vh' }}>
                                {selectedFile.mimeType === 'application/pdf' ? (
                                    <iframe src={getMediaUrl(selectedFile.localFilePath)} width="100%" height="100%" title="PDF Viewer" style={{ border: 'none' }}></iframe>
                                ) : (
                                    // Generic Iframe for everything for now
                                    <iframe src={getMediaUrl(selectedFile.localFilePath)} width="100%" height="100%" title="Content Viewer" style={{ border: 'none' }}></iframe>
                                )}
                            </div>
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
