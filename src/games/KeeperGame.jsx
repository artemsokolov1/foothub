import { useEffect, useRef, useState } from "react";
import Pitch from "./Pitch";
import { KEEPER_NEED, KEEPER_SHOTS } from "./rules";
import { buzz, useSfx } from "./sfx";
import { usePlayingLoop } from "./usePlayingLoop";

const LANES = [
  { id: 0, label: "Лево" },
  { id: 1, label: "Центр" },
  { id: 2, label: "Право" },
];

const FLY_SECONDS = 1.05;

export default function KeeperGame({ status, onWin, onLose, onHud }) {
  const playing = status === "playing";
  const sfx = useSfx();
  const ballRef = useRef(null);
  const readyAt = useRef(0);
  const world = useRef({
    phase: "wait",
    wait: 0.7,
    fly: 0,
    lane: 1,
    shot: 0,
    saves: 0,
    answered: false,
    over: false,
    lastLane: -1,
  });
  const [view, setView] = useState({
    phase: "wait",
    lane: 1,
    shot: 0,
    saves: 0,
    caption: "Жди удар — потом нажми туда, куда летит мяч",
  });

  const pushHud = (saves, shot) => {
    onHud?.({
      progress: `Сейвы ${saves} / ${KEEPER_NEED} · удар ${Math.min(shot + 1, KEEPER_SHOTS)}/${KEEPER_SHOTS}`,
    });
  };

  useEffect(() => {
    pushHud(0, 0);
    onHud?.({ hint: "Нажми лево, центр или право" });
  }, [onHud]);

  useEffect(() => {
    if (playing) readyAt.current = performance.now() + 280;
  }, [playing]);

  const finishShot = (saved) => {
    const w = world.current;
    if (w.over || w.answered) return;
    w.answered = true;
    w.shot += 1;
    if (saved) {
      w.saves += 1;
      sfx.current?.save();
      buzz(10);
    } else {
      sfx.current?.miss();
    }
    const remaining = KEEPER_SHOTS - w.shot;
    const won = w.saves >= KEEPER_NEED;
    const lost = w.saves + remaining < KEEPER_NEED;
    pushHud(w.saves, w.shot);

    if (won) {
      w.over = true;
      w.phase = "done";
      setView({
        phase: "done",
        lane: w.lane,
        shot: w.shot,
        saves: w.saves,
        caption: "Серия отбита!",
      });
      sfx.current?.goal();
      onHud?.({ banner: "Сейв!" });
      onWin?.();
      return;
    }
    if (lost) {
      w.over = true;
      w.phase = "done";
      setView({
        phase: "done",
        lane: w.lane,
        shot: w.shot,
        saves: w.saves,
        caption: "Пропустил",
      });
      onLose?.("Пропустил слишком много");
      return;
    }

    w.phase = "wait";
    w.wait = 0.55;
    w.fly = 0;
    setView({
      phase: "wait",
      lane: w.lane,
      shot: w.shot,
      saves: w.saves,
      caption: saved ? "Сейв! Дальше" : "Гол. Следующий удар",
    });
  };

  usePlayingLoop(playing, (dt) => {
    const w = world.current;
    if (w.over) return;

    if (w.phase === "wait") {
      w.wait -= dt;
      if (w.wait <= 0) {
        let lane = Math.floor(Math.random() * 3);
        if (lane === w.lastLane) lane = (lane + 1 + Math.floor(Math.random() * 2)) % 3;
        w.lastLane = lane;
        w.lane = lane;
        w.phase = "fly";
        w.fly = 0;
        w.answered = false;
        sfx.current?.kick();
        setView({
          phase: "fly",
          lane,
          shot: w.shot,
          saves: w.saves,
          caption: "Нажми, куда летит мяч",
        });
      }
      return;
    }

    if (w.phase !== "fly") return;
    w.fly += dt / FLY_SECONDS;
    const el = ballRef.current;
    if (el) el.style.top = `${14 + Math.min(1, w.fly) * 52}%`;
    if (w.fly >= 1) finishShot(false);
  });

  const tap = (lane) => {
    const w = world.current;
    if (!playing || w.over) return;
    if (performance.now() < readyAt.current) return;
    if (w.phase !== "fly" || w.answered) return;
    finishShot(lane === w.lane);
  };

  return (
    <Pitch>
      <p className="absolute inset-x-0 top-3 z-20 text-center text-lg font-extrabold text-white drop-shadow">
        Сейвы {view.saves} / {KEEPER_NEED}
      </p>
      <p className="absolute inset-x-3 top-11 z-20 text-center text-sm font-bold text-white/80">
        {view.caption}
      </p>

      <div className="absolute inset-x-0 top-20 right-0 bottom-0 z-10 grid grid-cols-3">
        {LANES.map((lane) => {
          const active = view.phase === "fly" && view.lane === lane.id;
          return (
            <button
              key={lane.id}
              type="button"
              disabled={!playing}
              onPointerDown={(event) => {
                event.preventDefault();
                tap(lane.id);
              }}
              className={`relative min-h-0 border-x border-white/10 ${
                active ? "bg-neon/15" : "bg-black/10 active:bg-white/10"
              }`}
            >
              {active ? (
                <span
                  ref={view.lane === lane.id ? ballRef : null}
                  className="pointer-events-none absolute left-1/2 text-5xl drop-shadow-md -translate-x-1/2"
                  style={{ top: "14%" }}
                >
                  ⚽
                </span>
              ) : null}
              <span className="absolute inset-x-2 bottom-[max(1.25rem,env(safe-area-inset-bottom))] rounded-xl bg-ink-950/55 py-3 text-base font-extrabold text-white backdrop-blur-sm sm:text-lg">
                {lane.label}
              </span>
            </button>
          );
        })}
      </div>
    </Pitch>
  );
}
