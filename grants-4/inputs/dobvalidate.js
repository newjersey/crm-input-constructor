"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDOBValidationData = exports.init = void 0;
const fs = require('fs');
const neatCsv = require('neat-csv');
const DOBValidation_MAP = new Map();
async function init(path) {
    console.log('Loading Sister Agencies DOB Validation data...');
    const raw = fs.readFileSync(path);
    (await neatCsv(raw, {
        strict: true,
        headers: [
            'Program',
            'ApplicationID',
            'ApplicantName',
            'EIN',
            'Amount'
        ],
    })).forEach((rawRecord) => {
        const ein = rawRecord.EIN.replace("'", "");
        if (!DOBValidation_MAP.has(ein)) {
            DOBValidation_MAP.set(ein, []);
        }
        const DOBRecords = DOBValidation_MAP.get(ein);
        const DOBRecord = {
            EIN: rawRecord.EIN,
            Program: rawRecord.Program,
            Amount: rawRecord.Amount,
        };
        DOBRecords.push(DOBRecord);
    });
}
exports.init = init;
function addDOBValidationData(application) {
    //console.log("Applicant EIN:" + application.Business_TIN);
    const DOBRecords = DOBValidation_MAP.get(application.Business_TIN) || [];
    let i = 1;
    var DOBFindingsString = '';
    var DOBAmount = '';
    DOBRecords.forEach(function (value) {
        const Program = value.Program;
        const Amount = value.Amount;
        DOBFindingsString += " DOB " + (i++) + ": Program: " + Program + ", Amount: " + Amount + ",";
        DOBAmount += "Amounts: " + Program + Amount + Program + ",";
    });
    const DOBValidation = {
        DOBRecords: DOBRecords || [],
        DOBFindings: DOBFindingsString,
        DOBAmounts: DOBAmount
    };
    //console.log(DOBValidation);
    return { ...application, DOBValidation };
}
exports.addDOBValidationData = addDOBValidationData;
//# sourceMappingURL=dobvalidate.js.map