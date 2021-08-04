const XLSX = require('xlsx');

export interface Review {
readonly SSNJ2RestaurantReview_Id: string;
readonly Inputs_RestaurantForm: string;
readonly Inputs_RestaurantFormNumber: number;
readonly Inputs_ConfirmationID: string;
readonly 'Application Number': string;
}

export function getReviews(filePath: string): Review[] {
  console.log('Loading restaurant reviews...');

  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheet = workbook.Sheets['SSNJ2RestaurantReview'];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}
