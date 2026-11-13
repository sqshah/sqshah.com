/* The page has one piece of motion it performs by itself: the statement adding
   up. Everything else waits to be asked.

   Figures are rendered from data-count rather than tweened from the DOM text, so
   the markup still reads correctly with JavaScript off and nothing reflows while
   the numbers run - tabular-nums plus a reserved width means the column never
   twitches. */
(function () {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- scroll --
  if (window.Lenis && !RM) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    window.__lenis = lenis;
    const tick = (t) => { lenis.raf(t); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      ScrollTrigger.refresh();
    }
  }

  const bar = document.getElementById('bar');
  if (bar) {
    const onScroll = () => bar.classList.toggle('stuck', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  // in-page links still need to go through Lenis, or they fight it
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.__lenis ? window.__lenis.scrollTo(t, { offset: -64 })
                     : t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    });
  });

  // --------------------------------------------------------------- figures --
  const money = (n) => '$' + n.toLocaleString('en-US',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const compact = (n) => n >= 1e6 ? (n / 1e6).toFixed(n / 1e6 >= 10 ? 1 : 2) + 'M'
                                  : Math.round(n).toLocaleString('en-US');
  const plain = (n) => Math.round(n).toLocaleString('en-US');

  function format(el, n) {
    if (el.hasAttribute('data-money')) return money(n);
    if (el.hasAttribute('data-compact')) return compact(n);
    return plain(n);
  }

  // Easing out of a count that starts fast and lands softly; the last tenth of
  // the run is where the eye actually reads the number, so give it room.
  const ease = (u) => 1 - Math.pow(1 - u, 4);

  function run(el, ms) {
    const end = parseFloat(el.dataset.count);
    const final = el.textContent;
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    el.style.display = 'inline-block';
    const t0 = performance.now();
    return new Promise(done => {
      (function step(t) {
        const u = Math.min(1, (t - t0) / ms);
        el.textContent = u < 1 ? format(el, end * ease(u)) : final;
        u < 1 ? requestAnimationFrame(step) : done();
      })(t0);
    });
  }

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  async function resolve(section) {
    const figs = [...section.querySelectorAll('[data-count]')];
    const ticks = [...section.querySelectorAll('.tick')];
    ticks.forEach(t => { t.style.opacity = 0; t.style.transition = 'opacity .3s ease'; });
    for (let i = 0; i < figs.length; i++) {
      const last = figs[i].hasAttribute('data-last');
      if (last) await wait(260);                       // let the eye catch up
      const p = run(figs[i], last ? 900 : 620);
      if (ticks[i]) { await wait(260); ticks[i].style.opacity = 1; }
      await p;
      if (!last) await wait(90);
    }
  }

  const ledger = document.getElementById('ledger');
  if (ledger) {
    if (RM) {
      ledger.querySelectorAll('.tick').forEach(t => { t.style.opacity = 1; });
    } else {
      new IntersectionObserver((es, obs) => {
        es.forEach(e => {
          if (!e.isIntersecting) return;
          obs.disconnect();
          resolve(ledger);
        });
      }, { threshold: .3 }).observe(ledger);
    }
  }

  // ------------------------------------------------------------- signature --
  fetch('assets/signature.json').then(r => r.json()).then(sig => {
    const box = document.getElementById('sig');
    if (!box) return;
    box.innerHTML =
      `<svg viewBox="0 0 ${sig.w} ${sig.h}" role="img" aria-label="Syed Qasim Ali">
         <g transform="${sig.transform}">
           ${sig.outline.map(d => `<path d="${d}"></path>`).join('')}
         </g>
       </svg>`;
  }).catch(() => {});

  // ------------------------------------------------------------------ work --
  // No case pages exist yet, so these are not links. A "View" that opens nothing
  // is worse than no View at all.
  fetch('assets/cases.json').then(r => r.json()).then(d => {
    const box = document.getElementById('cases');
    if (!box) return;
    const trim = (s, n) => {
      if (!s) return '';
      const txt = s.replace(/<[^>]+>/g, '');
      if (txt.length <= n) return txt;
      const cut = txt.slice(0, n);
      return cut.slice(0, cut.lastIndexOf(' ')) + '…';
    };
    box.innerHTML = d.cases.map(c => `
      <article class="case">
        <div>
          <div class="ttl">${c.short || c.ttl}</div>
          <div class="met">${(c.met || "").replace(/\s*&middot;\s*/g, ", ")}</div>
        </div>
        <p>${trim(c.body, 230)}</p>
      </article>`).join('');
  }).catch(() => {});
})();
