import { Decision, DecoratedApplication, Finding_Review } from './types';
import {
  getDecision,
  getTaxationReportedTaxFilingAndYear,
  getCapacityOpen,
  adjustedYoyChange,
} from './helpers';
import { getFindings } from './findings';
import {
  reducibleFunding,
  adjustedYoyDecline,
  reducibleFundingDescription,
  wasYoyDeclineAdjusted,
  discountedAwardBasis,
  unmetNeed,
} from './award-size';
import { formatDollars, formatPercent } from '../util';
import { options } from '../options';

const { addDays, format } = require('date-fns');

export interface Review {
  application_id: string;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  address1: string;
  address2: string;
  city_state_zip: string;
  appeal_url: string;
  reasons: string[];
}

const getAppealUrl = (app: DecoratedApplication, reasons: string[]): string => {
  const _adjustedYoyChange = adjustedYoyChange(app);
  const _unmetNeed = unmetNeed(app);
  const entry = {
    Inputs: {
      ApplicationID: app.ApplicationId,
      EntityName: app.ContactInformation_BusinessName.trim().trim(),
      TIN: app.Business_TIN.trim(),
      NAICS: app.NAICSCode,
      YearFounded: app.Business_YearEstablished,
      Expiration: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      Email: app.ContactInformation_Email.trim(),
      Reasons: reasons,
      TaxYear: getTaxationReportedTaxFilingAndYear(app).year,
      DiscountedAwardBasis: formatDollars(discountedAwardBasis(app)),
      UnmetNeed: _unmetNeed && formatDollars(_unmetNeed),
      RevenueDecline: formatDollars(<number>adjustedYoyDecline(app)),
      RevenueDeclinePercent: _adjustedYoyChange && formatPercent(-_adjustedYoyChange),
      OtherCovidFunding: reducibleFundingDescription(app),
      DOBAmount: formatDollars(reducibleFunding(app)),
      Capacity: getCapacityOpen(app),
      RevenueWasAdjusted: wasYoyDeclineAdjusted(app),
    },
  };

  const host = options.force ? 'http://localhost:5000' : 'https://forms.business.nj.gov';
  const json = JSON.stringify(entry);
  const buffer = Buffer.from(json);
  const entryBase64 = buffer.toString('base64');

  return `${host}/grants-2-review/?code=${entryBase64}`;
};

export const generateReview = (app: DecoratedApplication): Review | null => {
  // if (!app.reviewNeeded) {
  //   return null;
  // }
  
  if (getDecision(app) !== Decision.Review) {
    return null;
  }

  const findings = <Finding_Review[]>(
    getFindings(app).filter(finding => finding.severity === Decision.Review)
  );
  const reasons: string[] = [...new Set(findings.map(finding => finding.slug).filter(s => s))] // unique truthy slugs
  const city_state_zip = `${app.geography.City.trim()}, ${app.ContactInformation_PrimaryBusinessAddress_State.trim()} ${app.ContactInformation_PrimaryBusinessAddress_PostalCode.padStart(
    5,
    '0'
  ).trim()}`;

  return {
    application_id: app.ApplicationId,
    email: app.reviewNeeded?.email || app.ContactInformation_Email,
    first_name: app.ContactInformation_ContactName_First.trim(),
    last_name: app.ContactInformation_ContactName_Last.trim(),
    business_name: app.ContactInformation_BusinessName.trim(),
    address1: app.ContactInformation_PrimaryBusinessAddress_Line1.toUpperCase().trim(),
    address2: app.ContactInformation_PrimaryBusinessAddress_Line2.toUpperCase().trim(),
    city_state_zip,
    appeal_url: getAppealUrl(app, reasons),
  };
};
