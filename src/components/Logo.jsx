/**
 * Отдельная шапочная иконка: мяч меньше квадрата, заливка как в файле (#0c2230).
 * Оригинал /logo.png не трогаем — он для favicon и превью.
 */
export default function Logo({ compact = false, className = "", alt = "" }) {
  const box = compact
    ? "h-9 w-9 sm:h-10 sm:w-10"
    : "h-10 w-10 sm:h-11 sm:w-11";
  return (
    <img
      src="/logo-mark.png"
      alt={alt}
      width="44"
      height="44"
      className={`shrink-0 rounded-xl object-cover ${box} ${className}`}
    />
  );
}
