"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFindings = void 0;
const date_fns_1 = require("date-fns");
const types_1 = require("./types");
const util_1 = require("../util");
const grant_phase_1_1 = require("../inputs/grant-phase-1");
const award_size_1 = require("./award-size");
const helpers_1 = require("./helpers");
const applications_1 = require("../inputs/applications");
// try to keep Declines at top and Reviews at bottom, so they print that way when serialized in CRM;
// also keep potentially long messages (e.g. user input) at the end, in case it goes on forever.
const FINDING_DEFINITIONS = [
    // yesNo(app.sams.possibleMatches.length > 0), // TODO: if yes, add details to findings
    {
        // TODO: unverified
        name: 'Ineligible entity type',
        trigger: app => app.Business_EntityType_Value === applications_1.EntityType.Other,
        messageGenerator: app => `Ineligible Business Entity Type: "Other (estate, municipality, etc.)"`,
        severity: types_1.Decision.Decline,
    },
    {
        // TODO: unverified
        name: 'Business too new',
        trigger: app => !!app.Business_DateEstablished &&
            date_fns_1.isAfter(util_1.dateFromExcel(app.Business_DateEstablished), new Date(2020, 2, 15)),
        messageGenerator: app => `Business established on ${util_1.dateFromExcel(app.Business_DateEstablished).toLocaleDateString()}, which is after the cutoff date of ${new Date(2020, 2, 15).toLocaleDateString()}`,
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'Gambling',
        trigger: app => util_1.bool(app.BusinessDetails_GamblingActivities),
        messageGenerator: app => `Organization hosts gambling or gaming activities`,
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'Adult',
        trigger: app => app.BusinessDetails_AdultActivities !== '' && util_1.bool(app.BusinessDetails_AdultActivities),
        messageGenerator: app => `Organization conducts or purveys “adult” activities, services, products or materials`,
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'Auctions/Sales',
        trigger: app => util_1.bool(app.BusinessDetails_SalessActivities),
        messageGenerator: app => `Organization conducts auctions, bankruptcy sales, fire sales, “lost-our-lease,” “going-out-of-business,” or similar sales`,
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'Transient merchant',
        trigger: app => util_1.bool(app.BusinessDetails_TransientMerchant),
        messageGenerator: app => `Organization is a transient merchant ("peddler," "popup store," or "itinerant vendor")`,
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'Outdoor storage',
        trigger: app => util_1.bool(app.BusinessDetails_OutdoorStorageCompany),
        messageGenerator: app => `Organization is an outdoor storage company`,
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'Nuisance',
        trigger: app => util_1.bool(app.BusinessDetails_NuisanceActivities),
        messageGenerator: app => `Organization conducts activities that may constitute a nuisance`,
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'Illegal',
        trigger: app => util_1.bool(app.BusinessDetails_IllegalActivities),
        messageGenerator: app => `Organization conducts business for an illegal purpose`,
        severity: types_1.Decision.Decline,
    },
    {
        name: 'On Unemployment Not Clear List',
        trigger: app => app.dol.uidNoGo,
        messageGenerator: app => `Applicant is on the DOL UI no-go list`,
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'On Wage/Hour Not Clear List',
        trigger: app => app.dol.whdNoGo,
        messageGenerator: app => `Applicant is on the DOL Wage/Hour no-go list`,
        severity: types_1.Decision.Decline,
    },
    {
        name: 'FTE Greater than 25',
        trigger: app => (helpers_1.getQuarterlyWageData(app).fteCount || 0) > 25,
        messageGenerator: app => `Too Many FTE Equivalents: ${helpers_1.getQuarterlyWageData(app).fteCount} but should be at most 25`,
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'Received Phase 1 Funding >= Phase 2 Award Basis',
        trigger: app => award_size_1.grantPhase1AmountApproved(app) >= award_size_1.awardBasis(app),
        messageGenerator: app => {
            var _a;
            return `Business received a NJEDA Emergency Phase 1 Grant (${(_a = app.grantPhase1) === null || _a === void 0 ? void 0 : _a['OLA Application ID ']} for ${util_1.formatDollars(award_size_1.grantPhase1AmountApproved(app))}) and is not eligible for incremental funding based on WR-30 data (award basis: ${util_1.formatDollars(award_size_1.awardBasis(app))})`;
        },
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'Duplicate EIN',
        trigger: app => !!app.duplicates.byTin,
        messageGenerator: app => { var _a; return `EIN was found in more than one application (${(_a = app.duplicates.byTin) === null || _a === void 0 ? void 0 : _a.join(', ')})`; },
        severity: types_1.Decision.Decline,
    },
    {
        // unverified
        name: 'Capacity 100%, no self-reported revenue decrease',
        trigger: app => helpers_1.getCapacityOpen(app) === types_1.RemainOpenCapacities['100%'] &&
            award_size_1.yoyDecline(app) !== null &&
            award_size_1.yoyDecline(app) <= 0,
        messageGenerator: app => `Capacity remained at 100% and self-reported YoY revenue did not decrease from 2019 to 2020`,
        severity: types_1.Decision.Decline,
    },
    {
        name: 'No Taxation record (excluding nonprofits)',
        trigger: app => helpers_1.getOwnershipStructure(app) !== types_1.OwnershipStructures.Nonprofit && helpers_1.isUnknownToTaxation(app),
        messageGenerator: app => `Business is a ${helpers_1.getOwnershipStructure(app)} (TIN: ${app.Business_TIN}) that is not registered with Taxation, did not file taxes with Taxation for 2018 or 2019, and did not file sales/usage taxes with Taxation in 2019 or 2020`,
        severity: types_1.Decision.Decline,
    },
    ////////////////////// Reviews below ////////////////////////
    {
        name: 'Adult unknown',
        trigger: app => app.BusinessDetails_AdultActivities === '',
        messageGenerator: app => `It is unknown if the organization conducts or purveys “adult” activities, services, products or materials (question left blank on application)`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Business established in 2019 or 2020',
        trigger: app => ['2019', '2020'].includes(app.Business_YearEstablished),
        messageGenerator: app => `Business established in ${app.Business_YearEstablished} (${util_1.dateFromExcel(app.Business_DateEstablished).toLocaleDateString()})`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Religious Affiliation',
        trigger: app => util_1.bool(app.Business_Religious),
        messageGenerator: app => `Business has religious affiliations`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Lobbying and Political Activities',
        trigger: app => app.Business_LobbyingPolitical === 'Yes',
        messageGenerator: app => `Business engages in lobbying and/or political activities`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'NAICS Code (813)',
        trigger: app => app.NAICSCode.startsWith('813'),
        messageGenerator: app => `NAICS code starts with 813: ${app.NAICSCode}`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'On SAM exclusion list',
        trigger: app => app.sams.possibleMatches.length > 0,
        messageGenerator: app => `Applicant may be on the federal SAMS exclusion list: ${app.sams.possibleMatches
            .map(match => `DUNS ${match.DUNS}`)
            .join(', ')}`,
        severity: types_1.Decision.Review,
    },
    {
        // unverified
        name: 'Phase 1 under review',
        trigger: app => { var _a; return ((_a = app.grantPhase1) === null || _a === void 0 ? void 0 : _a['Product Status']) === grant_phase_1_1.ProductStatuses.Underwriting; },
        messageGenerator: app => { var _a; return `Business is currently under review for Phase 1 Grant funding (${(_a = app.grantPhase1) === null || _a === void 0 ? void 0 : _a['OLA Application ID ']})`; },
        severity: types_1.Decision.Review,
    },
    {
        // unverified
        name: 'No Census Tract',
        trigger: app => { var _a; return !((_a = app.policyMap) === null || _a === void 0 ? void 0 : _a.censusTract); },
        messageGenerator: app => `Business address does not have a census tract`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Duplicate Address',
        trigger: app => !!app.duplicates.byAddress,
        messageGenerator: app => {
            var _a;
            return `Business address was found in more than one application (${(_a = app.duplicates.byAddress) === null || _a === void 0 ? void 0 : _a.join(', ')})`;
        },
        severity: types_1.Decision.Review,
    },
    {
        name: 'Unreasonable revenue decline',
        trigger: app => helpers_1.getYYRevenueDeclineReasonableness(app) === 'No',
        messageGenerator: app => `Applicant reported an unreasonably high YoY revenue decline (${util_1.formatPercent(app.RevenueComparison_YearOverYearChange)}) given business operational capacity (${helpers_1.getCapacityOpen(app)})`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'No unmet need',
        trigger: app => award_size_1.unmetNeed(app) === 0,
        messageGenerator: app => `Business does not have an unmet need based on YoY revenue loss (${util_1.formatDollars(award_size_1.yoyDecline(app))}) and other disaster resources pending or received (${util_1.formatDollars(award_size_1.reducibleFunding(app))})`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Unmet Need is less than Discounted Award Basis',
        trigger: app => award_size_1.unmetNeed(app) !== null && award_size_1.unmetNeed(app) < award_size_1.discountedAwardBasis(app),
        messageGenerator: app => `The business has an unmet need of ${util_1.formatDollars(award_size_1.unmetNeed(app))}, which is less than their discounted award basis of ${util_1.formatDollars(award_size_1.discountedAwardBasis(app))}`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Missing WR-30 but expect employees',
        trigger: app => app.wr30.notFound &&
            (app.Business_W2EmployeesFullTime >= 2 || app.Business_W2EmployeesPartTime >= 3),
        messageGenerator: app => `No WR-30 found for applicant, but applicant reported ${app.Business_W2EmployeesFullTime} full-time W2 employees and ${app.Business_W2EmployeesPartTime} part-time W2 employees`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Sales tax increased',
        trigger: app => typeof helpers_1.getSalesTaxPercentChange(app) !== 'undefined' &&
            helpers_1.getSalesTaxPercentChange(app) > 0,
        messageGenerator: app => `Applicant's sales tax increased ${util_1.formatPercent(helpers_1.getSalesTaxPercentChange(app), {
            decimals: 1,
        })} from 2019 to 2020`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'No Taxation record (nonprofits)',
        trigger: app => helpers_1.getOwnershipStructure(app) === types_1.OwnershipStructures.Nonprofit && helpers_1.isUnknownToTaxation(app),
        messageGenerator: app => `Business is a ${helpers_1.getNonprofitType(app)} ${helpers_1.getOwnershipStructure(app)} that is not registered with Taxation, did not file taxes with Taxation for 2018 or 2019, and did not file sales/usage taxes with Taxation in 2019 or 2020`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Known to Taxation but no filings',
        trigger: app => app.taxation['Clean Ind'] !== 'X' && helpers_1.getReportedRevenueReasonableness(app) === 'N/A',
        messageGenerator: app => `Organization is recognized by Taxation, but has no Taxation filings`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'CBT filer reports unreasonably high 2019 revenue',
        trigger: app => helpers_1.isSelfReportedRevenueReasonableForCbtFiler(app)[0] === false,
        messageGenerator: app => `Applicant's 2019 3-month actual revenues reported on application are ${util_1.formatPercent(helpers_1.isSelfReportedRevenueReasonableForCbtFiler(app)[1])} higher than their ${helpers_1.isSelfReportedRevenueReasonableForCbtFiler(app)[2]} revenues reported by Taxation`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'TGI/Partnership filer reports unreasonably high 2019 revenue',
        trigger: app => helpers_1.isSelfReportedRevenueReasonableForPartOrTgiFiler(app)[0] === false,
        messageGenerator: app => `Applicant's 2019 self-reported actuals (${util_1.formatDollars(app.RevenueComparison_MarchAprilMay2019)}) may not be reasonable given their ${helpers_1.isSelfReportedRevenueReasonableForPartOrTgiFiler(app)[2]} Taxation reported net income of ${util_1.formatDollars(helpers_1.getTaxationReportedNetIncomeLoss(app))}`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Other program indicated but amount is 0 (PPP)',
        trigger: app => util_1.bool(app.DOBAffidavit_SBAPPP) &&
            helpers_1.isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAPPPDetails_Status_Value) &&
            !app.DOBAffidavit_SBAPPPDetails_Amount,
        messageGenerator: app => `Applicant reported PPP funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Other program indicated but amount is 0 (EIDG)',
        trigger: app => util_1.bool(app.DOBAffidavit_SBAEIDG) &&
            helpers_1.isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAEIDGDetails_Status_Value) &&
            !app.DOBAffidavit_SBAEIDGDetails_Amount,
        messageGenerator: app => `Applicant reported EIDG funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Other program indicated but amount is 0 (other stat/local)',
        trigger: app => util_1.bool(app.DOBAffidavit_OtherStateLocal) &&
            !app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess,
        messageGenerator: app => `Applicant reported other disaster funding approved or in progress ("${app.DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions}") but did not indicate the amount`,
        severity: types_1.Decision.Review,
    },
    // UNVERIFIED--
    // keep these last, since they could include long text:
    {
        name: 'Background Question #1 (convictions)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion1),
        messageGenerator: app => `Additional information provided on background question #1 (convictions): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails1}"`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Background Question #2 (denied licensure)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion2),
        messageGenerator: app => `Additional information provided on background question #2 (denied licensure): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails2}"`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Background Question #3 (public contractor subcontract ineligibility)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion3),
        messageGenerator: app => `Additional information provided on background question #3 (public contractor subcontract ineligibility): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails3}"`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Background Question #4 (violated the terms of a public agreement)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion4),
        messageGenerator: app => `Additional information provided on background question #4 (violated the terms of a public agreement): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails4}"`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Background Question #5 (injunction, order or lien)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion5),
        messageGenerator: app => `Additional information provided on background question #5 (injunction, order or lien): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails5}"`,
        severity: types_1.Decision.Review,
    },
    {
        name: 'Background Question #6 (presently indicted)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion6),
        messageGenerator: app => `Additional information provided on background question #6 (presently indicted): "${app.AdditionalBackgroundInformation_BackgroundQuestionDetails6}"`,
        severity: types_1.Decision.Review,
    },
];
function getFindings(app) {
    const findings = FINDING_DEFINITIONS.filter(def => def.trigger(app)).map(def => ({
        message: def.messageGenerator(app),
        severity: def.severity,
        name: def.name,
    }));
    return findings;
}
exports.getFindings = getFindings;
