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

interface ChildCareData {
  readonly isChildCareEmployer: boolean;
}

export interface ChildCare {
  readonly childCare: ChildCareData;
}

let CHILD_CARE_EMPLOYER_EIN_SET = new Set<string>();

export async function init(childCareEmployersPath: string) {
  console.log('Loading Child Care Providers...');
  getEins(childCareEmployersPath).forEach(ein => CHILD_CARE_EMPLOYER_EIN_SET.add(ein));
}

export function addChildCareData<T extends Application>(application: T): T & ChildCare {
  const childCare: ChildCareData = {
    isChildCareEmployer: CHILD_CARE_EMPLOYER_EIN_SET.has(application.Business_TIN.toString().trim()),
  };

  return { ...application, childCare};
}
