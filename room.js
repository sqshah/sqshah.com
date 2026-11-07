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

  const LINE = (geo, o = 0.5) => new T.LineSegments(
    new T.EdgesGeometry(geo, 18),
    new T.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: o, fog: true })
  );

  const world = new T.Group();
  scene.add(world);

  /* ---- the room itself ------------------------------------------------ */
  const grid = new T.GridHelper(260, 104, 0xFFFFFF, 0xFFFFFF);
  grid.material.transparent = true; grid.material.opacity = 0.055; grid.material.fog = true;
  grid.position.y = -3.4;
  world.add(grid);

  /* ---- things that stand in it ---------------------------------------- */
  // a desk with monitors: the place the work actually happened
  function desk(z) {
    const g = new T.Group();
    const top = LINE(new T.BoxGeometry(7.2, 0.18, 3.0), .5); top.position.y = -1.1; g.add(top);
    [-3.2, 3.2].forEach(x => {
      const leg = LINE(new T.BoxGeometry(0.16, 2.2, 2.6), .32);
      leg.position.set(x, -2.2, 0); g.add(leg);
    });
    [[-2.1, .22], [0.9, -.1], [3.0, -.4]].forEach(([x, ry], i) => {
      const m = LINE(new T.BoxGeometry(2.5, 1.5, 0.1), .62);
      m.position.set(x, 0.1, -0.5); m.rotation.y = ry; g.add(m);
      const s = LINE(new T.BoxGeometry(0.5, 0.45, 0.5), .3);
      s.position.set(x, -0.8, -0.4); s.rotation.y = ry; g.add(s);
    });
    const kb = LINE(new T.BoxGeometry(2.0, 0.07, 0.7), .34); kb.position.set(0, -0.98, 0.9); g.add(kb);
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
  built.add(desk(-14));
  const PANELS = [[-9, 1.6, -26, 5, 3, .5, .40], [9.5, 0.4, -34, 5.6, 3.4, -.5, .36],
                  [-10, -0.6, -44, 5, 3, .45, .30], [9, 2.0, -54, 5.4, 3.2, -.45, .26],
                  [-8.5, 0.8, -64, 5, 3, .4, .20], [8.5, -0.8, -74, 5, 3, -.4, .16]];
  PANELS.forEach(p => built.add(panel(...p)));
  // a wireframe globe: four countries, one account set
  const globe = LINE(new T.SphereGeometry(2.4, 18, 12), .22);
  globe.position.set(0, 0.6, -84); built.add(globe);
  world.add(built);

  /* ---- the chrome form at the centre ---------------------------------- */
  const blob = new T.Mesh(
    new T.IcosahedronGeometry(1.25, 3),
    new T.MeshStandardMaterial({ color: 0xBFC3C9, metalness: 1, roughness: 0.12,
      envMapIntensity: 1.4 })
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
      else if (i === 3) { g.fillStyle = '#0A0A0C'; g.fillRect(0, 0, S, S); }   // floor
      else {
        const lg = g.createLinearGradient(0, 0, 0, S);
        lg.addColorStop(0, '#E9ECF2'); lg.addColorStop(.45, '#4A4E57'); lg.addColorStop(1, '#0C0D10');
        g.fillStyle = lg; g.fillRect(0, 0, S, S);
        const rg = g.createRadialGradient(S * .5, S * .3, 2, S * .5, S * .3, S * .45);
        rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = rg; g.fillRect(0, 0, S, S);
      }
      faces.push(c);
    }
    const tex = new T.CubeTexture(faces);
    tex.colorSpace = T.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  })();
  blob.material.roughness = 0.08;
  blob.material.needsUpdate = true;
  scene.add(new T.HemisphereLight(0xFFFFFF, 0x0A0A0C, 1.5));
  const key = new T.DirectionalLight(0xFFFFFF, 2.2); key.position.set(3, 5, 2); scene.add(key);
  const rim = new T.DirectionalLight(0x99A6FF, 1.1); rim.position.set(-4, -1, -3); scene.add(rim);
  const basePos = blob.geometry.attributes.position.clone();

  /* ---- the floor reflects what stands on it ---------------------------- */
  const mirror = built.clone(true);
  mirror.scale.y = -1;
  mirror.position.y = -6.8;
  mirror.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.opacity *= 0.22; } });
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
      const n = 1 + Math.sin(x * 2.1 + t * 1.3) * 0.055 + Math.sin(y * 1.7 - t) * 0.05
                  + Math.sin(z * 2.4 + t * .8) * 0.045;
      p.setXYZ(i, x * n, y * n, z * n);
    }
    p.needsUpdate = true;
    blob.geometry.computeVertexNormals();
    blob.rotation.y = t * 0.22; blob.rotation.x = Math.sin(t * .4) * .15;

    camera.position.set(cur.x * 1.6, 0.3 - cur.y * 0.8, 6 - flight * 86);
    camera.lookAt(cur.x * 0.7, -0.1 - cur.y * 0.35, camera.position.z - 9);
    blob.position.z = camera.position.z - 6.5;
    blob.position.x = cur.x * 0.8;

    renderer.render(scene, camera);
  }
  if (RM) renderer.render(scene, camera); else tick();

  window.__room = (v) => { flight = Math.max(0, Math.min(1, v)); };
})();
