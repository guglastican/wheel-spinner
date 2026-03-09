const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

for (const file of files) {
    const filePath = path.join(localesDir, file);
    let data;
    try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`Error parsing ${file}`, e);
        continue;
    }

    if (data.footer && data.footer.copyright) {
        data.footer.copyright = data.footer.copyright.replace(/\{[^}]+\}/g, '{year}');
    }

    if (data.mainWheel && data.mainWheel.winner) {
        data.mainWheel.winner = data.mainWheel.winner.replace(/\{[^}]+\}/g, '{text}');
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log('Fixed variables across all translations');
