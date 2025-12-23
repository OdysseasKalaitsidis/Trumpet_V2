import { Link } from 'react-router-dom';

interface PathCardProps {
    title: string;
    subtitle: string;
    imgSrc: string; // URL to local public image
    pathFilter: string;
}

export default function PathCard({ title, subtitle, imgSrc, pathFilter }: PathCardProps) {
    return (
        <div className="col-span-1">
            <div className="card-glass h-full text-center p-6 flex flex-col items-center justify-center group hover:bg-white/15">
                <img src={imgSrc} alt={`${title} icon`} className="w-auto h-[130px] object-contain mb-6 path-icon" />
                <h5 className="font-bold text-xl mb-2">{title}</h5>
                <p className="text-white/60 text-sm mb-4">({subtitle})</p>
                <Link to={`/?path=${pathFilter}`} className="btn-liquid btn-liquid-primary mt-auto inline-block no-underline">Explore</Link>
            </div>
        </div>
    );
}
