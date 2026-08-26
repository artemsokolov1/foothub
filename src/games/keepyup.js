import * as THREE from "three";
import {
  BALL_R,
  PALETTE,
  attachPointer,
  buildStadium,
  buzz,
  createApp,
  createBall,
  createBlobShadow,
  createSfx,
  expLerp,
  integrate,
  projectToScreen,
  updateBlob,
} from "./engine";
import { KEEPYUP_TARGET } from "./rules";

export function createKeepyUpGame(canvas, api) {
  const app = createApp(canvas, { fov: 62 });
  buildStadium(app.scene);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.72, 0.82, 28),
    new THREE.MeshBasicMaterial({
      color: PALETTE.line,
      side: THREE.DoubleSide,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.02, 8);
  app.scene.add(ring);

  const ballMesh = createBall();
  const shadow = createBlobShadow();
  app.scene.add(ballMesh, shadow);

  const legs = new THREE.Group();
  const dark = new THREE.MeshLambertMaterial({ color: 0x0a0c10 });
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.18), dark);
  left.position.set(-0.16, 0.28, 0);
  const right = left.clone();
  right.position.x = 0.16;
  legs.add(left, right);
  app.scene.add(legs);

  const sfx = createSfx();
  let time = 0;
  let started = false;
  let over = false;
  let kicks = 0;
  let kickFlash = 0;
  let ball = { x: 0, y: 1.05, z: 8, vx: 0, vy: 0, vz: 0 };
  const tmp = new THREE.Vector3();

  const pushHud = () => {
    api.onHud?.({
      progress: `${kicks} / ${KEEPYUP_TARGET}`,
      hint: kicks < 2 ? "Тапай по мячу" : "",
    });
  };

  const serve = () => {
    ball = {
      x: 0,
      y: 0.95,
      z: 8,
      vx: (Math.random() - 0.5) * 0.25,
      vy: 4.35,
      vz: 0.05,
    };
    kicks = 0;
    over = false;
    pushHud();
  };

  const hitRadius = (width, height) => Math.max(96, Math.min(width, height) * 0.32);

  const detach = attachPointer(canvas, {
    isEnabled: () => api.getStatus() === "playing" && started && !over,
    onDown: (point) => {
      tmp.set(ball.x, ball.y, ball.z);
      const screen = projectToScreen(tmp, app.camera, point.w, point.h);
      if (screen.behind) return;
      const radius = hitRadius(point.w, point.h);
      const dx = point.x - screen.x;
      const dy = point.y - screen.y;
      if (Math.hypot(dx, dy) > radius) return;

      const ox = THREE.MathUtils.clamp(dx / radius, -1, 1);
      const oy = THREE.MathUtils.clamp(dy / radius, -1, 1);
      const chaos = 1 + kicks * 0.025;
      ball.vy = 4.55 + Math.random() * 0.35;
      ball.vx += -ox * 1.35 * chaos + (Math.random() - 0.5) * 0.12;
      ball.vz += oy * 0.45 + (Math.random() - 0.5) * 0.12;
      ball.vx = THREE.MathUtils.clamp(ball.vx, -2.4, 2.4);
      ball.vz = THREE.MathUtils.clamp(ball.vz, -0.55, 1.5);
      kicks += 1;
      kickFlash = 0.14;
      sfx.tap();
      buzz(8);
      pushHud();
      if (kicks >= KEEPYUP_TARGET) {
        over = true;
        sfx.goal();
        buzz([16, 30, 24]);
        api.onHud?.({ progress: `${kicks} / ${KEEPYUP_TARGET}`, banner: "ЕСТЬ!" });
        api.onWin();
      }
    },
  });

  api.onHud?.({ progress: `0 / ${KEEPYUP_TARGET}`, hint: "Тапай по мячу" });

  return {
    resize: app.resize,
    update(dt) {
      time += dt;
      const status = api.getStatus();
      if (status === "paused") return;

      if (status === "playing" && !started) {
        started = true;
        serve();
      }

      if (status !== "playing") {
        ball.y = 1.02 + Math.sin(time * 2.6) * 0.16;
        ball.x = Math.sin(time * 0.8) * 0.08;
        ball.z = 8;
      } else if (!over) {
        integrate(ball, dt, { gravity: 8.15, drag: 0.03 });
        if (ball.y <= BALL_R) {
          ball.y = BALL_R;
          ball.vy = 0;
          over = true;
          sfx.miss();
          api.onLose("Мяч упал");
        }
      }

      ballMesh.position.set(ball.x, Math.max(BALL_R, ball.y), ball.z);
      ballMesh.rotation.x += dt * (2.2 + Math.abs(ball.vy));
      ballMesh.rotation.z += ball.vx * dt;
      updateBlob(shadow, ball);

      const camX = expLerp(app.camera.position.x, ball.x * 0.22, 5, dt);
      app.camera.position.set(camX, 1.22, 6.4);
      app.camera.lookAt(ball.x, Math.max(0.4, ball.y * 0.7), ball.z);

      legs.position.set(camX, 0, 6.85);
      if (kickFlash > 0) {
        kickFlash -= dt;
        right.rotation.x = -0.7;
      } else {
        right.rotation.x = expLerp(right.rotation.x, 0, 12, dt);
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
