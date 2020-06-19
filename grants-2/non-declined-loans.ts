import XLSX from 'xlsx';
import { Application } from './applications';

interface LoanData {
  readonly 'OLA Application ID (Underwriting) (Underwriting)': string;
  readonly 'Product ID': string;
  readonly 'Account Name (Applicant) (Account)': string;
  readonly 'Doing Business As (Applicant) (Account)': string;
  readonly Amount: number;
}

interface Row extends LoanData {
  readonly 'EIN (Applicant) (Account)': string;
}

interface LoanDataMap {
  [Ein: string]: LoanData;
}

export interface NonDeclinedEdaLoan {
  readonly nonDeclinedEdaLoan?: LoanData;
}

// assumes single-sheet workbook
function getData(filePath: string): LoanDataMap {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  const map: LoanDataMap = {};
  rows.forEach(row => {
    const { 'EIN (Applicant) (Account)': ein, ...rest } = row;
    map[ein] = rest;
  });

  return map;
}

let LOAN_DATA_MAP: LoanDataMap;

export async function init(path: string) {
  console.log('Loading non-declined EDA Loan data...');
  LOAN_DATA_MAP = getData(path);
}

export function addNonDeclinedEdaLoanData<T extends Application>(
  application: T
): T & NonDeclinedEdaLoan {
  const nonDeclinedEdaLoan: LoanData = LOAN_DATA_MAP[application.Business_TIN];

  return { ...application, nonDeclinedEdaLoan };
}
