import { KEEPER_NEED, KEEPER_SHOTS, KEEPYUP_TARGET } from "./rules";

/**
 * Карточки хаба. Правила должны совпадать с тем, что реально считает игра.
 * Константы побед — из rules.js, те же, что считают игры.
 */
export const GAMES = [
  {
    slug: "penalty",
    title: "Пенальти",
    tagline: "Забей с точки",
    rule: "Свайп задаёт угол и силу удара. Гол — победа, сейв или мимо — сразу ещё раз.",
    goal: "1 гол",
  },
  {
    slug: "keepyup",
    title: "Чеканка",
    tagline: "Не урони мяч",
    rule: `Тапай по мячу, чтобы держать его в воздухе. ${KEEPYUP_TARGET} касаний — победа, упал — сначала.`,
    goal: `${KEEPYUP_TARGET} касаний`,
  },
  {
    slug: "keeper",
    title: "Вратарь",
    tagline: "Отбей серию",
    rule: `Свайп влево, вправо или вверх — прыжок. Отбей ${KEEPER_NEED} удара из ${KEEPER_SHOTS}.`,
    goal: `${KEEPER_NEED} из ${KEEPER_SHOTS}`,
  },
];

export function gameBySlug(slug) {
  return GAMES.find((game) => game.slug === slug) ?? null;
}
