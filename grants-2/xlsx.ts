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

export interface Row {
  readonly Eligibility_Foundation: YesNo;
  readonly Eligibility_FTE: YesNo;
  readonly Eligibility_DOL: YesNo;
  readonly Eligibility_TaxationRegistered: YesNo;
  readonly Eligibility_TaxationCurrent: YesNo;
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
  readonly Business_LobbyingPolitical: YesNoEmpty;
  readonly Business_Designations: string;
  readonly Business_Designations_Value: Designations;
  readonly NAICSCodeKnown: YesNo;
  readonly NAICSCode: string;
  readonly NAICSCodeInfo_Industry: string;
  readonly NAICSCodeInfo_Industry_Label: string;
  readonly NAICSCodeFinder_Sector: string;
  readonly NAICSCodeFinder_Industry: string;
  readonly NAICSCodeFinder_Industry_Label: string;
  readonly NAICSCodeVerification_ConfirmNAICSCode: YesNo;
  readonly BusinessDetails_HomeBasedBusiness: YesNo;
  readonly BusinessDetails_GamblingActivities: YesNo;
  readonly BusinessDetails_AdultActivities: YesNoEmpty; // for some reason, this is empty on a few applications
  readonly BusinessDetails_SalessActivities: YesNo;
  readonly BusinessDetails_TransientMerchant: YesNo;
  readonly BusinessDetails_OutdoorStorageCompany: YesNo;
  readonly BusinessDetails_NuisanceActivities: YesNo;
  readonly BusinessDetails_IllegalActivities: YesNo;
  readonly COVID19Impact_EssentialBusiness: YesNo;
  readonly COVID19Impact_OpenOrReopened: YesNo;
  readonly COVID19Impact_Capacity: string;
  readonly COVID19Impact_Capacity_Value?: Capacities;
  readonly RevenueComparison_MarchAprilMay2019?: number;
  readonly RevenueComparison_MarchAprilMay2020: number;
  readonly RevenueComparison_YearOverYearChange?: number;
  readonly DOBAffidavit_Certification: YesNo;
  readonly DOBAffidavit_NJEDAGrant: YesNo;
  readonly DOBAffidavit_NJEDAGrantDetails_Verb: string;
  readonly DOBAffidavit_NJEDAGrantDetails_Status: string;
  readonly DOBAffidavit_NJEDAGrantDetails_Status_Value?: DOB_Status;
  readonly DOBAffidavit_NJEDAGrantDetails_ApprovalDate?: number;
  readonly DOBAffidavit_NJEDAGrantDetails_Amount?: number;
  readonly DOBAffidavit_NJEDAGrantDetails_Purposes: string;
  readonly DOBAffidavit_NJEDAGrantDetails_Purposes_Value: DOB_Purposes;
  readonly DOBAffidavit_NJEDALoan: YesNo;
  readonly DOBAffidavit_NJEDALoanDetails_Verb: string;
  readonly DOBAffidavit_NJEDALoanDetails_Status: string;
  readonly DOBAffidavit_NJEDALoanDetails_Status_Value?: DOB_Status;
  readonly DOBAffidavit_NJEDALoanDetails_ApprovalDate?: number;
  readonly DOBAffidavit_NJEDALoanDetails_Amount?: number;
  readonly DOBAffidavit_NJEDALoanDetails_Purposes: string;
  readonly DOBAffidavit_NJEDALoanDetails_Purposes_Value: DOB_Purposes;
  readonly DOBAffidavit_SBAPPP: YesNo;
  readonly DOBAffidavit_SBAPPPDetails_Verb: string;
  readonly DOBAffidavit_SBAPPPDetails_Status: string;
  readonly DOBAffidavit_SBAPPPDetails_Status_Value?: DOB_Status;
  readonly DOBAffidavit_SBAPPPDetails_ApprovalDate?: number;
  readonly DOBAffidavit_SBAPPPDetails_Amount?: number;
  readonly DOBAffidavit_SBAPPPDetails_Purposes: string;
  readonly DOBAffidavit_SBAPPPDetails_Purposes_Value: DOB_Purposes;
  readonly DOBAffidavit_SBAEIDL: YesNo;
  readonly DOBAffidavit_SBAEIDLDetails_Verb: string;
  readonly DOBAffidavit_SBAEIDLDetails_Status: string;
  readonly DOBAffidavit_SBAEIDLDetails_Status_Value?: DOB_Status;
  readonly DOBAffidavit_SBAEIDLDetails_ApprovalDate?: number;
  readonly DOBAffidavit_SBAEIDLDetails_Amount?: number;
  readonly DOBAffidavit_SBAEIDLDetails_Purposes: string;
  readonly DOBAffidavit_SBAEIDLDetails_Purposes_Value: DOB_Purposes;
  readonly DOBAffidavit_SBAEIDG: YesNo;
  readonly DOBAffidavit_SBAEIDGDetails_Verb: string;
  readonly DOBAffidavit_SBAEIDGDetails_Status: string;
  readonly DOBAffidavit_SBAEIDGDetails_Status_Value?: DOB_Status;
  readonly DOBAffidavit_SBAEIDGDetails_ApprovalDate?: number;
  readonly DOBAffidavit_SBAEIDGDetails_Amount?: number;
  readonly DOBAffidavit_SBAEIDGDetails_Purposes: string;
  readonly DOBAffidavit_SBAEIDGDetails_Purposes_Value: DOB_Purposes;
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
  readonly CertificationOfApplication_Certification1: YesNo;
  readonly CertificationOfApplication_Certification2: YesNo;
  readonly CertificationOfApplication_Certification3: YesNo;
  readonly CertificationOfApplication_Certification4: YesNo;
  readonly CertificationOfApplication_Certification5: YesNo;
  readonly CertificationOfApplication_Certification6: YesNo;
  readonly CertificationOfApplication_Certification7: YesNo;
  readonly CertificationOfApplication_Certification8: YesNo;
  readonly CertificationOfApplication_Certification9: YesNo;
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
