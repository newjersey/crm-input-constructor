"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFindings = void 0;
const date_fns_1 = require("date-fns");
const types_1 = require("./types");
const util_1 = require("../util");
const award_size_1 = require("./award-size");
const helpers_1 = require("./helpers");
const applications_1 = require("../inputs/applications");
const stringSimilarity = require('string-similarity');
// try to keep Declines at top and Reviews at bottom, so they print that way when serialized in CRM;
// also keep potentially long messages (e.g. user input) at the end, in case it goes on forever.
const FINDING_DEFINITIONS = [
    // yesNo(app.sams.possibleMatches.length > 0), // TODO: if yes, add details to findings
    {
        // TODO: unverified
        name: 'Ineligible entity type',
        trigger: app => (app.Business_EntityType_Value === applications_1.EntityType.Other || app.Business_EntityType_Value === applications_1.EntityType.Government_Body),
        messageGenerator: app => `Ineligible Business Entity Type: "Other (estate, municipality, Government Body, etc.)"`,
        publicMessageGenerator: app => `Entity is considered an ineligible entity type (e.g. estate, municipality, Government Body, etc.)`,
        severity: types_1.Decision.Decline,
        slug: 'Entity',
    },
    {
        // TODO: unverified
        name: 'Business too new',
        trigger: app => !!app.Business_DateEstablished &&
            date_fns_1.isAfter(util_1.dateFromExcel(app.Business_DateEstablished), new Date(2020, 1, 15)),
        messageGenerator: app => `Business established on ${util_1.dateFromExcel(app.Business_DateEstablished).toLocaleDateString()}, which is after the cutoff date of ${new Date(2020, 1, 15).toLocaleDateString()}`,
        publicMessageGenerator: app => `Entity was not in operation on February 15, 2020`,
        severity: types_1.Decision.Decline,
        slug: 'Year',
    },
    {
        // unverified
        name: 'Gambling',
        trigger: app => util_1.bool(app.BusinessDetails_GamblingActivities),
        messageGenerator: app => `Organization hosts gambling or gaming activities`,
        publicMessageGenerator: app => `Entity is considered an ineligible entity because it hosts gambling or gaming activities`,
        severity: types_1.Decision.Decline,
        slug: 'Gambling',
    },
    {
        // unverified
        name: 'Adult',
        trigger: app => app.BusinessDetails_AdultActivities !== '' && util_1.bool(app.BusinessDetails_AdultActivities),
        messageGenerator: app => `Organization conducts or purveys “adult” activities, services, products or materials`,
        publicMessageGenerator: app => `Entity is considered an ineligible entity because it conducts or purveys “adult” activities, services, products or materials`,
        severity: types_1.Decision.Decline,
        slug: 'Adult',
    },
    {
        // unverified
        name: 'Auctions/Sales',
        trigger: app => util_1.bool(app.BusinessDetails_SalessActivities),
        messageGenerator: app => `Organization conducts auctions, bankruptcy sales, fire sales, “lost-our-lease,” “going-out-of-business,” or similar sales`,
        publicMessageGenerator: app => `Entity is considered an ineligible entity because it conducts auctions, bankruptcy sales, fire sales, “lost-our-lease,” “going-out-of-business,” or similar sales`,
        severity: types_1.Decision.Decline,
        slug: 'Sales',
    },
    {
        // unverified
        name: 'Transient merchant',
        trigger: app => util_1.bool(app.BusinessDetails_TransientMerchant),
        messageGenerator: app => `Organization is a transient merchant ("peddler," "popup store," or "itinerant vendor")`,
        publicMessageGenerator: app => `Entity is considered an ineligible entity because it is a transient merchant ("peddler," "popup store," or "itinerant vendor")`,
        severity: types_1.Decision.Decline,
        slug: 'Transient',
    },
    {
        // unverified
        name: 'Outdoor storage',
        trigger: app => util_1.bool(app.BusinessDetails_OutdoorStorageCompany),
        messageGenerator: app => `Organization is an outdoor storage company`,
        publicMessageGenerator: app => `Entity is considered an ineligible entity because it is an outdoor storage company`,
        severity: types_1.Decision.Decline,
        slug: 'Outdoor',
    },
    {
        // unverified
        name: 'Nuisance',
        trigger: app => util_1.bool(app.BusinessDetails_NuisanceActivities),
        messageGenerator: app => `Organization conducts activities that may constitute a nuisance`,
        publicMessageGenerator: app => `Entity is considered an ineligible entity because it conducts activities that may constitute a nuisance`,
        severity: types_1.Decision.Decline,
        slug: 'Nuisance',
    },
    {
        // unverified
        name: 'Illegal',
        trigger: app => util_1.bool(app.BusinessDetails_IllegalActivities),
        messageGenerator: app => `Organization conducts business for an illegal purpose`,
        publicMessageGenerator: app => `Entity is considered an ineligible entity because it conducts business for an illegal purpose`,
        severity: types_1.Decision.Decline,
        slug: 'Illegal',
    },
    {
        name: 'FTE Greater than 50',
        trigger: app => (helpers_1.getQuarterlyWageData(app).fteCount || 0) > 50,
        messageGenerator: app => `Too Many FTE Equivalents: ${helpers_1.getQuarterlyWageData(app).fteCount} but should be at most 50`,
        publicMessageGenerator: app => `Entity had over 50 full-time equivalent employees on their most recently filed NJ WR-30 filed with the NJ Department of Labor and Workforce Development, based on the calculation specified in the Guidelines`,
        severity: types_1.Decision.Decline,
        slug: 'HighFTE',
    },
    {
        name: 'On Unemployment Not Clear List',
        trigger: app => app.dol.uidNoGo,
        messageGenerator: app => `Applicant is on the DOL UI no-go list`,
        publicMessageGenerator: app => `Entity is not in good standing with the NJ Department of Labor and Workforce Development (Unemployment Insurance Division)`,
        severity: types_1.Decision.Decline,
        slug: 'DOLUI',
    },
    {
        // unverified
        name: 'On Wage/Hour Not Clear List',
        trigger: app => app.dol.whdNoGo,
        messageGenerator: app => `Applicant is on the DOL Wage/Hour no-go list`,
        publicMessageGenerator: app => `Entity is not in good standing with the NJ Department of Labor and Workforce Development (Wage and Hour Division)`,
        severity: types_1.Decision.Decline,
        slug: 'DOLWH',
    },
    // {
    //     // unverified
    //     name: 'Duplicate EIN',
    //     trigger: app => !!app.duplicates.byTin,
    //     messageGenerator: app =>
    //         `EIN was found in more than one application (${app.duplicates.byTin?.join(', ')})`,
    //     publicMessageGenerator: app => `Tax Identification Number (TIN) reported on application was found in a previous application`,
    //     severity: Decision.Decline,
    //     slug: 'DupEIN',
    // },
    {
        // unverified
        name: 'Duplicate EIN',
        trigger: app => app.DuplicateEIN.DuplicateEINRecords.length > 1,
        messageGenerator: app => `EIN was found in more than one application (${app.DuplicateEIN.DuplicateApplicationIDs})`,
        publicMessageGenerator: app => `Tax Identification Number (TIN) reported on application was found in a previous application`,
        severity: types_1.Decision.Decline,
        slug: 'DupEIN',
    },
    // New Decline  add on 20201103
    {
        name: 'Business is not operational or no plan to Reopen',
        trigger: app => (!!app.njeda_revisedbusinessoperatingplantoreopen && app.njeda_revisedbusinessoperatingplantoreopen == "No")
            || (!app.njeda_revisedbusinessoperatingplantoreopen && !!app.njeda_businessoperatingplantoreopen && app.njeda_businessoperatingplantoreopen == "No"),
        messageGenerator: app => `Business is not operational or no plan to Reopen`,
        publicMessageGenerator: app => `Business is not operational or no plan to Reopen`,
        severity: types_1.Decision.Decline,
        slug: 'Reopen',
    },
    {
        name: 'No Negative revenue Impact',
        trigger: app => (!!app.njeda_revisedbusinessnegativerevenue && app.njeda_revisedbusinessnegativerevenue == "No")
            || (!app.njeda_revisedbusinessnegativerevenue && !!app.njeda_businessnegativerevenueimpact && app.njeda_businessnegativerevenueimpact == "No"),
        messageGenerator: app => `No Negative revenue Impact`,
        publicMessageGenerator: app => `No Negative revenue Impact`,
        severity: types_1.Decision.Decline,
        slug: 'NegativeImpact',
    },
    {
        name: 'No Revenue Loss',
        trigger: app => (!!app.njeda_revisedtodayestimatedrevenueloss && app.njeda_revisedtodayestimatedrevenueloss.toString() === ".0000")
            || (!app.njeda_revisedtodayestimatedrevenueloss && !!app.njeda_todayestimatedrevenueloss && app.njeda_todayestimatedrevenueloss.toString() === ".0000"),
        messageGenerator: app => `No Revenue Loss`,
        publicMessageGenerator: app => `No Revenue Loss`,
        severity: types_1.Decision.Decline,
        slug: 'RevenueLoss',
    },
    {
        name: 'No Need after other assistance',
        trigger: app => (!!app.njeda_revisedcompanyhavefinancialneed && app.njeda_revisedcompanyhavefinancialneed == "No")
            || (!app.njeda_revisedcompanyhavefinancialneed && !!app.njeda_companyhavefinancialneed && app.njeda_companyhavefinancialneed == "No"),
        messageGenerator: app => `No Need after other assistance`,
        publicMessageGenerator: app => `No Need after other assistance`,
        severity: types_1.Decision.Decline,
        slug: 'NoNeed',
    },
    {
        name: 'Ineligible Use of Grants proceeds',
        trigger: app => (!!app.njeda_revisednoneoftheabovesecond && app.njeda_revisednoneoftheabovesecond == "Yes")
            || (!app.njeda_revisednoneoftheabovesecond && !!app.njeda_other && app.njeda_other == "Yes"),
        messageGenerator: app => `Ineligible Use of Grants proceeds`,
        publicMessageGenerator: app => `Ineligible Use of Grants proceeds`,
        severity: types_1.Decision.Decline,
        slug: 'IneligibleUse',
    },
    //Religious Affliation Decline,
    {
        name: 'Ineligible Religious Entity',
        trigger: app => app.ReligiousDecline == "Yes",
        messageGenerator: app => `Ineligible Religious Entity`,
        publicMessageGenerator: app => `Ineligible Religious Entity`,
        severity: types_1.Decision.Decline,
        slug: 'ReligiousDecline',
    },
    // New for Grant-4
    //Child Care
    {
        name: 'Child Care and NOT Licensed as per applicant and NOT in the DCF-DHS Licensed List',
        trigger: app => !app.childCare.isChildCareEmployer
            && ((app.njeda_phase3businessprogramsrevised !== undefined && app.njeda_phase3businessprogramsrevised == 506340003)
                || (app.njeda_phase3businessprogramsrevised === undefined && app.njeda_phase3businessprogram == 506340003))
            && ((app.njeda_revisedischildcarecenterproperlylicensed !== undefined && app.njeda_revisedischildcarecenterproperlylicensed == 'No')
                || (app.njeda_revisedischildcarecenterproperlylicensed === undefined && app.njeda_ischildcarecenterproperlylicensedorexempt == 'No')),
        messageGenerator: app => `Child Care and NOT Licensed as per applicant and NOT in the DCF-DHS Licensed List`,
        publicMessageGenerator: app => `Child Care and NOT Licensed as per applicant and NOT in the DCF-DHS Licensed List`,
        severity: types_1.Decision.Decline,
        slug: 'ChildCareDeclineNoNo',
    },
    ////////////////////// Reviews below ////////////////////////
    // New for Grant-4
    //Child Care
    {
        name: 'Child Care and Licensed as per applicant but NOT in the DCF-DHS Licensed List',
        trigger: app => !app.childCare.isChildCareEmployer
            && ((app.njeda_phase3businessprogramsrevised !== undefined && app.njeda_phase3businessprogramsrevised == 506340003)
                || (app.njeda_phase3businessprogramsrevised === undefined && app.njeda_phase3businessprogram == 506340003))
            && ((app.njeda_revisedischildcarecenterproperlylicensed !== undefined && app.njeda_revisedischildcarecenterproperlylicensed == 'Yes')
                || (app.njeda_revisedischildcarecenterproperlylicensed === undefined && app.njeda_ischildcarecenterproperlylicensedorexempt == 'Yes')),
        messageGenerator: app => `Child Care and Licensed as per applicant but NOT in DCF-DHS Licensed List`,
        severity: types_1.Decision.Review,
        slug: 'ChildCareReviewYesNo',
    },
    {
        name: 'Child Care and NOT Licensed as per applicant but in the DCF-DHS Licensed List',
        trigger: app => app.childCare.isChildCareEmployer
            && ((app.njeda_phase3businessprogramsrevised !== undefined && app.njeda_phase3businessprogramsrevised == 506340003)
                || (app.njeda_phase3businessprogramsrevised === undefined && app.njeda_phase3businessprogram == 506340003))
            && ((app.njeda_revisedischildcarecenterproperlylicensed !== undefined && app.njeda_revisedischildcarecenterproperlylicensed == 'No')
                || (app.njeda_revisedischildcarecenterproperlylicensed === undefined && app.njeda_ischildcarecenterproperlylicensedorexempt == 'No')),
        messageGenerator: app => `Child Care and NOT Licensed as per applicant but in the DCF-DHS Licensed List`,
        severity: types_1.Decision.Review,
        slug: 'ChildCareReviewNoYes',
    },
    {
        name: 'Child Care and Exempt Licensed as per applicant and NOT in the DCF-DHS Licensed List but Reason is None of the Above',
        trigger: app => !app.childCare.isChildCareEmployer
            && ((app.njeda_phase3businessprogramsrevised !== undefined && app.njeda_phase3businessprogramsrevised == 506340003)
                || (app.njeda_phase3businessprogramsrevised === undefined && app.njeda_phase3businessprogram == 506340003))
            && ((app.njeda_revisedischildcarecenterproperlylicensed !== undefined && app.njeda_revisedischildcarecenterproperlylicensed == 'Exempt')
                || (app.njeda_revisedischildcarecenterproperlylicensed === undefined && app.njeda_ischildcarecenterproperlylicensedorexempt == 'Exempt')) // Exempt
            && ((app.njeda_revisedchildcarecenterexemptreason !== undefined && app.njeda_revisedchildcarecenterexemptreason == 'None of the Above.')
                || (app.njeda_revisedchildcarecenterexemptreason === undefined && app.njeda_childcarecenterexemptreason == 'None of the Above.')),
        messageGenerator: app => `Child Care and Exempt Licensed as per applicant and NOT in the DCF-DHS Licensed List but Reason is None of the Above`,
        severity: types_1.Decision.Review,
        slug: 'ChildCareReviewExemptNoReason',
    },
    // EDA Hold List
    {
        name: 'Applicant is in EDA Hold List',
        trigger: app => app.EDAHoldList.isEDAHoldListEmployer,
        messageGenerator: app => `Applicant is in EDA Hold List`,
        severity: types_1.Decision.Review,
        slug: 'EDAHoldList',
    },
    //DOL WHD NO EIN NO GO 
    {
        name: 'On DOL WHD NO EIN NO GO list',
        trigger: app => app.DOLNOEIN.possibleMatches.length > 0,
        messageGenerator: app => `Applicant may be on the DOL WHD NO GO List based on 85% tolerance.`,
        severity: types_1.Decision.Review,
        slug: 'DOL_NoEIN_NOGO',
    },
    {
        name: 'Applicant stated their Business is not properly registered with the state',
        trigger: app => (!!app.njeda_certifybusinessproperlyregisteredwithnj && app.njeda_certifybusinessproperlyregisteredwithnj == "No"),
        messageGenerator: app => `Applicant stated their Business is not properly registered with the state`,
        severity: types_1.Decision.Review,
        slug: 'NotRegisteredTaxation',
    },
    {
        name: 'Applicant not found at Taxation',
        trigger: app => app.taxation['Clean Ind'] == 'X',
        messageGenerator: app => `Applicant not found at Taxation`,
        severity: types_1.Decision.Review,
        slug: 'NotFoundTaxation',
    },
    // {  
    //     name: 'Applicant Registered Business Name unknown at Taxation',
    //     trigger: app => app.taxation['Clean Ind'] !== 'X' && app.taxation["TAXREG Name"].trim() == '',
    //     messageGenerator: app =>
    //         `Applicant Registered Business Name unknown at Taxation`,
    //     severity: Decision.Review,
    //     slug: 'NoNameTaxation',
    // },
    //Organization Name Compare with Taxation REG name with 35% tolerance --> not matches, push to Manual Review
    {
        name: 'Registered Business Name does not match with Applicant provided name.',
        trigger: app => !!app.taxation["TAXREG Name"] && app.taxation['Clean Ind'] !== 'X' && app.taxation["TAXREG Name"].trim() !== '' &&
            Math.round(stringSimilarity.compareTwoStrings(app.ContactInformation_BusinessName.trim().toUpperCase(), app.taxation["TAXREG Name"].trim().toUpperCase()) * 100) / 100 < 0.35,
        messageGenerator: app => `Registered Business Name "${app.taxation["TAXREG Name"].trim()}" does not match with Applicant provided name. And Match percentage is "${Math.round(stringSimilarity.compareTwoStrings(app.ContactInformation_BusinessName.trim().toUpperCase(), app.taxation["TAXREG Name"].trim().toUpperCase()) * 100) / 100}%" `,
        severity: types_1.Decision.Review,
        slug: 'NamedoesntMatchTaxation',
    },
    // New on Grant-3
    //Unmet Need < 500
    {
        name: 'Unmet Need < 500',
        trigger: app => award_size_1.unmetNeed(app) < 500,
        messageGenerator: app => `No Unmet Need`,
        severity: types_1.Decision.Review,
        slug: 'NoUnmetNeed',
    },
    //ABC
    {
        name: 'On ABC exclusion list',
        trigger: app => app.ABC.possibleMatches.length > 0,
        messageGenerator: app => `Applicant may be on the ABC violations list: ${app.ABC.possibleMatches
            .map(match => `Licensee ${match.Licensee}`)
            .join(', ')}`,
        severity: types_1.Decision.Review,
        slug: 'ABC',
    },
    //Revised Unmet Need < Original Unmet Need & Revised unmet Need < Award Size caluclated
    {
        name: 'Revised Unmet Need is less than Original and Impacts Award',
        trigger: app => (!!app.njeda_additionalbusinessfundingneeded && !!app.njeda_revisedbusinessfundingneeded && app.njeda_revisedbusinessfundingneeded < app.njeda_additionalbusinessfundingneeded && app.njeda_revisedbusinessfundingneeded < award_size_1.AwardBasis(app)),
        messageGenerator: app => `Revised Unmet Need is less than Original and Impacts Award`,
        severity: types_1.Decision.Review,
        slug: 'RevisedUnMetisLess',
    },
    //No WR30 Highest FTE Jobs count Data and FEIN not on DOL registered list and Business Type in Restaurant, Small & Child Care
    {
        name: 'No WR30 Data and not registered with DOL which impacts award size',
        trigger: app => ((helpers_1.getQuarterlyWageHighestFTE(app).fteCount == 0 || (helpers_1.getQuarterlyWageHighestFTE(app).fteCount == null)) && !app.dol.isActiveEmployer
            && ((app.njeda_phase3businessprogramsrevised !== undefined && app.njeda_phase3businessprogramsrevised != 506340001) || (app.njeda_phase3businessprogramsrevised === undefined && app.njeda_phase3businessprogram != 506340001)
                && (!!app.njeda_highestqtrfulltimew2employees && !isNaN(Number(app.njeda_highestqtrfulltimew2employees)) && Number(app.njeda_highestqtrfulltimew2employees) > 5))),
        messageGenerator: app => `No WR30 Data and not registered with DOL which impacts award size`,
        severity: types_1.Decision.Review,
        slug: 'WR30',
    },
    //Religious Affliation Review,
    {
        name: 'Religious Affiliation Questionnaire Review Needed',
        trigger: app => (app.ReligiousReview == "Yes"
            || (app.Business_Religious == "Yes" && app.ReligiousReview == "No" && app.ReligiousDecline == "No")),
        messageGenerator: app => `Religious Affiliation Questionnaire Review Needed`,
        severity: types_1.Decision.Review,
        slug: 'Religious',
    },
    {
        name: 'Lobbying and Political Activities',
        trigger: app => app.Business_LobbyingPolitical === 'Yes',
        messageGenerator: app => `Business engages in lobbying and/or political activities`,
        severity: types_1.Decision.Review,
        slug: 'Political',
    },
    {
        name: 'On SAM exclusion list',
        trigger: app => app.sams.possibleMatches.length > 0,
        messageGenerator: app => `Applicant may be on the federal SAMS exclusion list: ${app.sams.possibleMatches
            .map(match => `DUNS ${match.DUNS}`)
            .join(', ')}`,
        severity: types_1.Decision.Review,
        slug: 'SAMS',
    },
    // {
    //     name: 'Duplicate Address',
    //     trigger: app => !!app.duplicates.byAddress,
    //     messageGenerator: app =>
    //         `Business address was found in more than one application (${app.duplicates.byAddress?.join(', ')})`,
    //     severity: Decision.Review,
    //     slug: 'DupAddress',
    // },
    {
        name: 'Duplicate Address',
        trigger: app => app.DuplicateAddress.DuplicateAddressRecords.length > 1,
        messageGenerator: app => `Business address was found in more than one application (${app.DuplicateAddress.DuplicateApplicationIDs})`,
        severity: types_1.Decision.Review,
        slug: 'DupAddress',
    },
    ///////////////////////// DOB ////////////////////////
    //DOB No EIN Review 
    {
        name: 'On DOB No EIN list',
        trigger: app => app.DOBValidateNOEIN.possibleMatches.length > 0,
        messageGenerator: app => `Applicant may be on the DOB No EIN List based on 85% tolerance.`,
        severity: types_1.Decision.Review,
        slug: 'DOB_Validate_NoEIN_NOGO',
    },
    //DOB Sister Agencies Check
    {
        name: 'On DOB Sister Agencies List (DHS or DCA or Arts) and Amount doesnt match',
        trigger: app => app.DOBValidation.DOBRecords.length > 0
            && (app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.DCA)
                || app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.DHS)
                || app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.Arts))
            && ((app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.DCA) > 0 ? Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.DCA) + types_1.DOBPrograms.DCA.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.DCA + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.DCA) - types_1.DOBPrograms.DCA.length)))
                !== Math.round(app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess ? app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess : 0)
                : false)
                ||
                    (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.DHS) > 0 ? Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.DHS) + types_1.DOBPrograms.DHS.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.DHS + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.DHS) - types_1.DOBPrograms.DHS.length)))
                        !== Math.round(app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess ? app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess : 0)
                        : false)
                ||
                    (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.Arts) > 0 ? Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.Arts) + types_1.DOBPrograms.Arts.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.Arts + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.Arts) - types_1.DOBPrograms.Arts.length)))
                        !== Math.round(app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess ? app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess : 0)
                        : false)),
        messageGenerator: app => `On DOB Sister Agencies List (DHS or DCA or Arts) and Amount doesnt match.`,
        severity: types_1.Decision.Review,
        slug: 'DOB_sisteragency_Other',
    },
    {
        name: 'Other program indicated but amount is 0 (SBA PPP)',
        trigger: app => app.DOBAffidavit_SBAPPP == "Yes" && (app.DOBAffidavit_SBAPPPDetails_Status == "Approved" || app.DOBAffidavit_SBAPPPDetails_Status == "In Process")
            && (!app.DOBAffidavit_SBAPPPDetails_Amount || app.DOBAffidavit_SBAPPPDetails_Amount == 0),
        messageGenerator: app => `Applicant reported SBA PPP funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Applicant either not listed on Application or less amount mentioned, but in DOB List (SBA PPP)',
        trigger: app => app.DOBValidation.DOBRecords.length > 0
            && app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.PPP)
            && ((app.DOBAffidavit_SBAPPP !== "Yes" && app.njeda_sbapaycheckprotectionprogramphase2 !== "Yes")
                || (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.PPP) > 0 ? (Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.PPP) + types_1.DOBPrograms.PPP.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.PPP + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.PPP) - types_1.DOBPrograms.PPP.length)))
                    > Math.round(app.DOBAffidavit_SBAPPPDetails_Amount ? app.njeda_sbapppphase2approvedamt ?
                        (Math.round(app.DOBAffidavit_SBAPPPDetails_Amount) + Math.round(app.njeda_sbapppphase2approvedamt))
                        : app.DOBAffidavit_SBAPPPDetails_Amount :
                        app.njeda_sbapppphase2approvedamt ? app.njeda_sbapppphase2approvedamt : 0)) : false)),
        messageGenerator: app => `Applicant either not listed on Application or less amount mentioned, but in DOB List (SBA PPP).`,
        severity: types_1.Decision.Review,
        slug: 'DOB_sisteragency_SBAPPP',
    },
    {
        name: 'Other program indicated but amount is 0 (SBA PPP2)',
        trigger: app => app.njeda_sbapaycheckprotectionprogramphase2 == "Yes" && (app.njeda_sbapppphase2status == "Approved" || app.njeda_sbapppphase2status == "In Process")
            && (!app.njeda_sbapppphase2approvedamt || app.njeda_sbapppphase2approvedamt == 0),
        messageGenerator: app => `Applicant reported SBA PPP2 funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Other program indicated but amount is 0 (EIDG)',
        trigger: app => app.DOBAffidavit_SBAEIDG == "Yes" && (app.DOBAffidavit_SBAEIDGDetails_Status == "Approved" || app.DOBAffidavit_SBAEIDGDetails_Status == "In Process")
            && (!app.DOBAffidavit_SBAEIDGDetails_Amount || app.DOBAffidavit_SBAEIDGDetails_Amount == 0),
        messageGenerator: app => `Applicant reported EIDG funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Other program indicated but amount is 0 (EIDL)',
        trigger: app => app.DOBAffidavit_SBAEIDL == "Yes" && (app.DOBAffidavit_SBAEIDLDetails_Status == "Approved" || app.DOBAffidavit_SBAEIDLDetails_Status == "In Process")
            && (!app.DOBAffidavit_SBAEIDLDetails_Amount || app.DOBAffidavit_SBAEIDLDetails_Amount == 0),
        messageGenerator: app => `Applicant reported EIDL funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Other program indicated but amount is 0 (Loan Assistance)',
        trigger: app => app.DOBAffidavit_NJEDALoan == "Yes" && (app.DOBAffidavit_NJEDALoanDetails_Status == "Approved" || app.DOBAffidavit_NJEDALoanDetails_Status == "In Process")
            && (!app.DOBAffidavit_NJEDALoanDetails_Amount || app.DOBAffidavit_NJEDALoanDetails_Amount == 0),
        messageGenerator: app => `Applicant reported Loan Assistance funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Other program indicated but amount is 0 (Grant Assistance Phase 1)',
        trigger: app => app.DOBAffidavit_NJEDAGrant == "Yes" && (app.DOBAffidavit_NJEDAGrantDetails_Status == "Approved" || app.DOBAffidavit_NJEDAGrantDetails_Status == "In Process")
            && (!app.DOBAffidavit_NJEDAGrantDetails_Amount || app.DOBAffidavit_NJEDAGrantDetails_Amount == 0),
        messageGenerator: app => `Applicant reported Grant Assistance Phase 1 funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Applicant either not listed on Application or less amount mentioned, but in DOB List (Grant Phase 1)',
        trigger: app => app.DOBValidation.DOBRecords.length > 0
            && app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.NJEDAPhase1)
            && (app.DOBAffidavit_NJEDAGrant !== "Yes"
                || (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPhase1) > 0 ? (Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPhase1) + types_1.DOBPrograms.NJEDAPhase1.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.NJEDAPhase1 + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPhase1) - types_1.DOBPrograms.NJEDAPhase1.length)))
                    > Math.round(app.DOBAffidavit_NJEDAGrantDetails_Amount ? app.DOBAffidavit_NJEDAGrantDetails_Amount : 0)) : false)),
        messageGenerator: app => `Applicant either not listed on Application or less amount mentioned, but in DOB List (Grant Phase 1).`,
        severity: types_1.Decision.Review,
        slug: 'DOB_sisteragency_NJEDAPhase1',
    },
    {
        name: 'Other program indicated but amount is 0 (Grant Assistance Phase 2)',
        trigger: app => app.njeda_njedasbemergencygrantassistancephase2 == "Yes" && (app.njeda_njedasbemergencygrantassistancephase2stat == "Approved" || app.njeda_njedasbemergencygrantassistancephase2stat == "In Process")
            && (!app.njeda_sbemergencygrantphase2amountapproved || app.njeda_sbemergencygrantphase2amountapproved == 0),
        messageGenerator: app => `Applicant reported Grant Assistance Phase 2 funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Applicant either not listed on Application or less amount mentioned, but in DOB List (Grant Phase 2)',
        trigger: app => app.DOBValidation.DOBRecords.length > 0
            && app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.NJEDAPhase2)
            && (app.njeda_njedasbemergencygrantassistancephase2 !== "Yes"
                || (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPhase2) > 0 ? (Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPhase2) + types_1.DOBPrograms.NJEDAPhase2.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.NJEDAPhase2 + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPhase2) - types_1.DOBPrograms.NJEDAPhase2.length)))
                    > Math.round(app.njeda_sbemergencygrantphase2amountapproved ? app.njeda_sbemergencygrantphase2amountapproved : 0)) : false)),
        messageGenerator: app => `Applicant either not listed on Application or less amount mentioned, but in DOB List (Grant Phase 2).`,
        severity: types_1.Decision.Review,
        slug: 'DOB_sisteragency_NJEDAPhase2',
    },
    {
        name: 'Other program indicated but amount is 0 (Grant Assistance Phase 3)',
        trigger: app => app.njeda_njedasbegrantassistancephase3 == "Yes" && (app.njeda_njedasbegrantassistphase3status == "Approved" || app.njeda_njedasbegrantassistphase3status == "In Process")
            && (!app.njeda_njedasbegrantassistphase3approvedamt || app.njeda_njedasbegrantassistphase3approvedamt == 0),
        messageGenerator: app => `Applicant reported Grant Assistance Phase 3 funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Applicant either not listed on Application or less amount mentioned, but in DOB List (Grant Phase 3)',
        trigger: app => app.DOBValidation.DOBRecords.length > 0
            && app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.NJEDAPhase3)
            && (app.njeda_njedasbegrantassistancephase3 !== "Yes"
                || (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPhase3) > 0 ? (Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPhase3) + types_1.DOBPrograms.NJEDAPhase3.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.NJEDAPhase3 + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPhase3) - types_1.DOBPrograms.NJEDAPhase3.length)))
                    > Math.round(app.njeda_njedasbegrantassistphase3approvedamt ? app.njeda_njedasbegrantassistphase3approvedamt : 0)) : false)),
        messageGenerator: app => `Applicant either not listed on Application or less amount mentioned, but in DOB List (Grant Phase 3).`,
        severity: types_1.Decision.Review,
        slug: 'DOB_sisteragency_NJEDAPhase3',
    },
    {
        name: 'Other program indicated but amount is 0 (CARES Act Funding From Local County)',
        trigger: app => app.njeda_caresactfundingfromlocalcounty == "Yes" && (app.njeda_caresactfundingfromlocalcountystatus == "Approved" || app.njeda_caresactfundingfromlocalcountystatus == "In Process")
            && (!app.njeda_cafundingfromlocalcountyamtapproved || app.njeda_cafundingfromlocalcountyamtapproved == 0),
        messageGenerator: app => `Applicant reported CARES Act Funding From Local County funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Other program indicated but amount is 0 (Housing and Mortgage Finance Covid-19 Landlord Grant)',
        trigger: app => app.njeda_njhandmortgagefinancecovid19landlordgrant == "Yes" && (app.njeda_njhandmortgagefincovidlandlordgrantstatus == "Approved" || app.njeda_njhandmortgagefincovidlandlordgrantstatus == "In Process")
            && (!app.njeda_njhmorfincovidlandlordgrantamtapproved || app.njeda_njhmorfincovidlandlordgrantamtapproved == 0),
        messageGenerator: app => `Applicant reported Housing and Mortgage Finance Covid-19 Landlord Grant funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Applicant either not listed on Application or less amount mentioned, but in DOB List (HMFA Grant)',
        trigger: app => app.DOBValidation.DOBRecords.length > 0
            && app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.HMFAGrant)
            && (app.njeda_njhandmortgagefinancecovid19landlordgrant !== "Yes"
                || (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.HMFAGrant) > 0 ? (Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.HMFAGrant) + types_1.DOBPrograms.HMFAGrant.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.HMFAGrant + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.HMFAGrant) - types_1.DOBPrograms.HMFAGrant.length)))
                    > Math.round(app.njeda_njhmorfincovidlandlordgrantamtapproved ? app.njeda_njhmorfincovidlandlordgrantamtapproved : 0)) : false)),
        messageGenerator: app => `Applicant either not listed on Application or less amount mentioned, but in DOB List (HMFA Grant).`,
        severity: types_1.Decision.Review,
        slug: 'DOB_sisteragency_HMFAGrant',
    },
    {
        name: 'Other program indicated but amount is 0 (Redevelopment Authority Small Business Lease Emergency)',
        trigger: app => app.njeda_njredevauthsbleaseemergassistgrantprogram == "Yes" && (app.njeda_njredevauthsbleaseemergastgrantprogstatus == "Approved" || app.njeda_njredevauthsbleaseemergastgrantprogstatus == "In Process")
            && (!app.njeda_redevauthsblemerastgrantprogamtapproved || app.njeda_redevauthsblemerastgrantprogamtapproved == 0),
        messageGenerator: app => `Applicant reported Redevelopment Authority Small Business Lease Emergency funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Applicant either not listed on Application or less amount mentioned, but in DOB List (NJRA Phase 1 or Phase 2)',
        trigger: app => app.DOBValidation.DOBRecords.length > 0
            && (app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.NJRAPhase1) || app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.NJRAPhase2))
            && ((app.njeda_njredevauthsbleaseemergassistgrantprogram !== "Yes" && app.njeda_njrasbleaseeagprogphase2 !== "Yes")
                || (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJRAPhase1) > 0 ? (Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJRAPhase1) + types_1.DOBPrograms.NJRAPhase1.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.NJRAPhase1 + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJRAPhase1) - types_1.DOBPrograms.NJRAPhase1.length)))
                    > Math.round(app.njeda_redevauthsblemerastgrantprogamtapproved ? app.njeda_redevauthsblemerastgrantprogamtapproved :
                        app.njeda_njrasbleaseeagprogphase2approvedamt ? app.njeda_njrasbleaseeagprogphase2approvedamt : 0)) : false)
                || (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJRAPhase2) > 0 ? (Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJRAPhase2) + types_1.DOBPrograms.NJRAPhase2.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.NJRAPhase2 + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJRAPhase2) - types_1.DOBPrograms.NJRAPhase2.length)))
                    > Math.round(app.njeda_njrasbleaseeagprogphase2approvedamt ? app.njeda_njrasbleaseeagprogphase2approvedamt :
                        app.njeda_redevauthsblemerastgrantprogamtapproved ? app.njeda_redevauthsblemerastgrantprogamtapproved : 0)) : false)),
        messageGenerator: app => `Applicant either not listed on Application or less amount mentioned, but in DOB List (NJRA Phase 1 or Phase 2).`,
        severity: types_1.Decision.Review,
        slug: 'DOB_sisteragency_NJRAPhase1OrPhase2',
    },
    {
        name: 'Other program indicated but amount is 0 (Redevelopment Phase 2 Authority Small Business Lease Emergency)',
        trigger: app => app.njeda_njrasbleaseeagprogphase2 == "Yes" && (app.njeda_sbleaseemergassistgrantprogphase2status == "Approved" || app.njeda_sbleaseemergassistgrantprogphase2status == "In Process")
            && (!app.njeda_njrasbleaseeagprogphase2approvedamt || app.njeda_njrasbleaseeagprogphase2approvedamt == 0),
        messageGenerator: app => `Applicant reported Redevelopment Phase 2 Authority Small Business Lease Emergency funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Other program indicated but amount is 0 (Insurance Proceeds)',
        trigger: app => app.njeda_insuranceproceeds == "Yes" && (app.njeda_insuranceproceedsstatus == "Approved" || app.njeda_insuranceproceedsstatus == "In Process")
            && (!app.njeda_insuranceproceedsamountapproved || app.njeda_insuranceproceedsamountapproved == 0),
        messageGenerator: app => `Applicant reported Insurance Proceeds funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Other program indicated but amount is 0 (other)',
        trigger: app => app.DOBAffidavit_OtherStateLocal == "Yes" && (app.njeda_otherprogramstatus == "Approved" || app.njeda_otherprogramstatus == "In Process")
            && (!app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess || app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess == 0),
        messageGenerator: app => `Applicant reported other disaster funding approved or in progress ("${app.DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions}") but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Other program indicated but amount is 0 (PPE)',
        trigger: app => app.njeda_njpersonalppeaccessprogram == "Yes" && (app.njeda_njpersonalppeaprogramstatus == "Approved" || app.njeda_njpersonalppeaprogramstatus == "In Process")
            && (!app.njeda_njpersonalppeaprogramapprovedamt || app.njeda_njpersonalppeaprogramapprovedamt == 0),
        messageGenerator: app => `Applicant reported PPE funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Applicant not listed on Application, but in DOB List (NJEDA PPE1 or PPE2)',
        trigger: app => app.DOBValidation.DOBRecords.length > 0
            && app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.NJEDAPPE)
            && ((app.njeda_njpersonalppeaccessprogram !== "Yes" && app.njeda_njedasmbppeaccessprogphase2 !== "Yes")
                || (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPPE) > 0 ? (Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPPE) + types_1.DOBPrograms.NJEDAPPE.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.NJEDAPPE + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDAPPE) - types_1.DOBPrograms.NJEDAPPE.length)))
                    > Math.round(app.njeda_njpersonalppeaprogramapprovedamt ? app.njeda_njpersonalppeaprogramapprovedamt :
                        app.njeda_njedasmbppeaccessprogphase2amount ? app.njeda_njedasmbppeaccessprogphase2amount : 0)) : false)),
        messageGenerator: app => `Applicant not listed on Application, but in DOB List (NJEDA PPE1 or PPE2).`,
        severity: types_1.Decision.Review,
        slug: 'DOB_sisteragency_NJEDAPPE1OrPPE2',
    },
    {
        name: 'Other program indicated but amount is 0 (PPE 2)',
        trigger: app => app.njeda_njedasmbppeaccessprogphase2 == "Yes" && (app.njeda_njedasmbppeaccessprogphase2status == "Approved" || app.njeda_njedasmbppeaccessprogphase2status == "In Process")
            && (!app.njeda_njedasmbppeaccessprogphase2amount || app.njeda_njedasmbppeaccessprogphase2amount == 0),
        messageGenerator: app => `Applicant reported PPE Phase 2 funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Other program indicated but amount is 0 (SSNJ)',
        trigger: app => app.njeda_njedasustainandserve == "Yes" && (app.njeda_njedasustainandservestatus == "Approved" || app.njeda_njedasustainandservestatus == "In Process")
            && (!app.njeda_njedasustainandserveapprovedamt || app.njeda_njedasustainandserveapprovedamt == 0),
        messageGenerator: app => `Applicant reported Sustain and Serve funding approved or in progress but did not indicate the amount`,
        severity: types_1.Decision.Review,
        slug: 'MissingDOBAmount',
    },
    {
        name: 'Applicant either not listed on Application or less amount mentioned, but in DOB List (NJEDA SSNJ)',
        trigger: app => app.DOBValidation.DOBRecords.length > 0
            && app.DOBValidation.DOBFindings.includes(types_1.DOBPrograms.NJEDASSNJ)
            && (app.njeda_njedasustainandserve !== "Yes"
                || (app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDASSNJ) > 0 ? (Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDASSNJ) + types_1.DOBPrograms.NJEDASSNJ.length, app.DOBValidation.DOBAmounts.indexOf(types_1.DOBPrograms.NJEDASSNJ + ",") - app.DOBValidation.DOBAmounts.search(types_1.DOBPrograms.NJEDASSNJ) - types_1.DOBPrograms.NJEDASSNJ.length)))
                    > Math.round(app.njeda_njedasustainandserveapprovedamt ? app.njeda_njedasustainandserveapprovedamt : 0)) : false)),
        messageGenerator: app => `Applicant either not listed on Application or less amount mentioned, but in DOB List (NJEDA SSNJ).`,
        severity: types_1.Decision.Review,
        slug: 'DOB_sisteragency_NJEDASSNJ',
    },
    ////////////////////// Legal Reviews ////////////////////////
    {
        name: 'Background Question #1 (convictions)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion1),
        messageGenerator: app => `Additional information provided on background question #1 (convictions)`,
        severity: types_1.Decision.LegalReview,
        slug: null,
    },
    {
        name: 'Background Question #2 (denied licensure)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion2),
        messageGenerator: app => `Additional information provided on background question #2 (denied licensure)`,
        severity: types_1.Decision.LegalReview,
        slug: null,
    },
    {
        name: 'Background Question #3 (public contractor subcontract ineligibility)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion3),
        messageGenerator: app => `Additional information provided on background question #3 (public contractor subcontract ineligibility)`,
        severity: types_1.Decision.LegalReview,
        slug: null,
    },
    {
        name: 'Background Question #4 (violated the terms of a public agreement)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion4),
        messageGenerator: app => `Additional information provided on background question #4 (violated the terms of a public agreement)`,
        severity: types_1.Decision.LegalReview,
        slug: null,
    },
    {
        name: 'Background Question #5 (injunction, order or lien)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion5),
        messageGenerator: app => `Additional information provided on background question #5 (injunction, order or lien)`,
        severity: types_1.Decision.LegalReview,
        slug: null,
    },
    {
        name: 'Background Question #6 (presently indicted)',
        trigger: app => util_1.bool(app.AdditionalBackgroundInformation_BackgroundQuestion6),
        messageGenerator: app => `Additional information provided on background question #6 (presently indicted)`,
        severity: types_1.Decision.LegalReview,
        slug: null,
    },
];
function getFindings(app) {
    const findings = FINDING_DEFINITIONS.filter(def => def.trigger(app)).map(def => ({
        message: def.messageGenerator(app),
        publicMessage: 'publicMessageGenerator' in def ? def.publicMessageGenerator(app) : undefined,
        slug: 'slug' in def ? (def.slug || undefined) : undefined,
        severity: def.severity,
        name: def.name,
    }));
    return findings;
}
exports.getFindings = getFindings;
//# sourceMappingURL=findings.js.map