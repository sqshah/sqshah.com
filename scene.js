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

  // 01 — the ledger: an invoice, the coin it was paid with, the spend beside it
  function chLedger() {
    const g = new T.Group();
    const plinth = WIRE(new T.CylinderGeometry(3.6, 3.8, 0.28, 46), .3);
    plinth.position.y = -2.5; g.add(plinth);

    // stacks of coin: what was spent
    [[-0.6, 7], [0.55, 11], [1.7, 5]].forEach(([x, n]) => {
      for (let i = 0; i < n; i++) {
        const c = WIRE(new T.CylinderGeometry(0.46, 0.46, 0.11, 18), .45);
        c.position.set(x, -1.6 + i * 0.12, 0.4);
        g.add(c);
      }
    });

    // the invoice it is reconciled against, torn along the bottom
    const inv = new T.Group();
    inv.add(LINE(new T.PlaneGeometry(2.9, 3.9), .85));
    for (let i = 0; i < 9; i++) {
      const y = 1.5 - i * 0.33;
      inv.add(STROKE([[-1.15, y, .01], [0.35, y, .01]], .3));
      inv.add(STROKE([[0.7, y, .01], [1.15, y, .01]], .45));
    }
    inv.add(STROKE([[-1.15, -1.52, .01], [1.15, -1.52, .01]], .6));
    const tear = [];
    for (let i = 0; i <= 14; i++) tear.push([-1.45 + i * (2.9 / 14), -1.95 + (i % 2 ? .13 : -.13), .01]);
    inv.add(STROKE(tear, .7));
    inv.position.set(2.3, 0.6, -0.4); inv.rotation.y = -0.38;
    g.add(inv);

    // and the line the two of them have to agree on
    const curve = [];
    for (let i = 0; i <= 44; i++) {
      const t = i / 44;
      curve.push([-3.6 + t * 7.2, 1.5 + Math.sin(t * 4.6) * 0.55 + t * 1.0, 1.6]);
    }
    g.add(STROKE(curve, .8));
    return g;
  }

  // 02 — the method: leads in at the top, cost per sale out of the bottom
  function chFunnel() {
    const g = new T.Group();
    g.position.y = -0.7; g.scale.setScalar(0.88);
    const cone = WIRE(new T.CylinderGeometry(3.1, 0.55, 3.2, 26, 1, true), .5);
    cone.position.y = 0.5; g.add(cone);
    g.add(LINE(new T.TorusGeometry(3.1, 0.02, 3, 44), .85)).position.y = 2.1;
    const spout = WIRE(new T.CylinderGeometry(0.55, 0.55, 1.1, 16, 1, true), .45);
    spout.position.y = -1.6; g.add(spout);

    // leads falling through it
    for (let i = 0; i < 16; i++) {
      const c = LINE(new T.BoxGeometry(0.26, 0.26, 0.26), .8);
      const a = Math.random() * 6.283, r = Math.random() * 2.3;
      c.position.set(Math.cos(a) * r, 2.6 + Math.random() * 3.4, Math.sin(a) * r);
      c.userData.fall = 0.9 + Math.random() * 1.5;
      c.userData.spread = r;
      g.add(c);
    }
    // what comes out the bottom
    for (let i = 0; i < 4; i++) {
      const coin = WIRE(new T.CylinderGeometry(0.5, 0.5, 0.12, 18), .55);
      coin.position.set(0, -2.6 + i * 0.13, 0); g.add(coin);
    }
    return g;
  }

  // 03 — the work: four markets, and the places the advertising ran
  function chGlobe() {
    const g = new T.Group();
    const plinth = WIRE(new T.CylinderGeometry(3.1, 3.4, 0.32, 44), .28);
    plinth.position.y = -2.8; g.add(plinth);
    const globe = WIRE(new T.SphereGeometry(2.0, 20, 13), .42);
    globe.position.y = 0.1; globe.userData.spin = true; g.add(globe);
    const ring = WIRE(new T.TorusGeometry(2.7, 0.015, 3, 52), .22);
    ring.position.y = 0.1; ring.rotation.x = Math.PI / 2.3; g.add(ring);

    // billboards standing around it, each carrying a little advertisement
    [[-3.9, 1.5, .55], [3.8, 1.1, -.5], [-3.6, -1.3, .45], [3.6, -1.6, -.45]].forEach(([x, y, ry]) => {
      const bb = new T.Group();
      bb.add(LINE(new T.PlaneGeometry(2.2, 1.35), .85));
      bb.add(STROKE([[-0.75, 0.36, .01], [0.3, 0.36, .01]], .4));
      bb.add(STROKE([[-0.75, 0.10, .01], [0.6, 0.10, .01]], .3));
      bb.add(LINE(new T.PlaneGeometry(0.62, 0.26), .55)).position.set(-0.45, -0.32, .01);
      [-0.5, 0.5].forEach(lx => bb.add(STROKE([[lx, -0.68, 0], [lx, -1.5, 0]], .3)));
      bb.position.set(x, y, -0.5); bb.rotation.y = ry;
      g.add(bb);
      g.add(STROKE([[x, y, -0.5], [0, 0.1, 0]], .1));
    });
    return g;
  }

  // 04 — the person: the desk it all ran from, and the voice it went out through
  function chRoom() {
    const g = new T.Group();
    const W = 13, H = 7.4, D = 9;
    g.add(STROKE([[-W / 2, -H / 2, D / 2], [-W / 2, -H / 2, -D / 2], [W / 2, -H / 2, -D / 2], [W / 2, -H / 2, D / 2]], .32));
    g.add(STROKE([[-W / 2, H / 2, -D / 2], [-W / 2, -H / 2, -D / 2]], .22));
    g.add(STROKE([[W / 2, H / 2, -D / 2], [W / 2, -H / 2, -D / 2]], .22));
    g.add(STROKE([[-W / 2, H / 2, -D / 2], [W / 2, H / 2, -D / 2]], .22));

    const desk = LINE(new T.BoxGeometry(5.4, 0.14, 2.3), .85);
    desk.position.set(-1.2, -1.5, -2.2); g.add(desk);
    [-3.7, 1.3].forEach(x => {
      const l = LINE(new T.BoxGeometry(0.12, 2.2, 1.9), .4);
      l.position.set(x, -2.6, -2.2); g.add(l);
    });

    // the monitor, running a campaign
    const mon = LINE(new T.BoxGeometry(2.5, 1.5, 0.08), .9);
    mon.position.set(-1.9, -0.55, -2.9); g.add(mon);
    const line = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      line.push([-1.0 + t * 2.0, -0.42 + Math.sin(t * 5.2) * 0.26 + t * 0.52, 0.06]);
    }
    mon.add(STROKE(line, .55));
    mon.add(STROKE([[-1.05, 0.52, .06], [1.05, 0.52, .06]], .3));

    // the phone beside it, running the same thing small
    const ph = LINE(new T.BoxGeometry(0.56, 1.1, 0.05), .7);
    ph.position.set(0.8, -1.05, -1.6); ph.rotation.x = -0.32; g.add(ph);
    ph.add(LINE(new T.PlaneGeometry(0.42, 0.3), .4)).position.set(0, 0.22, .04);

    // and the megaphone: the part that is actually advertising
    const meg = new T.Group();
    meg.add(WIRE(new T.CylinderGeometry(1.15, 0.34, 1.5, 20, 1, true), .62));
    meg.add(LINE(new T.TorusGeometry(1.15, 0.02, 3, 30), .85)).position.y = 0.75;
    const grip = LINE(new T.BoxGeometry(0.17, 0.5, 0.17), .5);
    grip.position.set(0, -0.95, 0.42); meg.add(grip);
    meg.position.set(3.6, -0.5, -1.4);
    meg.rotation.set(0.1, 0, -0.95);
    g.add(meg);
    // what comes out of it
    [1.5, 2.0, 2.5].forEach((r, i) => {
      const arc = [];
      for (let k = 0; k <= 12; k++) {
        const a = -0.55 + (k / 12) * 1.1;
        arc.push([4.5 + Math.cos(a) * r * 0.55, 0.45 + Math.sin(a) * r, -1.4]);
      }
      g.add(STROKE(arc, .34 - i * 0.08));
    });

    const chair = LINE(new T.BoxGeometry(1.0, 0.12, 1.0), .4);
    chair.position.set(-1.3, -2.2, -0.4); g.add(chair);
    chair.add(LINE(new T.BoxGeometry(1.0, 1.2, 0.1), .4)).position.set(0, 0.6, -0.45);
    const lamp = WIRE(new T.SphereGeometry(0.5, 12, 8), .3);
    lamp.position.set(2.0, 2.0, -1.4); g.add(lamp);
    g.add(STROKE([[2.0, 3.7, -1.4], [2.0, 2.5, -1.4]], .18));
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
    .then(f => mount([chHero(f), chLedger(), chFunnel(), chGlobe(), chRoom()]))
    .catch(() => mount([chHero(null), chLedger(), chFunnel(), chGlobe(), chRoom()]));

  /* ------------------------------------------------------------------ motion */
  const aim = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let active = 0, within = 0, t = 0, prev = performance.now();

  /* The reference does not cut between chapters, it shatters the drawing into
     a cloud of loose strokes that scatter and die. One reused buffer: on a
     change the segments are re-seeded around the frame and given a velocity,
     then flown out and faded. Nothing is allocated per transition. */
  const BURST = 1100;
  const bPos = new Float32Array(BURST * 6);
  const bVel = new Float32Array(BURST * 3);
  const bGeo = new T.BufferGeometry();
  bGeo.setAttribute('position', new T.BufferAttribute(bPos, 3));
  const bMat = new T.LineBasicMaterial({ color: 0xFFFFFF, transparent: true,
    opacity: 0, depthWrite: false, fog: false });
  const burst = new T.LineSegments(bGeo, bMat);
  burst.frustumCulled = false;
  scene.add(burst);
  let bLife = 0, bAt = -1e9;

  function shatter() {
    if (RM) return;
    const now = performance.now();
    if (now - bAt < 650) return;      // one burst per handoff, never a stream
    bAt = now;
    for (let i = 0; i < BURST; i++) {
      const r = 2 + Math.random() * 6.5;
      const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(ph) * Math.cos(th);
      const y = r * Math.cos(ph) * 0.62;
      const z = r * Math.sin(ph) * Math.sin(th) * 0.8;
      const L = 0.12 + Math.random() * 0.5;
      const dx = (Math.random() - .5), dy = (Math.random() - .5), dz = (Math.random() - .5);
      const m = Math.hypot(dx, dy, dz) || 1;
      const o = i * 6;
      bPos[o] = x; bPos[o + 1] = y; bPos[o + 2] = z;
      bPos[o + 3] = x + dx / m * L; bPos[o + 4] = y + dy / m * L; bPos[o + 5] = z + dz / m * L;
      const v = i * 3, sp = 1.4 + Math.random() * 3.4;
      bVel[v] = x / r * sp; bVel[v + 1] = y / r * sp; bVel[v + 2] = z / r * sp;
    }
    bGeo.attributes.position.needsUpdate = true;
    bLife = 1;
  }

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
    const kMove = rate(0.055), kFade = rate(0.045);
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
        if (c.userData.fall) {
          c.position.y -= dt * c.userData.fall;
          c.rotation.x += dt * 1.1; c.rotation.z += dt * 0.7;
          if (c.position.y < -2.3) {           // back to the top of the funnel
            c.position.y = 3.4 + Math.random() * 2.2;
            const a = Math.random() * 6.283, r = Math.random() * 2.3;
            c.position.x = Math.cos(a) * r; c.position.z = Math.sin(a) * r;
          }
          c.userData.y0 = c.position.y;        // don't fight the reveal offset
        }
      });
      g.rotation.y = cur.x * 0.1;
      g.rotation.x = cur.y * 0.055;
      g.position.z = (1 - a) * -4;
    });

    // the mirrored monogram has to track the one it reflects
    groups[0]?.children.forEach(c => {
      if (c.userData.mirror) c.rotation.y = -c.userData.mirror.rotation.y;
    });

    if (bLife > 0) {
      bLife = Math.max(0, bLife - dt * 1.05);
      const step = dt * 1.6;
      for (let i = 0; i < BURST; i++) {
        const o = i * 6, v = i * 3;
        bPos[o] += bVel[v] * step;     bPos[o + 1] += bVel[v + 1] * step;     bPos[o + 2] += bVel[v + 2] * step;
        bPos[o + 3] += bVel[v] * step; bPos[o + 4] += bVel[v + 1] * step; bPos[o + 5] += bVel[v + 2] * step;
      }
      bGeo.attributes.position.needsUpdate = true;
      bMat.opacity = Math.sin(bLife * Math.PI) * 0.85;   // in fast, out slow
      burst.visible = true;
    } else if (burst.visible) { burst.visible = false; bMat.opacity = 0; }

    camera.position.x = cur.x * 0.85;
    camera.position.y = 0.4 - cur.y * 0.45;
    camera.lookAt(0, 0.1 - within * 0.1, 0);
    renderer.render(scene, camera);
  }
  if (RM) { const r = () => ready ? renderer.render(scene, camera) : requestAnimationFrame(r); r(); }
  else tick();

  window.__scene = (i, p) => {
    if (i !== active) shatter();
    active = i; within = p || 0;
  };
})();
