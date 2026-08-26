import { BOOKMAKERS } from "../data/bookmakers";

/**
 * Акцентная контора на сайте — первая в списке (её карточка стоит
 * первой, у неё промокод). Две следующие — альтернативы.
 * Никаких своих сумм и ссылок: берём ровно то, что уже на карточках.
 */
export function getBonusOffers() {
  const [featured, ...rest] = BOOKMAKERS;
  return {
    featured,
    alternatives: rest.slice(0, 2),
  };
}
