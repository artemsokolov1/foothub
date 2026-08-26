import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

// Tailwind 4 подключается плагином, отдельного конфига и postcss не нужно.
// base: "/" — игры живут на вложенных путях (/games/penalty). Относительный
// "./" ломал бы ассеты: браузер искал бы JS в /games/assets/. Сайт на корне
// домена, так что абсолютный префикс здесь правильный.

/**
 * Выкидывает из сборки служебные файлы, которые лежат в public/ для нас,
 * а не для посетителей: заметки о том, куда класть логотипы, и мусор
 * *:Zone.Identifier, который WSL создаёт при копировании из проводника.
 *
 * Vite копирует public/ целиком, поэтому фильтровать приходится после.
 * В репозитории эти файлы остаются — они полезны владельцу.
 */
function dropInternalFiles() {
  const isInternal = (name) =>
    name === "README.txt" || name.endsWith(":Zone.Identifier");

  const sweep = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) sweep(path);
      else if (isInternal(entry.name)) rmSync(path);
    }
  };

  return {
    name: "drop-internal-files",
    closeBundle() {
      sweep("dist");
    },
  };
}

/** GitHub Pages не умеет rewrite: копии index.html на вложенных путях и 404. */
function spaFallbacks() {
  return {
    name: "spa-fallbacks",
    closeBundle() {
      const index = "dist/index.html";
      copyFileSync(index, "dist/404.html");
      for (const rel of ["games", "games/penalty", "games/keepyup", "games/keeper", "hockey", "esports"]) {
        mkdirSync(join("dist", rel), { recursive: true });
        copyFileSync(index, join("dist", rel, "index.html"));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), dropInternalFiles(), spaFallbacks()],
  base: "/",
});
