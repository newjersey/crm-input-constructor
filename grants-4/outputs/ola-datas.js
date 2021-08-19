"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOlaDatas = void 0;
const chalk = require('chalk');
const types_1 = require("./types");
const helpers_1 = require("./helpers");
const util_1 = require("../util");
const applications_1 = require("../inputs/applications");
const award_size_1 = require("./award-size");
function generateOlaDatas(app, test) {
    try {
        const olaDatas = {
            Account: {
                Name: app.ContactInformation_BusinessName,
                DoingBusinessAs: app.ContactInformation_DoingBusinessAsDBA,
                Email: app.ContactInformation_Email.trim(),
                Telephone: app.ContactInformation_Phone,
                WebSiteURL: app.ContactInformation_Website,
                YearEstablished: app.Business_YearEstablished,
                AnnualRevenue: helpers_1.value(app.njeda_total2019annualrevenueifapplicable),
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
                Ethnicity: app.njeda_minorityownedbusinessselectedspecify,
                DisabilityOwned: helpers_1.flag(helpers_1.getDesignation(app, applications_1.Designations.Disabled_Owned)),
                Comment: '',
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
                ProductTypeId: '{90BEB932-958D-EB11-A812-001DD8016288}',
                LocatedInCommercialLocation: (!!app.njeda_commerciallocation) ? app.njeda_commerciallocation : '',
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
                jobTitle: app.njeda_title,
                address1: app.ContactInformation_PrimaryBusinessAddress_Line1,
                address2: app.ContactInformation_PrimaryBusinessAddress_Line2,
                city: app.ContactInformation_Geography_Label,
                zipcode: app.ContactInformation_ZipFirst5,
                telephone: app.ContactInformation_Phone,
                telephoneExt: '',
                email: app.ContactInformation_Email.trim(),
                organizationName: app.ContactInformation_BusinessName,
                knownAs: app.ContactInformation_DoingBusinessAsDBA,
                ein: app.Business_TIN,
                naicsCode: app.NAICSCode,
                ownershipStructure: helpers_1.getOwnershipStructure(app),
                applicantBackground: '',
                headquarterState: '',
                headquarterCountry: '',
                landAcquisitions: null,
                newBldgConstruction: null,
                acquisitionExistingBuilding: null,
                existingBldgRvnt: null,
                upgradeEquipment: helpers_1.value(),
                newEquipment: null,
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
                selectedProducts: 'Covid Small Business Emergency Assistance Grant Phase 4',
                //MOLAGUID: app.MOLAGUID,
                ReceivedPreiousFundingFromEDA: '',
                ReceivedPreiousFundingFromOtherthanEDA: '',
                TotalFullTimeEligibleJobs: helpers_1.getQuarterlyWageData(app).fteCount,
                NJFullTimeJobsAtapplication: (app.njeda_revisedfulltimeemployeeslistedwr30 !== undefined) ? Number(app.njeda_revisedfulltimeemployeeslistedwr30)
                    : (app.njeda_fulltimew2employeeslistedonwr30 !== undefined) ? Number(app.njeda_fulltimew2employeeslistedonwr30)
                        : 0,
                PartTimeJobsAtapplication: Number(app.Business_W2EmployeesPartTime),
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
                totalProjectCost: helpers_1.value(),
                financeAmtApplied: helpers_1.value(award_size_1.awardSize(app)),
            },
            Location: {
                isRelocation: null,
                isExpansion: null,
                isStartup: null,
                address1Line1: app.ContactInformation_PrimaryBusinessAddress_Line1,
                address1Line2: app.ContactInformation_PrimaryBusinessAddress_Line2,
                address1City: app.ContactInformation_Geography_Label,
                address1Zip: app.ContactInformation_ZipFirst5,
                address1State: 'NJ',
                //address1County: app.geography.County,
                //address1Municipality: app.geography.Municipality,
                address1Country: '',
                block: '',
                lot: '',
                //congressionalDistrict: app.geography.CongressionalDistrict,
                //legislativeDistrict: app.geography.LegislativeDistrict,
                censusTract: app.njeda_censustract,
                Comments: `Home-Based Business: ${util_1.bool(app.BusinessDetails_HomeBasedBusiness) ? 'Yes' : 'No'}`,
                EligibleOpportunityZone: app.njeda_isinopportunityzone //yesNo(bool(app.njeda_isinopportunityzone)),
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
                CompletionDate: (helpers_1.getDecision(app) === types_1.Decision.Review || helpers_1.getDecision(app) === types_1.Decision.LegalReview) ? null : util_1.formatDate(new Date()),
                GeneralComments: `Other Workers (1099, seasonal, PEO) Full-Time: ${app.njeda_number1099fulltimeemployees} ; Part-Time: ${app.njeda_number1099parttimeemployees} `,
            },
            Covid19Impacts: {
                ApplicationLanguage: app.Language,
                Grant1applicationID: null,
                ApplicationSequenceID: app.njeda_submittedordernumber,
                OntheSAMSExclusionList: helpers_1.yesNo(app.sams.possibleMatches.length > 0),
                DeemedAsEssentialBusiness: app.njeda_entitydeemedessentialbusinessgovmurphyeo,
                RemainOpenMar2020: app.COVID19Impact_OpenOrReopened,
                CapacityOpen: app.COVID19Impact_Capacity,
                ActualRevenue2019: helpers_1.value(app.njeda_total2019annualrevenueifapplicable),
                ActualRevenue2020: helpers_1.value(app.njeda_total2020annualrevenue),
                UseofFunds: app.UseOfFundsSummary,
                TaxationReportedRevenue: helpers_1.value(helpers_1.getTaxationReportedRevenue(app)),
                TaxationReportedRevenueYear: helpers_1.getTaxationReportedTaxFilingAndYear(app).year,
                TaxationSalesTax2019: null,
                TaxationSalesTax2020: null,
                TaxationReportedTaxFiling: helpers_1.getTaxationReportedTaxFilingAndYear(app).type,
                TaxationReportedSolePropIncome: helpers_1.value(helpers_1.getTaxationReportedNetIncomeLoss(app)),
                ReportedRevenueReasonable: null,
                YYRevenueDeclineReasonable: null,
                ReasonablenessExceptions: null,
                DOLWR30FilingQuarter: helpers_1.getQuarterlyWageData(app).quarterDesc,
                WR30ReportingComments: helpers_1.getWr30ReportingComments(app),
                DOLWR30AwardQuarter: app.njeda_previous6qtrhighestemployment,
                TotalFTEJobsAwardQuarter: award_size_1.highestFTE(app),
                LaborFTEJobsFromWR30: (helpers_1.getQuarterlyWageHighestFTE(app).fteCount != null) ? Number(helpers_1.getQuarterlyWageHighestFTE(app).fteCount) : null,
                LaborQuarterFromWR30: (helpers_1.getQuarterlyWageHighestFTE(app).fteCount != null) ? helpers_1.getQuarterlyWageHighestFTE(app).quarterDesc : '',
                UnMetNeed: helpers_1.value(award_size_1.unmetNeed(app)),
                Phase3BusinessEligibility: helpers_1.getBusinessType(app),
                BusinessOperationalatApp: (app.njeda_revisedbusinessoperatingtoday !== undefined) ? helpers_1.yesNo(util_1.bool(app.njeda_revisedbusinessoperatingtoday)) : helpers_1.yesNo(util_1.bool(app.njeda_businessstilloperatingtoday)),
                EstimatedRevenueLossatApp: (app.njeda_revisedtodayestimatedrevenueloss !== undefined) ? helpers_1.value(app.njeda_revisedtodayestimatedrevenueloss) : (app.njeda_todayestimatedrevenueloss !== undefined) ? helpers_1.value(app.njeda_todayestimatedrevenueloss) : helpers_1.value(),
                IsReligiousByUser: helpers_1.yesNo(util_1.bool(app.Business_Religious)),
                IsLobbyingByUser: helpers_1.yesNo(util_1.bool(app.Business_LobbyingPolitical)),
                IsChildCareLicensed: app.njeda_revisedischildcarecenterproperlylicensed !== undefined ? app.njeda_revisedischildcarecenterproperlylicensed : app.njeda_ischildcarecenterproperlylicensedorexempt !== undefined ? app.njeda_ischildcarecenterproperlylicensedorexempt : '',
                DuplicationOfBenefits: app.DOBValidation.DOBFindings.trim(),
            },
            OtherCovid19Assistance: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_appliedforothercovid19assistance)),
            },
            OtherCovid19Assistance_PPP: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_SBAPPP)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.PPP,
                ProgramDescription: '',
                Status: (!!app.DOBAffidavit_SBAPPPDetails_Status) ? app.DOBAffidavit_SBAPPPDetails_Status : null,
                ApprovalDate: helpers_1.getDobApprovalDate(app.DOBAffidavit_SBAPPPDetails_ApprovalDate),
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.DOBAffidavit_SBAPPP, app.DOBAffidavit_SBAPPPDetails_Amount)),
                PurposeOfFunds: (!!app.DOBAffidavit_SBAPPPDetails_Purposes) ? app.DOBAffidavit_SBAPPPDetails_Purposes : null,
            },
            //PPP Phase 2
            OtherCovid19Assistance_PPP2: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_sbapaycheckprotectionprogramphase2)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.PPP2,
                ProgramDescription: '',
                Status: (!!app.njeda_sbapppphase2status) ? app.njeda_sbapppphase2status : null,
                ApprovalDate: (typeof app.njeda_sbapppphase2approveddate === 'string') ? util_1.formatDate(new Date(app.njeda_sbapppphase2approveddate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_sbapaycheckprotectionprogramphase2, app.njeda_sbapppphase2approvedamt)),
                PurposeOfFunds: (!!app.njeda_sbapppphase2approvedpurpose) ? app.njeda_sbapppphase2approvedpurpose : null,
            },
            OtherCovid19Assistance_EIDG: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_SBAEIDG)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.EIDG,
                ProgramDescription: '',
                Status: (!!app.DOBAffidavit_SBAEIDGDetails_Status) ? app.DOBAffidavit_SBAEIDGDetails_Status : null,
                ApprovalDate: helpers_1.getDobApprovalDate(app.DOBAffidavit_SBAEIDGDetails_ApprovalDate),
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.DOBAffidavit_SBAEIDG, app.DOBAffidavit_SBAEIDGDetails_Amount)),
                PurposeOfFunds: (!!app.DOBAffidavit_SBAEIDGDetails_Purposes) ? app.DOBAffidavit_SBAEIDGDetails_Purposes : null,
            },
            OtherCovid19Assistance_EIDL: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_SBAEIDL)),
                PartofUnMetCalculation: "No",
                Program: types_1.ProgramDescriptions.EIDL,
                ProgramDescription: '',
                Status: (!!app.DOBAffidavit_SBAEIDLDetails_Status) ? app.DOBAffidavit_SBAEIDLDetails_Status : null,
                ApprovalDate: helpers_1.getDobApprovalDate(app.DOBAffidavit_SBAEIDLDetails_ApprovalDate),
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.DOBAffidavit_SBAEIDL, app.DOBAffidavit_SBAEIDLDetails_Amount)),
                PurposeOfFunds: (!!app.DOBAffidavit_SBAEIDLDetails_Purposes) ? app.DOBAffidavit_SBAEIDLDetails_Purposes : null,
            },
            OtherCovid19Assistance_CVSBLO: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_NJEDALoan)),
                PartofUnMetCalculation: "No",
                Program: types_1.ProgramDescriptions.CVSBLO,
                ProgramDescription: '',
                Status: (!!app.DOBAffidavit_NJEDALoanDetails_Status) ? app.DOBAffidavit_NJEDALoanDetails_Status : null,
                ApprovalDate: helpers_1.getDobApprovalDate(app.DOBAffidavit_NJEDALoanDetails_ApprovalDate),
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.DOBAffidavit_NJEDALoan, app.DOBAffidavit_NJEDALoanDetails_Amount)),
                PurposeOfFunds: (!!app.DOBAffidavit_NJEDALoanDetails_Purposes) ? app.DOBAffidavit_NJEDALoanDetails_Purposes : null,
            },
            OtherCovid19Assistance_CVSBGR: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_NJEDAGrant)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.CVSBGR,
                ProgramDescription: '',
                Status: (!!app.DOBAffidavit_NJEDAGrantDetails_Status) ? app.DOBAffidavit_NJEDAGrantDetails_Status : null,
                ApprovalDate: helpers_1.getDobApprovalDate(app.DOBAffidavit_NJEDAGrantDetails_ApprovalDate),
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.DOBAffidavit_NJEDAGrant, app.DOBAffidavit_NJEDAGrantDetails_Amount)),
                PurposeOfFunds: (!!app.DOBAffidavit_NJEDAGrantDetails_Purposes) ? app.DOBAffidavit_NJEDAGrantDetails_Purposes : null,
            },
            OtherCovid19Assistance_CVSB2GR: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_njedasbemergencygrantassistancephase2)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.CVSB2GR,
                ProgramDescription: '',
                Status: (!!app.njeda_njedasbemergencygrantassistancephase2stat) ? app.njeda_njedasbemergencygrantassistancephase2stat : null,
                ApprovalDate: (typeof app.njeda_sbemergencygrantassistphase2approveddate === 'string') ? util_1.formatDate(new Date(app.njeda_sbemergencygrantassistphase2approveddate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_njedasbemergencygrantassistancephase2, app.njeda_sbemergencygrantphase2amountapproved)),
                PurposeOfFunds: (!!app.njeda_sbemergencygrantassistphase2purposeoffund) ? app.njeda_sbemergencygrantassistphase2purposeoffund : null,
            },
            //Grant Phase 3
            OtherCovid19Assistance_CVSB3GR: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_njedasbegrantassistancephase3)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.CVSB3GR,
                ProgramDescription: '',
                Status: (!!app.njeda_njedasbegrantassistphase3status) ? app.njeda_njedasbegrantassistphase3status : null,
                ApprovalDate: (typeof app.njeda_njedasbegrantassistphase3approveddate === 'string') ? util_1.formatDate(new Date(app.njeda_njedasbegrantassistphase3approveddate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_njedasbegrantassistancephase3, app.njeda_njedasbegrantassistphase3approvedamt)),
                PurposeOfFunds: (!!app.njeda_njedasbegrantassistphase3approvedpurpose) ? app.njeda_njedasbegrantassistphase3approvedpurpose : null,
            },
            //Care
            OtherCovid19Assistance_CARES: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_caresactfundingfromlocalcounty)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.CARES,
                ProgramDescription: '',
                Status: (!!app.njeda_caresactfundingfromlocalcountystatus) ? app.njeda_caresactfundingfromlocalcountystatus : null,
                ApprovalDate: (typeof app.njeda_caresactfundingfromlocalcountyapprovedate === 'string') ? util_1.formatDate(new Date(app.njeda_caresactfundingfromlocalcountyapprovedate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_caresactfundingfromlocalcounty, app.njeda_cafundingfromlocalcountyamtapproved)),
                PurposeOfFunds: (!!app.njeda_cafundingfromlocalcountypurposeoffunds) ? app.njeda_cafundingfromlocalcountypurposeoffunds : null,
            },
            //Housing
            OtherCovid19Assistance_NJHousing: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_njhandmortgagefinancecovid19landlordgrant)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.NJHousing,
                ProgramDescription: '',
                Status: (!!app.njeda_njhandmortgagefincovidlandlordgrantstatus) ? app.njeda_njhandmortgagefincovidlandlordgrantstatus : null,
                ApprovalDate: (typeof app.njeda_njhandmorfincovidlandlordapproveddate === 'string') ? util_1.formatDate(new Date(app.njeda_njhandmorfincovidlandlordapproveddate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_njhandmortgagefinancecovid19landlordgrant, app.njeda_njhmorfincovidlandlordgrantamtapproved)),
                PurposeOfFunds: (!!app.njeda_njhandmorfincovidlandlordpurposeoffunds) ? app.njeda_njhandmorfincovidlandlordpurposeoffunds : null,
            },
            //Re-Develpment
            OtherCovid19Assistance_NJRedevelopment: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_njredevauthsbleaseemergassistgrantprogram)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.NJRedevelopment,
                ProgramDescription: '',
                Status: (!!app.njeda_njredevauthsbleaseemergastgrantprogstatus) ? app.njeda_njredevauthsbleaseemergastgrantprogstatus : null,
                ApprovalDate: (typeof app.njeda_redevauthsblemerastgrantprogapproveddate === 'string') ? util_1.formatDate(new Date(app.njeda_redevauthsblemerastgrantprogapproveddate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_njredevauthsbleaseemergassistgrantprogram, app.njeda_redevauthsblemerastgrantprogamtapproved)),
                PurposeOfFunds: (!!app.njeda_redevauthsblemerastgrantpropurposeoffunds) ? app.njeda_redevauthsblemerastgrantpropurposeoffunds : null,
            },
            //Re-Develpment Phase 2
            OtherCovid19Assistance_NJRedevelopment2: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_njrasbleaseeagprogphase2)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.NJRedevelopment2,
                ProgramDescription: '',
                Status: (!!app.njeda_sbleaseemergassistgrantprogphase2status) ? app.njeda_sbleaseemergassistgrantprogphase2status : null,
                ApprovalDate: (typeof app.njeda_njrasbleaseeagprogphase2approveddate === 'string') ? util_1.formatDate(new Date(app.njeda_njrasbleaseeagprogphase2approveddate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_njrasbleaseeagprogphase2, app.njeda_njrasbleaseeagprogphase2approvedamt)),
                PurposeOfFunds: (!!app.njeda_njrasbleaseeagprogphase2approvedpurpose) ? app.njeda_njrasbleaseeagprogphase2approvedpurpose : null,
            },
            //Insurance
            OtherCovid19Assistance_Insurance: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_insuranceproceeds)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.Insurance,
                ProgramDescription: '',
                Status: (!!app.njeda_insuranceproceedsstatus) ? app.njeda_insuranceproceedsstatus : '',
                ApprovalDate: (typeof app.njeda_insuranceproceedsapproveddate === 'string') ? util_1.formatDate(new Date(app.njeda_insuranceproceedsapproveddate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_insuranceproceeds, app.njeda_insuranceproceedsamountapproved)),
                PurposeOfFunds: (!!app.njeda_insuranceproceedspurposeoffunds) ? app.njeda_insuranceproceedspurposeoffunds : null,
            },
            // Other
            OtherCovid19Assistance_Other: {
                IsExists: helpers_1.yesNo(util_1.bool(app.DOBAffidavit_OtherStateLocal)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.Other,
                ProgramDescription: app.DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions,
                Status: helpers_1.getDobApproval(app.DOBAffidavit_OtherStateLocal, //app.njeda_otherprogramstatus
                (typeof app.njeda_otherprogramstatus !== 'undefined') ? app.njeda_otherprogramstatus : ''),
                ApprovalDate: //null,
                (typeof app.njeda_otherprogramapproveddate === 'string') ? util_1.formatDate(new Date(app.njeda_otherprogramapproveddate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.DOBAffidavit_OtherStateLocal, app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess)),
                PurposeOfFunds: (!!app.DOBAffidavit_OtherStateLocalDetails_Purposes) ? app.DOBAffidavit_OtherStateLocalDetails_Purposes : null,
            },
            // PPE Phase 1
            OtherCovid19Assistance_PPE: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_njpersonalppeaccessprogram)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.PPE,
                ProgramDescription: '',
                Status: (!!app.njeda_njpersonalppeaprogramstatus) ? app.njeda_njpersonalppeaprogramstatus : null,
                ApprovalDate: (typeof app.njeda_njpersonalppeaprogramapproveddate === 'string') ? util_1.formatDate(new Date(app.njeda_njpersonalppeaprogramapproveddate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_njpersonalppeaccessprogram, app.njeda_njpersonalppeaprogramapprovedamt)),
                PurposeOfFunds: (!!app.njeda_njpersonalppeaprogramapprovedpurpose) ? app.njeda_njpersonalppeaprogramapprovedpurpose : null,
            },
            // PPE Phase 2
            OtherCovid19Assistance_PPE2: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_njedasmbppeaccessprogphase2)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.PPE2,
                ProgramDescription: '',
                Status: (!!app.njeda_njedasmbppeaccessprogphase2status) ? app.njeda_njedasmbppeaccessprogphase2status : null,
                ApprovalDate: (typeof app.njeda_njedasmbppeaccessprogphase2date === 'string') ? util_1.formatDate(new Date(app.njeda_njedasmbppeaccessprogphase2date)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_njedasmbppeaccessprogphase2, app.njeda_njedasmbppeaccessprogphase2amount)),
                PurposeOfFunds: (!!app.njeda_njedasmbppeaccessprogphase2purpose) ? app.njeda_njedasmbppeaccessprogphase2purpose : null,
            },
            // SSNJ
            OtherCovid19Assistance_SSNJ: {
                IsExists: helpers_1.yesNo(util_1.bool(app.njeda_njedasustainandserve)),
                PartofUnMetCalculation: "Yes",
                Program: types_1.ProgramDescriptions.SSNJ,
                ProgramDescription: '',
                Status: (!!app.njeda_njedasustainandservestatus) ? app.njeda_njedasustainandservestatus : null,
                ApprovalDate: (typeof app.njeda_njedasustainandserveapproveddate === 'string') ? util_1.formatDate(new Date(app.njeda_njedasustainandserveapproveddate)) : null,
                ApprovedAmount: helpers_1.value(helpers_1.getDobAmountValue(app.njeda_njedasustainandserve, app.njeda_njedasustainandserveapprovedamt)),
                PurposeOfFunds: (!!app.njeda_njedasustainandserveapprovedpurpose) ? app.njeda_njedasustainandserveapprovedpurpose : null,
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