"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDOBValidateNOEINData = exports.init = void 0;
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
    return ((shouldFlag(record.ApplicantName, application.ContactInformation_BusinessName) ||
        shouldFlag(record.ApplicantName, application.ContactInformation_DoingBusinessAsDBA)
        || shouldFlag(record.ApplicantName, application.taxation['TAXREG Name'])));
}
let DOBValidate_NOEIN_RECORDS;
async function init(path) {
    console.log('Loading DOB Validate NO EIN data...');
    const raw = fs.readFileSync(path);
    DOBValidate_NOEIN_RECORDS = await neatCsv(raw);
}
exports.init = init;
function addDOBValidateNOEINData(application) {
    const possibleMatches = DOBValidate_NOEIN_RECORDS.filter(record => isPossibleMatch(application, record));
    const DOBValidateNOEIN = { possibleMatches };
    return { ...application, DOBValidateNOEIN };
}
exports.addDOBValidateNOEINData = addDOBValidateNOEINData;
//# sourceMappingURL=dobvalidate-noein.js.map