import { RestaurantForm, getRestaurantForms } from './restaurant-form';
import { RestaurantReview, getRestaurantReviews } from './restaurant-review';

export default interface Restaurant {
  readonly form: RestaurantForm;
  readonly review: RestaurantReview;
}

export function getRestaurants(
  restaurantFormsFilePath: string,
  restaurantReviewsFilePath: string
): Restaurant[] {
  console.log('Loading restaurants...');
  
  const allRestaurantForms = getRestaurantForms(restaurantFormsFilePath);
  const allRestaurantReviews = getRestaurantReviews(restaurantReviewsFilePath);
  const restaurants: Restaurant[] = allRestaurantReviews.map(review => {
    const form = allRestaurantForms.find(
      restaurantForm =>
        restaurantForm.SSNJRestaurantAdditionForm_Id === review.Inputs_RestaurantAdditionForm
    );

    if (!form) {
      throw new Error(
        `Could not find RestaurantForm ${review.Inputs_RestaurantAdditionForm} for RestaurantReview ${review.SSNJRestaurantAdditionReview_Id}`
      );
    }

    return {
      form,
      review,
    };
  });

  return restaurants;
}
