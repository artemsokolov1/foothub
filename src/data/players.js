/** Оценка годового дохода по открытым обзорам Forbes. Только для шутки на главной. */
export const USD_RUB = 84.28; // курс ЦБ РФ на 27.08.2026
export const SECONDS_PER_YEAR = 365.25 * 24 * 3600;

export const PLAYERS = [
  {
    id: "ronaldo",
    name: "Криштиану Роналду",
    club: "Аль-Наср",
    usdPerYear: 300_000_000,
    photo: "/players/ronaldo.jpg",
  },
  {
    id: "messi",
    name: "Лионель Месси",
    club: "Интер Майами",
    usdPerYear: 140_000_000,
    photo: "/players/messi.jpg",
  },
  {
    id: "mbappe",
    name: "Килиан Мбаппе",
    club: "Реал Мадрид",
    usdPerYear: 95_000_000,
    photo: "/players/mbappe.jpg",
  },
];

export function rubPerSecond(usdPerYear) {
  return (usdPerYear / SECONDS_PER_YEAR) * USD_RUB;
}
