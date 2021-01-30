"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awardSize = exports.unmetNeed = exports.discountedAwardBasis = exports.wasYoyDeclineAdjusted = exports.adjustedYoyDecline = exports.reducibleFundingDescription = exports.reducibleFunding = exports.awardBasis = exports.grantPhase1AmountApproved = void 0;
const grant_phase_1_1 = require("../inputs/grant-phase-1");
const helpers_1 = require("./helpers");
const util_1 = require("../util");
const AMOUNT_PER_FTE = 1000;
const ABSOLUTE_MIN = 1000;
const ABSOLUTE_MAX = 10000;
function grantPhase1AmountApproved(app) {
    const grantPhase1 = app.grantPhase1;
    if (typeof grantPhase1 === 'undefined') {
        return 0;
    }
    if (grantPhase1['Product Status'] !== grant_phase_1_1.ProductStatuses.Closed &&
        grantPhase1['Product Status'] !== grant_phase_1_1.ProductStatuses.Closing) {
        return 0;
    }
    return grantPhase1.Amount || 0;
}
exports.grantPhase1AmountApproved = grantPhase1AmountApproved;
function awardBasis(app) {
    const fteCount = helpers_1.getQuarterlyWageData(app).fteCount || 0;
    const fteBasis = fteCount * AMOUNT_PER_FTE;
    return Math.min(Math.max(ABSOLUTE_MIN, fteBasis), ABSOLUTE_MAX);
}
exports.awardBasis = awardBasis;
function reducibleFunding(app) {
    var _a;
    const grant = grantPhase1AmountApproved(app);
    const loan = ((_a = app.nonDeclinedEdaLoan) === null || _a === void 0 ? void 0 : _a.Amount) || 0;
    const ppp = (util_1.bool(app.DOBAffidavit_SBAPPP) &&
        helpers_1.isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAPPPDetails_Status_Value) &&
        app.DOBAffidavit_SBAPPPDetails_Amount) ||
        0;
    const eidg = (util_1.bool(app.DOBAffidavit_SBAEIDG) &&
        helpers_1.isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAEIDGDetails_Status_Value) &&
        app.DOBAffidavit_SBAEIDGDetails_Amount) ||
        0;
    const other = (util_1.bool(app.DOBAffidavit_OtherStateLocal) &&
        app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess) ||
        0;
    return grant + loan + ppp + eidg + other;
}
exports.reducibleFunding = reducibleFunding;
function reducibleFundingDescription(app) {
    var _a;
    const grant = grantPhase1AmountApproved(app) && 'NJEDA Small Business Emergency Assistance Phase 1 Grant Program';
    const loan = ((_a = app.nonDeclinedEdaLoan) === null || _a === void 0 ? void 0 : _a.Amount) && 'NJEDA Small Business Emergency Assistance Loan Program';
    const ppp = (util_1.bool(app.DOBAffidavit_SBAPPP) &&
        helpers_1.isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAPPPDetails_Status_Value) &&
        app.DOBAffidavit_SBAPPPDetails_Amount) &&
        'Paycheck Protection Program (PPP)';
    const eidg = (util_1.bool(app.DOBAffidavit_SBAEIDG) &&
        helpers_1.isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAEIDGDetails_Status_Value) &&
        app.DOBAffidavit_SBAEIDGDetails_Amount) &&
        'Economic Injury Disaster Grant (EIDG) Program';
    const other = (util_1.bool(app.DOBAffidavit_OtherStateLocal) &&
        app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess) &&
        'another program through any state or local municipality';
    return [grant, loan, ppp, eidg, other].filter(s => s).join(', ');
}
exports.reducibleFundingDescription = reducibleFundingDescription;
function adjustedYoyDecline(app) {
    const _cappedMarchAprilMay2019Revenue = helpers_1.cappedMarchAprilMay2019Revenue(app);
    if (typeof _cappedMarchAprilMay2019Revenue === 'undefined') {
        return null;
    }
    return _cappedMarchAprilMay2019Revenue - helpers_1.adjustedMarchAprilMay2020Revenue(app);
}
exports.adjustedYoyDecline = adjustedYoyDecline;
function wasYoyDeclineAdjusted(app) {
    const reportedMarchAprilMay2019 = app.RevenueComparison_MarchAprilMay2019;
    const _cappedMarchAprilMay2019Revenue = helpers_1.cappedMarchAprilMay2019Revenue(app);
    const didAdjust2019 = reportedMarchAprilMay2019 !== _cappedMarchAprilMay2019Revenue;
    const didAdjust2020 = app.RevenueComparison_MarchAprilMay2020 !== helpers_1.adjustedMarchAprilMay2020Revenue(app);
    if (typeof _cappedMarchAprilMay2019Revenue === 'undefined') {
        return null;
    }
    return didAdjust2019 || didAdjust2020;
}
exports.wasYoyDeclineAdjusted = wasYoyDeclineAdjusted;
function discountedAwardBasis(app) {
    const _discountedAwardBasis = awardBasis(app) - grantPhase1AmountApproved(app);
    return Math.max(0, _discountedAwardBasis);
}
exports.discountedAwardBasis = discountedAwardBasis;
function unmetNeed(app) {
    const _yoyDecline = adjustedYoyDecline(app);
    if (_yoyDecline === null) {
        return null;
    }
    const unrounded = _yoyDecline - reducibleFunding(app);
    const rounded = util_1.mround(unrounded, 1000);
    return Math.max(0, rounded);
}
exports.unmetNeed = unmetNeed;
function awardSize(app) {
    const _unmetNeed = unmetNeed(app);
    if (_unmetNeed === null) {
        return null;
    }
    return Math.min(discountedAwardBasis(app), _unmetNeed);
}
exports.awardSize = awardSize;
//# sourceMappingURL=award-size.js.map