const chalk = require('chalk');

import { OlaDatas } from './types';
import { RestaurantRow } from '../inputs/restaurants/xlsx';
import { getFindings } from './helpers';

export function generateOlaDatas(restaurantRows: RestaurantRow[]): OlaDatas {
  try {
    const olaDatas: OlaDatas = {
      SSNJRestaurants: restaurantRows.map(restaurant => ({
        ProductRecordId: restaurant.PROD_ID,
        Name: restaurant.Restaurant_Name,
        DoingBusinessAs: restaurant.Restaurant_DBA,
        EIN: restaurant.Restaurant_SSN,
        WebSiteURL: restaurant.WebSiteURL,
        NAICS: restaurant.NAICS,
        SelfIdentifyAs: restaurant.SelfIdentifyAs,
        ExistsPriorFeb2020: restaurant.ExistsPriorFeb2020,
        FirstName: restaurant.FirstName,
        LastName: restaurant.LastName,
        Title: restaurant.Title,
        Phone: restaurant.Phone,
        Cell: restaurant.AlternatePhone,
        Email: restaurant.Email,
        address1Line1: restaurant.Address1,
        address1Line2: restaurant.Address2,
        address1City: restaurant.City,
        address1Zip: restaurant.Zip,
        address1State: 'NJ',
        address1County: '',
        address2Line1: '',
        address2Line2: '',
        address2City: '',
        address2Zip: '',
        address2State: '',
        address2County: '',
        NegativeImpacts: restaurant.NegativeImpacts,
        ExplainNegativeImpacts: restaurant.ExplainNegativeImpacts,
        TotalFTECountfromWR30: restaurant.Restaurant_FTE,
        Status: 'In Review',
        Findings: getFindings(restaurant),
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
