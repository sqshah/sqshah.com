/* The brief, built.

   One motion idea: things resolve. Nothing bounces, nothing parallaxes, nothing
   floats in for decoration. Entrances are 460ms on the same curve, opacity plus
   a small rise, never scale and move together.

   Four pieces:
     1. the curtain - the signature writes itself, once, capped at 1.2s
     2. the four word screens, scrubbed by their own scroll position
     3. figures that count when they arrive, once
     4. the work index, where a row opens into the case in place
*/
(function () {
  'use strict';

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ------------------------------------------------------------- curtain --
     The signature is an outline, not a single stroke, so a dash animation
     would look wrong on it. A left-to-right clip reads as writing and is
     honest about what the artwork is. */
  const curtain = $('#curtain');

  function raise() {
    if (!curtain || curtain.dataset.done) return;
    curtain.dataset.done = '1';
    curtain.classList.add('up');
    document.body.classList.remove('held');
    setTimeout(() => curtain.remove(), 900);
  }

  function openCurtain() {
    if (!curtain) { document.body.classList.remove('held'); return; }
    if (RM) { raise(); return; }
    document.body.classList.add('held');
    requestAnimationFrame(() => curtain.classList.add('write'));
    const t = setTimeout(raise, 1200);                 // hard cap
    const skip = () => { clearTimeout(t); raise(); };
    addEventListener('wheel', skip, { once: true, passive: true });
    addEventListener('touchstart', skip, { once: true, passive: true });
    addEventListener('keydown', skip, { once: true });
  }

  /* ------------------------------------------------------------ the mark -- */
  fetch('assets/signature.json').then(r => r.json()).then(sig => {
    const svg = `<svg viewBox="0 0 ${sig.w} ${sig.h}" role="img" aria-label="SQ Shah">
        <g transform="${sig.transform}">${sig.outline.map(d => `<path d="${d}"/>`).join('')}</g>
      </svg>`;
    $$('.sig').forEach(el => { el.innerHTML = svg; });
    openCurtain();
  }).catch(openCurtain);

  /* -------------------------------------------------------- word screens --
     Each word owns a screen. Its weight and position come from how far that
     screen has travelled, so the type is doing the scrolling rather than
     reacting to it. */
  const words = $$('.word');

  function paintWords() {
    const h = innerHeight;
    for (const el of words) {
      const r = el.getBoundingClientRect();
      // -1 below the fold, 0 centred, 1 above
      // A wide falloff: at half a screen away a word is still clearly there, so
      // the gap between two of them never reads as an empty page.
      const p = Math.max(-1, Math.min(1, (h / 2 - (r.top + r.height / 2)) / (h * 1.15)));
      const near = 1 - Math.abs(p);
      el.style.setProperty('--near', near.toFixed(3));
      el.style.setProperty('--shift', (p * -7).toFixed(2) + 'vh');
    }
  }

  /* ------------------------------------------------------------- figures -- */
  const nf = (n, el) => el.dataset.money
    ? '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : el.dataset.compact && n >= 1e6
      ? (n / 1e6).toFixed(n / 1e6 >= 10 ? 1 : 2) + 'M'
      : Math.round(n).toLocaleString('en-US');

  function count(el) {
    const end = parseFloat(el.dataset.n);
    const final = el.textContent;
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    const t0 = performance.now(), ms = 1150;
    (function step(t) {
      const u = Math.min(1, (t - t0) / ms);
      el.textContent = u < 1 ? nf(end * (1 - Math.pow(1 - u, 4)), el) : final;
      if (u < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* -------------------------------------------------------------- arrive -- */
  const seen = new WeakSet();
  const io = new IntersectionObserver(es => {
    for (const e of es) {
      if (!e.isIntersecting || seen.has(e.target)) continue;
      seen.add(e.target);
      io.unobserve(e.target);
      e.target.classList.add('in');
      if (e.target.dataset.n && !RM) count(e.target);
    }
  }, { threshold: 0.3, rootMargin: '0px 0px -6% 0px' });

  /* ---------------------------------------------------------------- work --
     A row opens into the case where it sits. Not a modal, not an accordion:
     the row you touched becomes the thing you are reading, and closing puts
     it back. */
  let open = null;

  function openCase(row) {
    if (open) closeCase();
    const panel = $('#' + row.dataset.panel);
    if (!panel) return;
    open = { row, panel };
    row.classList.add('open');
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('shown'));
    panel.setAttribute('tabindex', '-1');
    panel.focus({ preventScroll: true });
  }

  function closeCase() {
    if (!open) return;
    const { row, panel } = open;
    open = null;
    panel.classList.remove('shown');
    row.classList.remove('open');
    setTimeout(() => { panel.hidden = true; }, 420);
    row.focus({ preventScroll: true });
  }

  function wireWork() {
    $$('.case-row').forEach(row => {
      row.addEventListener('click', e => {
        e.preventDefault();
        row.classList.contains('open') ? closeCase() : openCase(row);
      });
    });
    $$('.panel .shut').forEach(b => b.addEventListener('click', closeCase));
    addEventListener('keydown', e => { if (e.key === 'Escape') closeCase(); });
  }

  /* ----------------------------------------------------------------- go --- */
  function boot() {
    $$('[data-arrive]').forEach(el => io.observe(el));
    $$('[data-n]').forEach(el => io.observe(el));
    wireWork();
    if (!RM && words.length) {
      paintWords();
      addEventListener('scroll', paintWords, { passive: true });
      addEventListener('resize', paintWords, { passive: true });
    } else {
      words.forEach(el => el.style.setProperty('--near', '1'));
    }
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    }));
  }

  document.readyState === 'loading'
    ? addEventListener('DOMContentLoaded', boot, { once: true })
    : boot();
})();
