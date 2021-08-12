import XLSX from 'xlsx';
import { Restaurant } from './';

// assumes single-sheet workbook
function getEins(filePath: string): string[] {
  const einRe = /\d-(\d{3})-(\d{3})-(\d{3})\/\d{3}-\d{2}/;
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];

  return (<string[][]>XLSX.utils.sheet_to_json(sheet, { defval: undefined, header: 1 }))
    .flat()
    .filter(ein => ein && ein.trim())
    .map(ein => ein.trim())
    .map(ein => ein.replace(einRe, '$1$2$3'));
}

interface DolData {
  readonly isActiveEmployer: boolean;
  readonly uidNoGo: boolean;
  readonly whdNoGo: boolean;
}

export interface Dol {
  readonly dol: DolData;
}

let ACTIVE_EMPLOYER_EIN_SET = new Set<string>();
let UID_NO_GO_EIN_SET = new Set<string>();
let WHD_NO_GO_EIN_SET = new Set<string>();

export async function init(activeEmployersPath: string, uidNoGoPath: string, whdNoGoPath: string) {
  console.log('Loading DOL active employers...');
  getEins(activeEmployersPath).forEach(ein => ACTIVE_EMPLOYER_EIN_SET.add(ein));

  console.log('Loading DOL UID no-go list...');
  getEins(uidNoGoPath).forEach(ein => UID_NO_GO_EIN_SET.add(ein));

  console.log('Loading DOL WHD no-go list...');
  getEins(whdNoGoPath).forEach(ein => WHD_NO_GO_EIN_SET.add(ein));
}

export function addDolData<T extends Restaurant>(restaurant: T): T & Dol {
  const ein = restaurant["Employer Identification Number (EIN)"].trim();
  const dol: DolData = {
    isActiveEmployer: ACTIVE_EMPLOYER_EIN_SET.has(ein),
    uidNoGo: UID_NO_GO_EIN_SET.has(ein),
    whdNoGo: WHD_NO_GO_EIN_SET.has(ein),
  };

  return { ...restaurant, dol };
}
