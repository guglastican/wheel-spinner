# Wheel Spinner Component

A customizable wheel spinner component built with Vue.js.

![image](https://github.com/ilyasozkurt/vue-wheel-spinner/assets/4955440/08cb6195-60eb-4ac4-82cb-2a4b5296dc5e)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Slots](#slots)
- [Events](#events)
- [License](#license)
- [Demo](https://vue-wheel-spinner-demo.vercel.app/)
- [Demo Project Source](https://stackblitz.com/~/github.com/ilyasozkurt/vue-wheel-spinner)

## Installation

To use this component, you need to have a Vue.js project set up. If you don't have one, you can create a new Vue.js
project using Vue CLI:

```sh
npm install -g @vue/cli
vue create my-project
cd my-project
```

Install the component

```sh
npm install vue-wheel-spinner
```

## Usage

Import and register the component in your Vue component:

```vue

<template>

  <VueWheelSpinner
      ref="spinner"
      :slices="slices"
      :winner-index="defaultWinner"
      :sounds="sounds"
      :cursor-angle="cursorAngle"
      :cursor-position="cursorPosition"
      :cursor-distance="cursorDistance"
      @spin-start="onSpinStart"
      @spin-end="onSpinEnd">

    <template #cursor>
      <img class="cursor-img" :src="cursorImage" alt="Cursor">
    </template>

    <template #default>
      <button
          class="spin-button"
          :disabled="isSpinning"
          @click="handleSpinButtonClick"
          @mouseover="handleSpinButtonHover"
          @mouseleave="handleSpinButtonLeave">
        Spin
      </button>
    </template>

  </VueWheelSpinner>

</template>

<script>
  import VueWheelSpinner from 'vue-wheel-spinner';

  import cursorImage from './assets/cursor.svg';
  import wonSound from './sounds/won.mp3';
  import clickSound from './sounds/click.mp3';
  import hoverSound from './sounds/hover.mp3';
  import leaveSound from './sounds/leave.mp3';
  import spinningSound from './sounds/spinning.mp3';

  export default {
    components: {
      VueWheelSpinner
    },
    data() {
      return {
        winnerResult: null,
        slices: [
          {color: '#eb4d4b', text: 'Slice 1'},
          {color: '#f0932b', text: 'Slice 2'},
          {color: '#f9ca24', text: 'Slice 3'},
          {color: '#badc58', text: 'Slice 4'},
          {color: '#7ed6df', text: 'Slice 5'},
          {color: '#e056fd', text: 'Slice 6'}
        ],
        isSpinning: false,
        defaultWinner: 0,
        sounds: {
          won: wonSound,
          spinButtonClick: clickSound,
          spinButtonHover: hoverSound,
          spinButtonLeave: leaveSound,
          spinning: spinningSound
        },
        cursorImage,
        cursorAngle: 0,
        cursorPosition: 'edge',
        cursorDistance: 0
      };
    },
    methods: {
      playAudio(audio) {
        if (audio) {
          audio.volume = 0.5
          audio.play();
        }
      },
      handleSpinButtonClick() {
        if (this.buttonClickAudio) {
          this.playAudio(this.buttonClickAudio)
        }
        this.$refs.spinner.spinWheel(this.defaultWinner);
      },
      handleSpinButtonHover() {
        if (this.buttonHoverAudio) {
          this.playAudio(this.buttonHoverAudio)
        }
      },
      handleSpinButtonLeave() {
        if (this.buttonLeaveAudio) {
          this.playAudio(this.buttonLeaveAudio)
        }
      },
      spinFor(index) {
        this.defaultWinner = index;
        this.$refs.spinner.spinWheel(index);
      },
      onSpinStart() {
        this.winnerResult = null;
        this.isSpinning = true;
      },
      onSpinEnd(winnerIndex) {
        this.isSpinning = false;
        this.winnerResult = this.slices[winnerIndex];
      }
    },
    mounted() {
      this.buttonHoverAudio = new Audio(hoverSound);
      this.buttonLeaveAudio = new Audio(leaveSound);
      this.buttonClickAudio = new Audio(clickSound);
    }
  };
</script>

<style>

  .cursor-img {
    width: 50px;
    aspect-ratio: 1 / 1;
    filter: drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.19));
  }

  .spin-button {
    width: 100px;
    height: 100px;
    margin: 0 auto;
    aspect-ratio: 1 / 1;
    font-size: 20px;
    cursor: pointer;
    background: #eb4d4b;
    border-radius: 50%;
    transition: all 150ms;
    border: 10px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: white !important;
    box-shadow: inset -3px -3px 2px 2px rgba(0, 0, 0, 0.19), 3px 3px 2px 2px rgba(0, 0, 0, 0.19);
    z-index: 11;
    position: relative;
    user-select: none;

    &:hover {
      box-shadow: inset -5px -5px 2px 2px rgba(0, 0, 0, 0.19), 3px 3px 2px 2px rgba(0, 0, 0, 0.19);
    }

    &:active {
      box-shadow: inset 3px 3px 2px 2px rgba(0, 0, 0, 0.19), 3px 3px 2px 2px rgba(0, 0, 0, 0.19);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      pointer-events: none;
    }

  }

</style>
```

## Props

| Prop                        | Type   | Default    | Description                                                                          |
|-----------------------------|--------|------------|--------------------------------------------------------------------------------------|
| `slices`                    | Array  | required   | Array of slice objects. Each slice object should have `color` and `text` properties. |
| `winnerIndex`               | Number | 0          | Index of the slice that will be the winner.                                          |
| `spinDuration`              | Number | 4000       | Duration of the spin animation in milliseconds.                                      |
| `cursorAngle`               | Number | 0          | Angle of the cursor.                                                                 |
| `cursorPosition`            | String | 'edge'     | Position of the cursor. Can be 'edge' or 'center'.                                   |
| `cursorDistance`            | Number | 0          | Distance of the cursor from the center or edge. It's depending to cursorPosition     |
| `sounds`                    | Object | {}         | Object of sound files.                                                               |
| `sounds.won`                | String | null       | Sound file for the winning event.                                                    |
| `sounds.spinning`           | String | null       | Sound file for the spinning event.                                                   |

## Slots

| Slot         | Description                                                |
|--------------|------------------------------------------------------------|
| `cursor`     | Slot for the cursor element. Mostly an image like a cursor |
| `default`    | Slot for centered content. Mostly a circle spin button     |

## Events

| Event         | Description                                                         |
|---------------|---------------------------------------------------------------------|
| `spin-start`  | Emitted when the spin starts.                                       |
| `spin-end`    | Emitted when the spin ends. Passes the `winnerIndex` as a parameter.|


## License
This project is licensed under the MIT License.

---

## Static prerendering & SEO pipeline (randowheel.com)

Every public URL is generated as a complete static HTML file at build time, so
crawlers that do not execute JavaScript still receive the real localized page
(title, description, H1, body copy, FAQ, internal links).

### Build

```sh
npm run build      # generate-sitemap.js → vite build → prerender.js → verify-seo.js
npm run verify-seo # re-run only the SEO checks against dist/
```

| File | Responsibility |
|------|----------------|
| `seo-config.js` | Single source of truth: locales, routes, URL helpers, hreflang sets, honest `lastmod` dates |
| `seo-content.js` | Builds the localized crawlable page body from the locale files |
| `prerender.js` | Writes `dist/<path>/index.html` for 25 locales × 6 content routes (+ noindex widget routes) with canonical, hreflang, JSON-LD and body content |
| `generate-sitemap.js` | Writes `public/sitemap.xml` (150 URLs, reciprocal `xhtml:link` alternates) and `public/robots.txt` |
| `verify-seo.js` | Fails the build on: missing/duplicate titles or descriptions, duplicate page text, broken canonical or hreflang reciprocity, copied-and-pasted structured data, hidden-text patterns, sitemap/page drift |

### Conventions to keep

- **One `<h1>` per page.** Site chrome (logo, footer) must not use `<h1>`.
- **Per-URL structured data** is emitted by `prerender.js` and refreshed by the
  router guard in `src/main.js`. Never hardcode page-level JSON-LD inside a
  page component — a fixed `url` would describe the English page from every
  language version.
- **Canonical is always self-referencing**, including `noindex` widget routes
  (`/embed*`, `/configure-embed`), which must never claim the home page.
- **All localization lives in `src/locales/*.json`.** A string left in English
  makes that page a duplicate of the English one; `verify-seo.js` catches the
  cases that matter (titles, descriptions, whole-page text).
- **No hidden text.** Do not re-introduce off-screen (`left:-9999px`) or
  `aria-hidden` copy blocks; prerendered content is real, visible markup.
- `robots.txt` must not disallow the widget routes — they rely on their
  `noindex` meta tag, which Google can only read if it may fetch the URL.

