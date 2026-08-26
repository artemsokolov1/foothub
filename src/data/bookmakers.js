// Единственное место, где живут офферы. Меняется только здесь — вёрстка
// подстраивается сама. Порядок в массиве = порядок на сайте.
//
// accent — фирменный градиент плашки.
// logo  — файл в public/bk/. Нет файла — карточка спокойно обойдётся одним
//         названием: картинка подставляется с проверкой, а не молча ломается.
export const BOOKMAKERS = [
  {
    id: "pari",
    logo: "/bk/pari.png",
    name: "БК Пари",
    short: "PARI",
    bonus: "Фрибет 5.000 ₽",
    promo: "FOOTHUB",
    url: "https://clck.ru/3AkptD",
    accent: "from-[#ff4d4d] to-[#b81d1d]",
  },
  {
    id: "fonbet",
    logo: "/bk/fonbet.png",
    name: "БК Фонбет",
    short: "ФОНБЕТ",
    bonus: "Фрибет до 15.000 ₽",
    promo: null,
    url: "https://clck.ru/3PMdPB",
    accent: "from-[#2f7bff] to-[#0f3fa8]",
  },
  {
    id: "winline",
    logo: "/bk/winline.png",
    name: "Winline",
    short: "WINLINE",
    bonus: "Фрибет 10.000 ₽",
    promo: null,
    url: "https://betsxwin.pro/click?o=5&a=9120",
    accent: "from-[#ffb020] to-[#c76a00]",
  },
  {
    id: "betcity",
    logo: "/bk/betcity.png",
    name: "БЕТСИТИ",
    short: "БЕТСИТИ",
    bonus: "Бонус на депозит",
    promo: null,
    url: "https://betsxwin.pro/click?o=143&a=9120",
    accent: "from-[#39d98a] to-[#0f7a49]",
  },
  {
    id: "leon",
    logo: "/bk/leon.png",
    name: "Леон",
    short: "ЛЕОН",
    bonus: "Бонус на депозит",
    promo: null,
    url: "https://betsxwin.pro/click?o=145&a=9120",
    accent: "from-[#7a5cff] to-[#3a1fb8]",
  },
  {
    id: "zenit",
    logo: "/bk/zenit.png",
    name: "Зенит",
    short: "ЗЕНИТ",
    bonus: "Бонус на депозит",
    promo: null,
    url: "https://betsxwin.pro/click?o=226&a=9120",
    accent: "from-[#2ec5ff] to-[#0a6ea8]",
  },
];

export const CHANNELS = {
  telegram: "https://t.me/foothubru",
  max: "https://max.ru/channel_foothubru",
};
