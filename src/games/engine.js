import * as THREE from "three";

/** Цвета с лендинга: неон, пламя, чернила. */
export const PALETTE = {
  sky: 0x050608,
  grassA: "#147a32",
  grassB: "#0f5c26",
  line: 0xe8eedf,
  neon: 0xb6ff3c,
  flame: 0xff7a1a,
  ink: 0x0a0c10,
  stand: 0x12151c,
  post: 0xf4f7f0,
  skin: 0xe0b089,
};

export const GOAL = { width: 7.32, height: 2.44 };
export const BALL_R = 0.11;
export const GRAVITY = 9.6;

export function expLerp(a, b, lambda, dt) {
  return a + (b - a) * (1 - Math.exp(-lambda * dt));
}

export function disposeObject(root) {
  root.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    const material = node.material;
    if (!material) return;
    const list = Array.isArray(material) ? material : [material];
    for (const item of list) {
      if (item.map) item.map.dispose();
      item.dispose();
    }
  });
}

export function createApp(canvas, { fov = 58, near = 0.08, far = 72 } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "default",
    stencil: false,
    failIfMajorPerformanceCaveat: false,
    // Кадр остаётся в буфере: Telegram и скриншоты иначе видят пустой канвас.
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(PALETTE.sky, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const gl = renderer.getContext();
  if (!gl || gl.isContextLost?.()) {
    renderer.dispose();
    throw new Error("WebGL недоступен");
  }
  canvas.addEventListener(
    "webglcontextlost",
    (event) => {
      event.preventDefault();
    },
    false,
  );

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.sky);
  scene.fog = new THREE.Fog(PALETTE.sky, 18, 52);

  const camera = new THREE.PerspectiveCamera(fov, 1, near, far);

  function resize(width, height) {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function dispose() {
    disposeObject(scene);
    renderer.dispose();
  }

  return { renderer, scene, camera, resize, dispose };
}

function lambert(color, extras = {}) {
  return new THREE.MeshLambertMaterial({ color, ...extras });
}

function grassTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const stripe = 8;
  for (let i = 0; i < 8; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.grassA : PALETTE.grassB;
    ctx.fillRect(0, i * stripe, 4, stripe);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

function ballTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f3f3f3";
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = "#161616";
  const patches = [
    [64, 36, 20],
    [192, 36, 20],
    [128, 84, 18],
    [28, 92, 16],
    [228, 92, 16],
    [128, 22, 14],
    [96, 60, 10],
    [160, 60, 10],
  ];
  for (const [x, y, r] of patches) {
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

export function addLights(scene) {
  scene.add(new THREE.HemisphereLight(0xb9d7ff, 0x16351c, 1.12));
  const sun = new THREE.DirectionalLight(0xfff4d6, 0.72);
  sun.position.set(-6, 18, 12);
  scene.add(sun);
  const rim = new THREE.PointLight(PALETTE.neon, 0.38, 30, 2);
  rim.position.set(0, 5.2, 4);
  scene.add(rim);
}

export function addPitch(scene, { length = 36, width = 24 } = {}) {
  const map = grassTexture();
  map.repeat.set(width * 0.65, length * 0.65);
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    lambert(0x147a32, { map }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(0, 0, 8);
  scene.add(grass);

  const lineMat = lambert(PALETTE.line);
  const line = (w, d, x, z) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lineMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.016, z);
    scene.add(mesh);
  };

  line(GOAL.width + 2.4, 0.08, 0, 0);
  line(18, 0.08, 0, 12);
  line(0.08, 12, -9, 6);
  line(0.08, 12, 9, 6);
  line(9.5, 0.08, 0, 5.5);
  line(0.08, 5.5, -4.75, 2.75);
  line(0.08, 5.5, 4.75, 2.75);

  const spot = new THREE.Mesh(new THREE.CircleGeometry(0.13, 14), lineMat);
  spot.rotation.x = -Math.PI / 2;
  spot.position.set(0, 0.018, 11);
  scene.add(spot);
}

export function addGoal(scene, z = 0) {
  const mat = lambert(PALETTE.post);
  const r = 0.07;
  const { width: w, height: h } = GOAL;

  const left = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), mat);
  left.position.set(-w / 2, h / 2, z);
  const right = left.clone();
  right.position.x = w / 2;
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w + r * 2, 8), mat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, h, z);
  scene.add(left, right, bar);

  const netZ = z - 1.45;
  const backL = left.clone();
  backL.position.z = netZ;
  backL.scale.set(0.65, 1, 0.65);
  const backR = right.clone();
  backR.position.z = netZ;
  backR.scale.set(0.65, 1, 0.65);
  scene.add(backL, backR);

  const pts = [];
  const cols = 8;
  const rows = 5;
  for (let i = 0; i <= cols; i += 1) {
    const x = -w / 2 + (w * i) / cols;
    pts.push(x, 0, netZ, x, h, z);
  }
  for (let j = 0; j <= rows; j += 1) {
    const y = (h * j) / rows;
    const zz = netZ + (z - netZ) * (j / rows);
    pts.push(-w / 2, y, zz, w / 2, y, zz);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  scene.add(
    new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({
        color: 0xc8c8c8,
        transparent: true,
        opacity: 0.32,
      }),
    ),
  );
}

export function addStands(scene) {
  const mat = lambert(PALETTE.stand);
  const left = new THREE.Mesh(new THREE.BoxGeometry(2.6, 6.4, 42), mat);
  left.position.set(-14.2, 2.3, 10);
  left.rotation.z = 0.16;
  const right = left.clone();
  right.position.x = 14.2;
  right.rotation.z = -0.16;
  const back = new THREE.Mesh(new THREE.BoxGeometry(32, 8.5, 2.6), mat);
  back.position.set(0, 3.2, -9);
  scene.add(left, right, back);

  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(28, 0.1, 0.1),
    new THREE.MeshLambertMaterial({
      color: PALETTE.neon,
      emissive: PALETTE.neon,
      emissiveIntensity: 0.35,
    }),
  );
  strip.position.set(0, 6.4, -7.6);
  scene.add(strip);

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 18),
    lambert(PALETTE.ink),
  );
  wall.position.set(0, 6, -10.4);
  scene.add(wall);
}

export function buildStadium(scene) {
  addLights(scene);
  addPitch(scene);
  addStands(scene);
  addGoal(scene);
}

export function createBall() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(BALL_R, 16, 12),
    lambert(0xffffff, { map: ballTexture() }),
  );
}

export function createBlobShadow() {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 16),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02;
  return mesh;
}

export function updateBlob(shadow, ball) {
  shadow.position.x = ball.x;
  shadow.position.z = ball.z;
  const scale = 0.85 + ball.y * 0.22;
  shadow.scale.set(scale, scale, 1);
  shadow.material.opacity = THREE.MathUtils.clamp(0.38 - ball.y * 0.055, 0.1, 0.38);
}

export function createTrail(count = 12) {
  const group = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.045, 6, 6);
  const mat = new THREE.MeshBasicMaterial({
    color: PALETTE.neon,
    transparent: true,
    opacity: 0.8,
  });
  for (let i = 0; i < count; i += 1) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    group.add(mesh);
  }
  return group;
}

export function placeTrail(trail, points) {
  trail.children.forEach((mesh, i) => {
    const point = points[i];
    if (!point) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    mesh.position.set(point.x, point.y, point.z);
    const s = 1 - i * 0.06;
    mesh.scale.setScalar(Math.max(0.35, s));
  });
}

export function createKeeper({ shirtColor = PALETTE.neon } = {}) {
  const group = new THREE.Group();
  const shirt = lambert(shirtColor);
  const dark = lambert(0x12151c);
  const skin = lambert(PALETTE.skin);
  const glove = lambert(0xf4f4f4);

  const box = (w, h, d, mat, x, y, z = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  };

  box(0.38, 0.16, 0.24, dark, 0, 0.95);
  const torso = box(0.44, 0.52, 0.28, shirt, 0, 1.28);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), skin);
  head.position.y = 1.68;
  group.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.136, 8, 6), dark);
  hair.position.set(0, 1.74, -0.01);
  hair.scale.set(1, 0.55, 0.95);
  group.add(hair);

  const leftLeg = box(0.14, 0.52, 0.16, dark, -0.12, 0.52);
  const rightLeg = box(0.14, 0.52, 0.16, dark, 0.12, 0.52);
  const leftArm = box(0.12, 0.42, 0.12, shirt, -0.32, 1.22, 0.04);
  const rightArm = box(0.12, 0.42, 0.12, shirt, 0.32, 1.22, 0.04);
  const leftGlove = box(0.17, 0.14, 0.2, glove, -0.32, 0.97, 0.08);
  const rightGlove = box(0.17, 0.14, 0.2, glove, 0.32, 0.97, 0.08);
  box(0.14, 0.1, 0.26, dark, -0.12, 0.08, 0.05);
  box(0.14, 0.1, 0.26, dark, 0.12, 0.08, 0.05);

  group.userData.parts = {
    torso,
    head,
    leftArm,
    rightArm,
    leftGlove,
    rightGlove,
    leftLeg,
    rightLeg,
  };
  return group;
}

export function animateKeeperIdle(keeper, time) {
  const { leftArm, rightArm, leftGlove, rightGlove } = keeper.userData.parts;
  keeper.position.y = Math.sin(time * 2.5) * 0.03;
  leftArm.rotation.z = 0.18 + Math.sin(time * 2.2) * 0.1;
  rightArm.rotation.z = -0.18 - Math.sin(time * 2.2) * 0.1;
  leftGlove.position.y = 0.97 + Math.sin(time * 2.2) * 0.035;
  rightGlove.position.y = 0.97 + Math.sin(time * 2.4) * 0.035;
}

const _box = new THREE.Box3();
const _sphere = new THREE.Sphere();

export function keeperSavesBall(keeper, ball, radius = BALL_R) {
  const { torso, leftGlove, rightGlove } = keeper.userData.parts;
  _sphere.center.set(ball.x, ball.y, ball.z);
  _sphere.radius = radius + 0.16;
  for (const part of [torso, leftGlove, rightGlove]) {
    _box.setFromObject(part);
    _box.expandByScalar(0.1);
    if (_box.intersectsSphere(_sphere)) return true;
  }
  return false;
}

export function integrate(ball, dt, { gravity = GRAVITY, drag = 0.1 } = {}) {
  ball.vy -= gravity * dt;
  const damp = Math.max(0, 1 - drag * dt);
  ball.vx *= damp;
  ball.vz *= damp;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.z += ball.vz * dt;
}

export function ballInGoal(ball) {
  return (
    Math.abs(ball.x) < GOAL.width / 2 - 0.04 &&
    ball.y > 0.04 &&
    ball.y < GOAL.height - 0.04
  );
}

export function classifySwipe(dx, dy) {
  const dist = Math.hypot(dx, dy);
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  let dir = "up";
  if (angle >= 28 && angle < 125) dir = angle < 78 ? "up-right" : "right";
  else if (angle <= -28 && angle > -125) dir = angle > -78 ? "up-left" : "left";
  else if (Math.abs(angle) >= 125) dir = "down";
  return { dir, dist, angle };
}

export function attachPointer(element, handlers) {
  let start = null;
  let live = true;

  const point = (event) => {
    const box = element.getBoundingClientRect();
    return {
      x: event.clientX - box.left,
      y: event.clientY - box.top,
      t: performance.now(),
      w: box.width,
      h: box.height,
    };
  };

  const onDown = (event) => {
    if (!live) return;
    if (!(handlers.isEnabled?.() ?? true)) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      /* Telegram WebView иногда без capture — дальше работаем по id. */
    }
    start = { ...point(event), id: event.pointerId };
    handlers.onDown?.(start);
  };

  const onMove = (event) => {
    if (!live || !start || event.pointerId !== start.id) return;
    event.preventDefault();
    const now = point(event);
    handlers.onMove?.({
      start,
      now,
      dx: now.x - start.x,
      dy: now.y - start.y,
    });
  };

  const onUp = (event) => {
    if (!live || !start || event.pointerId !== start.id) return;
    const now = point(event);
    const dx = now.x - start.x;
    const dy = now.y - start.y;
    const dt = Math.max(1, now.t - start.t);
    handlers.onUp?.({
      start,
      now,
      dx,
      dy,
      dist: Math.hypot(dx, dy),
      dt,
    });
    start = null;
  };

  const opts = { passive: false };
  element.addEventListener("pointerdown", onDown, opts);
  element.addEventListener("pointermove", onMove, opts);
  element.addEventListener("pointerup", onUp, opts);
  element.addEventListener("pointercancel", onUp, opts);
  // Отпускание за краем канваса: в Telegram и на телефоне палец часто
  // уезжает за экран, и без window-слушателя удар «залипает».
  window.addEventListener("pointerup", onUp, opts);
  window.addEventListener("pointercancel", onUp, opts);
  const blockMenu = (event) => event.preventDefault();
  element.addEventListener("contextmenu", blockMenu);

  return () => {
    live = false;
    element.removeEventListener("pointerdown", onDown, opts);
    element.removeEventListener("pointermove", onMove, opts);
    element.removeEventListener("pointerup", onUp, opts);
    element.removeEventListener("pointercancel", onUp, opts);
    window.removeEventListener("pointerup", onUp, opts);
    window.removeEventListener("pointercancel", onUp, opts);
    element.removeEventListener("contextmenu", blockMenu);
  };
}

export function createSfx() {
  let ctx = null;

  const ensure = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const beep = (freq, dur, type = "sine", gain = 0.06, at = 0) => {
    const audio = ensure();
    if (!audio) return;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = audio.currentTime + at;
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };

  return {
    kick() {
      beep(150, 0.08, "square", 0.045);
      beep(78, 0.12, "sine", 0.055);
    },
    tap() {
      beep(240, 0.05, "sine", 0.045);
    },
    goal() {
      beep(392, 0.12, "sine", 0.055, 0);
      beep(523, 0.16, "sine", 0.055, 0.09);
      beep(659, 0.22, "sine", 0.06, 0.18);
    },
    save() {
      beep(92, 0.14, "triangle", 0.06);
    },
    miss() {
      beep(110, 0.16, "sine", 0.045);
      beep(72, 0.2, "sine", 0.04, 0.06);
    },
    dispose() {
      ctx?.close();
      ctx = null;
    },
  };
}

export function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function projectToScreen(vector, camera, width, height) {
  const projected = vector.clone().project(camera);
  return {
    x: (projected.x * 0.5 + 0.5) * width,
    y: (-projected.y * 0.5 + 0.5) * height,
    behind: projected.z > 1,
  };
}

export function buzz(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* в Telegram на iOS вибрации нет — это не ошибка. */
  }
}
