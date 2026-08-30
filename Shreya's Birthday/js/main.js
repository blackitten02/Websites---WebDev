/* ============================================================= */
/*  SHREYA'S BIRTHDAY — shared interactions (every page)         */
/* ============================================================= */

/* ---------------------------------------------------------------
   ✏️  CONFIG
   --------------------------------------------------------------- */

// Her name
const FRIEND_NAME = "Shreya";

/* 🎵  YOUR SONGS (2, looping).
   The real tracks you provided (Saude Bazi + Maiyya) live in /music and loop
   automatically: song 1 → song 2 → back to song 1. */
const PLAYLIST = [
  { title: "Saude Bazi", src: "music/saude-bazi.mp3" },
  { title: "Maiyya",     src: "music/maiyya.mp3"   },
  // add more anytime: { title: "Song name", src: "music/your-song.mp3" },
];

const MUSIC_KEY = "shreya_bday_music";   // persists play state across pages
const STARTED_KEY = "shreya_bday_started";

/* ---------------------------------------------------------------
   AMBIENT PARTICLES + CONFETTI (single canvas, no libraries)
   --------------------------------------------------------------- */
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
let W, H, DPR;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.width = innerWidth * DPR;
  H = canvas.height = innerHeight * DPR;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
}
resize();
addEventListener("resize", resize);

const EMOJIS = ["❤️", "⭐", "🌸", "✨", "💫", "🤍", "🌟", "🌷"];
const COLORS = ["#f7c6d0", "#e89aaa", "#d9c7f0", "#ffd9c0", "#e9c46a", "#ffffff"];
const ambient = [];
const confetti = [];

function newAmbient() {
  return {
    x: Math.random() * W, y: Math.random() * H,
    e: EMOJIS[(Math.random() * EMOJIS.length) | 0],
    s: (10 + Math.random() * 16) * DPR,
    vy: -(6 + Math.random() * 14) * DPR / 60,
    vx: (Math.random() - 0.5) * 8 * DPR / 60,
    a: 0.18 + Math.random() * 0.32,
    rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.02,
  };
}
function spawnAmbient() {
  const n = reduceMotion ? 0 : innerWidth < 600 ? 22 : 40;
  for (let i = 0; i < n; i++) ambient.push(newAmbient());
}
function burstConfetti(count = 170) {
  if (reduceMotion) return;
  for (let i = 0; i < count; i++) {
    confetti.push({
      x: W / 2 + (Math.random() - 0.5) * W * 0.35, y: H * 0.32,
      vx: (Math.random() - 0.5) * W * 0.013, vy: -(Math.random() * H * 0.013) - H * 0.004,
      g: H * 0.00055, w: 6 * DPR + Math.random() * 7 * DPR, h: 9 * DPR + Math.random() * 8 * DPR,
      c: COLORS[(Math.random() * COLORS.length) | 0], rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, life: 1,
    });
  }
}
function frame() {
  ctx.clearRect(0, 0, W, H);
  for (const p of ambient) {
    p.y += p.vy; p.x += p.vx; p.rot += p.vr;
    if (p.y < -30 * DPR) { p.y = H + 20 * DPR; p.x = Math.random() * W; }
    ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.font = p.s + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(p.e, 0, 0); ctx.restore();
  }
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.vy += c.g; c.x += c.vx; c.y += c.vy; c.rot += c.vr; c.life -= 0.004;
    if (c.y > H + 40 * DPR || c.life <= 0) { confetti.splice(i, 1); continue; }
    ctx.save(); ctx.globalAlpha = Math.max(0, c.life); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
    ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); ctx.restore();
  }
  requestAnimationFrame(frame);
}
spawnAmbient();
frame();

/* ---------------------------------------------------------------
   HIDDEN MUSIC PLAYER (persists across pages via localStorage)
   --------------------------------------------------------------- */
const audio = new Audio();
audio.preload = "auto";
let current = 0;
let isPlaying = false;
let errStreak = 0;
let lastSave = 0;

const musicEl = document.getElementById("music");
const toggleBtn = document.getElementById("music-toggle");
const songNameEl = document.getElementById("song-name");
const playlistEl = document.getElementById("playlist");
const playlistList = document.getElementById("playlist-list");

// build the little playlist (pill popover) + the big one (music page) if present
function buildPlaylist(target, onClick) {
  if (!target) return;
  PLAYLIST.forEach((s, i) => {
    const li = document.createElement("li");
    li.dataset.index = i;
    li.innerHTML = `<span class="eqi">♪</span><span>${s.title}</span>`;
    li.addEventListener("click", () => onClick(i));
    target.appendChild(li);
  });
}
buildPlaylist(playlistList, (i) => { loadSong(i, true); playlistEl.hidden = true; });

// (the dedicated Music page was removed — the hidden pill player is the only music UI)

function saveState() {
  try { localStorage.setItem(MUSIC_KEY, JSON.stringify({ playing: isPlaying, index: current, time: audio.currentTime || 0 })); } catch (e) {}
}
function loadState() {
  try { return JSON.parse(localStorage.getItem(MUSIC_KEY)) || { playing: false, index: 0, time: 0 }; }
  catch (e) { return { playing: false, index: 0, time: 0 }; }
}
function escapeHTML(s){ return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function updateSongUI() {
  if (!PLAYLIST.length) { songNameEl.textContent = "add songs 🎵"; return; }
  songNameEl.textContent = PLAYLIST[current].title;
  document.querySelectorAll("#playlist-list li").forEach((li, i) =>
    li.classList.toggle("active", i === current));
}
function setPlayingUI(playing) {
  if (musicEl) { musicEl.classList.toggle("playing", playing); musicEl.classList.remove("pulse"); }
  if (toggleBtn) toggleBtn.textContent = playing ? "❚❚" : "▶";
  if (songNameEl) songNameEl.classList.toggle("paused", !playing);
}
function play() {
  if (!PLAYLIST.length) return;
  audio.play()
    .then(() => { isPlaying = true; errStreak = 0; setPlayingUI(true); saveState(); })
    .catch(() => { isPlaying = false; setPlayingUI(false); });
}
function pause() { audio.pause(); isPlaying = false; setPlayingUI(false); saveState(); }
function loadSong(i, autoplay, resumeTime) {
  if (!PLAYLIST.length) return;
  current = (i + PLAYLIST.length) % PLAYLIST.length;
  audio.src = PLAYLIST[current].src;
  updateSongUI();
  if (resumeTime && resumeTime > 0.3) {
    const t = resumeTime;
    const onMeta = () => {
      try { audio.currentTime = t; } catch (e) {}
      audio.removeEventListener("loadedmetadata", onMeta);
      if (autoplay) play();
    };
    audio.addEventListener("loadedmetadata", onMeta);
  } else if (autoplay) {
    play();
  }
}
audio.addEventListener("ended", () => loadSong(current + 1, true));
audio.addEventListener("timeupdate", () => {
  const now = Date.now();
  if (now - lastSave > 2000) { lastSave = now; saveState(); }
});
audio.addEventListener("error", () => {
  errStreak++;
  if (errStreak > PLAYLIST.length) { isPlaying = false; setPlayingUI(false); return; }
  setTimeout(() => loadSong(current + 1, true), 500);
});
window.addEventListener("beforeunload", saveState);

if (toggleBtn) toggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (audio.paused) play(); else pause();
});
const musicMeta = document.querySelector(".music__meta");
if (musicMeta) musicMeta.addEventListener("click", () => { if (playlistEl) playlistEl.hidden = !playlistEl.hidden; });

/* ---------------------------------------------------------------
   START THE JOURNEY (homepage) — unlocks audio via user gesture
   --------------------------------------------------------------- */
const startBtn = document.getElementById("start-btn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    localStorage.setItem(STARTED_KEY, "1");
    const menu = document.getElementById("home-menu");
    if (menu) menu.classList.add("ready");
    if (musicEl) musicEl.classList.remove("hidden");
    if (!isPlaying) play();
    burstConfetti(200);
  });
}

// start music automatically on every page; keep its exact position across pages
function startMusicAuto() {
  const st = loadState();
  loadSong(st.index || 0, true, st.time || 0);   // autoplay + resume from saved time
  if (musicEl) musicEl.classList.remove("hidden");
  // autoplay policies block sound until a user gesture — so also start on first tap/click/key
  const kick = () => {
    if (!isPlaying) play();
    if (localStorage.getItem(STARTED_KEY) !== "1") {
      localStorage.setItem(STARTED_KEY, "1");
      const m = document.getElementById("home-menu");
      if (m) m.classList.add("ready");
    }
    ["pointerdown", "keydown", "touchstart"].forEach((ev) => document.removeEventListener(ev, kick));
  };
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => document.addEventListener(ev, kick));
  // if still blocked, gently invite a tap on the pill
  setTimeout(() => { if (!isPlaying && musicEl) musicEl.classList.add("pulse"); }, 1200);
}
startMusicAuto();

// autoshow the menu if she already started (e.g. revisiting home)
if (localStorage.getItem(STARTED_KEY) === "1") {
  const menu = document.getElementById("home-menu");
  if (menu) menu.classList.add("ready");
  if (musicEl) musicEl.classList.remove("hidden");
}

/* ---------------------------------------------------------------
   "More" dropdown (homepage) — tap to toggle on touch
   --------------------------------------------------------------- */
const moreEl = document.querySelector(".mlink--more");
if (moreEl) moreEl.addEventListener("click", (e) => {
  if (e.target.closest("a")) return; // let sub-links navigate
  moreEl.classList.toggle("open");
});

/* ---------------------------------------------------------------
   NAV UNDERLINE follows the cursor's horizontal position
   --------------------------------------------------------------- */
document.querySelectorAll(".mlink, .topnav a").forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    el.style.setProperty("--ox", x + "%");
  });
});

/* ---------------------------------------------------------------
   SMOOTH PAGE TRANSITIONS (intercept internal .html links)
   --------------------------------------------------------------- */
document.querySelectorAll('a[href$=".html"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http")) return;
    e.preventDefault();
    saveState();
    document.body.classList.add("is-leaving");
    setTimeout(() => { window.location.href = href; }, 420);
  });
});

/* ---------------------------------------------------------------
   SCROLL REVEALS
   --------------------------------------------------------------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); revealObs.unobserve(en.target); } });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

/* ---------------------------------------------------------------
   LETTER — typewriter (runs once when scrolled into view)
   --------------------------------------------------------------- */
const letterBody = document.getElementById("letter-body");
const caret = document.getElementById("letter-caret");
const letterEl = document.getElementById("letter");
if (letterBody && letterEl) {
  const letterSrc = [...letterBody.querySelectorAll("p")].map((p) => p.textContent);
  let letterTyped = false;
  function typeLetter() {
    if (letterTyped) return; letterTyped = true;
    letterBody.innerHTML = ""; if (caret) caret.classList.add("on");
    let p = 0, c = 0, cur = null;
    function step() {
      if (p >= letterSrc.length) { if (caret) caret.classList.remove("on"); return; }
      if (!cur) { cur = document.createElement("p"); letterBody.appendChild(cur); }
      const text = letterSrc[p];
      cur.textContent = text.slice(0, c + 1); c++;
      if (c >= text.length) { p++; c = 0; cur = null; }
      setTimeout(step, 11);
    }
    step();
  }
  const letterObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { typeLetter(); letterObs.disconnect(); } });
  }, { threshold: 0.2 });
  letterObs.observe(letterEl);
  // start right away if the letter is already on screen (e.g. opened directly)
  if (letterEl.getBoundingClientRect().top < window.innerHeight * 0.95) {
    setTimeout(typeLetter, 600);
  }
}

/* ---------------------------------------------------------------
   LYRICS — active line detection (Reels style)
   --------------------------------------------------------------- */
const lyricObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => en.target.classList.toggle("is-active", en.isIntersecting));
}, { threshold: 0.55 });
document.querySelectorAll(".lyric").forEach((el) => lyricObs.observe(el));
const firstLyric = document.querySelector(".lyric");
if (firstLyric) firstLyric.classList.add("is-active");

/* ---------------------------------------------------------------
   FUN — flip cards + a little confetti when opened
   --------------------------------------------------------------- */
document.querySelectorAll(".flip").forEach((card) => {
  card.addEventListener("click", () => { card.classList.toggle("open"); if (card.classList.contains("open")) burstConfetti(60); });
});

/* ---------------------------------------------------------------
   MEMORIES — click a polaroid to open a lightbox
   --------------------------------------------------------------- */
const lightbox = document.getElementById("lightbox");
if (lightbox) {
  const lbImg = lightbox.querySelector("img");
  const lbCap = lightbox.querySelector("figcaption");
  document.querySelectorAll(".polaroid:not(.polaroid--note)").forEach((p) => {
    p.addEventListener("click", () => {
      const img = p.querySelector("img");
      const cap = p.querySelector("figcaption");
      if (img) lbImg.src = img.src;
      if (cap) lbCap.textContent = cap.textContent;
      lightbox.classList.add("open");
    });
  });
  lightbox.addEventListener("click", () => lightbox.classList.remove("open"));
}

/* ---------------------------------------------------------------
   REPLAY (ending)
   --------------------------------------------------------------- */
const replayBtn = document.getElementById("replay");
if (replayBtn) replayBtn.addEventListener("click", () => { burstConfetti(170); window.scrollTo({ top: 0, behavior: "smooth" }); });

/* ---------------------------------------------------------------
   mark body loaded (page fade-in)
   --------------------------------------------------------------- */
requestAnimationFrame(() => document.body.classList.add("is-loaded"));
