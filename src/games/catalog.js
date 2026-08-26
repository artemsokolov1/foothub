import { KEEPER_NEED, KEEPER_SHOTS, KEEPYUP_TARGET } from "./rules";

/**
 * Карточки хаба. Правила должны совпадать с тем, что реально считает игра.
 * Константы побед — из rules.js, те же, что считают игры.
 */
export const GAMES = [
  {
    slug: "penalty",
    title: "Пенальти",
    tagline: "Нажми, куда бить",
    rule: "Нажми на клетку ворот. Вратарь прыгает наугад. Если ты попал не туда, куда он — это гол.",
    goal: "1 гол",
  },
  {
    slug: "keepyup",
    title: "Чеканка",
    tagline: "Тапай — и мяч в воздухе",
    rule: `Тапай по экрану, чтобы мяч не упал. ${KEEPYUP_TARGET} раз подряд — победа.`,
    goal: `${KEEPYUP_TARGET} касаний`,
  },
  {
    slug: "keeper",
    title: "Вратарь",
    tagline: "Нажми, куда летит",
    rule: `Мяч летит влево, в центр или вправо. Нажми ту же сторону. Нужно ${KEEPER_NEED} сейва из ${KEEPER_SHOTS}.`,
    goal: `${KEEPER_NEED} из ${KEEPER_SHOTS}`,
  },
];

export function gameBySlug(slug) {
  return GAMES.find((game) => game.slug === slug) ?? null;
}
