import XLSX from 'xlsx';
import { Application } from './applications';

interface TaxationData {
  readonly 'EDA  Name': string;
  readonly 'EDA DBA': string;
  readonly 'EDA Entitiy Type': number;
  readonly TIN: string;
  readonly 'Ind Match ID': string;
  readonly 'TAXREG Name': string;
  readonly 'NAICS Code': number | '      ';
  readonly 'Clean Ind': 'Y' | 'N' | 'X';
  readonly 'SSN Check Only': 'X' | ' ';
  readonly 'TAXREG SP or SMLLC Ind.': 'X' | ' ';
  readonly '2018 Part': number;
  readonly '2018 Part Amt': number;
  readonly '2019 Part': number;
  readonly '2019 Part Amt': number;
  readonly '2018 CBT': number;
  readonly '2018 CBT Amt': number;
  readonly '2019 CBT': number;
  readonly '2019 CBT Amt': number;
  readonly '2018 TGI': number;
  readonly '2018 TGI Amt': number;
  readonly '2019 TGI': number;
  readonly '2019 TGI Amt': number;
  readonly 'S&U M 19': number;
  readonly 'S&U M 20': number;
  readonly 'S&U A 19': number;
  readonly 'S&U A 20': number;
}

export interface Taxation {
  readonly taxation: TaxationData;
}

interface TaxationDataMap {
  [applicationID: string]: TaxationData;
}

interface Row extends TaxationData {
  readonly 'EDA ID': string;
}

// assumes single-sheet workbook
function getData(filePath: string): TaxationDataMap {
  const re = /(\w{2})-(\d+)/;
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  const map: TaxationDataMap = {};
  rows.forEach(row => {
    const { 'EDA ID': edaId, ...rest } = row;
    const applicationID = edaId.replace(re, 'CV19G$1$2');
    map[applicationID.trim()] = rest;
  });

  return map;
}

console.log('Loading Taxation data...');
const TAXATION_DATA_MAP: TaxationDataMap = getData(
  '/Users/ross/NJEDA Grants Phase 2/First 5 hours/Taxation/EDA_PROD_OUTPUT_PROJ2_V3_061219.xlsx'
);

export function addTaxationData<T extends Application>(application: T): T & Taxation {
  const taxation: TaxationData = TAXATION_DATA_MAP[application.ApplicationId];

  if (!taxation) {
    throw new Error(`Could not find taxation data for ${application.ApplicationId}`);
  }

  return { ...application, taxation };
}
