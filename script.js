document.documentElement.classList.add('js');

// Header: solid background after scrolling
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile navigation
const nav = document.getElementById('nav');
const toggle = document.getElementById('menuToggle');
const setNav = (open) => {
  nav.classList.toggle('open', open);
  document.body.classList.toggle('nav-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
toggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setNav(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); toggle.focus(); }
});

// Highlight the nav link for the section in view
const links = [...nav.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
links.forEach((l) => {
  const section = document.querySelector(l.getAttribute('href'));
  if (section) sectionObserver.observe(section);
});

// Scroll reveal with a small stagger for siblings
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.children].filter((el) => el.classList.contains('reveal'));
    entry.target.style.transitionDelay = `${Math.min(siblings.indexOf(entry.target), 5) * 80}ms`;
    entry.target.classList.add('in');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Menu tabs (arrow keys move between tabs)
const tabs = [...document.querySelectorAll('[role="tab"]')];
const selectTab = (tab) => {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.classList.toggle('active', selected);
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    panel.hidden = !selected;
    panel.classList.toggle('active', selected);
  });
};
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// Reservation form
const form = document.getElementById('reserveForm');
const dateInput = document.getElementById('date');
dateInput.min = new Date().toISOString().split('T')[0];

const rules = {
  name: (v) => (v.trim().length < 2 ? 'Please enter your full name.' : ''),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email, like name@example.com.'),
  date: (v) => (!v ? 'Please choose a date for your visit.' : v < dateInput.min ? 'Please choose today or a future date.' : ''),
};
const validate = (field) => {
  const msg = rules[field.name](field.value);
  document.getElementById(field.name + '-err').textContent = msg;
  field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
};
Object.keys(rules).forEach((name) => form.elements[name].addEventListener('blur', (e) => validate(e.target)));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const invalid = Object.keys(rules).map((n) => form.elements[n]).filter((f) => !validate(f));
  if (invalid.length) { invalid[0].focus(); return; }

  const btn = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" aria-hidden="true"></span><span class="btn-label">Booking…</span>';

  // Demo only: replace with a real booking service (OpenTable, Resy, your own API)
  setTimeout(() => {
    const date = new Date(form.date.value + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    success.textContent = `Thank you, ${form.name.value.trim().split(' ')[0]}. Your table for ${form.guests.value} on ${date} at ${form.time.value} is requested. A confirmation will be sent to ${form.email.value}.`;
    success.hidden = false;
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-label">Confirm Reservation</span>';
    form.reset();
  }, 1200);
});

// Newsletter
document.getElementById('newsletter').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('nl-email');
  const msg = document.getElementById('nlMsg');
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
  msg.textContent = ok ? 'You’re on the list. See you at the table.' : 'Please enter a valid email address.';
  msg.style.color = ok ? 'var(--success)' : 'var(--danger)';
  if (ok) input.value = '';
});

document.getElementById('year').textContent = new Date().getFullYear();

/* =========================================================
   3D + CINEMATIC LAYER
   ========================================================= */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

// Cinematic intro: curtains open once per visit
const intro = document.getElementById('intro');
let introSeen = false;
try { introSeen = sessionStorage.getItem('arshia-intro') === '1'; sessionStorage.setItem('arshia-intro', '1'); } catch { /* ignore */ }
if (reduceMotion || introSeen) {
  intro.classList.add('gone');
} else {
  setTimeout(() => intro.classList.add('done'), 1700);
  setTimeout(() => intro.classList.add('gone'), 2900);
}

// Cinematic mode toggle (letterbox, film grain, colour grade)
const cineToggle = document.getElementById('cineToggle');
const setCinema = (on) => {
  document.body.classList.toggle('cinema', on);
  cineToggle.setAttribute('aria-pressed', String(on));
  store.set('arshia-cinema', on ? '1' : '0');
};
setCinema(store.get('arshia-cinema') === '1');
cineToggle.addEventListener('click', () => setCinema(!document.body.classList.contains('cinema')));

// Hero: 3D floating embers (Three.js) + mouse parallax depth
const hero = document.querySelector('.hero');
const heroMedia = document.getElementById('heroMedia');
const heroContent = document.getElementById('heroContent');
const mouse = { x: 0, y: 0 };

if (finePointer && !reduceMotion) {
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width - 0.5;
    mouse.y = (e.clientY - r.top) / r.height - 0.5;
    heroMedia.style.transform = `translate3d(${mouse.x * -24}px, ${mouse.y * -18}px, 0) scale(1.04)`;
    heroContent.style.transform = `rotateY(${mouse.x * 6}deg) rotateX(${mouse.y * -5}deg) translateZ(20px)`;
  });
  hero.addEventListener('pointerleave', () => {
    mouse.x = mouse.y = 0;
    heroMedia.style.transform = '';
    heroContent.style.transform = '';
  });
}

function initEmbers() {
  const canvas = document.getElementById('hero3d');
  if (!window.THREE || !canvas) return;
  const THREE = window.THREE;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 14;

  // Soft round glow sprite drawn on a 2D canvas
  const glow = document.createElement('canvas');
  glow.width = glow.height = 64;
  const g = glow.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,240,200,1)');
  grad.addColorStop(0.25, 'rgba(255,170,70,0.9)');
  grad.addColorStop(1, 'rgba(255,90,20,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const sprite = new THREE.CanvasTexture(glow);

  const makeLayer = (count, size, spread, depth) => {
    const pos = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    const sway = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * depth;
      speed[i] = 0.01 + Math.random() * 0.03;
      sway[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size, map: sprite, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return { points, pos, speed, sway, count };
  };
  const small = window.innerWidth < 700;
  const layers = [
    makeLayer(small ? 140 : 320, 0.18, 30, 14),
    makeLayer(small ? 20 : 45, 0.6, 30, 8),
  ];

  const resize = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  let running = true, t = 0;
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) loop(); }).observe(hero);
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) loop(); });

  let raf = 0;
  function loop() {
    cancelAnimationFrame(raf);
    if (!running) return;
    t += 0.016;
    layers.forEach((L) => {
      for (let i = 0; i < L.count; i++) {
        L.pos[i * 3 + 1] += L.speed[i];
        L.pos[i * 3] += Math.sin(t + L.sway[i]) * 0.004;
        if (L.pos[i * 3 + 1] > 9) L.pos[i * 3 + 1] = -9;
      }
      L.points.geometry.attributes.position.needsUpdate = true;
    });
    camera.position.x += (mouse.x * 3 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  if (reduceMotion) { renderer.render(scene, camera); running = false; } else loop();
}
initEmbers();

// 3D tilt with light glare on cards
if (finePointer && !reduceMotion) {
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const glare = document.createElement('span');
    glare.className = 'tilt-glare';
    el.appendChild(glare);
    const max = el.classList.contains('story-images') ? 8 : 10;
    el.addEventListener('pointerenter', () => { el.style.transition = 'transform 180ms ease-out'; });
    el.addEventListener('pointermove', (e) => {
      if (!el.classList.contains('in')) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) scale(1.02)`;
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = '';
    });
  });
}

// Cinematic scroll scenes: chapter changes as you scroll through the section
const cine = document.getElementById('experience');
const frames = [...cine.querySelectorAll('.cine-frame')];
const texts = [...cine.querySelectorAll('.cine-text')];
const cineNum = document.getElementById('cineNum');
const cineBar = document.getElementById('cineBar');
let scene = -1;
const updateCine = () => {
  const r = cine.getBoundingClientRect();
  const total = cine.offsetHeight - window.innerHeight;
  const p = Math.min(Math.max(-r.top / total, 0), 1);
  cineBar.style.width = `${p * 100}%`;
  const next = Math.min(Math.floor(p * frames.length), frames.length - 1);
  if (next === scene) return;
  scene = next;
  frames.forEach((f, i) => f.classList.toggle('active', i === scene));
  texts.forEach((t, i) => t.classList.toggle('active', i === scene));
  cineNum.textContent = String(scene + 1).padStart(2, '0');
};
updateCine();
window.addEventListener('scroll', () => requestAnimationFrame(updateCine), { passive: true });

// 3D carousel: arrows, keyboard, drag/swipe
const stage = document.getElementById('carouselStage');
const ring = document.getElementById('carouselRing');
const cards = [...ring.children];
const cStatus = document.getElementById('cStatus');
const step = 360 / cards.length;
let current = 0, radius = 0, dragX = null, dragRot = 0;

const layoutRing = () => {
  const w = cards[0].offsetWidth;
  radius = Math.round(w / 2 / Math.tan(Math.PI / cards.length)) + 60;
  cards.forEach((c, i) => { c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`; });
  rotateTo(current);
};
const rotateTo = (i, extra = 0) => {
  current = i;
  ring.style.transform = `translateZ(${-radius}px) rotateY(${-i * step + extra}deg)`;
  const idx = ((i % cards.length) + cards.length) % cards.length;
  cards.forEach((c, n) => { c.classList.toggle('active', n === idx); c.setAttribute('aria-hidden', String(n !== idx)); });
  cStatus.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')} — ${cards[idx].querySelector('h3').textContent}`;
};
document.getElementById('cPrev').addEventListener('click', () => rotateTo(current - 1));
document.getElementById('cNext').addEventListener('click', () => rotateTo(current + 1));
document.getElementById('carousel').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') rotateTo(current - 1);
  if (e.key === 'ArrowRight') rotateTo(current + 1);
});
stage.addEventListener('pointerdown', (e) => { dragX = e.clientX; dragRot = 0; stage.classList.add('dragging'); stage.setPointerCapture(e.pointerId); });
stage.addEventListener('pointermove', (e) => {
  if (dragX === null) return;
  dragRot = (e.clientX - dragX) * 0.25;
  rotateTo(current, dragRot);
});
const endDrag = () => {
  if (dragX === null) return;
  stage.classList.remove('dragging');
  dragX = null;
  // A short flick still moves one card; a long drag moves several
  const moved = Math.round(dragRot / step) || (dragRot > 8 ? 1 : dragRot < -8 ? -1 : 0);
  rotateTo(current - moved);
};
stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);
layoutRing();
window.addEventListener('resize', layoutRing);
