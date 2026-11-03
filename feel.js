/* The layer that separates a site that works from a site that feels built:
   inertia scroll, a cursor that reacts to what it is over, links that lean
   toward the pointer, and a loader that counts the work in.

   Everything here degrades to nothing: no Lenis and the page scrolls natively,
   no pointer and the cursor never appears, reduced-motion and none of it runs. */
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. inertia scroll ---------------------------------------- */
  if (!RM && window.Lenis) {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // expo out
      smoothWheel: true,
      touchMultiplier: 1.6
    });
    window.__lenis = lenis;

    // ScrollTrigger has to be told where we are, and gsap drives the frame
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    // the nav anchors should fly, not jump
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const el = document.querySelector(a.getAttribute('href'));
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { duration: 1.4 });
      });
    });
  }

  /* ---------- 2. the cursor -------------------------------------------- */
  if (FINE && !RM) {
    const dot = document.createElement('div'); dot.className = 'cur-dot';
    const ring = document.createElement('div'); ring.className = 'cur-ring';
    const label = document.createElement('span'); label.className = 'cur-label';
    ring.appendChild(label);
    document.body.append(dot, ring);

    let mx = innerWidth / 2, my = innerHeight / 2;
    let dx = mx, dy = my, rx = mx, ry = my;
    addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    (function loop() {
      requestAnimationFrame(loop);
      dx += (mx - dx) * 0.9;  dy += (my - dy) * 0.9;     // the dot is immediate
      rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;    // the ring lags behind
      dot.style.transform  = `translate3d(${dx}px,${dy}px,0) translate(-50%,-50%)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
    })();

    // what the cursor is over decides what it becomes
    const WIDEN = 'a,button,.row,.mail,.plate,#room';
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest(WIDEN);
      if (!t) return;
      ring.classList.add('on');
      const say = t.dataset.cursor || (t.closest('.row') ? 'Read' : '');
      label.textContent = say;
      ring.classList.toggle('says', !!say);
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(WIDEN) && !e.relatedTarget?.closest(WIDEN)) {
        ring.classList.remove('on', 'says');
        label.textContent = '';
      }
    });
    addEventListener('mousedown', () => ring.classList.add('down'));
    addEventListener('mouseup', () => ring.classList.remove('down'));
  }

  /* ---------- 3. magnetic links ---------------------------------------- */
  if (FINE && !RM && window.gsap) {
    document.querySelectorAll('.nav a, .mail, .ends a').forEach(el => {
      const to = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' });
      const toY = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        to((e.clientX - (r.left + r.width / 2)) * 0.34);
        toY((e.clientY - (r.top + r.height / 2)) * 0.5);
      });
      el.addEventListener('mouseleave', () => { to(0); toY(0); });
    });
  }

  /* ---------- 4. the loader counts the work in -------------------------- */
  const num = document.querySelector('.curtain .count');
  if (num) {
    let shown = 0, done = false;
    const tick = () => {
      if (done) return;
      // creeps toward 90 while assets load, so the number means something
      const target = Math.min(90, (performance.now() / 28));
      shown += (target - shown) * 0.08;
      num.textContent = String(Math.floor(shown)).padStart(2, '0');
      requestAnimationFrame(tick);
    };
    tick();
    window.__loaded = () => {
      done = true;
      const o = { v: shown };
      if (window.gsap) gsap.to(o, { v: 100, duration: .5, ease: 'power2.out',
        onUpdate: () => { num.textContent = String(Math.floor(o.v)).padStart(2, '0'); } });
      else num.textContent = '100';
    };
  }
})();
