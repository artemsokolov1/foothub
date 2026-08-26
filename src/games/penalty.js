import * as THREE from "three";
import {
  BALL_R,
  GOAL,
  GRAVITY,
  animateKeeperIdle,
  attachPointer,
  ballInGoal,
  buildStadium,
  buzz,
  createApp,
  createBall,
  createBlobShadow,
  createKeeper,
  createSfx,
  createTrail,
  expLerp,
  integrate,
  keeperSavesBall,
  placeTrail,
  updateBlob,
} from "./engine";

const BALL0 = { x: 0, y: BALL_R, z: 11 };
const MIN_SWIPE = 36;

function shotFromSwipe(dx, dy, dist) {
  const yaw = THREE.MathUtils.clamp(dx / 170, -1, 1) * 0.3;
  const pitch = THREE.MathUtils.clamp(-dy / 300, 0.07, 0.3);
  const power = THREE.MathUtils.clamp((dist / 190) * 22, 11, 23);
  return {
    vx: Math.sin(yaw) * power,
    vz: -Math.cos(yaw) * power,
    vy: Math.sin(pitch) * power * 0.7 + 0.45,
    power: THREE.MathUtils.clamp(dist / 170, 0, 1),
    yaw,
    pitch,
  };
}

function predictPath(shot, count) {
  const points = [];
  let x = BALL0.x;
  let y = BALL0.y;
  let z = BALL0.z;
  let vx = shot.vx;
  let vy = shot.vy;
  let vz = shot.vz;
  const step = 0.048;
  for (let i = 0; i < count; i += 1) {
    vy -= GRAVITY * step;
    x += vx * step;
    y += vy * step;
    z += vz * step;
    if (y < 0 || z < -0.4) break;
    points.push({ x, y, z });
  }
  return points;
}

export function createPenaltyGame(canvas, api) {
  const app = createApp(canvas, { fov: 62 });
  buildStadium(app.scene);

  const ballMesh = createBall();
  const shadow = createBlobShadow();
  const trail = createTrail();
  const keeper = createKeeper();
  keeper.position.set(0, 0, 0.55);

  const boot = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.08, 0.28),
    new THREE.MeshLambertMaterial({ color: 0x2a1a12 }),
  );
  boot.position.set(0.22, -0.34, -0.58);
  app.camera.add(boot);
  app.scene.add(app.camera, ballMesh, shadow, trail, keeper);

  const sfx = createSfx();
  let ball = { ...BALL0, vx: 0, vy: 0, vz: 0 };
  let phase = "idle";
  let time = 0;
  let aim = null;
  let dive = { targetX: 0, reaction: 0.25, timer: 0 };
  let settled = false;
  let shake = 0;
  let bootSwing = 0;

  const resetIdleCamera = () => {
    app.camera.position.set(0.1, 0.5, 11.7);
    app.camera.lookAt(0, 1.15, 0);
  };
  resetIdleCamera();

  const detach = attachPointer(canvas, {
    isEnabled: () => api.getStatus() === "playing" && phase === "idle",
    onDown: () => {
      phase = "aim";
      aim = { dx: 0, dy: 0, dist: 0 };
    },
    onMove: ({ dx, dy }) => {
      if (phase !== "aim") return;
      aim = { dx, dy, dist: Math.hypot(dx, dy) };
      const shot = shotFromSwipe(dx, dy, aim.dist);
      placeTrail(trail, predictPath(shot, trail.children.length));
      api.onHud?.({
        power: shot.power,
        hint: aim.dist < MIN_SWIPE ? "Свайпни сильнее" : "Отпусти, чтобы ударить",
      });
    },
    onUp: ({ dx, dy, dist }) => {
      if (phase !== "aim") return;
      placeTrail(trail, []);
      if (dist < MIN_SWIPE) {
        phase = "idle";
        aim = null;
        api.onHud?.({ power: null, hint: "Свайпни по экрану: угол и сила" });
        return;
      }
      const shot = shotFromSwipe(dx, dy, dist);
      ball = { ...BALL0, vx: shot.vx, vy: shot.vy, vz: shot.vz };
      phase = "flight";
      aim = null;
      bootSwing = 0.18;
      sfx.kick();
      buzz(16);
      api.onHud?.({ power: null, hint: "" });

      const tGoal = Math.max(0.28, (ball.z - 0.35) / Math.max(0.2, -ball.vz));
      const predX = ball.x + ball.vx * tGoal;
      const inaccuracy = THREE.MathUtils.lerp(
        1.15,
        0.22,
        THREE.MathUtils.clamp((tGoal - 0.35) / 0.55, 0, 1),
      );
      const err = (Math.random() - 0.5) * 2 * inaccuracy;
      dive = {
        targetX: THREE.MathUtils.clamp(predX + err, -2.55, 2.55),
        reaction: 0.16 + Math.random() * 0.12,
        timer: 0,
      };
    },
  });

  api.onHud?.({ hint: "Свайпни по экрану: угол и сила" });

  return {
    resize: app.resize,
    update(dt) {
      time += dt;
      const status = api.getStatus();
      if (import.meta.env.DEV) {
        window.__penalty = { phase, status, ball: { ...ball }, aim };
      }
      if (status === "paused") return;
      if (phase !== "aim") placeTrail(trail, []);

      if (phase === "idle" || phase === "aim") {
        animateKeeperIdle(keeper, time);
        if (phase === "idle") {
          resetIdleCamera();
          app.camera.position.y = 0.5 + Math.sin(time * 1.2) * 0.012;
        }
      } else {
        placeTrail(trail, []);
      }

      if (bootSwing > 0) {
        bootSwing -= dt;
        boot.rotation.x = -1.1;
      } else {
        boot.rotation.x = expLerp(boot.rotation.x, 0, 10, dt);
      }

      if (phase === "flight") {
        integrate(ball, dt, { drag: 0.07 });
        ballMesh.rotation.x += dt * 9;
        ballMesh.rotation.z += ball.vx * dt * 0.35;

        dive.timer += dt;
        if (dive.timer > dive.reaction) {
          keeper.position.x = expLerp(keeper.position.x, dive.targetX, 9, dt);
          keeper.rotation.z = expLerp(
            keeper.rotation.z,
            -dive.targetX * 0.32,
            8,
            dt,
          );
          keeper.position.y = expLerp(
            keeper.position.y,
            Math.min(0.45, Math.abs(dive.targetX) * 0.12),
            7,
            dt,
          );
          const { leftArm, rightArm } = keeper.userData.parts;
          leftArm.rotation.z = 0.7;
          rightArm.rotation.z = -0.7;
        }

        const follow = new THREE.Vector3(
          ball.x * 0.18,
          Math.max(0.42, ball.y + 0.32),
          ball.z + 1.35,
        );
        app.camera.position.lerp(follow, 1 - Math.exp(-5 * dt));
        app.camera.lookAt(ball.x, Math.max(0.4, ball.y + 0.1), 0);

        if (!settled && ball.z <= 0.14) {
          const saved = keeperSavesBall(keeper, ball);
          const goal = ballInGoal(ball) && !saved;
          settled = true;
          phase = "done";
          if (goal) {
            shake = 0.35;
            sfx.goal();
            buzz([18, 40, 30]);
            api.onHud?.({ banner: "ГОЛ!" });
            api.onWin();
          } else {
            sfx.save();
            api.onLose(saved ? "Вратарь взял" : "Мимо");
          }
        } else if (!settled && ball.y <= BALL_R && ball.z > 0.3) {
          ball.y = BALL_R;
          ball.vy *= -0.15;
          ball.vx *= 0.55;
          ball.vz *= 0.45;
          if (Math.abs(ball.vz) < 1.2) {
            settled = true;
            phase = "done";
            sfx.miss();
            api.onLose("Мимо");
          }
        } else if (!settled && ball.z < -2.2) {
          settled = true;
          phase = "done";
          sfx.miss();
          api.onLose("Мимо");
        } else if (!settled && Math.abs(ball.x) > GOAL.width / 2 + 1.4 && ball.z < 2) {
          settled = true;
          phase = "done";
          sfx.miss();
          api.onLose("Мимо");
        }
      }

      ballMesh.position.set(ball.x, Math.max(BALL_R, ball.y), ball.z);
      updateBlob(shadow, ball);

      if (shake > 0) {
        shake -= dt;
        app.camera.position.x += (Math.random() - 0.5) * shake * 0.35;
        app.camera.position.y += (Math.random() - 0.5) * shake * 0.2;
      }
    },
    render() {
      app.renderer.render(app.scene, app.camera);
    },
    dispose() {
      detach();
      sfx.dispose();
      app.dispose();
    },
  };
}
