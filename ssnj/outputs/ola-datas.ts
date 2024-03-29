const chalk = require('chalk');

import {
  DecoratedApplication,
  OlaDatas,
  SSNJRestaurant,
  ProductStatuses,
  ProductSubStatuses,
  MonitoringStatuses,
  MonitoringTypes,
  Users,
} from './types';
import { getOwnershipStructure, getFindings, getQuarterlyWageData } from './helpers';
import { formatExcelDate, formatDollarsCents, formatNumber } from '../util';
import { YesNo } from '../inputs/xlsx';

export function generateOlaDatas(app: DecoratedApplication, test: boolean): OlaDatas {
  try {
    const olaDatas: OlaDatas = {
      Account: {
        Name: app.Organization_BusinessName,
        DoingBusinessAs: app.Organization_DoingBusinessAsDBA,
        Email: app.AuthorizedRepresentitive_Email,
        Telephone: app.AuthorizedRepresentitive_Phone,
        WebSiteURL: app.Organization_Website,
        YearEstablished: null,
        AnnualRevenue: null,
        TaxClearanceComments: null,
        ACHNonCompliance: '',
        StateOfIncorporation: app.Organization_StateOfIncorporation_State,
        address2Line1:
          app.OrganizationAddress_MailingAddressSame === YesNo.Yes
            ? app.OrganizationAddress_MailingAddress_Line1
            : '',
        address2Line2:
          app.OrganizationAddress_MailingAddressSame === YesNo.Yes
            ? app.OrganizationAddress_MailingAddress_Line2
            : '',
        address2City:
          app.OrganizationAddress_MailingAddressSame === YesNo.Yes
            ? app.OrganizationAddress_MailingAddress_City
            : '',
        address2Zip:
          app.OrganizationAddress_MailingAddressSame === YesNo.Yes
            ? app.OrganizationAddress_MailingAddress_PostalCode
            : '',
        address2State:
          app.OrganizationAddress_MailingAddressSame === YesNo.Yes
            ? app.OrganizationAddress_MailingAddress_State
            : '',
        address2County: '',
        address2Country: '',
        WomanOwned: '',
        VeteranOwned: '',
        MinorityOwned: '',
        DisabilityOwned: '',
        Comment: '',
        SSN: '',
      },
      Project: {
        StatusCode: 1,
        ProjectDescription: '',
      },
      Product: {
        CopyFilesAndEligiblePRDUFrom: app.Eligibility_ProductNumber,
        DevelopmentOfficer: '',
        ServicingOfficerId: Users.EmilyApple,
        AppReceivedDate: formatExcelDate(app.Entry_DateSubmitted),
        Amount: {
          Value: app.GrantRequest_GrantRequest,
          ExtensionData: null,
        },
        nol_total_NOL_benefit: null,
        nol_total_RD_benefit: null,
        benefit_allocation_factor: null,
        nol_prior_years_tax_credits_sold: null,
        ProductStatusId: ProductStatuses.InProgress,
        ProductSubStatusId: ProductSubStatuses.InProgress_ApplicationSubmitted,
        ProductTypeId: '{C1DE0936-4436-EB11-A813-001DD8018831}',
        LocatedInCommercialLocation: '',
        ProductDescription: '',
        lender: '',
        lenderAmount: null,
        lender_address_1: '',
        lender_address_2: '',
        lender_city: '',
        lender_zipcode: '',
        lender_email: '',
        lender_phone: '',
      },
      Underwriting: {
        salutation: '',
        firstName: app.AuthorizedRepresentitive_ContactName_First,
        middleName: '',
        lastName: app.AuthorizedRepresentitive_ContactName_Last,
        suffix: '',
        jobTitle: app.AuthorizedRepresentitive_Title,
        address1: app.OrganizationAddress_PhysicalAddress_Line1,
        address2: app.OrganizationAddress_PhysicalAddress_Line2,
        city: app.OrganizationAddress_PhysicalAddress_City,
        zipcode: app.OrganizationAddress_PhysicalAddress_PostalCode,
        telephone: app.AuthorizedRepresentitive_Phone.split(' x')[0].replace(/\D/g, ''),
        telephoneExt: app.AuthorizedRepresentitive_Phone.split(' x')[1] || '',
        email: app.AuthorizedRepresentitive_Email,
        organizationName: app.Organization_BusinessName,
        knownAs: app.Organization_DoingBusinessAsDBA,
        ein: app.Eligibility_EIN,
        naicsCode: app.NAICSCode,
        ownershipStructure: getOwnershipStructure(app),
        applicantBackground: '',
        headquarterState: '',
        headquarterCountry: '',
        landAcquisitions: null,
        newBldgConstruction: null,
        acquisitionExistingBuilding: null,
        existingBldgRvnt: null,
        upgradeEquipment: null,
        newEquipment: null,
        usedEquipment: null,
        engineerArchitechFees: null,
        legalFees: null,
        accountingFees: null,
        financeFees: null,
        roadUtilitiesConst: null,
        debtServiceReserve: null,
        constructionInterest: null,
        refinancing: null,
        workingCapital: null,
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
        totalCost: null,
        applicationID: app.ApplicationId,
        selectedProducts: 'Sustain and Serve NJ Phase 2',
        ReceivedPreiousFundingFromEDA: '',
        ReceivedPreiousFundingFromOtherthanEDA: '',
        TotalFullTimeEligibleJobs: null,
        NJFullTimeJobsAtapplication: null,
        PartTimeJobsAtapplication: null,
        softCosts: null,
        relocationCosts: null,
        securityCosts: null,
        titleCosts: null,
        surveyCosts: null,
        marketAnalysisCosts: null,
        developmentImpactCosts: null,
        marketSiteCosts: null,
        demolitionCosts: null,
        streetscapeCosts: null,
        remediationCosts: null,
        redemptionPremiumCosts: null,
        installationMachineryCosts: null,
        totalProjectCost: null,
        financeAmtApplied: null,
      },
      Location: {
        isRelocation: null,
        isExpansion: null,
        isStartup: null,
        address1Line1: app.OrganizationAddress_PhysicalAddress_Line1,
        address1Line2: app.OrganizationAddress_PhysicalAddress_Line2,
        address1City: app.OrganizationAddress_PhysicalAddress_City,
        address1Zip: app.OrganizationAddress_PhysicalAddress_PostalCode,
        address1State: 'NJ',
        address1County: '',
        address1Municipality: '',
        address1Country: '',
        block: '',
        lot: '',
        congressionalDistrict: null,
        legislativeDistrict: null,
        censusTract: null,
        Comments: '',
        EligibleOpportunityZone: null,
      },
      FeeRequest: {
        receivedDate: null,
        receivedAmt: null,
        confirmationNum: '',
        productFeeAmount: null,
      },
      Monitoring: {
        Status: MonitoringStatuses.InPlanning,
        MonitoringType: MonitoringTypes.DeskReview,
        Findings: app.Flags,
        CompletionDate: null,
        GeneralComments: `Proposed meal count: ${formatNumber(
          app.GrantRequest_Meals
        )}. Proposed average cost per meal: ${formatDollarsCents(app.GrantRequest_UnitCost)}`,
      },
      SSNJRestaurants: app.restaurants.map(
        restaurant =>
          ({
            Name: restaurant.RestaurantInformation_RestaurantName,
            DoingBusinessAs: restaurant.RestaurantInformation_DBA,
            EIN: restaurant.RestaurantInformation_EIN,
            WebSiteURL: restaurant.RestaurantInformation_Website,
            NAICS: restaurant.NAICSCode,
            SelfIdentifyAs: restaurant.RestaurantInformation_Designations,
            ExistsPriorFeb2020: restaurant.RestaurantInformation_OldEnough,
            FirstName: restaurant.AuthorizedRepresentative_Name_First,
            LastName: restaurant.AuthorizedRepresentative_Name_Last,
            Title: restaurant.AuthorizedRepresentative_Title,
            Phone: restaurant.AuthorizedRepresentative_Phone,
            Cell: restaurant.AuthorizedRepresentative_AlternatePhone,
            Email: restaurant.AuthorizedRepresentative_Email,
            address1Line1: restaurant.RestaurantInformation_PrimaryBusinessAddress_Line1,
            address1Line2: restaurant.RestaurantInformation_PrimaryBusinessAddress_Line2,
            address1City: restaurant.RestaurantInformation_PrimaryBusinessAddress_City,
            address1Zip: restaurant.RestaurantInformation_PrimaryBusinessAddress_PostalCode,
            address1State: 'NJ',
            address1County: '',
            address2Line1: '',
            address2Line2: '',
            address2City: '',
            address2Zip: '',
            address2State: '',
            address2County: '',
            NegativeImpacts: restaurant.COVID19HarmAttestation_NegativeImpacts,
            ExplainNegativeImpacts: restaurant.COVID19HarmAttestation_Explanation,
            TotalFTECountfromWR30: getQuarterlyWageData(restaurant).fteCount,
            Status: 'In Review',
            Findings: getFindings(restaurant),
          } as SSNJRestaurant)
      ),
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
