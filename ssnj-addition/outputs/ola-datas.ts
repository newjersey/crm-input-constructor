const chalk = require('chalk');

import { OlaDatas } from './types';
import { Restaurant } from '../inputs/restaurants';

function selfIdentifyAs(restaurant: Restaurant): string {
  const SOLE_PROP_SMLLC_TEXT = 'Sole Prop or SMLLC';
  const designations: string = restaurant.form.RestaurantInformation_Designations;
  const solePropSmllc: boolean = restaurant.form.DocumentUploads_IsSolePropOrSMLLC === 'Yes';

  return `${designations}${designations ? ', ' : ''}${solePropSmllc ? SOLE_PROP_SMLLC_TEXT : ''}`;
}

export function generateOlaDatas(restaurants: Restaurant[]): OlaDatas {
  try {
    const olaDatas: OlaDatas = {
      SSNJRestaurants: restaurants.map(restaurant => ({
        ProductRecordId: 'PROD-XXXXXX', // TODO: 
        Name: restaurant.form.RestaurantInformation_RestaurantName,
        DoingBusinessAs: restaurant.form.RestaurantInformation_DBA,
        EIN: restaurant.form.RestaurantInformation_EIN,
        WebSiteURL: restaurant.form.RestaurantInformation_Website,
        NAICS: restaurant.form.NAICSCode,
        SelfIdentifyAs: selfIdentifyAs(restaurant),
        ExistsPriorFeb2020: restaurant.form.RestaurantInformation_OldEnough,
        FirstName: restaurant.form.AuthorizedRepresentative_Name_First,
        LastName: restaurant.form.AuthorizedRepresentative_Name_Last,
        Title: restaurant.form.AuthorizedRepresentative_Title,
        Phone: restaurant.form.AuthorizedRepresentative_Phone,
        Cell: restaurant.form.AuthorizedRepresentative_AlternatePhone,
        Email: restaurant.form.AuthorizedRepresentative_Email,
        address1Line1: restaurant.form.RestaurantInformation_PrimaryBusinessAddress_Line1,
        address1Line2: restaurant.form.RestaurantInformation_PrimaryBusinessAddress_Line2,
        address1City: restaurant.form.RestaurantInformation_PrimaryBusinessAddress_City,
        address1Zip: restaurant.form.RestaurantInformation_PrimaryBusinessAddress_PostalCode,
        address1State: 'NJ',
        address1County: '',
        address2Line1: '',
        address2Line2: '',
        address2City: '',
        address2Zip: '',
        address2State: '',
        address2County: '',
        NegativeImpacts: restaurant.form.COVID19HarmAttestation_NegativeImpacts,
        ExplainNegativeImpacts: restaurant.form.COVID19HarmAttestation_Explanation,
        TotalFTECountfromWR30: 0, // TODO: get from Bruce, calculate
        Status: 'In Review',
        Findings: '', // staff to complete manually
      })),
    };

    return olaDatas;
  } catch (e) {
    console.error(
      chalk.red(
        `Error found while generating OLA Datas:`
      )
    );
    console.dir(e, { depth: null });

    throw e;
  }
}
