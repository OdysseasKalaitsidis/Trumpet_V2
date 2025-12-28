import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_DIR = path.join(__dirname, 'public/media');
const MANIFEST_PATH = path.join(MEDIA_DIR, 'manifest.json');

// Ensure directory exists
if (!fs.existsSync(MEDIA_DIR)) {
    console.error('Directory public/media does not exist!');
    process.exit(1);
}

// Get all files
const files = fs.readdirSync(MEDIA_DIR).filter(file => {
    // Filter out hidden files and the manifest itself
    return !file.startsWith('.') && file !== 'manifest.json';
});

const manifest = {
    files: files
};

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(`Manifest generated with ${files.length} files at ${MANIFEST_PATH}`);
