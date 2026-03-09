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

async function translateDictionary(targetLang) {
    console.log(`Translating to ${targetLang}...`);
    const flatEn = flattenObj(enData);

    // Read existing translation file if it exists
    let existingFlat = {};
    const targetFile = path.join(localesDir, `${targetLang}.json`);
    if (fs.existsSync(targetFile)) {
        existingFlat = flattenObj(JSON.parse(fs.readFileSync(targetFile, 'utf8')));
    }

    const flatTranslated = { ...existingFlat };

    const missingKeys = [];
    const missingValues = [];

    // Find keys in flatEn that are NOT in existingFlat
    for (const key of Object.keys(flatEn)) {
        if (!existingFlat[key]) {
            missingKeys.push(key);
            missingValues.push(flatEn[key]);
        }
    }

    if (missingKeys.length === 0) {
        console.log(`No missing keys for ${targetLang}.`);
        return;
    }

    console.log(`Found ${missingKeys.length} missing keys for ${targetLang}.`);

    // Translate in chunks of 50 to avoid payload too large
    const chunkSize = 50;
    for (let i = 0; i < missingValues.length; i += chunkSize) {
        const chunkValues = missingValues.slice(i, i + chunkSize);
        const chunkKeys = missingKeys.slice(i, i + chunkSize);

        try {
            const resp = await translate(chunkValues, { to: targetLang });

            const results = Array.isArray(resp) ? resp : [resp];

            for (let j = 0; j < results.length; j++) {
                flatTranslated[chunkKeys[j]] = results[j].text;
            }

            // small delay to prevent rate limit
            await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
            console.error(`Failed on chunk ${i} for ${targetLang}`, err.message);
            // Fallback: keep original english string for failed chunks
            for (let j = 0; j < chunkKeys.length; j++) {
                flatTranslated[chunkKeys[j]] = chunkValues[j];
            }
        }
    }

    const translatedData = unflattenObj(flatTranslated);
    fs.writeFileSync(
        targetFile,
        JSON.stringify(translatedData, null, 2)
    );
    console.log(`Finished handling ${targetLang}.json`);
}

async function run() {
    for (const lang of LANGUAGES) {
        await translateDictionary(lang);
    }
    console.log('All translations completed!');
}

run();
