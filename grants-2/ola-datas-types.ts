import { Application } from './applications';
import { Dol } from './dol';
import { Duplicates } from './duplicates';
import { Geography } from './geography';
import { GrantPhase1 } from './grant-phase-1';
import { PolicyMap } from './policy-map';
import { Sams } from './sams';
import { Taxation } from './taxation';
import { WR30 } from './wr30';

export enum Decision {
  Approve = 'Approve',
  Review = 'Review',
  Decline = 'Decline',
}

export enum SmallBusinessStatuses {
  Yes = 'Small Business: Yes',
  No = 'Small Business: No',
}

export enum TaxClearanceValues {
  Clear = 'Clear',
  Not_Clear = 'Not Clear',
  Not_Found = 'Not Found',
}

export enum EligibleOpportunityZoneValues {
  Yes = 'Yes',
  No = 'No',
  Not_Found = 'Not Found',
}

export enum OwnershipStructures {
  SoleProprietorship = 'Sole Proprietorship',
  Partnership = 'Partnership',
  C_Corporation = 'C Corporation',
  S_Corporation = 'S Corporation',
  LLC = 'Limited Liability Corporation',
  Nonprofit = 'Not For Profit',
  Other = 'Other',
}

export enum TaxationReportedTaxFilingValues {
  Sole_Prop_SMLLC = 'Sole Prop/SMLLC',
  Partnership = 'Partnership',
  CBT = 'CBT',
  None = 'None',
}

export enum WR30ReportingComments {
  WR30_Found = '',
  WR30_Not_Found = 'Applicant did not file a WR-30, therefore eligible for the minimum Grant Award of $1,000',
}

export enum RemainOpenCapacities {
  'Less than 10%' = 'Less than 10%',
  '25%' = '25%',
  '50%' = '50%',
  '75%' = '75%',
  '100%' = '100%',
}

export enum ProgramApprovals {
  Approved = 'Approved',
  In_Process = 'In Process',
  Declined = 'Declined',
}

export enum PurposesOfFunds {
  Inventory = 'Inventory',
  Payroll = 'Payroll',
  Rent_Mortgage = 'Rent/Mortgage',
  Utilities = 'Utilities',
  Other = 'Other',
}

export enum ProgramDescriptions {
  PPP = 'Small Business Association Paycheck Protection Program (PPP)',
  EIDG = 'Small Business Association Economic Injury Disaster Grant (EIDG)',
  EIDL = 'Small Business Association Economic Injury Disaster Loan (EIDL)',
  CVSBLO = 'NJEDA Small Business Emergency Loan Assistance',
  CVSBGR = 'NJEDA Small Business Emergency Grant Assistance',
  Other = 'Other',
}

export enum ServicingOfficersEN {
  Alan_Finkelstein = '{B59042A9-D571-EA11-A811-001DD8018943}',
  Cynthia_Goyes = '{DD23D309-E8F0-E911-A994-001DD800951B}',
  David_Guarini = '{2EC826BD-D871-EA11-A811-001DD8018943}',
  Fatou_Jobe = '{443765DC-9FD4-E911-A985-001DD800BA25}',
  John_Costello = '{B0458690-F377-E911-A974-001DD80081AD}',
  John_Stewart = '{EA13FBBD-F6A0-EA11-A811-001DD8018230}',
  Laura_Diaz = '{A5D4CAEE-8143-EA11-A999-001DD8009F4B}',
  Maggie_Peters = '{82F86EA9-2F6E-E711-8110-1458D04ECE60}',
  Meera_Kumar = '{E77DB0AB-1115-EA11-A991-001DD800A749}',
  Michael_Candella = '{006A7AEE-3B9C-E911-A97C-001DD800951B}',
  Pamela_McGrew = '{03F90D62-DA71-EA11-A811-001DD8018943}',
  Ricardo_Hernandez = '{9176B59B-DB71-EA11-A811-001DD8018943}',
  Yoletta_Duthil = '{3E7536E2-DD71-EA11-A811-001DD8018943}',
}

export enum ServicingOfficersES {
  Cynthia_Goyes = '{DD23D309-E8F0-E911-A994-001DD800951B}',
  Ricardo_Hernandez = '{9176B59B-DB71-EA11-A811-001DD8018943}',
  Laura_Diaz = '{A5D4CAEE-8143-EA11-A999-001DD8009F4B}',
}

export enum ServicingOfficersExternal {
  Richard_Toro = '{834023BA-3ED6-E811-811B-1458D04E2F10}',
}

/*
// prettier-ignore
export enum ServicingOfficersEN { BRUCE_TEST = '{FB3F23BA-3ED6-E811-811B-1458D04E2F10}' }
// prettier-ignore
export enum ServicingOfficersES { BRUCE_TEST = '{FB3F23BA-3ED6-E811-811B-1458D04E2F10}' }
 */

export enum ProductStatuses {
  Ended = '{359B8B3E-65F7-E511-80DE-005056AD31F5}',
  InProgress = '{892EF915-56F7-E511-80DE-005056AD31F5}',
  Closed = '{E86E3F33-65F7-E511-80DE-005056AD31F5}',
  Underwriting = '{A23854FF-59F7-E511-80DE-005056AD31F5}',
}

export enum ProductSubStatuses {
  Ended_Declined = '{19E1E76F-8359-E611-80D3-005056ADEF6F}',
  InProgress_ApplicationSubmitted = '{6261A645-D875-E611-80D5-005056ADEF6F}',
  InProgress_ApplicationEDAReview = '{16C93E7F-D875-E611-80D5-005056ADEF6F}',
  InProgress_ApplicationCompanyRevision = '{9D94196B-D875-E611-80D5-005056ADEF6F}',
  Closed_ComplianceMonitoring = '{17E1E76F-8359-E611-80D3-005056ADEF6F}',
  Closed_NonCompliance = '{2BE1E76F-8359-E611-80D3-005056ADEF6F}',
  Underwriting_ApprovalsinProcess = '{0FE1E76F-8359-E611-80D3-005056ADEF6F}',
  Underwriting_IncompleteApplicationUWinProgress = '{29E1E76F-8359-E611-80D3-005056ADEF6F}',
}

export enum MonitoringStatuses {
  Completed = 'Completed',
  InPlanning = 'In Planning',
  Findings = 'Findings',
}

export enum MonitoringTypes {
  External = 'External',
  DeskReview = 'Desk Review',
}

export enum RevenueYears {
  _2018 = '2018',
  _2019 = '2019',
}

export type Flag = 'Yes' | '';
export type YesNo = 'Yes' | 'No';
export type YesNoNA = 'Yes' | 'No' | 'NA';
export type NullableNumber = number | null;
export type NullableString = string | null;
export type QuarterlyWageData = [NullableNumber, NullableString];
export type ServicingOfficer = ServicingOfficersEN | ServicingOfficersES | ServicingOfficersExternal;
export type TaxationReportedRevenueYear = RevenueYears | null;
export type TaxationTuple = [TaxationReportedTaxFilingValues, TaxationReportedRevenueYear];
// TODO: clean up any nullable into consolidated types (rather than writing "| null" in multiple places referencing the same type)
export type CapacityOpen = RemainOpenCapacities | null;
export type DecoratedApplication = Application &
  Dol &
  Duplicates &
  Geography &
  GrantPhase1 &
  PolicyMap &
  Sams &
  Taxation &
  WR30;

export interface Finding {
  message: string;
  name: string,
  severity: Decision;
}

export interface FindingDef {
  trigger(application: DecoratedApplication): boolean;
  messageGenerator(application: DecoratedApplication): string;
  name: string,
  severity: Decision;
}

interface Amount {
  Value: NullableNumber;
  ExtensionData: null;
}

interface Account {
  Name: string;
  DoingBusinessAs: string;
  Email: string;
  Telephone: string;
  WebSiteURL: string;
  YearEstablished: string;
  AnnualRevenue: null;
  TaxClearanceComments: TaxClearanceValues;
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
  Comment: SmallBusinessStatuses;
  SSN: '';
}

interface Project {
  StatusCode: 1;
  ProjectDescription: '';
}

interface Product {
  DevelopmentOfficer: '';
  ServicingOfficerId: ServicingOfficer;
  AppReceivedDate: string;
  Amount: Amount;
  nol_total_NOL_benefit: null;
  nol_total_RD_benefit: null;
  benefit_allocation_factor: null;
  nol_prior_years_tax_credits_sold: null;
  ProductStatusId: ProductStatuses;
  ProductSubStatusId: ProductSubStatuses;
  ProductTypeId: '{BC60E150-ECA0-EA11-A811-001DD8018831}'; // CVSB2GR
  LocatedInCommercialLocation: '';
  ProductDescription: '';
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
  salutation: '';
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
  knownAs: string;
  ein: string;
  naicsCode: string;
  ownershipStructure: OwnershipStructures;
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
  ReceivedPreiousFundingFromEDA: '';
  ReceivedPreiousFundingFromOtherthanEDA: '';
  TotalFullTimeEligibleJobs: NullableNumber;
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
  isStartup: null;
  address1Line1: string;
  address1Line2: string;
  address1City: string;
  address1Zip: string;
  address1State: 'NJ';
  address1County: string;
  address1Municipality: string;
  address1Country: '';
  block: '';
  lot: '';
  congressionalDistrict: string;
  legislativeDistrict: string;
  censusTract: NullableNumber;
  Comments: string;
  EligibleOpportunityZone: EligibleOpportunityZoneValues;
}

interface FeeRequest {
  receivedDate: null;
  receivedAmt: null;
  confirmationNum: '';
  productFeeAmount: null;
}

interface Monitoring {
  Status: MonitoringStatuses;
  MonitoringType: MonitoringTypes;
  Findings: NullableString;
  CompletionDate: NullableString;
  GeneralComments: string;
}

interface Covid19Impacts {
  ApplicationLanguage: string;
  Grant1applicationID: NullableString;
  ApplicationSequenceID: number;
  OntheSAMSExclusionList: YesNo;
  DeemedAsEssentialBusiness: YesNo;
  RemainOpenMar2020: YesNo;
  CapacityOpen: CapacityOpen;
  ActualRevenue2019: Amount;
  ActualRevenue2020: Amount;
  UseofFunds: 'Business Interruption - Loss of Revenue';
  TaxationReportedRevenue: Amount;
  TaxationReportedRevenueYear: TaxationReportedRevenueYear;
  TaxationSalesTax2019: Amount;
  TaxationSalesTax2020: Amount;
  TaxationReportedTaxFiling: TaxationReportedTaxFilingValues;
  TaxationReportedSolePropIncome: Amount;
  ReportedRevenueReasonable: YesNoNA;
  YYRevenueDeclineReasonable: YesNoNA;
  ReasonablenessExceptions: '';
  DOLWR30FilingQuarter: NullableString;
  WR30ReportingComments: WR30ReportingComments;
}

interface OtherCovid19Assistance {
  IsExists: YesNo;
}

interface OtherCovid19AssistanceProgram {
  IsExists: YesNo;
  Status: ProgramApprovals | null;
  ApprovalDate: NullableString;
  ApprovedAmount: Amount;
  PurposeOfFunds: NullableString;
}

export interface OlaDatas {
  Account: Account;
  Project: Project;
  Product: Product;
  Underwriting: Underwriting;
  FeeRequest: FeeRequest;
  Location: Location;
  Monitoring: Monitoring;
  Covid19Impacts: Covid19Impacts;
  OtherCovid19Assistance: OtherCovid19Assistance;
  OtherCovid19Assistance_PPP: OtherCovid19AssistanceProgram & {
    Program: ProgramDescriptions.PPP;
  };
  OtherCovid19Assistance_EIDG: OtherCovid19AssistanceProgram & {
    Program: ProgramDescriptions.EIDG;
  };
  OtherCovid19Assistance_EIDL: OtherCovid19AssistanceProgram & {
    Program: ProgramDescriptions.EIDL;
  };
  OtherCovid19Assistance_CVSBLO: OtherCovid19AssistanceProgram & {
    Program: ProgramDescriptions.CVSBLO;
  };
  OtherCovid19Assistance_CVSBGR: OtherCovid19AssistanceProgram & {
    Program: ProgramDescriptions.CVSBGR;
  };
  OtherCovid19Assistance_Other: OtherCovid19AssistanceProgram & {
    Program: ProgramDescriptions.Other;
    ProgramDescription: string;
  };
}
