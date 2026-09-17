/**
 * verify-ui.js — end-to-end check of the wheel UI against the built output.
 *
 * Serves dist/ locally, drives a real Chrome over the DevTools protocol and
 * asserts the interactive behaviour: tabs, palettes, sound toggle, spin speed,
 * Spacebar spin, winner popup (spin again / remove winner / Escape), results
 * history, mobile layout and RTL rendering.
 *
 * Local-only on purpose: it needs Chrome and a built dist/, so it is NOT part
 * of `npm run build` (build machines have no browser).
 *
 * Usage:  npm run build && npm run verify-ui
 *         CHROME_PATH="…" PORT=4173 npm run verify-ui
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT || 4288);
const DEBUG_PORT = Number(process.env.DEBUG_PORT || 9333);
const BASE = `http://127.0.0.1:${PORT}`;
const CHROME = process.env.CHROME_PATH || [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].find((candidate) => fs.existsSync(candidate));

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('dist/ not found — run "npm run build" first.');
    process.exit(1);
}
if (!CHROME) {
    console.error('No Chrome/Edge binary found. Set CHROME_PATH to run this check.');
    process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.xml': 'application/xml',
    '.txt': 'text/plain; charset=utf-8'
};

function startServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
            const candidates = [path.join(DIST, urlPath), path.join(DIST, urlPath, 'index.html')];
            for (const candidate of candidates) {
                if (!candidate.startsWith(DIST)) break;
                if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                    res.writeHead(200, { 'Content-Type': MIME[path.extname(candidate)] || 'application/octet-stream' });
                    res.end(fs.readFileSync(candidate));
                    return;
                }
            }
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<html><body><h1>404</h1></body></html>');
        });
        server.listen(PORT, '127.0.0.1', () => resolve(server));
    });
}

async function getTargetUrl() {
    for (let i = 0; i < 40; i += 1) {
        try {
            const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
            const list = await res.json();
            const page = list.find((t) => t.type === 'page');
            if (page) return page.webSocketDebuggerUrl;
        } catch (e) { /* devtools not up yet */ }
        await sleep(250);
    }
    throw new Error('Chrome DevTools endpoint never came up');
}

function connect(url) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(url);
        let id = 0;
        const pending = new Map();
        const events = [];
        ws.addEventListener('open', () => resolve({
            send(method, params = {}) {
                id += 1;
                const messageId = id;
                ws.send(JSON.stringify({ id: messageId, method, params }));
                return new Promise((res, rej) => pending.set(messageId, { res, rej }));
            },
            events,
            close: () => ws.close()
        }));
        ws.addEventListener('error', reject);
        ws.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            if (message.id && pending.has(message.id)) {
                const { res, rej } = pending.get(message.id);
                pending.delete(message.id);
                if (message.error) rej(new Error(JSON.stringify(message.error)));
                else res(message.result);
            } else if (message.method) {
                events.push(message);
            }
        });
    });
}

let failures = 0;
function check(label, condition, detail = '') {
    if (!condition) failures += 1;
    console.log(`  [${condition ? 'PASS' : 'FAIL'}] ${label}${detail ? ` — ${detail}` : ''}`);
}

(async () => {
    const server = await startServer();
    const chrome = spawn(CHROME, [
        '--headless=new', '--disable-gpu', '--no-sandbox', '--mute-audio', '--hide-scrollbars',
        `--remote-debugging-port=${DEBUG_PORT}`,
        `--user-data-dir=${path.join(process.env.TEMP || '/tmp', 'randowheel-verify-ui')}`,
        '--window-size=1280,900',
        'about:blank'
    ], { stdio: 'ignore' });

    let client;
    try {
        client = await connect(await getTargetUrl());
        await client.send('Page.enable');
        await client.send('Runtime.enable');

        const evaluate = async (expression) => {
            const res = await client.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
            if (res.exceptionDetails) throw new Error(res.exceptionDetails.text || 'evaluate failed');
            return res.result.value;
        };
        const waitFor = async (expression, timeout = 15000) => {
            const deadline = Date.now() + timeout;
            while (Date.now() < deadline) {
                if (await evaluate(expression)) return true;
                await sleep(200);
            }
            return false;
        };
        const consoleErrors = () => client.events
            .filter((e) => e.method === 'Runtime.exceptionThrown'
                || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error'))
            .map((e) => e.method === 'Runtime.exceptionThrown'
                ? (e.params.exceptionDetails.exception && e.params.exceptionDetails.exception.description) || e.params.exceptionDetails.text
                : (e.params.args || []).map((a) => a.value).join(' '));
        const pressKey = async (code, key, vk) => {
            await client.send('Input.dispatchKeyEvent', { type: 'keyDown', windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, code, key, text: key === ' ' ? ' ' : undefined });
            await client.send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, code, key });
        };
        const tab = (label) => evaluate(`[...document.querySelectorAll('.tab-btn')].find(b => b.textContent.includes(${JSON.stringify(label)})).click()`);

        console.log('/food-wheel (desktop 1280x900)');
        client.events.length = 0;
        await client.send('Page.navigate', { url: `${BASE}/food-wheel` });
        await sleep(3500);

        check('four tabs render', await evaluate(`document.querySelectorAll('.tabs .tab-btn').length`) === 4);
        check('tab labels come from i18n',
            await evaluate(`[...document.querySelectorAll('.tab-btn .tab-label')].map(e=>e.textContent.trim()).join('|')`) === 'List|Style|Sound|Spin');
        const wheelSize = await evaluate(`(() => { const c = document.querySelector('canvas'); if (!c) return 0; const r = c.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); })()`);
        check('wheel canvas is rendered', wheelSize > 200, `${wheelSize}px`);
        check('cursor controls are out of the default view', await evaluate(`!document.body.innerText.includes('Cursor Angle')`));
        check('advanced block starts collapsed', await evaluate(`(() => { const d = document.querySelector('.advanced-block'); return !!d && !d.open; })()`));

        await tab('Style');
        await sleep(400);
        check('five palettes listed', await evaluate(`document.querySelectorAll('.palette-btn').length`) === 5);
        const beforeColors = await evaluate(`[...document.querySelectorAll('.item-color-input')].map(i => i.value).join(',')`);
        await evaluate(`document.querySelectorAll('.palette-btn')[2].click()`);
        await sleep(400);
        const afterColors = await evaluate(`[...document.querySelectorAll('.item-color-input')].map(i => i.value).join(',')`);
        check('palette recolours the slices', beforeColors !== afterColors && afterColors.includes('#0a3d62'));

        await tab('Sound');
        await sleep(300);
        check('sound is on by default', await evaluate(`document.querySelector('.switch-row input').checked`));
        await evaluate(`document.querySelector('.switch-row input').click()`);
        await sleep(200);
        check('sound can be muted', await evaluate(`!document.querySelector('.switch-row input').checked`));
        check('volume slider disables when muted', await evaluate(`document.querySelector('.range-input').disabled === true`));
        await evaluate(`document.querySelector('.switch-row input').click()`);
        await sleep(200);

        await tab('Spin');
        await sleep(300);
        await evaluate(`[...document.querySelectorAll('.segment-btn')].find(b => b.textContent.includes('Fast')).click()`);
        await sleep(200);
        check('spin speed can be changed', await evaluate(`[...document.querySelectorAll('.segment-btn')].find(b => b.textContent.includes('Fast')).classList.contains('active')`));

        await pressKey('Space', ' ', 32);
        check('Spacebar starts a spin', await waitFor(`document.querySelector('.spin-center-button').classList.contains('is-spinning')`, 4000));
        check('winner popup appears', await waitFor(`!!document.querySelector('.modal-card')`, 15000));
        const winner = await evaluate(`document.querySelector('.modal-winner').textContent.trim()`);
        check('popup shows the winning slice', winner.length > 0, `"${winner}"`);
        check('confetti is rendered', await evaluate(`document.querySelectorAll('.confetti span').length`) >= 12);
        check('banner agrees with the popup', (await evaluate(`document.querySelector('.winner-text').textContent`)).includes(winner));
        check('result added to the results panel', await evaluate(`document.querySelectorAll('.history-row').length`) === 1);
        check('popup focuses its primary action', await evaluate(`document.activeElement.classList.contains('modal-btn')`));

        await evaluate(`[...document.querySelectorAll('.modal-btn')].find(b => b.textContent.match(/again|nochmal|nuevo/i)).click()`);
        await sleep(600);
        check('"spin again" closes the popup and restarts', await evaluate(`!document.querySelector('.modal-card')`)
            && await waitFor(`document.querySelector('.spin-center-button').classList.contains('is-spinning')`, 4000));
        await waitFor(`!!document.querySelector('.modal-card')`, 15000);

        const before = await evaluate(`document.querySelectorAll('.item-row').length`);
        await evaluate(`[...document.querySelectorAll('.modal-btn')].find(b => !b.disabled && !b.textContent.match(/again|close|cerrar|schliessen|schließen/i)).click()`);
        await sleep(500);
        check('"remove winner" deletes the slice', await evaluate(`document.querySelectorAll('.item-row').length`) === before - 1, `${before} → ${before - 1}`);
        check('popup closes after removing', await evaluate(`!document.querySelector('.modal-card')`));

        await evaluate(`document.querySelector('.spin-main-btn').click()`);
        await waitFor(`!!document.querySelector('.modal-card')`, 15000);
        await pressKey('Escape', 'Escape', 27);
        await sleep(400);
        check('Escape closes the popup', await evaluate(`!document.querySelector('.modal-card')`));

        await evaluate(`document.querySelector('.results-section .icon-btn').click()`);
        await sleep(300);
        check('results can be cleared', await evaluate(`document.querySelectorAll('.history-row').length`) === 0);

        await tab('List');
        await sleep(300);
        await evaluate(`document.querySelector('.input-container input').focus()`);
        await pressKey('Space', ' ', 32);
        await sleep(400);
        check('Spacebar while typing does not spin', await evaluate(`!document.querySelector('.spin-center-button').classList.contains('is-spinning')`));

        await evaluate(`document.querySelectorAll('.item-row .action-btn.include').forEach(b => { if (b.classList.contains('active')) b.click() })`);
        await sleep(300);
        await tab('Spin');
        await sleep(300);
        await evaluate(`document.querySelector('.spin-btn').click()`);
        await sleep(400);
        check('empty-wheel warning is visible from any tab', await evaluate(`!!document.querySelector('.inline-error')`));
        await evaluate(`document.querySelectorAll('.item-row .action-btn.include').forEach(b => { if (!b.classList.contains('active')) b.click() })`);
        await sleep(300);

        check('no console errors on desktop', consoleErrors().length === 0, consoleErrors().slice(0, 2).join(' | '));

        console.log('\n/food-wheel (mobile 390x844)');
        await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        client.events.length = 0;
        await client.send('Page.navigate', { url: `${BASE}/food-wheel` });
        await sleep(3500);
        const overflow = await evaluate(`document.documentElement.scrollWidth - window.innerWidth`);
        check('no horizontal overflow', overflow <= 2, `${overflow}px`);
        check('wheel fits the viewport', await evaluate(`(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); })()`) > 200);
        check('tabs usable on mobile', await evaluate(`document.querySelectorAll('.tabs .tab-btn').length`) === 4);
        await client.send('Emulation.clearDeviceMetricsOverride');

        console.log('\n/ar/food-wheel (RTL)');
        client.events.length = 0;
        await client.send('Page.navigate', { url: `${BASE}/ar/food-wheel` });
        await sleep(3500);
        const labels = await evaluate(`[...document.querySelectorAll('.tab-label')].map(e=>e.textContent.trim()).join('|')`);
        check('document direction is RTL', await evaluate(`document.documentElement.dir`) === 'rtl');
        check('panel is localized', /[\u0600-\u06FF]/.test(labels), labels);
        check('no console errors on RTL page', consoleErrors().length === 0, consoleErrors().slice(0, 2).join(' | '));

        client.close();
    } finally {
        chrome.kill();
        server.close();
    }

    console.log(`\n${failures === 0 ? 'All wheel UI checks passed.' : `${failures} wheel UI check(s) failed.`}`);
    process.exit(failures === 0 ? 0 : 1);
})().catch((err) => {
    console.error('verify-ui failed to run:', err.message);
    process.exit(2);
});
