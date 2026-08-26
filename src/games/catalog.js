export const GAMES = [
  {
    slug: "yesno",
    title: "Да или нет",
    tagline: "Тапни пса — он ответит",
    rule: "Задай вопрос про себя и тапни пса. Он скажет «да» или «нет». Это шутка, не прогноз.",
    goal: "Один ответ",
  },
  {
    slug: "dice",
    title: "Кубик",
    tagline: "Кинь кубик",
    rule: "Нажми на кубик. Выпадет число от 1 до 6. Для развлечения, не ставка.",
    goal: "Один бросок",
  },
  {
    slug: "winner",
    title: "Кто выиграет",
    tagline: "Впиши команды",
    rule: "Напиши две команды и нажми. Случайным образом выберется «победитель». Это не прогноз на матч.",
    goal: "Один выбор",
  },
];

export function gameBySlug(slug) {
  return GAMES.find((game) => game.slug === slug) ?? null;
}
