/* The scene layer.

   One renderer behind the whole document. Each chapter owns a diorama — a
   small built object that says what the chapter is about — and the chapters
   hand off to each other as you scroll. The opening is a chrome monogram
   standing on a mirror floor against a band of light at the horizon.

   Everything is real geometry: edges extracted from real meshes, letterforms
   extruded from real glyph outlines. Nothing here is a picture of a thing. */
(function () {
  const host = document.getElementById('stage');
  if (!host || !window.THREE) return;
  const T = window.THREE;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SMALL = matchMedia('(max-width:860px)').matches;

  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0x08080A, 0.018);
  const camera = new T.PerspectiveCamera(50, 1, 0.1, 400);
  camera.position.set(0, 0.4, 13);

  const renderer = new T.WebGLRenderer({ antialias: !SMALL, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x08080A, 1);
  host.appendChild(renderer.domElement);

  /* ---------------------------------------------------------------- tools */
  const MAT = (o) => new T.LineBasicMaterial({
    color: 0xFFFFFF, transparent: true, opacity: o, fog: true, depthWrite: false
  });
  const LINE = (geo, o = 0.9) => new T.LineSegments(new T.EdgesGeometry(geo, 18), MAT(o));
  const WIRE = (geo, o = 0.9) => new T.LineSegments(new T.WireframeGeometry(geo), MAT(o));
  const STROKE = (pts, o = 0.9) => new T.Line(
    new T.BufferGeometry().setFromPoints(pts.map(p => new T.Vector3(...p))), MAT(o));

  // A metal with nothing to reflect renders black, and a smooth gradient
  // reflects as grey plastic. Chrome needs hard bands of light and dark.
  const ENV = (() => {
    const S = 256, faces = [];
    for (let i = 0; i < 6; i++) {
      const c = document.createElement('canvas'); c.width = c.height = S;
      const g = c.getContext('2d');
      if (i === 2) { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, S, S); }
      else if (i === 3) { g.fillStyle = '#050506'; g.fillRect(0, 0, S, S); }
      else {
        const lg = g.createLinearGradient(0, 0, 0, S);
        lg.addColorStop(0, '#FFFFFF'); lg.addColorStop(.22, '#EEF1F6');
        lg.addColorStop(.26, '#20232A'); lg.addColorStop(.48, '#0E1014');
        lg.addColorStop(.52, '#FFFFFF'); lg.addColorStop(.58, '#AEB6C2');  // the horizon band
        lg.addColorStop(.63, '#15181D'); lg.addColorStop(1, '#040405');
        g.fillStyle = lg; g.fillRect(0, 0, S, S);
      }
      faces.push(c);
    }
    const tex = new T.CubeTexture(faces);
    tex.colorSpace = T.SRGBColorSpace; tex.needsUpdate = true;
    return tex;
  })();

  /* --------------------------------------------------- the horizon of light
     The signature of the reference: a hard, blown-out band at the horizon
     that the floor then reflects. Additive, so it reads as light rather than
     as a white shape sitting in the scene. */
  function horizon(y) {
    const c = document.createElement('canvas'); c.width = 16; c.height = 256;
    const g = c.getContext('2d');
    const lg = g.createLinearGradient(0, 0, 0, 256);
    lg.addColorStop(0, 'rgba(255,255,255,0)');
    lg.addColorStop(.42, 'rgba(188,202,228,.30)');
    lg.addColorStop(.492, 'rgba(255,255,255,1)');
    lg.addColorStop(.508, 'rgba(255,255,255,1)');
    lg.addColorStop(.58, 'rgba(188,202,228,.30)');
    lg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = lg; g.fillRect(0, 0, 16, 256);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    const m = new T.Mesh(
      new T.PlaneGeometry(190, 56),
      new T.MeshBasicMaterial({ map: tex, transparent: true, blending: T.AdditiveBlending,
        depthWrite: false, fog: false })
    );
    m.position.set(0, y, -42);
    return m;
  }

  /* ------------------------------------------------- the monogram, extruded
     Glyph outlines come from a real typeface, trimmed to the two letters the
     monogram needs. The typeface format stores a quadratic as end-point first
     and control-point second, which is the opposite of the canvas API. */
  function glyphShapes(font, text, size) {
    const k = size / font.resolution;
    const out = []; let cursor = 0;
    for (const ch of text) {
      const g = font.glyphs[ch];
      if (!g) continue;
      const path = new T.ShapePath();
      const o = g.o.split(' ');
      let i = 0;
      while (i < o.length) {
        const cmd = o[i++];
        if (cmd === 'm') path.moveTo(o[i++] * k + cursor, o[i++] * k);
        else if (cmd === 'l') path.lineTo(o[i++] * k + cursor, o[i++] * k);
        else if (cmd === 'q') {
          const x = o[i++] * k + cursor, y = o[i++] * k;
          path.quadraticCurveTo(o[i++] * k + cursor, o[i++] * k, x, y);
        } else if (cmd === 'b') {
          const x = o[i++] * k + cursor, y = o[i++] * k;
          const c1x = o[i++] * k + cursor, c1y = o[i++] * k;
          path.bezierCurveTo(c1x, c1y, o[i++] * k + cursor, o[i++] * k, x, y);
        }
      }
      out.push(...path.toShapes(true));
      cursor += g.ha * k;
    }
    return { shapes: out, width: cursor };
  }

  /* ----------------------------------------------------------- the chapters
     Each returns a Group. Children are revealed in order as the chapter
     arrives, which is what makes a line drawing look drawn rather than
     switched on. */

  function chHero(font) {
    const g = new T.Group();
    const mono = new T.Group();
    if (font) {
      const { shapes, width } = glyphShapes(font, 'SQ', 4.6);
      const geo = new T.ExtrudeGeometry(shapes, {
        depth: 1.15, bevelEnabled: true, bevelThickness: 0.1,
        bevelSize: 0.075, bevelSegments: 6, curveSegments: 24
      });
      geo.translate(-width / 2, -1.6, -0.575);
      const chrome = new T.Mesh(geo, new T.MeshStandardMaterial({
        color: 0xFFFFFF, metalness: 1, roughness: 0.045, envMap: ENV, envMapIntensity: 2.2,
        transparent: true, opacity: 1          // or .opacity below is a no-op
      }));
      mono.add(chrome);
    }
    // On a phone the frame is narrow and the opening paragraph is tall, so the
    // monogram centres and drops below the type instead of being cropped.
    const MS = SMALL ? 0.52 : 1, MY = SMALL ? -1.15 : 0.75, MX = SMALL ? 0 : 1.5;
    mono.position.set(MX, MY, 0);
    mono.scale.setScalar(MS);
    mono.userData.spin = true;
    g.add(mono);

    // A point at local height L renders at MY + MS*L, so a true mirror about
    // the plane F is RY = 2F - MY. The glyphs are translated so their baseline
    // sits at local -1.6, which puts the floor at F = MY - 1.6*MS and the
    // reflection at MY - 3.2*MS. Tuning these by eye at one scale is what put
    // the phone's smaller monogram inside the light band instead of above it.
    const FLOOR = MY - 1.6 * MS;
    g.add(horizon(FLOOR - 0.22));

    const refl = mono.clone(true);
    refl.scale.set(MS, -MS, MS);
    refl.position.y = MY - 3.2 * MS;
    refl.traverse(o => {
      if (o.isMesh) { o.material = o.material.clone(); o.material.opacity = 0.26;
        o.material.transparent = true; o.material.roughness = 0.3; }
    });
    refl.userData.mirror = mono;
    g.add(refl);

    const grid = new T.GridHelper(300, 90, 0xFFFFFF, 0xFFFFFF);
    grid.material.transparent = true; grid.material.opacity = 0.07;
    grid.material.fog = true; grid.position.y = FLOOR;
    g.add(grid);
    return g;
  }

  // 01 — the ledger: stacked measures and a reconciled line
  function chLedger() {
    const g = new T.Group();
    const plinth = LINE(new T.CylinderGeometry(3.5, 3.5, 0.3, 40), .5);
    plinth.position.y = -2.3; g.add(plinth);
    [[-1.9, 1.7], [0, 3.0], [1.9, 2.25]].forEach(([x, h]) => {
      const bar = LINE(new T.BoxGeometry(1.15, h, 1.15), .9);
      bar.position.set(x, -2.15 + h / 2, 0); g.add(bar);
      const cap = LINE(new T.BoxGeometry(1.3, 0.07, 1.3), .5);
      cap.position.set(x, -2.15 + h, 0); g.add(cap);
    });
    const sheet = LINE(new T.PlaneGeometry(3.4, 2.1), .7);
    sheet.position.set(2.0, 1.3, -1.2); sheet.rotation.y = -0.4; g.add(sheet);
    const rows = [];
    for (let i = 0; i < 6; i++) rows.push([[-1.4, 0.72 - i * 0.26, 0.01], [1.1, 0.72 - i * 0.26, 0.01]]);
    rows.forEach(r => { const l = STROKE(r, .3); sheet.add(l); });
    const curve = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      curve.push([-3.2 + t * 6.4, 0.6 + Math.sin(t * 5) * 0.5 + t * 1.1, 1.4]);
    }
    g.add(STROKE(curve, .85));
    return g;
  }

  // 02 — the method: the desk the work was done at
  function chDesk() {
    const g = new T.Group();
    const top = LINE(new T.BoxGeometry(7.4, 0.18, 3.0), .9); top.position.y = -1.1; g.add(top);
    [-3.3, 3.3].forEach(x => {
      const l = LINE(new T.BoxGeometry(0.16, 2.4, 2.6), .55);
      l.position.set(x, -2.3, 0); g.add(l);
    });
    [[-2.2, .24], [0.85, -.08], [3.0, -.42]].forEach(([x, ry]) => {
      const m = LINE(new T.BoxGeometry(2.5, 1.5, 0.1), .95);
      m.position.set(x, 0.15, -0.5); m.rotation.y = ry; g.add(m);
      const chart = [];
      for (let i = 0; i <= 22; i++) {
        const t = i / 22;
        chart.push([-1.0 + t * 2.0, -0.45 + Math.sin(t * 5 + x) * 0.3 + t * 0.5, 0.07]);
      }
      m.add(STROKE(chart, .5));
      const s = LINE(new T.BoxGeometry(0.5, 0.45, 0.5), .5);
      s.position.set(x, -0.72, -0.4); s.rotation.y = ry; g.add(s);
    });
    const kb = LINE(new T.BoxGeometry(2.1, 0.07, 0.72), .6); kb.position.set(0, -0.98, 0.95); g.add(kb);
    const mug = WIRE(new T.CylinderGeometry(0.22, 0.18, 0.4, 12), .3);
    mug.position.set(2.3, -0.82, 1.0); g.add(mug);
    return g;
  }

  // 03 — the work: four countries, one account set
  function chGlobe() {
    const g = new T.Group();
    const plinth = LINE(new T.CylinderGeometry(3.1, 3.4, 0.35, 44), .45);
    plinth.position.y = -2.6; g.add(plinth);
    const globe = WIRE(new T.SphereGeometry(2.1, 20, 13), .5);
    globe.position.y = 0.1; globe.userData.spin = true; g.add(globe);
    const ring = WIRE(new T.TorusGeometry(2.8, 0.015, 3, 52), .3);
    ring.position.y = 0.1; ring.rotation.x = Math.PI / 2.3; g.add(ring);
    [[-3.3, 2.1, .6], [3.2, 1.7, -.55], [-3.0, -0.5, .5], [3.4, -0.9, -.5]].forEach(([x, y, ry]) => {
      const p = LINE(new T.PlaneGeometry(1.9, 1.2), .7);
      p.position.set(x, y, -0.6); p.rotation.y = ry; g.add(p);
      g.add(STROKE([[x, y, -0.6], [0, 0.1, 0]], .14));
    });
    return g;
  }

  // 04 — the person: one room, one person, start to finish
  function chRoom() {
    const g = new T.Group();
    const W = 13, H = 7.4, D = 9;
    g.add(STROKE([[-W / 2, -H / 2, D / 2], [-W / 2, -H / 2, -D / 2], [W / 2, -H / 2, -D / 2], [W / 2, -H / 2, D / 2]], .4));
    g.add(STROKE([[-W / 2, H / 2, -D / 2], [-W / 2, -H / 2, -D / 2]], .3));
    g.add(STROKE([[W / 2, H / 2, -D / 2], [W / 2, -H / 2, -D / 2]], .3));
    g.add(STROKE([[-W / 2, H / 2, -D / 2], [W / 2, H / 2, -D / 2]], .3));
    const desk = LINE(new T.BoxGeometry(5.0, 0.14, 2.2), .85);
    desk.position.set(-1.4, -1.5, -2.2); g.add(desk);
    [-3.6, 0.8].forEach(x => {
      const l = LINE(new T.BoxGeometry(0.12, 2.2, 1.9), .45);
      l.position.set(x, -2.6, -2.2); g.add(l);
    });
    const mon = LINE(new T.BoxGeometry(2.2, 1.35, 0.1), .9);
    mon.position.set(-1.6, -0.6, -2.9); g.add(mon);
    const chair = LINE(new T.BoxGeometry(1.0, 0.12, 1.0), .5);
    chair.position.set(-1.3, -2.2, -0.4); g.add(chair);
    chair.add(LINE(new T.BoxGeometry(1.0, 1.2, 0.1), .5)).position.set(0, 0.6, -0.45);
    const shelf = LINE(new T.BoxGeometry(3.0, 0.08, 0.7), .5);
    [1.4, 2.3].forEach((y, i) => { const s = shelf.clone(); s.position.set(3.6, y, -3.9); g.add(s); });
    const lamp = WIRE(new T.SphereGeometry(0.55, 12, 8), .4);
    lamp.position.set(2.0, 2.0, -1.4); g.add(lamp);
    g.add(STROKE([[2.0, 3.7, -1.4], [2.0, 2.5, -1.4]], .25));
    const plant = new T.Group();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      plant.add(STROKE([[0, 0, 0], [Math.cos(a) * .45, .7 + Math.random() * .4, Math.sin(a) * .45]], .45));
    }
    plant.position.set(4.3, -2.2, -1.0); g.add(plant);
    plant.add(LINE(new T.CylinderGeometry(0.3, 0.22, 0.5, 10), .5)).position.y = -0.25;
    return g;
  }

  /* ------------------------------------------------------------- assembling */
  const groups = [];
  const stack = new T.Group();
  scene.add(stack);

  function mount(list) {
    list.forEach((g, i) => {
      if (SMALL && i > 0) { g.scale.setScalar(0.56); g.position.y = 2.4; }
      g.visible = i === 0;
      g.userData.t = i === 0 ? 1 : 0;
      g.traverse(o => { if (o.material) { o.userData.base = o.material.opacity; } });
      stack.add(g);
      groups.push(g);
    });
    ready = true;
  }

  scene.add(new T.HemisphereLight(0xFFFFFF, 0x0A0A0C, 1.4));
  const key = new T.DirectionalLight(0xFFFFFF, 2.4); key.position.set(3, 5, 4); scene.add(key);
  const rim = new T.DirectionalLight(0x9FB0FF, 1.2); rim.position.set(-4, -1, -3); scene.add(rim);

  let ready = false;
  fetch('assets/sq-glyphs.json')
    .then(r => r.json())
    .then(f => mount([chHero(f), chLedger(), chDesk(), chGlobe(), chRoom()]))
    .catch(() => mount([chHero(null), chLedger(), chDesk(), chGlobe(), chRoom()]));

  /* ------------------------------------------------------------------ motion */
  const aim = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let active = 0, within = 0, t = 0, prev = performance.now();

  function size() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, SMALL ? 1.4 : 1.8));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 68 : 50;
    camera.updateProjectionMatrix();
  }
  size(); addEventListener('resize', size);

  if (!matchMedia('(hover: none)').matches)
    addEventListener('mousemove', (e) => {
      aim.x = (e.clientX / innerWidth - .5) * 2;
      aim.y = (e.clientY / innerHeight - .5) * 2;
    }, { passive: true });

  let vis = true;
  document.addEventListener('visibilitychange', () => { vis = !document.hidden; });

  function tick() {
    requestAnimationFrame(tick);
    const now = performance.now();
    const dt = Math.min(0.1, (now - prev) / 1000); prev = now;
    if (!vis || !ready) return;
    t += dt * 0.6;
    const rate = (per) => 1 - Math.pow(1 - per, dt * 60);   // per-frame -> per-second
    const kMove = rate(0.055), kFade = rate(0.09);
    cur.x += (aim.x - cur.x) * kMove;
    cur.y += (aim.y - cur.y) * kMove;

    groups.forEach((g, i) => {
      const want = i === active ? 1 : 0;
      g.userData.t += (want - g.userData.t) * kFade;
      const a = g.userData.t;
      g.visible = a > 0.004;
      if (!g.visible) return;
      // reveal in order, so a line drawing looks drawn rather than switched on
      let n = 0, total = g.children.length;
      g.children.forEach((c, ci) => {
        const lead = ci / Math.max(1, total);
        const k = Math.max(0, Math.min(1, (a - lead * 0.45) / 0.55));
        c.traverse(o => {
          if (o.material && o.userData.base !== undefined)
            o.material.opacity = o.userData.base * k;
        });
        c.position.y = (c.userData.y0 ??= c.position.y) + (1 - k) * 0.35;
        if (c.userData.spin) c.rotation.y = t * 0.2 + cur.x * 0.22;
      });
      g.rotation.y = cur.x * 0.1;
      g.rotation.x = cur.y * 0.055;
      g.position.z = (1 - a) * -4;
    });

    // the mirrored monogram has to track the one it reflects
    groups[0]?.children.forEach(c => {
      if (c.userData.mirror) c.rotation.y = -c.userData.mirror.rotation.y;
    });

    camera.position.x = cur.x * 0.85;
    camera.position.y = 0.4 - cur.y * 0.45;
    camera.lookAt(0, 0.1 - within * 0.1, 0);
    renderer.render(scene, camera);
  }
  if (RM) { const r = () => ready ? renderer.render(scene, camera) : requestAnimationFrame(r); r(); }
  else tick();

  window.__scene = (i, p) => { active = i; within = p || 0; };
})();
