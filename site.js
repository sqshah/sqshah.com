/* Everything that is not the field: smooth scroll, the figures counting up as
   you reach them, the signature, and the case list.

   Figures are rendered from data-count rather than tweened from the DOM text,
   so the markup reads correctly with JavaScript off and nothing reflows while a
   number runs - tabular figures plus a reserved width means the column never
   twitches. */
(function () {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- scroll --
  if (window.Lenis && !RM) {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;
    const tick = (t) => { lenis.raf(t); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.__lenis ? window.__lenis.scrollTo(t, { offset: -56 })
                     : t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    });
  });

  // --------------------------------------------------------------- figures --
  const money = (n) => '$' + n.toLocaleString('en-US',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const compact = (n) => n >= 1e6 ? (n / 1e6).toFixed(n / 1e6 >= 10 ? 1 : 2) + 'M'
                                  : Math.round(n).toLocaleString('en-US');
  const plain = (n) => Math.round(n).toLocaleString('en-US');

  const format = (el, n) => el.hasAttribute('data-money') ? money(n)
                          : el.hasAttribute('data-compact') ? compact(n)
                          : plain(n);

  // Fast out of the gate, soft on landing: the last tenth of the run is where
  // the eye actually reads the number, so give it the time.
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

  // The descent's figures each run once on arrival. The ledger is different:
  // its rows resolve in sequence and the total lands last, so the arithmetic
  // visibly completes rather than four numbers appearing at once.
  async function resolveLedger(section) {
    const figs = [...section.querySelectorAll('[data-count]')];
    const ticks = [...section.querySelectorAll('.tick')];
    ticks.forEach(t => { t.style.opacity = 0; t.style.transition = 'opacity .3s ease'; });
    for (let i = 0; i < figs.length; i++) {
      const last = figs[i].hasAttribute('data-last');
      if (last) await wait(260);
      const p = run(figs[i], last ? 900 : 620);
      if (ticks[i]) { await wait(260); ticks[i].style.opacity = 1; }
      await p;
      if (!last) await wait(90);
    }
  }

  const ledger = document.getElementById('ledger');

  if (RM) {
    document.querySelectorAll('.tick').forEach(t => { t.style.opacity = 1; });
  } else {
    const seen = new WeakSet();
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting || seen.has(e.target)) continue;
        seen.add(e.target);
        io.unobserve(e.target);
        e.target === ledger ? resolveLedger(ledger) : run(e.target, 1100);
      }
    }, { threshold: .55, rootMargin: '0px 0px -8% 0px' });

    if (ledger) io.observe(ledger);
    document.querySelectorAll('.stage [data-count]').forEach(el => io.observe(el));
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
  // Not links: no case pages exist yet, and a View that opens nothing is worse
  // than no View at all.
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
          <div class="met">${(c.met || '').replace(/\s*&middot;\s*/g, ', ')}</div>
        </div>
        <p>${trim(c.body, 230)}</p>
      </article>`).join('');
  }).catch(() => {});
})();
