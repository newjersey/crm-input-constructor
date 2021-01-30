"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOlaDatas = void 0;
const chalk = require('chalk');
const types_1 = require("./types");
const helpers_1 = require("./helpers");
const util_1 = require("../util");
const applications_1 = require("../inputs/applications");
const grant_phase_1_1 = require("../inputs/grant-phase-1");
const award_size_1 = require("./award-size");
function generateOlaDatas(app, test) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        const olaDatas = {
            Account: {
                Name: app.ContactInformation_BusinessName,
                DoingBusinessAs: app.ContactInformation_DoingBusinessAsDBA,
                Email: app.ContactInformation_Email,
                Telephone: app.ContactInformation_Phone,
                WebSiteURL: app.ContactInformation_Website,
                YearEstablished: app.Business_YearEstablished,
                AnnualRevenue: null,
                TaxClearanceComments: helpers_1.getTaxClearanceComments(app),
                ACHNonCompliance: '',
                address2Line1: '',
                address2Line2: '',
                address2City: '',
                address2Zip: '',
                address2State: '',
                address2County: '',
                address2Country: '',
                WomanOwned: helpers_1.flag(helpers_1.getDesignation(app, applications_1.Designations.Woman_Owned)),
                VeteranOwned: helpers_1.flag(helpers_1.getDesignation(app, applications_1.Designations.Veteran_Owned)),
                MinorityOwned: helpers_1.flag(helpers_1.getDesignation(app, applications_1.Designations.Minority_Owned)),
                DisabilityOwned: helpers_1.flag(helpers_1.getDesignation(app, applications_1.Designations.Disabled_Owned)),
                Comment: helpers_1.getDesignation(app, applications_1.Designations.Small_Business)
                    ? types_1.SmallBusinessStatuses.Yes
                    : types_1.SmallBusinessStatuses.No,
                SSN: '',
            },
            Project: {
                StatusCode: 1,
                ProjectDescription: '',
            },
            Product: {
                DevelopmentOfficer: '',
                ServicingOfficerId: helpers_1.getServicingOfficer(app, test),
                AppReceivedDate: util_1.formatExcelDate(app.Entry_DateSubmitted),
                Amount: helpers_1.value(award_size_1.awardSize(app)),
                nol_total_NOL_benefit: null,
                nol_total_RD_benefit: null,
                benefit_allocation_factor: null,
                nol_prior_years_tax_credits_sold: null,
                ProductStatusId: helpers_1.getProductStatusId(app),
                ProductSubStatusId: helpers_1.getProductSubStatusId(app),
                ProductTypeId: '{BC60E150-ECA0-EA11-A811-001DD8018831}',
                LocatedInCommercialLocation: '',
                ProductDescription: '',
                lender: '',
                lenderAmount: helpers_1.value(),
                lender_address_1: '',
                lender_address_2: '',
                lender_city: '',
                lender_zipcode: '',
                lender_email: '',
                lender_phone: '',
            },
            Underwriting: {
                salutation: '',
                firstName: app.ContactInformation_ContactName_First,
                middleName: '',
                lastName: app.ContactInformation_ContactName_Last,
                suffix: '',
                jobTitle: '',
                address1: app.ContactInformation_PrimaryBusinessAddress_Line1,
                address2: app.ContactInformation_PrimaryBusinessAddress_Line2,
                city: app.geography.City,
                zipcode: app.geography.Zip,
                telephone: app.ContactInformation_Phone.split(' x')[0].replace(/\D/g, ''),
                telephoneExt: app.ContactInformation_Phone.split(' x')[1] || '',
                email: app.ContactInformation_Email,
                organizationName: app.ContactInformation_BusinessName,
                knownAs: app.ContactInformation_DoingBusinessAsDBA,
                ein: app.Business_TIN,
                naicsCode: app.NAICSCode,
                ownershipStructure: helpers_1.getOwnershipStructure(app),
                applicantBackground: helpers_1.getApplicantBackground(app),
                headquarterState: '',
                headquarterCountry: '',
                landAcquisitions: null,
                newBldgConstruction: null,
                acquisitionExistingBuilding: null,
                existingBldgRvnt: null,
                upgradeEquipment: helpers_1.value(),
                newEquipment: helpers_1.value(),
                usedEquipment: helpers_1.value(),
                engineerArchitechFees: helpers_1.value(),
                legalFees: null,
                accountingFees: null,
                financeFees: null,
                roadUtilitiesConst: helpers_1.value(),
                debtServiceReserve: null,
                constructionInterest: helpers_1.value(),
                refinancing: helpers_1.value(),
                workingCapital: helpers_1.value(),
                otherCost1: null,
                otherCost2: null,
                otherCost3: null,
                otherCost1Description: null,
                otherCost2Description: null,
                otherCost3Description: null,
                counselFirmName: '',
                counselFirstName: '',
                counselLastName: '',
                counselStreetAddress1: '',
                counselStreetAddress2: '',
                counselCity: '',
                counselState: '',
                counselZipCode: '',
                counselPhoneNumber: '',
                counselEmailAddress: '',
                accountantFirmName: '',
                accountantFirstName: '',
                accountantLastName: '',
                accountantStreetAddress1: '',
                accountantStreetAddress2: '',
                accountantCity: '',
                accountantState: '',
                accountantZipCode: '',
                accountantPhoneNumber: '',
                accountantEmailAddress: '',
                totalCost: helpers_1.value(),
                applicationID: app.ApplicationId,
                selectedProducts: 'Covid Small Business Emergency Assistance Grant Phase 2',
                ReceivedPreiousFundingFromEDA: '',
                ReceivedPreiousFundingFromOtherthanEDA: '',
                TotalFullTimeEligibleJobs: helpers_1.getQuarterlyWageData(app).fteCount,
                NJFullTimeJobsAtapplication: app.Business_W2EmployeesFullTime,
                PartTimeJobsAtapplication: app.Business_W2EmployeesPartTime,
                softCosts: helpers_1.value(),
                relocationCosts: helpers_1.value(),
                securityCosts: helpers_1.value(),
                titleCosts: helpers_1.value(),
                surveyCosts: helpers_1.value(),
                marketAnalysisCosts: helpers_1.value(),
                developmentImpactCosts: helpers_1.value(),
                marketSiteCosts: helpers_1.value(),
                demolitionCosts: null,
                streetscapeCosts: null,
                remediationCosts: helpers_1.value(),
                redemptionPremiumCosts: null,
                installationMachineryCosts: null,
                totalProjectCost: null,
                financeAmtApplied: helpers_1.value(),
            },
            Location: {
                isRelocation: null,
                isExpansion: null,
                isStartup: null,
                address1Line1: app.ContactInformation_PrimaryBusinessAddress_Line1,
                address1Line2: app.ContactInformation_PrimaryBusinessAddress_Line2,
                address1City: app.geography.City,
                address1Zip: app.geography.Zip,
                address1State: 'NJ',
                address1County: app.geography.County,
                address1Municipality: app.geography.Municipality,
                address1Country: '',
                block: '',
                lot: '',
                congressionalDistrict: app.geography.CongressionalDistrict,
                legislativeDistrict: app.geography.LegislativeDistrict,
                censusTract: ((_a = app.policyMap) === null || _a === void 0 ? void 0 : _a.censusTract) || null,
                Comments: `Home-Based Business: ${util_1.bool(app.BusinessDetails_HomeBasedBusiness) ? 'Yes' : 'No'}`,
                EligibleOpportunityZone: helpers_1.getEligibleOpportunityZoneValue(app),
            },
            FeeRequest: {
                receivedDate: null,
                receivedAmt: null,
                confirmationNum: '',
                productFeeAmount: null,
            },
            Monitoring: {
                Status: helpers_1.getMonitoringStatus(app),
                MonitoringType: helpers_1.getMonitoringType(app),
                Findings: helpers_1.getFindingsString(app),
                CompletionDate: helpers_1.getDecision(app) === types_1.Decision.Review ? null : util_1.formatDate(new Date()),
                GeneralComments: `Other Workers (1099, seasonal, PEO): ${app.Business_Contractors}`,
            },
            Covid19Impacts: {
                ApplicationLanguage: app.Language,
                Grant1applicationID: ((_b = app.grantPhase1) === null || _b === void 0 ? void 0 : _b['OLA']) || null,
                ApplicationSequenceID: app.Sequence,
                OntheSAMSExclusionList: helpers_1.yesNo(app.sams.possibleMatches.length > 0),
                DeemedAsEssentialBusiness: helpers_1.yesNo(util_1.bool(app.COVID19Impact_EssentialBusiness)),
                RemainOpenMar2020: helpers_1.yesNo(util_1.bool(app.COVID19Impact_OpenOrReopened)),
                CapacityOpen: helpers_1.getCapacityOpen(app),
                ActualRevenue2019: helpers_1.value(helpers_1.cappedMarchAprilMay2019Revenue(app)),
                ActualRevenue2020: helpers_1.value(helpers_1.adjustedMarchAprilMay2020Revenue(app)),
                UseofFunds: 'Business Interruption - Loss of Revenue',
                TaxationReportedRevenue: helpers_1.value(helpers_1.getTaxationReportedRevenue(app)),
                TaxationReportedRevenueYear: helpers_1.getTaxationReportedTaxFilingAndYear(app).year,
                TaxationSalesTax2019: helpers_1.value(helpers_1.getTaxationSalesTax2019(app)),
                TaxationSalesTax2020: helpers_1.value(helpers_1.getTaxationSalesTax2020(app)),
                TaxationReportedTaxFiling: helpers_1.getTaxationReportedTaxFilingAndYear(app).type,
                TaxationReportedSolePropIncome: helpers_1.value(helpers_1.getTaxationReportedNetIncomeLoss(app)),
                ReportedRevenueReasonable: helpers_1.getReportedRevenueReasonableness(app),
                YYRevenueDeclineReasonable: helpers_1.getYYRevenueDeclineReasonableness(app),
                ReasonablenessExceptions: helpers_1.getReasonablenessExceptions(app),
                DOLWR30FilingQuarter: helpers_1.getQuarterlyWageData(app).quarterDesc,
                WR30ReportingComments: helpers_1.getWr30ReportingComments(app),
            },
            OtherCovid19Assistance: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_SBAPPP) ||
                    util_1.bool(app.DOBAffidavit_SBAEIDG) ||
                    util_1.bool(app.DOBAffidavit_SBAEIDL) ||
                    !!app.nonDeclinedEdaLoan ||
                    !!app.grantPhase1 ||
                    util_1.bool(app.DOBAffidavit_OtherStateLocal)),
            },
            OtherCovid19Assistance_PPP: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_SBAPPP)),
                PartofUnMetCalculation: helpers_1.yesNo(true),
                Program: types_1.ProgramDescriptions.PPP,
                ProgramDescription: null,
                Status: helpers_1.getDobApproval(app.DOBAffidavit_SBAPPP, app.DOBAffidavit_SBAPPPDetails_Status_Value),
                ApprovalDate: helpers_1.getDobApprovalDate(app.DOBAffidavit_SBAPPP, app.DOBAffidavit_SBAPPPDetails_Status_Value, app.DOBAffidavit_SBAPPPDetails_ApprovalDate),
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.DOBAffidavit_SBAPPP, app.DOBAffidavit_SBAPPPDetails_Amount)),
                PurposeOfFunds: helpers_1.getDobPurposes(app.DOBAffidavit_SBAPPP, app.DOBAffidavit_SBAPPPDetails_Purposes_Value),
            },
            OtherCovid19Assistance_EIDG: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_SBAEIDG)),
                PartofUnMetCalculation: helpers_1.yesNo(true),
                Program: types_1.ProgramDescriptions.EIDG,
                ProgramDescription: null,
                Status: helpers_1.getDobApproval(app.DOBAffidavit_SBAEIDG, app.DOBAffidavit_SBAEIDGDetails_Status_Value),
                ApprovalDate: helpers_1.getDobApprovalDate(app.DOBAffidavit_SBAEIDG, app.DOBAffidavit_SBAEIDGDetails_Status_Value, app.DOBAffidavit_SBAEIDGDetails_ApprovalDate),
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.DOBAffidavit_SBAEIDG, app.DOBAffidavit_SBAEIDGDetails_Amount)),
                PurposeOfFunds: helpers_1.getDobPurposes(app.DOBAffidavit_SBAEIDG, app.DOBAffidavit_SBAEIDGDetails_Purposes_Value),
            },
            OtherCovid19Assistance_EIDL: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_SBAEIDL)),
                PartofUnMetCalculation: helpers_1.yesNo(false),
                Program: types_1.ProgramDescriptions.EIDL,
                ProgramDescription: null,
                Status: helpers_1.getDobApproval(app.DOBAffidavit_SBAEIDL, app.DOBAffidavit_SBAEIDLDetails_Status_Value),
                ApprovalDate: helpers_1.getDobApprovalDate(app.DOBAffidavit_SBAEIDL, app.DOBAffidavit_SBAEIDLDetails_Status_Value, app.DOBAffidavit_SBAEIDLDetails_ApprovalDate),
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.DOBAffidavit_SBAEIDL, app.DOBAffidavit_SBAEIDLDetails_Amount)),
                PurposeOfFunds: helpers_1.getDobPurposes(app.DOBAffidavit_SBAEIDL, app.DOBAffidavit_SBAEIDLDetails_Purposes_Value),
            },
            OtherCovid19Assistance_CVSBLO: {
                IsExists: helpers_1.yesNo(!!app.nonDeclinedEdaLoan),
                PartofUnMetCalculation: helpers_1.yesNo(true),
                Program: types_1.ProgramDescriptions.CVSBLO,
                ProgramDescription: `OLA Application ID: ${(_c = app.nonDeclinedEdaLoan) === null || _c === void 0 ? void 0 : _c['OLA Application ID (Underwriting) (Underwriting)']}`,
                Status: typeof ((_d = app.nonDeclinedEdaLoan) === null || _d === void 0 ? void 0 : _d['Approval Date']) === 'undefined'
                    ? types_1.ProgramApprovals.In_Process
                    : types_1.ProgramApprovals.Approved,
                ApprovalDate: typeof ((_e = app.nonDeclinedEdaLoan) === null || _e === void 0 ? void 0 : _e['Approval Date']) === 'undefined'
                    ? null
                    : util_1.formatExcelDate(app.nonDeclinedEdaLoan['Approval Date']),
                ApprovedAmount: helpers_1.value((_f = app.nonDeclinedEdaLoan) === null || _f === void 0 ? void 0 : _f.Amount),
                PurposeOfFunds: null,
            },
            OtherCovid19Assistance_CVSBGR: {
                IsExists: helpers_1.yesNo(!!app.grantPhase1),
                PartofUnMetCalculation: helpers_1.yesNo(((_g = app.grantPhase1) === null || _g === void 0 ? void 0 : _g['Product Status']) !== grant_phase_1_1.ProductStatuses.Ended),
                Program: types_1.ProgramDescriptions.CVSBGR,
                ProgramDescription: `OLA Application ID: ${(_h = app.grantPhase1) === null || _h === void 0 ? void 0 : _h['OLA']}`,
                Status: helpers_1.getGrantPhase1Status(app),
                ApprovalDate: typeof ((_j = app.grantPhase1) === null || _j === void 0 ? void 0 : _j['Approval Date']) === 'undefined'
                    ? null
                    : util_1.formatExcelDate(app.grantPhase1['Approval Date']),
                ApprovedAmount: helpers_1.value((_k = app.grantPhase1) === null || _k === void 0 ? void 0 : _k.Amount),
                PurposeOfFunds: null,
            },
            OtherCovid19Assistance_Other: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_OtherStateLocal)),
                PartofUnMetCalculation: helpers_1.yesNo(true),
                Program: types_1.ProgramDescriptions.Other,
                ProgramDescription: app.DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions,
                Status: null,
                ApprovalDate: null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.DOBAffidavit_OtherStateLocal, app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess)),
                PurposeOfFunds: helpers_1.getDobPurposes(app.DOBAffidavit_OtherStateLocal, app.DOBAffidavit_OtherStateLocalDetails_Purposes_Value),
            },
        };
        return olaDatas;
    }
    catch (e) {
        console.error(chalk.red('DecoratedApplication for the error below:'));
        console.dir(app, { depth: null });
        console.error(chalk.red(`Error found while generating OLA Datas for application ${app.ApplicationId} (printed above):`));
        console.dir(e, { depth: null });
        throw e;
    }
}
exports.generateOlaDatas = generateOlaDatas;
//# sourceMappingURL=ola-datas.js.map