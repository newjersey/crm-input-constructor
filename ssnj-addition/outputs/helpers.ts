import * as types from './types';
import { WR30 } from '../inputs/staff/wr30';

const { getJsDateFromExcel } = require('excel-date-to-js');
const { utcToZonedTime } = require('date-fns-tz');

export function dateFromExcel(excelFloat: number): Date {
  const excelFloatString: string = excelFloat.toString(10);

  // dumb getJsDateFromExcel API wants a string for some reason
  const utcDate: Date = getJsDateFromExcel(excelFloatString);

  // dumb getJsDateFromExcel library returns local date as UTC
  return utcToZonedTime(utcDate, 'UTC');
}

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

export function getQuarterlyWageData(restaurant: WR30): types.QuarterlyWageData {
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
    ...restaurant.wr30.wageRecords
      .filter(record => record.Year === year)
      .map(record => record.Quarter)
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
