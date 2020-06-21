"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReasonablenessExceptions = exports.getYYRevenueDeclineReasonableness = exports.getReportedRevenueReasonableness = exports.getSalesTaxPercentChange = exports.isSelfReportedRevenueReasonableForPartOrTgiFiler = exports.isSelfReportedRevenueReasonableForCbtFiler = exports.getTaxationSalesTax2020 = exports.getTaxationSalesTax2019 = exports.isUnknownToTaxation = exports.getTaxationReportedNetIncomeLoss = exports.getTaxationReportedRevenue = exports.getTaxationReportedTaxFilingAndYear = exports.getMonitoringType = exports.getMonitoringStatus = exports.getProductSubStatusId = exports.getProductStatusId = exports.getDecision = exports.getFindingsString = exports.getApplicantBackground = exports.getNonprofitType = exports.getDobPurposes = exports.getDobApprovalDate = exports.getDobApproval = exports.getDobAmountValue = exports.value = exports.getEligibleOpportunityZoneValue = exports.getServicingOfficer = exports.getDesignation = exports.getGrantPhase1Status = exports.getOwnershipStructure = exports.getTaxClearanceComments = exports.flag = exports.yesNo = exports.getCapacityOpen = exports.getWr30ReportingComments = exports.isDobProgramApprovedOrInProgress = exports.getQuarterlyWageData = void 0;
const findings_1 = require("./findings");
const types = __importStar(require("./types"));
const applications_1 = require("../inputs/applications");
const policy_map_1 = require("../inputs/policy-map");
const taxation_1 = require("../inputs/taxation");
const util_1 = require("../util");
const grant_phase_1_1 = require("../inputs/grant-phase-1");
const award_size_1 = require("./award-size");
function getQuarterlyWageData(app) {
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
    const year = Math.max(...app.wr30.wageRecords.map(record => record.Year));
    const quarter = Math.max(...app.wr30.wageRecords.filter(record => record.Year === year).map(record => record.Quarter));
    const fractionalFtes = app.wr30.wageRecords
        .filter(record => record.Year === year && record.Quarter === quarter)
        .map(record => Math.min(1, record.Dollars / FTE_QUARTERLY_MIN_WAGE))
        .reduce((sum, fraction) => sum + fraction, 0);
    const fteCount = Math.round(fractionalFtes);
    const quarterDesc = `Q${quarter} ${year}`;
    return {
        fteCount,
        quarterDesc,
    };
}
exports.getQuarterlyWageData = getQuarterlyWageData;
function isDobProgramApprovedOrInProgress(dobStatusValue) {
    return ((dobStatusValue || false) &&
        [applications_1.DOB_Status.Approved, applications_1.DOB_Status.In_Process].includes(dobStatusValue));
}
exports.isDobProgramApprovedOrInProgress = isDobProgramApprovedOrInProgress;
function getWr30ReportingComments(app) {
    var _a;
    const comments = [];
    if (app.wr30.notFound) {
        comments.push('Applicant did not file a WR-30, therefore possibly eligible for the minimum Grant Award of $1,000.');
    }
    if (award_size_1.grantPhase1AmountApproved(app)) {
        comments.push(`Award basis of ${util_1.formatDollars(award_size_1.awardBasis(app))} reduced by ${util_1.formatDollars(award_size_1.grantPhase1AmountApproved(app))} of Grant Phase 1 funding (${(_a = app.grantPhase1) === null || _a === void 0 ? void 0 : _a['OLA Application ID ']}).`);
    }
    return comments.join(' ');
}
exports.getWr30ReportingComments = getWr30ReportingComments;
function getCapacityOpen(app) {
    const capacity = app.COVID19Impact_Capacity_Value;
    if (typeof capacity === 'undefined') {
        return null;
    }
    switch (capacity) {
        case applications_1.Capacities['Less than 10%']:
            return types.RemainOpenCapacities['Less than 10%'];
        case applications_1.Capacities['25%']:
            return types.RemainOpenCapacities['25%'];
        case applications_1.Capacities['50%']:
            return types.RemainOpenCapacities['50%'];
        case applications_1.Capacities['75%']:
            return types.RemainOpenCapacities['75%'];
        case applications_1.Capacities['100%']:
            return types.RemainOpenCapacities['100%'];
        default:
            throw new Error(`Unexpected capacity value: ${capacity} for application ${app.ApplicationId}`);
    }
}
exports.getCapacityOpen = getCapacityOpen;
function yesNo(test) {
    return test ? 'Yes' : 'No';
}
exports.yesNo = yesNo;
function flag(test) {
    return test ? 'Yes' : '';
}
exports.flag = flag;
function getTaxClearanceComments(app) {
    switch (app.taxation['Clean Ind']) {
        case taxation_1.CleanStatus.Clear:
            return types.TaxClearanceValues.Clear;
        case taxation_1.CleanStatus.Not_Clear:
            return types.TaxClearanceValues.Not_Clear;
        case taxation_1.CleanStatus.Not_Found:
            return types.TaxClearanceValues.Not_Found;
        default:
            throw new Error(`Unexpected taxation clearance ${app.taxation['Clean Ind']} for application ${app.ApplicationId}`);
    }
}
exports.getTaxClearanceComments = getTaxClearanceComments;
function getOwnershipStructure(app) {
    const value = app.Business_EntityType_Value;
    const map = new Map([
        [applications_1.EntityType.Sole_Prop, types.OwnershipStructures.SoleProprietorship],
        [applications_1.EntityType.LLC, types.OwnershipStructures.LLC],
        [applications_1.EntityType.SMLLC, types.OwnershipStructures.LLC],
        [applications_1.EntityType.Partnership, types.OwnershipStructures.Partnership],
        [applications_1.EntityType.C_Corp, types.OwnershipStructures.C_Corporation],
        [applications_1.EntityType.S_Corp, types.OwnershipStructures.S_Corporation],
        [applications_1.EntityType.Nonprofit_501c3, types.OwnershipStructures.Nonprofit],
        [applications_1.EntityType.Nonprofit_501c4, types.OwnershipStructures.Nonprofit],
        [applications_1.EntityType.Nonprofit_501c6, types.OwnershipStructures.Nonprofit],
        [applications_1.EntityType.Nonprofit_501c7, types.OwnershipStructures.Nonprofit],
        [applications_1.EntityType.Nonprofit_501c19, types.OwnershipStructures.Nonprofit],
        [applications_1.EntityType.Nonprofit_Other, types.OwnershipStructures.Nonprofit],
        [applications_1.EntityType.Other, types.OwnershipStructures.Other],
    ]);
    const result = map.get(value);
    if (typeof result === 'undefined') {
        throw new Error(`Unknown ownership structure value ${value} for application ${app.ApplicationId}`);
    }
    return result;
}
exports.getOwnershipStructure = getOwnershipStructure;
function getGrantPhase1Status(app) {
    if (typeof app.grantPhase1 === 'undefined') {
        return null;
    }
    const status = app.grantPhase1['Product Status'];
    switch (status) {
        case grant_phase_1_1.ProductStatuses.Closed:
        case grant_phase_1_1.ProductStatuses.Closing:
            return types.ProgramApprovals.Approved;
        case grant_phase_1_1.ProductStatuses.Underwriting:
            return types.ProgramApprovals.In_Process;
        case grant_phase_1_1.ProductStatuses.Ended:
            return types.ProgramApprovals.Declined;
        default:
            throw new Error(`Unexpected grant phase 1 status: ${status}`);
    }
}
exports.getGrantPhase1Status = getGrantPhase1Status;
function getDesignation(app, designation) {
    return (app.Business_Designations_Value & designation) > 0;
}
exports.getDesignation = getDesignation;
let nextServicingOfficerIndexEN = 0;
function getNextServicingOfficerEN() {
    const values = Object.values(types.ServicingOfficersEN);
    const value = values[nextServicingOfficerIndexEN];
    nextServicingOfficerIndexEN = (nextServicingOfficerIndexEN + 1) % values.length;
    return value;
}
let nextServicingOfficerIndexES = 0;
function getNextServicingOfficerES() {
    const values = Object.values(types.ServicingOfficersES);
    const value = values[nextServicingOfficerIndexES];
    nextServicingOfficerIndexES = (nextServicingOfficerIndexES + 1) % values.length;
    return value;
}
function getServicingOfficer(app) {
    if (getDecision(app) !== types.Decision.Review) {
        return types.ServicingOfficersExternal.Richard_Toro;
    }
    switch (app.Language) {
        case applications_1.Languages.English:
            return getNextServicingOfficerEN();
        case applications_1.Languages.Spanish:
            return getNextServicingOfficerES();
        default:
            throw new Error(`Unexpected language ${app.Language} for application$ ${app.ApplicationId}`);
    }
}
exports.getServicingOfficer = getServicingOfficer;
function getEligibleOpportunityZoneValue(app) {
    if (typeof app.policyMap === 'undefined') {
        return types.EligibleOpportunityZoneValues.Not_Found;
    }
    const status = app.policyMap.eligibilityStatus;
    switch (status) {
        case policy_map_1.EligibilityStatus.Eligible_Contiguous:
        case policy_map_1.EligibilityStatus.Eligible_LIC:
            return types.EligibleOpportunityZoneValues.Yes;
        case policy_map_1.EligibilityStatus.Not_Eligible:
            return types.EligibleOpportunityZoneValues.No;
        default:
            throw new Error(`Unexpected opportunity zone eligibility status ${status} for application ${app.ApplicationId}`);
    }
}
exports.getEligibleOpportunityZoneValue = getEligibleOpportunityZoneValue;
function value(number) {
    if (number === null || typeof number === 'undefined') {
        return null;
    }
    const valueObject = {
        Value: number,
        ExtensionData: null,
    };
    return valueObject;
}
exports.value = value;
function getDobAmountValue(indicated, number) {
    // program not selected (but value might be present from user changing their mind)
    if (!util_1.bool(indicated)) {
        return undefined;
    }
    return number;
}
exports.getDobAmountValue = getDobAmountValue;
function getDobApproval(indicated, statusValue) {
    // program not selected (but value might be present from user changing their mind)
    if (!util_1.bool(indicated)) {
        return null;
    }
    if (typeof statusValue === 'undefined') {
        return null;
    }
    switch (statusValue) {
        case applications_1.DOB_Status.Approved:
            return types.ProgramApprovals.Approved;
        case applications_1.DOB_Status.Declined:
            return types.ProgramApprovals.Declined;
        case applications_1.DOB_Status.In_Process:
            return types.ProgramApprovals.In_Process;
        default:
            throw new Error(`Unexpected DOB program status value: ${statusValue}`);
    }
}
exports.getDobApproval = getDobApproval;
function getDobApprovalDate(indicated, statusValue, excelFloat) {
    // program not selected (but value might be present from user changing their mind)
    if (!util_1.bool(indicated)) {
        return null;
    }
    // program not approved (but value might be present from user changing their mind)
    if (getDobApproval(indicated, statusValue) !== types.ProgramApprovals.Approved) {
        return null;
    }
    if (typeof excelFloat === 'undefined') {
        return null;
    }
    return util_1.formatExcelDate(excelFloat);
}
exports.getDobApprovalDate = getDobApprovalDate;
function getDobPurposes(indicated, purposeValue) {
    // program not selected (but value might be present from user changing their mind)
    if (!util_1.bool(indicated)) {
        return null;
    }
    if (typeof purposeValue === 'undefined') {
        return null;
    }
    const purposesOfFunds = [];
    if (purposeValue & applications_1.DOB_Purposes.Payroll) {
        purposesOfFunds.push(types.PurposesOfFunds.Payroll);
    }
    if (purposeValue & applications_1.DOB_Purposes.Rent_Mortgage) {
        purposesOfFunds.push(types.PurposesOfFunds.Rent_Mortgage);
    }
    if (purposeValue & applications_1.DOB_Purposes.Utilities) {
        purposesOfFunds.push(types.PurposesOfFunds.Utilities);
    }
    if (purposeValue & applications_1.DOB_Purposes.Inventory) {
        purposesOfFunds.push(types.PurposesOfFunds.Inventory);
    }
    if (purposeValue & applications_1.DOB_Purposes.Other) {
        purposesOfFunds.push(types.PurposesOfFunds.Other);
    }
    return purposesOfFunds.join('; ');
}
exports.getDobPurposes = getDobPurposes;
function getNonprofitType(app) {
    switch (app.Business_EntityType_Value) {
        case applications_1.EntityType.Nonprofit_501c3:
            return '501(c)(3)';
        case applications_1.EntityType.Nonprofit_501c4:
            return '501(c)(4)';
        case applications_1.EntityType.Nonprofit_501c6:
            return '501(c)(6)';
        case applications_1.EntityType.Nonprofit_501c7:
            return '501(c)(7)';
        case applications_1.EntityType.Nonprofit_501c19:
            return '501(c)(19)';
        case applications_1.EntityType.Nonprofit_Other:
            return `"${app.Business_NonprofitClassification}"`;
        default:
            return null;
    }
}
exports.getNonprofitType = getNonprofitType;
function getApplicantBackground(app) {
    let nonprofitType = getNonprofitType(app);
    return nonprofitType ? `Nonprofit type: ${nonprofitType}` : '';
}
exports.getApplicantBackground = getApplicantBackground;
function getFindingsString(app) {
    const findings = findings_1.getFindings(app);
    const findingsString = findings
        .map((finding, i) => `(#${i + 1}: ${finding.severity}) ${finding.message}`)
        .join('. ');
    return findingsString ? `${findingsString}.` : null;
}
exports.getFindingsString = getFindingsString;
function getDecision(app) {
    const findings = findings_1.getFindings(app);
    if (findings.some(finding => finding.severity === types.Decision.Decline)) {
        return types.Decision.Decline;
    }
    if (findings.some(finding => finding.severity === types.Decision.Review)) {
        return types.Decision.Review;
    }
    return types.Decision.Approve;
}
exports.getDecision = getDecision;
function getProductStatusId(app) {
    const decision = getDecision(app);
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
exports.getProductStatusId = getProductStatusId;
function getProductSubStatusId(app) {
    const decision = getDecision(app);
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
exports.getProductSubStatusId = getProductSubStatusId;
function getMonitoringStatus(app) {
    const decision = getDecision(app);
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
exports.getMonitoringStatus = getMonitoringStatus;
function getMonitoringType(app) {
    const decision = getDecision(app);
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
exports.getMonitoringType = getMonitoringType;
function getTaxationReportedTaxFilingAndYear(app) {
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
exports.getTaxationReportedTaxFilingAndYear = getTaxationReportedTaxFilingAndYear;
function getTaxationReportedRevenue(app) {
    const { type, year } = getTaxationReportedTaxFilingAndYear(app);
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
exports.getTaxationReportedRevenue = getTaxationReportedRevenue;
function getTaxationReportedNetIncomeLoss(app) {
    const { type, year } = getTaxationReportedTaxFilingAndYear(app);
    // sole prop income is only relevant to Part/TGI filers
    if (type !== types.TaxationReportedTaxFilingValues.Partnership &&
        type !== types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC) {
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
exports.getTaxationReportedNetIncomeLoss = getTaxationReportedNetIncomeLoss;
function isUnknownToTaxation(app) {
    return (getTaxationReportedTaxFilingAndYear(app).type == types.TaxationReportedTaxFilingValues.None &&
        app.taxation['Clean Ind'] === taxation_1.CleanStatus.Not_Found &&
        app.taxation['S&U A 19'] === 0 &&
        app.taxation['S&U M 19'] === 0 &&
        app.taxation['S&U A 20'] === 0 &&
        app.taxation['S&U M 20'] === 0);
}
exports.isUnknownToTaxation = isUnknownToTaxation;
function getTaxationSalesTax2019(app) {
    return app.taxation['S&U A 19'] + app.taxation['S&U M 19'] || null;
}
exports.getTaxationSalesTax2019 = getTaxationSalesTax2019;
function getTaxationSalesTax2020(app) {
    const sum = app.taxation['S&U A 20'] + app.taxation['S&U M 20'];
    // if 2019 but no 2020, return 0 for 2020 rather than null
    if (!sum) {
        return getTaxationSalesTax2019(app) ? sum : null;
    }
    return sum;
}
exports.getTaxationSalesTax2020 = getTaxationSalesTax2020;
// how much higher is self-reported revenue compared to a known benchmark?
function revenuePercentOverBenchmark(app, benchmarkAnnual) {
    // no basis for comparison: company is too new (didn't ask for 2019 data)
    if (typeof app.RevenueComparison_MarchAprilMay2019 === 'undefined') {
        return undefined;
    }
    const selfReportedAnnual2019 = app.RevenueComparison_MarchAprilMay2019 * 4;
    return selfReportedAnnual2019 / benchmarkAnnual - 1;
}
function isSelfReportedRevenueReasonable(app, benchmarkAnnual) {
    const PERCENT_TOLERANCE = 0.2;
    const percentOverBenchmark = revenuePercentOverBenchmark(app, benchmarkAnnual);
    if (typeof percentOverBenchmark === 'undefined') {
        return [undefined, undefined];
    }
    return [percentOverBenchmark < PERCENT_TOLERANCE, percentOverBenchmark];
}
function isSelfReportedRevenueReasonableForCbtFiler(app) {
    const { type, year } = getTaxationReportedTaxFilingAndYear(app);
    // not a CBT filer
    if (type !== types.TaxationReportedTaxFilingValues.CBT) {
        return [undefined, undefined, undefined];
    }
    let taxationReportedAnnual;
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
exports.isSelfReportedRevenueReasonableForCbtFiler = isSelfReportedRevenueReasonableForCbtFiler;
// if filing is Partnership or TGI, we get net profit (not gross revenue); we extrapolate a presumed
// gross revenue given an assumed profit margin, and proceed with comparison the same as with revenue.
function isSelfReportedRevenueReasonableForPartOrTgiFiler(app) {
    const { type, year } = getTaxationReportedTaxFilingAndYear(app);
    // not a Part or TGI filer
    if (type !== types.TaxationReportedTaxFilingValues.Partnership &&
        type !== types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC) {
        return [undefined, undefined, undefined];
    }
    const pastAnnualProfit = getTaxationReportedNetIncomeLoss(app);
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
exports.isSelfReportedRevenueReasonableForPartOrTgiFiler = isSelfReportedRevenueReasonableForPartOrTgiFiler;
function getSalesTaxPercentChange(app) {
    const su2019 = app.taxation['S&U A 19'] + app.taxation['S&U M 19'];
    const su2020 = app.taxation['S&U A 20'] + app.taxation['S&U M 20'];
    if (su2019 && su2020) {
        return (su2020 - su2019) / su2019;
    }
    return undefined;
}
exports.getSalesTaxPercentChange = getSalesTaxPercentChange;
// goal: guard against 2019 over-reporting (to inflate need)
function getReportedRevenueReasonableness(app) {
    if (typeof isSelfReportedRevenueReasonableForCbtFiler(app)[0] !== 'undefined') {
        return yesNo(isSelfReportedRevenueReasonableForCbtFiler(app)[0]);
    }
    if (typeof isSelfReportedRevenueReasonableForPartOrTgiFiler(app)[0] !== 'undefined') {
        return yesNo(isSelfReportedRevenueReasonableForPartOrTgiFiler(app)[0]);
    }
    if (typeof getSalesTaxPercentChange(app) !== 'undefined') {
        return yesNo(getSalesTaxPercentChange(app) <= 0);
    }
    return 'N/A';
}
exports.getReportedRevenueReasonableness = getReportedRevenueReasonableness;
// goal: guard against 2020 under-reporting (to inflate need)
function getYYRevenueDeclineReasonableness(app) {
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
exports.getYYRevenueDeclineReasonableness = getYYRevenueDeclineReasonableness;
function getReasonablenessExceptions(app) {
    const messages = [];
    const netIncomeLoss = getTaxationReportedNetIncomeLoss(app);
    const salesTaxPercentChange = getSalesTaxPercentChange(app);
    if (netIncomeLoss !== null && netIncomeLoss <= 0) {
        messages.push('The business as reported to Taxation is operating at a loss or breakeven, therefore the business has a reasonable need.');
    }
    if (getTaxationReportedTaxFilingAndYear(app).type == types.TaxationReportedTaxFilingValues.None &&
        typeof salesTaxPercentChange !== 'undefined' &&
        salesTaxPercentChange <= 0) {
        messages.push('The applicant has reported Sales and Use Tax for 2019 and 2020, is deemed to have filed taxes, and has revenue numbers that are reasonable.');
    }
    return messages.join(' ');
}
exports.getReasonablenessExceptions = getReasonablenessExceptions;
