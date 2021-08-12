const XLSX = require('xlsx');

export enum ProductRecordState {
  Active = 'Active',
}

export enum ProductRecordStatus {
  InReview = 'In Review',
}

export interface RestaurantRow {
  readonly 'Product User ID': string;
  readonly User: string;
  readonly 'Employer Identification Number (EIN)': string;
  readonly State: ProductRecordState;
  readonly Status: ProductRecordStatus;
  readonly Product: string;
  readonly 'Applicant Organization Name': string;
  readonly '(Do Not Modify) Project User': string;
}

export function getRows(filePath: string): RestaurantRow[] {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheet = workbook.Sheets['Product User Advanced Find View'];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}
