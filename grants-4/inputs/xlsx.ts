import { YesNoNA } from "../outputs/types";

const XLSX = require('xlsx');

export enum YesNo {
  Sí = 'Sí',
  Yes = 'Yes',
  No ='No',
}

type YesNoEmpty = YesNo | '';

enum EntryStatus {
  'Incomplete',
  'Submitted',
  'Reviewed',
  'Complete',
}

export enum EntityType {
  Other = 0,
  Sole_Prop = 1,
  LLC = 2,
  SMLLC = 3,
  Partnership = 4,
  C_Corp = 5,
  S_Corp = 6,
  Nonprofit_501c3 = 7,
  Nonprofit_501c4 = 8,
  Nonprofit_501c6 = 9,
  Nonprofit_501c7 = 10,
  Nonprofit_501c19 = 11,
  Nonprofit_Other = 12,
  Nonprofit_Organization = 13,
  Limited_Partnership = 14,
  General_Partnership = 15,
  Government_Body = 16,
}

export enum Designations {
  None = 0,
  Small_Business = 1,
  Minority_Owned = 2,
  Woman_Owned = 4,
  Veteran_Owned = 8,
  Disabled_Owned = 16,
}

export enum Capacities {
  'Less than 10%' = 10,
  '25%' = 25,
  '50%' = 50,
  '75%' = 75,
  '100%' = 100,
}

export enum DOB_Status {
  Approved = 1,
  In_Process = 2,
  Declined = 3,
}

export enum DOB_Purposes {
  None = 0,
  Payroll = 1,
  Rent_Mortgage = 2,
  Utilities = 4,
  Inventory = 8,
  Other = 16,
}

export enum BusinessType {
    'Restaurant (Food Services and Drinking Places)' = 506340000,
    'Micro-Business' = 506340001,
    'Small Business' = 506340002,
    'Child Care Provider' = 506340003
}

export enum ChildCareLicense {
  'Yes' = 506340000,
  'No' = 506340001,
  'Exempt' = 506340002
}

export enum ChildCareExemptReason {
  'The business is not defined as a child care center by the Child Care Center Licensing Act, N.J.S.A. 30:5B-1 et seq.' = 506340000,
  'Programs operated by the board of education of a local public school district.' = 506340001,
  'Kindergartens, pre-kindergarten programs, or child care centers that are operated by and are an integral part of, a private educational institution or system providing elementary education in grades kindergarten through sixth.' = 506340002,
  'Centers or special classes operated primarily for religious instruction.' = 506340003,
  'Programs of specialized activities or instruction for children that are not designed or intended for child care purposes, including, but not limited to: Boy Scouts, Girl Scouts, 4-H Clubs, Junior Achievement.' = 506340004,
  'Homework or tutorial programs.' = 506340005,
  'Youth camps required to be licensed under the Youth Camp Safety Act of New Jersey, pursuant to N.J.S.A. 26:12-1 et seq.' = 506340006,
  'Regional schools operated by or under contract with the Department of Children and Families .' = 506340007,
  'Privately operated infant and preschool programs that are approved by the Department of Education to provide services exclusively to local school districts for children with disabilities, pursuant to N.J.S.A. 18A:46-1 et seq.' = 506340008,
  'None of the Above.' = 506340009,
}

export interface Row {
    // readonly Eligibility_Foundation: YesNo;
    // readonly Eligibility_FTE: YesNo;
    // readonly Eligibility_DOL: YesNo;
    // readonly Eligibility_TaxationRegistered: YesNo;
    // readonly Eligibility_TaxationCurrent: YesNo;
    readonly ContactInformation_ContactName_First: string;
    readonly ContactInformation_ContactName_Last: string;
    readonly ContactInformation_BusinessName: string;
    readonly ContactInformation_DoingBusinessAsDBA: string;
    readonly ContactInformation_Phone: string;
    readonly ContactInformation_Website: string;
    readonly ContactInformation_Email: string;
    readonly ContactInformation_EmailConfirm: string;
    readonly ContactInformation_PrimaryBusinessAddress_Line1: string;
    readonly ContactInformation_PrimaryBusinessAddress_Line2: string;
    readonly ContactInformation_PrimaryBusinessAddress_State: 'New Jersey';
    readonly ContactInformation_PrimaryBusinessAddress_PostalCode: string;
    readonly ContactInformation_ZipFirst5: string;
    readonly ContactInformation_ZipLookup: string;
    readonly ContactInformation_ZipLookup_Label: string;
    readonly ContactInformation_Geography: string;
    readonly ContactInformation_Geography_Label: string;
    readonly ContactInformation_Zip: string;
    readonly ContactInformation_AuthorizedSigner: YesNo;
    readonly Business_EntityType: string;
    readonly Business_EntityType_Value: EntityType;
    readonly Business_NonprofitClassification: string;
    readonly Business_YearEstablished: string;
    readonly Business_DateEstablished?: number;
    readonly Business_W2EmployeesFullTime: number;
    readonly Business_W2EmployeesPartTime: number;
    readonly Business_Contractors: number;
    readonly Business_TIN: string;
    readonly Business_Religious: YesNo;
    readonly Business_LobbyingPolitical: YesNo;
    readonly Business_Designations: string;
    readonly Business_Designations_Value: Designations;
    readonly NAICSCodeKnown: YesNo;
    readonly NAICSCode: string;
    // readonly NAICSCodeInfo_Industry: string;
    // readonly NAICSCodeInfo_Industry_Label: string;
    // readonly NAICSCodeFinder_Sector: string;
    // readonly NAICSCodeFinder_Industry: string;
    // readonly NAICSCodeFinder_Industry_Label: string;
    // readonly NAICSCodeVerification_ConfirmNAICSCode: YesNo;
    readonly BusinessDetails_HomeBasedBusiness: YesNo;
    readonly BusinessDetails_GamblingActivities: YesNo;
    readonly BusinessDetails_AdultActivities: YesNoEmpty; // for some reason, this is empty on a few applications
    readonly BusinessDetails_SalessActivities: YesNo;
    readonly BusinessDetails_TransientMerchant: YesNo;
    readonly BusinessDetails_OutdoorStorageCompany: YesNo;
    readonly BusinessDetails_NuisanceActivities: YesNo;
    readonly BusinessDetails_IllegalActivities: YesNo;
    readonly COVID19Impact_EssentialBusiness: YesNo;
    readonly COVID19Impact_OpenOrReopened: YesNoNA;
    readonly COVID19Impact_Capacity: string;
    readonly COVID19Impact_Capacity_Value?: Capacities;
    readonly RevenueComparison_MarchAprilMay2019?: number;
    readonly RevenueComparison_MarchAprilMay2020: number;
    readonly RevenueComparison_YearOverYearChange?: number;
    readonly DOBAffidavit_Certification: YesNo;
    // Grant Phase 1
    readonly DOBAffidavit_NJEDAGrant: YesNo;
    readonly DOBAffidavit_NJEDAGrantDetails_Verb: string;
    readonly DOBAffidavit_NJEDAGrantDetails_Status: string;
    readonly DOBAffidavit_NJEDAGrantDetails_Status_Value?: DOB_Status;
    readonly DOBAffidavit_NJEDAGrantDetails_ApprovalDate?: number;
    readonly DOBAffidavit_NJEDAGrantDetails_Amount?: number;
    readonly DOBAffidavit_NJEDAGrantDetails_Purposes: string;
    readonly DOBAffidavit_NJEDAGrantDetails_Purposes_Value: DOB_Purposes;
    // Loan Phase 1
    readonly DOBAffidavit_NJEDALoan: YesNo;
    readonly DOBAffidavit_NJEDALoanDetails_Verb: string;
    readonly DOBAffidavit_NJEDALoanDetails_Status: string;
    readonly DOBAffidavit_NJEDALoanDetails_Status_Value?: DOB_Status;
    readonly DOBAffidavit_NJEDALoanDetails_ApprovalDate?: number;
    readonly DOBAffidavit_NJEDALoanDetails_Amount?: number;
    readonly DOBAffidavit_NJEDALoanDetails_Purposes: string;
    readonly DOBAffidavit_NJEDALoanDetails_Purposes_Value: DOB_Purposes;
    // PPP Phase 1
    readonly DOBAffidavit_SBAPPP: YesNo;
    readonly DOBAffidavit_SBAPPPDetails_Verb: string;
    readonly DOBAffidavit_SBAPPPDetails_Status: string;
    readonly DOBAffidavit_SBAPPPDetails_Status_Value?: DOB_Status;
    readonly DOBAffidavit_SBAPPPDetails_ApprovalDate?: number;
    readonly DOBAffidavit_SBAPPPDetails_Amount?: number;
    readonly DOBAffidavit_SBAPPPDetails_Purposes: string;
    readonly DOBAffidavit_SBAPPPDetails_Purposes_Value: DOB_Purposes;
    // PPP Phase 2
    readonly njeda_sbapaycheckprotectionprogramphase2: YesNo;
    readonly njeda_sbapppphase2status: string;
    readonly njeda_sbapppphase2approvedamt?: number;
    readonly njeda_sbapppphase2approveddate?: Date;
    readonly njeda_sbapppphase2approvedpurpose: string;
    // EIDL
    readonly DOBAffidavit_SBAEIDL: YesNo;
    readonly DOBAffidavit_SBAEIDLDetails_Verb: string;
    readonly DOBAffidavit_SBAEIDLDetails_Status: string;
    readonly DOBAffidavit_SBAEIDLDetails_Status_Value?: DOB_Status;
    readonly DOBAffidavit_SBAEIDLDetails_ApprovalDate?: number;
    readonly DOBAffidavit_SBAEIDLDetails_Amount?: number;
    readonly DOBAffidavit_SBAEIDLDetails_Purposes: string;
    readonly DOBAffidavit_SBAEIDLDetails_Purposes_Value: DOB_Purposes;
    // EIDG
    readonly DOBAffidavit_SBAEIDG: YesNo;
    readonly DOBAffidavit_SBAEIDGDetails_Verb: string;
    readonly DOBAffidavit_SBAEIDGDetails_Status: string;
    readonly DOBAffidavit_SBAEIDGDetails_Status_Value?: DOB_Status;
    readonly DOBAffidavit_SBAEIDGDetails_ApprovalDate?: number;
    readonly DOBAffidavit_SBAEIDGDetails_Amount?: number;
    readonly DOBAffidavit_SBAEIDGDetails_Purposes: string;
    readonly DOBAffidavit_SBAEIDGDetails_Purposes_Value: DOB_Purposes;
    // Other
    readonly DOBAffidavit_OtherStateLocal: YesNo;
    readonly DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions: string;
    readonly DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess?: number;
    readonly DOBAffidavit_OtherStateLocalDetails_Purposes: string;
    readonly DOBAffidavit_OtherStateLocalDetails_Purposes_Value: DOB_Purposes;

    readonly AdditionalBackgroundInformation_BackgroundQuestion1: YesNo;
    readonly AdditionalBackgroundInformation_BackgroundQuestionDetails1: string;
    readonly AdditionalBackgroundInformation_BackgroundQuestion2: YesNo;
    readonly AdditionalBackgroundInformation_BackgroundQuestionDetails2: string;
    readonly AdditionalBackgroundInformation_BackgroundQuestion3: YesNo;
    readonly AdditionalBackgroundInformation_BackgroundQuestionDetails3: string;
    readonly AdditionalBackgroundInformation_BackgroundQuestion4: YesNo;
    readonly AdditionalBackgroundInformation_BackgroundQuestionDetails4: string;
    readonly AdditionalBackgroundInformation_BackgroundQuestion5: YesNo;
    readonly AdditionalBackgroundInformation_BackgroundQuestionDetails5: string;
    readonly AdditionalBackgroundInformation_BackgroundQuestion6: YesNo;
    readonly AdditionalBackgroundInformation_BackgroundQuestionDetails6: string;
    // readonly CertificationOfApplication_Certification1: YesNo;
    // readonly CertificationOfApplication_Certification2: YesNo;
    // readonly CertificationOfApplication_Certification3: YesNo;
    // readonly CertificationOfApplication_Certification4: YesNo;
    // readonly CertificationOfApplication_Certification5: YesNo;
    // readonly CertificationOfApplication_Certification6: YesNo;
    // readonly CertificationOfApplication_Certification7: YesNo;
    // readonly CertificationOfApplication_Certification8: YesNo;
    // readonly CertificationOfApplication_Certification9: YesNo;
    readonly CertificationOfApplication_PrivacyActReleaseWaiver: YesNo;
    readonly CertificationOfApplication_Confirmation_AccurateAndTruthful: YesNo;
    readonly CertificationOfApplication_Confirmation_TINConfirm: string;
    readonly ElectronicSignature_ElectronicSignatureAgreement: YesNo;
    readonly ElectronicSignature_AcceptTerms: YesNo;
    readonly ElectronicSignature_FullNameSignature: string;
    readonly Entry_Status: EntryStatus;
    readonly Entry_DateCreated: number;
    readonly Entry_DateSubmitted: number;
    readonly Entry_DateUpdated: number;
    readonly Anuual_Revenue: number;
    readonly njeda_mailingaddressline1: string;
    readonly njeda_mailingaddressline2: string;
    readonly njeda_statemailing: 'New Jersey';
    readonly njeda_countymailing: string;
    readonly njeda_njzipcodemailing: string;
    readonly njeda_njcitymailing: string;
    readonly njeda_totalfundingrequested: number;
    readonly njeda_title: string;
    readonly DOBAffidavit_OtherStateLocal2: YesNo;
    readonly DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions2: string;
    readonly DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess2?: number;
    readonly DOBAffidavit_OtherStateLocalDetails_Purposes2: string;
    readonly DOBAffidavit_OtherStateLocal3: YesNo;
    readonly DOBAffidavit_OtherStateLocalDetails_ProgramDescriptions3: string;
    readonly DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess3?: number;
    readonly DOBAffidavit_OtherStateLocalDetails_Purposes3: string;
    readonly OtherCost1: number;
    readonly OtherCost2: number;
    readonly OtherCost3: number;
    readonly njeda_amountoffundinginventory: number;
    readonly njeda_amtfundingneededpurchaseofequipment: number;
    readonly njeda_amountoffundingneededrent: number;
    readonly njeda_amountoffundingneededmortgage: number;
    readonly njeda_amountoffundingneededtaxes: number;
    readonly njeda_amountoffundingneededutilities: number;
    readonly njeda_amountoffundingneededother: number;
    readonly njeda_minorityownedbusinessselectedspecify: string;
    readonly njeda_describeprovidededaassistance: string;
    readonly njeda_providebusinessdescription: string;
    readonly njeda_otherprogramstatus: string;
    readonly njeda_otherprogramstatus2: string;
    readonly njeda_otherprogramstatus3: string;
    readonly njeda_otherprogramapproveddate: number;
    readonly njeda_otherprogramapproveddate2: number;
    readonly njeda_otherprogramapproveddate3: number;
    readonly njeda_censustract: string;
    readonly njeda_isinopportunityzone: YesNoNA;
    // new add on 20201102
    readonly njeda_phase3businessprogram: BusinessType;
    readonly njeda_phase3businessprogramsrevised: BusinessType;

    readonly njeda_highestqtrfulltimew2employees: string;   //need to convert to number
    readonly njeda_fulltimew2employeeslistedonwr30: number;
    readonly njeda_revisedfulltimeemployeeslistedwr30: number;

    readonly njeda_businessfilewr30withnjlwd: YesNoEmpty;
    readonly njeda_additionalbusinessfundingneeded: number;
    readonly njeda_revisedbusinessfundingneeded: number;
    readonly njeda_appliedforothercovid19assistance: YesNo;
    readonly njeda_businessoperatingplantoreopen: YesNoNA;
    readonly njeda_revisedbusinessoperatingplantoreopen: YesNoNA;

    readonly njeda_previous6qtrhighestemployment: string;   //quater
    readonly njeda_language: string;
    readonly njeda_businessnegativerevenueimpact: YesNoNA;  //impact by Covid19
    readonly njeda_revisedbusinessnegativerevenue: YesNoNA;

    readonly njeda_submittedordernumber: string;  
    readonly njeda_total2019annualrevenueifapplicable: number;
    readonly njeda_total2020annualrevenue : number;

    readonly UseOfFundsSummary: string;
    //CovidAssistanceFunds
    //Grant2
    readonly njeda_njedasbemergencygrantassistancephase2: YesNo;
    readonly njeda_njedasbemergencygrantassistancephase2stat: string;
    readonly njeda_sbemergencygrantphase2amountapproved?: number;
    readonly njeda_sbemergencygrantassistphase2approveddate?: Date;
    readonly njeda_sbemergencygrantassistphase2purposeoffund: string;
    //Grant3
    readonly njeda_njedasbegrantassistancephase3: YesNo;
    readonly njeda_njedasbegrantassistphase3status: string;
    readonly njeda_njedasbegrantassistphase3approvedamt?: number;
    readonly njeda_njedasbegrantassistphase3approveddate?: Date;
    readonly njeda_njedasbegrantassistphase3approvedpurpose: string;
    //Care
    readonly njeda_caresactfundingfromlocalcounty: YesNo;
    readonly njeda_caresactfundingfromlocalcountystatus: string;
    readonly njeda_cafundingfromlocalcountyamtapproved?: number;
    readonly njeda_caresactfundingfromlocalcountyapprovedate?: Date;
    readonly njeda_cafundingfromlocalcountypurposeoffunds: string;
    //Housing
    readonly njeda_njhandmortgagefinancecovid19landlordgrant: YesNo;
    readonly njeda_njhandmortgagefincovidlandlordgrantstatus: string;
    readonly njeda_njhmorfincovidlandlordgrantamtapproved?: number;
    readonly njeda_njhandmorfincovidlandlordapproveddate?: Date;
    readonly njeda_njhandmorfincovidlandlordpurposeoffunds: string;
    //Re-Devlopment
    readonly njeda_njredevauthsbleaseemergassistgrantprogram: YesNo;
    readonly njeda_njredevauthsbleaseemergastgrantprogstatus: string;
    readonly njeda_redevauthsblemerastgrantprogamtapproved?: number;
    readonly njeda_redevauthsblemerastgrantprogapproveddate?: Date;
    readonly njeda_redevauthsblemerastgrantpropurposeoffunds: string;
    //Re-Devlopment Phase 2
    readonly njeda_njrasbleaseeagprogphase2: YesNo;
    readonly njeda_sbleaseemergassistgrantprogphase2status: string;
    readonly njeda_njrasbleaseeagprogphase2approvedamt?: number;
    readonly njeda_njrasbleaseeagprogphase2approveddate?: Date;
    readonly njeda_njrasbleaseeagprogphase2approvedpurpose: string;
    //Insurance
    readonly njeda_insuranceproceeds: YesNo;
    readonly njeda_insuranceproceedsstatus: string;
    readonly njeda_insuranceproceedsamountapproved?: number;
    readonly njeda_insuranceproceedsapproveddate?: Date;
    readonly njeda_insuranceproceedspurposeoffunds: string;
    //PPE
    readonly njeda_njpersonalppeaccessprogram: YesNo;
    readonly njeda_njpersonalppeaprogramstatus: string;
    readonly njeda_njpersonalppeaprogramapprovedamt?: number;
    readonly njeda_njpersonalppeaprogramapproveddate?: Date;
    readonly njeda_njpersonalppeaprogramapprovedpurpose: string;
    //PPE Phase 2
    readonly njeda_njedasmbppeaccessprogphase2: YesNo;
    readonly njeda_njedasmbppeaccessprogphase2status: string;
    readonly njeda_njedasmbppeaccessprogphase2amount?: number;
    readonly njeda_njedasmbppeaccessprogphase2date?: Date;
    readonly njeda_njedasmbppeaccessprogphase2purpose: string;
    //SSNJ
    readonly njeda_njedasustainandserve: YesNo;
    readonly njeda_njedasustainandservestatus: string;
    readonly njeda_njedasustainandserveapprovedamt?: number;
    readonly njeda_njedasustainandserveapproveddate?: Date;
    readonly njeda_njedasustainandserveapprovedpurpose: string;

    //Estimated Loss
    readonly njeda_todayestimatedrevenueloss?: number; 
    readonly njeda_revisedtodayestimatedrevenueloss?: number;
    //Proper Register  Yes
    readonly njeda_certifybusinessproperlyregisteredwithnj: YesNoNA;
    //Still Need funding  yesNo
    readonly njeda_companyhavefinancialneed: YesNo;
    readonly njeda_revisedcompanyhavefinancialneed: YesNo;
    //UseOfFund
    readonly njeda_other: YesNo;
    readonly njeda_revisednoneoftheabovesecond: YesNo;
    //Operate today
    readonly njeda_revisedbusinessoperatingtoday: YesNo;
    readonly njeda_businessstilloperatingtoday: YesNo;
    readonly MOLAGUID: string;
    readonly ReligiousDecline: YesNo;
    readonly ReligiousReview: YesNo;

    readonly njeda_commerciallocation: YesNo;
    readonly njeda_number1099fulltimeemployees?: number;
    readonly njeda_number1099parttimeemployees?: number;

    readonly njeda_entitydeemedessentialbusinessgovmurphyeo: YesNoNA;

    //Final Phase Program
    readonly FinalPhaseProgram: string;
                                                
    //Child Care new fields
    readonly njeda_ischildcarecenterproperlylicensedorexempt: string;
    readonly njeda_revisedischildcarecenterproperlylicensed: string;
    readonly njeda_childcarecenterexemptreason: string;
    readonly njeda_revisedchildcarecenterexemptreason: string;
    readonly njeda_receiveagrant3: YesNo;

}

export interface EnRow extends Row {
  readonly NJEDAGrantApplication8_Id: string;
}

export interface EsRow extends Row {
  readonly SolicitudDeSubsidio_Id: string;
}

// assumes single-sheet workbook
export function getRows(filePath: string): Row[] {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}
