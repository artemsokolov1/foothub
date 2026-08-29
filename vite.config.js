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
/** Страница «не найдено» из той же оболочки: шапка, объяснение, ссылки. */
function notFoundPage(html) {
  const title = "Страница не найдена — FootHub";
  const body = `
      <main style="max-width:44rem;margin:0 auto;padding:6rem 1.25rem;font-family:system-ui,sans-serif;color:#eef1f6">
        <p style="font-size:.8rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#b6ff3c;margin:0 0 .75rem">Ошибка 404</p>
        <h1 style="font-size:2rem;line-height:1.15;margin:0 0 1rem">Такой страницы нет</h1>
        <p style="color:#ffffffa6;line-height:1.6;margin:0 0 1.75rem">
          Возможно, вы пришли по старой ссылке: раньше на этом домене был другой сайт.
          Сейчас здесь FootHub — бесплатные прогнозы на футбол, хоккей и киберспорт.
        </p>
        <p style="display:flex;flex-wrap:wrap;gap:.75rem;margin:0">
          <a href="/" style="padding:.85rem 1.4rem;border-radius:.9rem;background:#b6ff3c;color:#050608;font-weight:800;text-decoration:none">На главную</a>
          <a href="/football" style="padding:.85rem 1.4rem;border-radius:.9rem;border:1px solid #ffffff24;color:#fff;font-weight:700;text-decoration:none">Прогнозы на футбол</a>
          <a href="/hockey" style="padding:.85rem 1.4rem;border-radius:.9rem;border:1px solid #ffffff24;color:#fff;font-weight:700;text-decoration:none">Хоккей</a>
        </p>
      </main>`;
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/s,
      '<meta name="robots" content="noindex, follow" />')
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, "")
    .replace(/<div id="root"><\/div>/, body);
}

/**
 * Список матчей раздела прямо в HTML. Без него до выполнения 414 КБ JS на
 * экране пусто: замер на дросселированном телефоне дал первый кадр 1380 мс
 * и полную загрузку 2.2 с, и владелец справедливо назвал это долгим.
 *
 * React при монтировании заменит эту разметку своей — содержимое то же,
 * данные те же самые, `express.json` собирается в бандл из этого же файла.
 * Заодно это единственный контент раздела, который видит Яндекс: он почти
 * не исполняет JS (ADR-143).
 */
function prerenderMatches(route) {
  let data;
  try {
    data = JSON.parse(readFileSync("src/data/express.json", "utf8"))[route];
  } catch {
    return "";
  }
  const rows = (data && data.matches) || [];
  if (!rows.length) return "";
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const items = rows
    .slice(0, 12)
    .map((m) => {
      const title = `${esc(m.home)} — ${esc(m.away)}`;
      const meta = [esc(m.game || ""), esc(m.league || "")].filter(Boolean).join(" · ");
      const when = m.kickoff ? `${esc(m.kickoff)} МСК` : "";
      const inner =
        `<p style="margin:0 0 .25rem;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#b6ff3c">${meta}` +
        (when ? `<span style="float:right;color:#ffffff66;letter-spacing:0">${when}</span>` : "") +
        `</p><p style="margin:0;font-size:1.05rem;font-weight:800">${title}</p>`;
      return m.page
        ? `<li><a href="${esc(m.page)}" style="display:block;padding:1rem;border-radius:1rem;border:1px solid #ffffff14;background:#0a0c10cc;color:#eef1f6;text-decoration:none">${inner}</a></li>`
        : `<li style="padding:1rem;border-radius:1rem;border:1px solid #ffffff14;background:#0a0c10cc">${inner}</li>`;
    })
    .join("");
  return `<ul style="list-style:none;margin:0;padding:0;display:grid;gap:.75rem">${items}</ul>`;
}

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
        /<div id="root"><\/div>/,
        `<div id="root"><main style="max-width:64rem;margin:0 auto;padding:3rem 1rem;` +
          `font-family:system-ui,sans-serif;color:#eef1f6">` +
          `<h1 style="font-size:1.9rem;line-height:1.15;margin:0 0 .6rem">${meta.heading}</h1>` +
          `<p style="color:#ffffffa6;margin:0 0 1.75rem">${meta.description}</p>` +
          `${prerenderMatches(route)}</main></div>`,
      );
  };

  return {
    name: "spa-fallbacks",
    closeBundle() {
      const index = "dist/index.html";
      const html = readFileSync(index, "utf8");
      // 404 — своя страница, а не копия главной. Домен раньше принадлежал
      // сайту с онлайн-счётом матчей, и Google до сих пор шлёт людей на его
      // адреса. Показывать им главную без объяснений — значит терять их же:
      // человек искал счёт матча, а попал на непонятную витрину.
      // noindex обязателен: страница не должна попасть в выдачу сама.
      writeFileSync("dist/404.html", notFoundPage(html));
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
