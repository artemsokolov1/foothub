/**
 * Мяч чуть меньше квадрата: по краям та же тёмная заливка, что в файле.
 */
export default function Logo({ compact = false, className = "", alt = "" }) {
  const box = compact
    ? "h-9 w-9 sm:h-10 sm:w-10"
    : "h-10 w-10 sm:h-11 sm:w-11";
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0a1628] p-[6px] sm:p-[7px] ${box} ${className}`}
    >
      <img
        src="/logo.png"
        alt={alt}
        width="44"
        height="44"
        className="h-full w-full object-contain"
      />
    </span>
  );
}
