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
    '.wav': 'audio/wav',
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

/**
 * Turns sampled canvas angles into one monotonic rotation curve.
 * A spin sets the transform to a raw, ever-growing angle and then normalises it
 * to 0..360 when it stops (a jump of thousands of degrees) — that jump must not
 * be mistaken for motion. Wraps *during* the hold spin are small (< 360) and
 * are genuine forward movement.
 */
function unwrapAngles(trace) {
    const frames = [];
    let cumulative = 0;
    for (let i = 0; i < trace.length; i += 1) {
        if (i > 0) {
            const raw = trace[i][1] - trace[i - 1][1];
            let delta = ((raw % 360) + 360) % 360;
            if (raw < -360) delta = 0; // normalisation jump at the end of a spin
            cumulative += delta;
        }
        frames.push({ t: trace[i][0] - trace[0][0], angle: cumulative });
    }
    return frames;
}

/** Speed (deg/s) measured over a sliding window, tolerant of dropped frames. */
function speedSeries(frames, windowMs = 100) {
    const series = [];
    const duration = frames[frames.length - 1].t - frames[0].t;
    for (let i = 1; i < frames.length; i += 1) {
        let j = i - 1;
        while (j > 0 && frames[i].t - frames[j].t < windowMs) j -= 1;
        const dt = (frames[i].t - frames[j].t) / 1000;
        if (dt < windowMs * 0.8 / 1000) continue;
        series.push({
            t: frames[i].t / 1000,
            v: (frames[i].angle - frames[j].angle) / dt,
            progress: duration > 0 ? frames[i].t / duration : 0
        });
    }
    return series;
}

/** Average speed between two points in time (ms). */
function rateBetween(frames, fromMs, toMs) {
    const from = frames.find((f) => f.t >= fromMs);
    const to = [...frames].reverse().find((f) => f.t <= toMs);
    if (!from || !to || to.t <= from.t) return 0;
    return ((to.angle - from.angle) / (to.t - from.t)) * 1000;
}

(async () => {
    const server = await startServer();
    const chrome = spawn(CHROME, [
        '--headless=new', '--disable-gpu', '--no-sandbox', '--mute-audio', '--hide-scrollbars',
        // Playback of the sound assets is asserted below; headless has no user
        // gesture, so allow autoplay for the check.
        '--autoplay-policy=no-user-gesture-required',
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
        const canvasQuality = JSON.parse(await evaluate(`(() => {
          const c = document.querySelector('canvas');
          const r = c.getBoundingClientRect();
          return JSON.stringify({ backing: c.width, displayed: Math.round(r.width), dpr: window.devicePixelRatio || 1 });
        })()`));
        check('canvas is drawn at device resolution (crisp, not upscaled)',
            canvasQuality.backing >= canvasQuality.displayed * Math.min(canvasQuality.dpr, 2) - 2,
            `${canvasQuality.backing}px backing store for ${canvasQuality.displayed}px displayed (dpr ${canvasQuality.dpr})`);
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

        // Record every media play() call so the spin's sounds can be asserted
        await evaluate(`(() => {
          window.__plays = [];
          const original = HTMLMediaElement.prototype.play;
          HTMLMediaElement.prototype.play = function () {
            try { window.__plays.push(new URL(this.src, location.origin).pathname); }
            catch (e) { window.__plays.push('unknown'); }
            return original.apply(this, arguments);
          };
          return true;
        })()`);

        await pressKey('Space', ' ', 32);
        check('Spacebar starts a spin', await waitFor(`document.querySelector('.spin-center-button').classList.contains('is-spinning')`, 4000));
        check('winner popup appears', await waitFor(`!!document.querySelector('.modal-card')`, 15000));
        const winner = await evaluate(`document.querySelector('.modal-winner').textContent.trim()`);
        check('popup shows the winning slice', winner.length > 0, `"${winner}"`);
        check('confetti is rendered', await evaluate(`document.querySelectorAll('.confetti span').length`) >= 12);
        check('banner agrees with the popup', (await evaluate(`document.querySelector('.winner-text').textContent`)).includes(winner));
        check('result added to the results panel', await evaluate(`document.querySelectorAll('.history-row').length`) === 1);
        check('popup focuses its primary action', await evaluate(`document.activeElement.classList.contains('modal-btn')`));

        const plays = JSON.parse(await evaluate(`JSON.stringify(window.__plays || [])`));
        check('ticking sound plays while the wheel spins', plays.includes('/sounds/tick.wav'), `${plays.length} play() call(s)`);
        check('win sound plays once when the spin ends', plays.filter((src) => src === '/sounds/win.wav').length === 1);

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

        // ── Sound assets must be real, decodable audio ────────────────────
        // Guards the exact failure that shipped once: public/sounds/*.mp3 were
        // 14-byte files containing "404: Not Found", so nothing ever played.
        console.log('\nSound assets');
        const soundReport = JSON.parse(await evaluate(`(async () => {
          const out = [];
          for (const url of ['/sounds/tick.wav', '/sounds/win.wav']) {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            let duration = 0;
            let error = null;
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const decoded = await ctx.decodeAudioData(buffer.slice(0));
              duration = decoded.duration;
              ctx.close();
            } catch (e) { error = String((e && e.message) || e); }
            out.push({ url, bytes: buffer.byteLength, duration, error });
          }
          return JSON.stringify(out);
        })()`));
        for (const sound of soundReport) {
            check(`${sound.url} decodes as audio`, sound.duration > 0.01 && !sound.error,
                `${sound.bytes} bytes, ${sound.duration.toFixed(2)}s${sound.error ? `, error: ${sound.error}` : ''}`);
        }

        // ── Spin physics: quick launch, then a friction coast to a dead stop ──
        // Samples the canvas rotation every frame and rebuilds the speed curve,
        // because "the wheel does not feel natural" is a velocity-profile bug.
        console.log('\nSpin physics (Fast preset)');
        client.events.length = 0;
        await client.send('Page.navigate', { url: `${BASE}/food-wheel` });
        await sleep(3000);
        const items = await evaluate(`[...document.querySelectorAll('.item-row .item-text')].map(e => e.textContent.trim())`);
        await tab('Spin');
        await sleep(300);
        await evaluate(`[...document.querySelectorAll('.segment-btn')].find(b => b.textContent.includes('Fast')).click()`);
        await sleep(200);
        await evaluate(`(() => {
          window.__trace = [];
          window.__tracing = true;
          const canvas = document.querySelector('canvas');
          const sample = () => {
            const match = /rotate3d\\(0, 0, 1, ([\\d.eE+-]+)deg\\)/.exec(canvas.style.transform || '');
            if (match) window.__trace.push([performance.now(), parseFloat(match[1])]);
            if (window.__tracing) requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
          return true;
        })()`);
        await evaluate(`document.querySelector('.spin-main-btn').click()`);
        const spinFinished = await waitFor(`!!document.querySelector('.modal-card')`, 20000);
        const winnerText = await evaluate(`document.querySelector('.modal-winner') ? document.querySelector('.modal-winner').textContent.trim() : ''`);
        const trace = JSON.parse(await evaluate(`(() => { window.__tracing = false; return JSON.stringify(window.__trace || []); })()`));
        check('spin completed', spinFinished && trace.length > 20, `${trace.length} frames sampled`);

        // Unwrap the rotation (it wraps to 0..360 when the spin ends) so the
        // samples form one monotonic curve.
        const frames = unwrapAngles(trace);
        const startTime = frames[0].t;
        const endTime = frames[frames.length - 1].t;
        const spinDuration = endTime - startTime;

        // Frame-to-frame deltas are noisy (a late frame advances twice the
        // angle), so measure speed over a ~100 ms sliding window.
        const speeds = speedSeries(frames);
        const peak = speeds.reduce((best, s) => (s.v > best.v ? s : best), speeds[0]);
        const speedAt = (seconds) => {
            const sample = speeds.find((s) => s.t >= seconds);
            return sample ? sample.v : 0;
        };
        const totalTurns = frames[frames.length - 1].angle / 360;
        const finalSecondDegrees = (() => {
            const from = frames.find((f) => f.t >= endTime - 1000) || frames[0];
            return frames[frames.length - 1].angle - from.angle;
        })();

        const profile = [0.1, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, spinDuration / 1000 - 0.15]
            .filter((seconds) => seconds > 0 && seconds < spinDuration / 1000)
            .map((seconds) => `${seconds.toFixed(2)}s:${speedAt(seconds).toFixed(0)}`)
            .join(' ');
        console.log(`  speed profile (deg/s): ${profile}`);

        check('makes a full multi-turn spin', totalTurns >= 6, `${totalTurns.toFixed(1)} turns in ${(spinDuration / 1000).toFixed(1)}s`);        check('eases into motion (acceleration starts at zero, no kick)', speedAt(0.1) < peak.v * 0.15,
            `${speedAt(0.1).toFixed(0)} deg/s after 100ms vs peak ${peak.v.toFixed(0)}`);
        check('reaches peak speed early, not at the halfway point', peak.progress < 0.2,
            `peak at ${(peak.progress * 100).toFixed(0)}% of the spin`);

        // Frame pacing: a smooth rotation needs a steady ~60 fps, not just the
        // right average speed.
        const gaps = [];
        for (let i = 1; i < frames.length; i += 1) gaps.push(frames[i].t - frames[i - 1].t);
        const sortedGaps = [...gaps].sort((a, b) => a - b);
        const medianGap = sortedGaps[Math.floor(sortedGaps.length / 2)];
        const p95Gap = sortedGaps[Math.floor(sortedGaps.length * 0.95)];
        const worstGap = sortedGaps[sortedGaps.length - 1];
        check('rotation is frame-smooth (no stutter)', p95Gap < 35 && worstGap < 120,
            `median ${medianGap.toFixed(1)}ms, p95 ${p95Gap.toFixed(1)}ms, worst ${worstGap.toFixed(1)}ms`);

        // The finish is the part people watch: the last full revolution should
        // take a large slice of the spin, and arrive slowly.
        const finalTurnStart = frames.find((f) => f.angle >= (totalTurns - 1) * 360);
        const finalTurnShare = finalTurnStart ? (endTime - finalTurnStart.t) / spinDuration : 1;
        check('last revolution takes its time (long, visible slowdown)', finalTurnShare >= 0.25,
            `final turn = ${(finalTurnShare * 100).toFixed(0)}% of the spin`);
        const after = speeds.filter((s) => s.progress > peak.progress + 0.05);
        const rises = after.filter((s, i) => i > 0 && s.v > after[i - 1].v + peak.v * 0.08);
        check('decelerates smoothly after the launch', rises.length === 0, `${rises.length} speed-up(s) after the peak`);
        check('comes to rest instead of stopping dead', speedAt(spinDuration / 1000 - 0.15) < peak.v * 0.12,
            `${speedAt(spinDuration / 1000 - 0.15).toFixed(0)} deg/s just before the stop`);
        check('final second is a visible slow creep, not a crawl or a slam', finalSecondDegrees > 20 && finalSecondDegrees < 200,
            `${finalSecondDegrees.toFixed(0)}° in the last second`);

        // Landing: the slice under the cursor must be the announced winner.
        // Read the settled angle straight from the DOM — the unwrapped trace is
        // relative to its first sample, so only the element itself is authoritative.
        const settledAngle = parseFloat(/rotate3d\(0, 0, 1, ([\d.eE+-]+)deg\)/.exec(
            await evaluate(`document.querySelector('canvas').style.transform`))[1]);
        const anglePerSlice = 360 / items.length;
        const cursorAngle = 90; // MainWheelSpinner default
        const underCursor = Math.floor((((cursorAngle - settledAngle) % 360) + 360) % 360 / anglePerSlice);
        check('stops exactly on the announced winner', items[underCursor] === winnerText,
            `settled at ${settledAngle.toFixed(1)}° → slice ${underCursor} ("${items[underCursor]}"), popup says "${winnerText}"`);
        check('no console errors during the spin', consoleErrors().length === 0, consoleErrors().slice(0, 2).join(' | '));

        // ── Hold-to-spin: release must be velocity-continuous ─────────────
        console.log('\nHold-to-spin');
        client.events.length = 0;
        await client.send('Page.navigate', { url: `${BASE}/food-wheel` });
        await sleep(3000);
        await evaluate(`(() => {
          window.__trace = [];
          window.__tracing = true;
          const canvas = document.querySelector('canvas');
          const sample = () => {
            const match = /rotate3d\\(0, 0, 1, ([\\d.eE+-]+)deg\\)/.exec(canvas.style.transform || '');
            if (match) window.__trace.push([performance.now(), parseFloat(match[1])]);
            if (window.__tracing) requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
          return true;
        })()`);
        const buttonBox = await evaluate(`(() => { const r = document.querySelector('.spin-center-button').getBoundingClientRect(); return JSON.stringify({ x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }); })()`);
        const point = JSON.parse(buttonBox);
        await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
        await sleep(1400);
        const heldAngle = await evaluate(`(() => { const t = window.__trace; return t.length > 5 ? t[t.length - 1][1] : 0; })()`);
        await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
        const holdFinished = await waitFor(`!!document.querySelector('.modal-card')`, 20000);
        const holdTrace = JSON.parse(await evaluate(`(() => { window.__tracing = false; return JSON.stringify(window.__trace || []); })()`));

        const holdFrames = unwrapAngles(holdTrace);
        const heldRate = rateBetween(holdFrames, 700, 1300);
        const justAfterRelease = rateBetween(holdFrames, 1500, 1800);
        const lateRate = rateBetween(holdFrames, holdFrames[holdFrames.length - 1].t - 400, holdFrames[holdFrames.length - 1].t);

        check('wheel turns while the centre button is held', heldAngle > 0 && heldRate > 300,
            `${heldRate.toFixed(0)} deg/s during the hold`);
        check('release keeps the wheel moving (no stop-then-restart)', justAfterRelease > heldRate * 0.5 && justAfterRelease <= heldRate * 1.5,
            `${heldRate.toFixed(0)} deg/s held → ${justAfterRelease.toFixed(0)} deg/s after release`);
        check('hold release decelerates to a stop', lateRate < heldRate * 0.15, `${lateRate.toFixed(0)} deg/s at the end`);
        check('hold-to-spin lands on a winner', holdFinished, await evaluate(`document.querySelector('.modal-winner') ? document.querySelector('.modal-winner').textContent.trim() : 'no popup'`));
        check('no console errors during hold-to-spin', consoleErrors().length === 0, consoleErrors().slice(0, 2).join(' | '));

        console.log('\n/food-wheel (mobile 390x844)');
        await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        client.events.length = 0;
        await client.send('Page.navigate', { url: `${BASE}/food-wheel` });
        await sleep(3500);
        const overflow = await evaluate(`document.documentElement.scrollWidth - window.innerWidth`);
        check('no horizontal overflow', overflow <= 2, `${overflow}px`);
        check('wheel fits the viewport', await evaluate(`(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); })()`) > 200);
        check('tabs usable on mobile', await evaluate(`document.querySelectorAll('.tabs .tab-btn').length`) === 4);
        const mobileCanvas = JSON.parse(await evaluate(`(() => {
          const c = document.querySelector('canvas');
          const r = c.getBoundingClientRect();
          return JSON.stringify({ backing: c.width, displayed: Math.round(r.width), dpr: window.devicePixelRatio || 1 });
        })()`));
        check('canvas stays crisp on a 2× display',
            mobileCanvas.dpr >= 2 && mobileCanvas.backing >= mobileCanvas.displayed * 2 - 2,
            `${mobileCanvas.backing}px backing store for ${mobileCanvas.displayed}px displayed (dpr ${mobileCanvas.dpr})`);
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
