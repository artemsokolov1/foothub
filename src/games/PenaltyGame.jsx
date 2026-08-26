import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Pitch from "./Pitch";
import { buzz, useSfx } from "./sfx";

const CELLS = [
  { id: "tl", label: "Левый верх" },
  { id: "tm", label: "Центр верх" },
  { id: "tr", label: "Правый верх" },
  { id: "bl", label: "Левый низ" },
  { id: "bm", label: "Центр низ" },
  { id: "br", label: "Правый низ" },
];

const KEEPER_SPOT = {
  tl: { left: "16.6%", top: "28%" },
  tm: { left: "50%", top: "28%" },
  tr: { left: "83.3%", top: "28%" },
  bl: { left: "16.6%", top: "78%" },
  bm: { left: "50%", top: "78%" },
  br: { left: "83.3%", top: "78%" },
  idle: { left: "50%", top: "52%" },
};

function KeeperFigure() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2">
      <div className="flex flex-col items-center">
        <div className="h-7 w-7 rounded-full bg-[#e0b089] ring-2 ring-black/20" />
        <div className="mt-0.5 flex h-11 w-12 flex-col items-center rounded-md bg-neon shadow-[0_4px_0_#4f7a10]">
          <div className="mt-1 h-1.5 w-6 rounded-full bg-ink-950/20" />
        </div>
        <div className="-mt-3 flex w-20 justify-between">
          <span className="h-5 w-6 rounded-full bg-white shadow" />
          <span className="h-5 w-6 rounded-full bg-white shadow" />
        </div>
      </div>
    </div>
  );
}

export default function PenaltyGame({ status, onWin, onLose, onHud }) {
  const playing = status === "playing";
  const sfx = useSfx();
  const stageRef = useRef(null);
  const cellRefs = useRef({});
  const resolved = useRef(false);
  const flyTimer = useRef(0);
  const [pick, setPick] = useState(null);
  const [dive, setDive] = useState("idle");
  const [ball, setBall] = useState({ x: 0, y: 0 });
  const [caption, setCaption] = useState("Нажми на клетку ворот");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const placeBall = () => {
      setBall({ x: stage.clientWidth / 2, y: stage.clientHeight * 0.84 });
    };
    placeBall();
    const observer = new ResizeObserver(placeBall);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onHud?.({ progress: "1 удар", hint: "Нажми на клетку ворот" });
  }, [onHud]);

  const shoot = (id) => {
    if (!playing || resolved.current || pick) return;
    const stage = stageRef.current?.getBoundingClientRect();
    const cell = cellRefs.current[id]?.getBoundingClientRect();
    if (!stage || !cell) return;
    resolved.current = true;

    const keeperId = CELLS[Math.floor(Math.random() * CELLS.length)].id;
    setPick(id);
    setDive(keeperId);
    setCaption("Удар!");
    setBall({
      x: cell.left - stage.left + cell.width / 2,
      y: cell.top - stage.top + cell.height / 2,
    });
    sfx.current?.kick();
    buzz(12);

    window.clearTimeout(flyTimer.current);
    flyTimer.current = window.setTimeout(() => {
      const saved = id === keeperId;
      if (saved) {
        sfx.current?.save();
        setCaption("Вратарь взял");
        onHud?.({ banner: "Сейв" });
        onLose?.("Вратарь взял");
      } else {
        sfx.current?.goal();
        setCaption("Гол!");
        onHud?.({ banner: "Гол!" });
        onWin?.();
      }
    }, 520);
  };

  useEffect(() => () => window.clearTimeout(flyTimer.current), []);

  const keeperPos = KEEPER_SPOT[dive] ?? KEEPER_SPOT.idle;

  return (
    <div ref={stageRef} className="h-full w-full">
      <Pitch>
        <div className="absolute top-[8%] right-4 left-4 mx-auto max-w-[440px]">
          <div className="relative overflow-hidden rounded-b-sm border-[9px] border-t-[12px] border-white/90 bg-white/10 shadow-[0_12px_30px_-18px_black]">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
            <div className="relative grid aspect-[3/1.85] min-h-[200px] grid-cols-3 grid-rows-2 gap-[3px] bg-white/55">
              {CELLS.map((cell) => {
                const chosen = pick === cell.id;
                const keeperHere = dive === cell.id;
                return (
                  <button
                    key={cell.id}
                    type="button"
                    ref={(node) => {
                      cellRefs.current[cell.id] = node;
                    }}
                    aria-label={cell.label}
                    disabled={!playing || Boolean(pick)}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      shoot(cell.id);
                    }}
                    className={`relative z-10 min-h-16 transition-colors ${
                      chosen
                        ? "bg-neon/45"
                        : keeperHere && pick
                          ? "bg-flame/35"
                          : "bg-black/25 active:bg-white/25"
                    }`}
                  />
                );
              })}
            </div>
            <motion.div
              className="pointer-events-none absolute z-20"
              initial={false}
              animate={{ left: keeperPos.left, top: keeperPos.top }}
              transition={{ duration: 0.34, ease: "easeOut" }}
            >
              <KeeperFigure />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="pointer-events-none absolute z-30 text-5xl drop-shadow-md sm:text-6xl"
          initial={false}
          animate={{ x: ball.x, y: ball.y, scale: pick ? 0.62 : 1 }}
          transition={{ duration: pick ? 0.48 : 0, ease: [0.2, 0.75, 0.2, 1] }}
          style={{ left: 0, top: 0, opacity: ball.x ? 1 : 0 }}
        >
          <span className="block -translate-x-1/2 -translate-y-1/2">⚽</span>
        </motion.div>

        <p className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-20 text-center text-lg font-extrabold tracking-tight text-white drop-shadow sm:text-xl">
          {caption}
        </p>
      </Pitch>
    </div>
  );
}
