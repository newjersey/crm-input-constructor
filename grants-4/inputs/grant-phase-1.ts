import { Application } from './applications';
import XLSX from 'xlsx';

export enum ProductStatuses {
  Ended = 'Ended',
  Closing = 'Closing',
  Closed = 'Closed',
  Underwriting = 'Underwriting',
}

enum ProductSubStatuses {
  Ended_Declined = 'Declined',
  InProgress_ApplicationSubmitted = 'Application Submitted',
  InProgress_ApplicationEDAReview = 'Application EDA Review',
  InProgress_ApplicationCompanyRevision = 'Application Company Revision',
  Closed_ComplianceMonitoring = 'Compliance Monitoring',
  Closed_NonCompliance = 'Non Compliance',
  Underwriting_ApprovalsinProcess = 'Approvals in Process',
  Underwriting_IncompleteApplicationUWinProgress = 'Incomplete Application-UW in Progress',
}

export interface GrantPhase1Data {
  readonly OLA: string;
  readonly 'Product Status': ProductStatuses;
  readonly 'Approval Date'?: number;
  readonly Amount?: number;
}

interface Row extends GrantPhase1Data {
  readonly 'EIN (Applicant) (Account)': string;
  readonly 'Product Type': string;
  readonly 'Product ID': string;
  readonly 'Product Sub Status': ProductSubStatuses;
  readonly 'Account Name (Applicant) (Account)': string;
  readonly 'Doing Business As (Applicant) (Account)'?: string;
  readonly 'Total NJ FT Eligible Jobs at Project Site at App. (Underwriting) (Underwriting)'?: number;
  readonly 'Closing Date'?: number;
}

interface GrantPhase1DataMap {
  [Ein: string]: GrantPhase1Data;
}

export interface GrantPhase1 {
  readonly grantPhase1?: GrantPhase1Data;
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

    // found a duplicate
    if (map[ein]) {
      const existing: GrantPhase1Data = map[ein];

      if (
        existing['Product Status'] === ProductStatuses.Ended ||
        rest['Product Status'] === ProductStatuses.Closing ||
        rest['Product Status'] === ProductStatuses.Closed
      ) {
        map[ein] = rest;
      } else if (
        rest['Product Status'] === ProductStatuses.Ended ||
        existing['Product Status'] === ProductStatuses.Closing ||
        existing['Product Status'] === ProductStatuses.Closed
      ) {
        // NOOP
      } else if (
        // neither is approved nor declined -- take the first one (oldest)
        parseInt(rest['OLA'].replace(/\D/g, ''), 10) <
        parseInt(existing['OLA'].replace(/\D/g, ''), 10)
      ) {
        map[ein] = rest;
      }
    } else {
      map[ein] = rest;
    }
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
