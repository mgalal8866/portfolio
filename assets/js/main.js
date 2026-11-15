import * as THREE from 'three';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isTouch = matchMedia('(hover: none)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.body.classList.add('loading');
gsap.registerPlugin(ScrollTrigger);

/* ---------------- I18N ---------------- */
const LANG = document.documentElement.lang === 'ar' ? 'ar' : 'en';
const RTL = LANG === 'ar';
const DIR = RTL ? -1 : 1; // flips horizontal motion in RTL
const I18N = {
  en: {
    'nav.about': 'About', 'nav.skills': 'Skills', 'nav.experience': 'Experience', 'nav.projects': 'Projects', 'nav.contact': 'Contact',
    cv: 'Download CV','hero.hi': "Hi, I'm", 'hero.work': 'View my work', 'hero.talk': "Let's talk", 'hero.scroll': 'scroll',
    'about.title': 'About me', 'about.location': 'Location', 'about.education': 'Education', 'about.military': 'Military',
    'skills.title': 'Skills & Stack', 'experience.title': 'Experience', 'projects.title': 'Selected Projects',
    'contact.title': 'Let\'s build something <span class="grad">great</span> together.',
    'contact.sub': 'Have a project in mind or need a solid Laravel backend? My inbox is open.',
    footer: 'Built with Laravel-grade care ✦ Three.js ✦ GSAP', all: 'All', featured: '★ Featured', visit: 'Visit project ↗',
    present: 'Present', whatsapp: 'WhatsApp', 'wa.tip': 'Chat on WhatsApp', 'wa.msg': "Hi Mohamed, I saw your portfolio and I'd like to talk about a project.",
    switchTo: 'ع', switchLabel: 'التبديل إلى العربية'
  },
  ar: {
    'nav.about': 'عنّي', 'nav.skills': 'المهارات', 'nav.experience': 'الخبرات', 'nav.projects': 'المشاريع', 'nav.contact': 'تواصل',
    cv: 'تحميل السيرة الذاتية','hero.hi': 'أهلًا، أنا', 'hero.work': 'شاهد أعمالي', 'hero.talk': 'يلا نتكلم', 'hero.scroll': 'مرّر',
    'about.title': 'نبذة عنّي', 'about.location': 'الموقع', 'about.education': 'التعليم', 'about.military': 'الخدمة العسكرية',
    'skills.title': 'المهارات والتقنيات', 'experience.title': 'الخبرات', 'projects.title': 'مشاريع مختارة',
    'contact.title': 'خلّينا نبني حاجة <span class="grad">مميزة</span> سوا.',
    'contact.sub': 'عندك فكرة مشروع أو محتاج باك إند Laravel قوي؟ تواصل معايا في أي وقت.',
    footer: 'صُنع بعناية ✦ Three.js ✦ GSAP', all: 'الكل', featured: '★ مميز', visit: 'زيارة المشروع ↖',
    present: 'حتى الآن', whatsapp: 'واتساب', 'wa.tip': 'كلّمني على واتساب', 'wa.msg': 'أهلًا محمد، شفت البورتفوليو بتاعك وحابب نتكلم في مشروع.',
    switchTo: 'EN', switchLabel: 'Switch to English'
  }
};
const t = k => I18N[LANG][k] ?? I18N.en[k] ?? k;
// Arabic value from "<key>_ar" when filled in, English otherwise
const tr = (o, k) => {
  const v = RTL ? o?.[k + '_ar'] : undefined;
  return v != null && v !== '' && !(Array.isArray(v) && !v.length) ? v : o?.[k];
};

function applyI18n() {
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  const b = $('#langToggle');
  b.textContent = t('switchTo'); b.setAttribute('aria-label', t('switchLabel')); b.title = t('switchLabel');
  b.addEventListener('click', () => {
    const next = RTL ? 'en' : 'ar';
    try { localStorage.setItem('lang', next); } catch (e) {}
    const u = new URL(location.href); u.searchParams.set('lang', next); location.href = u.toString();
  });
}
const WA_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.8c-2.02 0-4-.54-5.72-1.57l-.41-.24-3.96 1.04 1.06-3.86-.27-.4A10.76 10.76 0 0 1 5.2 16c0-5.97 4.86-10.82 10.84-10.82S26.86 10.03 26.86 16 22 26.8 16.04 26.8Zm5.94-8.1c-.33-.16-1.94-.96-2.24-1.07-.3-.11-.52-.16-.74.17-.22.32-.85 1.06-1.04 1.28-.19.22-.38.24-.71.08-.33-.16-1.38-.51-2.63-1.62-.97-.87-1.63-1.94-1.82-2.27-.19-.33-.02-.5.14-.67.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71s1.17 3.15 1.33 3.36c.16.22 2.3 3.5 5.56 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.94-.79 2.21-1.56.27-.77.27-1.42.19-1.56-.08-.14-.3-.22-.63-.38Z"/></svg>';

/* ---------------- DATA ---------------- */
async function loadData() {
  const res = await fetch('data/portfolio.json?v=' + Date.now());
  return res.json();
}

function render(d) {
  const p = d.profile;
  const L = o => new Proxy(o, { get: (o, k) => typeof k === 'string' ? tr(o, k) : o[k] }); // localized view of an item
  const lp = L(p);
  const about = lp.about || '';
  const fields = { name: lp.name, shortName: lp.shortName, location: lp.location, education: lp.education, military: lp.military, about,
    aboutShort: about.split(/(?<=[.!?؟])\s/)[0] || '' };
  $$('[data-field]').forEach(el => { el.textContent = fields[el.dataset.field] ?? ''; });
  document.title = `${lp.shortName || lp.name} — ${lp.title}`;
  $('#photo').alt = lp.name || '';
  if (p.photo) $('#photo').src = p.photo;
  $$('[data-cv]').forEach(a => { if (p.cv) a.href = p.cv; else a.remove(); });
  $('#year').textContent = new Date().getFullYear();

  // marquee
  const words = [...new Set([...d.skills.map(s => s.name), ...d.projects.flatMap(x => x.tags || [])])].slice(0, 16);
  $('#marquee').innerHTML = [...words, ...words].map(w => `<span>${esc(w)}</span>`).join('');

  // stats
  $('#stats').innerHTML = (d.stats || []).map(s => `
    <div class="stat"><div class="stat__num"><span class="count" data-to="${+s.value || 0}">0</span>${esc(s.suffix)}</div>
    <div class="stat__label">${esc(tr(s, 'label'))}</div></div>`).join('');

  // skills
  const skills = [...d.skills].sort((a, b) => b.level - a.level);
  $('#skillsList').innerHTML = skills.map(s => `
    <div class="skill"><div class="skill__top"><div><span class="skill__name">${esc(s.name)}</span><span class="skill__cat mono">${esc(s.category || '')}</span></div>
    <span class="skill__pct mono">${+s.level}%</span></div><div class="skill__bar"><span data-w="${+s.level}"></span></div></div>`).join('');
  buildSphere(d.skills.map(s => s.name).concat(['Git', 'Redis', 'Queues', 'Docker', 'Firebase', 'Google Maps', 'OOP', 'SOLID', 'JSON', 'Linux']));

  // experience
  const when = v => /^present$/i.test(String(v).trim()) ? t('present') : v;
  $('#timeline').insertAdjacentHTML('beforeend', d.experience.map(L).map(j => `
    <div class="job"><span class="job__dot"></span><div class="job__card">
      <div class="job__date mono">${esc(j.from)} — ${esc(when(j.to))}</div>
      <h3 class="job__role">${esc(j.role)}</h3>
      <div class="job__company">${esc(j.company)} <i>· ${esc(j.location)}</i></div>
      <p class="job__desc">${esc(j.description)}</p></div></div>`).join(''));

  // projects
  const tags = [t('all'), ...new Set(d.projects.flatMap(x => x.tags || []))].slice(0, 9);
  $('#filters').innerHTML = tags.map((t, i) => `<button class="${i ? '' : 'active'}" data-tag="${esc(t)}">${esc(t)}</button>`).join('');
  const arts = ['linear-gradient(135deg,#7c5cff,#00e1ff)', 'linear-gradient(135deg,#ff4fd8,#7c5cff)', 'linear-gradient(135deg,#00e1ff,#2bff88)', 'linear-gradient(135deg,#ff8a3d,#ff4fd8)', 'linear-gradient(135deg,#3d7bff,#00e1ff)'];
  const media = (x, i) => (x = L(x), x.image)
    ? `<div class="project__media"><img src="${esc(x.image)}" alt="${esc(x.title)}" loading="lazy"></div>`
    : `<div class="project__media"><div class="project__art" style="--art:${arts[i % arts.length]}"><b>${esc(x.title.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase())}</b></div></div>`;
  $('#projectsGrid').innerHTML = d.projects.map(L).map((x, i) => `
    <article class="project" data-i="${i}" data-tags="${esc((x.tags || []).join('|'))}">
      ${x.featured ? `<span class="featured">${t('featured')}</span>` : ''}
      ${media(x, i)}
      <div class="project__body">
        <div class="project__sub mono">${esc(x.subtitle || '')}</div>
        <h3 class="project__title">${esc(x.title)} <span class="arrow">${RTL ? '↖' : '↗'}</span></h3>
        <p class="project__desc">${esc(x.description)}</p>
        <div class="tags">${(x.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
      </div></article>`).join('');
  $$('.project').forEach(card => card.addEventListener('click', () => openModal(L(d.projects[card.dataset.i]), media(d.projects[card.dataset.i], +card.dataset.i))));
  $('#filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#filters button').forEach(x => x.classList.toggle('active', x === b));
    const tag = b.dataset.tag, all = b === $('#filters button');
    $$('.project').forEach(c => {
      const show = all || c.dataset.tags.split('|').includes(tag);
      gsap.to(c, { opacity: show ? 1 : 0.12, scale: show ? 1 : 0.94, filter: show ? 'blur(0px)' : 'blur(3px)', duration: .5, ease: 'power3.out' });
      c.style.pointerEvents = show ? '' : 'none';
    });
  });

  // contact
  const links = [];
  if (p.email) links.push([`mailto:${p.email}`, '✉ ' + p.email, true]);
  const wa = p.whatsapp ? `https://wa.me/${p.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(t('wa.msg'))}` : '';
  if (wa) {
    links.push([wa, t('whatsapp'), false, false, 'btn--wa', WA_ICON]);
    const f = $('#waFloat'); f.href = wa; f.hidden = false; f.setAttribute('aria-label', t('wa.tip'));
  }
  if (p.phone) links.push([`tel:${p.phone}`, p.phone]);
  if (p.linkedin) links.push([p.linkedin, 'LinkedIn']);
  if (p.github) links.push([p.github, 'GitHub']);
  if (p.cv) links.push([p.cv, t('cv'), false, true]);
  $('#contactLinks').innerHTML = links.map(([h, label, primary, dl, cls = '', icon = '']) =>
    `<a class="btn ${primary ? '' : 'btn--ghost'} ${cls} magnetic" href="${esc(h)}" ${dl ? 'download' : 'target="_blank" rel="noopener"'}>${icon}<span>${esc(label)}</span></a>`).join('');
}

/* ---------------- MODAL ---------------- */
function openModal(x, media) {
  $('#modalBody').innerHTML = `${media}<div class="project__body" style="transform:none">
    <div class="project__sub mono">${esc(x.subtitle || '')}</div><h3 class="project__title">${esc(x.title)}</h3>
    <p class="project__desc">${esc(x.description)}</p><div class="tags" style="margin-bottom:22px">${(x.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
    ${x.link ? `<a class="btn" href="${esc(x.link)}" target="_blank" rel="noopener">${t('visit')}</a>` : ''}</div>`;
  const m = $('#modal'); m.classList.add('open'); lenis?.stop();
  gsap.fromTo('.modal__backdrop', { opacity: 0 }, { opacity: 1, duration: .4 });
  gsap.fromTo('.modal__card', { opacity: 0, y: 60, rotateX: -12, scale: .94 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: .7, ease: 'expo.out' });
}
function closeModal() {
  gsap.to('.modal__card', { opacity: 0, y: 40, scale: .96, duration: .35, ease: 'power2.in' });
  gsap.to('.modal__backdrop', { opacity: 0, duration: .35, onComplete: () => { $('#modal').classList.remove('open'); lenis?.start(); } });
}
document.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modal').classList.contains('open')) closeModal(); });

/* ---------------- SKILL SPHERE ---------------- */
function buildSphere(names) {
  const box = $('#sphere');
  const list = [...new Set(names)];
  box.innerHTML = list.map(n => `<span>${esc(n)}</span>`).join('');
  const els = $$('span', box);
  const pts = els.map((el, i) => {
    const phi = Math.acos(-1 + (2 * i + 1) / els.length), th = Math.sqrt(els.length * Math.PI) * phi;
    return { el, x: Math.cos(th) * Math.sin(phi), y: Math.sin(th) * Math.sin(phi), z: Math.cos(phi) };
  });
  let ax = 0.003, ay = 0.004, tx = ax, ty = ay;
  box.addEventListener('pointermove', e => {
    const r = box.getBoundingClientRect();
    ty = ((e.clientX - r.left) / r.width - .5) * 0.03;
    tx = -((e.clientY - r.top) / r.height - .5) * 0.03;
  });
  box.addEventListener('pointerleave', () => { tx = 0.003; ty = 0.004; });
  (function tick() {
    ax += (tx - ax) * .05; ay += (ty - ay) * .05;
    const R = box.clientWidth * 0.4, cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
    for (const p of pts) {
      let y = p.y * cx - p.z * sx, z = p.y * sx + p.z * cx; p.y = y; p.z = z;
      let x = p.x * cy + p.z * sy; z = -p.x * sy + p.z * cy; p.x = x; p.z = z;
      const s = (p.z + 2) / 3;
      p.el.style.transform = `translate(-50%,-50%) translate3d(${p.x * R}px,${p.y * R}px,0) scale(${s})`;
      p.el.style.opacity = 0.25 + (p.z + 1) * 0.375;
      p.el.style.zIndex = Math.round(p.z * 100) + 100;
    }
    requestAnimationFrame(tick);
  })();
}

/* ---------------- HERO 3D ---------------- */
const noiseGLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;
vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+2.0*C.xxx;vec3 x3=x0-1.0+3.0*C.xxx;
i=mod(i,289.0);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;

const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = -(e.clientY / innerHeight * 2 - 1); });

function hero3D() {
  const canvas = $('#hero3d');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6;

  const uniforms = { uTime: { value: 0 }, uHover: { value: 0 }, uC1: { value: new THREE.Color('#7c5cff') }, uC2: { value: new THREE.Color('#00e1ff') }, uC3: { value: new THREE.Color('#ff4fd8') } };
  const blobMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `${noiseGLSL}
      uniform float uTime; uniform float uHover; varying vec3 vN; varying vec3 vView; varying float vD;
      void main(){ float d = snoise(normal*1.4 + uTime*0.35) * (0.28 + uHover*0.25); vD = d;
        vec3 pos = position + normal * d; vec4 mv = modelViewMatrix * vec4(pos,1.0);
        vN = normalize(normalMatrix*normal); vView = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform float uTime; varying vec3 vN; varying vec3 vView; varying float vD;
      void main(){ float f = pow(1.0 - max(dot(vN, vView),0.0), 2.2);
        vec3 c = mix(uC1, uC2, smoothstep(-0.3,0.35,vD + sin(uTime*0.6)*0.15)); c = mix(c, uC3, f*0.8);
        gl_FragColor = vec4(c*(0.35+f*1.4), 0.95); }`,
    transparent: true
  });
  const group = new THREE.Group(); scene.add(group);
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 64), blobMat); group.add(blob);
  const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.05, 1), new THREE.MeshBasicMaterial({ color: 0x7c5cff, wireframe: true, transparent: true, opacity: .14 }));
  group.add(wire);

  // orbit rings
  const rings = [];
  [[2.5, 0x00e1ff, 1.1], [2.9, 0xff4fd8, -0.6], [3.3, 0x7c5cff, 0.3]].forEach(([r, c, tilt]) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 8, 180), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .45 }));
    ring.rotation.x = Math.PI / 2 + tilt * .4; ring.rotation.y = tilt;
    const sat = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({ color: c }));
    sat.position.x = r; ring.add(sat); group.add(ring); rings.push(ring);
  });

  // particles
  const N = innerWidth < 760 ? 900 : 2200, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const palette = [new THREE.Color('#7c5cff'), new THREE.Color('#00e1ff'), new THREE.Color('#ff4fd8'), new THREE.Color('#ffffff')];
  for (let i = 0; i < N; i++) {
    const r = 4 + Math.random() * 14, t = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 2 - 1);
    pos.set([r * Math.sin(ph) * Math.cos(t), r * Math.sin(ph) * Math.sin(t), r * Math.cos(ph) - 4], i * 3);
    const c = palette[i % 4]; col.set([c.r, c.g, c.b], i * 3);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const stars = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(stars);

  // hover detection
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2(); let hoverT = 0;
  let scrollP = 0;
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: s => scrollP = s.progress });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    group.position.x = w > 980 ? 2.1 * DIR : 0; group.position.y = w > 980 ? 0 : -0.6;
    group.scale.setScalar(w > 980 ? 1 : 0.72);
  }
  addEventListener('resize', resize); resize();

  let visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(canvas);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    mouse.sx += (mouse.x - mouse.sx) * .05; mouse.sy += (mouse.y - mouse.sy) * .05;
    v2.set(mouse.x, mouse.y); ray.setFromCamera(v2, camera);
    hoverT += ((ray.intersectObject(blob).length ? 1 : 0) - hoverT) * .06;
    uniforms.uTime.value = t * (1 + hoverT); uniforms.uHover.value = hoverT;
    blob.rotation.y = t * .15; wire.rotation.y = -t * .08; wire.rotation.x = t * .05;
    rings.forEach((r, i) => r.rotation.z = t * (0.3 + i * .15) * (i % 2 ? -1 : 1));
    group.rotation.x = mouse.sy * .35; group.rotation.y = mouse.sx * .5;
    stars.rotation.y = t * .02 + mouse.sx * .1; stars.rotation.x = mouse.sy * .08;
    camera.position.z = 6 + scrollP * 4; camera.position.y = -scrollP * 1.5;
    renderer.render(scene, camera);
  })();
}

/* ---------------- CONTACT 3D ---------------- */
function contact3D() {
  const canvas = $('#contact3d');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(45, 1, .1, 100); camera.position.z = 9;
  const geo = new THREE.TorusKnotGeometry(2.6, .7, 260, 32);
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: .025, color: 0x7c5cff, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
  const lines = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x00e1ff, wireframe: true, transparent: true, opacity: .035 }));
  scene.add(pts, lines);
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  let visible = false; new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(canvas);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop); if (!visible) return;
    const t = clock.getElapsedTime();
    pts.rotation.set(t * .1 + mouse.sy * .3, t * .15 + mouse.sx * .4, 0); lines.rotation.copy(pts.rotation);
    renderer.render(scene, camera);
  })();
}

/* ---------------- INTERACTIONS ---------------- */
let lenis;
function smoothScroll() {
  if (reduced || typeof Lenis === 'undefined') return;
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    e.preventDefault(); $('#nav').classList.remove('open'); lenis.scrollTo(id, { offset: -60, duration: 1.6 });
  }));
}

function cursor() {
  if (isTouch) return;
  const c = $('#cursor'), d = $('#cursorDot');
  const xTo = gsap.quickTo(c, 'x', { duration: .45, ease: 'power3' }), yTo = gsap.quickTo(c, 'y', { duration: .45, ease: 'power3' });
  addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); gsap.set(d, { x: e.clientX, y: e.clientY }); });
  document.addEventListener('pointerover', e => c.classList.toggle('hover', !!e.target.closest('a,button,.project')));
}

function magnetic() {
  if (isTouch) return;
  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .35, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' }));
  });
}

function tilt() {
  if (isTouch) return;
  const bind = (el, inner, max) => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      inner.style.transform = `rotateY(${(px - .5) * max}deg) rotateX(${(.5 - py) * max}deg)`;
      el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
    });
    el.addEventListener('pointerleave', () => inner.style.transform = '');
  };
  $$('.tilt').forEach(el => bind(el, $('.about__photo-inner', el), 16));
  $$('.project').forEach(el => bind(el, el, 10));
}

function typed(roles) {
  const el = $('#typed'); let r = 0, i = 0, del = false;
  (function step() {
    const word = roles[r % roles.length];
    el.textContent = word.slice(0, i);
    if (!del && i++ === word.length) { del = true; return setTimeout(step, 1600); }
    if (del && i-- === 0) { del = false; r++; i = 0; }
    setTimeout(step, del ? 35 : 75);
  })();
}

function splitText() {
  $$('.split').forEach(el => {
    const walk = node => [...node.childNodes].map(n => {
      if (n.nodeType === 3) return n.textContent.split(/(\s+)/).map(w => /^\s+$/.test(w) || !w ? w
        : `<span class="w">${RTL ? `<span class="ch">${esc(w)}</span>` : [...w].map(c => `<span class="ch">${esc(c)}</span>`).join('')}</span>`).join('');
      const clone = n.cloneNode(false); clone.innerHTML = walk(n); return clone.outerHTML;
    }).join('');
    el.innerHTML = walk(el);
  });
}

// One continuous gradient across the letters of a split .grad word
function paintGrad() {
  $$('.split .grad').forEach(g => {
    const chs = $$('.ch', g); if (!chs.length) return;
    const left = Math.min(...chs.map(c => c.offsetLeft)), right = Math.max(...chs.map(c => c.offsetLeft + c.offsetWidth));
    chs.forEach(c => { c.style.backgroundSize = `${right - left}px 100%`; c.style.backgroundPosition = `${left - c.offsetLeft}px 0`; });
  });
}

function animations() {
  // nav + progress
  ScrollTrigger.create({ start: 60, end: 'max', onUpdate: s => { $('#nav').classList.toggle('scrolled', s.scroll() > 60); gsap.set('#progress', { scaleX: s.progress }); } });
  $('#burger').addEventListener('click', () => $('#nav').classList.toggle('open'));
  $$('section[id]').forEach(sec => ScrollTrigger.create({
    trigger: sec, start: 'top 50%', end: 'bottom 50%',
    onToggle: s => s.isActive && $$('.nav__links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id))
  }));

  // split titles
  $$('.split').forEach(el => gsap.from($$('.ch', el), {
    yPercent: 110, rotate: 8, opacity: 0, stagger: RTL ? .07 : .025, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 85%' }
  }));
  $$('.section .reveal-up, .contact .reveal-up').forEach(el => gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));

  // about
  gsap.from('.about__photo', { clipPath: 'inset(100% 0 0 0)', scale: 1.15, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.about', start: 'top 70%' } });
  gsap.to('.about__photo', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.about', scrub: true } });
  gsap.from('.stat', { y: 40, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#stats', start: 'top 88%' } });
  $$('.count').forEach(el => gsap.to(el, {
    innerText: +el.dataset.to, duration: 2, ease: 'power2.out', snap: { innerText: 1 },
    scrollTrigger: { trigger: el, start: 'top 92%' }
  }));

  // skills
  gsap.from('.skill', { x: 60 * DIR, opacity: 0, stagger: .06, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#skillsList', start: 'top 80%' } });
  $$('.skill__bar span').forEach(b => gsap.to(b, { width: b.dataset.w + '%', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 92%' } }));
  gsap.from('#sphere', { scale: .4, opacity: 0, rotate: -40, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '#sphere', start: 'top 80%' } });

  // timeline
  gsap.to('#timelineFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 60%', end: 'bottom 60%', scrub: true } });
  $$('.job').forEach((j, i) => gsap.from($('.job__card', j), {
    x: (innerWidth > 980 ? (i % 2 ? -80 : 80) : 40) * DIR, rotateY: (i % 2 ? 12 : -12) * DIR, opacity: 0, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: j, start: 'top 82%' }
  }));
  $$('.job__dot').forEach(dot => gsap.from(dot, { scale: 0, duration: .8, ease: 'back.out(3)', scrollTrigger: { trigger: dot, start: 'top 75%' } }));

  // projects
  gsap.from('.project', { y: 120, opacity: 0, rotateX: -25, stagger: .12, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '#projectsGrid', start: 'top 85%' } });
  gsap.from('.filters button', { y: 20, opacity: 0, stagger: .04, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '#filters', start: 'top 90%' } });
  if (!$('#waFloat').hidden) gsap.from('#waFloat', { scale: 0, opacity: 0, duration: .9, ease: 'back.out(2.5)', delay: 2.6 });
  gsap.to('.marquee__track', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.marquee', scrub: 1 } });
}

function intro() {
  const tl = gsap.timeline();
  const o = { v: 0 };
  tl.to(o, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => { $('#loaderPct').textContent = Math.round(o.v) + '%'; $('#loaderBar').style.width = o.v + '%'; } })
    .to('.loader__inner', { y: -30, opacity: 0, duration: .5, ease: 'power2.in' })
    .to('#loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut', onComplete: () => { $('#loader').remove(); document.body.classList.remove('loading'); } }, '-=.1')
    .from('#hero3d', { opacity: 0, scale: 1.2, duration: 2, ease: 'expo.out' }, '-=.6')
    .from('.hero .word', { yPercent: 120, rotate: 6, duration: 1.3, stagger: .12, ease: 'expo.out' }, '<.1')
    .from('.hero .reveal-up, .hero__role', { y: 30, opacity: 0, duration: 1, stagger: .1, ease: 'expo.out' }, '<.3')
    .from('.nav > *', { y: -30, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out' }, '<')
    .from('.hero__scroll', { opacity: 0, duration: 1 }, '<.4');
}

/* ---------------- BOOT ---------------- */
(async function boot() {
  let data;
  try { data = await loadData(); } catch (e) { console.error('Could not load data/portfolio.json', e); return; }
  applyI18n();
  render(data);
  splitText();
  paintGrad(); document.fonts?.ready.then(paintGrad); addEventListener('resize', paintGrad);
  smoothScroll(); cursor(); magnetic(); tilt();
  const roles = tr(data.profile, 'roles');
  typed(roles?.length ? roles : [tr(data.profile, 'title')]);
  try { hero3D(); contact3D(); } catch (e) { console.warn('WebGL unavailable', e); }
  animations(); intro();
  addEventListener('load', () => ScrollTrigger.refresh());
})();
