const API_BASE_URL = 'http://localhost:5000';

function getMediaUrl(filePath) {
    const outMarker = 'out';
    const idx = filePath.indexOf(outMarker);
    if (idx !== -1) {
        const part = filePath.substring(idx + 3);
        const cleanPart = part.replace(/^[/\\]/, '').replace(/\\/g, '/');
        return `${API_BASE_URL}/media/${cleanPart}`;
    }
    return '';
}

const testPath = "/Users/giannis/Desktop/Trumpet/trumpet_data/out/collections/8f743f98-3b35-433d-a1af-40b403101c2e/items/1dc3b3c4-600c-4d29-b6d7-2f01d30dbdf3/bitstreams/(1240x1754).JPEG";
console.log(getMediaUrl(testPath));
