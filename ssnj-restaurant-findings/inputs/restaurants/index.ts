import { getRows, RestaurantRow } from './xlsx';
import { Dol } from './dol';
import { Sams } from './sams';
import { Taxation } from './taxation';
import { WR30 } from './wr30';

// TODO -- kill all readonly (replace with Readonly<T>)
export interface Restaurant extends RestaurantRow {}
export type DecoratedRestaurant = Restaurant & Dol & Taxation & Sams & WR30;
export interface Restaurants {
  readonly restaurants: Restaurant[];
}

export function getRestaurants(path: string): Restaurant[] {
  console.log('Loading restaurants...');
  const rows: RestaurantRow[] = getRows(path);
  const restaurants: Restaurant[] = rows;
  return restaurants;
}
