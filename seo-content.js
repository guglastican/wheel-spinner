/**
 * seo-content.js — builds the localized, crawlable page body that
 * prerender.js injects into <div id="app">.
 *
 * The markup mirrors the sections each Vue page component renders (same
 * locale keys, same order), so the static HTML a crawler reads without
 * JavaScript is the same text a visitor sees, just before Vue mounts.
 */

const {
    DOMAIN,
    SUPPORTED_LOCALES,
    LANG_NAMES,
    ROUTE_SECTIONS,
    PAGE_META_KEYS,
    getKey,
    t,
    node,
    stripTags,
    pageUrl,
    translatedLocales,
    isTranslated
} = require('./seo-config.js');

// ─── Escaping helpers ────────────────────────────────────────────────────────

function esc(value) {
    // Quotes ("), ampersands and angle brackets are escaped because the output
    // is used in double-quoted attributes; apostrophes are left alone so that
    // localized text keeps its natural length and characters.
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Escape a translated string but keep the small set of inline tags the locale
 * files legitimately use (<strong>, <em>, <b>, <i>, <br>). Everything else is
 * escaped, so no locale string can inject markup or scripts.
 */
function rich(value) {
    if (value == null) return '';
    return esc(value).replace(/&lt;(\/?)(strong|em|b|i|br)\s*\/?&gt;/gi, '<$1$2>');
}

// ─── Generic list/card extraction ────────────────────────────────────────────

/**
 * Normalises any locale list object into renderable entries.
 * Handles the three shapes used across the locale files:
 *   { "1": "text", "2": "text" }            → plain list items
 *   { "1Title": "…", "1Desc": "…" }         → card / FAQ pairs
 *   { "modes": "text", "editing": "text" }  → named plain list items
 */
function collectItems(container) {
    if (!container || typeof container !== 'object') return [];
    const keys = Object.keys(container);
    const entries = [];
    const consumed = new Set();

    const numericKeys = keys.filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    for (const key of numericKeys) {
        if (typeof container[key] === 'string') {
            entries.push({ text: container[key] });
            consumed.add(key);
        }
    }

    const titleKeys = keys.filter((k) => /Title$/.test(k));
    for (const key of titleKeys) {
        const descKey = key.replace(/Title$/, 'Desc');
        entries.push({ title: container[key], desc: container[descKey] });
        consumed.add(key);
        consumed.add(descKey);
    }

    for (const key of keys) {
        if (consumed.has(key) || /Desc$/.test(key)) continue;
        if (typeof container[key] === 'string') entries.push({ text: container[key] });
    }

    return entries.filter((entry) => {
        if (entry.title != null) return String(entry.title).trim() !== '' || String(entry.desc || '').trim() !== '';
        return String(entry.text || '').trim() !== '';
    });
}

/** `<ol>` / `<ul>` of plain items, or `<ul>` of title+description cards. */
function renderItems(container, { ordered = false, card = false } = {}) {
    const items = collectItems(container);
    if (!items.length) return '';
    const hasCards = card || items.some((item) => item.title != null);
    const tag = ordered && !hasCards ? 'ol' : 'ul';
    const listClass = hasCards ? 'rw-pr-cards' : 'rw-pr-list';
    const rows = items.map((item) => {
        if (item.title != null) {
            const desc = item.desc != null && String(item.desc).trim() !== ''
                ? `\n          <p class="rw-pr-p">${rich(item.desc)}</p>`
                : '';
            return `        <li class="rw-pr-card">\n          <h3 class="rw-pr-h3">${rich(item.title)}</h3>${desc}\n        </li>`;
        }
        return `        <li class="rw-pr-item">${rich(item.text)}</li>`;
    }).join('\n');
    return `      <${tag} class="${listClass}">\n${rows}\n      </${tag}>`;
}

// ─── Article renderer (Spin the Wheel / Twister Spinner long-form copy) ──────

/** Article sections that link to another tool (mirrors the Vue components). */
const ARTICLE_LINK_ROUTES = { 3: 'wheel-of-names', 4: 'food-wheel', 5: 'yes-no-wheel', 6: '' };

function renderArticle(locale, section) {
    const article = node(locale, `${section}.article`);
    if (!article || typeof article !== 'object') return '';
    const blocks = [];
    for (let n = 1; n <= 8; n += 1) {
        const title = article[`sec${n}Title`];
        if (!title) continue;
        let body = '';
        if (article[`sec${n}Text`]) {
            body = `      <p class="rw-pr-p">${rich(article[`sec${n}Text`])}</p>`;
        } else if (article[`sec${n}TextStart`]) {
            const route = Object.prototype.hasOwnProperty.call(ARTICLE_LINK_ROUTES, n) ? ARTICLE_LINK_ROUTES[n] : '';
            const href = pageUrl(locale, route);
            const link1 = article[`sec${n}LinkText`]
                ? `<a class="rw-pr-inline" href="${esc(href)}">${rich(article[`sec${n}LinkText`])}</a>`
                : '';
            const link2 = article[`sec${n}LinkText2`]
                ? `<a class="rw-pr-inline" href="${esc(href)}">${rich(article[`sec${n}LinkText2`])}</a>`
                : '';
            const parts = [
                rich(article[`sec${n}TextStart`]),
                link1,
                rich(article[`sec${n}TextMiddle`]),
                link2,
                rich(article[`sec${n}TextEnd`])
            ].filter((part) => part !== '');
            body = `      <p class="rw-pr-p">${parts.join(' ')}</p>`;
        }
        blocks.push(`    <section class="rw-pr-sec">\n      <h2 class="rw-pr-h2">${rich(title)}</h2>\n${body}\n    </section>`);
    }
    return blocks.join('\n');
}

// ─── Section plans (mirror the Vue page components) ──────────────────────────

const CONTENT_PLANS = {
    '': [
        { h: 'whatIsTitle', p: 'whatIsDesc' },
        { h: 'howWorksTitle', p: 'howWorksDesc', sub: 'stepsTitle', ol: 'stepsList' },
        { h: 'manageTitle', p: 'manageDesc', ul: 'manageList' },
        { h: 'otherToolsTitle', p: 'otherToolsDesc', ul: 'otherToolsList', p2: 'otherToolsOutro' }
    ],
    'wheel-of-names': [
        { h: 'howToTitle', ol: 'steps' },
        { h: 'seoTitle', p: 'seoDesc', ul: 'seoList' },
        { h: 'whyTitle', p: 'whyDesc', cards: 'features', cardStyle: true },
        { h: 'tipsTitle', cards: 'tips', cardStyle: true },
        { h: 'faqTitle', cards: 'faqs', cardStyle: true }
    ],
    'yes-no-wheel': [
        { h: 'howToTitle', ol: 'steps' },
        { h: 'seoTitle', p: 'seoDesc1', p2: 'seoDesc2', ul: 'seoList' },
        { h: 'moreTitle', p: 'moreDesc', ul: 'moreList' },
        { h: 'powerTitle', p: 'powerDesc' },
        { h: 'faqTitle', cards: 'faqs', cardStyle: true }
    ],
    'food-wheel': [
        { h: 'howToTitle', ol: 'steps' },
        { h: 'seoTitle', p: 'seoDesc', ul: 'seoList' },
        { h: 'whyTitle', p: 'whyDesc', cards: 'features', cardStyle: true },
        { h: 'faqTitle', cards: 'faqs', cardStyle: true }
    ],
    'spin-the-wheel': [
        { h: 'howToTitle', ol: 'steps' },
        { h: 'seoTitle', p: 'seoDesc', ul: 'seoList' },
        { h: 'whyTitle', p: 'whyDesc', cards: 'features', cardStyle: true },
        { article: true }
    ],
    'twister-spinner': [
        { h: 'howToTitle', ol: 'steps' },
        { h: 'seoTitle', p: 'seoDesc', ul: 'seoList' },
        { h: 'whyTitle', p: 'whyDesc', cards: 'features', cardStyle: true },
        { h: 'faqTitle', cards: 'faqs', cardStyle: true },
        { article: true }
    ]
};

/** Related-tool cards (mirrors the "exploreMore" blocks in the components). */
const TOOL_CARDS = [
    { route: '', titleKey: 'exploreMore.rwTitle', descKey: 'exploreMore.rwDesc' },
    { route: 'wheel-of-names', titleKey: 'exploreMore.wonTitle', descKey: 'exploreMore.wonDesc' },
    { route: 'yes-no-wheel', titleKey: 'exploreMore.ynwTitle', descKey: 'exploreMore.ynwDesc' },
    { route: 'twister-spinner', titleKey: 'exploreMore.tsTitle', descKey: 'exploreMore.tsDesc' },
    { route: 'spin-the-wheel', titleKey: 'exploreMore.stwTitle', descKey: 'exploreMore.stwDesc' }
];

const ROUTE_DESC_KEYS = {
    'food-wheel': 'exploreMore.descFood'
};

function renderSection(locale, section, spec) {
    const heading = spec.h ? t(locale, `${section}.${spec.h}`) : '';
    const body = [];

    if (spec.p) body.push(`      <p class="rw-pr-p">${rich(t(locale, `${section}.${spec.p}`))}</p>`);
    if (spec.p2) body.push(`      <p class="rw-pr-p">${rich(t(locale, `${section}.${spec.p2}`))}</p>`);

    if (spec.sub) {
        const sub = t(locale, `${section}.${spec.sub}`);
        if (sub) body.push(`      <h3 class="rw-pr-h3">${rich(sub)}</h3>`);
    }
    if (spec.ol) {
        const html = renderItems(node(locale, `${section}.${spec.ol}`), { ordered: true });
        if (html) body.push(html);
    }
    if (spec.ul) {
        const html = renderItems(node(locale, `${section}.${spec.ul}`));
        if (html) body.push(html);
    }
    if (spec.cards) {
        const html = renderItems(node(locale, `${section}.${spec.cards}`), { card: true });
        if (html) body.push(html);
    }

    if (!body.length && !heading) return '';
    const head = heading ? `      <h2 class="rw-pr-h2">${rich(heading)}</h2>\n` : '';
    return `    <section class="rw-pr-sec">\n${head}${body.join('\n')}\n    </section>`;
}

/** Related tools block with real, crawlable internal links. */
function renderRelatedTools(locale, currentRoute) {
    const cards = TOOL_CARDS
        .filter((card) => card.route !== currentRoute)
        .map((card) => {
            const title = t(locale, card.titleKey);
            const desc = t(locale, card.descKey);
            if (!title) return '';
            return `        <li class="rw-pr-card">
          <h3 class="rw-pr-h3"><a class="rw-pr-link" href="${esc(pageUrl(locale, card.route))}">${rich(title)}</a></h3>
          <p class="rw-pr-p">${rich(desc)}</p>
        </li>`;
        })
        .filter(Boolean)
        .join('\n');
    if (!cards) return '';
    const heading = t(locale, 'exploreMore.title');
    const intro = t(locale, ROUTE_DESC_KEYS[currentRoute] || 'exploreMore.descDefault');
    const introHtml = intro ? `\n      <p class="rw-pr-p">${rich(intro)}</p>` : '';
    return `    <section class="rw-pr-sec rw-pr-related">
      <h2 class="rw-pr-h2">${rich(heading)}</h2>${introHtml}
      <ul class="rw-pr-cards">
${cards}
      </ul>
    </section>`;
}

/**
 * Language switch block: real <a href> links to the same page in every other
 * language. This is the crawlable counterpart of the header dropdown, so
 * Google can discover and re-crawl each language variant from any page.
 */
function renderLanguages(locale, route) {
    const locales = translatedLocales(route).filter((loc) => loc !== locale);
    if (!locales.length) return '';
    const heading = t(locale, 'footer.languages') || 'Languages';
    const items = locales.map((loc) => {
        const label = LANG_NAMES[loc] || loc.toUpperCase();
        return `        <li><a class="rw-pr-lang" href="${esc(pageUrl(loc, route))}" hreflang="${esc(loc)}" lang="${esc(loc)}">${esc(label)}</a></li>`;
    }).join('\n');
    return `    <section class="rw-pr-sec rw-pr-langs">
      <h2 class="rw-pr-h2">${rich(heading)}</h2>
      <ul class="rw-pr-langlist">
${items}
      </ul>
    </section>`;
}

/**
 * Full crawlable body for a locale × route page.
 * @returns {string} HTML to place inside <div id="app">.
 */
function buildContentHtml(locale, route, { includeLanguageBlock = true } = {}) {
    const section = ROUTE_SECTIONS[route];
    if (!section) return '';
    const meta = PAGE_META_KEYS[route] || PAGE_META_KEYS[''];
    const heading = t(locale, meta.h1Key) || t(locale, meta.titleKey);
    const lead = route === '' ? '' : t(locale, meta.descKey);
    const plan = CONTENT_PLANS[route] || [];

    const parts = [];
    parts.push(`    <h1 class="rw-pr-h1">${rich(stripTags(heading) || heading)}</h1>`);
    if (lead) parts.push(`    <p class="rw-pr-lead">${rich(lead)}</p>`);

    for (const spec of plan) {
        if (spec.article) {
            const article = renderArticle(locale, section);
            if (article) parts.push(article);
            continue;
        }
        const html = renderSection(locale, section, spec);
        if (html) parts.push(html);
    }

    const related = renderRelatedTools(locale, route);
    if (related) parts.push(related);
    if (includeLanguageBlock) {
        const langs = renderLanguages(locale, route);
        if (langs) parts.push(langs);
    }

    return `  <div class="rw-pr">
    <main class="rw-pr-main">
${parts.join('\n')}
    </main>
  </div>`;
}

/**
 * Small stylesheet for the prerendered block. It only styles the static
 * content that exists before Vue mounts, so it is harmless afterwards.
 */
function buildPrerenderCss() {
    return `    /* Prerendered crawlable content — replaced by the app on mount */
    .rw-pr { background: #f8f9fa; color: #333; font-family: Arial, Helvetica, sans-serif; line-height: 1.65; }
    .rw-pr-main { max-width: 900px; margin: 0 auto; padding: 28px 20px 48px; }
    .rw-pr-h1 { font-size: clamp(1.6rem, 3.4vw, 2.4rem); color: #1a1a2e; margin: 0 0 14px; line-height: 1.25; text-align: center; }
    .rw-pr-lead { font-size: 1.05rem; color: #444; margin: 0 auto 28px; max-width: 760px; text-align: center; }
    .rw-pr-sec { margin: 0 0 30px; }
    .rw-pr-h2 { font-size: 1.35rem; color: #1a1a2e; margin: 0 0 12px; }
    .rw-pr-h3 { font-size: 1.05rem; color: #1a1a2e; margin: 0 0 6px; }
    .rw-pr-p { margin: 0 0 10px; }
    .rw-pr-list { margin: 0 0 10px; padding-inline-start: 22px; }
    .rw-pr-item { margin-bottom: 8px; }
    .rw-pr-cards { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .rw-pr-card { background: #fff; border: 1px solid #e6e6ee; border-radius: 12px; padding: 14px 16px; }
    .rw-pr-link, .rw-pr-inline { color: #6c5ce7; text-decoration: none; font-weight: 600; }
    .rw-pr-link:hover, .rw-pr-inline:hover { text-decoration: underline; }
    .rw-pr-langlist { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px 18px; }
    .rw-pr-lang { color: #555; text-decoration: none; }
    .rw-pr-lang:hover { color: #6c5ce7; text-decoration: underline; }
    @media (prefers-color-scheme: dark) {
      .rw-pr { background: #16181d; color: #dfe3ea; }
      .rw-pr-h1, .rw-pr-h2, .rw-pr-h3 { color: #f3f5f9; }
      .rw-pr-lead { color: #c3c9d4; }
      .rw-pr-card { background: #1e2129; border-color: #2b2f3a; }
      .rw-pr-lang { color: #aab2c0; }
    }`;
}

module.exports = {
    esc,
    rich,
    collectItems,
    renderItems,
    renderArticle,
    renderSection,
    renderRelatedTools,
    renderLanguages,
    buildContentHtml,
    buildPrerenderCss,
    CONTENT_PLANS,
    TOOL_CARDS
};
