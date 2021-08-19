"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDecline = void 0;
const types_1 = require("./types");
const helpers_1 = require("./helpers");
const findings_1 = require("./findings");
const util_1 = require("../util");
const { addDays, format } = require('date-fns');
const getReasons = (findings) => {
    return findings.map(finding => finding.publicMessage);
};
const getAppealUrl = (app, findings) => {
    const entry = {
        ApplicationID: app.ApplicationId,
        EntityName: app.ContactInformation_BusinessName.trim().trim(),
        EntityType: app.Business_EntityType,
        EIN: app.Business_TIN.toString().trim(),
        NAICS: app.NAICSCode,
        YearFounded: util_1.dateFromExcel(app.Business_DateEstablished).toLocaleDateString(),
        Expiration: format(addDays(new Date(), 9), 'yyyy-MM-dd'),
        Email: app.ContactInformation_Email.trim(),
        Reasons: findings.map(finding => finding.slug),
    };
    const json = JSON.stringify(entry);
    const buffer = Buffer.from(json);
    const entryBase64 = buffer.toString('base64');
    const encodedEntry = encodeURIComponent(entryBase64);
    return `https://forms.business.nj.gov/grant-4-appeal/?code=${encodedEntry}`;
};
exports.generateDecline = (app) => {
    if (helpers_1.getDecision(app) !== types_1.Decision.Decline) {
        return null;
    }
    const findings = (findings_1.getFindings(app).filter(finding => finding.severity === types_1.Decision.Decline));
    const city_state_zip = `${app.ContactInformation_Geography_Label}, NJ ${app.ContactInformation_ZipFirst5}`;
    return {
        application_id: app.ApplicationId,
        application_sequence_id: app.njeda_submittedordernumber,
        email: app.ContactInformation_Email.trim(),
        first_name: app.ContactInformation_ContactName_First.trim(),
        last_name: app.ContactInformation_ContactName_Last.trim(),
        business_name: app.ContactInformation_BusinessName.trim(),
        address1: (!!app.ContactInformation_PrimaryBusinessAddress_Line1) ? app.ContactInformation_PrimaryBusinessAddress_Line1.toUpperCase().trim() : '',
        address2: (!!app.ContactInformation_PrimaryBusinessAddress_Line2) ? app.ContactInformation_PrimaryBusinessAddress_Line2.toUpperCase().trim() : '',
        city_state_zip,
        reasons: getReasons(findings),
        appeal_url: getAppealUrl(app, findings),
        expiration: format(addDays(new Date(), 7), 'MM/dd/yyyy')
    };
};
//# sourceMappingURL=decline.js.map