"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPercent = exports.formatDollars = exports.mround = exports.formatExcelDate = exports.formatDate = exports.dateFromExcel = exports.bool = void 0;
const applications_1 = require("./inputs/applications");
// TODO -- make these imports?
const numeral = require('numeral');
const { getJsDateFromExcel } = require('excel-date-to-js');
const { utcToZonedTime } = require('date-fns-tz');
function bool(yesNo) {
    switch (yesNo) {
        case applications_1.YesNo.Sí:
        case applications_1.YesNo.Yes:
            return true;
        case applications_1.YesNo.No:
            return false;
        default:
            throw new Error(`Cannot convert to boolean: ${yesNo}`);
    }
}
exports.bool = bool;
function dateFromExcel(excelFloat) {
    const excelFloatString = excelFloat.toString(10);
    // dumb getJsDateFromExcel API wants a string for some reason
    const utcDate = getJsDateFromExcel(excelFloatString);
    // dumb getJsDateFromExcel library returns local date as UTC
    return utcToZonedTime(utcDate, 'UTC');
}
exports.dateFromExcel = dateFromExcel;
// given a string to parse, return milliseconds only for the day part (not time)
function formatDate(date) {
    date.setHours(0, 0, 0, 0);
    return `\/Date(${date.getTime()})\/`;
}
exports.formatDate = formatDate;
// given an excel-style date string, return the day part in the right format and time zone
function formatExcelDate(excelFloat) {
    return formatDate(dateFromExcel(excelFloat));
}
exports.formatExcelDate = formatExcelDate;
function mround(number, multiple) {
    return Math.floor((number / multiple)) * multiple;
}
exports.mround = mround;
function formatDollars(number) {
    return numeral(number).format('$0,0');
}
exports.formatDollars = formatDollars;
function formatPercent(number, options) {
    const decimalString = `[.]${'0'.repeat((options === null || options === void 0 ? void 0 : options.decimals) || 0)}`;
    return numeral(number).format(`0,0${(options === null || options === void 0 ? void 0 : options.decimals) ? decimalString : ''}%`);
}
exports.formatPercent = formatPercent;
//# sourceMappingURL=util.js.map