# A Little Film For You 🤍 — Shreya's Birthday (multi-page)

A cute, cinematic, scrapbook-style birthday experience built as **separate pages**,
so each chapter feels like entering a new part of a film. The homepage is the
entrance / main menu; every other page is its own world.

## The journey
```
index.html   →  Intro + interactive navigation menu (hover for tooltips ✨)
memories.html→  Scrapbook of polaroids (tap a photo to enlarge)
letter.html  →  A paper note that types itself out
lyrics.html  →  Instagram-Reels vertical lyrics (scroll slowly)
fun.html     →  Playful flip cards (tap to open)
ending.html  →  Ken-Burns montage + final credits
```
(The separate "Music" page was removed — music now lives in the hidden 🎵 pill
on every page, which is the easter egg.)

Navigate between chapters with the menu (home) or the top bar (every sub-page).
Page transitions fade smoothly.

## Music 🎵
- Starts after she taps **Start the journey** (a real user gesture → browsers allow it).
- **2 songs, looping:** `Saudaazi` → `Maaiya` → back to `Saudaazi`…
- It **persists across pages** (via `localStorage`) and auto-advances + loops.
- The 🎵 pill (bottom-right) shows the current song + play/pause. **Tap the pill**
  to reveal the hidden playlist.

### About the audio files (important)
I can't include the copyrighted tracks, so `music/saudaazi.wav` and
`music/maaiya.wav` are **soft royalty-free placeholder loops** I generated, so the
player works out of the box. To use the real songs:
1. Drop your file in `music/` (e.g. `music/saudaazi.mp3`).
2. Open `js/main.js`, find the `PLAYLIST` array near the top, and change the `src`
   from `music/saudaazi.wav` → `music/saudaazi.mp3` (same for Maaiya).
That's it — titles/labels stay as you set them.

## How to run
```bash
python3 -m http.server 8000      # then open http://localhost:8000
```

## Where to customise (all clearly commented in the code)
| What | Where |
|------|-------|
| **Her name** | `index.html` `<title>` + `.home__title`; `FRIEND_NAME` in `js/main.js` |
| **Songs** | `PLAYLIST` at the top of `js/main.js` + files in `music/` |
| **Photos** | drop more into `images/`, change `src="images/…"` in each page |
| **Lyrics** | edit the `.lyric` blocks in `lyrics.html` (add `data-bg="images/…"` for a photo behind a line) |
| **The letter** | edit the `<p>` lines inside `#letter-body` in `letter.html` |
| **Fun cards** | edit front/back of each `.flip` in `fun.html` |
| **Menu tooltips** | the `data-tip` / `.tip` text in `index.html` |
| **Colours / fonts** | `:root` variables at the top of `css/style.css` |

## File map
```
index.html  memories.html  letter.html  lyrics.html  fun.html  ending.html
css/style.css     – the whole look & animations
js/main.js        – particles, confetti, persistent music, transitions, per-page features
images/           – her photos (extracted from Shreya.pdf, optimised)
music/            – saudaazi.wav + maaiya.wav (placeholders — replace with real songs)
```

Made with way too much love. Happy birthday, Shreya. ❤️
