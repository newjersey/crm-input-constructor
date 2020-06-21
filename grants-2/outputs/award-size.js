"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awardSize = exports.unmetNeed = exports.discountedAwardBasis = exports.yoyDecline = exports.reducibleFunding = exports.awardBasis = exports.grantPhase1AmountApproved = void 0;
const grant_phase_1_1 = require("../inputs/grant-phase-1");
const util_1 = require("../util");
const helpers_1 = require("./helpers");
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
function yoyDecline(app) {
    if (typeof app.RevenueComparison_MarchAprilMay2019 === 'undefined') {
        return null;
    }
    return app.RevenueComparison_MarchAprilMay2019 - app.RevenueComparison_MarchAprilMay2020;
}
exports.yoyDecline = yoyDecline;
function discountedAwardBasis(app) {
    const _discountedAwardBasis = awardBasis(app) - grantPhase1AmountApproved(app);
    return Math.max(0, _discountedAwardBasis);
}
exports.discountedAwardBasis = discountedAwardBasis;
function unmetNeed(app) {
    const _yoyDecline = yoyDecline(app);
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
