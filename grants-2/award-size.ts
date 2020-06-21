import { GrantPhase1Data, ProductStatuses } from './grant-phase-1';
import { bool, isDobProgramApprovedOrInProgress, mround } from './util';

import { DecoratedApplication } from './ola-datas-types';
import { getQuarterlyWageData } from './ola-datas-helpers';

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

export function yoyDecline(app: DecoratedApplication): number | null {
  if (typeof app.RevenueComparison_MarchAprilMay2019 === 'undefined') {
    return null;
  }

  return app.RevenueComparison_MarchAprilMay2019 - app.RevenueComparison_MarchAprilMay2020;
}

export function discountedAwardBasis(app: DecoratedApplication): number {
  const _discountedAwardBasis: number = awardBasis(app) - grantPhase1AmountApproved(app);

  return Math.max(0, _discountedAwardBasis);
}

export function unmetNeed(app: DecoratedApplication): number | null {
  const _yoyDecline: number | null = yoyDecline(app);

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
