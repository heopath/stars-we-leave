import { CHAPTERS, COLORS, optionsFor, choose, memoriesFor, restore, endingFor } from './story.mjs';
const $ = id => document.getElementById(id);
const canvas = $('sky'), ctx = canvas.getContext('2d');
const STORAGE = 'stars-we-leave:journey:v1';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let width = innerWidth, height = innerHeight, dpr = 1, frame = 0, last = 0;
let history = [], view = 'intro', options = [], selected = null, target = null, player = { x: .62, y: .69 }, trail = [];
let pendingReflection = false, isPaused = false, pointer = null, returnFocus = null, saved = null, storageAvailable = true;
const keys = new Set();
let soundOn = false, audioContext = null, master = null, audioClock = 0;
const stars = Array.from({ length: 230 }, (_, i) => ({ x: hash(i * 9.7), y: hash(i * 13.3 + 7), r: .35 + hash(i * 2.1) * 1.1, a: .12 + hash(i * 3.7) * .55 }));
function hash(n) { const f = Math.sin(n + 31.7) * 43758.5453; return f - Math.floor(f); }
try { saved = restore(localStorage.getItem(STORAGE)); } catch { storageAvailable = false; }
if (saved?.length) $('resume').hidden = false;
if (!storageAvailable) document.querySelector('.help-note').textContent = '시간제한 없이 플레이할 수 있어요. 이 브라우저에서는 자동 저장이 제한되어 있습니다.';
function persist() {
  try { localStorage.setItem(STORAGE, JSON.stringify({ version: 1, history })); saved = [...history]; }
  catch { storageAvailable = false; $('live').textContent = '자동 저장이 제한되었습니다. 창을 닫기 전에 여정을 마쳐 주세요.'; }
}
function announce(message) { $('live').textContent = message; }
function setView(next) {
  view = next; document.body.dataset.view = next;
  ['intro', 'game', 'ending'].forEach(id => $(id).hidden = id !== next);
  $('pause').hidden = next !== 'game';
}
function openModal(id) {
  returnFocus = document.activeElement;
  keys.clear(); pointer = null;
  $(id).hidden = false;
  document.querySelector('main').inert = true;
  document.querySelector('header').inert = true;
  $(id).querySelector('[role=dialog]').focus();
}
function closeModal(id) {
  $(id).hidden = true;
  document.querySelector('main').inert = false;
  document.querySelector('header').inert = false;
  if (returnFocus?.isConnected && !returnFocus.closest('[hidden]')) returnFocus.focus({ preventScroll: true });
}
function modalOpen() { return [...document.querySelectorAll('.sheet-wrap,.overlay')].some(el => !el.hidden); }
function resize() {
  width = innerWidth; height = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  placeNodes(); placeConstellation();
}
function nodePositions() {
  return width <= 700 ? [{ x: .25, y: .41 }, { x: .74, y: .47 }, { x: .46, y: .64 }] : [{ x: .39, y: .44 }, { x: .61, y: .32 }, { x: .79, y: .51 }];
}
function endPositions() {
  return width <= 700 ? [{ x: .21, y: .45 }, { x: .5, y: .40 }, { x: .79, y: .46 }, { x: .78, y: .62 }, { x: .5, y: .66 }, { x: .22, y: .60 }] : [{ x: .34, y: .42 }, { x: .48, y: .36 }, { x: .65, y: .42 }, { x: .71, y: .59 }, { x: .52, y: .65 }, { x: .36, y: .58 }];
}
function placeNodes() {
  const positions = nodePositions();
  [...$('nodes').children].forEach((el, i) => { el.style.left = positions[i].x * 100 + '%'; el.style.top = positions[i].y * 100 + '%'; });
  if (target?.index !== undefined) { const pos = positions[target.index]; target.x = pos.x; target.y = pos.y - 16 / height; }
}
function placeConstellation() {
  const positions = endPositions();
  [...$('constellation').children].forEach((el, i) => { el.style.left = positions[i].x * 100 + '%'; el.style.top = positions[i].y * 100 + '%'; });
}
function enterScene() {
  if (history.length === 6) { showEnding(); return; }
  setView('game'); pendingReflection = false; target = null; selected = null; trail = [];
  player = { x: width <= 700 ? .54 : .59, y: .77 };
  const chapter = CHAPTERS[history.length];
  $('era').textContent = `0${history.length + 1} / ${chapter.era}`;
  $('age').textContent = chapter.age;
  $('chapter-title').textContent = chapter.title;
  $('chapter-line').textContent = chapter.line;
  $('move-hint').textContent = '빛나는 기억을 클릭해 다가가세요';
  $('memory-count').textContent = history.length;
  $('timeline').replaceChildren(...CHAPTERS.map((c, i) => { const el = document.createElement('span'); el.textContent = `${c.age}살`; el.className = i < history.length ? 'past' : i === history.length ? 'current' : ''; if (i === history.length) el.setAttribute('aria-current', 'step'); return el; }));
  options = optionsFor(history);
  $('nodes').replaceChildren(...options.map((o, i) => {
    const button = document.createElement('button'); button.className = 'memory-node'; button.style.setProperty('--node-color', o.color); button.dataset.choice = o.id;
    button.setAttribute('aria-label', `${o.who}, ${o.title}. 다가가기`);
    for (const [className, text] of [['node-orb', ''], ['node-who', o.who], ['node-title', o.title], ['node-go', '다가가기 ↗']]) { const el = document.createElement('span'); el.className = className; el.textContent = text; button.append(el); }
    button.addEventListener('click', () => approach(i)); return button;
  }));
  placeNodes(); announce(`${chapter.age}살. ${chapter.title}. ${chapter.line}`);
  if (history.length === 5) $('chapter-line').textContent = '먼저 떠난 어머니는 기억 속 별로 남았다. 나는 아직, 오늘을 걷는다.';
}
function startFresh() { history = []; persist(); enterScene(); chime(0); }
function requestRestart() { if (saved?.length || history.length) openModal('restart-dialog'); else startFresh(); }
function approach(index) {
  if (view !== 'game' || modalOpen() || pendingReflection) return;
  const pos = nodePositions()[index];
  target = { x: pos.x, y: pos.y - 16 / height, index }; selected = options[index];
  $('move-hint').textContent = `${selected.who}의 빛을 향해 걷고 있어요`;
}
function showEncounter() {
  if (!selected) return;
  $('encounter-who').textContent = `${CHAPTERS[history.length].age}살 · ${selected.who}`;
  $('encounter-who').style.color = selected.color;
  $('encounter-title').textContent = selected.title;
  $('encounter-text').textContent = selected.description;
  $('commit').textContent = `${selected.action} ↗`;
  openModal('encounter'); chime(options.indexOf(selected));
}
function commit() {
  if (!selected || pendingReflection || $('encounter').hidden) return;
  const scene = history.length;
  history = choose(history, selected.id, scene); pendingReflection = true; persist();
  closeModal('encounter'); $('nodes').hidden = true;
  const memory = memoriesFor(history).at(-1);
  $('reflection-title').textContent = memory.title;
  $('reflection-text').textContent = memory.memory;
  $('after-text').textContent = memory.after;
  $('reflection').style.setProperty('--gold', memory.color);
  $('continue').textContent = history.length === 6 ? '내가 남긴 별 만나기 ✧' : '다음 계절로 →';
  $('memory-count').textContent = history.length;
  openModal('reflection'); chime(history.length + 2);
}
function showEnding() {
  setView('ending'); target = null; selected = null; trail = []; pendingReflection = false;
  const ending = endingFor(history);
  $('ending-line').textContent = ending.line;
  $('constellation-name').textContent = `〈 ${ending.title} 〉`;
  $('save-notice').textContent = '';
  $('constellation').replaceChildren(...ending.memories.map((m, i) => {
    const button = document.createElement('button'); button.style.setProperty('--node-color', m.color); button.setAttribute('aria-label', `${m.age}살의 기억, ${m.title}`);
    for (const [className, text] of [['end-star', '✧'], ['end-age', `${m.age}살`], ['end-label', m.title]]) { const el = document.createElement('span'); el.className = className; el.textContent = text; button.append(el); }
    button.addEventListener('click', () => showMemory(i)); return button;
  }));
  placeConstellation(); announce(`당신이 남긴 별. ${ending.title}. 별을 누르면 여섯 기억을 다시 볼 수 있어요.`); chime(5);
}
function showMemory(index) {
  const m = memoriesFor(history)[index];
  $('memory-age').textContent = `${m.age}살 · ${m.who}`; $('memory-age').style.color = m.color;
  $('memory-title').textContent = m.title; $('memory-text').textContent = m.memory; $('memory-after').textContent = m.after;
  openModal('memory'); chime(index);
}
function initAudio() {
  if (audioContext) { if (audioContext.state === 'suspended') audioContext.resume().catch(() => {}); return true; }
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) { announce('이 브라우저는 소리 재생을 지원하지 않습니다.'); return false; }
  try { audioContext = new Audio(); master = audioContext.createGain(); master.gain.value = .15; master.connect(audioContext.destination); return true; } catch { return false; }
}
function chime(index) {
  if (!soundOn || !initAudio() || isPaused || document.hidden) return;
  const notes = [261.63, 329.63, 392, 440, 523.25, 659.25, 783.99];
  const start = audioContext.currentTime;
  [0, 2, 4].forEach((step, i) => {
    const osc = audioContext.createOscillator(), env = audioContext.createGain();
    osc.type = 'sine'; osc.frequency.value = notes[(index + step) % notes.length];
    env.gain.setValueAtTime(0, start); env.gain.linearRampToValueAtTime(.12 / (i + 1), start + .04 + i * .12); env.gain.exponentialRampToValueAtTime(.0001, start + 2.8 + i * .12);
    osc.connect(env); env.connect(master); osc.start(start + i * .12); osc.stop(start + 3.5); osc.onended = () => { osc.disconnect(); env.disconnect(); };
  });
}
function audioPause(paused) { if (master && audioContext) master.gain.setTargetAtTime(paused || !soundOn ? 0 : .15, audioContext.currentTime, .15); }
function star(x, y, radius, color, alpha = 1, cross = false) {
  ctx.save(); ctx.globalAlpha = alpha;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 12); glow.addColorStop(0, color + '70'); glow.addColorStop(.15, color + '20'); glow.addColorStop(1, color + '00');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, radius * 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  if (cross) { ctx.strokeStyle = color; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x - radius * 4, y); ctx.lineTo(x + radius * 4, y); ctx.moveTo(x, y - radius * 4); ctx.lineTo(x, y + radius * 4); ctx.stroke(); }
  ctx.restore();
}
function drawBackground(time) {
  const bg = ctx.createLinearGradient(0, 0, width, height); bg.addColorStop(0, '#070d1c'); bg.addColorStop(.5, '#101c35'); bg.addColorStop(1, '#0a142a'); ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
  const nebula = ctx.createRadialGradient(width * .69, height * .59, 0, width * .69, height * .59, Math.max(width, height) * .51);
  nebula.addColorStop(0, '#25526a24'); nebula.addColorStop(.5, '#223e6b16'); nebula.addColorStop(1, '#10244300'); ctx.fillStyle = nebula; ctx.fillRect(0, 0, width, height);
  stars.forEach((s, i) => { const twinkle = reduced ? 1 : .8 + Math.sin(time * .3 + i) * .2; ctx.fillStyle = `rgba(174,195,224,${s.a * twinkle})`; ctx.beginPath(); ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2); ctx.fill(); });
  // Subtle, code-drawn dust along a distant band of light.
  for (let i = 0; i < 85; i++) { const x = (.45 + hash(i * 4.1) * .5) * width; const y = (.92 - x / width * .62 + (hash(i + 8) - .5) * .22) * height; ctx.fillStyle = `rgba(106,147,175,${.025 + hash(i + 4) * .07})`; ctx.beginPath(); ctx.arc(x, y, .5 + hash(i + 9) * 1.3, 0, Math.PI * 2); ctx.fill(); }
}
function drawLifeThread(points, color, alpha = .45, lineWidth = 1.3) {
  if (points.length < 2) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineWidth = lineWidth; ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 9; ctx.beginPath();
  ctx.moveTo(points[0].x * width, points[0].y * height);
  for (let i = 1; i < points.length; i++) { const prev = points[i - 1], p = points[i]; const mid = (prev.y + p.y) / 2; ctx.bezierCurveTo(prev.x * width, mid * height, p.x * width, mid * height, p.x * width, p.y * height); }
  ctx.stroke(); ctx.restore();
}
function drawIntro(time) {
  const mobile = width <= 700;
  const paths = mobile ? [
    [{ x: .65, y: 1.1 }, { x: .64, y: .80 }, { x: .82, y: .66 }, { x: .77, y: .40 }],
    [{ x: .72, y: 1.1 }, { x: .72, y: .79 }, { x: .88, y: .64 }, { x: .91, y: .33 }],
    [{ x: .51, y: 1.1 }, { x: .58, y: .84 }, { x: .70, y: .72 }, { x: .67, y: .64 }]
  ] : [
    [{ x: .57, y: 1.1 }, { x: .66, y: .88 }, { x: .63, y: .64 }, { x: .69, y: .39 }],
    [{ x: .64, y: 1.1 }, { x: .71, y: .84 }, { x: .68, y: .61 }, { x: .76, y: .28 }],
    [{ x: .69, y: 1.1 }, { x: .76, y: .84 }, { x: .74, y: .64 }, { x: .80, y: .49 }],
    [{ x: .59, y: 1.1 }, { x: .65, y: .84 }, { x: .60, y: .68 }, { x: .55, y: .56 }]
  ];
  const colors = ['#ead398', '#9ad7e5', '#f2aa9d', '#c2b2f1'];
  paths.forEach((points, i) => {
    drawLifeThread(points, colors[i], mobile ? .32 : .46, i === 0 ? 1.7 : 1);
    const p = points.at(-1); star(p.x * width, p.y * height, i === 0 ? 3.1 : 2.1, colors[i], .8, true);
    if (!mobile) { ctx.font = '10px "Malgun Gothic", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = colors[i] + '88'; ctx.fillText(['나', '어느 날의 인연', '함께한 시간', '오래된 꿈'][i], p.x * width, p.y * height - 24); }
    if (!reduced) { const pulse = (time * .025 + i * .27) % 1; const y = .99 - pulse * (.99 - p.y); const x = points[0].x * (1 - pulse) + p.x * pulse; star(x * width, y * height, .65, colors[i], .3); }
  });
  // A faint constellation above the flowing lives.
  if (!mobile) {
    const constellation = [{ x: .59, y: .19 }, { x: .66, y: .15 }, { x: .72, y: .20 }, { x: .79, y: .12 }, { x: .86, y: .21 }];
    ctx.strokeStyle = '#8193b22a'; ctx.lineWidth = .7; ctx.beginPath(); constellation.forEach((p, i) => i ? ctx.lineTo(p.x * width, p.y * height) : ctx.moveTo(p.x * width, p.y * height)); ctx.stroke(); constellation.forEach(p => star(p.x * width, p.y * height, 1.4, '#a9bad8', .7, true));
  }
}
function drawGame(time) {
  const positions = nodePositions();
  const histories = memoriesFor(history);
  const currentColor = histories.at(-1)?.color || COLORS.self;
  // The paths of people continue independently beside the player's own trail.
  positions.forEach((p, i) => {
    const o = options[i]; if (!o) return;
    const end = { x: p.x, y: p.y - 16 / height };
    drawLifeThread([{ x: .47 + i * .08, y: 1.1 }, { x: .50 + i * .09, y: .87 }, { x: p.x - .04, y: .64 }, end], o.color, .20, 1);
  });
  if (history.length >= 5) { star(width * .87, height * .22, 2.3, COLORS.home, .6, true); ctx.fillStyle = '#c3979388'; ctx.font = '10px "Malgun Gothic", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('어머니의 기억', width * .87, height * .22 - 21); }
  const origin = { x: width <= 700 ? .54 : .59, y: 1.08 };
  drawLifeThread([origin, { x: origin.x - .025, y: .86 }, ...(trail.length ? trail : [player])], COLORS.self, .8, 1.6);
  if (selected && pendingReflection) {
    drawLifeThread([{ x: player.x + .03, y: .95 }, { x: player.x + .025, y: .8 }, { x: player.x + .018, y: player.y + .01 }], currentColor, .8, 1.4);
  }
  const r = 3.2 + (reduced ? 0 : Math.sin(time * 2) * .3);
  star(player.x * width, player.y * height, r, COLORS.self, 1, true);
  ctx.save(); ctx.strokeStyle = '#ead39848'; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(player.x * width, player.y * height, 15 + (reduced ? 0 : Math.sin(time) * 2), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  ctx.font = '10px "Malgun Gothic", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ddcb9fa0'; ctx.fillText('나', player.x * width, player.y * height + 33);
}
function drawEnding() {
  const positions = endPositions(), memories = memoriesFor(history);
  const center = { x: .51, y: width <= 700 ? .53 : .52 };
  ctx.save(); ctx.lineWidth = .8;
  positions.forEach((p, i) => {
    const next = positions[(i + 1) % positions.length];
    ctx.strokeStyle = memories[i].color + '55'; ctx.beginPath(); ctx.moveTo(p.x * width, (p.y - 18 / height) * height); ctx.lineTo(next.x * width, (next.y - 18 / height) * height); ctx.stroke();
    if (i % 2 === 0) { ctx.strokeStyle = memories[i].color + '35'; ctx.beginPath(); ctx.moveTo(p.x * width, p.y * height - 18); ctx.lineTo(center.x * width, center.y * height); ctx.stroke(); }
    star(p.x * width, p.y * height - 18, 1.7, memories[i].color, .8);
  });
  star(center.x * width, center.y * height, 3.5, COLORS.self, 1, true);
  ctx.font = '10px "Malgun Gothic", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#e9d6ab99'; ctx.fillText('나', center.x * width, center.y * height + 28); ctx.restore();
}
function update(dt) {
  if (view !== 'game' || modalOpen() || isPaused || pendingReflection) return;
  const dx = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
  const dy = (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0) - (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0);
  if (dx || dy) { target = null; selected = null; const len = Math.hypot(dx, dy); player.x += dx / len * dt * 180 / width; player.y += dy / len * dt * 180 / height; }
  if (target) {
    const vx = (target.x - player.x) * width, vy = (target.y - player.y) * height, distance = Math.hypot(vx, vy);
    const step = reduced ? distance : dt * Math.max(260, width * .3);
    if (distance <= Math.max(2, step)) {
      player = { x: target.x, y: target.y }; const encounter = target.index !== undefined; target = null;
      if (encounter) showEncounter();
    } else { player.x += vx / distance * step / width; player.y += vy / distance * step / height; }
  }
  player.x = Math.max(.07, Math.min(.94, player.x)); player.y = Math.max(.25, Math.min(.80, player.y));
  if ((dx || dy) && !modalOpen()) {
    const near = nodePositions().findIndex(p => Math.hypot((p.x - player.x) * width, (p.y - 16 / height - player.y) * height) < 28);
    if (near >= 0) { selected = options[near]; keys.clear(); showEncounter(); }
  }
  const tail = trail.at(-1);
  if (!tail || Math.hypot((tail.x - player.x) * width, (tail.y - player.y) * height) > 4) { trail.push({ ...player }); if (trail.length > 220) trail.shift(); }
}
function render(now) {
  const dt = Math.min((now - last) / 1000 || 0, .05); last = now;
  if (!document.hidden) {
    if (!isPaused && !modalOpen()) frame += dt;
    update(dt); drawBackground(frame);
    if (view === 'intro') drawIntro(frame); else if (view === 'game') drawGame(frame); else drawEnding();
    if (soundOn && !isPaused && !modalOpen()) { audioClock += dt; if (audioClock > 10) { audioClock = 0; chime(Math.floor(frame / 10) % 7); } }
  }
  requestAnimationFrame(render);
}
function saveSky() {
  try {
    const out = document.createElement('canvas'); out.width = 1400; out.height = 1600;
    const c = out.getContext('2d'), end = endingFor(history);
    c.fillStyle = '#0b1429'; c.fillRect(0, 0, 1400, 1600);
    stars.forEach(s => { c.fillStyle = `rgba(174,195,224,${s.a * .7})`; c.beginPath(); c.arc(s.x * 1400, s.y * 1600, s.r, 0, Math.PI * 2); c.fill(); });
    c.textAlign = 'center'; c.fillStyle = '#d8c391'; c.font = '16px sans-serif'; c.fillText('THE LIGHT WE LEAVE', 700, 128);
    c.font = '54px Batang, serif'; c.fillStyle = '#f1ece1'; c.fillText('당신이 남긴 별', 700, 230);
    c.font = '22px "Malgun Gothic", sans-serif'; c.fillStyle = '#9daec8'; c.fillText(end.line, 700, 293);
    const positions = [{ x: 310, y: 520 }, { x: 650, y: 430 }, { x: 1080, y: 550 }, { x: 1110, y: 880 }, { x: 730, y: 1020 }, { x: 320, y: 870 }];
    positions.forEach((p, i) => { const q = positions[(i + 1) % 6]; c.strokeStyle = end.memories[i].color + '80'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); if (i % 2 === 0) { c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(710, 730); c.stroke(); } });
    positions.forEach((p, i) => { const m = end.memories[i]; c.fillStyle = m.color; c.shadowColor = m.color; c.shadowBlur = 20; c.font = '45px serif'; c.fillText('✧', p.x, p.y + 14); c.shadowBlur = 0; c.font = '16px sans-serif'; c.fillStyle = '#8f9eb9'; c.fillText(`${m.age}살 · ${m.who}`, p.x, p.y + 50); c.font = '21px Batang, serif'; c.fillStyle = '#cfd5e3'; c.fillText(m.title, p.x, p.y + 83); });
    c.font = '60px serif'; c.fillStyle = COLORS.self; c.shadowBlur = 30; c.shadowColor = COLORS.self; c.fillText('✦', 710, 750); c.shadowBlur = 0;
    c.font = '18px sans-serif'; c.fillText('나', 710, 795); c.font = '33px Batang, serif'; c.fillText(`〈 ${end.title} 〉`, 700, 1240);
    c.fillStyle = '#8b9bb5'; c.font = '21px Batang, serif'; c.fillText('함께한 시간은 사라지지 않으니까.', 700, 1310); c.font = '15px sans-serif'; c.fillText('우리가 남긴 별 · 여섯 계절의 기록', 700, 1490);
    out.toBlob(blob => {
      if (!blob) { $('save-notice').textContent = '이미지를 만들지 못했어요. 다시 시도해 주세요.'; return; }
      const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = '우리가-남긴-별.png'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
      $('save-notice').textContent = '별자리 이미지 다운로드를 시작했어요.';
    }, 'image/png');
  } catch { $('save-notice').textContent = '이 브라우저에서 이미지 저장이 제한되어 있어요.'; }
}
$('start').addEventListener('click', requestRestart);
$('resume').addEventListener('click', () => { history = [...saved]; enterScene(); });
$('commit').addEventListener('click', commit);
for (const id of ['close-encounter', 'explore']) $(id).addEventListener('click', () => { closeModal('encounter'); target = null; selected = null; $('move-hint').textContent = '천천히 둘러보고, 마음에 드는 시간을 골라보세요'; });
$('continue').addEventListener('click', () => { closeModal('reflection'); $('nodes').hidden = false; enterScene(); });
for (const id of ['close-memory', 'back-to-sky']) $(id).addEventListener('click', () => closeModal('memory'));
$('help').addEventListener('click', () => openModal('help-dialog'));
$('close-help').addEventListener('click', () => closeModal('help-dialog'));
$('pause').addEventListener('click', () => { isPaused = true; audioPause(true); openModal('pause-dialog'); });
$('unpause').addEventListener('click', () => { isPaused = false; audioPause(false); closeModal('pause-dialog'); });
$('replay').addEventListener('click', requestRestart);
$('confirm-restart').addEventListener('click', () => { closeModal('restart-dialog'); $('nodes').hidden = false; startFresh(); });
$('cancel-restart').addEventListener('click', () => closeModal('restart-dialog'));
$('save-sky').addEventListener('click', saveSky);
$('sound').addEventListener('click', () => {
  if (!soundOn && !initAudio()) return;
  soundOn = !soundOn; $('sound').setAttribute('aria-pressed', String(soundOn)); $('sound').title = soundOn ? '소리 끄기' : '소리 켜기'; $('sound').querySelector('.tool-label').textContent = soundOn ? '소리 켜짐' : '소리 꺼짐';
  if (master) master.gain.setTargetAtTime(soundOn ? .15 : 0, audioContext.currentTime, .1);
  if (soundOn) chime(0);
});
canvas.addEventListener('pointerdown', e => {
  if (view !== 'game' || modalOpen() || pendingReflection) return;
  target = { x: Math.max(.07, Math.min(.94, e.clientX / width)), y: Math.max(.25, Math.min(.80, e.clientY / height)) }; selected = null;
});
document.addEventListener('keydown', e => {
  if (e.key === 'Tab' && modalOpen()) {
    const modal = [...document.querySelectorAll('.sheet-wrap,.overlay')].find(el => !el.hidden);
    const buttons = [...modal.querySelectorAll('button:not([disabled])')];
    const first = buttons[0], last = buttons.at(-1);
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modal.firstElementChild)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (e.key === 'Escape') {
    if (!$('help-dialog').hidden) closeModal('help-dialog');
    else if (!$('pause-dialog').hidden) $('unpause').click();
    else if (!$('encounter').hidden) $('explore').click();
    else if (!$('memory').hidden) closeModal('memory');
    else if (!$('restart-dialog').hidden) closeModal('restart-dialog');
    else if (!modalOpen() && view === 'game') $('pause').click();
    return;
  }
  if (!modalOpen() && view === 'game' && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) { e.preventDefault(); keys.add(e.code); }
});
document.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => { keys.clear(); if (view === 'game' && !modalOpen()) $('pause').click(); });
document.addEventListener('visibilitychange', () => { keys.clear(); audioPause(document.hidden || !soundOn || isPaused); if (document.hidden && view === 'game' && !modalOpen()) $('pause').click(); });
window.addEventListener('resize', resize);
setView('intro'); resize(); requestAnimationFrame(render);
