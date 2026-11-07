/* A real space, not a picture of one.

   Everything here is true 3D line geometry — edges extracted from real meshes,
   not strokes drawn on a flat canvas. The camera travels through it as you
   scroll, the floor reflects what stands on it, and a chrome form turns at the
   centre of the room. That is the difference between resembling the reference
   and actually doing what it does. */
(function () {
  const host = document.getElementById('room');
  if (!host || !window.THREE) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = window.THREE;
  const SMALL = matchMedia('(max-width:860px)').matches;

  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0x08080A, 0.028);
  const camera = new T.PerspectiveCamera(52, 1, 0.1, 220);

  const renderer = new T.WebGLRenderer({ antialias: !SMALL, alpha: false });
  renderer.setClearColor(0x08080A, 1);
  host.appendChild(renderer.domElement);

  const LINE = (geo, o = 0.9) => new T.LineSegments(
    new T.EdgesGeometry(geo, 18),
    new T.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: o, fog: true })
  );

  const world = new T.Group();
  scene.add(world);

  /* ---- the room itself ------------------------------------------------ */
  const grid = new T.GridHelper(260, 104, 0xFFFFFF, 0xFFFFFF);
  grid.material.transparent = true; grid.material.opacity = 0.16; grid.material.fog = true;
  grid.position.y = -3.4;
  world.add(grid);

  /* ---- things that stand in it ---------------------------------------- */
  // a desk with monitors: the place the work actually happened
  function desk(z) {
    const g = new T.Group();
    const top = LINE(new T.BoxGeometry(7.2, 0.18, 3.0), .9); top.position.y = -1.1; g.add(top);
    [-3.2, 3.2].forEach(x => {
      const leg = LINE(new T.BoxGeometry(0.16, 2.2, 2.6), .6);
      leg.position.set(x, -2.2, 0); g.add(leg);
    });
    [[-2.1, .22], [0.9, -.1], [3.0, -.4]].forEach(([x, ry], i) => {
      const m = LINE(new T.BoxGeometry(2.5, 1.5, 0.1), .95);
      m.position.set(x, 0.1, -0.5); m.rotation.y = ry; g.add(m);
      const s = LINE(new T.BoxGeometry(0.5, 0.45, 0.5), .55);
      s.position.set(x, -0.8, -0.4); s.rotation.y = ry; g.add(s);
    });
    const kb = LINE(new T.BoxGeometry(2.0, 0.07, 0.7), .62); kb.position.set(0, -0.98, 0.9); g.add(kb);
    g.position.z = z;
    return g;
  }

  // panels of data standing in the air, at depth
  function panel(x, y, z, w, h, ry, o) {
    const g = new T.Group();
    g.add(LINE(new T.PlaneGeometry(w, h), o));
    // a chart drawn inside it, in real geometry
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const v = 0.3 + Math.sin(t * 6 + x) * 0.18 + t * 0.4;
      pts.push(new T.Vector3(-w / 2 + t * w * 0.9 + w * 0.05, -h / 2 + v * h * 0.8 + h * 0.06, 0.01));
    }
    const line = new T.Line(new T.BufferGeometry().setFromPoints(pts),
      new T.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: o * 1.5, fog: true }));
    g.add(line);
    g.add(LINE(new T.PlaneGeometry(w, h * 0.16), o * 0.6)).position.y = h * 0.42;
    g.position.set(x, y, z); g.rotation.y = ry;
    return g;
  }

  const built = new T.Group();
  const dk = desk(SMALL ? -22 : -15);
  dk.position.x = SMALL ? 0 : 3.1; dk.position.y = SMALL ? -1.6 : -0.7;
  built.add(dk);
  const PANELS = [[-9, 1.6, -26, 5, 3, .5, .85], [9.5, 0.4, -34, 5.6, 3.4, -.5, .80],
                  [-10, -0.6, -44, 5, 3, .45, .74], [9, 2.0, -54, 5.4, 3.2, -.45, .68],
                  [-8.5, 0.8, -64, 5, 3, .4, .60], [8.5, -0.8, -74, 5, 3, -.4, .52]];
  PANELS.forEach(p => built.add(panel(...p)));
  // a wireframe globe: four countries, one account set
  const globe = LINE(new T.SphereGeometry(2.4, 18, 12), .62);
  globe.position.set(0, 0.6, -84); built.add(globe);
  world.add(built);

  /* ---- the chrome form at the centre ---------------------------------- */
  const blob = new T.Mesh(
    new T.SphereGeometry(1.55, 128, 96),
    new T.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 1, roughness: 0.04,
      envMapIntensity: 2.1 })
  );
  blob.position.set(0, 0.2, -6.5);
  scene.add(blob);

  // A metal with nothing to reflect renders black. Build it something to
  // reflect: a studio in six faces — bright above, dark below, one soft
  // highlight on each side. Cheap, and the difference is the whole material.
  blob.material.envMap = (() => {
    const S = 128, faces = [];
    for (let i = 0; i < 6; i++) {
      const c = document.createElement('canvas'); c.width = c.height = S;
      const g = c.getContext('2d');
      if (i === 2) { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, S, S); }        // ceiling
      else if (i === 3) { g.fillStyle = '#050506'; g.fillRect(0, 0, S, S); }   // floor
      else {
        const lg = g.createLinearGradient(0, 0, 0, S);
        lg.addColorStop(0, '#FFFFFF'); lg.addColorStop(.26, '#F2F4F8');
        lg.addColorStop(.30, '#23262C'); lg.addColorStop(.62, '#101216');
        lg.addColorStop(.66, '#9BA2AE'); lg.addColorStop(.78, '#1A1D22');
        lg.addColorStop(1, '#050507');
        g.fillStyle = lg; g.fillRect(0, 0, S, S);
        const rg = g.createRadialGradient(S * .34, S * .16, 2, S * .34, S * .16, S * .38);
        rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = rg; g.fillRect(0, 0, S, S);
      }
      faces.push(c);
    }
    const tex = new T.CubeTexture(faces);
    tex.colorSpace = T.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  })();
  blob.material.roughness = 0.04;
  blob.material.needsUpdate = true;
  scene.add(new T.HemisphereLight(0xFFFFFF, 0x0A0A0C, 1.5));
  const key = new T.DirectionalLight(0xFFFFFF, 2.2); key.position.set(3, 5, 2); scene.add(key);
  const rim = new T.DirectionalLight(0x99A6FF, 1.1); rim.position.set(-4, -1, -3); scene.add(rim);
  const basePos = blob.geometry.attributes.position.clone();

  /* ---- the floor reflects what stands on it ---------------------------- */
  const mirror = built.clone(true);
  mirror.scale.y = -1;
  mirror.position.y = -6.8;
  mirror.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.opacity *= 0.3; } });
  world.add(mirror);

  /* ---- motion ---------------------------------------------------------- */
  const aim = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let flight = 0, t = 0;

  function size() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, SMALL ? 1.3 : 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 72 : 52;
    camera.updateProjectionMatrix();
  }
  size(); addEventListener('resize', size);

  if (!matchMedia('(hover: none)').matches)
    addEventListener('mousemove', e => {
      aim.x = (e.clientX / innerWidth - .5) * 2; aim.y = (e.clientY / innerHeight - .5) * 2;
    }, { passive: true });

  let vis = true;
  document.addEventListener('visibilitychange', () => { vis = !document.hidden; });

  function tick() {
    requestAnimationFrame(tick);
    if (!vis) return;
    t += 0.01;
    cur.x += (aim.x - cur.x) * 0.05; cur.y += (aim.y - cur.y) * 0.05;

    // the chrome form breathes rather than just spinning
    const p = blob.geometry.attributes.position, b = basePos;
    for (let i = 0; i < p.count; i++) {
      const x = b.getX(i), y = b.getY(i), z = b.getZ(i);
      const n = 1 + Math.sin(x * 2.4 + t * 1.1) * 0.038 + Math.sin(y * 1.9 - t * .9) * 0.034
                  + Math.sin(z * 2.7 + t * .7) * 0.03;
      p.setXYZ(i, x * n, y * n, z * n);
    }
    p.needsUpdate = true;
    blob.geometry.computeVertexNormals();
    blob.rotation.y = t * 0.22; blob.rotation.x = Math.sin(t * .4) * .15;

    camera.position.set(cur.x * 1.6, 0.3 - cur.y * 0.8, 6 - flight * 86);
    camera.lookAt(cur.x * 0.7, -0.1 - cur.y * 0.35, camera.position.z - 9);
    blob.position.z = camera.position.z - (SMALL ? 8.6 : 7.4);
    blob.position.x = (SMALL ? 0 : 2.9) + cur.x * 0.55;
    blob.position.y = (SMALL ? 2.5 : 1.35) - cur.y * 0.35;

    renderer.render(scene, camera);
  }
  if (RM) renderer.render(scene, camera); else tick();

  window.__room = (v) => { flight = Math.max(0, Math.min(1, v)); };
})();
