const XLSX = require('xlsx');

export enum YesNo {
  Yes = 'Yes',
  No = 'No',
}

enum EntryStatus {
  'Incomplete',
  'Submitted',
  'Reviewed',
  'Complete',
}

export enum Designations {
  None = 0,
  Small_Business = 1,
  Minority_Owned = 2,
  Woman_Owned = 4,
  Veteran_Owned = 8,
  Disabled_Owned = 16,
}

export interface RestaurantRow {
  readonly SSNJRestaurantForm_Id: number;
  readonly Inputs_Application: number;
  readonly Inputs_Application_Label: string;
  readonly Inputs_ApplicationNumber: number;
  readonly Inputs_RestaurantFormId: string;
  readonly Inputs_Checksum: number;
  readonly Inputs_ReviewCode: string;
  readonly Inputs_ReviewURL: string;
  readonly Inputs_ParentheticalDBA: string;
  readonly Inputs_DBA: string;
  readonly Inputs_RestaurantIndex: number;
  readonly Inputs_RestaurantName: string;
  readonly Inputs_RestaurantContact: string;
  readonly Inputs_RestaurantEmail: string;
  readonly Welcome_InstructionConfirmation: 'Yes';
  readonly RestaurantInformation_RestaurantName: string;
  readonly RestaurantInformation_DBA: string;
  readonly RestaurantInformation_EIN: string;
  readonly RestaurantInformation_Website: string;
  readonly RestaurantInformation_PrimaryBusinessAddress_Line1: string;
  readonly RestaurantInformation_PrimaryBusinessAddress_Line2: string;
  readonly RestaurantInformation_PrimaryBusinessAddress_City: string;
  readonly RestaurantInformation_PrimaryBusinessAddress_State: string;
  readonly RestaurantInformation_PrimaryBusinessAddress_PostalCode: string;
  readonly RestaurantInformation_Designations: string;
  readonly RestaurantInformation_Designations_Value: number;
  readonly RestaurantInformation_OldEnough: 'Yes';
  readonly ThankYouForYourInterest2_Regards: 'NJEDA';
  readonly AuthorizedRepresentative_Name_First: string;
  readonly AuthorizedRepresentative_Name_Last: string;
  readonly AuthorizedRepresentative_Title: string;
  readonly AuthorizedRepresentative_Email: string;
  readonly AuthorizedRepresentative_Phone: string;
  readonly AuthorizedRepresentative_AlternatePhone: string;
  readonly NAICSCodeKnown: YesNo;
  readonly NAICSCode: string;
  readonly NAICSCodeInfo_Industry: string;
  readonly NAICSCodeInfo_Industry_Label: string;
  readonly NAICSCodeFinder_Sector: string;
  readonly NAICSCodeFinder_Industry: string;
  readonly NAICSCodeFinder_Industry_Label: string;
  readonly NAICSCodeVerification_ConfirmNAICSCode: 'Yes';
  readonly ThankYouForYourInterest_Regards: 'NJEDA';
  readonly COVID19HarmAttestation_NegativeImpacts: string;
  readonly COVID19HarmAttestation_Explanation: string;
  readonly ElectronicSignature_ElectronicSignatureAgreement: 'Yes';
  readonly ElectronicSignature_AcceptTerms: 'Yes';
  readonly ElectronicSignature_FullNameSignature: string;
  readonly Entry_Status: EntryStatus;
  readonly Entry_DateCreated: number;
  readonly Entry_DateSubmitted: number;
  readonly Entry_DateUpdated: number;
}

export function getRows(filePath: string): RestaurantRow[] {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheet = workbook.Sheets['SSNJRestaurantForm'];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}
