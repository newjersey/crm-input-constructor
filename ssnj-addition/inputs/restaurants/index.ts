import { getRows, RestaurantRow } from './xlsx';

// TODO -- kill all readonly (replace with Readonly<T>)
export interface Restaurant extends RestaurantRow {}
export interface Restaurants {
  readonly restaurants: Restaurant[];
}

export function getRestaurants(path: string): Restaurant[] {
  console.log('Loading restaurants...');
  return getRows(path);
}
