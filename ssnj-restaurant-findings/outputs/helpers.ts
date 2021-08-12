import * as types from './types';
import { DecoratedRestaurant } from '../inputs/restaurants';
import { CleanStatus } from '../inputs/restaurants/taxation';

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

export const NO_FINDINGS_STRING = 'NO FINDINGS';

function getQuarterlyWageData(restaurant: DecoratedRestaurant): types.QuarterlyWageData {
  if (restaurant.wr30.notFound) {
    return {
      fteCount: null,
      quarterDesc: null,
    };
  }

  const DOLLARS_PER_HOUR = 10.0;
  const HOURS_PER_WEEK = 35.0;
  const WEEKS_PER_QUARTER = 13.0;
  const FTE_QUARTERLY_MIN_WAGE = DOLLARS_PER_HOUR * HOURS_PER_WEEK * WEEKS_PER_QUARTER;

  const year: number = Math.max(...restaurant.wr30.wageRecords.map(record => record.Year));
  const quarter: number = Math.max(
    ...restaurant.wr30.wageRecords.filter(record => record.Year === year).map(record => record.Quarter)
  );

  const fractionalFtes: number = restaurant.wr30.wageRecords
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


export function getFindings(restaurant: DecoratedRestaurant): string {
  const wageData = getQuarterlyWageData(restaurant);
  const fteCount = wageData.fteCount;

  let findings: string[] = [];

  if (restaurant.taxation["Clean Ind."] === CleanStatus.Not_Found) {
    findings.push('Unknown to Taxation.');
  }

  if (restaurant.taxation["Clean Ind."] === CleanStatus.Not_Clear) {
    findings.push(`Taxation not clear.`);
  }

  if (!restaurant.dol.isActiveEmployer) {
    findings.push(`Possibly not an active employer, according to DOL (as of 3/30/2020).`);
  }

  if (restaurant.dol.uidNoGo) {
    findings.push('Issue with DOL status (UI), as of 3/23/2021.');
  }

  if (restaurant.dol.whdNoGo) {
    findings.push('Issue with DOL status (WH), as of 3/23/2021.');
  }

  if (restaurant.sams.possibleMatches.length) {
    findings.push(`Possible match on SAM Exclusion List (${restaurant.sams.possibleMatches}).`);
  }

  if (fteCount == null) {
    findings.push(`Could not determine FTE count from WR-30 data.`);
  }

  if (fteCount && fteCount > 50) {
    findings.push(
      `More than 50 Full-Time Equivalent workers at time of application (${fteCount}) based on WR-30 data (${wageData.quarterDesc}).`
    );
  }

  return findings.join(' ') || NO_FINDINGS_STRING;
}
