/* Web Code — interactions */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  /* ===== رقم الواتساب: اكتب الرقم الدولي بالأرقام فقط، بدون + أو مسافات ===== */
  const WHATSAPP_NUMBER = '962770157284';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll reveal */
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduced) items.forEach(e => e.classList.add('in'));
  else {
    const io = new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
    }), { threshold: 0.12 });
    items.forEach((e, i) => { e.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(e); });
  }

  /* Drawer */
  const drawer = $('#drawer'), toggle = $('#menu-toggle');
  function setDrawer(open) {
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('.drawer-panel a', drawer).focus();
  }
  toggle.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
  $$('[data-close]', drawer).forEach(el => el.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });
  matchMedia('(min-width: 761px)').addEventListener('change', e => e.matches && setDrawer(false));

  /* Smooth anchor scroll + active link */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'), t = id.length > 1 && $(id);
    if (!t) return;
    e.preventDefault();
    scrollTo({ top: id === '#home' ? 0 : t.offsetTop - 72, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  }));
  const links = $$('.nav a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* Contact -> WhatsApp */
  const form = $('#contact-form'), status = $('#form-status'), preview = $('#preview-text');
  function build() {
    const v = id => $(id).value.trim() || '—';
    return 'مرحباً Web Code، الاسم: ' + v('#full-name') + '، رقم الهاتف: ' + v('#phone') + '، التفاصيل: ' + v('#user-message') + '.';
  }
  function updatePreview() { preview.textContent = build(); }
  form.addEventListener('input', updatePreview); updatePreview();
  $$('[data-wa]').forEach(a => a.href = 'https://wa.me/' + WHATSAPP_NUMBER);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(build());
    status.textContent = 'جارٍ فتح واتساب...';
    if (!window.open(url, '_blank', 'noopener')) location.href = url;
  });

  /* Custom cursor */
  const cur = $('.cursor');
  if (cur && matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced) {
    let tx = 0, ty = 0, x = 0, y = 0;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); }, { passive: true });
    document.addEventListener('mouseover', e => cur.classList.toggle('big', !!e.target.closest('a,button,input,textarea,label')));
    document.addEventListener('mouseleave', () => cur.classList.remove('on'));
    (function f() { x += (tx - x) * .2; y += (ty - y) * .2; cur.style.transform = `translate(${x}px,${y}px)`; requestAnimationFrame(f); })();
  }

  /* Circuit canvas: drifting nodes + links, reacts to the pointer */
  const cv = $('#circuit'), ctx = cv.getContext('2d');
  const C = ['34,211,238', '168,85,247'];
  let W, H, nodes = [], mouse = { x: -999, y: -999 }, raf;
  function size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.round(Math.min(70, W * H / 22000));
    nodes = Array.from({ length: n }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, c: C[i % 2] }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of nodes) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120) { p.x += dx / d * .6; p.y += dy / d * .6; }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 150) { ctx.strokeStyle = `rgba(${a.c},${(1 - d / 150) * .22})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      const m = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (m < 190) { ctx.strokeStyle = `rgba(${a.c},${(1 - m / 190) * .5})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      ctx.fillStyle = `rgba(${a.c},.75)`; ctx.beginPath(); ctx.arc(a.x, a.y, 1.8, 0, 6.283); ctx.fill();
    }
    if (!reduced) raf = requestAnimationFrame(draw);
  }
  addEventListener('resize', () => { size(); if (reduced) draw(); });
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden && !reduced) draw(); });
  size(); draw();
})();
