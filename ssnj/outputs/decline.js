"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDecline = void 0;
const types_1 = require("./types");
const helpers_1 = require("./helpers");
const findings_1 = require("./findings");
const { addDays, format } = require('date-fns');
const getReasons = (findings) => {
    return findings.map(finding => finding.publicMessage);
};
const getAppealUrl = (app, findings) => {
    const entry = {
        ApplicationID: app.ApplicationId,
        EntityName: app.ContactInformation_BusinessName.trim().trim(),
        EIN: app.Business_TIN.trim(),
        NAICS: app.NAICSCode,
        YearFounded: app.Business_YearEstablished,
        Expiration: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
        Email: app.ContactInformation_Email.trim(),
        Reasons: findings.map(finding => finding.slug),
    };
    const json = JSON.stringify(entry);
    const buffer = Buffer.from(json);
    const entryBase64 = buffer.toString('base64');
    return `https://forms.business.nj.gov/grant-2-appeal/?code=${entryBase64}`;
};
exports.generateDecline = (app) => {
    if (helpers_1.getDecision(app) !== types_1.Decision.Decline) {
        return null;
    }
    const findings = (findings_1.getFindings(app).filter(finding => finding.severity === types_1.Decision.Decline));
    const city_state_zip = `${app.geography.City.trim()}, ${app.ContactInformation_PrimaryBusinessAddress_State.trim()} ${app.ContactInformation_PrimaryBusinessAddress_PostalCode.padStart(5, '0').trim()}`;
    return {
        application_id: app.ApplicationId,
        email: app.ContactInformation_Email.trim(),
        first_name: app.ContactInformation_ContactName_First.trim(),
        last_name: app.ContactInformation_ContactName_Last.trim(),
        business_name: app.ContactInformation_BusinessName.trim(),
        address1: app.ContactInformation_PrimaryBusinessAddress_Line1.toUpperCase().trim(),
        address2: app.ContactInformation_PrimaryBusinessAddress_Line2.toUpperCase().trim(),
        city_state_zip,
        reasons: getReasons(findings),
        appeal_url: getAppealUrl(app, findings),
    };
};
//# sourceMappingURL=decline.js.map