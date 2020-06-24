const chalk = require('chalk');

import {
  Decision,
  DecoratedApplication,
  OlaDatas,
  ProgramApprovals,
  ProgramDescriptions,
  SmallBusinessStatuses,
} from './types';
import { bool, formatDate, formatExcelDate } from '../util';
import {
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
  getEligibleOpportunityZoneValue,
  getFindingsString,
  getGrantPhase1Status,
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
  getTaxationSalesTax2019,
  getTaxationSalesTax2020,
  getWr30ReportingComments,
  getYYRevenueDeclineReasonableness,
  value,
  yesNo,
} from './helpers';

import { Designations } from '../inputs/applications';
import { ProductStatuses } from '../inputs/grant-phase-1';
import { awardSize } from './award-size';

export function generateOlaDatas(app: DecoratedApplication): OlaDatas {
  try {
    const olaDatas: OlaDatas = {
      Account: {
        Name: app.ContactInformation_BusinessName,
        DoingBusinessAs: app.ContactInformation_DoingBusinessAsDBA,
        Email: app.ContactInformation_Email,
        Telephone: app.ContactInformation_Phone,
        WebSiteURL: app.ContactInformation_Website,
        YearEstablished: app.Business_YearEstablished,
        AnnualRevenue: null,
        TaxClearanceComments: getTaxClearanceComments(app),
        ACHNonCompliance: '',
        address2Line1: '',
        address2Line2: '',
        address2City: '',
        address2Zip: '',
        address2State: '',
        address2County: '',
        address2Country: '',
        WomanOwned: flag(getDesignation(app, Designations.Woman_Owned)),
        VeteranOwned: flag(getDesignation(app, Designations.Veteran_Owned)),
        MinorityOwned: flag(getDesignation(app, Designations.Minority_Owned)),
        DisabilityOwned: flag(getDesignation(app, Designations.Disabled_Owned)),
        Comment: getDesignation(app, Designations.Small_Business)
          ? SmallBusinessStatuses.Yes
          : SmallBusinessStatuses.No,
        SSN: '',
      },
      Project: {
        StatusCode: 1,
        ProjectDescription: '',
      },
      Product: {
        DevelopmentOfficer: '',
        ServicingOfficerId: getServicingOfficer(app),
        AppReceivedDate: formatExcelDate(app.Entry_DateSubmitted),
        Amount: value(awardSize(app)),
        nol_total_NOL_benefit: null,
        nol_total_RD_benefit: null,
        benefit_allocation_factor: null,
        nol_prior_years_tax_credits_sold: null,
        ProductStatusId: getProductStatusId(app),
        ProductSubStatusId: getProductSubStatusId(app),
        ProductTypeId: '{BC60E150-ECA0-EA11-A811-001DD8018831}', // CVSB2GR
        LocatedInCommercialLocation: '',
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
        ownershipStructure: getOwnershipStructure(app),
        applicantBackground: getApplicantBackground(app),
        headquarterState: '',
        headquarterCountry: '',
        landAcquisitions: null,
        newBldgConstruction: null,
        acquisitionExistingBuilding: null,
        existingBldgRvnt: null,
        upgradeEquipment: value(),
        newEquipment: value(),
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
        selectedProducts: 'Covid Small Business Emergency Assistance Grant Phase 2',
        ReceivedPreiousFundingFromEDA: '',
        ReceivedPreiousFundingFromOtherthanEDA: '',
        TotalFullTimeEligibleJobs: getQuarterlyWageData(app).fteCount,
        NJFullTimeJobsAtapplication: app.Business_W2EmployeesFullTime,
        PartTimeJobsAtapplication: app.Business_W2EmployeesPartTime,
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
        totalProjectCost: null,
        financeAmtApplied: value(),
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
        censusTract: app.policyMap?.censusTract || null,
        Comments: `Home-Based Business: ${
          bool(app.BusinessDetails_HomeBasedBusiness) ? 'Yes' : 'No'
        }`,
        EligibleOpportunityZone: getEligibleOpportunityZoneValue(app),
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
        CompletionDate: getDecision(app) === Decision.Review ? null : formatDate(new Date()),
        GeneralComments: `Other Workers (1099, seasonal, PEO): ${app.Business_Contractors}`,
      },
      Covid19Impacts: {
        ApplicationLanguage: app.Language,
        Grant1applicationID: app.grantPhase1?.['OLA Application ID '] || null,
        ApplicationSequenceID: app.Sequence,
        OntheSAMSExclusionList: yesNo(app.sams.possibleMatches.length > 0),
        DeemedAsEssentialBusiness: yesNo(bool(app.COVID19Impact_EssentialBusiness)),
        RemainOpenMar2020: yesNo(bool(app.COVID19Impact_OpenOrReopened)),
        CapacityOpen: getCapacityOpen(app),
        ActualRevenue2019: value(cappedMarchAprilMay2019Revenue(app)),
        ActualRevenue2020: value(app.RevenueComparison_MarchAprilMay2020),
        UseofFunds: 'Business Interruption - Loss of Revenue',
        TaxationReportedRevenue: value(getTaxationReportedRevenue(app)),
        TaxationReportedRevenueYear: getTaxationReportedTaxFilingAndYear(app).year,
        TaxationSalesTax2019: value(getTaxationSalesTax2019(app)),
        TaxationSalesTax2020: value(getTaxationSalesTax2020(app)),
        TaxationReportedTaxFiling: getTaxationReportedTaxFilingAndYear(app).type,
        TaxationReportedSolePropIncome: value(getTaxationReportedNetIncomeLoss(app)),
        ReportedRevenueReasonable: getReportedRevenueReasonableness(app),
        YYRevenueDeclineReasonable: getYYRevenueDeclineReasonableness(app),
        ReasonablenessExceptions: getReasonablenessExceptions(app),
        DOLWR30FilingQuarter: getQuarterlyWageData(app).quarterDesc,
        WR30ReportingComments: getWr30ReportingComments(app),
      },
      OtherCovid19Assistance: {
        IsExists: yesNo(
          bool(app.DOBAffidavit_SBAPPP) ||
            bool(app.DOBAffidavit_SBAEIDG) ||
            bool(app.DOBAffidavit_SBAEIDL) ||
            !!app.nonDeclinedEdaLoan ||
            !!app.grantPhase1 ||
            bool(app.DOBAffidavit_OtherStateLocal)
        ),
      },
      OtherCovid19Assistance_PPP: {
        IsExists: yesNo(bool(app.DOBAffidavit_SBAPPP)),
        PartofUnMetCalculation: yesNo(true),
        Program: ProgramDescriptions.PPP,
        ProgramDescription: null,
        Status: getDobApproval(
          app.DOBAffidavit_SBAPPP,
          app.DOBAffidavit_SBAPPPDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_SBAPPP,
          app.DOBAffidavit_SBAPPPDetails_Status_Value,
          app.DOBAffidavit_SBAPPPDetails_ApprovalDate
        ),
        ApprovedAmount: value(
          getDobAmountValue(app.DOBAffidavit_SBAPPP, app.DOBAffidavit_SBAPPPDetails_Amount)
        ),
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_SBAPPP,
          app.DOBAffidavit_SBAPPPDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_EIDG: {
        IsExists: yesNo(bool(app.DOBAffidavit_SBAEIDG)),
        PartofUnMetCalculation: yesNo(true),
        Program: ProgramDescriptions.EIDG,
        ProgramDescription: null,
        Status: getDobApproval(
          app.DOBAffidavit_SBAEIDG,
          app.DOBAffidavit_SBAEIDGDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_SBAEIDG,
          app.DOBAffidavit_SBAEIDGDetails_Status_Value,
          app.DOBAffidavit_SBAEIDGDetails_ApprovalDate
        ),
        ApprovedAmount: value(
          getDobAmountValue(app.DOBAffidavit_SBAEIDG, app.DOBAffidavit_SBAEIDGDetails_Amount)
        ),
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_SBAEIDG,
          app.DOBAffidavit_SBAEIDGDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_EIDL: {
        IsExists: yesNo(bool(app.DOBAffidavit_SBAEIDL)),
        PartofUnMetCalculation: yesNo(false),
        Program: ProgramDescriptions.EIDL,
        ProgramDescription: null,
        Status: getDobApproval(
          app.DOBAffidavit_SBAEIDL,
          app.DOBAffidavit_SBAEIDLDetails_Status_Value
        ),
        ApprovalDate: getDobApprovalDate(
          app.DOBAffidavit_SBAEIDL,
          app.DOBAffidavit_SBAEIDLDetails_Status_Value,
          app.DOBAffidavit_SBAEIDLDetails_ApprovalDate
        ),
        ApprovedAmount: value(
          getDobAmountValue(app.DOBAffidavit_SBAEIDL, app.DOBAffidavit_SBAEIDLDetails_Amount)
        ),
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_SBAEIDL,
          app.DOBAffidavit_SBAEIDLDetails_Purposes_Value
        ),
      },
      OtherCovid19Assistance_CVSBLO: {
        IsExists: yesNo(!!app.nonDeclinedEdaLoan),
        PartofUnMetCalculation: yesNo(true),
        Program: ProgramDescriptions.CVSBLO,
        ProgramDescription: `OLA Application ID: ${app.nonDeclinedEdaLoan?.['OLA Application ID (Underwriting) (Underwriting)']}`,
        Status:
          typeof app.nonDeclinedEdaLoan?.['Approval Date'] === 'undefined'
            ? ProgramApprovals.In_Process
            : ProgramApprovals.Approved,
        ApprovalDate:
          typeof app.nonDeclinedEdaLoan?.['Approval Date'] === 'undefined'
            ? null
            : formatExcelDate(app.nonDeclinedEdaLoan['Approval Date']),
        ApprovedAmount: value(app.nonDeclinedEdaLoan?.Amount),
        PurposeOfFunds: null,
      },
      OtherCovid19Assistance_CVSBGR: {
        IsExists: yesNo(!!app.grantPhase1),
        PartofUnMetCalculation: yesNo(
          app.grantPhase1?.['Product Status'] !== ProductStatuses.Ended
        ),
        Program: ProgramDescriptions.CVSBGR,
        ProgramDescription: `OLA Application ID: ${app.grantPhase1?.['OLA Application ID ']}`,
        Status: getGrantPhase1Status(app),
        ApprovalDate:
          typeof app.grantPhase1?.['Approval Date'] === 'undefined'
            ? null
            : formatExcelDate(app.grantPhase1['Approval Date']),
        ApprovedAmount: value(app.grantPhase1?.Amount),
        PurposeOfFunds: null,
      },
      OtherCovid19Assistance_Other: {
        IsExists: yesNo(bool(app.DOBAffidavit_OtherStateLocal)),
        PartofUnMetCalculation: yesNo(true),
        Program: ProgramDescriptions.Other,
        ProgramDescription: app.DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions,
        Status: null,
        ApprovalDate: null,
        ApprovedAmount: value(
          getDobAmountValue(
            app.DOBAffidavit_OtherStateLocal,
            app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess
          )
        ),
        PurposeOfFunds: getDobPurposes(
          app.DOBAffidavit_OtherStateLocal,
          app.DOBAffidavit_OtherStateLocalDetails_Purposes_Value
        ),
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
