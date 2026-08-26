import * as THREE from "three";
import {
  BALL_R,
  GOAL,
  GRAVITY,
  PALETTE,
  attachPointer,
  buildStadium,
  buzz,
  classifySwipe,
  createApp,
  createBall,
  createBlobShadow,
  createKeeper,
  createSfx,
  expLerp,
  integrate,
  shuffle,
  updateBlob,
} from "./engine";
import { KEEPER_NEED, KEEPER_SHOTS } from "./rules";

const TARGETS = [
  { x: -2.75, y: 0.52, tag: "left" },
  { x: 2.75, y: 0.52, tag: "right" },
  { x: -2.55, y: 1.95, tag: "up-left" },
  { x: 2.55, y: 1.95, tag: "up-right" },
  { x: 0.1, y: 1.18, tag: "up" },
];

export function createKeeperGame(canvas, api) {
  const app = createApp(canvas, { fov: 72 });
  buildStadium(app.scene);

  const kicker = createKeeper({ shirtColor: 0xf4f4f4 });
  kicker.position.set(0, 0, 11.35);
  kicker.rotation.y = Math.PI;

  const ballMesh = createBall();
  const shadow = createBlobShadow();
  app.scene.add(kicker, ballMesh, shadow);

  const gloves = new THREE.Group();
  const white = new THREE.MeshLambertMaterial({ color: 0xf3f3f3 });
  const shirt = new THREE.MeshLambertMaterial({ color: PALETTE.neon });
  const leftGlove = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.3), white);
  const rightGlove = leftGlove.clone();
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.34), shirt);
  const rightArm = leftArm.clone();
  leftGlove.position.set(-0.34, -0.16, -0.52);
  rightGlove.position.set(0.34, -0.16, -0.52);
  leftArm.position.set(-0.3, -0.22, -0.32);
  rightArm.position.set(0.3, -0.22, -0.32);
  leftGlove.scale.set(1.25, 1.25, 1.25);
  rightGlove.scale.set(1.25, 1.25, 1.25);
  gloves.add(leftGlove, rightGlove, leftArm, rightArm);
  app.camera.add(gloves);
  app.scene.add(app.camera);

  const sfx = createSfx();
  const order = shuffle(TARGETS);
  const gloveL = new THREE.Vector3();
  const gloveR = new THREE.Vector3();
  const ballPos = new THREE.Vector3();

  let started = false;
  let shot = 0;
  let saves = 0;
  let phase = "wait";
  let wait = 0.65;
  let over = false;
  let settled = false;
  let ball = { x: 0, y: BALL_R, z: 11, vx: 0, vy: 0, vz: 0 };
  let dive = { x: 0, y: 0, roll: 0, tx: 0, ty: 0, troll: 0, armed: true };

  const hud = (extra = {}) => {
    api.onHud?.({
      progress: `Сейвы ${saves} / ${KEEPER_NEED} · удар ${Math.min(shot + 1, KEEPER_SHOTS)}/${KEEPER_SHOTS}`,
      hint: extra.hint ?? (dive.armed ? "Свайпни влево, вправо или вверх" : ""),
      banner: extra.banner ?? "",
    });
  };

  const resetDive = () => {
    dive.tx = 0;
    dive.ty = 0;
    dive.troll = 0;
    dive.armed = true;
  };

  const serve = () => {
    const target = order[shot];
    ball = {
      x: (Math.random() - 0.5) * 0.35,
      y: BALL_R,
      z: 11,
      vx: 0,
      vy: 0,
      vz: 0,
    };
    const flight = 0.64 + Math.random() * 0.08;
    ball.vx = (target.x - ball.x) / flight;
    ball.vy = (target.y - ball.y + 0.5 * GRAVITY * flight * flight) / flight;
    ball.vz = (0.5 - ball.z) / flight;
    phase = "flight";
    settled = false;
    dive.armed = true;
    kicker.userData.parts.rightLeg.rotation.x = -0.9;
    sfx.kick();
    hud();
  };

  const detach = attachPointer(canvas, {
    isEnabled: () =>
      api.getStatus() === "playing" && started && !over && dive.armed && phase !== "result",
    onUp: ({ dx, dy, dist }) => {
      if (dist < 26) return;
      const swipe = classifySwipe(dx, dy);
      dive.armed = false;
      if (swipe.dir === "left" || swipe.dir === "up-left") {
        dive.tx = -1.65;
        dive.ty = swipe.dir === "up-left" ? 0.48 : 0.08;
        dive.troll = 0.4;
      } else if (swipe.dir === "right" || swipe.dir === "up-right") {
        dive.tx = 1.65;
        dive.ty = swipe.dir === "up-right" ? 0.48 : 0.08;
        dive.troll = -0.4;
      } else if (swipe.dir === "down") {
        dive.tx = 0;
        dive.ty = -0.08;
        dive.troll = 0;
      } else {
        dive.tx = 0;
        dive.ty = 0.52;
        dive.troll = 0;
      }
      buzz(10);
    },
  });

  hud({ hint: "Свайпни влево, вправо или вверх" });

  return {
    resize: app.resize,
    update(dt) {
      const status = api.getStatus();
      if (status === "paused") return;

      if (status === "playing" && !started) {
        started = true;
        phase = "wait";
        wait = 0.55;
        resetDive();
      }

      dive.x = expLerp(dive.x, dive.tx, 11, dt);
      dive.y = expLerp(dive.y, dive.ty, 11, dt);
      dive.roll = expLerp(dive.roll, dive.troll, 11, dt);

      app.camera.position.set(dive.x, 1.52 + dive.y, 0.95);
      app.camera.lookAt(ball.x * 0.15, 1.05 + dive.y * 0.25, 11);
      app.camera.rotateZ(dive.roll);

      kicker.userData.parts.rightLeg.rotation.x = expLerp(
        kicker.userData.parts.rightLeg.rotation.x,
        0,
        6,
        dt,
      );

      if (status !== "playing") {
        ballMesh.position.set(0, BALL_R, 11);
        updateBlob(shadow, { x: 0, y: BALL_R, z: 11 });
        return;
      }

      if (over) {
        integrate(ball, dt, { drag: 0.18 });
        ballMesh.position.set(ball.x, Math.max(BALL_R, ball.y), ball.z);
        updateBlob(shadow, ball);
        return;
      }

      if (phase === "wait") {
        wait -= dt;
        ball = { x: 0, y: BALL_R, z: 11, vx: 0, vy: 0, vz: 0 };
        if (wait <= 0) serve();
      } else if (phase === "flight") {
        integrate(ball, dt, { drag: 0.04 });
        if (!settled && ball.z <= 0.7) {
          settled = true;
          phase = "result";
          wait = 0.8;
          leftGlove.getWorldPosition(gloveL);
          rightGlove.getWorldPosition(gloveR);
          ballPos.set(ball.x, ball.y, ball.z);
          const reach = 0.92;
          const hit =
            ballPos.distanceTo(gloveL) < reach ||
            ballPos.distanceTo(gloveR) < reach ||
            (Math.abs(ball.x - dive.x) < 0.78 &&
              Math.abs(ball.y - (1.25 + dive.y)) < 0.85);
          const onTarget = ballInMouth(ball);
          if (hit && onTarget) {
            saves += 1;
            sfx.save();
            buzz(18);
            hud({ banner: "СЕЙВ!", hint: "" });
            ball.vz = 5.2;
            ball.vy = 1.6;
            ball.vx *= -0.15;
          } else {
            sfx.miss();
            hud({ banner: "ГОЛ", hint: "" });
            ball.vz = -1.4;
            ball.vy = 0.4;
          }
        }
      } else if (phase === "result") {
        integrate(ball, dt, { drag: 0.2 });
        wait -= dt;
        if (wait <= 0) {
          shot += 1;
          if (shot >= KEEPER_SHOTS) {
            over = true;
            if (saves >= KEEPER_NEED) {
              sfx.goal();
              api.onWin();
            } else {
              api.onLose(`Сейвов ${saves} из ${KEEPER_SHOTS}`);
            }
          } else {
            resetDive();
            phase = "wait";
            wait = 0.5;
            hud({ banner: "", hint: "Свайпни влево, вправо или вверх" });
          }
        }
      }

      ballMesh.position.set(ball.x, Math.max(BALL_R, ball.y), ball.z);
      ballMesh.rotation.x += dt * 9;
      updateBlob(shadow, ball);
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

function ballInMouth(ball) {
  return (
    Math.abs(ball.x) < GOAL.width / 2 + 0.15 &&
    ball.y > -0.05 &&
    ball.y < GOAL.height + 0.2
  );
}
