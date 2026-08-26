import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Pitch from "./Pitch";
import { KEEPYUP_TARGET } from "./rules";
import { buzz, useSfx } from "./sfx";
import { usePlayingLoop } from "./usePlayingLoop";

export default function KeepyUpGame({ status, onWin, onLose, onHud }) {
  const playing = status === "playing";
  const sfx = useSfx();
  const stageRef = useRef(null);
  const ballRef = useRef(null);
  const ended = useRef(false);
  const readyAt = useRef(0);
  const lastKick = useRef(0);
  const ball = useRef({
    x: 0.5,
    y: 0.42,
    vx: 0,
    vy: 0,
    started: false,
    kicks: 0,
    spin: 0,
  });
  const [size, setSize] = useState(44);
  const [kicks, setKicks] = useState(0);
  const [hint, setHint] = useState("Тапай по экрану — мяч подлетит");

  useEffect(() => {
    onHud?.({ progress: `0 / ${KEEPYUP_TARGET}` });
  }, [onHud]);

  useEffect(() => {
    if (playing) readyAt.current = performance.now() + 220;
  }, [playing]);

  useEffect(
    () => () => {
      ended.current = true;
    },
    [],
  );

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const el = ballRef.current;
    if (!stage || !el) return;
    const b = ball.current;
    el.style.transform = `translate(${b.x * stage.clientWidth}px, ${b.y * stage.clientHeight}px)`;
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const fit = () => {
      const side = Math.min(stage.clientWidth, stage.clientHeight);
      setSize(Math.max(40, Math.min(64, side * 0.12)));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  usePlayingLoop(playing || status === "start", (dt) => {
    const stage = stageRef.current;
    const el = ballRef.current;
    if (!stage || !el) return;
    const b = ball.current;
    const w = stage.clientWidth;
    const h = stage.clientHeight;

    if (!b.started) {
      b.y = 0.4 + Math.sin(performance.now() / 260) * 0.02;
    } else if (!ended.current) {
      b.vy += 1.35 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.spin += dt * 5;
      if (b.x < 0.14) {
        b.x = 0.14;
        b.vx *= -0.45;
      }
      if (b.x > 0.86) {
        b.x = 0.86;
        b.vx *= -0.45;
      }
      if (b.y > 0.9) {
        ended.current = true;
        sfx.current?.miss();
        setHint("Мяч упал");
        onLose?.("Мяч упал");
      }
    }

    el.style.transform = `translate(${b.x * w}px, ${b.y * h}px) rotate(${b.spin}rad)`;
  });

  const kick = (event) => {
    event.preventDefault();
    if (!playing || ended.current) return;
    const now = performance.now();
    if (now < readyAt.current || now - lastKick.current < 90) return;
    lastKick.current = now;
    const b = ball.current;
    const stage = stageRef.current.getBoundingClientRect();
    const px = (event.clientX - stage.left) / stage.width;
    b.started = true;
    b.kicks += 1;
    b.vy = -1.05;
    b.vx = (b.x - px) * 0.7;
    b.vx = Math.max(-0.35, Math.min(0.35, b.vx));
    sfx.current?.tap();
    buzz(8);
    setKicks(b.kicks);
    setHint("");
    if (b.kicks >= KEEPYUP_TARGET) {
      ended.current = true;
      sfx.current?.goal();
      setHint("Есть!");
      onWin?.();
    }
  };

  return (
    <div
      ref={stageRef}
      className="h-full w-full touch-none"
      onPointerDown={kick}
    >
      <Pitch>
        <p className="pointer-events-none absolute inset-x-0 top-4 z-20 text-center text-3xl font-extrabold tracking-tight text-white drop-shadow">
          {kicks} / {KEEPYUP_TARGET}
        </p>
        <p className="pointer-events-none absolute inset-x-0 top-14 z-20 text-center text-base font-bold text-white/80">
          {hint}
        </p>

        <div className="pointer-events-none absolute inset-x-8 bottom-[max(9%,env(safe-area-inset-bottom))] z-10 h-1.5 rounded-full bg-white/25" />

        <span
          ref={ballRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-20"
          style={{
            fontSize: size * 1.85,
            lineHeight: 1,
            marginLeft: -size * 0.95,
            marginTop: -size * 0.95,
          }}
        >
          ⚽
        </span>
      </Pitch>
    </div>
  );
}
