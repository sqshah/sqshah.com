/* The work, on a cylinder.

   Panels sit on the inside face of a drum: panel i is rotateY(i * STEP) then
   pushed out by the drum's radius, and turning the drum brings each one square
   to the camera in turn. The radius is derived from the panel width and the
   step so neighbours meet edge to edge instead of overlapping or gapping —
   R = (W/2) / tan(STEP/2). Guessing it is what makes these look wrong.

   It takes a drag, a trackpad swipe, the arrows, or the arrow keys, and it
   bends into being as you scroll onto it rather than cutting. */
(function () {
  const sec = document.getElementById('reel');
  if (!sec) return;
  const deck = sec.querySelector('.deck');
  const num = sec.querySelector('.rnum');
  const tot = sec.querySelector('.rtot');
  const ttl = sec.querySelector('.rttl');
  const met = sec.querySelector('.rmet');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STEP = 40;                                  // degrees between panels
  const RAD = STEP * Math.PI / 180;
  let W = 0, R = 0, cur = 0, items = [], panels = [];

  function geometry() {
    const vw = innerWidth;
    W = Math.min(vw * (vw < 860 ? 0.88 : 0.52), 760);
    R = (W / 2) / Math.tan(RAD / 2);
    sec.style.setProperty('--pw', W + 'px');
    sec.style.setProperty('--ph', Math.round(W * 0.63) + 'px');
    panels.forEach((p, i) => {
      p.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`;
    });
    place(false);
  }

  function place(animate) {
    const ry = -cur * STEP;
    deck.style.setProperty('--z', -R + 'px');
    if (animate && window.gsap && !RM) {
      gsap.to(deck, { '--ry': ry, duration: .9, ease: 'power3.out',
        onUpdate: paint, onComplete: paint });
    } else {
      deck.style.setProperty('--ry', String(ry));
      paint();
    }
  }

  function paint() {
    const ry = parseFloat(getComputedStyle(deck).getPropertyValue('--ry')) || 0;
    deck.style.transform = `translateZ(var(--z)) rotateY(${ry}deg)`;
    const at = -ry / STEP;
    panels.forEach((p, i) => {
      const d = Math.abs(i - at);
      p.style.opacity = d > 3.2 ? 0 : 1;
      p.style.visibility = d > 3.4 ? 'hidden' : 'visible';   // keep the drum cheap
      p.classList.toggle('live', d < 0.5);
    });
  }

  function show(i, animate) {
    cur = Math.max(0, Math.min(items.length - 1, i));
    place(animate);
    const c = items[cur];
    num.textContent = String(cur + 1).padStart(2, '0');
    const set = () => { ttl.innerHTML = c.short || c.ttl; met.textContent = c.met; };
    if (window.gsap && !RM) {
      gsap.to([ttl, met], { y: 12, opacity: 0, duration: .22, ease: 'power2.in',
        onComplete: () => { set(); gsap.fromTo([ttl, met], { y: -12, opacity: 0 },
          { y: 0, opacity: 1, duration: .45, ease: 'power3.out', stagger: .05 }); } });
    } else set();
  }

  fetch('assets/cases.json').then(r => r.json()).then(d => {
    items = d.cases;
    tot.textContent = String(items.length).padStart(2, '0');
    deck.innerHTML = items.map((c, i) => {
      const stat = (c.stats && c.stats[0]) || null;
      const face = c.img
        ? `<img src="${c.img}" alt="${c.alt || ''}" loading="lazy" decoding="async">`
        : `<div class="type"><span class="k">${c.idx}</span>
             <p>${c.ttl}</p>
             ${stat ? `<b>${stat[0]}</b><span class="u">${stat[1]}</span>` : ''}</div>`;
      return `<article class="pane" data-i="${i}">${face}
          <button class="view" data-i="${i}" aria-label="Open case ${c.idx}">View</button>
        </article>`;
    }).join('');
    panels = [...deck.querySelectorAll('.pane')];
    geometry();
    show(0, false);
    wire();
  });

  function wire() {
    addEventListener('resize', geometry);
    sec.querySelector('.prev').onclick = () => show(cur - 1, true);
    sec.querySelector('.next').onclick = () => show(cur + 1, true);

    sec.tabIndex = 0;
    sec.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, true); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, true); }
    });

    // a drag turns the drum directly, then releases to the nearest panel
    let down = false, x0 = 0, ry0 = 0, moved = 0;
    const ry = () => parseFloat(getComputedStyle(deck).getPropertyValue('--ry')) || 0;
    deck.addEventListener('pointerdown', e => {
      down = true; moved = 0; x0 = e.clientX; ry0 = ry();
      deck.setPointerCapture(e.pointerId); sec.classList.add('grab');
    });
    deck.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - x0;
      moved = Math.max(moved, Math.abs(dx));
      deck.style.setProperty('--ry', (ry0 + dx * 0.12) + '');
      paint();
    });
    const up = () => {
      if (!down) return;
      down = false; sec.classList.remove('grab');
      show(Math.round(-ry() / STEP), true);
    };
    deck.addEventListener('pointerup', up);
    deck.addEventListener('pointercancel', up);

    // a horizontal trackpad swipe turns it; a vertical one still scrolls away
    let lock = 0;
    sec.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.3) return;
      e.preventDefault();
      if (performance.now() < lock) return;
      lock = performance.now() + 360;
      show(cur + (e.deltaX > 0 ? 1 : -1), true);
    }, { passive: false });

    // View opens that case in the log below, where the detail already lives
    deck.addEventListener('click', e => {
      const b = e.target.closest('.view');
      if (!b || moved > 6) return;
      const open = document.querySelectorAll('#cases .case')[+b.dataset.i];
      if (!open) return;
      document.querySelectorAll('#cases .case[open]').forEach(o => { o.open = false; });
      open.open = true;
      window.ScrollTrigger && ScrollTrigger.refresh();
      (window.__lenis ? window.__lenis.scrollTo(open, { offset: -90, duration: 1 })
                      : open.scrollIntoView({ behavior: 'smooth' }));
    });

    // the drum bends into being instead of cutting: the viewport flattens out
    // of a very long perspective as the section arrives
    if (window.gsap && window.ScrollTrigger && !RM) {
      gsap.fromTo(sec, { '--persp': '4200px', '--bend': '7deg' },
        { '--persp': '1500px', '--bend': '0deg', ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top', scrub: .5 } });
    }
  }
})();
