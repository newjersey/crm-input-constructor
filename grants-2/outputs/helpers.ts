import * as types from './types';

import {
  YesNo as Application_YesNo,
  Capacities,
  DOB_Purposes,
  DOB_Status,
  EntityType,
  Languages,
} from '../inputs/applications';
import { awardBasis, grantPhase1AmountApproved } from './award-size';
import { bool, formatDollars, formatExcelDate } from '../util';

import { EligibilityStatus as OZEligibilityStatus } from '../inputs/policy-map';
import { ProductStatuses } from '../inputs/grant-phase-1';
import { CleanStatus as TaxationCleanStatus } from '../inputs/taxation';
import { getFindings } from './findings';

export function yesNo(test: boolean): types.YesNo {
  return test ? 'Yes' : 'No';
}

export function flag(test: boolean): types.Flag {
  return test ? 'Yes' : '';
}

export function value(number?: number | null): types.Value {
  if (number === null || typeof number === 'undefined') {
    return null;
  }

  const valueObject: types.ValueObject = {
    Value: number,
    ExtensionData: null,
  };

  return valueObject;
}

export function getQuarterlyWageData(app: types.DecoratedApplication): types.QuarterlyWageData {
  if (app.wr30.notFound) {
    return {
      fteCount: null,
      quarterDesc: null,
    };
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

  const fteCount: number = Math.round(fractionalFtes);
  const quarterDesc: string = `Q${quarter} ${year}`;

  return {
    fteCount,
    quarterDesc,
  };
}

export function isDobProgramApprovedOrInProgress(dobStatusValue?: DOB_Status): boolean {
  return (
    (dobStatusValue || false) &&
    [DOB_Status.Approved, DOB_Status.In_Process].includes(dobStatusValue)
  );
}

export function getWr30ReportingComments(app: types.DecoratedApplication): string {
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
      )} of Grant Phase 1 funding (${app.grantPhase1?.['OLA']}).`
    );
  }

  return comments.join(' ');
}

export function getCapacityOpen(app: types.DecoratedApplication): types.CapacityOpen {
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

export function getTaxClearanceComments(app: types.DecoratedApplication): types.TaxClearanceValues {
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

export function getOwnershipStructure(app: types.DecoratedApplication): types.OwnershipStructures {
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

export function getGrantPhase1Status(
  app: types.DecoratedApplication
): types.ProgramApprovals | null {
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

export function getDesignation(app: types.DecoratedApplication, designation: number): boolean {
  return (app.Business_Designations_Value & designation) > 0;
}

let nextServicingOfficerIndexEN: number = 0;
function getNextServicingOfficerEN(test: boolean): types.ServicingOfficersEN | types.TEST_ServicingOfficersEN {
  const _enum = test ? types.TEST_ServicingOfficersEN : types.ServicingOfficersEN;
  const values = Object.values(_enum);
  const value: types.ServicingOfficersEN = values[nextServicingOfficerIndexEN];

  nextServicingOfficerIndexEN = (nextServicingOfficerIndexEN + 1) % values.length;

  return value;
}

let nextServicingOfficerIndexES: number = 0;
function getNextServicingOfficerES(test: boolean): types.ServicingOfficersES | types.TEST_ServicingOfficersES {
  const _enum = test ? types.TEST_ServicingOfficersES : types.ServicingOfficersES;
  const values = Object.values(_enum);
  const value: types.ServicingOfficersES = values[nextServicingOfficerIndexES];

  nextServicingOfficerIndexES = (nextServicingOfficerIndexES + 1) % values.length;

  return value;
}

export function getServicingOfficer(app: types.DecoratedApplication, test: boolean): types.ServicingOfficer {
  if (getDecision(app) !== types.Decision.Review) {
    return types.ServicingOfficersExternal.Richard_Toro;
  }

  switch (app.Language) {
    case Languages.English:
      return getNextServicingOfficerEN(test);
    case Languages.Spanish:
      return getNextServicingOfficerES(test);
    default:
      throw new Error(`Unexpected language ${app.Language} for application$ ${app.ApplicationId}`);
  }
}

export function getEligibleOpportunityZoneValue(
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

export function getDobAmountValue(
  indicated: Application_YesNo,
  number: number | undefined
): number | undefined {
  // program not selected (but value might be present from user changing their mind)
  if (!bool(indicated)) {
    return undefined;
  }

  return number;
}

export function getDobApproval(
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

export function getDobApprovalDate(
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

export function getDobPurposes(
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

export function getNonprofitType(app: types.DecoratedApplication): types.NullableString {
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

export function getApplicantBackground(app: types.DecoratedApplication): string {
  let nonprofitType: types.NullableString = getNonprofitType(app);

  return nonprofitType ? `Nonprofit type: ${nonprofitType}` : '';
}

export function getFindingsString(app: types.DecoratedApplication): types.NullableString {
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

export function getProductStatusId(app: types.DecoratedApplication): types.ProductStatuses {
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

export function getProductSubStatusId(app: types.DecoratedApplication): types.ProductSubStatuses {
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

export function getMonitoringStatus(app: types.DecoratedApplication): types.MonitoringStatuses {
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

export function getMonitoringType(app: types.DecoratedApplication): types.MonitoringTypes {
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

export function getTaxationReportedTaxFilingAndYear(
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

export function getTaxationReportedRevenue(app: types.DecoratedApplication): types.NullableNumber {
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

export function getTaxationReportedNetIncomeLoss(
  app: types.DecoratedApplication
): types.NullableNumber {
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

export function hasNoTaxFilings(app: types.DecoratedApplication): boolean {
  return (
    getTaxationReportedTaxFilingAndYear(app).type == types.TaxationReportedTaxFilingValues.None &&
    typeof getSalesTaxPercentChange(app) === 'undefined'
  );
}

export function isUnknownToTaxation(app: types.DecoratedApplication): boolean {
  return app.taxation['Clean Ind'] === TaxationCleanStatus.Not_Found && hasNoTaxFilings(app);
}

export function getTaxationSalesTax2019(app: types.DecoratedApplication): types.NullableNumber {
  return app.taxation['S&U A 19'] + app.taxation['S&U M 19'] || null;
}

export function getTaxationSalesTax2020(app: types.DecoratedApplication): types.NullableNumber {
  const sum: number = app.taxation['S&U A 20'] + app.taxation['S&U M 20'];

  // if 2019 but no 2020, return 0 for 2020 rather than null
  if (!sum) {
    return getTaxationSalesTax2019(app) ? sum : null;
  }

  return sum;
}

export function cappedMarchAprilMay2019Revenue(
  app: types.DecoratedApplication
): number | undefined {
  const reportedMarchAprilMay2019: number | undefined = app.RevenueComparison_MarchAprilMay2019;
  const maxReasonablePastAnnual: number | null | undefined = maxReasonablePastRevenue(app);

  if (typeof reportedMarchAprilMay2019 === 'undefined') {
    return undefined;
  }

  // no tax filings from which to construct a maximum reasonable revenue; take 2019 at face value
  if (typeof maxReasonablePastAnnual === 'undefined') {
    return reportedMarchAprilMay2019;
  }

  // if operating at a loss or breakeven, then take self-reported 2019 quarterly at face value
  if (maxReasonablePastAnnual === null) {
    return reportedMarchAprilMay2019;
  }

  const maxReasonableMarchAprilMay2019: number = maxReasonablePastAnnual / 4;

  return Math.min(reportedMarchAprilMay2019, maxReasonableMarchAprilMay2019);
}

export function cappedReportedPastRevenue(app: types.DecoratedApplication): number | undefined {
  const _cappedMarchAprilMay2019Revenue: number | undefined = cappedMarchAprilMay2019Revenue(app);

  if (typeof _cappedMarchAprilMay2019Revenue === 'undefined') {
    return undefined;
  }

  return _cappedMarchAprilMay2019Revenue * 4;
}

export function adjustedYoyChange(app: types.DecoratedApplication): number | undefined {
  const capped2019: number | undefined = cappedMarchAprilMay2019Revenue(app);
  const reported2020: number | undefined = app.RevenueComparison_MarchAprilMay2020;

  if (typeof capped2019 === 'undefined') {
    return undefined;
  }

  if (typeof reported2020 === 'undefined') {
    return undefined;
  }

  return (reported2020 - capped2019) / capped2019;
}

export function cbtRevenue(app: types.DecoratedApplication): number | undefined {
  const { type, year }: types.TaxationFiling = getTaxationReportedTaxFilingAndYear(app);

  // not a CBT filer
  if (type !== types.TaxationReportedTaxFilingValues.CBT) {
    return undefined;
  }

  switch (year) {
    case types.RevenueYears._2019:
      return app.taxation['2019 CBT Amt'];
    case types.RevenueYears._2018:
      return app.taxation['2018 CBT Amt'];
    default:
      throw new Error(`Unexpected CBT filing year (${year}) for application ${app.ApplicationId}`);
  }
}

// if filing is Partnership or TGI, we get net profit (not gross revenue); we extrapolate a presumed
// gross revenue given an assumed profit margin, and proceed with comparison the same as with revenue.
export function presumedTgiRevenue(app: types.DecoratedApplication): number | null |undefined {
  const PRESUMED_PROFIT_MARGIN = 0.1;
  const { type, year }: types.TaxationFiling = getTaxationReportedTaxFilingAndYear(app);

  // not a Part or TGI filer
  if (
    type !== types.TaxationReportedTaxFilingValues.Partnership &&
    type !== types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC
  ) {
    return undefined;
  }

  const pastAnnualProfit: types.NullableNumber = getTaxationReportedNetIncomeLoss(app);

  if (pastAnnualProfit === null) {
    throw new Error(`Expected sole prop income for application ${app.ApplicationId}`);
  }

  if (pastAnnualProfit <= 0) {
    return null;
  }

  const presumedPastAnnualRevenue = pastAnnualProfit / PRESUMED_PROFIT_MARGIN;
  return presumedPastAnnualRevenue;
}

export function getSalesTaxPercentChange(app: types.DecoratedApplication): number | undefined {
  const su2019 = app.taxation['S&U A 19'] + app.taxation['S&U M 19'];
  const su2020 = app.taxation['S&U A 20'] + app.taxation['S&U M 20'];

  if (su2019 && su2020) {
    return (su2020 - su2019) / su2019;
  }

  return undefined;
}

export function presumedPastRevenue(app: types.DecoratedApplication): number | undefined | null {
  // we're certain
  if (typeof cbtRevenue(app) !== 'undefined') {
    return cbtRevenue(app);
  }

  // we're extrapolating
  if (typeof presumedTgiRevenue(app) !== 'undefined') {
    return presumedTgiRevenue(app);
  }

  return undefined;
}

function maxReasonablePastRevenue(app: types.DecoratedApplication): number | null | undefined {
  const TOLERANCE = 1.2;
  const pastRevenue: number | undefined | null = presumedPastRevenue(app);

  if (typeof pastRevenue === 'undefined') {
    return undefined;
  }

  if (pastRevenue === null) {
    return null;
  }

  return pastRevenue * TOLERANCE;
}

export function isReportedPastRevenueReasonable(
  app: types.DecoratedApplication
): boolean | undefined {
  const cappedReported: number | undefined = cappedReportedPastRevenue(app);
  const maxReasonable: number | null | undefined = maxReasonablePastRevenue(app);

  if (typeof cappedReported === 'undefined' || typeof maxReasonable === 'undefined') {
    return undefined;
  }

  // if operating at break-even or a loss, consider anything self-reported to be reasonable
  if (maxReasonable === null) {
    return true;
  }

  // this will actually always be true, since the capped value is capped at maxReasonable
  return cappedReported <= maxReasonable;
}

// goal: guard against 2019 over-reporting (to inflate need)
export function getReportedRevenueReasonableness(app: types.DecoratedApplication): types.YesNoNA {
  const isReportedRevenueReasonable: boolean | undefined = isReportedPastRevenueReasonable(app);
  const salesTaxPercentChange: number | undefined = getSalesTaxPercentChange(app);

  if (typeof isReportedRevenueReasonable !== 'undefined') {
    return yesNo(isReportedRevenueReasonable);
  }

  if (typeof salesTaxPercentChange !== 'undefined') {
    return yesNo(salesTaxPercentChange <= 0);
  }

  return 'N/A';
}

// goal: guard against 2020 under-reporting (to inflate need)
export function getYYRevenueDeclineReasonableness(app: types.DecoratedApplication): types.YesNoNA {
  const _adjustedYoyChange: number | undefined = adjustedYoyChange(app);

  if (typeof _adjustedYoyChange === 'undefined') {
    return 'N/A';
  }

  switch (getCapacityOpen(app)) {
    case types.RemainOpenCapacities['100%']:
      return yesNo(!(_adjustedYoyChange <= -0.25));
    case types.RemainOpenCapacities['75%']:
      return yesNo(!(_adjustedYoyChange <= -0.5));
    case types.RemainOpenCapacities['50%']:
      return yesNo(!(_adjustedYoyChange <= -0.75));
    case types.RemainOpenCapacities['25%']:
      return yesNo(!(_adjustedYoyChange <= -1.0));
    case types.RemainOpenCapacities['Less than 10%']:
    case null:
      return 'Yes';
  }
}

export function getReasonablenessExceptions(app: types.DecoratedApplication): string {
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

  if (
    typeof cappedMarchAprilMay2019Revenue(app) !== 'undefined' &&
    <number>cappedMarchAprilMay2019Revenue(app) < <number>app.RevenueComparison_MarchAprilMay2019
  ) {
    messages.push(
      `Applicant's self-reported March/April/May 2019 revenues of ${formatDollars(
        <number>app.RevenueComparison_MarchAprilMay2019
      )} have been reduced to ${formatDollars(
        <number>cappedMarchAprilMay2019Revenue(app)
      )}, the amount deemed reasonable given their ${
        getTaxationReportedTaxFilingAndYear(app).year
      } Taxation filings.`
    );
  }

  return messages.join(' ');
}
