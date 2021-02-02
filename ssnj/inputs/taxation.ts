import { Application } from './applications';
import XLSX from 'xlsx';

export enum CleanStatus {
  Clear = 'Y',
  Not_Clear = 'N',
  Not_Found = 'X',
}

interface TaxationData {
  readonly 'TAX REG NAME': string;
  readonly 'Clean Ind.': CleanStatus;
  readonly 'Taxation Response': string;
}

export interface Taxation {
  readonly taxation: TaxationData;
}

interface TaxationDataMap {
  [applicationID: string]: TaxationData;
}

interface Row extends TaxationData {
  readonly 'EIN      ': string;
}

// assumes single-sheet workbook
function getData(filePath: string): TaxationDataMap {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  const map: TaxationDataMap = {};
  rows.forEach(row => {
    const { 'EIN      ': ein, ...rest } = row;
    map[ein] = rest;
  });

  return map;
}

let TAXATION_DATA_MAP: TaxationDataMap;

export async function init(path: string) {
  console.log('Loading Taxation data...');
  TAXATION_DATA_MAP = getData(path);
}

export function addTaxationData<T extends Application>(application: T): T & Taxation {
  const taxation: TaxationData = TAXATION_DATA_MAP[application.Organization_EIN];

  if (!taxation) {
    throw new Error(`Could not find taxation data for ${application.Organization_EIN}`);
  }

  return { ...application, taxation };
}
