import { DOB_Status, YesNo } from './inputs/applications';

// TODO -- make these imports?
const numeral = require('numeral');
const { getJsDateFromExcel } = require('excel-date-to-js');
const { utcToZonedTime } = require('date-fns-tz');

export function bool(yesNo: YesNo): boolean {
  switch (yesNo) {
    case YesNo.Sí:
    case YesNo.Yes:
      return true;
    case YesNo.No:
      return false;
    default:
      throw new Error(`Cannot convert to boolean: ${yesNo}`);
  }
}

export function dateFromExcel(excelFloat: number): Date {
  const excelFloatString: string = excelFloat.toString(10);

  // dumb getJsDateFromExcel API wants a string for some reason
  const utcDate: Date = getJsDateFromExcel(excelFloatString);

  // dumb getJsDateFromExcel library returns local date as UTC
  return utcToZonedTime(utcDate, 'UTC');
}

// given a string to parse, return milliseconds only for the day part (not time)
export function formatDate(date: Date): string {
  date.setHours(0, 0, 0, 0);

  return `\/Date(${date.getTime()})\/`;
}

// given an excel-style date string, return the day part in the right format and time zone
export function formatExcelDate(excelFloat: number): string {
  return formatDate(dateFromExcel(excelFloat));
}

export function mround(number: number, multiple: number): number {
  return Math.floor((number / multiple)) * multiple;
}

export function formatDollars(number: number): string {
  return numeral(number).format('$0,0');
}

export function formatPercent(number: number, options?: { decimals: number }): string {
  const decimalString: string = `[.]${'0'.repeat(options?.decimals || 0)}`;

  return numeral(number).format(`0,0${options?.decimals ? decimalString : ''}%`);
}
