import XLSX from 'xlsx';
import { Application } from './applications';

interface DolData {
  readonly isActiveEmployer: boolean;
}

interface Dol {
  readonly dol: DolData;
}

// assumes single-sheet workbook
function getEins(filePath: string): string[] {
  const einRe = /\d-(\d{3})-(\d{3})-(\d{3})\/\d{3}-\d{2}/;
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  return (<string[][]>(
    XLSX.utils.sheet_to_json(sheet, { defval: null, header: 1 })
  ))
    .flat()
    .map(ein => ein.replace(einRe, '$1$2$3'));
}

const eins: string[] = getEins('/Users/ross/NJEDA Grants Phase 2/First 5 hours/DOL Lists/Active-Emps-03302020.xlsx');

export function addDolData<T extends Application>(application: T): T & Dol {
  const dol: DolData = {
    isActiveEmployer: eins.includes(application.Business_TIN),
  };

  return { ...application, dol };
}
