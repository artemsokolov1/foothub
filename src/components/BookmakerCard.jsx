import { motion } from "framer-motion";
import { Check, Copy, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import TiltCard from "./TiltCard";

/** Копирование промокода. Возвращает false, если браузер не дал доступ. */
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Старые браузеры и http без TLS: запасной путь через скрытое поле.
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

function PromoField({ code }) {
  const [copied, setCopied] = useState(false);

  // Галочка держится две секунды и гаснет. Таймер снимается при размонтаже,
  // иначе React ругается на обновление ушедшего компонента.
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
        className="flex w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-ink-700 text-white/80 transition-colors hover:border-flame/50 hover:text-flame focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame"
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
 * Карточка одного букмекера.
 *
 * Порядок внутри карточки — это порядок чтения: чей бонус, какой бонус,
 * промокод, кнопка. Сумма бонуса — самое крупное в карточке после названия:
 * ради неё сюда и приходят.
 */
export default function BookmakerCard({ bookmaker, index }) {
  const { name, short, bonus, promo, url, accent, logo } = bookmaker;
  // Файла может не быть — тогда карточка обходится одним названием.
  // Проверка нужна именно такая: <img> с битым src рисует иконку разрыва,
  // и это выглядит хуже, чем отсутствие картинки.
  const [hasLogo, setHasLogo] = useState(Boolean(logo));

  return (
    <motion.li
      initial={{ y: 26, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="list-none"
    >
      <TiltCard className="h-full">
        <div className="edge-glow flex h-full flex-col gap-4 rounded-2xl border border-white/8 bg-ink-900/80 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/15 hover:shadow-[0_26px_50px_-24px_rgba(0,0,0,0.95)] sm:p-6">
          {/* Фирменная плашка: слева логотип на белом кружке, справа название.
              Белая подложка не украшение — логотипы у БК разного цвета, и без
              неё тёмные сливались бы с градиентом. */}
          <div
            className={`flex h-16 items-center gap-3 rounded-xl bg-gradient-to-br ${accent} px-4`}
            style={{ transform: "translateZ(28px)" }}
          >
            {hasLogo ? (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-1.5 shadow-[0_3px_10px_-3px_rgba(0,0,0,0.6)]">
                <img
                  src={logo}
                  alt=""
                  width="44"
                  height="44"
                  loading="lazy"
                  onError={() => setHasLogo(false)}
                  className="h-full w-full object-contain"
                />
              </span>
            ) : null}
            <span
              className={`truncate text-lg font-extrabold tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:text-xl ${
                hasLogo ? "" : "w-full text-center"
              }`}
            >
              {short}
            </span>
          </div>

          <div style={{ transform: "translateZ(18px)" }}>
            <p className="text-sm font-semibold text-white/50">{name}</p>
            <p className="mt-1 flex items-start gap-2 text-xl leading-tight font-extrabold text-white sm:text-2xl">
              <Gift
                className="mt-0.5 h-5 w-5 shrink-0 text-neon"
                strokeWidth={2.4}
                aria-hidden="true"
              />
              {bonus}
            </p>
          </div>

          {promo ? <PromoField code={promo} /> : null}

          {/* mt-auto прижимает кнопку к низу: в ряду карточки разной высоты,
              а кнопки обязаны стоять на одной линии. */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-auto flex items-center justify-center rounded-xl bg-gradient-to-b from-neon to-neon-dim px-5 py-3.5 text-base font-extrabold text-ink-950 shadow-[0_8px_0_-2px_#4f7a10] transition-transform duration-150 active:translate-y-[3px] active:shadow-[0_5px_0_-2px_#4f7a10] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-neon"
            style={{ transform: "translateZ(24px)" }}
          >
            Забрать бонус
          </a>
        </div>
      </TiltCard>
    </motion.li>
  );
}
