"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSamsData = exports.init = void 0;
const fs = require('fs');
const neatCsv = require('neat-csv');
const stringSimilarity = require('string-similarity');
function shouldFlag(a, b) {
    const TOLERANCE = 0.85;
    return (!!(a === null || a === void 0 ? void 0 : a.trim()) &&
        !!(b === null || b === void 0 ? void 0 : b.trim()) &&
        stringSimilarity.compareTwoStrings(a.trim().toUpperCase(), b.trim().toUpperCase()) >= TOLERANCE);
}
function isPossibleMatch(application, record) {
    // return false; // debug
    return (record.Country === 'USA' &&
        ['NJ', 'NY', 'PA', 'CT', 'DE'].includes(record['State / Province']) &&
        (shouldFlag(record.Name, application.ContactInformation_BusinessName) ||
            shouldFlag(record.Name, application.ContactInformation_DoingBusinessAsDBA) ||
            shouldFlag(record.Name, application.taxation['TAXREG Name'])));
}
let SAMS_EXCLUSION_RECORDS;
async function init(path) {
    console.log('Loading SAMS data...');
    const raw = fs.readFileSync(path);
    SAMS_EXCLUSION_RECORDS = await neatCsv(raw);
}
exports.init = init;
function addSamsData(application) {
    const possibleMatches = SAMS_EXCLUSION_RECORDS.filter(record => isPossibleMatch(application, record));
    const sams = { possibleMatches };
    return { ...application, sams };
}
exports.addSamsData = addSamsData;
