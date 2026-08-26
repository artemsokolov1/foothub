import { useEffect, useRef } from "react";

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

export function buzz(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* в Telegram на iOS вибрации нет — это не ошибка. */
  }
}

export function useSfx() {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = createSfx();
    return () => {
      ref.current?.dispose();
      ref.current = null;
    };
  }, []);
  return ref;
}
