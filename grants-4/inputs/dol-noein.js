"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDOLNOEINData = exports.init = void 0;
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
    return ((shouldFlag(record.Name2, application.ContactInformation_BusinessName) ||
        shouldFlag(record.Name2, application.ContactInformation_DoingBusinessAsDBA)
        || shouldFlag(record.Name2, application.taxation['TAXREG Name'])));
}
let DOL_NOEIN_RECORDS;
async function init(path) {
    console.log('Loading DOL WHD NO EIN data...');
    const raw = fs.readFileSync(path);
    DOL_NOEIN_RECORDS = await neatCsv(raw);
}
exports.init = init;
function addDOLNOEINData(application) {
    const possibleMatches = DOL_NOEIN_RECORDS.filter(record => isPossibleMatch(application, record));
    const DOLNOEIN = { possibleMatches };
    return { ...application, DOLNOEIN };
}
exports.addDOLNOEINData = addDOLNOEINData;
//# sourceMappingURL=dol-noein.js.map