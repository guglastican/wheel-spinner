const fs = require('fs');
const path = require('path');
const translate = require('google-translate-api-x');

const LANGUAGES = [
    'es', 'de', 'ja', 'fr', 'pt', 'zh-CN', 'ar', 'it', 'ru', 'hi', 'nl', 'tr', 'ko', 'id', 'vi', 'pl', 'th', 'sv', 'el', 'ro', 'cs', 'hu', 'bn', 'he'
];

const localesDir = path.join(__dirname, 'src', 'locales');
const enPath = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Flatten an object to key-value pairs
function flattenObj(obj, prefix = '', res = {}) {
    for (const [key, val] of Object.entries(obj)) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            flattenObj(val, newPrefix, res);
        } else {
            res[newPrefix] = val;
        }
    }
    return res;
}

// Unflatten back to nested object
function unflattenObj(flatObj) {
    const result = {};
    for (const [key, val] of Object.entries(flatObj)) {
        const parts = key.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part]) current[part] = {};
            current = current[part];
        }
        current[parts[parts.length - 1]] = val;
    }
    return result;
}

// Check for HTML tags placeholders, we only translate the text inside and out.
// But google-translate-api-x natively handles HTML well if we pass it, but sometimes it messes up brackets.
// We'll pass strings directly.

async function translateDictionary(targetLang) {
    console.log(`Translating to ${targetLang}...`);
    const flatEn = flattenObj(enData);
    const flatTranslated = {};

    const keys = Object.keys(flatEn);
    const values = Object.values(flatEn);

    // Translate in chunks of 10 to avoid payload too large
    const chunkSize = 10;
    for (let i = 0; i < values.length; i += chunkSize) {
        const chunkValues = values.slice(i, i + chunkSize);
        const chunkKeys = keys.slice(i, i + chunkSize);

        try {
            const resp = await translate(chunkValues, { to: targetLang });

            // If single item, resp is an object, if multiple, it's an array
            const results = Array.isArray(resp) ? resp : [resp];

            for (let j = 0; j < results.length; j++) {
                flatTranslated[chunkKeys[j]] = results[j].text;
            }

            // small delay to prevent rate limit
            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.error(`Failed on chunk ${i} for ${targetLang}`, err.message);
            // Fallback: keep original english string
            for (let j = 0; j < chunkKeys.length; j++) {
                flatTranslated[chunkKeys[j]] = chunkValues[j];
            }
        }
    }

    const translatedData = unflattenObj(flatTranslated);
    fs.writeFileSync(
        path.join(localesDir, `${targetLang}.json`),
        JSON.stringify(translatedData, null, 2)
    );
    console.log(`Finished ${targetLang}.json`);
}

async function run() {
    for (const lang of LANGUAGES) {
        const targetFile = path.join(localesDir, `${lang}.json`);
        if (fs.existsSync(targetFile)) {
            console.log(`Skipping ${targetFile} - already exists.`);
            continue;
        }
        await translateDictionary(lang);
    }
    console.log('All translations completed!');
}

run();
