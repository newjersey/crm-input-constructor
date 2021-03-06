import { isAfter } from 'date-fns';
import {
  Decision,
  FindingDef,
  RemainOpenCapacities,
  OwnershipStructures,
  DecoratedApplication,
  Finding,
  TaxationReportedTaxFilingValues,
  EligibleOpportunityZoneValues,
  Finding_Decline,
} from './types';
import { bool, dateFromExcel, formatDollars, formatPercent } from '../util';
import { ProductStatuses } from '../inputs/grant-phase-1';
import {
  awardBasis,
  grantPhase1AmountApproved,
  unmetNeed,
  discountedAwardBasis,
  adjustedYoyDecline,
  reducibleFunding,
} from './award-size';
import {
  getQuarterlyWageData,
  getCapacityOpen,
  getOwnershipStructure,
  isUnknownToTaxation,
  getYYRevenueDeclineReasonableness,
  getSalesTaxPercentChange,
  getNonprofitType,
  cbtRevenue,
  getTaxationReportedNetIncomeLoss,
  isDobProgramApprovedOrInProgress,
  cappedMarchAprilMay2019Revenue,
  adjustedYoyChange,
  getTaxationReportedTaxFilingAndYear,
  cappedReportedPastRevenue,
  isReportedPastRevenueReasonable,
  hasNoTaxFilings,
  getEligibleOpportunityZoneValue,
} from './helpers';
import { EntityType } from '../inputs/applications';

// try to keep Declines at top and Reviews at bottom, so they print that way when serialized in CRM;
// also keep potentially long messages (e.g. user input) at the end, in case it goes on forever.
const FINDING_DEFINITIONS: FindingDef[] = [
  // yesNo(app.sams.possibleMatches.length > 0), // TODO: if yes, add details to findings
  {
    // TODO: unverified
    name: 'Ineligible entity type',
    trigger: app => app.Business_EntityType_Value === EntityType.Other,
    messageGenerator: app =>
      `Ineligible Business Entity Type: "Other (estate, municipality, etc.)"`,
    publicMessageGenerator: app =>
      `Entity is considered an ineligible entity type (e.g. estate, municipality)`,
    severity: Decision.Decline,
    slug: 'Entity',
  },
  {
    // TODO: unverified
    name: 'Business too new',
    trigger: app =>
      !!app.Business_DateEstablished &&
      isAfter(dateFromExcel(app.Business_DateEstablished), new Date(2020, 2, 15)),
    messageGenerator: app =>
      `Business established on ${dateFromExcel(
        <number>app.Business_DateEstablished
      ).toLocaleDateString()}, which is after the cutoff date of ${new Date(
        2020,
        2,
        15
      ).toLocaleDateString()}`,
    publicMessageGenerator: app => `Entity was not in operation on February 15, 2020`,
    severity: Decision.Decline,
    slug: 'Year',
  },
  {
    // unverified
    name: 'Gambling',
    trigger: app => bool(app.BusinessDetails_GamblingActivities),
    messageGenerator: app => `Organization hosts gambling or gaming activities`,
    publicMessageGenerator: app =>
      `Entity is considered an ineligible entity because it hosts gambling or gaming activities`,
    severity: Decision.Decline,
    slug: 'Gambling',
  },
  {
    // unverified
    name: 'Adult',
    trigger: app =>
      app.BusinessDetails_AdultActivities !== '' && bool(app.BusinessDetails_AdultActivities),
    messageGenerator: app =>
      `Organization conducts or purveys “adult” activities, services, products or materials`,
    publicMessageGenerator: app =>
      `Entity is considered an ineligible entity because it conducts or purveys “adult” activities, services, products or materials`,
    severity: Decision.Decline,
    slug: 'Adult',
  },
  {
    // unverified
    name: 'Auctions/Sales',
    trigger: app => bool(app.BusinessDetails_SalessActivities),
    messageGenerator: app =>
      `Organization conducts auctions, bankruptcy sales, fire sales, “lost-our-lease,” “going-out-of-business,” or similar sales`,
    publicMessageGenerator: app =>
      `Entity is considered an ineligible entity because it conducts auctions, bankruptcy sales, fire sales, “lost-our-lease,” “going-out-of-business,” or similar sales`,
    severity: Decision.Decline,
    slug: 'Sales',
  },
  {
    // unverified
    name: 'Transient merchant',
    trigger: app => bool(app.BusinessDetails_TransientMerchant),
    messageGenerator: app =>
      `Organization is a transient merchant ("peddler," "popup store," or "itinerant vendor")`,
    publicMessageGenerator: app =>
      `Entity is considered an ineligible entity because it is a transient merchant ("peddler," "popup store," or "itinerant vendor")`,
    severity: Decision.Decline,
    slug: 'Transient',
  },
  {
    // unverified
    name: 'Outdoor storage',
    trigger: app => bool(app.BusinessDetails_OutdoorStorageCompany),
    messageGenerator: app => `Organization is an outdoor storage company`,
    publicMessageGenerator: app =>
      `Entity is considered an ineligible entity because it is an outdoor storage company`,
    severity: Decision.Decline,
    slug: 'Outdoor',
  },
  {
    // unverified
    name: 'Nuisance',
    trigger: app => bool(app.BusinessDetails_NuisanceActivities),
    messageGenerator: app => `Organization conducts activities that may constitute a nuisance`,
    publicMessageGenerator: app =>
      `Entity is considered an ineligible entity because it conducts activities that may constitute a nuisance`,
    severity: Decision.Decline,
    slug: 'Nuisance',
  },
  {
    // unverified
    name: 'Illegal',
    trigger: app => bool(app.BusinessDetails_IllegalActivities),
    messageGenerator: app => `Organization conducts business for an illegal purpose`,
    publicMessageGenerator: app =>
      `Entity is considered an ineligible entity because it conducts business for an illegal purpose`,
    severity: Decision.Decline,
    slug: 'Illegal',
  },
  {
    name: 'On Unemployment Not Clear List',
    trigger: app => app.dol.uidNoGo,
    messageGenerator: app => `Applicant is on the DOL UI no-go list`,
    publicMessageGenerator: app =>
      `Entity is not in good standing with the NJ Department of Labor and Workforce Development (Unemployment Insurance Division)`,
    severity: Decision.Decline,
    slug: 'DOLUI',
  },
  {
    // unverified
    name: 'On Wage/Hour Not Clear List',
    trigger: app => app.dol.whdNoGo,
    messageGenerator: app => `Applicant is on the DOL Wage/Hour no-go list`,
    publicMessageGenerator: app =>
      `Entity is not in good standing with the NJ Department of Labor and Workforce Development (Wage and Hour Division)`,
    severity: Decision.Decline,
    slug: 'DOLWH',
  },
  {
    name: 'FTE Greater than 25',
    trigger: app => (getQuarterlyWageData(app).fteCount || 0) > 25,
    messageGenerator: app =>
      `Too Many FTE Equivalents: ${getQuarterlyWageData(app).fteCount} but should be at most 25`,
    publicMessageGenerator: app =>
      `Entity had over 25 full-time equivalent employees on their most recently filed NJ WR-30 filed with the NJ Department of Labor and Workforce Development, based on the calculation specified in the Guidelines`,
    severity: Decision.Decline,
    slug: 'HighFTE',
  },
  {
    // unverified
    name: 'Received Phase 1 Funding >= Phase 2 Award Basis',
    trigger: app => grantPhase1AmountApproved(app) >= awardBasis(app),
    messageGenerator: app =>
      `Business received a NJEDA Emergency Phase 1 Grant (${
        app.grantPhase1?.['OLA']
      } for ${formatDollars(
        grantPhase1AmountApproved(app)
      )}) and is not eligible for incremental funding based on WR-30 data (award basis: ${formatDollars(
        awardBasis(app)
      )})`,
    publicMessageGenerator: app =>
      `Entity received funding in the Small Business Emergency Assistance Phase 1 Grant Program and is not eligible for incremental funding`,
    severity: Decision.Decline,
    slug: 'Phase1',
  },
  {
    // unverified
    name: 'Duplicate EIN',
    trigger: app => !!app.duplicates.byTin,
    messageGenerator: app =>
      `EIN was found in more than one application (${app.duplicates.byTin?.join(', ')})`,
    publicMessageGenerator: app => `Tax Identification Number (TIN) reported on application was found in a previous application`,
    severity: Decision.Decline,
    slug: 'DupEIN',
  },
  {
    // unverified
    name: 'Capacity 100%, no self-reported revenue decrease',
    trigger: app =>
      getCapacityOpen(app) === RemainOpenCapacities['100%'] &&
      adjustedYoyDecline(app) !== null &&
      <number>adjustedYoyDecline(app) <= 0,
    messageGenerator: app =>
      `Capacity remained at 100% and self-reported YoY revenue did not decrease from 2019 to 2020`,
    publicMessageGenerator: app => `As reported on your application your business was open at 100% capacity and your revenue year-over-year from 2019 to 2020 did not suffer a negative impact. A requirement of this program was a negative impact as a result of Covid19 and based on your application your business does not meet that requirement.`,
    severity: Decision.Decline,
    slug: 'Capacity',
  },
  {
    name: 'No Taxation record (excluding nonprofits)',
    trigger: app =>
      getOwnershipStructure(app) !== OwnershipStructures.Nonprofit && isUnknownToTaxation(app),
    messageGenerator: app =>
      `Business is a ${getOwnershipStructure(app)} (TIN: ${
        app.Business_TIN
      }) that is not registered with Taxation, did not file taxes with Taxation for 2018 or 2019, and did not file sales/usage taxes with Taxation in 2019 or 2020`,
    publicMessageGenerator: app =>
      `Entity was not registered to do business in the State of New Jersey at the time of application`,
    severity: Decision.Decline,
    slug: 'EIN',
  },
  ////////////////////// Reviews below ////////////////////////
  {
    name: 'Adult unknown',
    trigger: app => app.BusinessDetails_AdultActivities === '',
    messageGenerator: app =>
      `It is unknown if the organization conducts or purveys “adult” activities, services, products or materials (question left blank on application)`,
    severity: Decision.Review,
    slug: 'MissingAdult',
  },
  {
    name: 'Business established in 2019 or 2020',
    trigger: app => ['2019', '2020'].includes(app.Business_YearEstablished),
    messageGenerator: app =>
      `Business established in ${app.Business_YearEstablished} (${dateFromExcel(
        <number>app.Business_DateEstablished
      ).toLocaleDateString()})`,
    severity: Decision.Review,
    slug: 'Year',
  },
  {
    name: 'Religious Affiliation',
    trigger: app => bool(app.Business_Religious),
    messageGenerator: app => `Business has religious affiliations`,
    severity: Decision.Review,
    slug: 'Religious',
  },
  {
    name: 'Lobbying and Political Activities',
    trigger: app => app.Business_LobbyingPolitical === 'Yes',
    messageGenerator: app => `Business engages in lobbying and/or political activities`,
    severity: Decision.Review,
    slug: 'Political',
  },
  {
    name: 'NAICS Code (813)',
    trigger: app => app.NAICSCode.startsWith('813'),
    messageGenerator: app => `NAICS code starts with 813: ${app.NAICSCode}`,
    severity: Decision.Review,
    slug: 'NAICS',
  },
  {
    name: 'On SAM exclusion list',
    trigger: app => app.sams.possibleMatches.length > 0,
    messageGenerator: app =>
      `Applicant may be on the federal SAMS exclusion list: ${app.sams.possibleMatches
        .map(match => `DUNS ${match.DUNS}`)
        .join(', ')}`,
    severity: Decision.Review,
    slug: 'SAMS',
  },
  {
    // unverified
    name: 'Phase 1 under review',
    trigger: app => app.grantPhase1?.['Product Status'] === ProductStatuses.Underwriting,
    messageGenerator: app =>
      `Business is currently under review for Phase 1 Grant funding (${app.grantPhase1?.['OLA']})`,
    severity: Decision.Review,
    slug: null,
  },
  {
    // unverified
    name: 'No Census Tract',
    trigger: app =>
      getEligibleOpportunityZoneValue(app) === EligibleOpportunityZoneValues.Not_Found,
    messageGenerator: app => `Business address does not have a census tract`,
    severity: Decision.Review,
    slug: 'NoCensusTract',
  },
  {
    name: 'Duplicate Address',
    trigger: app => !!app.duplicates.byAddress,
    messageGenerator: app =>
      `Business address was found in more than one application (${app.duplicates.byAddress?.join(
        ', '
      )})`,
    severity: Decision.Review,
    slug: 'DupAddress',
  },
  {
    name: 'Unreasonable revenue decline',
    trigger: app => getYYRevenueDeclineReasonableness(app) === 'No',
    messageGenerator: app =>
      `Applicant's adjusted YoY revenue decline (${formatPercent(
        <number>adjustedYoyChange(app)
      )}) is unreasonably high given business operational capacity (${getCapacityOpen(app)})`,
    severity: Decision.Review,
    slug: 'BusinessCapacity',
  },
  {
    name: 'No unmet need',
    trigger: app => unmetNeed(app) === 0,
    messageGenerator: app =>
      `Business does not have an unmet need based on adjusted YoY revenue loss (${formatDollars(
        <number>adjustedYoyDecline(app)
      )}) and other disaster resources pending or received (${formatDollars(
        reducibleFunding(app)
      )})`,
    severity: Decision.Review,
    slug: 'NoUnmetNeed',
  },
  {
    name: 'Unmet Need is less than Discounted Award Basis',
    trigger: app => unmetNeed(app) !== null && <number>unmetNeed(app) < discountedAwardBasis(app),
    messageGenerator: app =>
      `The business has an unmet need of ${formatDollars(
        <number>unmetNeed(app)
      )}, which is less than their discounted award basis of ${formatDollars(
        discountedAwardBasis(app)
      )}`,
    severity: Decision.Review,
    slug: 'AdjustedAwardSize',
  },
  {
    name: 'Missing WR-30 but expect employees',
    trigger: app =>
      app.wr30.notFound &&
      (app.Business_W2EmployeesFullTime >= 2 || app.Business_W2EmployeesPartTime >= 3),
    messageGenerator: app =>
      `No WR-30 found for applicant, but applicant reported ${app.Business_W2EmployeesFullTime} full-time W2 employees and ${app.Business_W2EmployeesPartTime} part-time W2 employees`,
    severity: Decision.Review,
    slug: 'WR30',
  },
  {
    name: 'Sales tax increased',
    trigger: app =>
      typeof getSalesTaxPercentChange(app) !== 'undefined' &&
      <number>getSalesTaxPercentChange(app) > 0,
    messageGenerator: app =>
      `Applicant's sales tax increased ${formatPercent(<number>getSalesTaxPercentChange(app), {
        decimals: 1,
      })} from 2019 to 2020`,
    severity: Decision.Review,
    slug: 'TaxIncrease',
  },
  {
    name: 'No Taxation record (nonprofits)',
    trigger: app =>
      getOwnershipStructure(app) === OwnershipStructures.Nonprofit && isUnknownToTaxation(app),
    messageGenerator: app =>
      `Business is a ${getNonprofitType(app)} ${getOwnershipStructure(
        app
      )} that is not registered with Taxation, did not file taxes with Taxation for 2018 or 2019, and did not file sales/usage taxes with Taxation in 2019 or 2020`,
    severity: Decision.Review,
    slug: 'Taxation',
  },
  {
    name: 'Known to Taxation but no filings',
    trigger: app => app.taxation['Clean Ind'] !== 'X' && hasNoTaxFilings(app),
    messageGenerator: app => `Organization is recognized by Taxation, but has no Taxation filings`,
    severity: Decision.Review,
    slug: 'Taxation',
  },
  {
    name: 'CBT filer reports unreasonably high 2019 revenue',
    trigger: app =>
      isReportedPastRevenueReasonable(app) === false &&
      getTaxationReportedTaxFilingAndYear(app).type === TaxationReportedTaxFilingValues.CBT,
    messageGenerator: app =>
      `Applicant's capped 2019 3-month actual revenues reported on application (${formatDollars(
        <number>cappedMarchAprilMay2019Revenue(app)
      )}) are ${formatPercent(
        <number>cbtRevenue(app) / <number>cappedReportedPastRevenue(app) - 1
      )} higher than their ${
        getTaxationReportedTaxFilingAndYear(app).year
      } revenues reported by Taxation (${formatDollars(<number>cbtRevenue(app))}) when annualized`,
    severity: Decision.Review,
    slug: 'High2019Revenue',
  },
  {
    name: 'TGI/Partnership filer reports unreasonably high 2019 revenue',
    trigger: app =>
      isReportedPastRevenueReasonable(app) === false &&
      (getTaxationReportedTaxFilingAndYear(app).type ===
        TaxationReportedTaxFilingValues.Partnership ||
        getTaxationReportedTaxFilingAndYear(app).type ===
          TaxationReportedTaxFilingValues.Sole_Prop_SMLLC),
    messageGenerator: app =>
      `Applicant's capped 2019 3-month actual revenues reported on application (${formatDollars(
        <number>cappedMarchAprilMay2019Revenue(app)
      )}) may not be reasonable given their ${
        getTaxationReportedTaxFilingAndYear(app).year
      } Taxation reported net income of ${formatDollars(
        <number>getTaxationReportedNetIncomeLoss(app)
      )}`,
    severity: Decision.Review,
    slug: 'High2019Revenue',
  },
  {
    name: 'Other program indicated but amount is 0 (PPP)',
    trigger: app =>
      bool(app.DOBAffidavit_SBAPPP) &&
      isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAPPPDetails_Status_Value) &&
      !app.DOBAffidavit_SBAPPPDetails_Amount,
    messageGenerator: app =>
      `Applicant reported PPP funding approved or in progress but did not indicate the amount`,
    severity: Decision.Review,
    slug: 'MissingDOBAmount',
  },
  {
    name: 'Other program indicated but amount is 0 (EIDG)',
    trigger: app =>
      bool(app.DOBAffidavit_SBAEIDG) &&
      isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAEIDGDetails_Status_Value) &&
      !app.DOBAffidavit_SBAEIDGDetails_Amount,
    messageGenerator: app =>
      `Applicant reported EIDG funding approved or in progress but did not indicate the amount`,
    severity: Decision.Review,
    slug: 'MissingDOBAmount',
  },
  {
    name: 'Other program indicated but amount is 0 (other stat/local)',
    trigger: app =>
      bool(app.DOBAffidavit_OtherStateLocal) &&
      !app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess,
    messageGenerator: app =>
      `Applicant reported other disaster funding approved or in progress ("${app.DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions}") but did not indicate the amount`,
    severity: Decision.Review,
    slug: 'MissingDOBAmount',
  },
  // keep these last, since they could include long text:
  {
    name: 'Background Question #1 (convictions)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion1),
    messageGenerator: app =>
      `Additional information provided on background question #1 (convictions): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails1}"`,
    severity: Decision.Review,
    slug: null,
  },
  {
    name: 'Background Question #2 (denied licensure)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion2),
    messageGenerator: app =>
      `Additional information provided on background question #2 (denied licensure): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails2}"`,
    severity: Decision.Review,
    slug: null,
  },
  {
    name: 'Background Question #3 (public contractor subcontract ineligibility)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion3),
    messageGenerator: app =>
      `Additional information provided on background question #3 (public contractor subcontract ineligibility): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails3}"`,
    severity: Decision.Review,
    slug: null,
  },
  {
    name: 'Background Question #4 (violated the terms of a public agreement)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion4),
    messageGenerator: app =>
      `Additional information provided on background question #4 (violated the terms of a public agreement): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails4}"`,
    severity: Decision.Review,
    slug: null,
  },
  {
    name: 'Background Question #5 (injunction, order or lien)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion5),
    messageGenerator: app =>
      `Additional information provided on background question #5 (injunction, order or lien): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails5}"`,
    severity: Decision.Review,
    slug: null,
  },
  {
    name: 'Background Question #6 (presently indicted)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion6),
    messageGenerator: app =>
      `Additional information provided on background question #6 (presently indicted): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails6}"`,
    severity: Decision.Review,
    slug: null,
  },
];

export function getFindings(app: DecoratedApplication): Finding[] {
  const findings: Finding[] = FINDING_DEFINITIONS.filter(def => def.trigger(app)).map(def => ({
    message: def.messageGenerator(app),
    publicMessage: 'publicMessageGenerator' in def ? def.publicMessageGenerator(app) : undefined,
    slug: 'slug' in def ? (def.slug || undefined) : undefined,
    severity: def.severity,
    name: def.name,
  }));

  return findings;
}
