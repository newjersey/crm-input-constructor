import { Application } from '../inputs/applications';
import { Restaurants } from '../inputs/restaurants';

export enum TaxClearanceValues {
  Clear = 'Clear',
  Not_Clear = 'Not Clear',
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

export enum ProductStatuses {
  Ended = '{359B8B3E-65F7-E511-80DE-005056AD31F5}',
  InProgress = '{892EF915-56F7-E511-80DE-005056AD31F5}',
  Closed = '{E86E3F33-65F7-E511-80DE-005056AD31F5}',
  Underwriting = '{A23854FF-59F7-E511-80DE-005056AD31F5}',
}

export enum ProductSubStatuses {
  Ended_Declined = '{19E1E76F-8359-E611-80D3-005056ADEF6F}',
  InProgress_Application = '{0DE1E76F-8359-E611-80D3-005056ADEF6F}',
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

export type Flag = 'Yes' | '';
export type YesNo = 'Yes' | 'No';
export type YesNoNA = 'Yes' | 'No' | 'N/A';
export type NullableNumber = number | null;
export type NullableString = string | null;
export type DecoratedApplication = Application & Restaurants;

export interface QuarterlyWageData {
  fteCount: NullableNumber;
  quarterDesc: NullableString;
}

export interface ValueObject {
  Value: number;
  ExtensionData: null;
}

export type Value = ValueObject | null;

interface Account {
  Name: string;
  DoingBusinessAs: string;
  Email: string;
  Telephone: string;
  WebSiteURL: string;
  YearEstablished: null;
  AnnualRevenue: null;
  TaxClearanceComments: null;
  ACHNonCompliance: '';
  address2Line1: string;
  address2Line2: string;
  address2City: string;
  address2Zip: string;
  address2State: string;
  address2County: '';
  address2Country: '';
  WomanOwned: '';
  VeteranOwned: '';
  MinorityOwned: '';
  DisabilityOwned: '';
  Comment: '';
  SSN: '';
}

interface Project {
  StatusCode: 1;
  ProjectDescription: '';
}

interface Product {
  DevelopmentOfficer: '';
  ServicingOfficerId: null;
  AppReceivedDate: string;
  Amount: Value;
  nol_total_NOL_benefit: null;
  nol_total_RD_benefit: null;
  benefit_allocation_factor: null;
  nol_prior_years_tax_credits_sold: null;
  ProductStatusId: ProductStatuses;
  ProductSubStatusId: ProductSubStatuses;
  ProductTypeId: '{C1DE0936-4436-EB11-A813-001DD8018831}'; // CVSSNJGR
  LocatedInCommercialLocation: '';
  ProductDescription: '';
  lender: '';
  lenderAmount: Value;
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
  jobTitle: string;
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
  upgradeEquipment: Value;
  newEquipment: Value;
  usedEquipment: Value;
  engineerArchitechFees: Value;
  legalFees: null;
  accountingFees: null;
  financeFees: null;
  roadUtilitiesConst: Value;
  debtServiceReserve: null;
  constructionInterest: Value;
  refinancing: Value;
  workingCapital: Value;
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
  totalCost: Value;
  applicationID: string;
  selectedProducts: 'Sustain and Serve NJ';
  ReceivedPreiousFundingFromEDA: '';
  ReceivedPreiousFundingFromOtherthanEDA: '';
  TotalFullTimeEligibleJobs: NullableNumber;
  NJFullTimeJobsAtapplication: NullableNumber;
  PartTimeJobsAtapplication: NullableNumber;
  softCosts: Value;
  relocationCosts: Value;
  securityCosts: Value;
  titleCosts: Value;
  surveyCosts: Value;
  marketAnalysisCosts: Value;
  developmentImpactCosts: Value;
  marketSiteCosts: Value;
  demolitionCosts: null;
  streetscapeCosts: null;
  remediationCosts: Value;
  redemptionPremiumCosts: null;
  installationMachineryCosts: null;
  totalProjectCost: null;
  financeAmtApplied: Value;
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
  congressionalDistrict: null;
  legislativeDistrict: null;
  censusTract: NullableNumber;
  Comments: string;
  EligibleOpportunityZone: null;
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

export interface SSNJRestaurant {
  Name: string;
  DoingBusinessAs: string;
  EIN: string;
  WebSiteURL: string;
  NAICS: string;
  SelfIdentifyAs: string;
  ExistsPriorFeb2020: YesNo;
  FirstName: string;
  LastName: string;
  Title: string;
  Phone: string;
  Cell: string;
  Email: string;
  address1Line1: string;
  address1Line2: string;
  address1City: string;
  address1Zip: string;
  address1State: string;
  address1County: string;
  address2Line1: string;
  address2Line2: string;
  address2City: string;
  address2Zip: string;
  address2State: string;
  address2County: string;
  NegativeImpacts: string;
  ExplainNegativeImpacts: string;
  TotalFTECountfromWR30: number;
  Status: 'In Review';
  Findings: string;
}

type SSNJRestaurants = SSNJRestaurant[];

export interface OlaDatas {
  Account: Account;
  Project: Project;
  Product: Product;
  Underwriting: Underwriting;
  FeeRequest: FeeRequest;
  Location: Location;
  Monitoring: Monitoring;
  SSNJRestaurants: SSNJRestaurants;
}
