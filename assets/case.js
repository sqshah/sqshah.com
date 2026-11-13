(function(){
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  function fmt(v, el){
    if (el.dataset.compact && v >= 1e6) return (v/1e6).toFixed(1) + 'M';
    return (el.dataset.pre||'') + Math.round(v).toLocaleString('en-US');
  }
  function count(el, ms){
    const end = parseFloat(el.dataset.n), final = el.textContent, t0 = performance.now();
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    el.style.display = 'inline-block';
    (function step(t){
      const u = Math.min(1,(t-t0)/ms);
      el.textContent = u<1 ? fmt(end*(1-Math.pow(1-u,4)), el) : final;
      if (u<1) requestAnimationFrame(step);
    })(t0);
  }

  const seen = new WeakSet();
  const io = new IntersectionObserver(es=>{
    for (const e of es){
      if (!e.isIntersecting || seen.has(e.target)) continue;
      seen.add(e.target); io.unobserve(e.target);
      e.target.classList.add('in');
      const n = e.target.matches('[data-n]') ? e.target : e.target.querySelector('[data-n]');
      if (n && !RM && !seen.has(n)){ seen.add(n); count(n, 1250); }
    }
  },{threshold:.3});
  $$('[data-rise], .gal figure, [data-ch], .graph, [data-panel], [data-res]').forEach(el=>io.observe(el));

  /* The rail marks the chapter nearest the middle of the screen. One authority,
     so two sections can never both claim it. */
  const rail = $$('.rail a');
  const marks = rail.map(a=>({a, el:document.getElementById(a.dataset.r)})).filter(m=>m.el);
  function pick(){
    const mid = innerHeight/2;
    let best=null, bd=Infinity;
    for (const m of marks){
      const r = m.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      const d = Math.abs((r.top + r.bottom)/2 - mid);
      if (d < bd){ bd = d; best = m; }
    }
    rail.forEach(a=>a.classList.remove('on'));
    if (best) best.a.classList.add('on');
  }
  addEventListener('scroll', pick, {passive:true}); pick();

  const cmp = $('#cmp');
  if (cmp){
    const set = (clientX)=>{
      const r = cmp.getBoundingClientRect();
      cmp.style.setProperty('--x',
        Math.max(0, Math.min(100, ((clientX - r.left)/r.width)*100)).toFixed(2) + '%');
    };
    let down = false;
    cmp.addEventListener('pointerdown', e=>{ down=true; cmp.setPointerCapture(e.pointerId); set(e.clientX); });
    cmp.addEventListener('pointermove', e=>{ if(down) set(e.clientX); });
    ['pointerup','pointercancel'].forEach(t=>cmp.addEventListener(t, ()=>{ down=false; }));
    cmp.addEventListener('keydown', e=>{
      const cur = parseFloat(getComputedStyle(cmp).getPropertyValue('--x')) || 55;
      if (e.key==='ArrowLeft'){ e.preventDefault(); cmp.style.setProperty('--x', Math.max(0,cur-4)+'%'); }
      if (e.key==='ArrowRight'){ e.preventDefault(); cmp.style.setProperty('--x', Math.min(100,cur+4)+'%'); }
    });
    cmp.tabIndex = 0;
  }
})();
