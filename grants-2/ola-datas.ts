const chalk = require('chalk');

import { isAfter } from 'date-fns';
import * as types from './ola-datas-types';
import {
  Capacities,
  Designations,
  DOB_Purposes,
  DOB_Status,
  EntityType,
  YesNo as Application_YesNo,
  Languages,
} from './applications';
import { EligibilityStatus as OZEligibilityStatus } from './policy-map';
import { CleanStatus as TaxationCleanStatus, CleanStatus } from './taxation';
import { bool, dateFromExcel, formatDate, formatExcelDate } from './util';
import { ProductStatuses } from './grant-phase-1';

// try to keep Declines at top and Reviews at bottom, so they print that way when serialized in CRM;
// also keep potentially long messages (e.g. user input) at the end, in case it goes on forever.
const FINDING_DEFINITIONS: types.FindingDef[] = [
  // yesNo(app.sams.possibleMatches.length > 0), // TODO: if yes, add details to findings
  {
    // TODO: unverified
    name: 'Ineligible entity type',
    trigger: app => app.Business_EntityType_Value === EntityType.Other,
    messageGenerator: app =>
      `Ineligible Business Entity Type: "Other (estate, municipality, etc.)"`,
    severity: types.Decision.Decline,
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
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Gambling',
    trigger: app => bool(app.BusinessDetails_GamblingActivities),
    messageGenerator: app => `Organization hosts gambling or gaming activities`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Adult',
    trigger: app =>
      app.BusinessDetails_AdultActivities !== '' && bool(app.BusinessDetails_AdultActivities),
    messageGenerator: app =>
      `Organization conducts or purveys “adult” activities, services, products or materials`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Auctions/Sales',
    trigger: app => bool(app.BusinessDetails_SalessActivities),
    messageGenerator: app =>
      `Organization conducts auctions, bankruptcy sales, fire sales, “lost-our-lease,” “going-out-of-business,” or similar sales`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Transient merchant',
    trigger: app => bool(app.BusinessDetails_TransientMerchant),
    messageGenerator: app =>
      `Organization is a transient merchant ("peddler," "popup store," or "itinerant vendor")`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Outdoor storage',
    trigger: app => bool(app.BusinessDetails_OutdoorStorageCompany),
    messageGenerator: app => `Organization is an outdoor storage company`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Nuisance',
    trigger: app => bool(app.BusinessDetails_NuisanceActivities),
    messageGenerator: app => `Organization conducts activities that may constitute a nuisance`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Illegal',
    trigger: app => bool(app.BusinessDetails_IllegalActivities),
    messageGenerator: app => `Organization conducts business for an illegal purpose`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'On Unemployment Not Clear List',
    trigger: app => app.dol.uidNoGo,
    messageGenerator: app => `Applicant is on the DOL UI no-go list`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'On Wage/Hour Not Clear List',
    trigger: app => app.dol.whdNoGo,
    messageGenerator: app => `Applicant is on the DOL Wage/Hour no-go list`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'FTE Greater than 25',
    trigger: app => (getQuarterlyWageData(app)[0] || 0) > 25,
    messageGenerator: app =>
      `Too Many FTE Equivalents: ${getQuarterlyWageData(app)[0]} but should be at most 25`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Not found with Taxation',
    trigger: app => app.taxation['Clean Ind'] === CleanStatus.Not_Found,
    messageGenerator: app => `Not found by Taxation`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Received Phase 1 Funding',
    trigger: app =>
      !!app.grantPhase1?.['Approval Date'] &&
      (getAwardAmount(app) || 0) <= (app.grantPhase1?.Amount || 0),
    messageGenerator: app =>
      `Business received a NJEDA Emergency Phase 1 Grant (${app.grantPhase1?.['OLA Application ID ']} for $${app.grantPhase1?.Amount}) and is not eligible for incremental funding based on WR30 data`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Duplicate EIN',
    trigger: app => !!app.duplicates.byTin,
    messageGenerator: app =>
      `EIN was found in more than one application (${app.duplicates.byTin?.join(', ')})`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Capacity 100%, no self-reported revenue decrease',
    trigger: app =>
      getCapacityOpen(app) === types.RemainOpenCapacities['100%'] &&
      !!app.RevenueComparison_MarchAprilMay2019 &&
      app.RevenueComparison_MarchAprilMay2020 >= app.RevenueComparison_MarchAprilMay2019,
    messageGenerator: app =>
      `Capacity remained at 100% and self-reported year/year revenue did not decrease from 2019 to 2020.`,
    severity: types.Decision.Decline,
  },
  {
    name: '',
    trigger: app => false,
    messageGenerator: app => ``,
    severity: types.Decision.Decline,
  },
  {
    name: '',
    trigger: app => false,
    messageGenerator: app => ``,
    severity: types.Decision.Decline,
  },
  {
    name: '',
    trigger: app => false,
    messageGenerator: app => ``,
    severity: types.Decision.Decline,
  },
  //////////////////////////////////////////////
  {
    name: 'Adult unknown',
    trigger: app => app.BusinessDetails_AdultActivities === '',
    messageGenerator: app =>
      `It is unknown if the organization conducts or purveys “adult” activities, services, products or materials (question left blank on application)`,
    severity: types.Decision.Review,
  },
  {
    name: 'Business established in 2019 or 2020',
    trigger: app => ['2019', '2020'].includes(app.Business_YearEstablished),
    messageGenerator: app => `Business established in ${app.Business_YearEstablished}`,
    severity: types.Decision.Review,
  },
  {
    name: 'Religious Affiliation',
    trigger: app => bool(app.Business_Religious),
    messageGenerator: app => `Business has religious affiliations`,
    severity: types.Decision.Review,
  },
  {
    name: 'Lobbying and Policital Activities',
    trigger: app => app.Business_LobbyingPolitical === 'Yes',
    messageGenerator: app => `Business engages in lobbying and/or political activities`,
    severity: types.Decision.Review,
  },
  {
    name: 'NAICS Code (813)',
    trigger: app => app.NAICSCode.startsWith('813'),
    messageGenerator: app => `NAICS code starts with 813: ${app.NAICSCode}`,
    severity: types.Decision.Review,
  },
  {
    name: 'On SAM exclusion list',
    trigger: app => app.sams.possibleMatches.length > 0,
    messageGenerator: app =>
      `Applicant may be on the federal SAMS exclusion list: ${app.sams.possibleMatches
        .map(match => `DUNS ${match.DUNS}`)
        .join(', ')}`,
    severity: types.Decision.Review,
  },
  {
    // unverified
    name: 'Phase 1 under review',
    trigger: app => app.grantPhase1?.['Product Status'] === ProductStatuses.Underwriting,
    messageGenerator: app =>
      `Business is currently under review for Phase 1 Grant funding (${app.grantPhase1?.['OLA Application ID ']})`,
    severity: types.Decision.Review,
  },
  {
    // unverified
    name: 'No Census Tract',
    trigger: app => !app.policyMap?.censusTract,
    messageGenerator: app => `Business address does not have a census tract`,
    severity: types.Decision.Review,
  },
  {
    name: 'Duplicate Address',
    trigger: app => !!app.duplicates.byAddress,
    messageGenerator: app =>
      `Business address was found in more than one application (${app.duplicates.byAddress?.join(
        ', '
      )})`,
    severity: types.Decision.Review,
  },
  {
    name: 'Unreasonable revenue decline',
    trigger: app => getYYRevenueDeclineReasonableness(app) === 'No',
    messageGenerator: app =>
      `Applicant reported an unreasonably high year/year revenue decline (${
        Math.round(<number>app.RevenueComparison_YearOverYearChange) * 100
      }%) given business operational capacity (${getCapacityOpen(app)}).`,
    severity: types.Decision.Review,
  },
  {
    name: '',
    trigger: app => false,
    messageGenerator: app => ``,
    severity: types.Decision.Review,
  },
  {
    name: '',
    trigger: app => false,
    messageGenerator: app => ``,
    severity: types.Decision.Review,
  },
  // UNVERIFIED--
  // keep these last, since they could include long text:
  {
    name: 'Background Question #1',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion1),
    messageGenerator: app =>
      `Additional information provided on background question #1 (convictions): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails1}"`,
    severity: types.Decision.Review,
  },
  {
    name: 'Background Question #2',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion2),
    messageGenerator: app =>
      `Additional information provided on background question #2 (denied licensure): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails2}"`,
    severity: types.Decision.Review,
  },
  {
    name: 'Background Question #3',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion3),
    messageGenerator: app =>
      `Additional information provided on background question #3 (public contractor subcontract ineligibility): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails3}"`,
    severity: types.Decision.Review,
  },
  {
    name: 'Background Question #4',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion4),
    messageGenerator: app =>
      `Additional information provided on background question #4 (violated the terms of a public agreement): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails4}"`,
    severity: types.Decision.Review,
  },
  {
    name: 'Background Question #5',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion5),
    messageGenerator: app =>
      `Additional information provided on background question #5 (injunction, order or lien): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails5}"`,
    severity: types.Decision.Review,
  },
  {
    name: 'Background Question #6',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion6),
    messageGenerator: app =>
      `Additional information provided on background question #6 (presently indicted): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails6}"`,
    severity: types.Decision.Review,
  },
];

function yesNo(test: boolean): types.YesNo {
  return test ? 'Yes' : 'No';
}

function flag(test: boolean): types.Flag {
  return test ? 'Yes' : '';
}

function getTaxClearanceComments(app: types.DecoratedApplication): types.TaxClearanceValues {
  switch (app.taxation['Clean Ind']) {
    case TaxationCleanStatus.Clear:
      return types.TaxClearanceValues.Clear;
    case TaxationCleanStatus.Not_Clear:
      return types.TaxClearanceValues.Not_Clear;
    case TaxationCleanStatus.Not_Found:
      return types.TaxClearanceValues.Not_Found;
    default:
      throw new Error(
        `Unexpected taxation clearance ${app.taxation['Clean Ind']} for application ${app.ApplicationId}`
      );
  }
}

function getOwnershipStructure(app: types.DecoratedApplication): types.OwnershipStructures {
  const value = app.Business_EntityType_Value;
  const map = new Map<EntityType, types.OwnershipStructures>([
    [EntityType.Sole_Prop, types.OwnershipStructures.SoleProprietorship],
    [EntityType.LLC, types.OwnershipStructures.LLC],
    [EntityType.SMLLC, types.OwnershipStructures.LLC],
    [EntityType.Partnership, types.OwnershipStructures.Partnership],
    [EntityType.C_Corp, types.OwnershipStructures.C_Corporation],
    [EntityType.S_Corp, types.OwnershipStructures.S_Corporation],
    [EntityType.Nonprofit_501c3, types.OwnershipStructures.Nonprofit],
    [EntityType.Nonprofit_501c4, types.OwnershipStructures.Nonprofit],
    [EntityType.Nonprofit_501c6, types.OwnershipStructures.Nonprofit],
    [EntityType.Nonprofit_501c7, types.OwnershipStructures.Nonprofit],
    [EntityType.Nonprofit_501c19, types.OwnershipStructures.Nonprofit],
    [EntityType.Nonprofit_Other, types.OwnershipStructures.Nonprofit],
    [EntityType.Other, types.OwnershipStructures.Other],
  ]);

  const result: types.OwnershipStructures | undefined = map.get(value);

  if (typeof result === 'undefined') {
    throw new Error(
      `Unknown ownership structure value ${value} for application ${app.ApplicationId}`
    );
  }

  return result;
}

function getDesignation(app: types.DecoratedApplication, designation: number): boolean {
  return (app.Business_Designations_Value & designation) > 0;
}

let nextServicingOfficerIndexEN: number = 0;
function getNextServicingOfficerEN(): types.ServicingOfficersEN {
  const values = Object.values(types.ServicingOfficersEN);
  const value: types.ServicingOfficersEN = values[nextServicingOfficerIndexEN];

  nextServicingOfficerIndexEN = (nextServicingOfficerIndexEN + 1) % values.length;

  return value;
}

let nextServicingOfficerIndexES: number = 0;
function getNextServicingOfficerES(): types.ServicingOfficersES {
  const values = Object.values(types.ServicingOfficersES);
  const value: types.ServicingOfficersES = values[nextServicingOfficerIndexES];

  nextServicingOfficerIndexES = (nextServicingOfficerIndexES + 1) % values.length;

  return value;
}

function getServicingOfficer(app: types.DecoratedApplication): types.ServicingOfficer {
  if (getDecision(app) !== types.Decision.Review) {
    return types.ServicingOfficersExternal.Richard_Toro;
  }

  switch (app.Language) {
    case Languages.English:
      return getNextServicingOfficerEN();
    case Languages.Spanish:
      return getNextServicingOfficerES();
    default:
      throw new Error(`Unexpected language ${app.Language} for application$ ${app.ApplicationId}`);
  }
}

function getEligibleOpportunityZoneValue(
  app: types.DecoratedApplication
): types.EligibleOpportunityZoneValues {
  if (typeof app.policyMap === 'undefined') {
    return types.EligibleOpportunityZoneValues.Not_Found;
  }

  const status = app.policyMap.eligibilityStatus;

  switch (status) {
    case OZEligibilityStatus.Eligible_Contiguous:
    case OZEligibilityStatus.Eligible_LIC:
      return types.EligibleOpportunityZoneValues.Yes;
    case OZEligibilityStatus.Not_Eligible:
      return types.EligibleOpportunityZoneValues.No;
    default:
      throw new Error(
        `Unexpected opportunity zone eligibility status ${status} for application ${app.ApplicationId}`
      );
  }
}

function getCapacityOpen(app: types.DecoratedApplication): types.CapacityOpen {
  const capacity: Capacities | undefined = app.COVID19Impact_Capacity_Value;

  if (typeof capacity === 'undefined') {
    return null;
  }

  switch (capacity) {
    case Capacities['Less than 10%']:
      return types.RemainOpenCapacities['Less than 10%'];
    case Capacities['25%']:
      return types.RemainOpenCapacities['25%'];
    case Capacities['50%']:
      return types.RemainOpenCapacities['50%'];
    case Capacities['75%']:
      return types.RemainOpenCapacities['75%'];
    case Capacities['100%']:
      return types.RemainOpenCapacities['100%'];
    default:
      throw new Error(
        `Unexpected capacity value: ${capacity} for application ${app.ApplicationId}`
      );
  }
}

function amountValue(number: number | undefined): types.NullableNumber {
  return typeof number === 'number' ? number : null;
}

function getDobAmountValue(
  indicated: Application_YesNo,
  number: number | undefined
): types.NullableNumber {
  // program not selected (but value might be present from user changing their mind)
  if (!bool(indicated)) {
    return null;
  }

  return amountValue(number);
}

function getDobApproval(
  indicated: Application_YesNo,
  statusValue: DOB_Status | undefined
): types.ProgramApprovals | null {
  // program not selected (but value might be present from user changing their mind)
  if (!bool(indicated)) {
    return null;
  }

  if (typeof statusValue === 'undefined') {
    return null;
  }

  switch (statusValue) {
    case DOB_Status.Approved:
      return types.ProgramApprovals.Approved;
    case DOB_Status.Declined:
      return types.ProgramApprovals.Declined;
    case DOB_Status.In_Process:
      return types.ProgramApprovals.In_Process;
    default:
      throw new Error(`Unexpected DOB program status value: ${statusValue}`);
  }
}

function getDobApprovalDate(
  indicated: Application_YesNo,
  statusValue: DOB_Status | undefined,
  excelFloat: number | undefined
): types.NullableString {
  // program not selected (but value might be present from user changing their mind)
  if (!bool(indicated)) {
    return null;
  }

  // program not approved (but value might be present from user changing their mind)
  if (getDobApproval(indicated, statusValue) !== types.ProgramApprovals.Approved) {
    return null;
  }

  if (typeof excelFloat === 'undefined') {
    return null;
  }

  return formatExcelDate(excelFloat);
}

function getDobPurposes(
  indicated: Application_YesNo,
  purposeValue: DOB_Purposes
): types.NullableString {
  // program not selected (but value might be present from user changing their mind)
  if (!bool(indicated)) {
    return null;
  }

  if (typeof purposeValue === 'undefined') {
    return null;
  }

  const purposesOfFunds: types.PurposesOfFunds[] = [];

  if (purposeValue & DOB_Purposes.Payroll) {
    purposesOfFunds.push(types.PurposesOfFunds.Payroll);
  }
  if (purposeValue & DOB_Purposes.Rent_Mortgage) {
    purposesOfFunds.push(types.PurposesOfFunds.Rent_Mortgage);
  }
  if (purposeValue & DOB_Purposes.Utilities) {
    purposesOfFunds.push(types.PurposesOfFunds.Utilities);
  }
  if (purposeValue & DOB_Purposes.Inventory) {
    purposesOfFunds.push(types.PurposesOfFunds.Inventory);
  }
  if (purposeValue & DOB_Purposes.Other) {
    purposesOfFunds.push(types.PurposesOfFunds.Other);
  }

  return purposesOfFunds.join('; ');
}

// returns a number of FTEs calculated from WR30 data (without limit) and a description
// of the quarter used, e.g. [17, "Q1 2020"]
function getQuarterlyWageData(app: types.DecoratedApplication): types.QuarterlyWageData {
  if (app.wr30.notFound) {
    return [null, null];
  }

  const DOLLARS_PER_HOUR = 10.0;
  const HOURS_PER_WEEK = 35.0;
  const WEEKS_PER_QUARTER = 13.0;
  const FTE_QUARTERLY_MIN_WAGE = DOLLARS_PER_HOUR * HOURS_PER_WEEK * WEEKS_PER_QUARTER;

  const year: number = Math.max(...app.wr30.wageRecords.map(record => record.Year));
  const quarter: number = Math.max(
    ...app.wr30.wageRecords.filter(record => record.Year === year).map(record => record.Quarter)
  );

  const fractionalFtes: number = app.wr30.wageRecords
    .filter(record => record.Year === year && record.Quarter === quarter)
    .map(record => Math.min(1, record.Dollars / FTE_QUARTERLY_MIN_WAGE))
    .reduce((sum, fraction) => sum + fraction, 0);

  const roundedFtes: number = Math.round(fractionalFtes);
  const quarterYear: string = `Q${quarter} ${year}`;

  return [roundedFtes, quarterYear];
}

function getAwardAmount(app: types.DecoratedApplication): types.NullableNumber {
  const AWARD_AMOUNT_PER_ELIGIBLE_FTE: number = 1000;
  const MIN_AWARD_SIZE: number = 1000;
  const MAX_AWARD_SIZE: number = 10000;
  const roundedFteCount: number = getQuarterlyWageData(app)[0] || 0;

  const awardAmount = Math.min(
    MAX_AWARD_SIZE,
    Math.max(MIN_AWARD_SIZE, roundedFteCount * AWARD_AMOUNT_PER_ELIGIBLE_FTE)
  );

  return amountValue(awardAmount);
}

function getApplicantBackground(app: types.DecoratedApplication): string {
  let nonprofitType: types.NullableString = null;

  switch (app.Business_EntityType_Value) {
    case EntityType.Nonprofit_501c3:
      nonprofitType = '501(c)(3)';
    case EntityType.Nonprofit_501c4:
      nonprofitType = '501(c)(4)';
    case EntityType.Nonprofit_501c6:
      nonprofitType = '501(c)(6)';
    case EntityType.Nonprofit_501c7:
      nonprofitType = '501(c)(7)';
    case EntityType.Nonprofit_501c19:
      nonprofitType = '501(c)(19)';
    case EntityType.Nonprofit_Other:
      nonprofitType = `"${app.Business_NonprofitClassification}"`;
  }

  return nonprofitType ? `Nonprofit type: ${nonprofitType}` : '';
}

function getFindings(app: types.DecoratedApplication): types.Finding[] {
  const findings: types.Finding[] = FINDING_DEFINITIONS.filter(def => def.trigger(app)).map(
    def => ({
      message: def.messageGenerator(app),
      severity: def.severity,
    })
  );

  return findings;
}

function getFindingsString(app: types.DecoratedApplication): types.NullableString {
  const findings: types.Finding[] = getFindings(app);
  const findingsString = findings
    .map((finding, i) => `(#${i + 1}: ${finding.severity}) ${finding.message}`)
    .join('. ');

  return findingsString || null;
}

export function getDecision(app: types.DecoratedApplication): types.Decision {
  const findings: types.Finding[] = getFindings(app);

  if (findings.some(finding => finding.severity === types.Decision.Decline)) {
    return types.Decision.Decline;
  }

  if (findings.some(finding => finding.severity === types.Decision.Review)) {
    return types.Decision.Review;
  }

  return types.Decision.Approve;
}

function getProductStatusId(app: types.DecoratedApplication): types.ProductStatuses {
  const decision: types.Decision = getDecision(app);

  switch (decision) {
    case types.Decision.Approve:
    case types.Decision.Review:
      return types.ProductStatuses.Underwriting;
    case types.Decision.Decline:
      return types.ProductStatuses.Ended;
    default:
      throw new Error(`Unknown decision type ${decision} for application ${app.ApplicationId}`);
  }
}

function getProductSubStatusId(app: types.DecoratedApplication): types.ProductSubStatuses {
  const decision: types.Decision = getDecision(app);

  switch (decision) {
    case types.Decision.Approve:
      return types.ProductSubStatuses.Underwriting_ApprovalsinProcess;
    case types.Decision.Review:
      return types.ProductSubStatuses.Underwriting_IncompleteApplicationUWinProgress;
    case types.Decision.Decline:
      return types.ProductSubStatuses.Ended_Declined;
    default:
      throw new Error(`Unknown decision type ${decision} for application ${app.ApplicationId}`);
  }
}

function getMonitoringStatus(app: types.DecoratedApplication): types.MonitoringStatuses {
  const decision: types.Decision = getDecision(app);

  switch (decision) {
    case types.Decision.Approve:
      return types.MonitoringStatuses.Completed;
    case types.Decision.Review:
      return types.MonitoringStatuses.InPlanning;
    case types.Decision.Decline:
      return types.MonitoringStatuses.Findings;
    default:
      throw new Error(`Unknown decision type ${decision} for application ${app.ApplicationId}`);
  }
}

function getMonitoringType(app: types.DecoratedApplication): types.MonitoringTypes {
  const decision: types.Decision = getDecision(app);

  switch (decision) {
    case types.Decision.Approve:
    case types.Decision.Decline:
      return types.MonitoringTypes.External;
    case types.Decision.Review:
      return types.MonitoringTypes.DeskReview;
    default:
      throw new Error(`Unknown decision type ${decision} for application ${app.ApplicationId}`);
  }
}

function getTaxationReportedTaxFilingAndYear(app: types.DecoratedApplication): types.TaxationTuple {
  if (app.taxation['2019 CBT']) {
    return [types.TaxationReportedTaxFilingValues.CBT, types.RevenueYears._2019];
  }

  if (app.taxation['2019 Part']) {
    return [types.TaxationReportedTaxFilingValues.Partnership, types.RevenueYears._2019];
  }

  if (app.taxation['2019 TGI']) {
    return [types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC, types.RevenueYears._2019];
  }

  if (app.taxation['2018 CBT']) {
    return [types.TaxationReportedTaxFilingValues.CBT, types.RevenueYears._2018];
  }

  if (app.taxation['2018 Part']) {
    return [types.TaxationReportedTaxFilingValues.Partnership, types.RevenueYears._2018];
  }

  if (app.taxation['2018 TGI']) {
    return [types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC, types.RevenueYears._2018];
  }

  return [types.TaxationReportedTaxFilingValues.None, null];
}

function getTaxationReportedRevenue(app: types.DecoratedApplication): types.NullableNumber {
  const [filing, year]: types.TaxationTuple = getTaxationReportedTaxFilingAndYear(app);

  // revenue is only relevant to CBT filers (we don't have it for Part/TGI filers)
  if (filing !== types.TaxationReportedTaxFilingValues.CBT) {
    return null;
  }

  switch (year) {
    case types.RevenueYears._2019:
      return app.taxation['2019 CBT Amt'];
    case types.RevenueYears._2018:
      return app.taxation['2018 CBT Amt'];
    default:
      throw new Error(`Unexpected tax filing year ${year} for application ${app.ApplicationId}`);
  }
}

function getTaxationReportedSolePropIncome(app: types.DecoratedApplication): types.NullableNumber {
  const [filing, year]: types.TaxationTuple = getTaxationReportedTaxFilingAndYear(app);

  // sole prop income is only relevant to Part/TGI filers
  if (
    filing !== types.TaxationReportedTaxFilingValues.Partnership &&
    filing !== types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC
  ) {
    return null;
  }

  switch (year) {
    case types.RevenueYears._2019:
      return filing === types.TaxationReportedTaxFilingValues.Partnership
        ? app.taxation['2019 Part Amt']
        : app.taxation['2019 TGI Amt'];
    case types.RevenueYears._2018:
      return filing === types.TaxationReportedTaxFilingValues.Partnership
        ? app.taxation['2018 Part Amt']
        : app.taxation['2018 TGI Amt'];
    default:
      throw new Error(`Unexpected tax filing year ${year} for application ${app.ApplicationId}`);
  }
}

function getTaxationSalesTax2019(app: types.DecoratedApplication): types.NullableNumber {
  return app.taxation['S&U A 19'] + app.taxation['S&U M 19'] || null;
}

function getTaxationSalesTax2020(app: types.DecoratedApplication): types.NullableNumber {
  const sum: number = app.taxation['S&U A 20'] + app.taxation['S&U M 20'];

  // if 2019 but no 2020, return 0 for 2020 rather than null
  if (!sum) {
    return getTaxationSalesTax2019(app) ? sum : null;
  }

  return sum;
}

// goal: guard against 2019 over-reporting (to inflate need)
function getReportedRevenueReasonableness(app: types.DecoratedApplication): types.YesNoNA {
  if (typeof app.RevenueComparison_MarchAprilMay2019 === 'undefined') {
    // TODO: flag for review
    return 'NA';
  }

  const PERCENT_TOLERANCE: number = 0.2;
  const selfReportedAnnual2019: number = app.RevenueComparison_MarchAprilMay2019 * 4;
  const selfReportedAnnual2020: number = app.RevenueComparison_MarchAprilMay2020 * 4;
  const [filing, year]: types.TaxationTuple = getTaxationReportedTaxFilingAndYear(app);

  // no tax data
  if (filing === types.TaxationReportedTaxFilingValues.None) {
    const su2019 = app.taxation['S&U A 19'] + app.taxation['S&U M 19'];
    const su2020 = app.taxation['S&U A 20'] + app.taxation['S&U M 20'];

    if (su2019 && su2020) {
      return yesNo(su2020 < su2019);
    } else {
      // TODO: flag for review
      return 'NA';
    }
  }

  // we have revenue; ensure there's a need when bounding by it within our tolerance
  if (filing === types.TaxationReportedTaxFilingValues.CBT) {
    let taxationReportedAnnual: number;

    switch (year) {
      case types.RevenueYears._2019:
        taxationReportedAnnual = app.taxation['2019 CBT Amt'];
        break;
      case types.RevenueYears._2018:
        taxationReportedAnnual = app.taxation['2018 CBT Amt'];
        break;
      default:
        throw new Error(
          `Unexpected CBT filing year (${year}) for application ${app.ApplicationId}`
        );
    }

    const pastAnnualUpperBound = taxationReportedAnnual * (1 + PERCENT_TOLERANCE);
    const pastAnnualBounded = Math.min(selfReportedAnnual2019, pastAnnualUpperBound);

    return yesNo(selfReportedAnnual2020 < pastAnnualBounded);
  }

  // filing must be Partnership or TGI, both of which give us net profit (not gross revenue);
  // we extrapolate a gross revenue given an assumed profit margin and bound by it as above.
  const pastAnnualProfit: types.NullableNumber = getTaxationReportedSolePropIncome(app);

  if (pastAnnualProfit === null) {
    throw new Error(`Expected sole prop income for application ${app.ApplicationId}`);
  }

  if (pastAnnualProfit < 0) {
    return 'Yes';
  }

  const PRESUMED_PROFIT_MARGIN = 0.1;
  const presumedPastAnnualRevenue = pastAnnualProfit / PRESUMED_PROFIT_MARGIN;
  const presumedPastAnnualRevenueUpperBound = presumedPastAnnualRevenue * (1 + PERCENT_TOLERANCE);
  const presumedpastAnnualRevenueBounded = Math.min(
    selfReportedAnnual2019,
    presumedPastAnnualRevenueUpperBound
  );

  return yesNo(selfReportedAnnual2020 < presumedpastAnnualRevenueBounded);
}

// goal: guard against 2020 under-reporting (to inflate need)
function getYYRevenueDeclineReasonableness(app: types.DecoratedApplication): types.YesNoNA {
  if (typeof app.RevenueComparison_YearOverYearChange === 'undefined') {
    return 'NA';
  }

  switch (getCapacityOpen(app)) {
    case types.RemainOpenCapacities['100%']:
      return yesNo(!(app.RevenueComparison_YearOverYearChange <= -0.25));
    case types.RemainOpenCapacities['75%']:
      return yesNo(!(app.RevenueComparison_YearOverYearChange <= -0.5));
    case types.RemainOpenCapacities['50%']:
      return yesNo(!(app.RevenueComparison_YearOverYearChange <= -0.75));
    case types.RemainOpenCapacities['25%']:
      return yesNo(!(app.RevenueComparison_YearOverYearChange <= -1.0));
    case types.RemainOpenCapacities['Less than 10%']:
    case null:
      return 'Yes';
  }
}

export function generateOlaDatas(app: types.DecoratedApplication): types.OlaDatas {
  try {
    const olaDatas: types.OlaDatas = {
      Account: {
        Name: app.ContactInformation_BusinessName,
        DoingBusinessAs: app.ContactInformation_DoingBusinessAsDBA,
        Email: app.ContactInformation_Email,
        Telephone: app.ContactInformation_Phone,
        WebSiteURL: app.ContactInformation_Website,
        YearEstablished: app.Business_YearEstablished,
        AnnualRevenue: null,
        TaxClearanceComments: getTaxClearanceComments(app),
        ACHNonCompliance: '',
        address2Line1: '',
        address2Line2: '',
        address2City: '',
        address2Zip: '',
        address2State: '',
        address2County: '',
        address2Country: '',
        WomanOwned: flag(getDesignation(app, Designations.Woman_Owned)),
        VeteranOwned: flag(getDesignation(app, Designations.Veteran_Owned)),
        MinorityOwned: flag(getDesignation(app, Designations.Minority_Owned)),
        DisabilityOwned: flag(getDesignation(app, Designations.Disabled_Owned)),
        Comment: getDesignation(app, Designations.Small_Business)
          ? types.SmallBusinessStatuses.Yes
          : types.SmallBusinessStatuses.No,
        SSN: '',
      },
      Project: {
        StatusCode: 1,
        ProjectDescription: '',
      },
      Product: {
        DevelopmentOfficer: '',
        ServicingOfficerId: getServicingOfficer(app),
        AppReceivedDate: formatExcelDate(app.Entry_DateSubmitted),
        Amount: {
          Value: getAwardAmount(app),
          ExtensionData: null,
        },
        nol_total_NOL_benefit: null,
        nol_total_RD_benefit: null,
        benefit_allocation_factor: null,
        nol_prior_years_tax_credits_sold: null,
        ProductStatusId: getProductStatusId(app),
        ProductSubStatusId: getProductSubStatusId(app),
        ProductTypeId: '{BC60E150-ECA0-EA11-A811-001DD8018831}', // CVSB2GR
        LocatedInCommercialLocation: '',
        ProductDescription: '',
        lender: '',
        lenderAmount: {
          Value: 0,
          ExtensionData: null,
        },
        lender_address_1: '',
        lender_address_2: '',
        lender_city: '',
        lender_zipcode: '',
        lender_email: '',
        lender_phone: '',
      },
      Underwriting: {
        salutation: '',
        firstName: app.ContactInformation_ContactName_First,
        middleName: '',
        lastName: app.ContactInformation_ContactName_Last,
        suffix: '',
        jobTitle: '',
        address1: app.ContactInformation_PrimaryBusinessAddress_Line1,
        address2: app.ContactInformation_PrimaryBusinessAddress_Line2,
        city: app.geography.City,
        zipcode: app.geography.Zip,
        telephone: app.ContactInformation_Phone.split(' x')[0].replace(/\D/g, ''),
        telephoneExt: app.ContactInformation_Phone.split(' x')[1] || '',
        email: app.ContactInformation_Email,
        organizationName: app.ContactInformation_BusinessName,
        knownAs: app.ContactInformation_DoingBusinessAsDBA,
        ein: app.Business_TIN,
        naicsCode: app.NAICSCode,
        ownershipStructure: getOwnershipStructure(app),
        applicantBackground: getApplicantBackground(app),
        headquarterState: '',
        headquarterCountry: '',
        landAcquisitions: null,
        newBldgConstruction: null,
        acquisitionExistingBuilding: null,
        existingBldgRvnt: null,
        upgradeEquipment: {
          Value: null,
          ExtensionData: null,
        },
        newEquipment: {
          Value: null,
          ExtensionData: null,
        },
        usedEquipment: {
          Value: null,
          ExtensionData: null,
        },
        engineerArchitechFees: {
          Value: null,
          ExtensionData: null,
        },
        legalFees: null,
        accountingFees: null,
        financeFees: null,
        roadUtilitiesConst: {
          Value: null,
          ExtensionData: null,
        },
        debtServiceReserve: null,
        constructionInterest: {
          Value: null,
          ExtensionData: null,
        },
        refinancing: {
          Value: null,
          ExtensionData: null,
        },
        workingCapital: {
          Value: null,
          ExtensionData: null,
        },
        otherCost1: null,
        otherCost2: null,
        otherCost3: null,
        otherCost1Description: null,
        otherCost2Description: null,
        otherCost3Description: null,
        counselFirmName: '',
        counselFirstName: '',
        counselLastName: '',
        counselStreetAddress1: '',
        counselStreetAddress2: '',
        counselCity: '',
        counselState: '',
        counselZipCode: '',
        counselPhoneNumber: '',
        counselEmailAddress: '',
        accountantFirmName: '',
        accountantFirstName: '',
        accountantLastName: '',
        accountantStreetAddress1: '',
        accountantStreetAddress2: '',
        accountantCity: '',
        accountantState: '',
        accountantZipCode: '',
        accountantPhoneNumber: '',
        accountantEmailAddress: '',
        totalCost: {
          Value: null,
          ExtensionData: null,
        },
        applicationID: app.ApplicationId,
        selectedProducts: 'Covid Small Business Emergency Assistance Grant Phase 2',
        ReceivedPreiousFundingFromEDA: '',
        ReceivedPreiousFundingFromOtherthanEDA: '',
        TotalFullTimeEligibleJobs: getQuarterlyWageData(app)[0],
        NJFullTimeJobsAtapplication: app.Business_W2EmployeesFullTime,
        PartTimeJobsAtapplication: app.Business_W2EmployeesPartTime,
        softCosts: {
          Value: null,
          ExtensionData: null,
        },
        relocationCosts: {
          Value: null,
          ExtensionData: null,
        },
        securityCosts: {
          Value: null,
          ExtensionData: null,
        },
        titleCosts: {
          Value: null,
          ExtensionData: null,
        },
        surveyCosts: {
          Value: null,
          ExtensionData: null,
        },
        marketAnalysisCosts: {
          Value: null,
          ExtensionData: null,
        },
        developmentImpactCosts: {
          Value: null,
          ExtensionData: null,
        },
        marketSiteCosts: {
          Value: null,
          ExtensionData: null,
        },
        demolitionCosts: null,
        streetscapeCosts: null,
        remediationCosts: {
          Value: null,
          ExtensionData: null,
        },
        redemptionPremiumCosts: null,
        installationMachineryCosts: null,
        totalProjectCost: null,
        financeAmtApplied: {
          Value: null,
          ExtensionData: null,
        },
      },
      Location: {
        isRelocation: null,
        isExpansion: null,
        isStartup: null,
        address1Line1: app.ContactInformation_PrimaryBusinessAddress_Line1,
        address1Line2: app.ContactInformation_PrimaryBusinessAddress_Line2,
        address1City: app.geography.City,
        address1Zip: app.geography.Zip,
        address1State: 'NJ',
        address1County: app.geography.County,
        address1Municipality: app.geography.Municipality,
        address1Country: '',
        block: '',
        lot: '',
        congressionalDistrict: app.geography.CongressionalDistrict,
        legislativeDistrict: app.geography.LegislativeDistrict,
        censusTract: app.policyMap?.censusTract || null,
        Comments: `Home-Based Business: ${
          bool(app.BusinessDetails_HomeBasedBusiness) ? 'Yes' : 'No'
        }`,
        EligibleOpportunityZone: getEligibleOpportunityZoneValue(app),
      },
      FeeRequest: {
        receivedDate: null,
        receivedAmt: null,
        confirmationNum: '',
        productFeeAmount: null,
      },
      Monitoring: {
        Status: getMonitoringStatus(app),
        MonitoringType: getMonitoringType(app),
        Findings: getFindingsString(app),
        CompletionDate: getDecision(app) === types.Decision.Review ? null : formatDate(new Date()),
        GeneralComments: `Other Workers (1099, seasonal, PEO): ${app.Business_Contractors}`,
      },
      Covid19Impacts: {
        ApplicationLanguage: app.Language,
        Grant1applicationID: app.grantPhase1?.['OLA Application ID '] || null,
        ApplicationSequenceID: app.Sequence,
        OntheSAMSExclusionList: yesNo(app.sams.possibleMatches.length > 0),
        DeemedAsEssentialBusiness: yesNo(bool(app.COVID19Impact_EssentialBusiness)),
        RemainOpenMar2020: yesNo(bool(app.COVID19Impact_OpenOrReopened)),
        CapacityOpen: getCapacityOpen(app),
        ActualRevenue2019: {
          Value: amountValue(app.RevenueComparison_MarchAprilMay2019),
          ExtensionData: null,
        },
        ActualRevenue2020: {
          Value: amountValue(app.RevenueComparison_MarchAprilMay2020),
          ExtensionData: null,
        },
        UseofFunds: 'Business Interruption - Loss of Revenue',
        TaxationReportedRevenue: {
          Value: getTaxationReportedRevenue(app),
          ExtensionData: null,
        },
        TaxationReportedRevenueYear: getTaxationReportedTaxFilingAndYear(app)[1],
        TaxationSalesTax2019: {
          Value: getTaxationSalesTax2019(app),
          ExtensionData: null,
        },
        TaxationSalesTax2020: {
          Value: getTaxationSalesTax2020(app),
          ExtensionData: null,
        },
        TaxationReportedTaxFiling: getTaxationReportedTaxFilingAndYear(app)[0],
        TaxationReportedSolePropIncome: {
          Value: getTaxationReportedSolePropIncome(app),
          ExtensionData: null,
        },
        ReportedRevenueReasonable: getReportedRevenueReasonableness(app),
        YYRevenueDeclineReasonable: getYYRevenueDeclineReasonableness(app),
        ReasonablenessExceptions: '', // TODO?
        DOLWR30FilingQuarter: getQuarterlyWageData(app)[1],
        WR30ReportingComments: app.wr30.notFound
          ? types.WR30ReportingComments.WR30_Not_Found
          : types.WR30ReportingComments.WR30_Found,
      },
      OtherCovid19Assistance: {
        IsExists: yesNo(
          bool(app.DOBAffidavit_SBAPPP) ||
            bool(app.DOBAffidavit_SBAEIDG) ||
            bool(app.DOBAffidavit_SBAEIDL) ||
            bool(app.DOBAffidavit_NJEDALoan) ||
            bool(app.DOBAffidavit_NJEDAGrant) ||
            bool(app.DOBAffidavit_OtherStateLocal)
        ),
      },
      OtherCovid19Assistance_PPP: {
        IsExists: yesNo(bool(app.DOBAffidavit_SBAPPP)),
        Program: types.ProgramDescriptions.PPP,
        Status: getDobApproval(
          app.DOBAffidavit_SBAPPP,
          app.DOBAffidavit_SBAPPPDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_SBAPPP,
          app.DOBAffidavit_SBAPPPDetails_Status_Value,
          app.DOBAffidavit_SBAPPPDetails_ApprovalDate
        ),
        ApprovedAmount: {
          Value: getDobAmountValue(app.DOBAffidavit_SBAPPP, app.DOBAffidavit_SBAPPPDetails_Amount),
          ExtensionData: null,
        },
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_SBAPPP,
          app.DOBAffidavit_SBAPPPDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_EIDG: {
        IsExists: yesNo(bool(app.DOBAffidavit_SBAEIDG)),
        Program: types.ProgramDescriptions.EIDG,
        Status: getDobApproval(
          app.DOBAffidavit_SBAEIDG,
          app.DOBAffidavit_SBAEIDGDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_SBAEIDG,
          app.DOBAffidavit_SBAEIDGDetails_Status_Value,
          app.DOBAffidavit_SBAEIDGDetails_ApprovalDate
        ),
        ApprovedAmount: {
          Value: getDobAmountValue(
            app.DOBAffidavit_SBAEIDG,
            app.DOBAffidavit_SBAEIDGDetails_Amount
          ),
          ExtensionData: null,
        },
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_SBAEIDG,
          app.DOBAffidavit_SBAEIDGDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_EIDL: {
        IsExists: yesNo(bool(app.DOBAffidavit_SBAEIDL)),
        Program: types.ProgramDescriptions.EIDL,
        Status: getDobApproval(
          app.DOBAffidavit_SBAEIDL,
          app.DOBAffidavit_SBAEIDLDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_SBAEIDL,
          app.DOBAffidavit_SBAEIDLDetails_Status_Value,
          app.DOBAffidavit_SBAEIDLDetails_ApprovalDate
        ),
        ApprovedAmount: {
          Value: getDobAmountValue(
            app.DOBAffidavit_SBAEIDL,
            app.DOBAffidavit_SBAEIDLDetails_Amount
          ),
          ExtensionData: null,
        },
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_SBAEIDL,
          app.DOBAffidavit_SBAEIDLDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_CVSBLO: {
        IsExists: yesNo(bool(app.DOBAffidavit_NJEDALoan)),
        Program: types.ProgramDescriptions.CVSBLO,
        Status: getDobApproval(
          app.DOBAffidavit_NJEDALoan,
          app.DOBAffidavit_NJEDALoanDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_NJEDALoan,
          app.DOBAffidavit_NJEDALoanDetails_Status_Value,
          app.DOBAffidavit_NJEDALoanDetails_ApprovalDate
        ),
        ApprovedAmount: {
          Value: getDobAmountValue(
            app.DOBAffidavit_NJEDALoan,
            app.DOBAffidavit_NJEDALoanDetails_Amount
          ),
          ExtensionData: null,
        },
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_NJEDALoan,
          app.DOBAffidavit_NJEDALoanDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_CVSBGR: {
        IsExists: yesNo(bool(app.DOBAffidavit_NJEDAGrant)),
        Program: types.ProgramDescriptions.CVSBGR,
        Status: getDobApproval(
          app.DOBAffidavit_NJEDAGrant,
          app.DOBAffidavit_NJEDAGrantDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_NJEDAGrant,
          app.DOBAffidavit_NJEDAGrantDetails_Status_Value,
          app.DOBAffidavit_NJEDAGrantDetails_ApprovalDate
        ),
        ApprovedAmount: {
          Value: getDobAmountValue(
            app.DOBAffidavit_NJEDAGrant,
            app.DOBAffidavit_NJEDAGrantDetails_Amount
          ),
          ExtensionData: null,
        },
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_NJEDAGrant,
          app.DOBAffidavit_NJEDAGrantDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_Other: {
        IsExists: yesNo(bool(app.DOBAffidavit_OtherStateLocal)),
        Program: types.ProgramDescriptions.Other,
        ProgramDescription: app.DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions,
        Status: null,
        ApprovalDate: null,
        ApprovedAmount: {
          Value: getDobAmountValue(
            app.DOBAffidavit_OtherStateLocal,
            app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess
          ),
          ExtensionData: null,
        },
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_OtherStateLocal,
          app.DOBAffidavit_OtherStateLocalDetails_Purposes_Value
        ),
      },
    };

    return olaDatas;
  } catch (e) {
    console.error(chalk.red('DecoratedApplication for the error below:'));
    console.dir(app, { depth: null });
    console.error(
      chalk.red(
        `Error found while generating OLA Datas for application ${app.ApplicationId} (printed above):`
      )
    );
    console.dir(e, { depth: null });

    throw e;
  }
}
