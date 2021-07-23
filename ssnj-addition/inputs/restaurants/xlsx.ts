const XLSX = require('xlsx');

export enum YesNo {
  Yes = 'Yes',
  No = 'No',
}

export enum TaxClearance {
  Yes = 'Y',
  No = 'N',
  Unknown = 'X',
}

export interface RestaurantRow {
  readonly Addition_Round: number;
  readonly SSNJRestaurantAdditionReview_Id: string;
  readonly Inputs_RestaurantAdditionForm: string;
  readonly Inputs_RestaurantAdditionForm_Label: string;
  readonly Inputs_RestaurantFormNumber: string;
  readonly Inputs_DBA: string;
  readonly Inputs_ParentheticalDBA: string;
  readonly Inputs_Checksum: number;
  readonly Inputs_ExpectedChecksum: string;
  readonly Inputs_ChecksumMatches: string;
  readonly Inputs_ApplicationNumber: number;
  readonly Inputs_ApplicationNumberMatches: string;
  readonly Inputs_AllChecksPass: string;
  readonly Inputs_ConfirmationID: string;
  readonly Inputs_RestaurantFormID: string;
  readonly InvalidLink_NJEDA: string;
  readonly ElectronicSignature_ElectronicSignatureAgreement: 'Yes';
  readonly ElectronicSignature_AcceptTerms: 'Yes';
  readonly ElectronicSignature_FullNameSignature: string;
  readonly Entry_Status: string;
  readonly Entry_DateCreated: number;
  readonly Entry_DateSubmitted: number;
  readonly Entry_DateUpdated: number;
  readonly Grantee_PROD: string;
  readonly PROD_ID: string;
  readonly PROD_ID_Check: string;
  readonly Name_Check: string;
  readonly Grantee_Name: string;
  readonly Restaurant_form_ID: string;
  readonly Restaurant_Name: string;
  readonly Restaurant_DBA: string;
  readonly Restaurant_SSN: string;
  readonly Restaurant_FTE: number;
  readonly Tax_Clear: TaxClearance;
  readonly Known_to_DOL: boolean;
  readonly DOL_UI_Clear: boolean;
  readonly DOL_WH_Clear: boolean;
  readonly WebSiteURL: string;
  readonly NAICS: string;
  readonly SelfIdentifyAs: string;
  readonly ExistsPriorFeb2020: YesNo;
  readonly FirstName: string;
  readonly LastName: string;
  readonly Title: string;
  readonly Phone: string;
  readonly AlternatePhone: string;
  readonly Email: string;
  readonly Address1: string;
  readonly Address2: string;
  readonly City: string;
  readonly Zip: string;
  readonly NegativeImpacts: string;
  readonly ExplainNegativeImpacts: string;
  readonly Prefixed_Addition_ID: string;
  readonly Addition_ID: string;
  readonly Addition_RoundID: string;
  readonly Review_Row: number;
  readonly Ignore: boolean;
}

export function getRows(filePath: string): RestaurantRow[] {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheet = workbook.Sheets['Restaurants'];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}
