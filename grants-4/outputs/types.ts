import { Application } from '../inputs/applications';
import { Dol } from '../inputs/dol';
import { Duplicates } from '../inputs/duplicates';
import { Geography } from '../inputs/geography';
import { GrantPhase1 } from '../inputs/grant-phase-1';
import { NonDeclinedEdaLoan } from '../inputs/non-declined-loans';
import { PolicyMap } from '../inputs/policy-map';
import { Sams } from '../inputs/sams';
import { Taxation } from '../inputs/taxation';
import { WR30 } from '../inputs/wr30';
import { ABC } from '../inputs/ABC';
import { ReviewNeeded } from '../inputs/review-needed';
import { ChildCare } from '../inputs/child-care';
import { EDAHoldList } from '../inputs/eda-hold-list';
import { DOLNOEIN } from '../inputs/dol-noein';
import { DOBValidation } from '../inputs/dobvalidate';
import { DOBValidateNoEIN } from '../inputs/dobvalidate-noein';
import { DuplicateEIN } from '../inputs/duplicateEIN';
import { DuplicateAddress } from '../inputs/duplicateAddress';

export enum Decision {
    Approve = 'Approve',
    Review = 'Review',
    Decline = 'Decline',
    LegalReview = 'LegalReview',
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
    Government_Body = 'Government Body',
    Limited_Partnership = 'Limited Partnership',
    General_Partnership = 'General Partnership',
    Other = 'Other',
}

export enum TaxationReportedTaxFilingValues {
    Sole_Prop_SMLLC = 'Sole Prop/SMLLC',
    Partnership = 'Partnership',
    CBT = 'CBT',
    None = 'None',
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
    PPP2 = 'Small Business Association Paycheck Protection Program (PPP) Phase 2',
    EIDG = 'Small Business Association Economic Injury Disaster Grant (EIDG)',
    EIDL = 'Small Business Association Economic Injury Disaster Loan (EIDL)',
    CVSBLO = 'NJEDA Small Business Emergency Loan Assistance',
    CVSBGR = 'NJEDA Small Business Emergency Grant Assistance',
    CVSB2GR = 'NJEDA Small Business Emergency Grant Assistance Phase 2',
    CVSB3GR = 'NJEDA Small Business Emergency Grant Assistance Phase 3',
    CARES = 'CARES Act Funding From Local County',
    NJHousing = 'New Jersey Housing and Mortgage Finance Covid-19 Landlord Grant',
    NJRedevelopment = 'New Jersey Redevelopment Authority Small Business Lease Emergency Assistance Grant Program',
    NJRedevelopment2 = 'New Jersey Redevelopment Authority Small Business Lease Emergency Assistance Grant Program Phase 2',
    Insurance = 'Insurance Proceeds',
    Other = 'Other',
    PPE = 'NJEDA Personal Protective Equipment (PPE) Access Program Phase 1',
    PPE2 = 'NJEDA Personal Protective Equipment (PPE) Access Program Phase 2',
    SSNJ = 'NJEDA Sustain and Serve'
}

export enum DOBPrograms {
    NJEDAPhase1 = "NJEDA Phase 1",
    NJEDAPhase2 = "NJEDA Phase 2",
    NJEDAPhase3 = "NJEDA Phase 3",
    NJRAPhase1 = "NJRA Phase 1",
    NJRAPhase2 = "NJRA Phase 2",
    HMFAGrant = "HMFA Grant",
    NJEDASSNJ = "NJEDA SSNJ",
    NJEDAPPE = "NJEDA PPE",
    PPP = "SBA PPP",
    DHS = "DHS",
    DCA = "DCA",
    Arts = "Arts"
}

export enum ServicingOfficersEN {
    Steven_Bushar = '{AB7A919C-E612-EB11-A813-001DD801DF87}',
    Daniela_Perez = '{00EEEAB0-45A4-EB11-B1AC-001DD801FC84}',
    //Christina_Dennis = '{29022887-4AA4-EB11-B1AC-001DD801FC84}',
    Raiya_Jones = '{5D9B6812-49A4-EB11-B1AC-001DD801FC84}',
    Dhruv_Parekh = '{DB7E4D44-6BB2-EA11-A812-001DD8018943}',
    Susan_Gluchanicz = '{A24B5144-BE17-EB11-A813-001DD801DF87}',
    Marshay_Monet = '{D917E2B3-4DA4-EB11-B1AC-001DD801FC84}',
    Gina_Delia = '{14CE99C2-C117-EB11-A813-001DD801DF87}',
    Cezary_Lukawski = '{09AF1D40-EE12-EB11-A813-001DD801DF87}',
    //Nicholas_Pezzolla = '{9BC855B4-50A4-EB11-B1AC-001DD801FC84}',
    Yaritza_Lopez = '{C491EDF2-51A4-EB11-B1AC-001DD801FC84}',
    Elayna_Alexander = '{B4180BCE-4912-EB11-A813-001DD801DF87}',
    Dominique_Salmon = '{FDC6A4BC-4012-EB11-A813-001DD801DF87}',
    Tawana_Martin = '{FC5F1E9D-4CA4-EB11-B1AC-001DD801FC84}',
    David_Guarini = '{2EC826BD-D871-EA11-A811-001DD8018943}',
    Pamela_McGrew = '{03F90D62-DA71-EA11-A811-001DD8018943}',
    Ricardo_Hernandez = '{9176B59B-DB71-EA11-A811-001DD8018943}',
    Yoletta_Duthil = '{3E7536E2-DD71-EA11-A811-001DD8018943}',
    //Joseph_McCall = '{1AAB7A9A-7B20-EB11-A813-001DD8018943}',
    Gabriel_Calandri = '{AF791530-70B2-EA11-A812-001DD8018943}',
    Alejandro_Rodriguez = '{B6DE34EA-CEB7-EA11-A812-001DD8018943}',
    Jorge_Palacious = '{7B078F61-F7B4-EB11-8236-001DD802CA2E}',
    Tammy_Sanchez = '{EDAE6340-F5B4-EB11-8236-001DD802CA2E}',
    Jacqueline_Mullings = '{234023BA-3ED6-E811-811B-1458D04E2F10}',
    Daniel_Wilkie = '{15FF6203-7FCF-EB11-BACF-001DD801CCC6}',
    Karen_McGarrigle = '{C47E7740-8CCF-EB11-BACF-001DD801C05C}',
    Laura_Diaz = '{A5D4CAEE-8143-EA11-A999-001DD8009F4B}',
    Malika_ka_Ashley = '{1D456EAB-8DCF-EB11-BACF-001DD801C05C}',
    Naimah_Marshall = '{AC7558BC-87CF-EB11-BACF-001DD801C05C}',
    Sandra_Foresta = '{CE61DD63-25E3-EB11-BACB-001DD802D3C0}',
    Taylor_Lee = '{3A6162EF-82CF-EB11-BACF-001DD801CCC6}'
}

export enum ServicingOfficersES {
    Cynthia_Goyes = '{DD23D309-E8F0-E911-A994-001DD800951B}',
    Ricardo_Hernandez = '{9176B59B-DB71-EA11-A811-001DD8018943}',
    Laura_Diaz = '{A5D4CAEE-8143-EA11-A999-001DD8009F4B}',
}

export enum ServicingOfficersExternal {
    Richard_Toro = '{834023BA-3ED6-E811-811B-1458D04E2F10}',
}

// TEST values:
export enum TEST_ServicingOfficersEN {
    BRUCE_TEST = '{FB3F23BA-3ED6-E811-811B-1458D04E2F10}',
}
export enum TEST_ServicingOfficersES {
    BRUCE_TEST = '{FB3F23BA-3ED6-E811-811B-1458D04E2F10}',
}
export enum TEST_ServicingOfficersExternal {
    Richard_Toro = '{FB3F23BA-3ED6-E811-811B-1458D04E2F10}',
}

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
    InProgress = 'In Progress',
    Findings = 'Findings',
}

export enum MonitoringTypes {
    External = 'External',
    DeskReview = 'Desk Review',
    Resolution = 'Resolution',
    NewProductReview = 'New Product Review',
}

export enum RevenueYears {
    _2018 = '2018',
    _2019 = '2019',
}

export type Flag = 'Yes' | '';
export type YesNo = 'Yes' | 'No';
export type YesNoNA = 'Yes' | 'No' | 'N/A';
export type NullableNumber = number | null;
export type NullableString = string | null;
export type ServicingOfficer =
    | ServicingOfficersEN
    | ServicingOfficersES
    | ServicingOfficersExternal
    | TEST_ServicingOfficersEN
    | TEST_ServicingOfficersES
    | TEST_ServicingOfficersExternal;
export type TaxationReportedRevenueYear = RevenueYears | null;
export type CapacityOpen = RemainOpenCapacities | null;
export type DecoratedApplication = Application &
    Dol &
    Duplicates &
    Taxation &
    Sams &
    WR30 &
    ABC &
    ChildCare &
    EDAHoldList &
    DOLNOEIN &
    DOBValidation &
    DOBValidateNoEIN &
    DuplicateEIN &
    DuplicateAddress;

export interface QuarterlyWageData {
    fteCount: NullableNumber;
    quarterDesc: NullableString;
}

export interface TaxationFiling {
    type: TaxationReportedTaxFilingValues;
    year: TaxationReportedRevenueYear;
}

export interface Finding {
    message: string;
    publicMessage?: string;
    name: string;
    severity: Decision;
    slug?: string;
}

export interface Finding_Decline {
    publicMessage: string;
    severity: Decision.Decline;
    slug: string;
}

export interface Finding_Review {
    severity: Decision.Review;
    slug: string;
}

interface FindingDef_Base {
    trigger(application: DecoratedApplication): boolean;
    messageGenerator(application: DecoratedApplication): string;
    name: string;
    severity: Decision;
}

interface FindingDef_Decline extends FindingDef_Base {
    publicMessageGenerator(application: DecoratedApplication): string;
    severity: Decision.Decline;
    slug: string;
}

interface FindingDef_Review extends FindingDef_Base {
    severity: Decision.Review;
    slug: string | null; // null means don't include in reviewObjects
}

interface FindingDef_LegalReview extends FindingDef_Base {
    severity: Decision.LegalReview;
    slug: string | null; // null means don't include in reviewObjects
}

export type FindingDef = FindingDef_Decline | FindingDef_Review | FindingDef_LegalReview;

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
    YearEstablished: string;
    AnnualRevenue: Value;
    TaxClearanceComments: TaxClearanceValues;
    ACHNonCompliance: '';
    address2Line1: string;
    address2Line2: string;
    address2City: string;
    address2Zip: string;
    address2State: string;
    address2County: string;
    address2Country: '';
    WomanOwned: Flag;
    VeteranOwned: Flag;
    MinorityOwned: Flag;
    Ethnicity: string;
    DisabilityOwned: Flag;
    Comment: '';
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
    Amount: Value;
    nol_total_NOL_benefit: null;
    nol_total_RD_benefit: null;
    benefit_allocation_factor: null;
    nol_prior_years_tax_credits_sold: null;
    ProductStatusId: ProductStatuses;
    ProductSubStatusId: ProductSubStatuses;
    ProductTypeId: '{90BEB932-958D-EB11-A812-001DD8016288}',  //CVSB4GR
    LocatedInCommercialLocation: string;
    ProductDescription: string;
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
    otherCost1: Value;
    otherCost2: Value;
    otherCost3: Value;
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
    selectedProducts: 'Covid Small Business Emergency Assistance Grant Phase 4';
    //MOLAGUID: string;
    ReceivedPreiousFundingFromEDA: string;
    ReceivedPreiousFundingFromOtherthanEDA: '';
    TotalFullTimeEligibleJobs: number | null;  //NullableNumber;
    NJFullTimeJobsAtapplication: number;
    PartTimeJobsAtapplication: number;
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
    totalProjectCost: Value;
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
    //address1County: string;
    //address1Municipality: string;
    address1Country: '';
    block: '';
    lot: '';
    //congressionalDistrict: string;
    //legislativeDistrict: string;
    censusTract: string; //NullableNumber;
    Comments: string;
    EligibleOpportunityZone: YesNoNA;   //EligibleOpportunityZoneValues;
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
    ApplicationSequenceID: string;
    OntheSAMSExclusionList: YesNo;
    DeemedAsEssentialBusiness: YesNoNA;
    RemainOpenMar2020: YesNoNA;
    CapacityOpen: string;
    ActualRevenue2019: Value;
    ActualRevenue2020: Value;
    UseofFunds: string; //'Business Interruption - Loss of Revenue';
    TaxationReportedRevenue: Value;
    TaxationReportedRevenueYear: TaxationReportedRevenueYear;
    TaxationSalesTax2019: Value;
    TaxationSalesTax2020: Value;
    TaxationReportedTaxFiling: TaxationReportedTaxFilingValues;
    TaxationReportedSolePropIncome: Value;
    ReportedRevenueReasonable: null;
    YYRevenueDeclineReasonable: null;
    ReasonablenessExceptions: null;
    DOLWR30FilingQuarter: NullableString;
    WR30ReportingComments: string;
    DOLWR30AwardQuarter: string; 
    TotalFTEJobsAwardQuarter: number;  //calculation
    LaborFTEJobsFromWR30: number | null;   //To Do
    LaborQuarterFromWR30: string | null;
    UnMetNeed: Value;
    Phase3BusinessEligibility: string;
    BusinessOperationalatApp: YesNo;
    EstimatedRevenueLossatApp: Value;
    IsReligiousByUser: YesNo;
    IsLobbyingByUser: YesNo;
    IsChildCareLicensed : string;
    DuplicationOfBenefits : string;
}

interface OtherCovid19Assistance {
    IsExists: YesNo;
}

interface OtherCovid19AssistanceProgram {
    IsExists: YesNo;
    PartofUnMetCalculation: YesNo;
    Status: ProgramApprovals | string | null;
    ApprovalDate: NullableString;
    ApprovedAmount: Value;
    PurposeOfFunds: String | null;
    ProgramDescription: String;
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
    OtherCovid19Assistance_PPP2: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.PPP2;
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
    OtherCovid19Assistance_CVSB2GR: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.CVSB2GR;
    };
    OtherCovid19Assistance_CVSB3GR: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.CVSB3GR;
    };
    OtherCovid19Assistance_CARES: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.CARES;
    };
    OtherCovid19Assistance_NJHousing: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.NJHousing;
    };
    OtherCovid19Assistance_NJRedevelopment: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.NJRedevelopment;
    };
    OtherCovid19Assistance_NJRedevelopment2: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.NJRedevelopment2;
    };
    OtherCovid19Assistance_Insurance: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.Insurance;
    };
    OtherCovid19Assistance_Other: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.Other;
    };
    OtherCovid19Assistance_PPE: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.PPE;
    };
    OtherCovid19Assistance_PPE2: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.PPE2;
    };
    OtherCovid19Assistance_SSNJ: OtherCovid19AssistanceProgram & {
        Program: ProgramDescriptions.SSNJ;
    };
}
