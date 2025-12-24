import { Link } from 'react-router-dom';

interface PathCardProps {
    title: string;
    subtitle: string;
    imgSrc: string; // URL to local public image
    pathFilter: string;
}

export default function PathCard({ title, subtitle, imgSrc, pathFilter }: PathCardProps) {
    return (
        <div className="col-md-3 col-sm-6 mb-3">
            <div className="card h-100 shadow-sm text-center">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <img src={imgSrc} alt={`${title} icon`} className="img-fluid mb-3 path-icon" style={{ maxHeight: '130px', objectFit: 'contain' }} />
                    <h5>{title}</h5>
                    <p className="text-muted small">({subtitle})</p>
                    <Link to={`/?path=${pathFilter}`} className="btn btn-primary mt-2">Explore</Link>
                </div>
            </div>
        </div>
    );
}
