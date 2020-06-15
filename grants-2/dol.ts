import XLSX from 'xlsx';
import { Application } from './applications';

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
    .filter(ein => ein && ein.trim())
    .map(ein => ein.trim())
    .map(ein => ein.replace(einRe, '$1$2$3'));
}

const ACTIVE_EMPLOYER_EINS: string[] = getEins('/Users/ross/NJEDA Grants Phase 2/First 5 hours/DOL Lists/Active-Emps-03302020.xlsx');
const UID_NO_GO_EINS: string[] = getEins('/Users/ross/NJEDA Grants Phase 2/First 5 hours/DOL Lists/No.Go.List.3.30.2020.UID.xlsx');
const WHD_NO_GO_EINS: string[] = getEins('/Users/ross/NJEDA Grants Phase 2/First 5 hours/DOL Lists/No.Go.List.3.30.2020.WHD.xlsx');

interface DolData {
  readonly isActiveEmployer: boolean;
  readonly uidNoGo: boolean;
  readonly whdNoGo: boolean;
}

interface Dol {
  readonly dol: DolData;
}

export function addDolData<T extends Application>(application: T): T & Dol {
  const dol: DolData = {
    isActiveEmployer: ACTIVE_EMPLOYER_EINS.includes(application.Business_TIN.trim()),
    uidNoGo: UID_NO_GO_EINS.includes(application.Business_TIN.trim()),
    whdNoGo: WHD_NO_GO_EINS.includes(application.Business_TIN.trim()),
  };

  return { ...application, dol };
}
