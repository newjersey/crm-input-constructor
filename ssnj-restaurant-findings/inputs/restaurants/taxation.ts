import { Restaurant } from '.';
import XLSX from 'xlsx';

export enum CleanStatus {
  Clear = 'Y',
  Not_Clear = 'N',
  Not_Found = 'X',
}

interface TaxationData {
  readonly 'TAXREG NAME': string;
  readonly 'Clean Ind.': CleanStatus;
}

export interface Taxation {
  readonly taxation: TaxationData;
}

interface TaxationDataMap {
  [Inputs_RestaurantFormId: string]: TaxationData;
}

interface Row extends TaxationData {
  readonly TPID: string;
}

// assumes single-sheet workbook
function getData(filePath: string): TaxationDataMap {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  const map: TaxationDataMap = {};
  rows.forEach(row => {
    const { TPID: ein, ...rest } = row;
    map[ein] = rest;
  });

  return map;
}

let TAXATION_DATA_MAP: TaxationDataMap;

export async function init(path: string) {
  console.log('Loading Taxation data...');
  TAXATION_DATA_MAP = getData(path);
}

export function addTaxationData<T extends Restaurant>(restaurant: T): T & Taxation {
  const ein = restaurant["Employer Identification Number (EIN)"];
  const taxation: TaxationData = TAXATION_DATA_MAP[ein];

  if (!taxation) {
    throw new Error(`Could not find taxation data for ${ein}`);
  }

  return { ...restaurant, taxation };
}
