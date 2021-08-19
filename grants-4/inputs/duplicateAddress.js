"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDuplicateAddressData = exports.init = void 0;
const fs = require('fs');
const neatCsv = require('neat-csv');
const DuplicateAddress_MAP = new Map();
async function init(path) {
    console.log('Loading Duplicate Address data...');
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
        var _a;
        const streetAddress12 = (_a = rawRecord.StreetAddress12) === null || _a === void 0 ? void 0 : _a.toString().trim();
        if (!DuplicateAddress_MAP.has(streetAddress12.trim())) {
            DuplicateAddress_MAP.set(streetAddress12.trim(), []);
        }
        const DuplicateAddressRecords = DuplicateAddress_MAP.get(streetAddress12.trim());
        const DuplicateAddressRecord = {
            EIN: rawRecord.EIN,
            ApplicationID: rawRecord.ApplicationID,
            ApplicantName: rawRecord.ApplicantName,
            StreetAddress12: rawRecord.StreetAddress12.trim()
        };
        DuplicateAddressRecords.push(DuplicateAddressRecord);
    });
}
exports.init = init;
function addDuplicateAddressData(application) {
    var _a;
    //console.log("Applicant EIN:" + application.Business_TIN);
    //console.log("Applicant Address:" + application.ContactInformation_PrimaryBusinessAddress_Line1?.toString().trim() + "," + 
    //(application.ContactInformation_PrimaryBusinessAddress_Line2 != null ?application.ContactInformation_PrimaryBusinessAddress_Line2.toString().trim() : ""));
    const DuplicateAddressRecords = DuplicateAddress_MAP.get((((_a = application.ContactInformation_PrimaryBusinessAddress_Line1) === null || _a === void 0 ? void 0 : _a.toString().trim()) + "," + (application.ContactInformation_PrimaryBusinessAddress_Line2 != null ? application.ContactInformation_PrimaryBusinessAddress_Line2.toString().trim() : "")).trim()) || [];
    var DuplicateIDs = '';
    DuplicateAddressRecords.forEach(function (value) {
        DuplicateIDs += value.ApplicationID + ", ";
    });
    const DuplicateAddress = {
        DuplicateAddressRecords: DuplicateAddressRecords || [],
        DuplicateApplicationIDs: DuplicateIDs.trim()
    };
    console.log(DuplicateAddress);
    return { ...application, DuplicateAddress };
}
exports.addDuplicateAddressData = addDuplicateAddressData;
//# sourceMappingURL=duplicateAddress.js.map