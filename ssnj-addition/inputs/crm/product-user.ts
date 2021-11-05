const XLSX = require('xlsx');

export interface ProductUser {
  readonly 'Product User ID': string;
  readonly User: string;
  readonly 'Employer Identification Number (EIN)': string;
  readonly State: string;
  readonly Status: string;
  readonly Product: string;
  readonly 'Applicant Organization Name': string;
}

export function getProductUsers(filePath: string): ProductUser[] {
  console.log('Getting all Product Users...');

  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheet = workbook.Sheets['Product User Advanced Find View'];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}
