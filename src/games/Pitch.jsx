/** Общий фон поля: небо + полосатый газон. */
export default function Pitch({ children }) {
  return (
    <div className="game-stage relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b2740] via-[#1f6a34] to-[#0e3a1b]" />
      <div
        className="absolute inset-x-0 bottom-0 h-[58%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #147a32 0 32px, #0f5c26 32px 64px)",
        }}
      />
      <div className="absolute inset-x-0 bottom-[58%] h-16 bg-gradient-to-b from-transparent to-black/20" />
      {children}
    </div>
  );
}
