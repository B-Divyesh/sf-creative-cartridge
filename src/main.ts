import './styles.css';
import { clearWorks, deleteWork, getWorks, importWorks, makeWork, saveWork, type Work } from './db';

type ActivityId = 'sound-paint' | 'shape-story' | 'flip-cards' | 'rhythm-press' | 'creature-works' | 'shadow-page';
type Activity = { id: ActivityId; number: string; title: string; deck: string; action: string };

const activities: Activity[] = [
  { id: 'sound-paint', number: '01', title: 'Ink orchestra', deck: 'Draw a line. Every colour has a small sound. Your picture becomes a tiny score.', action: 'Paint with sound' },
  { id: 'shape-story', number: '02', title: 'Shape stories', deck: 'Set circles, squares and stars on the page, then tell what happened between them.', action: 'Set a story' },
  { id: 'flip-cards', number: '03', title: 'Six-card cinema', deck: 'Move one paper mark through six frames. No camera, uploads or endless timeline.', action: 'Make six frames' },
  { id: 'rhythm-press', number: '04', title: 'Rhythm press', deck: 'Tap a short beat with the number keys. The press plays it once, then rests.', action: 'Tap a rhythm' },
  { id: 'creature-works', number: '05', title: 'Creature works', deck: 'Turn the rollers to print a curious creature and give the new species a name.', action: 'Print a creature' },
  { id: 'shadow-page', number: '06', title: 'Pocket theatre', deck: 'Arrange two paper shadows and a backdrop for a little living-room play.', action: 'Raise the curtain' }
];

const ACTIVITY_IDS = activities.map(item => item.id);
const PIN_KEY = 'cc_parent_pin';
const SELECTED_KEY = 'cc_selected_activities';
const LICENSE_KEY = 'sb_license:creative-cartridge';
const VERDICT_KEY = 'cc_license_verdict';
const SMALL_KEY = 'cc_small_download';
const SOUND_KEY = 'cc_sound';
const API_BASE = 'https://api.sociobot.in/api/v1';

const app = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
if (!app) throw new Error('Creative Cartridge could not start.');

let selected = readSelected();
let activeCleanup: (() => void) | undefined;
let installPrompt: BeforeInstallPromptEvent | undefined;
let audioContext: AudioContext | undefined;
let soundOn = localStorage.getItem(SOUND_KEY) !== 'off';
let weekendUnlocked = readVerdict()?.valid === true;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function readSelected(): ActivityId[] {
  try {
    const value = JSON.parse(localStorage.getItem(SELECTED_KEY) ?? 'null');
    if (Array.isArray(value)) return value.filter((id): id is ActivityId => ACTIVITY_IDS.includes(id));
  } catch { /* use the complete issue */ }
  return [...ACTIVITY_IDS];
}

function readVerdict(): { valid: boolean; checkedAt: number; reason?: string } | undefined {
  try { return JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') ?? undefined; } catch { return undefined; }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);
}

function renderHome() {
  document.body.classList.toggle('small-download', localStorage.getItem(SMALL_KEY) === 'on');
  const visible = activities.filter(item => selected.includes(item.id));
  app.innerHTML = `
    <div class="shell">
      <header class="masthead">
        <div class="masthead-top"><span>A finite creative paper for old computers</span><button class="utility-button" id="parent-open" type="button">Parent desk</button></div>
        <div class="masthead-title"><h1>Creative<br>Cartridge</h1><p class="issue-mark">Issue No. 1<br>Six things to make<br>No feed inside</p></div>
      </header>
      <div class="status-ribbon" aria-live="polite"><span class="online-state" id="network-state">Checking this copy…</span><span id="save-summary">Everything made here stays on this device.</span></div>
      <main id="main" tabindex="-1">
        <section class="hero" aria-labelledby="cover-heading">
          <picture><source media="(max-width: 760px)" srcset="/art/press-cartridge-800.webp"><img src="/art/press-cartridge-1280.webp" width="1280" height="853" fetchpriority="high" alt="A cardboard cartridge spilling paper shapes, rhythm dots, flip cards, a creature and a small theatre onto newsprint."></picture>
          <div class="hero-copy"><p class="kicker">Made for ages 4–7 and their grown-ups</p><h2 id="cover-heading">Open the paper. Make something.</h2><p>Six small creative activities. Nothing to scroll, no account to make, and no internet needed after this copy is ready.</p><button class="primary" type="button" data-start-first>Start with today’s first activity</button></div>
        </section>
        <section class="edition-intro" aria-labelledby="inside-heading"><h2 id="inside-heading">Inside this issue</h2><p>A parent chooses which departments appear. Each one makes a small thing and has an ending. Saved pieces live only in this browser and can be packed up from the parent desk.</p></section>
        ${visible.length ? `<section class="activity-grid" aria-label="Creative activities">${visible.map(activityCard).join('')}</section>` : emptyEdition()}
      </main>
      <footer class="footer"><p><strong>Creative Cartridge</strong><br>A one-folder, local-first play paper. No ads, accounts, analytics, or child profiling.</p><p><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-creative-cartridge" rel="noreferrer">Source</a></p><p>Cover artwork was generated for this product with Azure AI Foundry and reviewed by the maker.</p></footer>
    </div>
    <dialog id="parent-dialog" aria-labelledby="parent-title"></dialog>
    <div id="toast-region" aria-live="polite"></div>`;

  app.querySelector('#parent-open')?.addEventListener('click', openParentDesk);
  app.querySelector('[data-start-first]')?.addEventListener('click', () => visible[0] ? openActivity(visible[0].id) : openParentDesk());
  app.querySelectorAll<HTMLButtonElement>('[data-activity]').forEach(button => button.addEventListener('click', () => openActivity(button.dataset.activity as ActivityId)));
  updateNetworkState();
}

function activityCard(activity: Activity) {
  return `<article class="activity-card"><span class="number">DEPARTMENT ${activity.number}</span><h3>${activity.title}</h3><p>${activity.deck}</p><button type="button" data-activity="${activity.id}">${activity.action}<span aria-hidden="true">→</span></button></article>`;
}

function emptyEdition() {
  return `<section class="empty-edition"><p class="kicker">This issue is being reset</p><h2>No departments are pinned in.</h2><p>A grown-up can choose one or more activities at the parent desk.</p><button type="button" id="empty-parent">Choose activities</button></section>`;
}

function updateNetworkState() {
  const state = document.querySelector<HTMLElement>('#network-state');
  if (!state) return;
  const offline = !navigator.onLine;
  state.classList.toggle('offline', offline);
  state.textContent = offline ? 'Offline — the cartridge still works' : navigator.serviceWorker?.controller ? 'Ready offline' : 'Online — preparing the offline copy';
  document.querySelector('#empty-parent')?.addEventListener('click', openParentDesk);
}

function makeSheet(activity: Activity, body: string) {
  activeCleanup?.();
  const sheet = document.createElement('section');
  sheet.className = 'sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'activity-title');
  sheet.innerHTML = `<div class="sheet-head"><div><p class="kicker">Department ${activity.number} of 06</p><h2 id="activity-title">${activity.title}</h2><p>${activity.deck}</p></div><button type="button" data-close-sheet>Return to the front page</button></div><div class="sheet-body">${body}</div>`;
  document.body.append(sheet);
  app.inert = true;
  document.body.style.overflow = 'hidden';
  history.replaceState(null, '', `#${activity.id}`);
  const close = () => {
    activeCleanup?.();
    activeCleanup = undefined;
    sheet.remove();
    app.inert = false;
    document.body.style.overflow = '';
    history.replaceState(null, '', location.pathname + location.search);
    document.querySelector<HTMLButtonElement>(`[data-activity="${activity.id}"]`)?.focus();
  };
  sheet.querySelector('[data-close-sheet]')?.addEventListener('click', close);
  sheet.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const focusable = Array.from(sheet.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])'));
      const first = focusable[0]; const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  sheet.querySelector<HTMLButtonElement>('[data-close-sheet]')?.focus();
  return sheet;
}

function openActivity(id: ActivityId) {
  const activity = activities.find(item => item.id === id);
  if (!activity) return;
  if (id === 'sound-paint') openSoundPaint(activity);
  if (id === 'shape-story') openShapeStory(activity);
  if (id === 'flip-cards') openFlipCards(activity);
  if (id === 'rhythm-press') openRhythm(activity);
  if (id === 'creature-works') openCreature(activity);
  if (id === 'shadow-page') openTheatre(activity);
}

function playTone(frequency: number, duration = .12, wave: OscillatorType = 'sine') {
  if (!soundOn) return;
  audioContext ??= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = wave;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.08, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function showSaveMessage(sheet: HTMLElement, message = 'Saved to this device.') {
  const status = sheet.querySelector<HTMLElement>('[data-save-status]');
  if (status) status.textContent = message;
}

async function savedShelf(sheet: HTMLElement, activity: ActivityId) {
  const shelf = sheet.querySelector<HTMLElement>('[data-saved-shelf]');
  if (!shelf) return;
  try {
    const works = (await getWorks()).filter(item => item.activity === activity).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    shelf.innerHTML = `<h3>Saved from this department</h3>${works.length ? '<ul class="saved-list"></ul>' : '<p class="instruction">Nothing saved yet. Make one small piece above.</p>'}`;
    const list = shelf.querySelector('ul');
    works.forEach(work => {
      const row = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = `${work.title} · ${new Date(work.createdAt).toLocaleDateString()}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', async () => {
        if (!confirm(`Remove “${work.title}” from this device?`)) return;
        await deleteWork(work.id);
        await savedShelf(sheet, activity);
      });
      row.append(label, remove);
      list?.append(row);
    });
  } catch {
    shelf.innerHTML = '<h3>Saved from this department</h3><p class="error">Saved pieces could not be opened. The activity above still works; try reloading before saving.</p>';
  }
}

function openSoundPaint(activity: Activity) {
  const sheet = makeSheet(activity, `
    <p class="instruction">Choose an ink, then drag across the page. On a keyboard, focus the page, move with the arrow keys and press Space to print a dot.</p>
    <div class="tool-row" aria-label="Ink tools"><button type="button" class="ink-choice ink" data-ink="#171714" data-tone="220" aria-pressed="true">Black · low</button><button type="button" class="ink-choice primary" data-ink="#a72f2a" data-tone="330" aria-pressed="false">Red · middle</button><button type="button" class="ink-choice blue" data-ink="#1e5d73" data-tone="440" aria-pressed="false">Blue · high</button><button type="button" data-clear>Clear the page</button></div>
    <div class="work-surface"><canvas class="paint-canvas" width="1000" height="520" tabindex="0" aria-label="Sound painting page. Use arrow keys to move the printing point and Space to make a dot."></canvas></div>
    <div class="tool-row"><button type="button" class="primary" data-save>Save this score</button><button type="button" data-sound>${soundOn ? 'Pause sound' : 'Turn sound on'}</button></div><p class="save-line" data-save-status aria-live="polite"></p><section class="saved-shelf" data-saved-shelf></section>`);
  const canvas = sheet.querySelector<HTMLCanvasElement>('canvas')!;
  const context = canvas.getContext('2d', { alpha: false })!;
  context.fillStyle = '#fffbed'; context.fillRect(0, 0, canvas.width, canvas.height); context.lineCap = 'round'; context.lineJoin = 'round'; context.lineWidth = 18;
  let ink = '#171714'; let tone = 220; let drawing = false; let last = { x: 500, y: 260 }; let lastTone = 0;
  const point = (event: PointerEvent) => { const box = canvas.getBoundingClientRect(); return { x: (event.clientX - box.left) * canvas.width / box.width, y: (event.clientY - box.top) * canvas.height / box.height }; };
  const draw = (next: { x: number; y: number }, dot = false) => {
    context.strokeStyle = ink; context.fillStyle = ink;
    if (dot) { context.beginPath(); context.arc(next.x, next.y, 10, 0, Math.PI * 2); context.fill(); }
    else { context.beginPath(); context.moveTo(last.x, last.y); context.lineTo(next.x, next.y); context.stroke(); }
    last = next;
    if (performance.now() - lastTone > 85) { playTone(tone + (1 - next.y / canvas.height) * 130); lastTone = performance.now(); }
  };
  canvas.addEventListener('pointerdown', event => { drawing = true; last = point(event); canvas.setPointerCapture(event.pointerId); draw(last, true); });
  canvas.addEventListener('pointermove', event => { if (drawing) draw(point(event)); });
  canvas.addEventListener('pointerup', () => { drawing = false; });
  canvas.addEventListener('keydown', event => { const moves: Record<string, [number, number]> = { ArrowLeft: [-14, 0], ArrowRight: [14, 0], ArrowUp: [0, -14], ArrowDown: [0, 14] }; if (moves[event.key]) { event.preventDefault(); const [x, y] = moves[event.key]; last = { x: Math.max(0, Math.min(canvas.width, last.x + x)), y: Math.max(0, Math.min(canvas.height, last.y + y)) }; } if (event.code === 'Space') { event.preventDefault(); draw(last, true); } });
  sheet.querySelectorAll<HTMLButtonElement>('[data-ink]').forEach(button => button.addEventListener('click', () => { ink = button.dataset.ink!; tone = Number(button.dataset.tone); sheet.querySelectorAll('[data-ink]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); }));
  sheet.querySelector('[data-clear]')?.addEventListener('click', () => { if (confirm('Clear every mark from this page?')) { context.fillStyle = '#fffbed'; context.fillRect(0, 0, canvas.width, canvas.height); showSaveMessage(sheet, 'The page is clear.'); } });
  sheet.querySelector('[data-sound]')?.addEventListener('click', event => { soundOn = !soundOn; localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); (event.currentTarget as HTMLButtonElement).textContent = soundOn ? 'Pause sound' : 'Turn sound on'; showSaveMessage(sheet, soundOn ? 'Sound is on.' : 'Sound is paused.'); });
  sheet.querySelector('[data-save]')?.addEventListener('click', async () => { try { await saveWork(makeWork(activity.id, 'Sound painting', { image: canvas.toDataURL('image/webp', .65) })); showSaveMessage(sheet); await savedShelf(sheet, activity.id); } catch { showSaveMessage(sheet, 'This painting could not be saved. Export older work or free some browser storage.'); } });
  void savedShelf(sheet, activity.id);
}

type StoryPiece = { kind: string; x: number; y: number; rotation: number };
function openShapeStory(activity: Activity) {
  const basicPrompts = ['A small shape finds a very big friend.', 'The moon loses its way home.', 'Three shapes build a surprising machine.', 'A quiet square hears something under the page.'];
  const bonusPrompts = ['A comet delivers a folded invitation.', 'The shapes discover a door drawn in blue ink.'];
  const prompts = weekendUnlocked ? [...basicPrompts, ...bonusPrompts] : basicPrompts;
  const sheet = makeSheet(activity, `
    <p class="instruction">Add three or four pieces. Tap a piece to turn it. Then use the prompt as the first sentence of a story you tell out loud.</p>
    <p class="prompt-strip" data-prompt>${basicPrompts[0]}</p>
    <div class="tool-row"><button type="button" data-add="circle">Add a circle</button><button type="button" data-add="square">Add a square</button><button type="button" data-add="triangle">Add a triangle</button><button type="button" data-add="star">Add a star</button>${weekendUnlocked ? '<button type="button" data-add="comet">Add a Weekend comet</button>' : ''}<button type="button" data-new-prompt>Deal another beginning</button></div>
    <div class="work-surface shape-stage" data-stage aria-label="Story page"></div>
    <div class="tool-row"><button type="button" data-move="left">Move last left</button><button type="button" data-move="up">Move last up</button><button type="button" data-move="down">Move last down</button><button type="button" data-move="right">Move last right</button><button class="primary" type="button" data-save>Save this story page</button></div><p class="save-line" data-save-status aria-live="polite"></p><section class="saved-shelf" data-saved-shelf></section>`);
  const stage = sheet.querySelector<HTMLElement>('[data-stage]')!;
  let pieces: StoryPiece[] = [];
  let prompt = basicPrompts[0];
  const render = () => {
    stage.innerHTML = pieces.length ? '' : '<p class="instruction" style="padding:24px">The page is empty. Add one shape to begin.</p>';
    pieces.forEach((piece, index) => {
      const element = document.createElement('button');
      element.type = 'button'; element.className = `story-shape ${piece.kind}`; element.style.left = `${piece.x}%`; element.style.top = `${piece.y}%`; element.style.transform = `rotate(${piece.rotation}deg)`;
      element.setAttribute('aria-label', `${piece.kind}, piece ${index + 1}. Activate to turn it.`);
      if (piece.kind === 'star') element.textContent = '★';
      if (piece.kind === 'comet') element.textContent = '☄';
      element.addEventListener('click', () => { piece.rotation += 45; render(); });
      stage.append(element);
    });
  };
  sheet.querySelectorAll<HTMLButtonElement>('[data-add]').forEach(button => button.addEventListener('click', () => { const index = pieces.length; pieces.push({ kind: button.dataset.add!, x: 8 + (index * 17) % 72, y: 12 + (index * 23) % 58, rotation: 0 }); render(); playTone(250 + index * 40, .08, 'triangle'); }));
  sheet.querySelectorAll<HTMLButtonElement>('[data-move]').forEach(button => button.addEventListener('click', () => { const piece = pieces.at(-1); if (!piece) { showSaveMessage(sheet, 'Add a shape before moving it.'); return; } const move = button.dataset.move; if (move === 'left') piece.x -= 5; if (move === 'right') piece.x += 5; if (move === 'up') piece.y -= 5; if (move === 'down') piece.y += 5; piece.x = Math.max(0, Math.min(82, piece.x)); piece.y = Math.max(0, Math.min(72, piece.y)); render(); }));
  sheet.querySelector('[data-new-prompt]')?.addEventListener('click', () => { const current = prompts.indexOf(prompt); prompt = prompts[(current + 1) % prompts.length]; sheet.querySelector<HTMLElement>('[data-prompt]')!.textContent = prompt; });
  sheet.querySelector('[data-save]')?.addEventListener('click', async () => { if (!pieces.length) { showSaveMessage(sheet, 'Add at least one shape before saving.'); return; } try { await saveWork(makeWork(activity.id, `Shape story with ${pieces.length} pieces`, { pieces, prompt })); showSaveMessage(sheet); await savedShelf(sheet, activity.id); } catch { showSaveMessage(sheet, 'This story page could not be saved. Try again after making room.'); } });
  render(); void savedShelf(sheet, activity.id);
}

type FlipFrame = { symbol: string; x: number; y: number; rotation: number } | null;
function openFlipCards(activity: Activity) {
  const sheet = makeSheet(activity, `
    <p class="instruction">Choose a paper mark, move it, then print each of the six frames. “Play six cards” runs once and stops.</p>
    <div class="tool-row"><button type="button" data-symbol="●">Use a dot</button><button type="button" data-symbol="▲">Use a sail</button><button type="button" data-symbol="★">Use a star</button>${weekendUnlocked ? '<button type="button" data-symbol="✦">Use a Weekend spark</button>' : ''}</div>
    <div class="work-surface flip-stage"><div class="flip-object" data-flip-object aria-label="Current paper mark">●</div></div>
    <div class="tool-row"><button type="button" data-nudge="left">Move left</button><button type="button" data-nudge="up">Move up</button><button type="button" data-turn>Turn</button><button type="button" data-nudge="down">Move down</button><button type="button" data-nudge="right">Move right</button><button type="button" class="primary" data-capture>Print frame 1</button></div>
    <div class="frame-strip" data-frames role="region" aria-label="Six printed frames" tabindex="0"></div>
    <div class="tool-row"><button type="button" data-play>Play six cards</button><button type="button" data-reset>Start the six frames again</button><button type="button" data-save>Save these cards</button></div><p class="save-line" data-save-status aria-live="polite"></p><section class="saved-shelf" data-saved-shelf></section>`);
  let symbol = '●'; let x = 0; let y = 0; let rotation = 0; let current = 0; let frames: FlipFrame[] = Array(6).fill(null); let timer: number | undefined;
  const object = sheet.querySelector<HTMLElement>('[data-flip-object]')!;
  const renderObject = (frame?: NonNullable<FlipFrame>) => { const value = frame ?? { symbol, x, y, rotation }; object.textContent = value.symbol; object.style.setProperty('--flip-x', `${value.x}px`); object.style.setProperty('--flip-y', `${value.y}px`); object.style.setProperty('--flip-r', `${value.rotation}deg`); };
  const renderFrames = () => { const strip = sheet.querySelector<HTMLElement>('[data-frames]')!; strip.innerHTML = frames.map((frame, index) => `<div class="frame ${index === current ? 'current' : ''}" aria-label="Frame ${index + 1}${frame ? ', printed' : ', empty'}">${frame ? escapeHtml(frame.symbol) : index + 1}</div>`).join(''); const capture = sheet.querySelector<HTMLButtonElement>('[data-capture]')!; capture.textContent = current < 6 ? `Print frame ${current + 1}` : 'All six frames printed'; capture.disabled = current >= 6; };
  sheet.querySelectorAll<HTMLButtonElement>('[data-symbol]').forEach(button => button.addEventListener('click', () => { symbol = button.dataset.symbol!; renderObject(); }));
  sheet.querySelectorAll<HTMLButtonElement>('[data-nudge]').forEach(button => button.addEventListener('click', () => { const direction = button.dataset.nudge; if (direction === 'left') x -= 24; if (direction === 'right') x += 24; if (direction === 'up') y -= 20; if (direction === 'down') y += 20; x = Math.max(-180, Math.min(180, x)); y = Math.max(-100, Math.min(100, y)); renderObject(); }));
  sheet.querySelector('[data-turn]')?.addEventListener('click', () => { rotation += 30; renderObject(); });
  sheet.querySelector('[data-capture]')?.addEventListener('click', () => { if (current >= 6) return; frames[current] = { symbol, x, y, rotation }; current += 1; playTone(280 + current * 35, .08, 'square'); renderFrames(); showSaveMessage(sheet, current === 6 ? 'Six frames are ready to play.' : `Frame ${current} printed.`); });
  const stop = () => { if (timer) window.clearInterval(timer); timer = undefined; sheet.querySelector<HTMLButtonElement>('[data-play]')!.textContent = 'Play six cards'; };
  sheet.querySelector('[data-play]')?.addEventListener('click', () => { if (timer) { stop(); return; } if (frames.some(frame => !frame)) { showSaveMessage(sheet, 'Print all six frames before playing them.'); return; } let index = 0; sheet.querySelector<HTMLButtonElement>('[data-play]')!.textContent = 'Stop the cards'; renderObject(frames[0]!); timer = window.setInterval(() => { index += 1; if (index >= 6) { stop(); renderObject(); return; } renderObject(frames[index]!); }, 420); });
  sheet.querySelector('[data-reset]')?.addEventListener('click', () => { if (!confirm('Clear all six printed frames and begin again?')) return; stop(); frames = Array(6).fill(null); current = 0; x = 0; y = 0; rotation = 0; renderObject(); renderFrames(); showSaveMessage(sheet, 'The cards are blank again.'); });
  sheet.querySelector('[data-save]')?.addEventListener('click', async () => { const count = frames.filter(Boolean).length; if (!count) { showSaveMessage(sheet, 'Print at least one frame before saving.'); return; } try { await saveWork(makeWork(activity.id, `${count}-card cinema`, { frames })); showSaveMessage(sheet); await savedShelf(sheet, activity.id); } catch { showSaveMessage(sheet, 'These cards could not be saved. Try again after making room.'); } });
  activeCleanup = stop; renderObject(); renderFrames(); void savedShelf(sheet, activity.id);
}

function openRhythm(activity: Activity) {
  const padNames = ['THUMP', 'TICK', 'POP', 'CLAP', 'BONG', 'SHAKE', 'TAP', 'TING'];
  const frequencies = [110, 180, 260, 330, 145, 420, 220, 520];
  const sheet = makeSheet(activity, `
    <p class="instruction">Tap the pads or number keys 1–8. The tape holds only 16 hits. Play runs the tape once and rests.</p>
    <div class="rhythm-grid">${padNames.map((name, index) => `<button type="button" class="pad" data-pad="${index}"><span>${name}</span><small>key ${index + 1}</small></button>`).join('')}</div>
    <ol class="beat-tape" data-tape aria-label="Sixteen-hit rhythm tape"></ol>
    <div class="tool-row"><button class="primary" type="button" data-play>Play the tape once</button><button type="button" data-clear>Clear the tape</button><button type="button" data-save>Save this rhythm</button><button type="button" data-sound>${soundOn ? 'Pause sound' : 'Turn sound on'}</button></div><p class="save-line" data-save-status aria-live="polite"></p><section class="saved-shelf" data-saved-shelf></section>`);
  let pattern: number[] = []; let timer: number | undefined; let playIndex = -1;
  const render = () => { sheet.querySelector<HTMLElement>('[data-tape]')!.innerHTML = Array.from({ length: 16 }, (_, index) => {
    const pad = pattern[index];
    return `<li class="beat ${pad !== undefined ? 'on' : ''}"><span aria-hidden="true">${pad !== undefined ? pad + 1 : ''}</span><span class="visually-hidden">Beat ${index + 1}, ${pad !== undefined ? padNames[pad] : 'empty'}</span></li>`;
  }).join(''); };
  const hit = (index: number, record = true) => { const pad = sheet.querySelector<HTMLElement>(`[data-pad="${index}"]`); pad?.classList.add('hit'); window.setTimeout(() => pad?.classList.remove('hit'), 120); playTone(frequencies[index], .14, index % 2 ? 'square' : 'triangle'); if (record) { if (pattern.length >= 16) { showSaveMessage(sheet, 'The 16-hit tape is full. Play it or clear it.'); return; } pattern.push(index); render(); } };
  sheet.querySelectorAll<HTMLButtonElement>('[data-pad]').forEach(button => button.addEventListener('click', () => hit(Number(button.dataset.pad))));
  const onKey = (event: KeyboardEvent) => { const index = Number(event.key) - 1; if (index >= 0 && index < 8 && !event.repeat) { event.preventDefault(); hit(index); } };
  sheet.addEventListener('keydown', onKey);
  const stop = () => { if (timer) clearInterval(timer); timer = undefined; playIndex = -1; sheet.querySelector<HTMLButtonElement>('[data-play]')!.textContent = 'Play the tape once'; };
  sheet.querySelector('[data-play]')?.addEventListener('click', () => { if (timer) { stop(); return; } if (!pattern.length) { showSaveMessage(sheet, 'Tap one pad before playing the tape.'); return; } playIndex = 0; sheet.querySelector<HTMLButtonElement>('[data-play]')!.textContent = 'Stop the tape'; hit(pattern[0], false); timer = window.setInterval(() => { playIndex += 1; if (playIndex >= pattern.length) { stop(); return; } hit(pattern[playIndex], false); }, 260); });
  sheet.querySelector('[data-clear]')?.addEventListener('click', () => { if (!pattern.length || confirm('Clear every hit from this tape?')) { stop(); pattern = []; render(); showSaveMessage(sheet, 'The tape is empty.'); } });
  sheet.querySelector('[data-sound]')?.addEventListener('click', event => { soundOn = !soundOn; localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); (event.currentTarget as HTMLButtonElement).textContent = soundOn ? 'Pause sound' : 'Turn sound on'; showSaveMessage(sheet, soundOn ? 'Sound is on.' : 'Sound is paused.'); });
  sheet.querySelector('[data-save]')?.addEventListener('click', async () => { if (!pattern.length) { showSaveMessage(sheet, 'Tap one pad before saving.'); return; } try { await saveWork(makeWork(activity.id, `${pattern.length}-hit rhythm`, { pattern })); showSaveMessage(sheet); await savedShelf(sheet, activity.id); } catch { showSaveMessage(sheet, 'This rhythm could not be saved. Try again after making room.'); } });
  activeCleanup = stop; render(); void savedShelf(sheet, activity.id);
}

function openCreature(activity: Activity) {
  const bodies = weekendUnlocked ? ['●', '■', '▲', '◆'] : ['●', '■', '▲'];
  const eyes = ['•  •', '◉  ◉', '×  ×'];
  const feet = ['╱  ╲', '┻  ┻', '⌇  ⌇'];
  const first = ['Nibble', 'Rumble', 'Doodle', 'Pocket', 'Pepper', 'Wobble'];
  const last = ['snout', 'foot', 'whistle', 'moth', 'bump', 'beak'];
  const sheet = makeSheet(activity, `
    <p class="instruction">Turn each press roller until your new creature appears. Then print a name for its museum label.</p>
    <div class="work-surface creature-stage"><div><div class="creature" data-creature aria-label="A creature assembled from three printed parts"></div><p class="creature-name" data-name>The unnamed creature</p></div></div>
    <div class="tool-row"><button type="button" data-part="body">Turn the body roller</button><button type="button" data-part="eyes">Turn the eye roller</button><button type="button" data-part="feet">Turn the foot roller</button><button type="button" data-new-name>Print a name</button><button class="primary" type="button" data-save>Save this species</button></div><p class="save-line" data-save-status aria-live="polite"></p><section class="saved-shelf" data-saved-shelf></section>`);
  let body = 0; let eye = 0; let foot = 0; let name = 'The unnamed creature';
  const render = () => { sheet.querySelector<HTMLElement>('[data-creature]')!.innerHTML = `<span>${escapeHtml(eyes[eye])}</span><span>${escapeHtml(bodies[body])}</span><span>${escapeHtml(feet[foot])}</span>`; sheet.querySelector<HTMLElement>('[data-name]')!.textContent = name; };
  sheet.querySelectorAll<HTMLButtonElement>('[data-part]').forEach(button => button.addEventListener('click', () => { if (button.dataset.part === 'body') body = (body + 1) % bodies.length; if (button.dataset.part === 'eyes') eye = (eye + 1) % eyes.length; if (button.dataset.part === 'feet') foot = (foot + 1) % feet.length; playTone(190 + (body + eye + foot) * 35, .1, 'triangle'); render(); }));
  sheet.querySelector('[data-new-name]')?.addEventListener('click', () => { const seed = body * 7 + eye * 3 + foot + Date.now(); name = first[seed % first.length] + last[(seed >> 2) % last.length]; render(); });
  sheet.querySelector('[data-save]')?.addEventListener('click', async () => { if (name === 'The unnamed creature') { showSaveMessage(sheet, 'Print a name before saving this species.'); return; } try { await saveWork(makeWork(activity.id, name, { body, eye, foot })); showSaveMessage(sheet); await savedShelf(sheet, activity.id); } catch { showSaveMessage(sheet, 'This creature could not be saved. Try again after making room.'); } });
  render(); void savedShelf(sheet, activity.id);
}

function openTheatre(activity: Activity) {
  const puppets = weekendUnlocked ? ['▲', '♟', '●', '✦'] : ['▲', '♟', '●'];
  const scenes = ['paper', 'night', 'storm'];
  const sheet = makeSheet(activity, `
    <p class="instruction">Choose two shadows and a sky. Decide what each shadow says. The stage stays still so the performers can do the moving.</p>
    <div class="work-surface theatre-stage paper" data-theatre aria-label="Paper shadow stage"><span class="puppet" data-left>▲</span><span class="puppet" data-right>♟</span></div>
    <div class="tool-row"><button type="button" data-puppet="left">Change the left shadow</button><button type="button" data-puppet="right">Change the right shadow</button><button type="button" data-scene>Change the sky</button><button class="primary" type="button" data-save>Save this little stage</button></div><p class="save-line" data-save-status aria-live="polite"></p><section class="saved-shelf" data-saved-shelf></section>`);
  let left = 0; let right = 1; let scene = 0;
  const render = () => { sheet.querySelector<HTMLElement>('[data-left]')!.textContent = puppets[left]; sheet.querySelector<HTMLElement>('[data-right]')!.textContent = puppets[right]; const stage = sheet.querySelector<HTMLElement>('[data-theatre]')!; stage.className = `work-surface theatre-stage ${scenes[scene]}`; };
  sheet.querySelectorAll<HTMLButtonElement>('[data-puppet]').forEach(button => button.addEventListener('click', () => { if (button.dataset.puppet === 'left') left = (left + 1) % puppets.length; else right = (right + 1) % puppets.length; playTone(210 + (left + right) * 45, .1, 'sine'); render(); }));
  sheet.querySelector('[data-scene]')?.addEventListener('click', () => { scene = (scene + 1) % scenes.length; render(); showSaveMessage(sheet, `The ${scenes[scene]} sky is showing.`); });
  sheet.querySelector('[data-save]')?.addEventListener('click', async () => { try { await saveWork(makeWork(activity.id, `${scenes[scene]} pocket theatre`, { left, right, scene })); showSaveMessage(sheet); await savedShelf(sheet, activity.id); } catch { showSaveMessage(sheet, 'This stage could not be saved. Try again after making room.'); } });
  render(); void savedShelf(sheet, activity.id);
}

async function pinHash(pin: string) {
  const bytes = new TextEncoder().encode(`creative-cartridge:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function openParentDesk() {
  const dialog = document.querySelector<HTMLDialogElement>('#parent-dialog');
  if (!dialog) return;
  const hasPin = Boolean(localStorage.getItem(PIN_KEY));
  dialog.innerHTML = `<div class="dialog-head"><div><p class="kicker">Grown-ups only</p><h2 id="parent-title">${hasPin ? 'Open the parent desk' : 'Set the parent PIN'}</h2></div><button type="button" data-dialog-close aria-label="Close parent desk">Close</button></div><div class="dialog-body">
    <p>${hasPin ? 'Enter the four digits chosen on this device.' : 'Choose four digits a child is unlikely to guess. This separates settings from play, but it is not a security boundary.'}</p>
    <form data-pin-form><div class="field"><label for="parent-pin">${hasPin ? 'Parent PIN' : 'New four-digit PIN'}</label><input id="parent-pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="off" required aria-describedby="pin-help"></div><p id="pin-help" class="instruction">Four numbers, stored only as a one-way hash in this browser.</p><button class="primary" type="submit">${hasPin ? 'Open the desk' : 'Set PIN and open'}</button><p class="error" data-pin-error role="alert"></p></form>
  </div>`;
  const close = () => dialog.close();
  dialog.querySelector('[data-dialog-close]')?.addEventListener('click', close);
  dialog.addEventListener('cancel', close, { once: true });
  dialog.querySelector<HTMLFormElement>('[data-pin-form]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const pin = new FormData(event.currentTarget as HTMLFormElement).get('pin')?.toString() ?? '';
    if (!/^\d{4}$/.test(pin)) { dialog.querySelector<HTMLElement>('[data-pin-error]')!.textContent = 'Enter exactly four numbers.'; return; }
    const hash = await pinHash(pin);
    if (hasPin && hash !== localStorage.getItem(PIN_KEY)) { dialog.querySelector<HTMLElement>('[data-pin-error]')!.textContent = 'That PIN did not match. Try the four digits set on this device.'; return; }
    if (!hasPin) localStorage.setItem(PIN_KEY, hash);
    await renderParentDesk(dialog);
  });
  dialog.showModal();
  dialog.querySelector<HTMLInputElement>('#parent-pin')?.focus();
}

async function renderParentDesk(dialog: HTMLDialogElement) {
  const works = await getWorks().catch(() => [] as Work[]);
  const verdict = readVerdict();
  const license = localStorage.getItem(LICENSE_KEY);
  const storageWorks = works.length === 1 ? '1 saved piece' : `${works.length} saved pieces`;
  dialog.innerHTML = `<div class="dialog-head"><div><p class="kicker">Settings & local archive</p><h2 id="parent-title">Parent desk</h2></div><button type="button" data-dialog-close aria-label="Close parent desk">Close</button></div><div class="dialog-body">
    <h3>Publish this issue</h3><p>Choose the finite set that appears on the front page. All six remain installed on this device.</p>
    <fieldset class="check-list"><legend class="kicker">Included departments</legend>${activities.map(item => `<label><input type="checkbox" value="${item.id}" ${selected.includes(item.id) ? 'checked' : ''}> ${item.number} · ${item.title}</label>`).join('')}</fieldset>
    <div class="tool-row"><button class="primary" type="button" data-save-selection>Publish these departments</button></div><p class="save-line" data-parent-status aria-live="polite"></p>
    <h3>Offline health check</h3><ul class="health-list"><li><span>App shell</span><strong class="${navigator.serviceWorker?.controller ? 'health-good' : 'health-warn'}">${navigator.serviceWorker?.controller ? 'Cached and ready' : 'Preparing — stay online once'}</strong></li><li><span>Connection now</span><strong class="${navigator.onLine ? 'health-good' : 'health-warn'}">${navigator.onLine ? 'Online' : 'Offline (activities still work)'}</strong></li><li><span>Local archive</span><strong class="health-good">${storageWorks}</strong></li><li><span>Runtime tracking</span><strong class="health-good">None</strong></li></ul>
    <div class="tool-row"><button type="button" data-install ${installPrompt ? '' : 'disabled'}>${installPrompt ? 'Install on this computer' : 'Use the browser menu to install'}</button><label><input type="checkbox" data-small ${localStorage.getItem(SMALL_KEY) === 'on' ? 'checked' : ''}> Small-download display (hide cover art)</label></div>
    <h3>Own the archive</h3><p>Export makes one JSON backup. Import adds valid pieces without deleting what is here.</p><div class="tool-row"><button type="button" data-export ${works.length ? '' : 'disabled'}>Export ${storageWorks}</button><label class="button">Import a backup<input type="file" data-import accept="application/json" hidden></label><button type="button" class="danger" data-clear-all ${works.length ? '' : 'disabled'}>Clear all saved pieces</button></div>
    <h3>Weekend Ink — $6 USD once</h3><p>Extra story prompts and paper stamps across the activities. The six core activities, export, safety controls, and accessibility are always free. Sociobot/Dodo is the merchant of record.</p>
    ${weekendUnlocked ? '<p class="notice"><strong>Weekend Ink is active on this device.</strong> Extra stamps are waiting inside the activities.</p>' : verdict && !verdict.valid ? `<p class="notice">License no longer active (${escapeHtml(verdict.reason ?? 'not valid')}). Core activities are unchanged.</p>` : ''}
    <div class="tool-row"><a class="button primary" href="${API_BASE}/products/creative-cartridge/checkout" target="_blank" rel="noreferrer">Buy Weekend Ink</a></div>
    <form data-license-form><div class="field"><label for="license-token">Have a license? Paste it here</label><input id="license-token" name="license" type="text" autocomplete="off" value="${license ? escapeHtml(license) : ''}" aria-describedby="license-help"></div><p id="license-help" class="instruction">Verification uses the Sociobot billing service; no creative work is sent.</p><button type="submit">Verify and restore purchase</button><p class="save-line" data-license-status aria-live="polite"></p></form>
    <h3>Parent PIN</h3><p>The PIN is a convenience, not device security. Resetting it requires clearing this site’s browser storage.</p>
    <p><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms and purchase details</a></p>
  </div>`;
  dialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-save-selection]')?.addEventListener('click', () => {
    selected = Array.from(dialog.querySelectorAll<HTMLInputElement>('.check-list input:checked')).map(input => input.value as ActivityId);
    localStorage.setItem(SELECTED_KEY, JSON.stringify(selected));
    dialog.close(); renderHome(); showToast('The front page now shows the chosen departments.');
  });
  dialog.querySelector<HTMLInputElement>('[data-small]')?.addEventListener('change', event => { localStorage.setItem(SMALL_KEY, (event.currentTarget as HTMLInputElement).checked ? 'on' : 'off'); document.body.classList.toggle('small-download', (event.currentTarget as HTMLInputElement).checked); dialog.querySelector<HTMLElement>('[data-parent-status]')!.textContent = 'Display choice saved on this device.'; });
  dialog.querySelector('[data-install]')?.addEventListener('click', async () => { if (!installPrompt) return; await installPrompt.prompt(); const result = await installPrompt.userChoice; dialog.querySelector<HTMLElement>('[data-parent-status]')!.textContent = result.outcome === 'accepted' ? 'Install accepted. The browser will finish it.' : 'Install dismissed. You can install later.'; installPrompt = undefined; });
  dialog.querySelector('[data-export]')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ product: 'creative-cartridge', exportedAt: new Date().toISOString(), works }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `creative-cartridge-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  });
  dialog.querySelector<HTMLInputElement>('[data-import]')?.addEventListener('change', async event => { const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return; try { const parsed = JSON.parse(await file.text()); const count = await importWorks(parsed.works ?? parsed); dialog.querySelector<HTMLElement>('[data-parent-status]')!.textContent = `Imported ${count} ${count === 1 ? 'piece' : 'pieces'}.`; await renderParentDesk(dialog); } catch (error) { dialog.querySelector<HTMLElement>('[data-parent-status]')!.textContent = error instanceof Error ? error.message : 'That backup could not be imported.'; } });
  dialog.querySelector('[data-clear-all]')?.addEventListener('click', async () => { if (!confirm(`Permanently remove all ${storageWorks} from this browser? Export first if you want a backup.`)) return; await clearWorks(); await renderParentDesk(dialog); dialog.querySelector<HTMLElement>('[data-parent-status]')!.textContent = 'All saved pieces were removed from this browser.'; });
  dialog.querySelector<HTMLFormElement>('[data-license-form]')?.addEventListener('submit', async event => { event.preventDefault(); const token = new FormData(event.currentTarget as HTMLFormElement).get('license')?.toString().trim() ?? ''; const status = dialog.querySelector<HTMLElement>('[data-license-status]')!; if (!token) { status.textContent = 'Paste the complete license token first.'; return; } localStorage.setItem(LICENSE_KEY, token); status.textContent = navigator.onLine ? 'Checking this license…' : 'Saved. Connect once to verify and unlock it.'; const valid = await verifyLicense(true); status.textContent = valid ? 'Weekend Ink restored on this device.' : navigator.onLine ? 'That license is not active for Creative Cartridge.' : 'Saved. Connect once to verify it.'; if (valid) window.setTimeout(() => renderParentDesk(dialog), 700); });
}

async function verifyLicense(force = false) {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return false;
  const cached = readVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) { weekendUnlocked = cached.valid; return cached.valid; }
  if (!navigator.onLine) return weekendUnlocked;
  try {
    const response = await fetch(`${API_BASE}/products/creative-cartridge/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable.');
    const result = await response.json() as { valid: boolean; reason?: string };
    const record = { valid: result.valid, reason: result.reason, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(record)); weekendUnlocked = result.valid;
    return result.valid;
  } catch { return weekendUnlocked; }
}

function showToast(message: string, reload = false) {
  const region = document.querySelector<HTMLElement>('#toast-region');
  if (!region) return;
  region.innerHTML = `<div class="toast"><span>${escapeHtml(message)}</span>${reload ? '<button type="button">Reload</button>' : ''}</div>`;
  if (reload) region.querySelector('button')?.addEventListener('click', () => location.reload());
  else window.setTimeout(() => { region.innerHTML = ''; }, 4000);
}

async function registerOffline() {
  if (!('serviceWorker' in navigator)) return;
  const hadController = Boolean(navigator.serviceWorker.controller);
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    updateNetworkState();
    if (registration.waiting) showToast('A fresh issue is ready.', true);
    navigator.serviceWorker.addEventListener('message', event => { if (event.data?.type === 'SW_UPDATED' && hadController) showToast('A fresh offline issue is ready.', true); });
  } catch { showToast('Offline setup could not finish. Stay online and reload once.'); }
}

function acceptReturnedLicense() {
  const url = new URL(location.href);
  const license = url.searchParams.get('license');
  if (!license) return;
  localStorage.setItem(LICENSE_KEY, license);
  url.searchParams.delete('license');
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  showToast('License received. Checking Weekend Ink…');
  void verifyLicense(true).then(valid => showToast(valid ? 'Weekend Ink is ready.' : 'The license could not be activated. Open the parent desk to retry.'));
}

window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event as BeforeInstallPromptEvent; });
window.addEventListener('online', updateNetworkState);
window.addEventListener('offline', updateNetworkState);

renderHome();
acceptReturnedLicense();
void verifyLicense();
void registerOffline();

const initialActivity = location.hash.slice(1) as ActivityId;
if (ACTIVITY_IDS.includes(initialActivity)) openActivity(initialActivity);
