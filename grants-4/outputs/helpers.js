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
exports.getReasonablenessExceptions = exports.getBusinessType = exports.getYYRevenueDeclineReasonableness = exports.getReportedRevenueReasonableness = exports.isReportedPastRevenueReasonable = exports.presumedPastRevenue = exports.getSalesTaxPercentChange = exports.presumedTgiRevenue = exports.cbtRevenue = exports.adjustedYoyChange = exports.cappedReportedPastRevenue = exports.adjustedMarchAprilMay2020Revenue = exports.cappedMarchAprilMay2019Revenue = exports.isNotClearToTaxation = exports.isUnknownToTaxation = exports.hasNoTaxFilings = exports.getTaxationReportedNetIncomeLoss = exports.getTaxationReportedRevenue = exports.getTaxationReportedTaxFilingAndYear = exports.getMonitoringType = exports.getMonitoringStatus = exports.getProductSubStatusId = exports.getProductStatusId = exports.getDecision = exports.getFindingsString = exports.getApplicantBackground = exports.getNonprofitType = exports.getDobPurposes = exports.getDobApprovalDate = exports.getDobApproval = exports.getDobAmountValue = exports.getServicingOfficer = exports.getDesignation = exports.getOwnershipStructure = exports.getTaxClearanceComments = exports.getCapacityOpen = exports.getWr30ReportingComments = exports.isDobProgramApprovedOrInProgress = exports.getQuarterlyWageHighestFTE = exports.getQuarterlyWageData = exports.value = exports.flag = exports.yesNo = void 0;
const stringSimilarity = require('string-similarity');
const types = __importStar(require("./types"));
const applications_1 = require("../inputs/applications");
const util_1 = require("../util");
const taxation_1 = require("../inputs/taxation");
const findings_1 = require("./findings");
const award_size_1 = require("./award-size");
function yesNo(test) {
    return test ? 'Yes' : 'No';
}
exports.yesNo = yesNo;
function flag(test) {
    return test ? 'Yes' : '';
}
exports.flag = flag;
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
function getQuarterlyWageData(app) {
    if (app.wr30.notFound) {
        return {
            fteCount: null,
            quarterDesc: null,
        };
    }
    const DOLLARS_PER_HOUR = 11.0;
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
function getQuarterlyWageHighestFTE(app) {
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
    var fteCount = 0;
    var quarterDesc = ``;
    //const wageRecords: WageRecord[] = <WageRecord[]>WR30_MAP.get(ein);
    const wr30Records = [{
            Year: 2010,
            Quarter: 1,
            FTE: 0
        }];
    app.wr30.wageRecords.forEach(function (value) {
        const year = value.Year; // app.wr30.wageRecords.map(record => record.Year);
        const quarter = value.Quarter; //app.wr30.wageRecords.map(record => record.Quarter);
        const fractionalFtes = app.wr30.wageRecords
            .filter(record => record.Year === year && record.Quarter === quarter)
            .map(record => Math.min(1, record.Dollars / FTE_QUARTERLY_MIN_WAGE))
            .reduce((sum, fraction) => sum + fraction, 0);
        fteCount = Math.round(fractionalFtes);
        const wr30Record = {
            Year: year,
            Quarter: quarter,
            FTE: fteCount,
        };
        wr30Records.push(wr30Record);
        //console.log(wr30Record);
        //console.log("fractFtes=" + fractionalFtes);
        //console.log("fteCount =" + fteCount);
        //console.log("quarterDesc =" + quarterDesc);
    });
    fteCount = Math.max(...wr30Records.map(record => record.FTE), 0);
    var maxXObject = wr30Records.find(record => record.FTE === fteCount);
    var yearfinal = maxXObject === null || maxXObject === void 0 ? void 0 : maxXObject.Year;
    var quaterfinal = maxXObject === null || maxXObject === void 0 ? void 0 : maxXObject.Quarter;
    quarterDesc = `Q${quaterfinal} ${yearfinal}`;
    //console.log("fteCount =" + fteCount);
    //console.log("quaterfinal=" + quarterDesc);
    return {
        fteCount,
        quarterDesc,
    };
}
exports.getQuarterlyWageHighestFTE = getQuarterlyWageHighestFTE;
function isDobProgramApprovedOrInProgress(dobStatusValue) {
    return ((dobStatusValue || false) &&
        [applications_1.DOB_Status.Approved, applications_1.DOB_Status.In_Process].includes(dobStatusValue));
}
exports.isDobProgramApprovedOrInProgress = isDobProgramApprovedOrInProgress;
function getWr30ReportingComments(app) {
    const comments = [];
    if (app.wr30.notFound) {
        comments.push('Applicant did not file a WR-30.');
    }
    // for changing bucket
    comments.push(award_size_1.BusinessTypeChanged(app));
    if ((getQuarterlyWageHighestFTE(app).fteCount == 0 || (getQuarterlyWageHighestFTE(app).fteCount == null)) && app.dol.isActiveEmployer) {
        comments.push("WR-30 data not found, but applicant is registered with DOL so applicant provided jobs used.");
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
    //return types.TaxClearanceValues.Not_Found;
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
        [applications_1.EntityType.Nonprofit_Organization, types.OwnershipStructures.Nonprofit],
        [applications_1.EntityType.General_Partnership, types.OwnershipStructures.General_Partnership],
        [applications_1.EntityType.Limited_Partnership, types.OwnershipStructures.Limited_Partnership],
        [applications_1.EntityType.Government_Body, types.OwnershipStructures.Government_Body],
    ]);
    const result = map.get(value);
    if (typeof result === 'undefined') {
        throw new Error(`Unknown ownership structure value ${value} for application ${app.ApplicationId}`);
    }
    return result;
}
exports.getOwnershipStructure = getOwnershipStructure;
//export function getGrantPhase1Status(
//  app: types.DecoratedApplication
//): types.ProgramApprovals | null {
//  if (typeof app.grantPhase1 === 'undefined') {
//    return null;
//  }
//  const status: ProductStatuses | undefined = app.grantPhase1['Product Status'];
//  switch (status) {
//    case ProductStatuses.Closed:
//    case ProductStatuses.Closing:
//      return types.ProgramApprovals.Approved;
//    case ProductStatuses.Underwriting:
//      return types.ProgramApprovals.In_Process;
//    case ProductStatuses.Ended:
//      return types.ProgramApprovals.Declined;
//    default:
//      throw new Error(`Unexpected grant phase 1 status: ${status}`);
//  }
//}
function getDesignation(app, designation) {
    return (app.Business_Designations_Value & designation) > 0;
}
exports.getDesignation = getDesignation;
let nextServicingOfficerIndexEN = 0;
function getNextServicingOfficerEN(test) {
    const _enum = test ? types.TEST_ServicingOfficersEN : types.ServicingOfficersEN;
    const values = Object.values(_enum);
    const value = values[nextServicingOfficerIndexEN];
    nextServicingOfficerIndexEN = (nextServicingOfficerIndexEN + 1) % values.length;
    return value;
}
let nextServicingOfficerIndexES = 0;
function getNextServicingOfficerES(test) {
    const _enum = test ? types.TEST_ServicingOfficersES : types.ServicingOfficersES;
    const values = Object.values(_enum);
    const value = values[nextServicingOfficerIndexES];
    nextServicingOfficerIndexES = (nextServicingOfficerIndexES + 1) % values.length;
    return value;
}
function getServicingOfficer(app, test) {
    if (getDecision(app) !== types.Decision.Review && getDecision(app) !== types.Decision.LegalReview) {
        return types.ServicingOfficersExternal.Richard_Toro;
    }
    switch (app.njeda_language) {
        case "English": //Languages.English:
            return getNextServicingOfficerEN(test);
        case "Spanish":
            return getNextServicingOfficerES(test);
        default:
            throw new Error(`Unexpected language ${app.njeda_language} for application$ ${app.ApplicationId}`);
    }
}
exports.getServicingOfficer = getServicingOfficer;
//export function getEligibleOpportunityZoneValue(
//    app: types.DecoratedApplication
//): types.EligibleOpportunityZoneValues {
//    if (
//        typeof app.policyMap === 'undefined' ||
//        app.policyMap.eligibilityStatus === OZEligibilityStatus.NA ||
//        app.policyMap.eligibilityStatus === OZEligibilityStatus.Not_Found
//    ) {
//        return types.EligibleOpportunityZoneValues.Not_Found;
//    }
//    const status = app.policyMap.eligibilityStatus;
//    switch (status) {
//        case OZEligibilityStatus.Eligible:
//        case OZEligibilityStatus.Eligible_Contiguous:
//        case OZEligibilityStatus.Eligible_LIC:
//            return types.EligibleOpportunityZoneValues.Yes;
//        case OZEligibilityStatus.Not_Eligible:
//            return types.EligibleOpportunityZoneValues.No;
//        default:
//            throw new Error(
//                `Unexpected opportunity zone eligibility status ${status} for application ${app.ApplicationId}`
//            );
//    }
//}
function getDobAmountValue(indicated, number) {
    // program not selected (but value might be present from user changing their mind)
    if (!util_1.bool(indicated)) {
        return undefined;
    }
    return number;
}
exports.getDobAmountValue = getDobAmountValue;
function getDobApproval(indicated, status //DOB_Status | undefined
) {
    // program not selected (but value might be present from user changing their mind)
    if (!util_1.bool(indicated)) {
        return null;
    }
    //console.log("status=" +status)
    //if (typeof statusValue === 'undefined') {
    //  return null;
    //}
    if (status === '') {
        return null;
    }
    switch (status) {
        case "Approved":
            return types.ProgramApprovals.Approved;
        case "Declined":
            return types.ProgramApprovals.Declined;
        case "In Process":
            return types.ProgramApprovals.In_Process;
        default:
            throw new Error(`Unexpected DOB program status value: ${status}`);
    }
}
exports.getDobApproval = getDobApproval;
function getDobApprovalDate(
//indicated: Application_YesNo,
//statusValue: DOB_Status | undefined,
excelFloat) {
    // program not selected (but value might be present from user changing their mind)
    //if (!bool(indicated)) {
    //  return null;
    //}
    // program not approved (but value might be present from user changing their mind)
    //if (getDobApproval(indicated, statusValue) !== types.ProgramApprovals.Approved) {
    //  return null;
    //}
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
    if (findings.some(finding => finding.severity === types.Decision.LegalReview)) {
        return types.Decision.LegalReview;
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
            return types.ProductStatuses.Underwriting; //need to check
        case types.Decision.LegalReview:
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
        case types.Decision.LegalReview:
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
        case types.Decision.LegalReview:
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
    //console.log("decision: " + decision);
    switch (decision) {
        case types.Decision.Approve:
        case types.Decision.Decline:
            return types.MonitoringTypes.External;
        case types.Decision.LegalReview:
            return types.MonitoringTypes.NewProductReview;
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
function hasNoTaxFilings(app) {
    return (getTaxationReportedTaxFilingAndYear(app).type == types.TaxationReportedTaxFilingValues.None &&
        typeof getSalesTaxPercentChange(app) === 'undefined');
}
exports.hasNoTaxFilings = hasNoTaxFilings;
function isUnknownToTaxation(app) {
    return app.taxation['Clean Ind'] === taxation_1.CleanStatus.Not_Found; // && hasNoTaxFilings(app);
    //return false;
}
exports.isUnknownToTaxation = isUnknownToTaxation;
function isNotClearToTaxation(app) {
    return app.taxation['Clean Ind'] === taxation_1.CleanStatus.Not_Clear; // && hasNoTaxFilings(app);
    //return false;
}
exports.isNotClearToTaxation = isNotClearToTaxation;
// export function getTaxationSalesTax2019(app: types.DecoratedApplication): types.NullableNumber {
//     return app.taxation['S&U A 19'] + app.taxation['S&U M 19'] || null;
//     //return null;
// }
// export function getTaxationSalesTax2020(app: types.DecoratedApplication): types.NullableNumber {
//     const sum: number = app.taxation['S&U A 20'] + app.taxation['S&U M 20'];
//     //if 2019 but no 2020, return 0 for 2020 rather than null
//     if (!sum) {
//         return getTaxationSalesTax2019(app) ? sum : null;
//     }
//     return null; //sum;
// }
function cappedMarchAprilMay2019Revenue(app) {
    const reportedMarchAprilMay2019 = app.RevenueComparison_MarchAprilMay2019;
    const maxReasonablePastAnnual = maxReasonablePastRevenue(app);
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
    const maxReasonableMarchAprilMay2019 = maxReasonablePastAnnual / 4;
    return Math.min(reportedMarchAprilMay2019, maxReasonableMarchAprilMay2019);
}
exports.cappedMarchAprilMay2019Revenue = cappedMarchAprilMay2019Revenue;
function adjustedMarchAprilMay2020Revenue(app) {
    // negatives become 0
    return Math.max(0, app.RevenueComparison_MarchAprilMay2020);
}
exports.adjustedMarchAprilMay2020Revenue = adjustedMarchAprilMay2020Revenue;
function cappedReportedPastRevenue(app) {
    const _cappedMarchAprilMay2019Revenue = cappedMarchAprilMay2019Revenue(app);
    if (typeof _cappedMarchAprilMay2019Revenue === 'undefined') {
        return undefined;
    }
    return _cappedMarchAprilMay2019Revenue * 4;
}
exports.cappedReportedPastRevenue = cappedReportedPastRevenue;
function adjustedYoyChange(app) {
    const capped2019 = cappedMarchAprilMay2019Revenue(app);
    if (typeof capped2019 === 'undefined') {
        return undefined;
    }
    return (adjustedMarchAprilMay2020Revenue(app) - capped2019) / capped2019;
}
exports.adjustedYoyChange = adjustedYoyChange;
function cbtRevenue(app) {
    const { type, year } = getTaxationReportedTaxFilingAndYear(app);
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
exports.cbtRevenue = cbtRevenue;
// if filing is Partnership or TGI, we get net profit (not gross revenue); we extrapolate a presumed
// gross revenue given an assumed profit margin, and proceed with comparison the same as with revenue.
function presumedTgiRevenue(app) {
    const PRESUMED_PROFIT_MARGIN = 0.1;
    const { type, year } = getTaxationReportedTaxFilingAndYear(app);
    // not a Part or TGI filer
    if (type !== types.TaxationReportedTaxFilingValues.Partnership &&
        type !== types.TaxationReportedTaxFilingValues.Sole_Prop_SMLLC) {
        return undefined;
    }
    const pastAnnualProfit = getTaxationReportedNetIncomeLoss(app);
    if (pastAnnualProfit === null) {
        throw new Error(`Expected sole prop income for application ${app.ApplicationId}`);
    }
    if (pastAnnualProfit <= 0) {
        return null;
    }
    const presumedPastAnnualRevenue = pastAnnualProfit / PRESUMED_PROFIT_MARGIN;
    return presumedPastAnnualRevenue;
}
exports.presumedTgiRevenue = presumedTgiRevenue;
function getSalesTaxPercentChange(app) {
    const su2019 = app.taxation['S&U A 19'] + app.taxation['S&U M 19'];
    const su2020 = app.taxation['S&U A 20'] + app.taxation['S&U M 20'];
    if (su2019 && su2020) {
        return (su2020 - su2019) / su2019;
    }
    return undefined;
}
exports.getSalesTaxPercentChange = getSalesTaxPercentChange;
function presumedPastRevenue(app) {
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
exports.presumedPastRevenue = presumedPastRevenue;
function maxReasonablePastRevenue(app) {
    const TOLERANCE = 1.2;
    const pastRevenue = presumedPastRevenue(app);
    if (typeof pastRevenue === 'undefined') {
        return undefined;
    }
    if (pastRevenue === null) {
        return null;
    }
    return pastRevenue * TOLERANCE;
}
function isReportedPastRevenueReasonable(app) {
    const cappedReported = cappedReportedPastRevenue(app);
    const maxReasonable = maxReasonablePastRevenue(app);
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
exports.isReportedPastRevenueReasonable = isReportedPastRevenueReasonable;
// goal: guard against 2019 over-reporting (to inflate need)
function getReportedRevenueReasonableness(app) {
    const isReportedRevenueReasonable = isReportedPastRevenueReasonable(app);
    const salesTaxPercentChange = getSalesTaxPercentChange(app);
    if (typeof isReportedRevenueReasonable !== 'undefined') {
        return yesNo(isReportedRevenueReasonable);
    }
    if (typeof salesTaxPercentChange !== 'undefined') {
        return yesNo(salesTaxPercentChange <= 0);
    }
    return 'N/A';
}
exports.getReportedRevenueReasonableness = getReportedRevenueReasonableness;
// goal: guard against 2020 under-reporting (to inflate need)
function getYYRevenueDeclineReasonableness(app) {
    const _adjustedYoyChange = adjustedYoyChange(app);
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
exports.getYYRevenueDeclineReasonableness = getYYRevenueDeclineReasonableness;
function getBusinessType(app) {
    var businessType = (app.njeda_phase3businessprogramsrevised !== undefined) ? app.njeda_phase3businessprogramsrevised : app.njeda_phase3businessprogram;
    const newBusinessType = award_size_1.BusinessTypeChanged(app);
    if (newBusinessType == "Business Type updated from Small Business to Micro Business based on WR-30 highest jobs count.")
        businessType = 506340001;
    else if (newBusinessType == "Business Type updated from Micro Business to Small Business based on WR-30 highest jobs count.")
        businessType = 506340002;
    switch (businessType.toString()) {
        case "506340000":
            return "Restaurant (Food Services and Drinking Places)";
        case "506340001":
            return "Micro-Business";
        case "506340002":
            return "Small Business";
        case "506340003":
            return "Child Care Provider";
        default:
            throw new Error(`Unexpected business type for application ${app.ApplicationId}`);
    }
    //return types.TaxClearanceValues.Not_Found;
}
exports.getBusinessType = getBusinessType;
function getReasonablenessExceptions(app) {
    const messages = [];
    const netIncomeLoss = getTaxationReportedNetIncomeLoss(app);
    const salesTaxPercentChange = getSalesTaxPercentChange(app);
    if (app.RevenueComparison_MarchAprilMay2020 !== adjustedMarchAprilMay2020Revenue(app)) {
        messages.push(`Applicant's reported 2020 March–May revenue (${util_1.formatDollars(app.RevenueComparison_MarchAprilMay2020)}) has been adjusted to ${util_1.formatDollars(adjustedMarchAprilMay2020Revenue(app))}.`);
    }
    if (netIncomeLoss !== null && netIncomeLoss <= 0) {
        messages.push('The business as reported to Taxation is operating at a loss or breakeven, therefore the business has a reasonable need.');
    }
    if (getTaxationReportedTaxFilingAndYear(app).type == types.TaxationReportedTaxFilingValues.None &&
        typeof salesTaxPercentChange !== 'undefined' &&
        salesTaxPercentChange <= 0) {
        messages.push('The applicant has reported Sales and Use Tax for 2019 and 2020, is deemed to have filed taxes, and has revenue numbers that are reasonable.');
    }
    if (typeof cappedMarchAprilMay2019Revenue(app) !== 'undefined' &&
        cappedMarchAprilMay2019Revenue(app) < app.RevenueComparison_MarchAprilMay2019) {
        messages.push(`Applicant's self-reported March/April/May 2019 revenues of ${util_1.formatDollars(app.RevenueComparison_MarchAprilMay2019)} have been reduced to ${util_1.formatDollars(cappedMarchAprilMay2019Revenue(app))}, the amount deemed reasonable given their ${getTaxationReportedTaxFilingAndYear(app).year} Taxation filings.`);
    }
    return messages.join(' ');
}
exports.getReasonablenessExceptions = getReasonablenessExceptions;
//# sourceMappingURL=helpers.js.map