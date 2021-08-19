import { Decision, DecoratedApplication, Finding_Review } from './types';
import {
  getDecision,
  getTaxationReportedTaxFilingAndYear,
  getCapacityOpen,
  adjustedYoyChange,
} from './helpers';
import { getFindings } from './findings';
import {
  //reducibleFunding,
  //adjustedYoyDecline,
  //reducibleFundingDescription,
  //wasYoyDeclineAdjusted,
  //discountedAwardBasis,
  unmetNeed,
} from './award-size';
import { formatDollars, formatPercent } from '../util';
import { options } from '../options';
import { OtherFundingDescription, OtherFundingAmountSBAPPP, OtherFundingAmountNJEDAPhase1, OtherFundingAmountNJEDAPhase2, OtherFundingAmountNJEDAPhase3
, OtherFundingAmountNJRA1orRA2, OtherFundingAmountHMFAGrant, OtherFundingAmountNJEDASSNJ, OtherFundingAmountNJEDAPPE, OtherFundingAmountOther } from '../outputs/award-size';

const { addDays, format } = require('date-fns');

export interface Review {
  application_id: string;
  application_sequence_id: string;
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
      ApplicationSequenceID: app.njeda_submittedordernumber,
      EntityName: (!!app.ContactInformation_BusinessName) ? app.ContactInformation_BusinessName.trim() : '',
      TIN: (!!app.Business_TIN) ? app.Business_TIN.trim() : '',
      NAICS: app.NAICSCode,
      YearFounded: app.Business_YearEstablished,
      Expiration: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
      Email: (!!app.ContactInformation_Email) ? app.ContactInformation_Email.trim() : '',
      Reasons: reasons,
      TaxYear: getTaxationReportedTaxFilingAndYear(app).year,
      TaxRegName: (!!app.taxation["TAXREG Name"]) ? app.taxation["TAXREG Name"].trim() : '',
      UnmetNeed: _unmetNeed && formatDollars(_unmetNeed),
      RevisedUnmetNeed: !!app.njeda_revisedbusinessfundingneeded ? formatDollars(app.njeda_revisedbusinessfundingneeded) : formatDollars(0),
      OriginalUnmetNeed: !!app.njeda_additionalbusinessfundingneeded ? formatDollars(app.njeda_additionalbusinessfundingneeded) : formatDollars(0),
      UnmetNeedUserEntered: !!app.njeda_revisedbusinessfundingneeded ? formatDollars(app.njeda_revisedbusinessfundingneeded) : !!app.njeda_additionalbusinessfundingneeded ? formatDollars(app.njeda_additionalbusinessfundingneeded) : formatDollars(0),
      OtherCovidFunding: OtherFundingDescription(app),
      SBAPPP: formatDollars(OtherFundingAmountSBAPPP(app)),
      NJEDAPhase1: formatDollars(OtherFundingAmountNJEDAPhase1(app)),
      NJEDAPhase2: formatDollars(OtherFundingAmountNJEDAPhase2(app)),
      NJEDAPhase3: formatDollars(OtherFundingAmountNJEDAPhase3(app)),
      NJRA1orRA2: formatDollars(OtherFundingAmountNJRA1orRA2(app)),
      HMFAGrant: formatDollars(OtherFundingAmountHMFAGrant(app)),
      NJEDASSNJ: formatDollars(OtherFundingAmountNJEDASSNJ(app)),
      NJEDAPPE: formatDollars(OtherFundingAmountNJEDAPPE(app)),
      OtherProgram: formatDollars(OtherFundingAmountOther(app)), 
    },
  };

  const host = options.force ? 'http://localhost:5000' : 'https://forms.business.nj.gov';
  const json = JSON.stringify(entry);
  const buffer = Buffer.from(json);
  const entryBase64 = buffer.toString('base64');
  const encodedEntry = encodeURIComponent(entryBase64);

  return `${host}/grants-4-review/?code=${encodedEntry}`;
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
  const city_state_zip = `${app.ContactInformation_Geography_Label}, NJ ${app.ContactInformation_ZipFirst5}`;
  //const Amount: string[]

  return {
    application_id: app.ApplicationId,
    application_sequence_id: app.njeda_submittedordernumber,
    email: app.ContactInformation_Email,
    first_name: (!!app.ContactInformation_ContactName_First) ? app.ContactInformation_ContactName_First.trim(): '',
    last_name: (!!app.ContactInformation_ContactName_Last) ? app.ContactInformation_ContactName_Last.trim(): '',
    business_name: (!!app.ContactInformation_BusinessName) ? app.ContactInformation_BusinessName.trim(): '',
    address1: (!!app.ContactInformation_PrimaryBusinessAddress_Line1) ? app.ContactInformation_PrimaryBusinessAddress_Line1.toUpperCase().trim() : '',
    address2: (!!app.ContactInformation_PrimaryBusinessAddress_Line2) ? app.ContactInformation_PrimaryBusinessAddress_Line2.toUpperCase().trim() : '',
    city_state_zip,
    appeal_url: getAppealUrl(app, reasons),
    reasons,
  };
};
