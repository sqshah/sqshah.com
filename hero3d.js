/* The hero: a dark room full of televisions, each one carrying a case study.

   The camera drifts after the cursor while you read, and the scroll flies it through
   the sets, past them, into the dark — where the signature writes itself. The writing
   is scrubbed by the same scroll, so going back up un-writes it; nothing latches on.

   Every figure on a screen is one SQ has verified. Screens with no verified figure
   carry none. Nothing here is invented. */
(function () {
  const host = document.getElementById('room');
  if (!host) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ok = (() => {
    if (!window.THREE || RM) return false;
    try { const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
  })();
  if (!ok) { host.remove(); document.documentElement.classList.add('no3d'); return; }

  const T = window.THREE;
  const INK = 0x060606;
  const SMALL = matchMedia('(max-width:860px)').matches;

  // the case studies, read out of the written index so the two can never disagree
  const WORK = Array.prototype.slice.call(document.querySelectorAll('#work .row')).map(a => ({
    idx:   a.querySelector('.idx').textContent.trim(),
    title: a.querySelector('.ttl').textContent.trim(),
    met:   a.querySelector('.met').textContent.trim()
  }));

  // ---- one television ----------------------------------------------------
  function tvTexture(item, seed) {
    const W = 640, H = 460;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    const rnd = (() => { let s = seed * 7919 + 13; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
    const SX = 44, SY = 38, SW = W - 88, SH = H - 128;   // the screen inside the set
    let t = rnd() * 400;

    function round(x, y, w, h, r) {
      g.beginPath();
      g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r);
      g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r);
      g.arcTo(x, y, x + w, y, r); g.closePath();
    }

    function draw() {
      t += 1;
      // the cabinet
      g.fillStyle = '#201F1D'; round(6, 6, W - 12, H - 12, 26); g.fill();
      g.strokeStyle = 'rgba(251,250,248,.18)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#0D0D0C'; round(SX - 8, SY - 8, SW + 16, SH + 16, 20); g.fill();

      g.save();
      round(SX, SY, SW, SH, 16); g.clip();
      g.fillStyle = '#0A0B0C'; g.fillRect(SX, SY, SW, SH);

      if (item) {
        // a faint glow from the tube itself
        const gr = g.createRadialGradient(SX + SW / 2, SY + SH / 2, 10, SX + SW / 2, SY + SH / 2, SW * .72);
        gr.addColorStop(0, 'rgba(186,208,228,.30)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(SX, SY, SW, SH);

        g.fillStyle = 'rgba(251,250,248,.5)';
        g.font = '400 19px Archivo, Arial, sans-serif';
        g.fillText(item.idx, SX + 34, SY + 58);
        g.fillRect(SX + 34, SY + 74, 46, 1);

        // the title, with a little tube fringe on it
        const lines = [];
        g.font = '700 34px Archivo, "Helvetica Neue", Arial, sans-serif';
        let ln = '';
        item.title.toUpperCase().split(' ').forEach(w => {
          const test = ln ? ln + ' ' + w : w;
          if (g.measureText(test).width > SW - 68 && ln) { lines.push(ln); ln = w; } else ln = test;
        });
        if (ln) lines.push(ln);
        lines.slice(0, 4).forEach((L, i) => {
          const y = SY + 126 + i * 40;
          g.fillStyle = 'rgba(120,190,255,.30)'; g.fillText(L, SX + 32.4, y);
          g.fillStyle = 'rgba(255,110,120,.26)'; g.fillText(L, SX + 35.6, y);
          g.fillStyle = '#FFFFFF'; g.fillText(L, SX + 34, y);
        });
        if (item.met) {
          g.fillStyle = 'rgba(251,250,248,.55)';
          g.font = '400 16px Archivo, Arial, sans-serif';
          g.fillText(item.met.toUpperCase(), SX + 34, SY + SH - 40);
        }
      } else {
        // an idle set: colour bars, or snow
        if (seed % 2) {
          const bars = ['#C8C8C8', '#C8C800', '#00C8C8', '#00C800', '#C800C8', '#C80000', '#0000C8'];
          bars.forEach((b, i) => { g.fillStyle = b;
            g.fillRect(SX + i * (SW / 7), SY, SW / 7 + 1, SH * .72); });
          g.fillStyle = '#111'; g.fillRect(SX, SY + SH * .72, SW, SH * .28);
        } else {
          const im = g.getImageData(SX, SY, SW, SH), d = im.data;
          for (let i = 0; i < d.length; i += 4) {
            const v = (Math.random() * 255) | 0;
            d[i] = d[i + 1] = d[i + 2] = v * 0.75; d[i + 3] = 255;
          }
          g.putImageData(im, SX, SY);
        }
      }

      // scanlines, a rolling bar, and the curve of the glass
      g.fillStyle = 'rgba(0,0,0,.20)';
      for (let y = SY; y < SY + SH; y += 3) g.fillRect(SX, y, SW, 1.3);
      g.fillStyle = 'rgba(251,250,248,.055)';
      g.fillRect(SX, SY + ((t * 2.4) % SH), SW, 26);
      const vg = g.createRadialGradient(SX + SW / 2, SY + SH / 2, SH * .34, SX + SW / 2, SY + SH / 2, SW * .78);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.42)');
      g.fillStyle = vg; g.fillRect(SX, SY, SW, SH);
      g.restore();

      tex.needsUpdate = true;
    }
    draw();
    return { tex, draw };
  }

  // a soft radial sprite that sits behind each set, so the glass throws light
  const glowTex = (() => {
    const s = 128, c = document.createElement('canvas'); c.width = c.height = s;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, 'rgba(198,216,234,.80)');
    gr.addColorStop(.45, 'rgba(160,182,204,.26)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  })();

  // ---- the room ----------------------------------------------------------
  const scene = new T.Scene();
  scene.fog = new T.FogExp2(INK, 0.030);
  const camera = new T.PerspectiveCamera(50, 1, 0.1, 160);

  const renderer = new T.WebGLRenderer({ antialias: !SMALL, alpha: false });
  renderer.setClearColor(INK, 1);
  host.appendChild(renderer.domElement);

  // sets scattered through the volume, clear of the line the camera takes
  const LAYOUT = [
    [-4.6,  1.5, -6,  0.42, 1.00], [ 4.9, -0.4, -9,  -0.46, 1.15],
    [-5.6, -1.9, -13, 0.38, 0.92], [ 4.2,  2.1, -17, -0.40, 0.86],
    [-3.9,  0.2, -21, 0.34, 1.08], [ 5.4, -2.0, -25, -0.44, 0.96],
    [-5.1,  2.2, -29, 0.40, 0.90], [ 3.8, -1.2, -33, -0.36, 1.04],
    [-4.4, -0.8, -37, 0.36, 0.88], [ 5.0,  1.6, -41, -0.42, 0.98],
    [-5.3,  0.9, -45, 0.38, 0.94], [ 4.1, -2.1, -49, -0.38, 1.02],
    [-4.0,  1.9, -53, 0.34, 0.90]
  ];
  const sets = [], screens = [];
  LAYOUT.forEach((L, i) => {
    const [x, y, z, ry, sc] = L;
    const item = i < WORK.length ? WORK[i] : null;     // the rest are idle sets
    const p = tvTexture(item, i + 2);
    screens.push(p);
    const w = 3.5 * sc, h = w * (460 / 640);
    const m = new T.Mesh(new T.PlaneGeometry(w, h),
      new T.MeshBasicMaterial({ map: p.tex, fog: true, transparent: true }));
    m.position.set(x, y, z); m.rotation.y = ry; m.rotation.z = (i % 3 - 1) * 0.02;
    scene.add(m);

    const glow = new T.Sprite(new T.SpriteMaterial({
      map: glowTex, transparent: true, opacity: item ? 1.0 : .72,
      blending: T.AdditiveBlending, depthWrite: false, fog: true
    }));
    glow.position.set(x, y, z + 0.1); glow.scale.set(w * 2.9, h * 3.3, 1);
    scene.add(glow);
    sets.push({ m, glow, z });
  });

  // dust in the air, so the dark is not empty
  const dust = (() => {
    const n = SMALL ? 260 : 520, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - .5) * 26;
      pos[i * 3 + 1] = (Math.random() - .5) * 13;
      pos[i * 3 + 2] = -Math.random() * 62 + 4;
    }
    const gg = new T.BufferGeometry();
    gg.setAttribute('position', new T.BufferAttribute(pos, 3));
    const pts = new T.Points(gg, new T.PointsMaterial({
      color: 0xBFC6CC, size: 0.035, transparent: true, opacity: .5, fog: true
    }));
    scene.add(pts); return pts;
  })();

  // ---- motion ------------------------------------------------------------
  const aim = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let flight = 0, spin = 0;

  function size() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, SMALL ? 1.4 : 1.8));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 70 : 50;
    camera.updateProjectionMatrix();
  }
  size();
  addEventListener('resize', size);

  if (!matchMedia('(hover: none)').matches) {
    addEventListener('mousemove', (e) => {
      aim.x = (e.clientX / innerWidth - .5) * 2;
      aim.y = (e.clientY / innerHeight - .5) * 2;
    }, { passive: true });
  }

  let frame = 0, vis = true;
  document.addEventListener('visibilitychange', () => { vis = !document.hidden; });

  function tick() {
    requestAnimationFrame(tick);
    if (!vis) return;
    frame++;
    const every = SMALL ? 7 : 4;
    for (let i = frame % every; i < screens.length; i += every) screens[i].draw();

    spin += 0.0035;
    cur.x += (aim.x - cur.x) * 0.045;
    cur.y += (aim.y - cur.y) * 0.045;

    const f = flight;
    camera.position.set(
      cur.x * 1.5 + Math.sin(spin) * 0.16,
      0.1 - cur.y * 0.7 + Math.cos(spin * .8) * 0.09,
      5.5 - f * 62
    );
    camera.lookAt(cur.x * 0.6, -0.05 - cur.y * 0.3, camera.position.z - 7);

    dust.position.z = camera.position.z + 30;
    // once the sets are behind, the dark is all that is left
    const out = Math.max(0, Math.min(1, (f - 0.80) / 0.14));
    sets.forEach(s => {
      s.m.material.opacity = 1 - out;
      s.glow.material.opacity = (s.glow.userData.b || (s.glow.userData.b = s.glow.material.opacity)) * (1 - out);
    });
    dust.material.opacity = .5 * (1 - out * .7);
    renderer.render(scene, camera);
  }
  tick();

  window.__flight = (p) => { flight = Math.max(0, Math.min(1, p)); };
})();
