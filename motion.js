const cover = document.querySelector('.page-scene');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const squares = [...cover.querySelectorAll('.mosaic')];
let offsetX = 0, offsetY = 0, frame = 0;
function paint() {
  const progress = Math.min(1, Math.max(0, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
  cover.style.setProperty('--depth', String(progress * 0.78));
  const scroll = progress * 240;
  squares.forEach((square, index) => {
    const depth = (index + 2) / 6;
    const direction = index % 2 ? -1 : 1;
    const x = depth * (offsetX * 52 + scroll * .22) * direction;
    const y = depth * (offsetY * 40 - scroll * .27);
    square.style.translate = motion.matches ? 'none' : x + 'px ' + y + 'px';
  });
  frame = 0;
}
function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
function settle() {
  cover.classList.remove('lit');
  offsetX = offsetY = 0;
  schedule();
}
document.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || motion.matches) return;
  const box = cover.getBoundingClientRect();
  offsetX = 2 * (event.clientX - box.left) / box.width - 1;
  offsetY = 2 * (event.clientY - box.top) / box.height - 1;
  cover.classList.add('lit');
  cover.style.setProperty("--px", (event.clientX - box.left) + "px");
  cover.style.setProperty("--py", (event.clientY - box.top) + "px");
  schedule();
});
document.documentElement.addEventListener('pointerleave', settle);
motion.addEventListener('change', settle);
addEventListener('scroll', schedule, {passive:true});
new ResizeObserver(schedule).observe(document.body);
schedule();
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('enter');
        observer.unobserve(entry.target);
      }
    }
  });
  document.querySelectorAll('details, .content h2, .skills > div').forEach(el => observer.observe(el));
}

const root = document.documentElement;
const siteHeader = document.querySelector('.site-header');
new ResizeObserver(() => {
  root.style.setProperty('--header-height', `${siteHeader.offsetHeight}px`);
}).observe(siteHeader);
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const title = document.querySelector('.hero h1');
function decorateTitle() {
title.setAttribute('aria-label', title.textContent.trim());
for (const line of title.children) {
  line.setAttribute('aria-hidden', 'true');
  line.textContent = line.textContent;
  for (const node of [...line.childNodes]) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const letters = document.createDocumentFragment();
    for (const [index, char] of [...node.textContent].entries()) {
      const letter = document.createElement('b');
      letter.textContent = char;
      letter.style.setProperty('--index', index);
      letters.append(letter);
    }
    node.replaceWith(letters);
  }
}

}
decorateTitle();
document.addEventListener('languagechange', decorateTitle);

function playIntro() {
  if (motion.matches || location.hash || scrollY > 0) return;
  try {
    if (sessionStorage.getItem('cv-signal-intro')) return;
    sessionStorage.setItem('cv-signal-intro', '1');
  } catch { /* Storage is optional. */ }
  const screen = document.createElement('div');
  screen.className = 'signal-intro';
  screen.setAttribute('aria-hidden', 'true');
  screen.innerHTML = '<canvas width="1000" height="100"></canvas><output></output>';
  document.body.append(screen);
  root.classList.add('intro-playing');
  const canvas = screen.querySelector('canvas');
  const pen = canvas.getContext('2d');
  const count = screen.querySelector('output');
  const start = performance.now();
  function finish() {
    screen.remove();
    root.classList.remove('intro-playing');
  }
  function draw(now) {
    if (!screen.isConnected || motion.matches) return finish();
    const phase = Math.min(1, (now - start) / 950);
    count.textContent = Math.round(phase * 100) + '%';
    if (pen) {
      pen.clearRect(0, 0, 1000, 100);
      pen.beginPath();
      for (let x = 0; x <= 1000; x += 5) {
        const t = x * 0.06 + phase * 14;
        const y = 50 + (1 - phase) * 26 * Math.sin(t) * Math.cos(t * 0.34);
        pen.lineTo(x, y);
      }
      pen.strokeStyle = '#9bddff';
      pen.lineWidth = 2;
      pen.stroke();
    }
    if (phase < 1) requestAnimationFrame(draw);
    else { screen.classList.add('exit'); setTimeout(finish, 220); }
  }
  requestAnimationFrame(draw);
}
playIntro();

const tracker = document.createElement('div');
tracker.className = 'tracking';
tracker.setAttribute('aria-hidden', 'true');
document.body.append(tracker);
let pointerFrame = 0;
function removeTracker() { tracker.classList.remove('visible'); }
document.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || !finePointer.matches || motion.matches) return removeTracker();
  const x = event.clientX, y = event.clientY;
  cancelAnimationFrame(pointerFrame);
  pointerFrame = requestAnimationFrame(() => {
    tracker.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    tracker.dataset.position = 'X ' + x + '  Y ' + y;
    tracker.classList.toggle('active', !!event.target.closest('a,summary,button'));
    tracker.classList.add('visible');
  });
});
document.addEventListener('pointerout', event => { if (!event.relatedTarget) removeTracker(); });
window.addEventListener('blur', removeTracker);

// Ease discrete mouse-wheel steps. Small trackpad deltas and touch stay native.
let wheelFrame = 0;
let destination = 0;
let lastTime = 0;
function stopWheel() {
  cancelAnimationFrame(wheelFrame);
  wheelFrame = 0;
}
function advanceWheel(time) {
  const elapsed = Math.min(64, time - lastTime);
  lastTime = time;
  const remaining = destination - scrollY;
  if (Math.abs(remaining) < 1.5) {
    scrollTo({top:destination,behavior:'instant'});
    wheelFrame = 0;
    return;
  }
  scrollTo({top:scrollY + remaining * (1 - Math.exp(-elapsed / 72)),behavior:'instant'});
  wheelFrame = requestAnimationFrame(advanceWheel);
}
addEventListener('wheel', event => {
  if (document.documentElement.classList.contains('viewer-open')) { stopWheel(); return; }
  if (motion.matches || event.ctrlKey || event.shiftKey || event.defaultPrevented || Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
      (event.deltaMode === 0 && Math.abs(event.deltaY) < 60)) {
    stopWheel();
    return;
  }
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
  const limit = Math.max(0,document.documentElement.scrollHeight - innerHeight);
  destination = Math.max(0,Math.min(limit,(wheelFrame ? destination : scrollY) + event.deltaY * unit));
  if (!event.cancelable) { stopWheel(); return; }
  event.preventDefault();
  if (!wheelFrame) {
    lastTime = performance.now();
    wheelFrame = requestAnimationFrame(advanceWheel);
  }
}, {passive:false});
for (const type of ['pointerdown','keydown','touchstart','blur']) addEventListener(type,stopWheel,{passive:true});
motion.addEventListener('change',stopWheel);

const experience = document.getElementById('experience');

experience.addEventListener('click', event => {
  if (event.target.closest('summary')) {
    stopWheel();
  }
});
