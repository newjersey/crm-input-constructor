"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addABCData = exports.init = void 0;
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
    return ((shouldFlag(record.Licensee, application.ContactInformation_BusinessName) ||
        shouldFlag(record.Licensee, application.ContactInformation_DoingBusinessAsDBA)
        || shouldFlag(record.Licensee, application.taxation['TAXREG Name'])));
}
let ABC_EXCLUSION_RECORDS;
async function init(path) {
    console.log('Loading ABC data...');
    const raw = fs.readFileSync(path);
    ABC_EXCLUSION_RECORDS = await neatCsv(raw);
}
exports.init = init;
function addABCData(application) {
    const possibleMatches = ABC_EXCLUSION_RECORDS.filter(record => isPossibleMatch(application, record));
    const ABC = { possibleMatches };
    return { ...application, ABC };
}
exports.addABCData = addABCData;
//# sourceMappingURL=ABC.js.map