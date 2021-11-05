const XLSX = require('xlsx');

export enum YesNo {
  Yes = 'Yes',
  No = 'No',
}

export interface RestaurantReview {
  readonly SSNJRestaurantAdditionReview_Id: string;
  readonly Inputs_RestaurantAdditionForm: string;
  readonly Inputs_RestaurantAdditionForm_Label: string;
  readonly Inputs_RestaurantFormNumber: number;
  readonly Inputs_DBA: string;
  readonly Inputs_ParentheticalDBA: string;
  readonly Inputs_Checksum: number;
  readonly Inputs_ExpectedChecksum: string;
  readonly Inputs_ChecksumMatches: boolean;
  readonly Inputs_ApplicationNumber: string;
  readonly Inputs_ApplicationNumberMatches: boolean;
  readonly Inputs_AllChecksPass: boolean;
  readonly Inputs_ConfirmationID: string;
  readonly Inputs_RestaurantFormID: string;
  readonly InvalidLink_NJEDA: string;
  readonly ElectronicSignature_ElectronicSignatureAgreement: YesNo;
  readonly ElectronicSignature_AcceptTerms: YesNo;
  readonly ElectronicSignature_FullNameSignature: string;
  readonly Entry_Status: string;
  readonly Entry_DateCreated: number;
  readonly Entry_DateSubmitted: number;
  readonly Entry_DateUpdated: number;
}

export function getRestaurantReviews(filePath: string): RestaurantReview[] {
  console.log('Getting all restaurant reviews...');

  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheet = workbook.Sheets['SSNJRestaurantAdditionReview'];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}
