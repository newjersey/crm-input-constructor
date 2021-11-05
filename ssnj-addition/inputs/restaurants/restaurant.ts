import { RestaurantReview, getRestaurantReviews } from './restaurant-review';
import { RestaurantForm, makeGetRestaurantForm } from './restaurant-form';
import { RestaurantAddition, makeGetRestaurantAddition } from './restaurant-addition';
import { Applicant, makeGetApplicant } from '../crm/applicant';

export default interface Restaurant {
  readonly review: RestaurantReview;
  readonly form: RestaurantForm;
  readonly addition: RestaurantAddition;
  readonly applicant: Applicant;
}

export function getRestaurants(
  applicantsFilePath: string,
  restaurantAdditionsFilePath: string,
  restaurantFormsFilePath: string,
  restaurantReviewsFilePath: string,
  min: number,
  max: number
): Restaurant[] {
  console.log(`Loading restaurants from review entries ${min} to ${max}...`);

  const getApplicant = makeGetApplicant(applicantsFilePath);
  const getRestaurantAddition = makeGetRestaurantAddition(restaurantAdditionsFilePath);
  const getRestaurantForm = makeGetRestaurantForm(restaurantFormsFilePath);
  const restaurantReviews = getRestaurantReviews(restaurantReviewsFilePath)
    // limit
    .filter(review => {
      const reviewEntryNumber = parseInt(review.SSNJRestaurantAdditionReview_Id, 10);
      return reviewEntryNumber >= min && reviewEntryNumber <= max;
    })
    // dedupe (same form reviewed multiple times)
    // https://stackoverflow.com/questions/2218999/how-to-remove-all-duplicates-from-an-array-of-objects
    .filter(
      (review, index, self) =>
        self.findIndex(
          r => r.Inputs_RestaurantAdditionForm === review.Inputs_RestaurantAdditionForm
        ) === index
    );

  return restaurantReviews.map(review => {
    const form = getRestaurantForm(review.Inputs_RestaurantAdditionForm);
    const addition = getRestaurantAddition(form.Inputs_Addition);
    const applicant = getApplicant(addition.Organization_EIN);

    return {
      review,
      form,
      addition,
      applicant,
    };
  });
}
