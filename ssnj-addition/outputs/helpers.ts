import * as types from './types';
import { Restaurant } from '..//inputs/restaurants';
import { TaxClearance } from '../inputs/restaurants/xlsx';

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

export function getFindings(restaurant: Restaurant): string {
  const NO_FINDINGS_STRING = 'NO FINDINGS';
  const fteCount = restaurant.Restaurant_FTE;
  let findings: string[] = [];

  if (restaurant.Tax_Clear === TaxClearance.Unknown) {
    findings.push('Unknown to Taxation.');
  }

  if (restaurant.Tax_Clear === TaxClearance.No) {
    findings.push(`Taxation not clear.`);
  }

  if (!restaurant.Known_to_DOL) {
    findings.push('Possibly not an active employer, according to DOL.');
  }

  if (!restaurant.DOL_UI_Clear) {
    findings.push('Issue with DOL status (UI).');
  }

  if (!restaurant.DOL_WH_Clear) {
    findings.push('Issue with DOL status (WH).');
  }

  if (fteCount == null) {
    findings.push(`Could not determine FTE count from WR-30 data.`);
  }

  if (fteCount && fteCount > 50) {
    findings.push(
      `More than 50 Full-Time Equivalent workers at time of application (${fteCount}) based on WR-30 data used for restaurant addition round ${restaurant.Addition_Round} (of SSJ Phase 1).`
    );
  }

  return findings.join(' ') || NO_FINDINGS_STRING;
}
