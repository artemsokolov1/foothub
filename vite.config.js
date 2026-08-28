import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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

// Мета-теги разделов. Без них все копии index.html несли один и тот же
// title и canonical на "/", то есть сами вычёркивали себя из индекса: для
// поисковика это была одна страница в четырёх адресах. Особенно бьёт по
// Яндексу — он почти не исполняет JS и видит только эту заготовку.
const ROUTE_META = {
  football: {
    title: "Прогнозы на футбол сегодня — бесплатно | FootHub",
    description:
      "Бесплатные прогнозы на футбол на сегодня: матчи дня, ставки экспертов и коэффициенты. Смотри разбор каждого матча и забирай фрибет.",
    heading: "Прогнозы на футбол сегодня",
  },
  hockey: {
    title: "Прогнозы на хоккей и КХЛ сегодня — бесплатно | FootHub",
    description:
      "Бесплатные прогнозы на хоккей: матчи КХЛ на сегодня, ставки и коэффициенты. Разбор каждой игры и бонусы букмекеров.",
    heading: "Прогнозы на хоккей и КХЛ сегодня",
  },
  esports: {
    title: "Прогнозы на киберспорт: CS2 и Dota 2 сегодня | FootHub",
    description:
      "Прогнозы на киберспорт на сегодня: матчи CS2 и Dota 2, коэффициенты и разборы. Свежие ставки каждый день.",
    heading: "Прогнозы на киберспорт сегодня",
  },
  games: {
    title: "Мини-игры про футбол — играть бесплатно | FootHub",
    description:
      "Бесплатные мини-игры про футбол: говорящий Бен, кубик и «кто выиграет». Без регистрации, прямо в браузере. 18+, для развлечения.",
    heading: "Мини-игры про футбол",
  },
};

/**
 * GitHub Pages не умеет rewrite: копии index.html на вложенных путях и 404.
 *
 * Копия раздела получает свои title, description и canonical, а также
 * заголовок в <noscript> — краулеру без JS иначе достаётся пустой <div>.
 */
function spaFallbacks() {
  const swap = (html, route, meta) => {
    const url = `https://foothub.ru/${route}`;
    return html
      .replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`)
      .replace(
        /(<meta\s+name="description"\s+content=")[^"]*(")/s,
        `$1${meta.description}$2`,
      )
      .replace(
        /(<link rel="canonical" href=")[^"]*(")/,
        `$1${url}$2`,
      )
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${meta.title}$2`)
      .replace(
        /(<div id="root">)/,
        `<noscript><h1>${meta.heading}</h1><p>${meta.description}</p></noscript>$1`,
      );
  };

  return {
    name: "spa-fallbacks",
    closeBundle() {
      const index = "dist/index.html";
      const html = readFileSync(index, "utf8");
      copyFileSync(index, "dist/404.html");
      for (const rel of ["games", "games/yesno", "games/dice", "games/winner", "football", "hockey", "esports"]) {
        mkdirSync(join("dist", rel), { recursive: true });
        const meta = ROUTE_META[rel];
        if (meta) writeFileSync(join("dist", rel, "index.html"), swap(html, rel, meta));
        else copyFileSync(index, join("dist", rel, "index.html"));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), dropInternalFiles(), spaFallbacks()],
  base: "/",
});
