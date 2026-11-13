/* One field of points, falling through its own funnel.

   47.9 million impressions became 1.17 million clicks became 145,902 leads
   became people. That is the job, so that is the page: a single particle system
   behind the document that re-forms as you scroll, and every shape it takes is
   a real figure out of the account rather than a decoration.

     impressions   a vast drifting volume
     clicks        the volume collapses into a funnel and starts to turn
     leads         the funnel lands as a dense field of discrete points
     people        the points resolve into the drawing
     work          it breaks apart again and settles

   Two things that went wrong the last time this was built, and are handled
   here. Lerping a fixed fraction per frame runs twice as fast at 120Hz as at
   60, so the rate is converted against real elapsed time. And per-section
   ScrollTriggers overlap, so two can be active at once and the scene
   ping-pongs between them every frame; instead one authority picks the single
   section nearest the middle of the viewport. */
(function () {
  'use strict';

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const host = document.getElementById('field');
  if (!host || !window.THREE || RM) { document.body.classList.add('nofield'); return; }

  const T = THREE;
  const small = innerWidth < 860;
  // Point count is the one dial that decides whether this runs on a mid-range
  // Android. Everything else is cheap.
  const N = small ? 26000 : 78000;

  // ------------------------------------------------------------------ stage --
  const STAGES = ['impressions', 'clicks', 'leads', 'people', 'sold', 'rest'];
  const SPREAD = small ? 34 : 52;          // half-width of the working volume

  const rnd = (a, b) => a + Math.random() * (b - a);

  function volume(out) {                    // impressions: a deep, even haze
    for (let i = 0; i < N; i++) {
      const r = SPREAD * Math.cbrt(Math.random()) * 1.15;
      const th = Math.random() * 6.2832, ph = Math.acos(rnd(-1, 1));
      out[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      out[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.62;
      out[i * 3 + 2] = r * Math.cos(ph) * 0.9 - 6;
    }
  }

  function funnel(out) {                    // clicks: everything narrows
    for (let i = 0; i < N; i++) {
      const u = i / N;                      // 0 at the mouth, 1 at the throat
      const y = SPREAD * 0.78 - u * SPREAD * 1.5;
      const r = (1 - u) * (1 - u) * SPREAD * 0.92 + 0.6;
      const a = u * 26 + Math.random() * 0.5;
      out[i * 3]     = Math.cos(a) * r + rnd(-0.6, 0.6);
      out[i * 3 + 1] = y * 0.62 + rnd(-0.4, 0.4);
      out[i * 3 + 2] = Math.sin(a) * r * 0.7 + rnd(-0.6, 0.6);
    }
  }

  function field(out) {                     // leads: countable, laid out flat
    const cols = Math.ceil(Math.sqrt(N * 1.9)), rows = Math.ceil(N / cols);
    for (let i = 0; i < N; i++) {
      const c = i % cols, r = (i / cols) | 0;
      out[i * 3]     = (c / (cols - 1) - .5) * SPREAD * 2.05 + rnd(-.18, .18);
      out[i * 3 + 1] = (r / (rows - 1) - .5) * SPREAD * 1.12 + rnd(-.18, .18);
      out[i * 3 + 2] = rnd(-1.6, 1.6);
    }
  }

  // sold: the millions end up as a few hundred things you can count. Every
  // particle joins one of 360 clumps, so what you see is roughly a month of
  // cars rather than a haze.
  function sold(out) {
    const K = 360, cols = 24, rows = K / cols;
    const cx = new Float32Array(K * 3);
    for (let k = 0; k < K; k++) {
      const c = k % cols, r = (k / cols) | 0;
      cx[k * 3]     = (c / (cols - 1) - .5) * SPREAD * 1.42;
      cx[k * 3 + 1] = (r / (rows - 1) - .5) * SPREAD * 0.96;
      cx[k * 3 + 2] = rnd(-2, 2);
    }
    for (let i = 0; i < N; i++) {
      const k = (i % K) * 3;
      out[i * 3]     = cx[k]     + rnd(-.16, .16);
      out[i * 3 + 1] = cx[k + 1] + rnd(-.16, .16);
      out[i * 3 + 2] = cx[k + 2] + rnd(-.16, .16);
    }
  }

  function scatter(out) {                   // rest: it lets go, but stays near
    for (let i = 0; i < N; i++) {
      out[i * 3]     = rnd(-1, 1) * SPREAD * 1.5;
      out[i * 3 + 1] = rnd(-1, 1) * SPREAD * 0.95;
      out[i * 3 + 2] = rnd(-1, 1) * SPREAD * 0.7 - 10;
    }
  }

  // The drawing, sampled by its own ink: wherever the artwork is dark, a point.
  function figureFrom(img, out) {
    const H = 420, W = Math.round(H * img.width / img.height);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0, W, H);
    const px = cx.getImageData(0, 0, W, H).data;

    const ink = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (px[i + 3] > 40 && (px[i] + px[i + 1] + px[i + 2]) / 3 < 128) ink.push(x, y);
    }
    const M = ink.length / 2;
    if (!M) { scatter(out); return; }

    const scale = (SPREAD * 1.42) / H;
    for (let i = 0; i < N; i++) {
      const j = ((i * 7919) % M) * 2;        // stride, so the sample is even
      out[i * 3]     = (ink[j] - W / 2) * scale + rnd(-.1, .1);
      out[i * 3 + 1] = (H / 2 - ink[j + 1]) * scale + rnd(-.1, .1);
      out[i * 3 + 2] = rnd(-1.1, 1.1);
    }
  }

  // ------------------------------------------------------------------ scene --
  const renderer = new T.WebGLRenderer({ antialias: false, alpha: true,
                                         powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.6 : 2));
  renderer.setSize(innerWidth, innerHeight);
  host.appendChild(renderer.domElement);

  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 500);
  cam.position.z = small ? 96 : 104;

  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  const targets = {};
  for (const s of STAGES) targets[s] = new Float32Array(N * 3);
  volume(targets.impressions); funnel(targets.clicks);
  field(targets.leads); sold(targets.sold); scatter(targets.rest);
  scatter(targets.people);                    // replaced once the drawing loads
  pos.set(targets.impressions);
  for (let i = 0; i < N; i++) seed[i] = Math.random();

  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new T.BufferAttribute(seed, 1));

  // Round, soft points drawn in the shader - no texture to load, and the size
  // falls off with depth so the field reads as a volume rather than a sheet.
  const mat = new T.ShaderMaterial({
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    uniforms: {
      uSize: { value: small ? 2.0 : 2.3 },
      uScale: { value: 1 },
      uOpacity: { value: 0.0 },
      uTime: { value: 0 },
      uWarm: { value: 0 },                  // 0 cold field, 1 the drawing
      uCold: { value: new T.Color('#7FA8C9') },
      uHot:  { value: new T.Color('#F3EFE6') }
    },
    vertexShader: `
      attribute float seed;
      uniform float uSize, uTime, uScale;
      varying float vFade;
      void main(){
        vec3 p = position;
        float w = 0.55 + seed * 0.9;
        p.x += sin(uTime * 0.22 + seed * 31.4) * w;
        p.y += cos(uTime * 0.19 + seed * 17.7) * w * 0.8;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * uScale * (300.0 / -mv.z) * (0.7 + seed * 0.7);
        vFade = clamp((160.0 + mv.z) / 150.0, 0.0, 1.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uOpacity, uWarm;
      uniform vec3 uCold, uHot;
      varying float vFade;
      void main(){
        vec2 d = gl_PointCoord - vec2(0.5);
        float m = 1.0 - smoothstep(0.22, 0.5, length(d));
        if (m <= 0.001) discard;
        gl_FragColor = vec4(mix(uCold, uHot, uWarm), m * vFade * uOpacity);
      }`
  });

  const points = new T.Points(geo, mat);
  scene.add(points);

  // ------------------------------------------------------------- the picker --
  // Sections declare the stage they want. Exactly one wins per frame: the one
  // whose middle is closest to the middle of the screen.
  const marked = [...document.querySelectorAll('[data-stage]')];
  let stage = 'impressions', warmTo = 0;
  const SIZE = { impressions: 1, clicks: 1, leads: .92, people: .52, sold: .46,
                 story: .8, rest: .9 };
  // Cold and wide at the top of the funnel, hot and narrow at the bottom - the
  // same scale any media buyer reads a heatmap on. The page's accent follows it.
  const HUE = {
    impressions: ['#5B7CFA', '91,124,250'],
    clicks:      ['#17B6CE', '23,182,206'],
    leads:       ['#3FBF86', '63,191,134'],
    people:      ['#F5A524', '245,165,36'],
    sold:        ['#F2683C', '242,104,60'],
    story:       ['#C98BF0', '201,139,240'],
    rest:        ['#F5A524', '245,165,36']
  };
  let sizeTo = 1;
  const root = document.documentElement;

  function pick() {
    const mid = innerHeight / 2;
    let best = null, bd = Infinity;
    for (const el of marked) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      const d = Math.abs((r.top + r.bottom) / 2 - mid);
      if (d < bd) { bd = d; best = el; }
    }
    if (!best) return;
    const want = best.dataset.stage;
    if (want !== stage && targets[want]) {
      stage = want;
      // The field warms as it stops being traffic and starts being people.
      warmTo = (want === 'people' || want === 'sold') ? 1 : 0;
      sizeTo = SIZE[want] || 1;
      const h = HUE[want];
      if (h) {
        root.style.setProperty('--accent', h[0]);
        root.style.setProperty('--glow', h[1]);
        mat.uniforms.uCold.value.set(h[0]);
      }
    }
  }

  // --------------------------------------------------------------- the loop --
  // A fraction-per-frame lerp is twice as fast at 120Hz as at 60. Converting it
  // against real elapsed time is the difference between a scene that settles
  // and one that behaves differently on every machine.
  const rate = (per, dt) => 1 - Math.pow(1 - per, dt * 60);

  let prev = performance.now(), vis = true;
  document.addEventListener('visibilitychange', () => { vis = !document.hidden; prev = performance.now(); });

  function frame(now) {
    requestAnimationFrame(frame);
    if (!vis) return;
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now;

    pick();
    const tgt = targets[stage];
    const k = rate(0.045, dt);
    const arr = geo.attributes.position.array;
    for (let i = 0; i < arr.length; i++) arr[i] += (tgt[i] - arr[i]) * k;
    geo.attributes.position.needsUpdate = true;

    mat.uniforms.uTime.value += dt;
    mat.uniforms.uScale.value += (sizeTo - mat.uniforms.uScale.value) * rate(0.05, dt);
    mat.uniforms.uWarm.value += (warmTo - mat.uniforms.uWarm.value) * rate(0.05, dt);
    mat.uniforms.uOpacity.value += (0.92 - mat.uniforms.uOpacity.value) * rate(0.03, dt);

    points.rotation.y += (stage === 'clicks' ? 0.055 : 0.012) * dt;
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);

  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
  }, { passive: true });

  const img = new Image();
  img.onload = () => figureFrom(img, targets.people);
  img.src = host.dataset.figure;

  document.body.classList.add('hasfield');
})();
