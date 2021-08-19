"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDuplicateData = void 0;
const address_1 = require("./address");
const seenEins = new Map();
const seenAddresses = new Map();
// intentionally doesn't look at city/municipality/zip to ensure we flag as many as possible
function serializeAddress(application) {
    const line1 = application.ContactInformation_PrimaryBusinessAddress_Line1;
    const line2 = application.ContactInformation_PrimaryBusinessAddress_Line2;
    return address_1.normalize(`${line1} ${line2}`)
        .replace(/\W/g, '')
        .toUpperCase();
}
function addDuplicateData(application) {
    var _a, _b, _c, _d;
    const address = serializeAddress(application);
    // make a shallow copy of collections before adding to them
    const duplicates = {
        byTin: (_a = seenEins.get(application.Business_TIN)) === null || _a === void 0 ? void 0 : _a.slice(),
        byAddress: (_b = seenAddresses.get(address)) === null || _b === void 0 ? void 0 : _b.slice(),
        serializedAddress: address,
    };
    // init collections
    if (!seenEins.has(application.Business_TIN)) {
        seenEins.set(application.Business_TIN, []);
    }
    if (!seenAddresses.has(address)) {
        seenAddresses.set(address, []);
    }
    // add this application's data to collections
    (_c = seenEins.get(application.Business_TIN)) === null || _c === void 0 ? void 0 : _c.push(application.ApplicationId);
    (_d = seenAddresses.get(address)) === null || _d === void 0 ? void 0 : _d.push(application.ApplicationId);
    return { ...application, duplicates };
}
exports.addDuplicateData = addDuplicateData;
//# sourceMappingURL=duplicates.js.map