const chalk = require('chalk');

import {
    Decision,
    DecoratedApplication,
    DOBPrograms,
    OlaDatas,
    ProgramApprovals,
    ProgramDescriptions,
    SmallBusinessStatuses,
} from './types';
import {
    adjustedMarchAprilMay2020Revenue,
    cappedMarchAprilMay2019Revenue,
    flag,
    getApplicantBackground,
    getCapacityOpen,
    getDecision,
    getDesignation,
    getDobAmountValue,
    getDobApproval,
    getDobApprovalDate,
    getDobPurposes,
    //getEligibleOpportunityZoneValue,
    getFindingsString,
    //getGrantPhase1Status,
    getMonitoringStatus,
    getMonitoringType,
    getOwnershipStructure,
    getProductStatusId,
    getProductSubStatusId,
    getQuarterlyWageData,
    getReasonablenessExceptions,
    getReportedRevenueReasonableness,
    getServicingOfficer,
    getTaxClearanceComments,
    getTaxationReportedNetIncomeLoss,
    getTaxationReportedRevenue,
    getTaxationReportedTaxFilingAndYear,
    //getTaxationSalesTax2019,
    //getTaxationSalesTax2020,
    getWr30ReportingComments,
    getYYRevenueDeclineReasonableness,
    value,
    yesNo,
    getBusinessType,
    getQuarterlyWageHighestFTE,
} from './helpers';
import { bool, formatDate, formatExcelDate, formatDollars } from '../util';

import { Designations, YesNo } from '../inputs/applications';
import { ProductStatuses } from '../inputs/grant-phase-1';
import {
    awardSize,
    highestFTE,
    OtherFundingAmountNJEDAPhase1,
    unmetNeed,
} from './award-size';

export function generateOlaDatas(app: DecoratedApplication, test: boolean): OlaDatas {
    try {
        
        const olaDatas: OlaDatas = {
            Account: {
                Name: app.ContactInformation_BusinessName,
                DoingBusinessAs: app.ContactInformation_DoingBusinessAsDBA,
                Email: app.ContactInformation_Email.trim(),
                Telephone: app.ContactInformation_Phone,
                WebSiteURL: app.ContactInformation_Website,
                YearEstablished: app.Business_YearEstablished,
                AnnualRevenue: value(app.njeda_total2019annualrevenueifapplicable),
                TaxClearanceComments: getTaxClearanceComments(app),
                ACHNonCompliance: '',
                address2Line1: '', //app.njeda_mailingaddressline1,
                address2Line2: '', //app.njeda_mailingaddressline2,
                address2City: '', //app.njeda_njcitymailing,
                address2Zip: '', //app.njeda_njzipcodemailing,
                address2State: '', //app.njeda_statemailing,
                address2County: '', //app.njeda_countymailing,
                address2Country: '',
                WomanOwned: flag(getDesignation(app, Designations.Woman_Owned)),
                VeteranOwned: flag(getDesignation(app, Designations.Veteran_Owned)),
                MinorityOwned: flag(getDesignation(app, Designations.Minority_Owned)),
                Ethnicity: app.njeda_minorityownedbusinessselectedspecify,
                DisabilityOwned: flag(getDesignation(app, Designations.Disabled_Owned)),
                Comment: '',
                SSN: '',
            },
            Project: {
                StatusCode: 1,
                ProjectDescription: '',
            },
            Product: {
                DevelopmentOfficer: '',
                ServicingOfficerId: getServicingOfficer(app, test),
                AppReceivedDate: formatExcelDate(app.Entry_DateSubmitted),
                Amount: value(awardSize(app)),  //value(app.njeda_totalfundingrequested),
                nol_total_NOL_benefit: null,
                nol_total_RD_benefit: null,
                benefit_allocation_factor: null,
                nol_prior_years_tax_credits_sold: null,
                ProductStatusId: getProductStatusId(app),
                ProductSubStatusId: getProductSubStatusId(app),
                ProductTypeId: '{90BEB932-958D-EB11-A812-001DD8016288}',  //CVSB4GR  
                LocatedInCommercialLocation: (!!app.njeda_commerciallocation) ? app.njeda_commerciallocation : '' ,
                ProductDescription: '',
                lender: '',
                lenderAmount: value(),
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
                city: app.ContactInformation_Geography_Label,    //app.geography.City,
                zipcode: app.ContactInformation_ZipFirst5,  //app.geography.Zip,
                telephone: app.ContactInformation_Phone,   //c.split(' x')[0].replace(/\D/g, ''),
                telephoneExt:'',  //app.ContactInformation_Phone.split(' x')[1] || '',
                email: app.ContactInformation_Email.trim(),
                organizationName: app.ContactInformation_BusinessName,
                knownAs: app.ContactInformation_DoingBusinessAsDBA,
                ein: app.Business_TIN,
                naicsCode: app.NAICSCode,
                ownershipStructure: getOwnershipStructure(app),
                applicantBackground: '',   //getApplicantBackground(app),
                headquarterState: '',
                headquarterCountry: '',
                landAcquisitions: null,
                newBldgConstruction: null,
                acquisitionExistingBuilding: null,
                existingBldgRvnt: null,
                upgradeEquipment: value(),
                newEquipment: null,
                usedEquipment: value(),
                engineerArchitechFees: value(),
                legalFees: null,
                accountingFees: null,
                financeFees: null,
                roadUtilitiesConst: value(),
                debtServiceReserve: null,
                constructionInterest: value(),
                refinancing: value(),
                workingCapital: value(),
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
                totalCost: value(),
                applicationID: app.ApplicationId,
                selectedProducts: 'Covid Small Business Emergency Assistance Grant Phase 4',
                //MOLAGUID: app.MOLAGUID,
                ReceivedPreiousFundingFromEDA: '', //app.njeda_describeprovidededaassistance,
                ReceivedPreiousFundingFromOtherthanEDA: '',
                TotalFullTimeEligibleJobs: getQuarterlyWageData(app).fteCount,
                NJFullTimeJobsAtapplication: (app.njeda_revisedfulltimeemployeeslistedwr30 !== undefined) ? Number(app.njeda_revisedfulltimeemployeeslistedwr30)
                                            : (app.njeda_fulltimew2employeeslistedonwr30 !== undefined) ? Number(app.njeda_fulltimew2employeeslistedonwr30)
                                            : 0,   //app.Business_W2EmployeesFullTime,
                PartTimeJobsAtapplication: Number(app.Business_W2EmployeesPartTime),
                softCosts: value(),
                relocationCosts: value(),
                securityCosts: value(),
                titleCosts: value(),
                surveyCosts: value(),
                marketAnalysisCosts: value(),
                developmentImpactCosts: value(),
                marketSiteCosts: value(),
                demolitionCosts: null,
                streetscapeCosts: null,
                remediationCosts: value(),
                redemptionPremiumCosts: null,
                installationMachineryCosts: null,
                totalProjectCost: value(),
                financeAmtApplied: value(awardSize(app)),
            },
            Location: {
                isRelocation: null,
                isExpansion: null,
                isStartup: null,
                address1Line1: app.ContactInformation_PrimaryBusinessAddress_Line1,
                address1Line2: app.ContactInformation_PrimaryBusinessAddress_Line2,
                address1City: app.ContactInformation_Geography_Label,    //app.geography.City,
                address1Zip: app.ContactInformation_ZipFirst5,  //app.geography.Zip,
                address1State: 'NJ',
                //address1County: app.geography.County,
                //address1Municipality: app.geography.Municipality,
                address1Country: '',
                block: '',
                lot: '',
                //congressionalDistrict: app.geography.CongressionalDistrict,
                //legislativeDistrict: app.geography.LegislativeDistrict,
                censusTract: app.njeda_censustract,
                Comments: `Home-Based Business: ${
                    bool(app.BusinessDetails_HomeBasedBusiness) ? 'Yes' : 'No'
                    }`,
                EligibleOpportunityZone: app.njeda_isinopportunityzone //yesNo(bool(app.njeda_isinopportunityzone)),
            },
            FeeRequest: {
                receivedDate: null,
                receivedAmt: null,
                confirmationNum: '',
                productFeeAmount: null,
            },
            Monitoring: {
                Status: getMonitoringStatus(app),
                MonitoringType: getMonitoringType(app),
                Findings: getFindingsString(app),
                CompletionDate: (getDecision(app) === Decision.Review || getDecision(app) === Decision.LegalReview) ? null : formatDate(new Date()),
                GeneralComments: `Other Workers (1099, seasonal, PEO) Full-Time: ${app.njeda_number1099fulltimeemployees} ; Part-Time: ${app.njeda_number1099parttimeemployees} `,  //check
            },
            Covid19Impacts: {
              ApplicationLanguage: app.Language,
              Grant1applicationID: null, //app.grantPhase1?.['OLA'] || null,
              ApplicationSequenceID: app.njeda_submittedordernumber,  //app.Sequence,
              OntheSAMSExclusionList: yesNo(app.sams.possibleMatches.length > 0),
              DeemedAsEssentialBusiness: app.njeda_entitydeemedessentialbusinessgovmurphyeo, 
              RemainOpenMar2020: app.COVID19Impact_OpenOrReopened,//yesNo(bool(app.COVID19Impact_OpenOrReopened)), //To Do  
              CapacityOpen: app.COVID19Impact_Capacity, //getCapacityOpen(app),
              ActualRevenue2019: value(app.njeda_total2019annualrevenueifapplicable), //value(cappedMarchAprilMay2019Revenue(app)),
              ActualRevenue2020: value(app.njeda_total2020annualrevenue), //value(adjustedMarchAprilMay2020Revenue(app)),
              UseofFunds: app.UseOfFundsSummary, 
              TaxationReportedRevenue: value(getTaxationReportedRevenue(app)),
              TaxationReportedRevenueYear: getTaxationReportedTaxFilingAndYear(app).year,
              TaxationSalesTax2019: null, //value(getTaxationSalesTax2019(app)),
              TaxationSalesTax2020: null, //value(getTaxationSalesTax2020(app)),
              TaxationReportedTaxFiling: getTaxationReportedTaxFilingAndYear(app).type,
              TaxationReportedSolePropIncome: value(getTaxationReportedNetIncomeLoss(app)),
              ReportedRevenueReasonable: null,
              YYRevenueDeclineReasonable: null,
              ReasonablenessExceptions: null,
              DOLWR30FilingQuarter: getQuarterlyWageData(app).quarterDesc,
              WR30ReportingComments: getWr30ReportingComments(app),
              DOLWR30AwardQuarter: app.njeda_previous6qtrhighestemployment,  // user entered Highest FTE Quarter
              TotalFTEJobsAwardQuarter: highestFTE(app),  // user entered Highest FTE Jobs Count
              LaborFTEJobsFromWR30: (getQuarterlyWageHighestFTE(app).fteCount != null) ? Number(getQuarterlyWageHighestFTE(app).fteCount) : null,   //from WR-30 data
              LaborQuarterFromWR30: (getQuarterlyWageHighestFTE(app).fteCount != null) ? getQuarterlyWageHighestFTE(app).quarterDesc : '',   //from WR-30 data
              UnMetNeed: value(unmetNeed(app)),
              Phase3BusinessEligibility: getBusinessType(app), 
              BusinessOperationalatApp: (app.njeda_revisedbusinessoperatingtoday !== undefined) ? yesNo(bool(app.njeda_revisedbusinessoperatingtoday)) : yesNo(bool(app.njeda_businessstilloperatingtoday)), 
              EstimatedRevenueLossatApp: (app.njeda_revisedtodayestimatedrevenueloss !== undefined) ? value(app.njeda_revisedtodayestimatedrevenueloss) : (app.njeda_todayestimatedrevenueloss !== undefined) ? value(app.njeda_todayestimatedrevenueloss): value(),
              IsReligiousByUser: yesNo(bool(app.Business_Religious)),
              IsLobbyingByUser: yesNo(bool(app.Business_LobbyingPolitical)),
              IsChildCareLicensed: app.njeda_revisedischildcarecenterproperlylicensed !== undefined ? app.njeda_revisedischildcarecenterproperlylicensed : app.njeda_ischildcarecenterproperlylicensedorexempt !== undefined ? app.njeda_ischildcarecenterproperlylicensedorexempt : '',
              DuplicationOfBenefits: app.DOBValidation.DOBFindings.trim(),
            },
            OtherCovid19Assistance: {
                IsExists: yesNo(
                    bool(app.njeda_appliedforothercovid19assistance)
                ),
            },
            OtherCovid19Assistance_PPP: {
                IsExists: yesNo(bool(app.DOBAffidavit_SBAPPP)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.PPP,
                ProgramDescription: '',
                Status: (!!app.DOBAffidavit_SBAPPPDetails_Status) ? app.DOBAffidavit_SBAPPPDetails_Status : null,
                ApprovalDate: getDobApprovalDate(
                    app.DOBAffidavit_SBAPPPDetails_ApprovalDate
                ),
                ApprovedAmount: value(
                    getDobAmountValue(app.DOBAffidavit_SBAPPP, app.DOBAffidavit_SBAPPPDetails_Amount)
                ),
                PurposeOfFunds: (!!app.DOBAffidavit_SBAPPPDetails_Purposes) ? app.DOBAffidavit_SBAPPPDetails_Purposes : null,
            },
            //PPP Phase 2
            OtherCovid19Assistance_PPP2: {
                IsExists: yesNo(bool(app.njeda_sbapaycheckprotectionprogramphase2)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.PPP2,  //Not sure
                ProgramDescription: '',
                Status: (!!app.njeda_sbapppphase2status) ? app.njeda_sbapppphase2status :null,
                ApprovalDate: (typeof app.njeda_sbapppphase2approveddate === 'string') ? formatDate(new Date(app.njeda_sbapppphase2approveddate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_sbapaycheckprotectionprogramphase2, app.njeda_sbapppphase2approvedamt)
                ),
                PurposeOfFunds: (!!app.njeda_sbapppphase2approvedpurpose) ? app.njeda_sbapppphase2approvedpurpose : null,
            },
            OtherCovid19Assistance_EIDG: {
                IsExists: yesNo(bool(app.DOBAffidavit_SBAEIDG)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.EIDG,
                ProgramDescription: '',
                Status: (!!app.DOBAffidavit_SBAEIDGDetails_Status) ? app.DOBAffidavit_SBAEIDGDetails_Status : null,
                ApprovalDate: getDobApprovalDate(
                    app.DOBAffidavit_SBAEIDGDetails_ApprovalDate
                ),
                ApprovedAmount: value(
                    getDobAmountValue(app.DOBAffidavit_SBAEIDG, app.DOBAffidavit_SBAEIDGDetails_Amount)
                ),
                PurposeOfFunds: (!!app.DOBAffidavit_SBAEIDGDetails_Purposes) ? app.DOBAffidavit_SBAEIDGDetails_Purposes : null,
            },
            OtherCovid19Assistance_EIDL: {
                IsExists: yesNo(bool(app.DOBAffidavit_SBAEIDL)),
                PartofUnMetCalculation: "No",
                Program: ProgramDescriptions.EIDL,
                ProgramDescription: '',
                Status: (!!app.DOBAffidavit_SBAEIDLDetails_Status) ? app.DOBAffidavit_SBAEIDLDetails_Status : null,
                ApprovalDate: getDobApprovalDate(
                    app.DOBAffidavit_SBAEIDLDetails_ApprovalDate
                ),
                ApprovedAmount: value(
                    getDobAmountValue(app.DOBAffidavit_SBAEIDL, app.DOBAffidavit_SBAEIDLDetails_Amount)
                ),
                PurposeOfFunds: (!!app.DOBAffidavit_SBAEIDLDetails_Purposes) ? app.DOBAffidavit_SBAEIDLDetails_Purposes : null,
            },
            OtherCovid19Assistance_CVSBLO: {
                IsExists: yesNo(bool(app.DOBAffidavit_NJEDALoan)),
                PartofUnMetCalculation: "No",
                Program: ProgramDescriptions.CVSBLO,  //Not sure
                ProgramDescription: '',
                Status: (!!app.DOBAffidavit_NJEDALoanDetails_Status) ? app.DOBAffidavit_NJEDALoanDetails_Status : null,
                ApprovalDate: getDobApprovalDate(
                    app.DOBAffidavit_NJEDALoanDetails_ApprovalDate
                ),
                ApprovedAmount: value(
                    getDobAmountValue(app.DOBAffidavit_NJEDALoan, app.DOBAffidavit_NJEDALoanDetails_Amount)
                ),
                PurposeOfFunds: (!!app.DOBAffidavit_NJEDALoanDetails_Purposes) ? app.DOBAffidavit_NJEDALoanDetails_Purposes : null,
            },
            OtherCovid19Assistance_CVSBGR: {
                IsExists: yesNo(bool(app.DOBAffidavit_NJEDAGrant)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.CVSBGR,  //Not sure
                ProgramDescription: '',
                Status: (!!app.DOBAffidavit_NJEDAGrantDetails_Status) ? app.DOBAffidavit_NJEDAGrantDetails_Status : null,
                ApprovalDate: getDobApprovalDate(
                    app.DOBAffidavit_NJEDAGrantDetails_ApprovalDate
                ),
                ApprovedAmount: value(
                    getDobAmountValue(app.DOBAffidavit_NJEDAGrant, app.DOBAffidavit_NJEDAGrantDetails_Amount)
                ),
                PurposeOfFunds: (!!app.DOBAffidavit_NJEDAGrantDetails_Purposes) ? app.DOBAffidavit_NJEDAGrantDetails_Purposes : null,
            },
            OtherCovid19Assistance_CVSB2GR: {
                IsExists: yesNo(bool(app.njeda_njedasbemergencygrantassistancephase2)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.CVSB2GR,  //Not sure
                ProgramDescription: '',
                Status: (!!app.njeda_njedasbemergencygrantassistancephase2stat) ? app.njeda_njedasbemergencygrantassistancephase2stat :null,
                ApprovalDate: (typeof app.njeda_sbemergencygrantassistphase2approveddate === 'string') ? formatDate(new Date(app.njeda_sbemergencygrantassistphase2approveddate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_njedasbemergencygrantassistancephase2, app.njeda_sbemergencygrantphase2amountapproved)
                ),
                PurposeOfFunds: (!!app.njeda_sbemergencygrantassistphase2purposeoffund) ? app.njeda_sbemergencygrantassistphase2purposeoffund : null,
            },
            //Grant Phase 3
            OtherCovid19Assistance_CVSB3GR: {
                IsExists: yesNo(bool(app.njeda_njedasbegrantassistancephase3)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.CVSB3GR,  //Not sure
                ProgramDescription: '',
                Status: (!!app.njeda_njedasbegrantassistphase3status) ? app.njeda_njedasbegrantassistphase3status :null,
                ApprovalDate: (typeof app.njeda_njedasbegrantassistphase3approveddate === 'string') ? formatDate(new Date(app.njeda_njedasbegrantassistphase3approveddate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_njedasbegrantassistancephase3, app.njeda_njedasbegrantassistphase3approvedamt)
                ),
                PurposeOfFunds: (!!app.njeda_njedasbegrantassistphase3approvedpurpose) ? app.njeda_njedasbegrantassistphase3approvedpurpose : null,
            },
            //Care
            OtherCovid19Assistance_CARES: {
                IsExists: yesNo(bool(app.njeda_caresactfundingfromlocalcounty)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.CARES,  //Not sure
                ProgramDescription: '',
                Status: (!!app.njeda_caresactfundingfromlocalcountystatus) ? app.njeda_caresactfundingfromlocalcountystatus : null,
                ApprovalDate: (typeof app.njeda_caresactfundingfromlocalcountyapprovedate === 'string') ? formatDate(new Date(app.njeda_caresactfundingfromlocalcountyapprovedate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_caresactfundingfromlocalcounty, app.njeda_cafundingfromlocalcountyamtapproved)
                ),
                PurposeOfFunds: (!!app.njeda_cafundingfromlocalcountypurposeoffunds) ? app.njeda_cafundingfromlocalcountypurposeoffunds : null,
    
            },
            //Housing
            OtherCovid19Assistance_NJHousing: {
                IsExists: yesNo(bool(app.njeda_njhandmortgagefinancecovid19landlordgrant)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.NJHousing,  //Not sure
                ProgramDescription: '',
                Status: (!!app.njeda_njhandmortgagefincovidlandlordgrantstatus) ? app.njeda_njhandmortgagefincovidlandlordgrantstatus : null,
                ApprovalDate: (typeof app.njeda_njhandmorfincovidlandlordapproveddate === 'string') ? formatDate(new Date(app.njeda_njhandmorfincovidlandlordapproveddate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_njhandmortgagefinancecovid19landlordgrant, app.njeda_njhmorfincovidlandlordgrantamtapproved)
                ),
                PurposeOfFunds: (!!app.njeda_njhandmorfincovidlandlordpurposeoffunds) ? app.njeda_njhandmorfincovidlandlordpurposeoffunds : null,

            },
            //Re-Develpment
            OtherCovid19Assistance_NJRedevelopment: {
                IsExists: yesNo(bool(app.njeda_njredevauthsbleaseemergassistgrantprogram)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.NJRedevelopment,  
                ProgramDescription: '',
                Status: (!!app.njeda_njredevauthsbleaseemergastgrantprogstatus) ? app.njeda_njredevauthsbleaseemergastgrantprogstatus : null,
                ApprovalDate: (typeof app.njeda_redevauthsblemerastgrantprogapproveddate === 'string') ? formatDate(new Date(app.njeda_redevauthsblemerastgrantprogapproveddate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_njredevauthsbleaseemergassistgrantprogram, app.njeda_redevauthsblemerastgrantprogamtapproved)
                ),
                PurposeOfFunds: (!!app.njeda_redevauthsblemerastgrantpropurposeoffunds) ? app.njeda_redevauthsblemerastgrantpropurposeoffunds : null,

            },
            //Re-Develpment Phase 2
            OtherCovid19Assistance_NJRedevelopment2: {
                IsExists: yesNo(bool(app.njeda_njrasbleaseeagprogphase2)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.NJRedevelopment2,  
                ProgramDescription: '',
                Status: (!!app.njeda_sbleaseemergassistgrantprogphase2status) ? app.njeda_sbleaseemergassistgrantprogphase2status : null,
                ApprovalDate: (typeof app.njeda_njrasbleaseeagprogphase2approveddate === 'string') ? formatDate(new Date(app.njeda_njrasbleaseeagprogphase2approveddate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_njrasbleaseeagprogphase2, app.njeda_njrasbleaseeagprogphase2approvedamt)
                ),
                PurposeOfFunds: (!!app.njeda_njrasbleaseeagprogphase2approvedpurpose) ? app.njeda_njrasbleaseeagprogphase2approvedpurpose : null,

            },
            //Insurance
            OtherCovid19Assistance_Insurance: {
                IsExists: yesNo(bool(app.njeda_insuranceproceeds)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.Insurance,
                ProgramDescription: '',
                Status: (!!app.njeda_insuranceproceedsstatus) ? app.njeda_insuranceproceedsstatus :'',
                ApprovalDate: (typeof app.njeda_insuranceproceedsapproveddate === 'string') ? formatDate(new Date(app.njeda_insuranceproceedsapproveddate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_insuranceproceeds, app.njeda_insuranceproceedsamountapproved)
                ),
                PurposeOfFunds: (!!app.njeda_insuranceproceedspurposeoffunds) ? app.njeda_insuranceproceedspurposeoffunds : null,

            },
            // Other
            OtherCovid19Assistance_Other: {
                IsExists: yesNo(bool(app.DOBAffidavit_OtherStateLocal)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.Other,
                ProgramDescription: app.DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions,
                Status: getDobApproval(
                    app.DOBAffidavit_OtherStateLocal, //app.njeda_otherprogramstatus
                    (typeof app.njeda_otherprogramstatus !== 'undefined') ? app.njeda_otherprogramstatus : ''
                ),
                ApprovalDate: //null,
                    (typeof app.njeda_otherprogramapproveddate === 'string') ? formatDate(new Date(app.njeda_otherprogramapproveddate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(
                        app.DOBAffidavit_OtherStateLocal,
                        app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess
                    )
                ),
                PurposeOfFunds: (!!app.DOBAffidavit_OtherStateLocalDetails_Purposes) ? app.DOBAffidavit_OtherStateLocalDetails_Purposes : null,
            },
            // PPE Phase 1
            OtherCovid19Assistance_PPE: {
                IsExists: yesNo(bool(app.njeda_njpersonalppeaccessprogram)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.PPE,  
                ProgramDescription: '',
                Status: (!!app.njeda_njpersonalppeaprogramstatus) ? app.njeda_njpersonalppeaprogramstatus : null,
                ApprovalDate: (typeof app.njeda_njpersonalppeaprogramapproveddate === 'string') ? formatDate(new Date(app.njeda_njpersonalppeaprogramapproveddate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_njpersonalppeaccessprogram, app.njeda_njpersonalppeaprogramapprovedamt)
                ),
                PurposeOfFunds: (!!app.njeda_njpersonalppeaprogramapprovedpurpose) ? app.njeda_njpersonalppeaprogramapprovedpurpose : null,

            },
            // PPE Phase 2
            OtherCovid19Assistance_PPE2: {
                IsExists: yesNo(bool(app.njeda_njedasmbppeaccessprogphase2)),
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.PPE2,  
                ProgramDescription: '',
                Status: (!!app.njeda_njedasmbppeaccessprogphase2status) ? app.njeda_njedasmbppeaccessprogphase2status : null,
                ApprovalDate: (typeof app.njeda_njedasmbppeaccessprogphase2date === 'string') ? formatDate(new Date(app.njeda_njedasmbppeaccessprogphase2date)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_njedasmbppeaccessprogphase2, app.njeda_njedasmbppeaccessprogphase2amount)
                ),
                PurposeOfFunds: (!!app.njeda_njedasmbppeaccessprogphase2purpose) ? app.njeda_njedasmbppeaccessprogphase2purpose : null,

            },
            // SSNJ
            OtherCovid19Assistance_SSNJ: {
                IsExists: yesNo(bool(app.njeda_njedasustainandserve)), 
                PartofUnMetCalculation: "Yes",
                Program: ProgramDescriptions.SSNJ,  
                ProgramDescription: '',
                Status: (!!app.njeda_njedasustainandservestatus) ? app.njeda_njedasustainandservestatus : null,
                ApprovalDate: (typeof app.njeda_njedasustainandserveapproveddate === 'string') ? formatDate(new Date(app.njeda_njedasustainandserveapproveddate)) : null,
                ApprovedAmount: value(
                    getDobAmountValue(app.njeda_njedasustainandserve, app.njeda_njedasustainandserveapprovedamt)
                ),
                PurposeOfFunds: (!!app.njeda_njedasustainandserveapprovedpurpose) ? app.njeda_njedasustainandserveapprovedpurpose : null,

            },
        };

        return olaDatas;
    } catch (e) {
        console.error(chalk.red('DecoratedApplication for the error below:'));
        console.dir(app, { depth: null });
        console.error(
            chalk.red(
                `Error found while generating OLA Datas for application ${app.ApplicationId} (printed above):`
            )
        );
        console.dir(e, { depth: null });

        throw e;
    }
}
