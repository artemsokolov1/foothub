import { Check, Copy, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBonusOffers } from "./offers";

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(field);
      return ok;
    } catch {
      return false;
    }
  }
}

function LogoMark({ bookmaker }) {
  const [hasLogo, setHasLogo] = useState(Boolean(bookmaker.logo));
  return (
    <div
      className={`flex h-14 items-center gap-3 rounded-xl bg-gradient-to-br ${bookmaker.accent} px-3`}
    >
      {hasLogo ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-1.5">
          <img
            src={bookmaker.logo}
            alt=""
            width="40"
            height="40"
            onError={() => setHasLogo(false)}
            className="h-full w-full object-contain"
          />
        </span>
      ) : null}
      <span className="truncate text-base font-extrabold text-white">
        {bookmaker.short}
      </span>
    </div>
  );
}

function PromoChip({ code }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-dashed border-flame/40 bg-flame/8 px-3 py-2">
        <span className="text-[10px] font-bold tracking-widest text-flame/80 uppercase">
          Промокод
        </span>
        <span className="truncate font-mono text-base font-extrabold tracking-wider text-flame">
          {code}
        </span>
      </div>
      <button
        type="button"
        onClick={async () => setCopied(await copyText(code))}
        aria-label={copied ? "Промокод скопирован" : `Скопировать промокод ${code}`}
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-ink-700 text-white/80"
      >
        {copied ? (
          <Check className="h-5 w-5 text-neon" strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <Copy className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/**
 * Победа: тот же оффер, что на главной. Никаких своих сумм и «начислений
 * на счёт сайта» — бонус выдаёт букмекер по своей ссылке.
 */
export default function BonusScreen({ onRetry }) {
  const { featured } = getBonusOffers();

  return (
    <div className="flex max-h-[min(92dvh,720px)] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-2xl border border-white/10 bg-ink-900/95 p-5 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.9)]">
      <div>
        <p className="text-xs font-bold tracking-widest text-neon uppercase">
          Победа
        </p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
          Бонус у букмекера
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-white/55">
          Оффер с сайта. Бонус начисляет контора, не мы. 18+.
        </p>
      </div>

      <LogoMark bookmaker={featured} />

      <p className="flex items-start gap-2 text-xl font-extrabold leading-tight">
        <Gift className="mt-0.5 h-5 w-5 shrink-0 text-neon" strokeWidth={2.4} aria-hidden="true" />
        {featured.bonus}
      </p>
      <p className="text-sm font-semibold text-white/50">{featured.name}</p>

      {featured.promo ? <PromoChip code={featured.promo} /> : null}

      <a
        href={featured.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-b from-neon to-neon-dim px-5 text-base font-extrabold text-ink-950 shadow-[0_8px_0_-2px_#4f7a10] transition-transform duration-150 active:translate-y-[3px] active:shadow-[0_5px_0_-2px_#4f7a10]"
      >
        Забрать бонус
      </a>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          to="/games"
          className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-sm font-extrabold text-white/80"
        >
          К играм
        </Link>
        <Link
          to="/#forecasts"
          className="flex min-h-11 flex-1 items-center justify-center rounded-xl text-sm font-extrabold text-white/55"
        >
          Смотреть прогнозы
        </Link>
      </div>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 text-sm font-semibold text-white/40"
        >
          Сыграть ещё раз
        </button>
      ) : null}
    </div>
  );
}
