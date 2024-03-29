const chalk = require('chalk');

import { OlaDatas, Status } from './types';
import { Restaurant } from '../inputs/restaurants';
import { WR30 } from '../inputs/staff/wr30';
import { getQuarterlyWageData, dateFromExcel } from './helpers';

type RestaurantWithWr30 = Restaurant & WR30;

function selfIdentifyAs(restaurant: Restaurant): string {
  const DELIMITER = ', ';
  const SOLE_PROP_SMLLC_TEXT = 'Sole Prop or SMLLC';
  const designations: string = restaurant.form.RestaurantInformation_Designations;
  const identities: string[] = designations.split(DELIMITER).filter(s => !!s);
  const isSolePropOrSmllc: boolean = restaurant.form.DocumentUploads_IsSolePropOrSMLLC === 'Yes';

  if (isSolePropOrSmllc) {
    identities.push(SOLE_PROP_SMLLC_TEXT);
  }

  return identities.join(DELIMITER);
}

function getStatus(restaurant: Restaurant): Status {
  switch (restaurant.manualReview.Eligibility) {
    case 'In Review':
      return Status.InReview;
    case 'Eligible':
      return Status.Eligible;
    case 'Ineligible':
      return Status.Ineligible;
    default:
      throw new Error(`Unexpected status: ${restaurant.manualReview.Eligibility}`);
  }
}

function getFindings(restaurant: Restaurant): string {
  const findings = restaurant.manualReview.Findings;
  const type = typeof findings;

  switch (type) {
    case 'number':
      return dateFromExcel(findings as number).toLocaleDateString();
    case 'string':
      return findings as string;
    case 'undefined':
      return '';
    default:
      throw new Error(`Unexpected findings data type: ${type}`);
  }
}

export function generateOlaDatas(restaurants: RestaurantWithWr30[]): OlaDatas {
  try {
    const olaDatas: OlaDatas = {
      SSNJRestaurants: restaurants.map(restaurant => ({
        ProductRecordId: restaurant.applicant['Product ID'],
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
        TotalFTECountfromWR30: getQuarterlyWageData(restaurant).fteCount,
        Status: getStatus(restaurant),
        Findings: getFindings(restaurant),
      })),
    };

    return olaDatas;
  } catch (e) {
    console.error(chalk.red(`Error found while generating OLA Datas:`));
    console.dir(e, { depth: null });

    throw e;
  }
}
