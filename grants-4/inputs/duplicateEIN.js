"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDuplicateEINData = exports.init = void 0;
const fs = require('fs');
const neatCsv = require('neat-csv');
const DuplicateEIN_MAP = new Map();
async function init(path) {
    console.log('Loading Duplicate EIN data...');
    const raw = fs.readFileSync(path);
    (await neatCsv(raw, {
        strict: true,
        headers: [
            'ApplicationID',
            'ApplicantName',
            'StatusReason',
            'EIN',
            'StreetAddress',
            'StreetAddress2',
            'StreetAddress12',
            'City',
            'ZIP',
            'State',
            'County'
        ],
    })).forEach((rawRecord) => {
        const ein = rawRecord.EIN.replace("'", "");
        if (!DuplicateEIN_MAP.has(ein)) {
            DuplicateEIN_MAP.set(ein, []);
        }
        const DuplicateEINRecords = DuplicateEIN_MAP.get(ein);
        const DuplicateEINRecord = {
            EIN: rawRecord.EIN,
            ApplicationID: rawRecord.ApplicationID,
            ApplicantName: rawRecord.ApplicantName,
        };
        DuplicateEINRecords.push(DuplicateEINRecord);
    });
}
exports.init = init;
function addDuplicateEINData(application) {
    console.log("Applicant EIN:" + application.Business_TIN);
    const DuplicateEINRecords = DuplicateEIN_MAP.get(application.Business_TIN.toString().trim()) || [];
    var DuplicateIDs = '';
    DuplicateEINRecords.forEach(function (value) {
        DuplicateIDs += value.ApplicationID + ", ";
    });
    const DuplicateEIN = {
        DuplicateEINRecords: DuplicateEINRecords || [],
        DuplicateApplicationIDs: DuplicateIDs.trim()
    };
    console.log(DuplicateEIN);
    return { ...application, DuplicateEIN };
}
exports.addDuplicateEINData = addDuplicateEINData;
//# sourceMappingURL=duplicateEIN.js.map