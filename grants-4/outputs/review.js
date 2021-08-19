"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReview = void 0;
const types_1 = require("./types");
const helpers_1 = require("./helpers");
const findings_1 = require("./findings");
const award_size_1 = require("./award-size");
const util_1 = require("../util");
const options_1 = require("../options");
const award_size_2 = require("../outputs/award-size");
const { addDays, format } = require('date-fns');
const getAppealUrl = (app, reasons) => {
    const _adjustedYoyChange = helpers_1.adjustedYoyChange(app);
    const _unmetNeed = award_size_1.unmetNeed(app);
    const entry = {
        Inputs: {
            ApplicationID: app.ApplicationId,
            ApplicationSequenceID: app.njeda_submittedordernumber,
            EntityName: (!!app.ContactInformation_BusinessName) ? app.ContactInformation_BusinessName.trim() : '',
            TIN: (!!app.Business_TIN) ? app.Business_TIN.trim() : '',
            NAICS: app.NAICSCode,
            YearFounded: app.Business_YearEstablished,
            Expiration: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
            Email: (!!app.ContactInformation_Email) ? app.ContactInformation_Email.trim() : '',
            Reasons: reasons,
            TaxYear: helpers_1.getTaxationReportedTaxFilingAndYear(app).year,
            TaxRegName: (!!app.taxation["TAXREG Name"]) ? app.taxation["TAXREG Name"].trim() : '',
            UnmetNeed: _unmetNeed && util_1.formatDollars(_unmetNeed),
            RevisedUnmetNeed: !!app.njeda_revisedbusinessfundingneeded ? util_1.formatDollars(app.njeda_revisedbusinessfundingneeded) : util_1.formatDollars(0),
            OriginalUnmetNeed: !!app.njeda_additionalbusinessfundingneeded ? util_1.formatDollars(app.njeda_additionalbusinessfundingneeded) : util_1.formatDollars(0),
            UnmetNeedUserEntered: !!app.njeda_revisedbusinessfundingneeded ? util_1.formatDollars(app.njeda_revisedbusinessfundingneeded) : !!app.njeda_additionalbusinessfundingneeded ? util_1.formatDollars(app.njeda_additionalbusinessfundingneeded) : util_1.formatDollars(0),
            OtherCovidFunding: award_size_2.OtherFundingDescription(app),
            SBAPPP: util_1.formatDollars(award_size_2.OtherFundingAmountSBAPPP(app)),
            NJEDAPhase1: util_1.formatDollars(award_size_2.OtherFundingAmountNJEDAPhase1(app)),
            NJEDAPhase2: util_1.formatDollars(award_size_2.OtherFundingAmountNJEDAPhase2(app)),
            NJEDAPhase3: util_1.formatDollars(award_size_2.OtherFundingAmountNJEDAPhase3(app)),
            NJRA1orRA2: util_1.formatDollars(award_size_2.OtherFundingAmountNJRA1orRA2(app)),
            HMFAGrant: util_1.formatDollars(award_size_2.OtherFundingAmountHMFAGrant(app)),
            NJEDASSNJ: util_1.formatDollars(award_size_2.OtherFundingAmountNJEDASSNJ(app)),
            NJEDAPPE: util_1.formatDollars(award_size_2.OtherFundingAmountNJEDAPPE(app)),
            OtherProgram: util_1.formatDollars(award_size_2.OtherFundingAmountOther(app)),
        },
    };
    const host = options_1.options.force ? 'http://localhost:5000' : 'https://forms.business.nj.gov';
    const json = JSON.stringify(entry);
    const buffer = Buffer.from(json);
    const entryBase64 = buffer.toString('base64');
    const encodedEntry = encodeURIComponent(entryBase64);
    return `${host}/grants-4-review/?code=${encodedEntry}`;
};
exports.generateReview = (app) => {
    // if (!app.reviewNeeded) {
    //   return null;
    // }
    if (helpers_1.getDecision(app) !== types_1.Decision.Review) {
        return null;
    }
    const findings = (findings_1.getFindings(app).filter(finding => finding.severity === types_1.Decision.Review));
    const reasons = [...new Set(findings.map(finding => finding.slug).filter(s => s))]; // unique truthy slugs
    const city_state_zip = `${app.ContactInformation_Geography_Label}, NJ ${app.ContactInformation_ZipFirst5}`;
    //const Amount: string[]
    return {
        application_id: app.ApplicationId,
        application_sequence_id: app.njeda_submittedordernumber,
        email: app.ContactInformation_Email,
        first_name: (!!app.ContactInformation_ContactName_First) ? app.ContactInformation_ContactName_First.trim() : '',
        last_name: (!!app.ContactInformation_ContactName_Last) ? app.ContactInformation_ContactName_Last.trim() : '',
        business_name: (!!app.ContactInformation_BusinessName) ? app.ContactInformation_BusinessName.trim() : '',
        address1: (!!app.ContactInformation_PrimaryBusinessAddress_Line1) ? app.ContactInformation_PrimaryBusinessAddress_Line1.toUpperCase().trim() : '',
        address2: (!!app.ContactInformation_PrimaryBusinessAddress_Line2) ? app.ContactInformation_PrimaryBusinessAddress_Line2.toUpperCase().trim() : '',
        city_state_zip,
        appeal_url: getAppealUrl(app, reasons),
        reasons,
    };
};
//# sourceMappingURL=review.js.map