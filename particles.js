/* Three beats, scrubbed by one pinned scroll.
     1. a line of type holds       — $0.29 PER LEAD
     2. it blows apart and re-forms as a portrait
     3. the camera pulls back and the portrait becomes the whole figure
   Particles are sampled from the portrait framing only, so nothing is ever upscaled;
   once they land, the drawing itself takes over and the crop widens. */
(function () {
  const BIG = '$0.29';          // the number the section is about
  const SMALL = 'PER LEAD';

  // crops into the source drawing, measured off the artwork
  const NEAR = { x: 310, y: 0, w: 480, h: 640 };        // head and shoulders
  const FAR  = { x: 13,  y: 9, w: 1031, h: 1375 };      // the whole figure
  const AR = 3 / 4;                                     // both crops, and the plate

  // where each beat sits on the scrub: hold the type, fly, let the portrait stand,
  // pull back, then hold the full figure before the page is released
  const HOLD = 0.16, LAND = 0.48, PULL = 0.56, WIDE = 0.78, SETTLE = 0.84;

  const boot = () => {
    const plate = document.querySelector('.plate');
    if (!plate) return;
    const cv = plate.querySelector('canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d', { alpha: true });
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const img = new Image();
    img.onload = () => {
      const fonts = (document.fonts && document.fonts.ready) || Promise.resolve();
      fonts.then(build).catch(build);
    };
    img.src = plate.dataset.src;

    function build() {
      const DPR = window.devicePixelRatio > 1 ? 2 : 1;
      const CW = Math.round(Math.min(plate.clientWidth || 440, 620) * DPR);
      if (!CW) return;
      const CH = Math.round(CW / AR);
      cv.width = CW; cv.height = CH;
      cv.style.width = cv.style.height = '100%';

      // ---- the portrait framing, read once --------------------------------
      const off = document.createElement('canvas');
      off.width = CW; off.height = CH;
      const octx = off.getContext('2d', { willReadFrequently: true });
      octx.drawImage(img, NEAR.x, NEAR.y, NEAR.w, NEAR.h, 0, 0, CW, CH);
      const px = octx.getImageData(0, 0, CW, CH).data;

      // ---- the shape it starts as: the headline, set solid -----------------
      const shp = document.createElement('canvas');
      shp.width = CW; shp.height = CH;
      const s = shp.getContext('2d', { willReadFrequently: true });
      (function type() {
        const stack = '"Archivo","Helvetica Neue",Arial,sans-serif';
        s.fillStyle = '#000';
        s.textAlign = 'center';
        s.textBaseline = 'alphabetic';
        let size = CW * 0.34;                      // shrink the big line until it fits
        const room = CW * 0.84;
        s.font = `700 ${size}px ${stack}`;
        while (s.measureText(BIG).width > room && size > 10) {
          size *= 0.95;
          s.font = `700 ${size}px ${stack}`;
        }
        const base = CH * 0.46;
        s.fillText(BIG, CW / 2, base);
        const sub = Math.max(10, CW * 0.070);      // the label, tracked out beneath it
        try { s.letterSpacing = `${sub * 0.3}px`; } catch (e) { /* older engines */ }
        s.font = `500 ${sub}px ${stack}`;
        s.fillText(SMALL, CW / 2, base + sub * 2.0);
        try { s.letterSpacing = '0px'; } catch (e) { /* no-op */ }
      })();
      const sd = s.getImageData(0, 0, CW, CH).data;
      const SEED = [];
      for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++)
        if (sd[(y * CW + x) * 4 + 3] > 40) SEED.push(x, y);
      const SN = SEED.length / 2;
      if (!SN) return;

      // ---- particles -------------------------------------------------------
      const STEP = Math.max(2, Math.round(CW / 300));
      const P = [];
      for (let y = 0; y < CH; y += STEP) for (let x = 0; x < CW; x += STEP) {
        const i = (y * CW + x) * 4, a = px[i + 3];
        if (a < 26) continue;
        const ink = a / 255;
        P.push({ tx: x, ty: y, sx: 0, sy: 0, ink, r: STEP * (0.46 + ink * 0.30), k: 0 });
      }
      P.sort((a, b) => (a.tx * 0.62 + a.ty * 0.38) - (b.tx * 0.62 + b.ty * 0.38));
      const N = P.length;
      if (!N) return;
      const SPAN = 0.24;
      for (let i = 0; i < N; i++) {
        const j = ((i * 7919) % SN) * 2;
        P[i].sx = SEED[j] + (Math.random() - .5) * 3;
        P[i].sy = SEED[j + 1] + (Math.random() - .5) * 3;
        P[i].k = HOLD + (i / N) * (LAND - HOLD - SPAN) + Math.random() * 0.02;
      }

      const ease = (u) => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      const easeIO = (u) => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
      let last = -1;

      // beat 3: the crop widens from the portrait to the whole figure
      function frame(q) {
        const e = easeIO(q);
        return {
          x: NEAR.x + (FAR.x - NEAR.x) * e,
          y: NEAR.y + (FAR.y - NEAR.y) * e,
          w: NEAR.w + (FAR.w - NEAR.w) * e,
          h: NEAR.h + (FAR.h - NEAR.h) * e
        };
      }

      function render(p) {
        if (Math.abs(p - last) < 0.0012 && p !== 0 && p !== 1) return;
        last = p;
        ctx.clearRect(0, 0, CW, CH);

        if (p >= LAND) {                                 // the drawing itself takes over
          const f = frame(clamp01((p - PULL) / (WIDE - PULL)));
          ctx.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, CW, CH);
          plate.classList.add('settled');
          return;
        }
        plate.classList.remove('settled');
        for (let i = 0; i < N; i++) {
          const q = P[i];
          const u = ease(clamp01((p - q.k) / SPAN));
          const x = q.sx + (q.tx - q.sx) * u;
          const y = q.sy + (q.ty - q.sy) * u;
          const mid = 1 - Math.abs(u - .5) * 2;          // fattest and faintest mid-flight
          ctx.globalAlpha = q.ink * (1 - mid * 0.42);
          ctx.fillStyle = '#121211';
          ctx.beginPath();
          ctx.arc(x, y, q.r * (1 + mid * 1.5), 0, 6.283);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // The figure fills the section while it resolves, and only steps aside at the
      // end — the copy arrives on the scroll after you have seen the whole of it.
      const beats = Array.prototype.slice.call(document.querySelectorAll('.beat'));
      const sec = plate.closest('section');
      let FILL = 1, DX = 0;
      function measure() {
        plate.style.transform = '';
        const pr = plate.getBoundingClientRect(), sr = sec.getBoundingClientRect();
        if (!pr.height || !sr.height) return;
        FILL = Math.min(2.6, (sr.height * 0.86) / pr.height);
        DX = (sr.left + sr.width / 2) - (pr.left + pr.width / 2);
      }
      measure();
      addEventListener('resize', () => { measure(); });

      function copy(p) {
        const step = clamp01((p - SETTLE) / (1 - SETTLE));      // 0 = filling, 1 = in place
        const e = easeIO(step);
        const sc = FILL + (1 - FILL) * e;
        plate.style.transform = `translateX(${DX * (1 - e)}px) scale(${sc})`;
        plate.style.transformOrigin = '50% 50%';
        const o = clamp01((p - (SETTLE + 0.06)) / 0.08);
        beats.forEach(el => {
          el.style.opacity = o;
          el.style.transform = `translateY(${(1 - o) * 16}px)`;
          el.style.pointerEvents = o > .5 ? 'auto' : 'none';
        });
      }

      const draw = (p) => { render(p); copy(p); };

      if (RM || !window.gsap || !window.ScrollTrigger) { draw(1); return; }
      draw(0);
      gsap.registerPlugin(ScrollTrigger);

      // The section is held still on every screen and the beats play out in front of
      // the reader. A phone gets a longer hold, because a thumb covers more scroll
      // per flick than a wheel does.
      const phone = matchMedia('(max-width:860px)').matches;
      ScrollTrigger.create({
        trigger: plate.closest('section'),
        start: 'top top',
        end: () => '+=' + Math.round(innerHeight * (phone ? 3.6 : 3.1)),
        pin: true,
        anticipatePin: 1,
        scrub: phone ? 0.35 : 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => draw(self.progress),
        onRefresh: (self) => { measure(); draw(self.progress); },
        onLeaveBack: () => draw(0),       // scrolled back above it — the type returns
        onLeave: () => draw(1),           // scrolled past — the full figure stays
        onEnterBack: (self) => draw(self.progress)
      });
    }
  };

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
