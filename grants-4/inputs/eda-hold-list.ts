import XLSX from 'xlsx';
import { Application } from './applications';

// assumes single-sheet workbook
function getEins(filePath: string): string[] {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];

  return (<string[][]>XLSX.utils.sheet_to_json(sheet, { defval: undefined, header: 1 }))
    .flat()
    .filter(ein => ein.toString().trim())
    .map(ein => ein.toString().trim());
}

interface EDAHoldListData {
  readonly isEDAHoldListEmployer: boolean;
}

export interface EDAHoldList {
  readonly EDAHoldList: EDAHoldListData;
}

let EDA_HOLD_LIST_EMPLOYER_EIN_SET = new Set<string>();

export async function init(EDAHoldListEmployersPath: string) {
  console.log('Loading EDA HOLD List...');
  getEins(EDAHoldListEmployersPath).forEach(ein => EDA_HOLD_LIST_EMPLOYER_EIN_SET.add(ein));
}

export function addEDAHoldListData<T extends Application>(application: T): T & EDAHoldList {
  const EDAHoldList: EDAHoldListData = {
    isEDAHoldListEmployer: EDA_HOLD_LIST_EMPLOYER_EIN_SET.has(application.Business_TIN.toString().trim()),
  };

  return { ...application, EDAHoldList};
}
