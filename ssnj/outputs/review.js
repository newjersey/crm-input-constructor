"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReview = void 0;
const types_1 = require("./types");
const helpers_1 = require("./helpers");
const findings_1 = require("./findings");
const award_size_1 = require("./award-size");
const util_1 = require("../util");
const options_1 = require("../options");
const { addDays, format } = require('date-fns');
const getAppealUrl = (app, reasons) => {
    const _adjustedYoyChange = helpers_1.adjustedYoyChange(app);
    const _unmetNeed = award_size_1.unmetNeed(app);
    const entry = {
        Inputs: {
            ApplicationID: app.ApplicationId,
            EntityName: app.ContactInformation_BusinessName.trim().trim(),
            TIN: app.Business_TIN.trim(),
            NAICS: app.NAICSCode,
            YearFounded: app.Business_YearEstablished,
            Expiration: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
            Email: app.ContactInformation_Email.trim(),
            Reasons: reasons,
            TaxYear: helpers_1.getTaxationReportedTaxFilingAndYear(app).year,
            DiscountedAwardBasis: util_1.formatDollars(award_size_1.discountedAwardBasis(app)),
            UnmetNeed: _unmetNeed && util_1.formatDollars(_unmetNeed),
            RevenueDecline: util_1.formatDollars(award_size_1.adjustedYoyDecline(app)),
            RevenueDeclinePercent: _adjustedYoyChange && util_1.formatPercent(-_adjustedYoyChange),
            OtherCovidFunding: award_size_1.reducibleFundingDescription(app),
            DOBAmount: util_1.formatDollars(award_size_1.reducibleFunding(app)),
            Capacity: helpers_1.getCapacityOpen(app),
            RevenueWasAdjusted: award_size_1.wasYoyDeclineAdjusted(app),
        },
    };
    const host = options_1.options.force ? 'http://localhost:5000' : 'https://forms.business.nj.gov';
    const json = JSON.stringify(entry);
    const buffer = Buffer.from(json);
    const entryBase64 = buffer.toString('base64');
    return `${host}/grants-2-review/?code=${entryBase64}`;
};
exports.generateReview = (app) => {
    // if (!app.reviewNeeded) {
    //   return null;
    // }
    var _a;
    if (helpers_1.getDecision(app) !== types_1.Decision.Review) {
        return null;
    }
    const findings = (findings_1.getFindings(app).filter(finding => finding.severity === types_1.Decision.Review));
    const reasons = [...new Set(findings.map(finding => finding.slug).filter(s => s))]; // unique truthy slugs
    const city_state_zip = `${app.geography.City.trim()}, ${app.ContactInformation_PrimaryBusinessAddress_State.trim()} ${app.ContactInformation_PrimaryBusinessAddress_PostalCode.padStart(5, '0').trim()}`;
    return {
        application_id: app.ApplicationId,
        email: ((_a = app.reviewNeeded) === null || _a === void 0 ? void 0 : _a.email) || app.ContactInformation_Email,
        first_name: app.ContactInformation_ContactName_First.trim(),
        last_name: app.ContactInformation_ContactName_Last.trim(),
        business_name: app.ContactInformation_BusinessName.trim(),
        address1: app.ContactInformation_PrimaryBusinessAddress_Line1.toUpperCase().trim(),
        address2: app.ContactInformation_PrimaryBusinessAddress_Line2.toUpperCase().trim(),
        city_state_zip,
        appeal_url: getAppealUrl(app, reasons),
    };
};
//# sourceMappingURL=review.js.map