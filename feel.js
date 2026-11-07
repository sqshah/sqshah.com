/* The layer that separates a site that works from a site that feels built:
   inertia scroll, a cursor that reacts to what it is over, links that lean
   toward the pointer, and a loader that counts the work in.

   Everything here degrades to nothing: no Lenis and the page scrolls natively,
   no pointer and the cursor never appears, reduced-motion and none of it runs. */
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. scrolling is the browser's job -------------------------
     There was inertia smoothing here. It is gone: the page should move the
     instant the wheel does, and any easing at all reads as lag. Anchor links
     still glide, because that is a jump the reader asked for. */
  if (!RM) {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const el = document.querySelector(a.getAttribute('href'));
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    const WIDEN = 'a,button,.rowhead,.mail,.plate,#room';
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest(WIDEN);
      if (!t) return;
      ring.classList.add('on');
      const say = t.dataset.cursor || (t.closest('.rowhead') ? 'Open' : '');
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

  /* ---------- 4. the case studies open in place ------------------------- */
  (function cases() {
    const rows = [...document.querySelectorAll('#work .row')];
    if (!rows.length) return;

    // measure the content rather than guess, so the transition lands exactly
    const setH = (row, open) => {
      const body = row.querySelector('.rowbody');
      const inner = row.querySelector('.rowinner');
      body.style.height = open ? inner.scrollHeight + 'px' : '0px';
    };

    rows.forEach(row => {
      const head = row.querySelector('.rowhead');
      const body = row.querySelector('.rowbody');

      head.addEventListener('click', () => {
        const open = !row.classList.contains('open');
        // one at a time; seven open panels is a wall of text
        rows.forEach(r => {
          if (r === row) return;
          if (!r.classList.contains('open')) return;
          r.querySelector('.rowbody').style.height = r.querySelector('.rowinner').scrollHeight + 'px';
          r.offsetHeight;                       // commit that height before collapsing from it
          r.classList.remove('open');
          r.querySelector('.rowhead').setAttribute('aria-expanded', 'false');
          setH(r, false);
        });
        row.classList.toggle('open', open);
        head.setAttribute('aria-expanded', String(open));
        setH(row, open);
        // the pinned sections below move, so the scroll maths has to be redone
        if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 700);
      });

      // let an open panel grow with the window instead of freezing at one height
      body.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'height' && row.classList.contains('open')) body.style.height = 'auto';
      });
    });

    addEventListener('resize', () => {
      rows.forEach(r => {
        if (r.classList.contains('open')) r.querySelector('.rowbody').style.height = 'auto';
      });
    });
  })();

  /* ---------- 5. the loader counts the work in -------------------------- */
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
