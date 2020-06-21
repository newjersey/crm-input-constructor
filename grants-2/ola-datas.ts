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
import { CleanStatus as TaxationCleanStatus } from './taxation';
import {
  bool,
  dateFromExcel,
  formatDate,
  formatExcelDate,
  formatDollars,
  formatPercent,
  isDobProgramApprovedOrInProgress,
} from './util';
import { ProductStatuses } from './grant-phase-1';
import {
  awardSize,
  awardBasis,
  grantPhase1AmountApproved,
  unmetNeed,
  discountedAwardBasis,
  yoyDecline,
  reducibleFunding,
} from './award-size';
import { getQuarterlyWageData } from './ola-datas-helpers';

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
    name: 'FTE Greater than 25',
    trigger: app => (getQuarterlyWageData(app).fteCount || 0) > 25,
    messageGenerator: app =>
      `Too Many FTE Equivalents: ${getQuarterlyWageData(app).fteCount} but should be at most 25`,
    severity: types.Decision.Decline,
  },
  {
    // unverified
    name: 'Received Phase 1 Funding >= Phase 2 Award Basis',
    trigger: app => grantPhase1AmountApproved(app) >= awardBasis(app),
    messageGenerator: app =>
      `Business received a NJEDA Emergency Phase 1 Grant (${
        app.grantPhase1?.['OLA Application ID ']
      } for ${formatDollars(
        grantPhase1AmountApproved(app)
      )}) and is not eligible for incremental funding based on WR-30 data (award basis: ${formatDollars(
        awardBasis(app)
      )})`,
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
      yoyDecline(app) !== null &&
      <number>yoyDecline(app) <= 0,
    messageGenerator: app =>
      `Capacity remained at 100% and self-reported YoY revenue did not decrease from 2019 to 2020`,
    severity: types.Decision.Decline,
  },
  {
    name: 'No Taxation record (excluding nonprofits)',
    trigger: app =>
      getOwnershipStructure(app) !== types.OwnershipStructures.Nonprofit &&
      isUnknownToTaxation(app),
    messageGenerator: app =>
      `Business is a ${getOwnershipStructure(app)} (TIN: ${
        app.Business_TIN
      }) that is not registered with Taxation, did not file taxes with Taxation for 2018 or 2019, and did not file sales/usage taxes with Taxation in 2019 or 2020`,
    severity: types.Decision.Decline,
  },
  ////////////////////// Reviews below ////////////////////////
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
    messageGenerator: app =>
      `Business established in ${app.Business_YearEstablished} (${dateFromExcel(
        <number>app.Business_DateEstablished
      ).toLocaleDateString()})`,
    severity: types.Decision.Review,
  },
  {
    name: 'Religious Affiliation',
    trigger: app => bool(app.Business_Religious),
    messageGenerator: app => `Business has religious affiliations`,
    severity: types.Decision.Review,
  },
  {
    name: 'Lobbying and Political Activities',
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
      `Applicant reported an unreasonably high YoY revenue decline (${formatPercent(
        <number>app.RevenueComparison_YearOverYearChange
      )}) given business operational capacity (${getCapacityOpen(app)})`,
    severity: types.Decision.Review,
  },
  {
    name: 'No unmet need',
    trigger: app => unmetNeed(app) === 0,
    messageGenerator: app =>
      `Business does not have an unmet need based on YoY revenue loss (${formatDollars(
        <number>yoyDecline(app)
      )}) and other disaster resources pending or received (${formatDollars(
        reducibleFunding(app)
      )})`,
    severity: types.Decision.Review,
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
    severity: types.Decision.Review,
  },
  {
    name: 'Missing WR-30 but expect employees',
    trigger: app =>
      app.wr30.notFound &&
      (app.Business_W2EmployeesFullTime >= 2 || app.Business_W2EmployeesPartTime >= 3),
    messageGenerator: app =>
      `No WR-30 found for applicant, but applicant reported ${app.Business_W2EmployeesFullTime} full-time W2 employees and ${app.Business_W2EmployeesPartTime} part-time W2 employees`,
    severity: types.Decision.Review,
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
    severity: types.Decision.Review,
  },
  {
    name: 'No Taxation record (nonprofits)',
    trigger: app =>
      getOwnershipStructure(app) === types.OwnershipStructures.Nonprofit &&
      isUnknownToTaxation(app),
    messageGenerator: app =>
      `Business is a ${getNonprofitType(app)} ${getOwnershipStructure(
        app
      )} that is not registered with Taxation, did not file taxes with Taxation for 2018 or 2019, and did not file sales/usage taxes with Taxation in 2019 or 2020`,
    severity: types.Decision.Review,
  },
  {
    name: 'Known to Taxation but no filings',
    trigger: app =>
      app.taxation['Clean Ind'] !== 'X' && getReportedRevenueReasonableness(app) === 'N/A',
    messageGenerator: app => `Organization is recognized by Taxation, but has no Taxation filings`,
    severity: types.Decision.Review,
  },
  {
    name: 'CBT filer reports unreasonably high 2019 revenue',
    trigger: app => isSelfReportedRevenueReasonableForCbtFiler(app)[0] === false,
    messageGenerator: app =>
      `Applicant's 2019 3-month actual revenues reported on application are ${formatPercent(
        <number>isSelfReportedRevenueReasonableForCbtFiler(app)[1]
      )} higher than their ${
        isSelfReportedRevenueReasonableForCbtFiler(app)[2]
      } revenues reported by Taxation`,
    severity: types.Decision.Review,
  },
  {
    name: 'TGI/Partnership filer reports unreasonably high 2019 revenue',
    trigger: app => isSelfReportedRevenueReasonableForPartOrTgiFiler(app)[0] === false,
    messageGenerator: app =>
      `Applicant's 2019 self-reported actuals (${formatDollars(
        <number>app.RevenueComparison_MarchAprilMay2019
      )}) may not be reasonable given their ${
        isSelfReportedRevenueReasonableForPartOrTgiFiler(app)[2]
      } Taxation reported net income of ${formatDollars(
        <number>getTaxationReportedNetIncomeLoss(app)
      )}`,
    severity: types.Decision.Review,
  },
  {
    name: 'Other program indicated but amount is 0 (PPP)',
    trigger: app =>
      bool(app.DOBAffidavit_SBAPPP) &&
      isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAPPPDetails_Status_Value) &&
      !app.DOBAffidavit_SBAPPPDetails_Amount,
    messageGenerator: app =>
      `Applicant reported PPP funding approved or in progress but did not indicate the amount`,
    severity: types.Decision.Review,
  },
  {
    name: 'Other program indicated but amount is 0 (EIDG)',
    trigger: app =>
      bool(app.DOBAffidavit_SBAEIDG) &&
      isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAEIDGDetails_Status_Value) &&
      !app.DOBAffidavit_SBAEIDGDetails_Amount,
    messageGenerator: app =>
      `Applicant reported EIDG funding approved or in progress but did not indicate the amount`,
    severity: types.Decision.Review,
  },
  {
    name: 'Other program indicated but amount is 0 (other stat/local)',
    trigger: app =>
      bool(app.DOBAffidavit_OtherStateLocal) &&
      !app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess,
    messageGenerator: app =>
      `Applicant reported other disaster funding approved or in progress ("${app.DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions}") but did not indicate the amount`,
    severity: types.Decision.Review,
  },
  // UNVERIFIED--
  // keep these last, since they could include long text:
  {
    name: 'Background Question #1 (convictions)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion1),
    messageGenerator: app =>
      `Additional information provided on background question #1 (convictions): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails1}"`,
    severity: types.Decision.Review,
  },
  {
    name: 'Background Question #2 (denied licensure)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion2),
    messageGenerator: app =>
      `Additional information provided on background question #2 (denied licensure): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails2}"`,
    severity: types.Decision.Review,
  },
  {
    name: 'Background Question #3 (public contractor subcontract ineligibility)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion3),
    messageGenerator: app =>
      `Additional information provided on background question #3 (public contractor subcontract ineligibility): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails3}"`,
    severity: types.Decision.Review,
  },
  {
    name: 'Background Question #4 (violated the terms of a public agreement)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion4),
    messageGenerator: app =>
      `Additional information provided on background question #4 (violated the terms of a public agreement): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails4}"`,
    severity: types.Decision.Review,
  },
  {
    name: 'Background Question #5 (injunction, order or lien)',
    trigger: app => bool(app.AdditionalBackgroundInformation_BackgroundQuestion5),
    messageGenerator: app =>
      `Additional information provided on background question #5 (injunction, order or lien): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails5}"`,
    severity: types.Decision.Review,
  },
  {
    name: 'Background Question #6 (presently indicted)',
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

function getGrantPhase1Status(app: types.DecoratedApplication): types.ProgramApprovals | null {
  if (typeof app.grantPhase1 === 'undefined') {
    return null;
  }

  const status: ProductStatuses | undefined = app.grantPhase1['Product Status'];

  switch (status) {
    case ProductStatuses.Closed:
    case ProductStatuses.Closing:
      return types.ProgramApprovals.Approved;
    case ProductStatuses.Underwriting:
      return types.ProgramApprovals.In_Process;
    case ProductStatuses.Ended:
      return types.ProgramApprovals.Declined;
    default:
      throw new Error(`Unexpected grant phase 1 status: ${status}`);
  }
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

function value(number?: number | null): types.Value {
  if (number === null || typeof number === 'undefined') {
    return null;
  }

  const valueObject: types.ValueObject = {
    Value: number,
    ExtensionData: null,
  };

  return valueObject;
}

function getDobAmountValue(
  indicated: Application_YesNo,
  number: number | undefined
): number | undefined {
  // program not selected (but value might be present from user changing their mind)
  if (!bool(indicated)) {
    return undefined;
  }

  return number;
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

function getNonprofitType(app: types.DecoratedApplication): types.NullableString {
  switch (app.Business_EntityType_Value) {
    case EntityType.Nonprofit_501c3:
      return '501(c)(3)';
    case EntityType.Nonprofit_501c4:
      return '501(c)(4)';
    case EntityType.Nonprofit_501c6:
      return '501(c)(6)';
    case EntityType.Nonprofit_501c7:
      return '501(c)(7)';
    case EntityType.Nonprofit_501c19:
      return '501(c)(19)';
    case EntityType.Nonprofit_Other:
      return `"${app.Business_NonprofitClassification}"`;
    default:
      return null;
  }
}

function getApplicantBackground(app: types.DecoratedApplication): string {
  let nonprofitType: types.NullableString = getNonprofitType(app);

  return nonprofitType ? `Nonprofit type: ${nonprofitType}` : '';
}

export function getFindings(app: types.DecoratedApplication): types.Finding[] {
  const findings: types.Finding[] = FINDING_DEFINITIONS.filter(def => def.trigger(app)).map(
    def => ({
      message: def.messageGenerator(app),
      severity: def.severity,
      name: def.name,
    })
  );

  return findings;
}

function getFindingsString(app: types.DecoratedApplication): types.NullableString {
  const findings: types.Finding[] = getFindings(app);
  const findingsString = findings
    .map((finding, i) => `(#${i + 1}: ${finding.severity}) ${finding.message}`)
    .join('. ');

  return findingsString ? `${findingsString}.` : null;
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

function getTaxationReportedTaxFilingAndYear(
  app: types.DecoratedApplication
): types.TaxationFiling {
  if (app.taxation['2019 CBT']) {
    return { type: types.TaxationReportedTaxFilingValues.CBT, year: types.RevenueYears._2019 };
  }

  if (app.taxation['2019 Part']) {
    return {
      type: types.TaxationReportedTaxFilingValues.Partnership,
      year: types.RevenueYears._2019,
    };
  }

  if (app.taxation['2019 TGI']) {
    return {
      type: types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC,
      year: types.RevenueYears._2019,
    };
  }

  if (app.taxation['2018 CBT']) {
    return { type: types.TaxationReportedTaxFilingValues.CBT, year: types.RevenueYears._2018 };
  }

  if (app.taxation['2018 Part']) {
    return {
      type: types.TaxationReportedTaxFilingValues.Partnership,
      year: types.RevenueYears._2018,
    };
  }

  if (app.taxation['2018 TGI']) {
    return {
      type: types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC,
      year: types.RevenueYears._2018,
    };
  }

  return { type: types.TaxationReportedTaxFilingValues.None, year: null };
}

function getTaxationReportedRevenue(app: types.DecoratedApplication): types.NullableNumber {
  const { type, year }: types.TaxationFiling = getTaxationReportedTaxFilingAndYear(app);

  // revenue is only relevant to CBT filers (we don't have it for Part/TGI filers)
  if (type !== types.TaxationReportedTaxFilingValues.CBT) {
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

function getTaxationReportedNetIncomeLoss(app: types.DecoratedApplication): types.NullableNumber {
  const { type, year }: types.TaxationFiling = getTaxationReportedTaxFilingAndYear(app);

  // sole prop income is only relevant to Part/TGI filers
  if (
    type !== types.TaxationReportedTaxFilingValues.Partnership &&
    type !== types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC
  ) {
    return null;
  }

  switch (year) {
    case types.RevenueYears._2019:
      return type === types.TaxationReportedTaxFilingValues.Partnership
        ? app.taxation['2019 Part Amt']
        : app.taxation['2019 TGI Amt'];
    case types.RevenueYears._2018:
      return type === types.TaxationReportedTaxFilingValues.Partnership
        ? app.taxation['2018 Part Amt']
        : app.taxation['2018 TGI Amt'];
    default:
      throw new Error(`Unexpected tax filing year ${year} for application ${app.ApplicationId}`);
  }
}

function isUnknownToTaxation(app: types.DecoratedApplication): boolean {
  return (
    getTaxationReportedTaxFilingAndYear(app).type == types.TaxationReportedTaxFilingValues.None &&
    app.taxation['Clean Ind'] === TaxationCleanStatus.Not_Found &&
    app.taxation['S&U A 19'] === 0 &&
    app.taxation['S&U M 19'] === 0 &&
    app.taxation['S&U A 20'] === 0 &&
    app.taxation['S&U M 20'] === 0
  );
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

// how much higher is self-reported revenue compared to a known benchmark?
function revenuePercentOverBenchmark(
  app: types.DecoratedApplication,
  benchmarkAnnual: number
): number | undefined {
  // no basis for comparison: company is too new (didn't ask for 2019 data)
  if (typeof app.RevenueComparison_MarchAprilMay2019 === 'undefined') {
    return undefined;
  }

  const selfReportedAnnual2019: number = app.RevenueComparison_MarchAprilMay2019 * 4;

  return selfReportedAnnual2019 / benchmarkAnnual - 1;
}

function isSelfReportedRevenueReasonable(
  app: types.DecoratedApplication,
  benchmarkAnnual: number
): [boolean | undefined, number | undefined] {
  const PERCENT_TOLERANCE: number = 0.2;
  const percentOverBenchmark: number | undefined = revenuePercentOverBenchmark(
    app,
    benchmarkAnnual
  );

  if (typeof percentOverBenchmark === 'undefined') {
    return [undefined, undefined];
  }

  return [percentOverBenchmark < PERCENT_TOLERANCE, percentOverBenchmark];
}

function isSelfReportedRevenueReasonableForCbtFiler(
  app: types.DecoratedApplication
): [boolean | undefined, number | undefined, types.RevenueYears | undefined] {
  const { type, year }: types.TaxationFiling = getTaxationReportedTaxFilingAndYear(app);

  // not a CBT filer
  if (type !== types.TaxationReportedTaxFilingValues.CBT) {
    return [undefined, undefined, undefined];
  }

  let taxationReportedAnnual: number;

  switch (year) {
    case types.RevenueYears._2019:
      taxationReportedAnnual = app.taxation['2019 CBT Amt'];
      break;
    case types.RevenueYears._2018:
      taxationReportedAnnual = app.taxation['2018 CBT Amt'];
      break;
    default:
      throw new Error(`Unexpected CBT filing year (${year}) for application ${app.ApplicationId}`);
  }

  return [...isSelfReportedRevenueReasonable(app, taxationReportedAnnual), year];
}

// if filing is Partnership or TGI, we get net profit (not gross revenue); we extrapolate a presumed
// gross revenue given an assumed profit margin, and proceed with comparison the same as with revenue.
function isSelfReportedRevenueReasonableForPartOrTgiFiler(
  app: types.DecoratedApplication
): [boolean | undefined, number | undefined, types.RevenueYears | undefined] {
  const { type, year }: types.TaxationFiling = getTaxationReportedTaxFilingAndYear(app);

  // not a Part or TGI filer
  if (
    type !== types.TaxationReportedTaxFilingValues.Partnership &&
    type !== types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC
  ) {
    return [undefined, undefined, undefined];
  }

  const pastAnnualProfit: types.NullableNumber = getTaxationReportedNetIncomeLoss(app);

  if (pastAnnualProfit === null) {
    throw new Error(`Expected sole prop income for application ${app.ApplicationId}`);
  }

  if (pastAnnualProfit <= 0) {
    return [true, undefined, year || undefined];
  }

  const PRESUMED_PROFIT_MARGIN = 0.1;
  const presumedPastAnnualRevenue = pastAnnualProfit / PRESUMED_PROFIT_MARGIN;

  return [...isSelfReportedRevenueReasonable(app, presumedPastAnnualRevenue), year || undefined];
}

function getSalesTaxPercentChange(app: types.DecoratedApplication): number | undefined {
  const su2019 = app.taxation['S&U A 19'] + app.taxation['S&U M 19'];
  const su2020 = app.taxation['S&U A 20'] + app.taxation['S&U M 20'];

  if (su2019 && su2020) {
    return (su2020 - su2019) / su2019;
  }

  return undefined;
}

// goal: guard against 2019 over-reporting (to inflate need)
function getReportedRevenueReasonableness(app: types.DecoratedApplication): types.YesNoNA {
  if (typeof isSelfReportedRevenueReasonableForCbtFiler(app)[0] !== 'undefined') {
    return yesNo(<boolean>isSelfReportedRevenueReasonableForCbtFiler(app)[0]);
  }

  if (typeof isSelfReportedRevenueReasonableForPartOrTgiFiler(app)[0] !== 'undefined') {
    return yesNo(<boolean>isSelfReportedRevenueReasonableForPartOrTgiFiler(app)[0]);
  }

  if (typeof getSalesTaxPercentChange(app) !== 'undefined') {
    return yesNo(<number>getSalesTaxPercentChange(app) <= 0);
  }

  return 'N/A';
}

// goal: guard against 2020 under-reporting (to inflate need)
function getYYRevenueDeclineReasonableness(app: types.DecoratedApplication): types.YesNoNA {
  if (typeof app.RevenueComparison_YearOverYearChange === 'undefined') {
    return 'N/A';
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

function getReasonablenessExceptions(app: types.DecoratedApplication): string {
  const messages: string[] = [];
  const netIncomeLoss: types.NullableNumber = getTaxationReportedNetIncomeLoss(app);
  const salesTaxPercentChange: number | undefined = getSalesTaxPercentChange(app);

  if (netIncomeLoss !== null && netIncomeLoss <= 0) {
    messages.push(
      'The business as reported to Taxation is operating at a loss or breakeven, therefore the business has a reasonable need.'
    );
  }

  if (
    getTaxationReportedTaxFilingAndYear(app).type == types.TaxationReportedTaxFilingValues.None &&
    typeof salesTaxPercentChange !== 'undefined' &&
    salesTaxPercentChange <= 0
  ) {
    messages.push(
      'The applicant has reported Sales and Use Tax for 2019 and 2020, is deemed to have filed taxes, and has revenue numbers that are reasonable.'
    );
  }

  return messages.join(' ');
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
        Amount: value(awardSize(app)),
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
        lenderAmount: value(),
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
        upgradeEquipment: value(),
        newEquipment: value(),
        usedEquipment: value(),
        engineerArchitechFees: value(),
        legalFees: null,
        accountingFees: null,
        financeFees: null,
        roadUtilitiesConst: value(),
        debtServiceReserve: null,
        constructionInterest: value(),
        refinancing: value(),
        workingCapital: value(),
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
        totalCost: value(),
        applicationID: app.ApplicationId,
        selectedProducts: 'Covid Small Business Emergency Assistance Grant Phase 2',
        ReceivedPreiousFundingFromEDA: '',
        ReceivedPreiousFundingFromOtherthanEDA: '',
        TotalFullTimeEligibleJobs: getQuarterlyWageData(app).fteCount,
        NJFullTimeJobsAtapplication: app.Business_W2EmployeesFullTime,
        PartTimeJobsAtapplication: app.Business_W2EmployeesPartTime,
        softCosts: value(),
        relocationCosts: value(),
        securityCosts: value(),
        titleCosts: value(),
        surveyCosts: value(),
        marketAnalysisCosts: value(),
        developmentImpactCosts: value(),
        marketSiteCosts: value(),
        demolitionCosts: null,
        streetscapeCosts: null,
        remediationCosts: value(),
        redemptionPremiumCosts: null,
        installationMachineryCosts: null,
        totalProjectCost: null,
        financeAmtApplied: value(),
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
        ActualRevenue2019: value(app.RevenueComparison_MarchAprilMay2019),
        ActualRevenue2020: value(app.RevenueComparison_MarchAprilMay2020),
        UseofFunds: 'Business Interruption - Loss of Revenue',
        TaxationReportedRevenue: value(getTaxationReportedRevenue(app)),
        TaxationReportedRevenueYear: getTaxationReportedTaxFilingAndYear(app).year,
        TaxationSalesTax2019: value(getTaxationSalesTax2019(app)),
        TaxationSalesTax2020: value(getTaxationSalesTax2020(app)),
        TaxationReportedTaxFiling: getTaxationReportedTaxFilingAndYear(app).type,
        TaxationReportedSolePropIncome: value(getTaxationReportedNetIncomeLoss(app)),
        ReportedRevenueReasonable: getReportedRevenueReasonableness(app),
        YYRevenueDeclineReasonable: getYYRevenueDeclineReasonableness(app),
        ReasonablenessExceptions: getReasonablenessExceptions(app),
        DOLWR30FilingQuarter: getQuarterlyWageData(app).quarterDesc,
        WR30ReportingComments: getWr30ReportingComments(app),
      },
      OtherCovid19Assistance: {
        IsExists: yesNo(
          bool(app.DOBAffidavit_SBAPPP) ||
            bool(app.DOBAffidavit_SBAEIDG) ||
            bool(app.DOBAffidavit_SBAEIDL) ||
            !!app.nonDeclinedEdaLoan ||
            !!app.grantPhase1 ||
            bool(app.DOBAffidavit_OtherStateLocal)
        ),
      },
      OtherCovid19Assistance_PPP: {
        IsExists: yesNo(bool(app.DOBAffidavit_SBAPPP)),
        PartofUnMetCalculation: yesNo(true),
        Program: types.ProgramDescriptions.PPP,
        ProgramDescription: null,
        Status: getDobApproval(
          app.DOBAffidavit_SBAPPP,
          app.DOBAffidavit_SBAPPPDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_SBAPPP,
          app.DOBAffidavit_SBAPPPDetails_Status_Value,
          app.DOBAffidavit_SBAPPPDetails_ApprovalDate
        ),
        ApprovedAmount: value(
          getDobAmountValue(app.DOBAffidavit_SBAPPP, app.DOBAffidavit_SBAPPPDetails_Amount)
        ),
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_SBAPPP,
          app.DOBAffidavit_SBAPPPDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_EIDG: {
        IsExists: yesNo(bool(app.DOBAffidavit_SBAEIDG)),
        PartofUnMetCalculation: yesNo(true),
        Program: types.ProgramDescriptions.EIDG,
        ProgramDescription: null,
        Status: getDobApproval(
          app.DOBAffidavit_SBAEIDG,
          app.DOBAffidavit_SBAEIDGDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_SBAEIDG,
          app.DOBAffidavit_SBAEIDGDetails_Status_Value,
          app.DOBAffidavit_SBAEIDGDetails_ApprovalDate
        ),
        ApprovedAmount: value(
          getDobAmountValue(app.DOBAffidavit_SBAEIDG, app.DOBAffidavit_SBAEIDGDetails_Amount)
        ),
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_SBAEIDG,
          app.DOBAffidavit_SBAEIDGDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_EIDL: {
        IsExists: yesNo(bool(app.DOBAffidavit_SBAEIDL)),
        PartofUnMetCalculation: yesNo(false),
        Program: types.ProgramDescriptions.EIDL,
        ProgramDescription: null,
        Status: getDobApproval(
          app.DOBAffidavit_SBAEIDL,
          app.DOBAffidavit_SBAEIDLDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_SBAEIDL,
          app.DOBAffidavit_SBAEIDLDetails_Status_Value,
          app.DOBAffidavit_SBAEIDLDetails_ApprovalDate
        ),
        ApprovedAmount: value(
          getDobAmountValue(app.DOBAffidavit_SBAEIDL, app.DOBAffidavit_SBAEIDLDetails_Amount)
        ),
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_SBAEIDL,
          app.DOBAffidavit_SBAEIDLDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_CVSBLO: {
        IsExists: yesNo(!!app.nonDeclinedEdaLoan),
        PartofUnMetCalculation: yesNo(true),
        Program: types.ProgramDescriptions.CVSBLO,
        ProgramDescription: `OLA Application ID: ${app.nonDeclinedEdaLoan?.['OLA Application ID (Underwriting) (Underwriting)']}`,
        Status:
          typeof app.nonDeclinedEdaLoan?.['Approval Date'] === 'undefined'
            ? types.ProgramApprovals.In_Process
            : types.ProgramApprovals.Approved,
        ApprovalDate:
          typeof app.nonDeclinedEdaLoan?.['Approval Date'] === 'undefined'
            ? null
            : formatExcelDate(app.nonDeclinedEdaLoan['Approval Date']),
        ApprovedAmount: value(app.nonDeclinedEdaLoan?.Amount),
        PurposeOfFunds: null,
      },
      OtherCovid19Assistance_CVSBGR: {
        IsExists: yesNo(!!app.grantPhase1),
        PartofUnMetCalculation: yesNo(
          app.grantPhase1?.['Product Status'] !== ProductStatuses.Ended
        ),
        Program: types.ProgramDescriptions.CVSBGR,
        ProgramDescription: `OLA Application ID: ${app.grantPhase1?.['OLA Application ID ']}`,
        Status: getGrantPhase1Status(app),
        ApprovalDate:
          typeof app.grantPhase1?.['Approval Date'] === 'undefined'
            ? null
            : formatExcelDate(app.grantPhase1['Approval Date']),
        ApprovedAmount: value(app.grantPhase1?.Amount),
        PurposeOfFunds: null,
      },
      OtherCovid19Assistance_Other: {
        IsExists: yesNo(bool(app.DOBAffidavit_OtherStateLocal)),
        PartofUnMetCalculation: yesNo(true),
        Program: types.ProgramDescriptions.Other,
        ProgramDescription: app.DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions,
        Status: null,
        ApprovalDate: null,
        ApprovedAmount: value(
          getDobAmountValue(
            app.DOBAffidavit_OtherStateLocal,
            app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess
          )
        ),
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

function getWr30ReportingComments(app: types.DecoratedApplication): string {
  const comments: string[] = [];

  if (app.wr30.notFound) {
    comments.push(
      'Applicant did not file a WR-30, therefore possibly eligible for the minimum Grant Award of $1,000.'
    );
  }

  if (grantPhase1AmountApproved(app)) {
    comments.push(
      `Award basis of ${formatDollars(awardBasis(app))} reduced by ${formatDollars(
        grantPhase1AmountApproved(app)
      )} of Grant Phase 1 funding (${app.grantPhase1?.["OLA Application ID "]}).`
    );
  }

  return comments.join(' ');
}
