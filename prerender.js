const fs = require('fs');
const path = require('path');

const SUPPORTED_LOCALES = [
    'en', 'es', 'de', 'ja', 'fr', 'pt', 'zh-CN', 'ar', 'it', 'ru', 'hi', 'nl', 'tr', 'ko', 'id', 'vi', 'pl', 'th', 'sv', 'el', 'ro', 'cs', 'hu', 'bn', 'he'
];

const BASE_ROUTES = [
    '', // Home
    'wheel-of-names',
    'yes-no-wheel',
    'food-wheel',
    'spin-the-wheel',
    'twister-spinner'
];

const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error('Build output not found! Run "vite build" first.');
    process.exit(1);
}

const originalHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

console.log('Starting Post-Build Prerendering...');

SUPPORTED_LOCALES.forEach(locale => {
    const isDefault = locale === 'en';
    
    BASE_ROUTES.forEach(route => {
        // Skip root index handling if we're not dealing with a sub-path or sub-language
        if (isDefault && route === '') return;

        const langPrefix = isDefault ? '' : locale;
        const outDirPath = path.join(DIST_DIR, langPrefix, route);
        
        // Ensure folder exists (recursive)
        if (!fs.existsSync(outDirPath)) {
            fs.mkdirSync(outDirPath, { recursive: true });
        }

        // Modify HTML for this specific language/route
        let modifiedHtml = originalHtml;

        // 1. Update <html lang="...">
        modifiedHtml = modifiedHtml.replace('<html>', `<html lang="${locale}">`);
        modifiedHtml = modifiedHtml.replace('<html lang="en">', `<html lang="${locale}">`);

        // 2. We could also inject more specific Title/Desc here if we wanted, 
        // but since it's an SPA, the main thing is the lang attribute for auditors.
        
        // Save as index.html in the sub-folder
        fs.writeFileSync(path.join(outDirPath, 'index.html'), modifiedHtml);
    });
});

console.log('Prerendering complete! Generated static entries for all languages.');
