import { GrantPhase1Data, ProductStatuses } from '../inputs/grant-phase-1';
import {
  adjustedMarchAprilMay2020Revenue,
  cappedMarchAprilMay2019Revenue,
  getQuarterlyWageData,
  isDobProgramApprovedOrInProgress,
} from './helpers';
import { bool, mround } from '../util';

import { DecoratedApplication } from './types';

const AMOUNT_PER_FTE = 1000;
const ABSOLUTE_MIN = 1000;
const ABSOLUTE_MAX = 10000;

export function grantPhase1AmountApproved(app: DecoratedApplication): number {
  const grantPhase1: GrantPhase1Data | undefined = app.grantPhase1;

  if (typeof grantPhase1 === 'undefined') {
    return 0;
  }

  if (
    grantPhase1['Product Status'] !== ProductStatuses.Closed &&
    grantPhase1['Product Status'] !== ProductStatuses.Closing
  ) {
    return 0;
  }

  return grantPhase1.Amount || 0;
}

export function awardBasis(app: DecoratedApplication): number {
  const fteCount: number = getQuarterlyWageData(app).fteCount || 0;
  const fteBasis: number = fteCount * AMOUNT_PER_FTE;

  return Math.min(Math.max(ABSOLUTE_MIN, fteBasis), ABSOLUTE_MAX);
}

export function reducibleFunding(app: DecoratedApplication): number {
  const grant: number = grantPhase1AmountApproved(app);
  const loan: number = app.nonDeclinedEdaLoan?.Amount || 0;
  const ppp: number =
    (bool(app.DOBAffidavit_SBAPPP) &&
      isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAPPPDetails_Status_Value) &&
      app.DOBAffidavit_SBAPPPDetails_Amount) ||
    0;
  const eidg: number =
    (bool(app.DOBAffidavit_SBAEIDG) &&
      isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAEIDGDetails_Status_Value) &&
      app.DOBAffidavit_SBAEIDGDetails_Amount) ||
    0;
  const other: number =
    (bool(app.DOBAffidavit_OtherStateLocal) &&
      app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess) ||
    0;

  return grant + loan + ppp + eidg + other;
}

export function reducibleFundingDescription(app: DecoratedApplication): string {
  const grant = grantPhase1AmountApproved(app) && 'NJEDA Small Business Emergency Assistance Phase 1 Grant Program';
  const loan = app.nonDeclinedEdaLoan?.Amount && 'NJEDA Small Business Emergency Assistance Loan Program';
  const ppp =
    (bool(app.DOBAffidavit_SBAPPP) &&
      isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAPPPDetails_Status_Value) &&
      app.DOBAffidavit_SBAPPPDetails_Amount) &&
      'Paycheck Protection Program (PPP)';
  const eidg =
    (bool(app.DOBAffidavit_SBAEIDG) &&
      isDobProgramApprovedOrInProgress(app.DOBAffidavit_SBAEIDGDetails_Status_Value) &&
      app.DOBAffidavit_SBAEIDGDetails_Amount) &&
      'Economic Injury Disaster Grant (EIDG) Program';
  const other =
    (bool(app.DOBAffidavit_OtherStateLocal) &&
      app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess) &&
      'another program through any state or local municipality';

  return [grant, loan, ppp, eidg, other].filter(s => s).join(', ');
}

export function adjustedYoyDecline(app: DecoratedApplication): number | null {
  const _cappedMarchAprilMay2019Revenue: number | undefined = cappedMarchAprilMay2019Revenue(app);

  if (typeof _cappedMarchAprilMay2019Revenue === 'undefined') {
    return null;
  }

  return _cappedMarchAprilMay2019Revenue - adjustedMarchAprilMay2020Revenue(app);
}

export function wasYoyDeclineAdjusted(app: DecoratedApplication): boolean | null {
  const reportedMarchAprilMay2019: number | undefined = app.RevenueComparison_MarchAprilMay2019;
  const _cappedMarchAprilMay2019Revenue: number | undefined = cappedMarchAprilMay2019Revenue(app);
  const didAdjust2019 = reportedMarchAprilMay2019 !== _cappedMarchAprilMay2019Revenue;
  const didAdjust2020 = app.RevenueComparison_MarchAprilMay2020 !== adjustedMarchAprilMay2020Revenue(app);

  if (typeof _cappedMarchAprilMay2019Revenue === 'undefined') {
    return null;
  }

  return didAdjust2019 || didAdjust2020;
}

export function discountedAwardBasis(app: DecoratedApplication): number {
  const _discountedAwardBasis: number = awardBasis(app) - grantPhase1AmountApproved(app);

  return Math.max(0, _discountedAwardBasis);
}

export function unmetNeed(app: DecoratedApplication): number | null {
  const _yoyDecline: number | null = adjustedYoyDecline(app);

  if (_yoyDecline === null) {
    return null;
  }

  const unrounded: number = _yoyDecline - reducibleFunding(app);
  const rounded: number = mround(unrounded, 1000);

  return Math.max(0, rounded);
}

export function awardSize(app: DecoratedApplication): number | null {
  const _unmetNeed: number | null = unmetNeed(app);

  if (_unmetNeed === null) {
    return null;
  }

  return Math.min(discountedAwardBasis(app), _unmetNeed);
}
