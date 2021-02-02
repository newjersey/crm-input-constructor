import { getRows, RestaurantRow } from './xlsx';
import { Dol } from './dol';
import { Sams } from './sams';
import { Taxation } from './taxation';
import { WR30 } from './wr30';
import { Application } from '../applications';
import { getReviews } from './reviews';

export { Designations, YesNo } from './xlsx';

// TODO -- kill all readonly (replace with Readonly<T>)
export interface Restaurant extends RestaurantRow {}

export type DecoratedRestaurant = Restaurant & Dol & Taxation & Sams;
// & WR30

export interface Restaurants {
  readonly restaurants: DecoratedRestaurant[];
}

export function getRestaurants(path: string): Restaurant[] {
  console.log('Loading restaurants...');
  const rows: RestaurantRow[] = getRows(path);
  const reviews = getReviews(path);
  const restaurants: Restaurant[] = rows;
  const reviewedRestaurants = restaurants.filter(restaurant => {
    const reviewed: boolean = reviews
      .map(review => review.Inputs_RestaurantForm)
      .includes(restaurant.SSNJRestaurantForm_Id);

      if (!reviewed) {
        console.log(`Skipping unreviewed restaurant form ${restaurant.SSNJRestaurantForm_Id}`);
      }

      return reviewed;
  });
  const dedupedReviewedRestaurants: Restaurant[] = [];

  // remove duplicate submissions by same restaurant for same applicant
  [...reviewedRestaurants]
    .sort((a, b) => a.Entry_DateSubmitted - b.Entry_DateSubmitted)
    .forEach(restaurant => {
      const dup = dedupedReviewedRestaurants.filter(
        r =>
          r.Inputs_Application === restaurant.Inputs_Application &&
          r.Inputs_RestaurantIndex === restaurant.Inputs_RestaurantIndex
      )[0];

      if (dup) {
        console.log(
          `Skipping duplicate restaurant form ${restaurant.SSNJRestaurantForm_Id} in favor of ${dup.SSNJRestaurantForm_Id}`
        );
      } else {
        dedupedReviewedRestaurants.push(restaurant);
      }
    });

  return dedupedReviewedRestaurants;
}

export function makeAddRestaurants(allRestaurants: DecoratedRestaurant[]) {
  const addRestaurants = function <T extends Application>(application: T): T & Restaurants {
    const restaurants: DecoratedRestaurant[] = allRestaurants.filter(
      restaurant => restaurant.Inputs_Application === application.SSNJGrantApplication_Id
    );

    return { ...application, restaurants };
  };

  return addRestaurants;
}
