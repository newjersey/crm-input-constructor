import XLSX from 'xlsx';
import { Application } from './applications';

interface GrantPhase1Data {
  readonly 'OLA Application ID ': string;
  readonly 'Product ID': string;
  readonly 'Product Type': string;
  readonly 'Product Status': string;
  readonly 'Product Sub Status': string;
  readonly 'Account Name (Applicant) (Account)': string;
  readonly 'Doing Business As (Applicant) (Account)'?: string;
  readonly Amount?: number;
  readonly 'Total NJ FT Eligible Jobs at Project Site at App.'?: number;
  readonly 'Approval Date'?: number;
  readonly 'Closing Date'?: number;
}

interface Row extends GrantPhase1Data {
  readonly 'EIN (Applicant) (Account)': string;
}

interface GrantPhase1DataMap {
  [Ein: string]: GrantPhase1Data;
}

export interface GrantPhase1 {
  readonly grantPhase1: GrantPhase1Data;
}

// assumes single-sheet workbook
function getData(filePath: string): GrantPhase1DataMap {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  const map: GrantPhase1DataMap = {};
  rows.forEach(row => {
    const { 'EIN (Applicant) (Account)': ein, ...rest } = row;
    map[ein] = rest;
  });

  return map;
}

let GRANT_PHASE_1_DATA_MAP: GrantPhase1DataMap;

export async function init(path: string) {
  console.log('Loading grant phase 1 data...');
  GRANT_PHASE_1_DATA_MAP = getData(path);
}

export function addGrantPhase1Data<T extends Application>(application: T): T & GrantPhase1 {
  const grantPhase1: GrantPhase1Data = GRANT_PHASE_1_DATA_MAP[application.Business_TIN];

  return { ...application, grantPhase1 };
}
