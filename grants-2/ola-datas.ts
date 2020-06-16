import { Application } from './applications';
import { Dol } from './dol';
import { Geography } from './geography';
import { GrantPhase1 } from './grant-phase-1';
import { PolicyMap } from './policy-map';
import { Sams } from './sams';
import { Taxation } from './taxation';
import { WR30 } from './wr30';

type Flag = 'Yes' | '';
type SmallBusinessStatus = 'Small Business: Yes' | 'Small Business: No';

interface Amount {
  readonly Value: number;
  readonly ExtensionData: null;
}

interface Account {
  Name: string;
  DoingBusinessAs: 'NA'; // TBD
  Email: string;
  Telephone: string;
  WebSiteURL: string;
  YearEstablished: string;
  AnnualRevenue: null;
  TaxClearanceComments: 'Cleared'; // TBD
  ACHNonCompliance: '';
  address2Line1: '';
  address2Line2: '';
  address2City: '';
  address2Zip: '';
  address2State: '';
  address2County: '';
  address2Country: '';
  WomanOwned: Flag;
  VeteranOwned: Flag;
  MinorityOwned: Flag;
  DisabilityOwned: Flag;
  Comment: SmallBusinessStatus;
  SSN: '123-45-6789'; // TBD
}

interface Project {
  StatusCode: 1; // TBD
  ProjectDescription: string;
}

interface Product {
  DevelopmentOfficer: '';
  ServicingOfficerId: '{B0458690-F377-E911-A974-001DD80081AD}'; // TODO
  AppReceivedDate: '/Date(1585886400000)/'; // TODO
  Amount: Amount;
  nol_total_NOL_benefit: null;
  nol_total_RD_benefit: null;
  benefit_allocation_factor: null;
  nol_prior_years_tax_credits_sold: null;
  ProductStatusId: '{A23854FF-59F7-E511-80DE-005056AD31F5}'; // TODO
  ProductSubStatusId: '{29E1E76F-8359-E611-80D3-005056ADEF6F}'; // TODO
  ProductTypeId: '{BC60E150-ECA0-EA11-A811-001DD8018831}';
  LocatedInCommercialLocation: 'Yes'; // TBD
  ProductDescription: string;
  lender: '';
  lenderAmount: Amount;
  lender_address_1: '';
  lender_address_2: '';
  lender_city: '';
  lender_zipcode: '';
  lender_email: '';
  lender_phone: '';
}

interface Underwriting {
  salutation: 'Mr.'; // TBD
  firstName: string;
  middleName: '';
  lastName: string;
  suffix: '';
  jobTitle: '';
  address1: string;
  address2: string;
  city: string;
  zipcode: string;
  telephone: string;
  telephoneExt: string;
  email: string;
  organizationName: string;
  knownAs: ''; // TBD
  ein: '822977799'; // TBD
  naicsCode: string;
  ownershipStructure: 'Limited Liability Corporation'; // TBD
  applicantBackground: string;
  headquarterState: '';
  headquarterCountry: '';
  landAcquisitions: null;
  newBldgConstruction: null;
  acquisitionExistingBuilding: null;
  existingBldgRvnt: null;
  upgradeEquipment: Amount;
  newEquipment: Amount;
  usedEquipment: Amount;
  engineerArchitechFees: Amount;
  legalFees: null;
  accountingFees: null;
  financeFees: null;
  roadUtilitiesConst: Amount;
  debtServiceReserve: null;
  constructionInterest: Amount;
  refinancing: Amount;
  workingCapital: Amount;
  otherCost1: null;
  otherCost2: null;
  otherCost3: null;
  otherCost1Description: null;
  otherCost2Description: null;
  otherCost3Description: null;
  counselFirmName: '';
  counselFirstName: '';
  counselLastName: '';
  counselStreetAddress1: '';
  counselStreetAddress2: '';
  counselCity: '';
  counselState: '';
  counselZipCode: '';
  counselPhoneNumber: '';
  counselEmailAddress: '';
  accountantFirmName: '';
  accountantFirstName: '';
  accountantLastName: '';
  accountantStreetAddress1: '';
  accountantStreetAddress2: '';
  accountantCity: '';
  accountantState: '';
  accountantZipCode: '';
  accountantPhoneNumber: '';
  accountantEmailAddress: '';
  totalCost: Amount;
  applicationID: string;
  selectedProducts: 'Covid Small Business Emergency Assistance Grant Phase 2';
  ReceivedPreiousFundingFromEDA: 'Not received from EDA'; // TBD
  ReceivedPreiousFundingFromOtherthanEDA: ''; // TBD
  TotalFullTimeEligibleJobs: ''; // TBD
  NJFullTimeJobsAtapplication: number;
  PartTimeJobsAtapplication: number;
  softCosts: Amount;
  relocationCosts: Amount;
  securityCosts: Amount;
  titleCosts: Amount;
  surveyCosts: Amount;
  marketAnalysisCosts: Amount;
  developmentImpactCosts: Amount;
  marketSiteCosts: Amount;
  demolitionCosts: null;
  streetscapeCosts: null;
  remediationCosts: Amount;
  redemptionPremiumCosts: null;
  installationMachineryCosts: null;
  totalProjectCost: null;
  financeAmtApplied: Amount;
}

interface Location {
  isRelocation: null;
  isExpansion: null;
  isStartup: false;
  address1Line1: string;
  address1Line2: string;
  address1City: string;
  address1Zip: string;
  address1State: 'NJ'; // TBD
  address1County: string;
  address1Municipality: string;
  address1Country: '';
  block: '';
  lot: '';
  congressionalDistrict: string;
  legislativeDistrict: string;
  censusTract: string;
  Comments: string;
  EligibleOpportunityZone: 'Yes'; // TODO
}

interface FeeRequest {
  receivedDate: null;
  receivedAmt: null;
  confirmationNum: '';
  productFeeAmount: null;
}

interface Monitoring {
  Status: 'In Planning'; // TODO
  MonitoringType: 'Desk Review'; // TODO
  Findings: string;
  CompletionDate: '/Date(1583125200000)/'; // TODO
  GeneralComments: string;
}

interface Covid19Impacts {
  ApplicationLanguage: 'English'; // TODO
  Grant1applicationID: string;
  ApplicationSequenceID: 'CV19GES123'; // TBD
  OntheSAMSExclusionList: 'Yes'; // TODO
  DeemedAsEssentialBusiness: 'Yes'; // TODO
  RemainOpenMar2020: 'Yes'; // TODO
  CapacityOpen: 'Less than 10%'; // TODO
  ActualRevenue2019: Amount;
  ActualRevenue2020: Amount;
  UseofFunds: 'Business Interruption - Loss of Revenue'; // TODO
  TaxationReportedRevenue: Amount;
  TaxationReportedRevenueYear: '2019'; // TODO
  TaxationSalesTax2019: Amount;
  TaxationSalesTax2020: Amount;
  TaxationReportedTaxFiling: 'Sole Prop/SMLLC'; // TBD
  TaxationReportedSolePropIncome: Amount;
  ReportedRevenueReasonable: 'Yes'; // TODO
  YYRevenueDeclineReasonable: 'Yes'; // TODO
  ReasonablenessExceptions: ''; // TODO
  DOLWR30FilingQuarter: 'Q1 2020'; // TODO
  WR30ReportingComments: 'Applicant did not file a WR-30, therefore eligible for the minimum Grant Award of $1,000'; // TBD
}

interface OtherCovid19Assistance {
  IsExists: 'Yes';
}

interface OtherCovid19AssistanceProgram {
  IsExists: string;
  Program: string;
  Status: 'Approved'; // TODO
  ApprovalDate: '/Date(1583125200000)/' | null; // TODO
  ApprovedAmount: Amount;
  PurposeOfFunds: string;
}

export interface OlaDatas {
  readonly Account: Account;
  readonly Project: Project;
  readonly Product: Product;
  readonly Underwriting: Underwriting;
  readonly FeeRequest: FeeRequest;
  readonly Location: Location;
  readonly Monitoring: Monitoring;
  readonly Covid19Impacts: Covid19Impacts;
  readonly OtherCovid19Assistance: OtherCovid19Assistance;
  readonly OtherCovid19Assistance_PPP: OtherCovid19AssistanceProgram;
  readonly OtherCovid19Assistance_EIDG: OtherCovid19AssistanceProgram;
  readonly OtherCovid19Assistance_EIDL: OtherCovid19AssistanceProgram;
  readonly OtherCovid19Assistance_CVSBLO: OtherCovid19AssistanceProgram;
  readonly OtherCovid19Assistance_CVSBGR: OtherCovid19AssistanceProgram;
  readonly OtherCovid19Assistance_Other: OtherCovid19AssistanceProgram & {
    readonly ProgramDescription: string;
  };
}

export type DecoratedApplication = Application &
  Dol &
  Geography &
  GrantPhase1 &
  PolicyMap &
  Sams &
  Taxation &
  WR30;

export function generateOlaDatas(application: DecoratedApplication): OlaDatas {
  const olaDatas: OlaDatas = {
    Account: {
      Name: 'Covid13Grant2',
      DoingBusinessAs: 'NA',
      Email: 'Covid13Grant2@gmail.com',
      Telephone: '6097867121',
      WebSiteURL: 'https://www.Covid13Grant2.com',
      YearEstablished: application.Business_YearEstablished,
      AnnualRevenue: null,
      TaxClearanceComments: 'Cleared',
      ACHNonCompliance: '',
      address2Line1: '',
      address2Line2: '',
      address2City: '',
      address2Zip: '',
      address2State: '',
      address2County: '',
      address2Country: '',
      WomanOwned: 'Yes',
      VeteranOwned: '',
      MinorityOwned: 'Yes',
      DisabilityOwned: '',
      Comment: 'Small Business: Yes',
      SSN: '123-45-6789',
    },
    Project: {
      StatusCode: 1,
      ProjectDescription: 'Describe negative impacts from COVID-19',
    },
    Product: {
      DevelopmentOfficer: '',
      ServicingOfficerId: '{B0458690-F377-E911-A974-001DD80081AD}',
      AppReceivedDate: '/Date(1585886400000)/',
      Amount: {
        Value: 10000,
        ExtensionData: null,
      },
      nol_total_NOL_benefit: null,
      nol_total_RD_benefit: null,
      benefit_allocation_factor: null,
      nol_prior_years_tax_credits_sold: null,
      ProductStatusId: '{A23854FF-59F7-E511-80DE-005056AD31F5}',
      ProductSubStatusId: '{29E1E76F-8359-E611-80D3-005056ADEF6F}',
      ProductTypeId: '{BC60E150-ECA0-EA11-A811-001DD8018831}', // CVSB2GR
      LocatedInCommercialLocation: 'Yes',
      ProductDescription:
        'Please provide a description of the business, including: the industry that the business falls within, the company background, and a description of the product or service the company offers.',
      lender: '',
      lenderAmount: {
        Value: 0,
        ExtensionData: null,
      },
      lender_address_1: '',
      lender_address_2: '',
      lender_city: '',
      lender_zipcode: '',
      lender_email: '',
      lender_phone: '',
    },
    Underwriting: {
      salutation: 'Mr.',
      firstName: 'Covid13Grant2',
      middleName: '',
      lastName: 'Covid13Grant2',
      suffix: '',
      jobTitle: '',
      address1: '36 West State Street',
      address2: '',
      city: 'Trenton',
      zipcode: '08608',
      telephone: '7322136046',
      telephoneExt: '',
      email: 'Covid13Grant2@eda.com',
      organizationName: 'Covid13Grant2',
      knownAs: '',
      ein: '822977799',
      naicsCode: '423430',
      ownershipStructure: 'Limited Liability Corporation',
      applicantBackground: '',
      headquarterState: '',
      headquarterCountry: '',
      landAcquisitions: null,
      newBldgConstruction: null,
      acquisitionExistingBuilding: null,
      existingBldgRvnt: null,
      upgradeEquipment: {
        Value: 0,
        ExtensionData: null,
      },
      newEquipment: {
        Value: 0,
        ExtensionData: null,
      },
      usedEquipment: {
        Value: 0,
        ExtensionData: null,
      },
      engineerArchitechFees: {
        Value: 0,
        ExtensionData: null,
      },
      legalFees: null,
      accountingFees: null,
      financeFees: null,
      roadUtilitiesConst: {
        Value: 0,
        ExtensionData: null,
      },
      debtServiceReserve: null,
      constructionInterest: {
        Value: 0,
        ExtensionData: null,
      },
      refinancing: {
        Value: 0,
        ExtensionData: null,
      },
      workingCapital: {
        Value: 0,
        ExtensionData: null,
      },
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
      totalCost: {
        Value: 0,
        ExtensionData: null,
      },
      applicationID: 'CV19GES13',
      selectedProducts: 'Covid Small Business Emergency Assistance Grant Phase 2',
      ReceivedPreiousFundingFromEDA: 'Not received from EDA',
      ReceivedPreiousFundingFromOtherthanEDA: '',
      TotalFullTimeEligibleJobs: '',
      NJFullTimeJobsAtapplication: application.Business_W2EmployeesFullTime,
      PartTimeJobsAtapplication: application.Business_W2EmployeesPartTime,
      softCosts: {
        Value: 0,
        ExtensionData: null,
      },
      relocationCosts: {
        Value: 0,
        ExtensionData: null,
      },
      securityCosts: {
        Value: 0,
        ExtensionData: null,
      },
      titleCosts: {
        Value: 0,
        ExtensionData: null,
      },
      surveyCosts: {
        Value: 0,
        ExtensionData: null,
      },
      marketAnalysisCosts: {
        Value: 0,
        ExtensionData: null,
      },
      developmentImpactCosts: {
        Value: 0,
        ExtensionData: null,
      },
      marketSiteCosts: {
        Value: 0,
        ExtensionData: null,
      },
      demolitionCosts: null,
      streetscapeCosts: null,
      remediationCosts: {
        Value: 0,
        ExtensionData: null,
      },
      redemptionPremiumCosts: null,
      installationMachineryCosts: null,
      totalProjectCost: null,
      financeAmtApplied: {
        Value: 0,
        ExtensionData: null,
      },
    },
    Location: {
      isRelocation: null,
      isExpansion: null,
      isStartup: false,
      address1Line1: '36 West State Street',
      address1Line2: '',
      address1City: 'Trenton City',
      address1Zip: '08608',
      address1State: 'NJ',
      address1County: '',
      address1Municipality: '',
      address1Country: '',
      block: '',
      lot: '',
      congressionalDistrict: '',
      legislativeDistrict: '',
      censusTract: '',
      Comments: 'Not Home-Based Business',
      EligibleOpportunityZone: 'Yes',
    },
    FeeRequest: {
      receivedDate: null,
      receivedAmt: null,
      confirmationNum: '',
      productFeeAmount: null,
    },
    Monitoring: {
      Status: 'In Planning',
      MonitoringType: 'Desk Review',
      Findings: 'No Issues from Application',
      CompletionDate: '/Date(1583125200000)/',
      GeneralComments: 'OtherWorkers (1099,seasonal,PEO): 30',
    },
    Covid19Impacts: {
      ApplicationLanguage: 'English',
      Grant1applicationID: 'CV19G1090',
      ApplicationSequenceID: 'CV19GES123',
      OntheSAMSExclusionList: 'Yes',
      DeemedAsEssentialBusiness: 'Yes',
      RemainOpenMar2020: 'Yes',
      CapacityOpen: 'Less than 10%',
      ActualRevenue2019: {
        Value: 150000,
        ExtensionData: null,
      },
      ActualRevenue2020: {
        Value: 95000,
        ExtensionData: null,
      },
      UseofFunds: 'Business Interruption - Loss of Revenue',
      TaxationReportedRevenue: {
        Value: 140000,
        ExtensionData: null,
      },
      TaxationReportedRevenueYear: '2019',
      TaxationSalesTax2019: {
        Value: 130000,
        ExtensionData: null,
      },
      TaxationSalesTax2020: {
        Value: 40000,
        ExtensionData: null,
      },
      TaxationReportedTaxFiling: 'Sole Prop/SMLLC',
      TaxationReportedSolePropIncome: {
        Value: 100000,
        ExtensionData: null,
      },
      ReportedRevenueReasonable: 'Yes',
      YYRevenueDeclineReasonable: 'Yes',
      ReasonablenessExceptions: '',
      DOLWR30FilingQuarter: 'Q1 2020',
      WR30ReportingComments:
        'Applicant did not file a WR-30, therefore eligible for the minimum Grant Award of $1,000',
    },
    OtherCovid19Assistance: {
      IsExists: 'Yes',
    },
    OtherCovid19Assistance_PPP: {
      IsExists: 'Yes',
      Program: 'Small Business Association Paycheck Protection Program (PPP)',
      Status: 'Approved',
      ApprovalDate: '/Date(1583125200000)/',
      ApprovedAmount: {
        Value: 20000,
        ExtensionData: null,
      },
      PurposeOfFunds: 'Inventory; Payroll',
    },
    OtherCovid19Assistance_EIDG: {
      IsExists: 'Yes',
      Program: 'Small Business Association Economic Injury Disaster Grant (EIDG)',
      Status: 'Approved',
      ApprovalDate: '/Date(1583125200000)/',
      ApprovedAmount: {
        Value: 6000,
        ExtensionData: null,
      },
      PurposeOfFunds: 'Inventory; Payroll',
    },
    OtherCovid19Assistance_EIDL: {
      IsExists: 'No',
      Program: 'Small Business Association Economic Injury Disaster Loan (EIDL)',
      Status: 'Approved',
      ApprovalDate: null,
      ApprovedAmount: {
        Value: 0,
        ExtensionData: null,
      },
      PurposeOfFunds: '',
    },
    OtherCovid19Assistance_CVSBLO: {
      IsExists: 'No',
      Program: 'NJEDA Small Business Emergency Loan Assistance',
      Status: 'Approved',
      ApprovalDate: null,
      ApprovedAmount: {
        Value: 0,
        ExtensionData: null,
      },
      PurposeOfFunds: '',
    },
    OtherCovid19Assistance_CVSBGR: {
      IsExists: 'Yes',
      Program: 'NJEDA Small Business Emergency Grant Assistance',
      Status: 'Approved',
      ApprovalDate: null,
      ApprovedAmount: {
        Value: 3000,
        ExtensionData: null,
      },
      PurposeOfFunds: '',
    },
    OtherCovid19Assistance_Other: {
      IsExists: 'Yes',
      Program: 'Other',
      ProgramDescription: 'Chesterfield Municipality',
      Status: 'Approved',
      ApprovalDate: null,
      ApprovedAmount: {
        Value: 3000,
        ExtensionData: null,
      },
      PurposeOfFunds: 'Utilities',
    },
  };

  return olaDatas;
}
