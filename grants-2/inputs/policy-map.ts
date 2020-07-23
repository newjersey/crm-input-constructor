import { Application } from './applications';
import XLSX from 'xlsx';

export enum EligibilityStatus {
  Eligible = 'Eligible',
  Eligible_Contiguous = 'Eligible (Contiguous)',
  Eligible_LIC = 'Eligible (LIC)',
  Not_Eligible = 'Not Eligible',
  Not_Found = 'Not Found',
}

interface Row {
  readonly 'Census Tract': number;
  readonly 'Eligibility status for Opportunity Zones, as of 2018.': EligibilityStatus;
  readonly 'OLA ID': string;
}

interface PolicyMapData extends Row {
  readonly censusTract: number;
  readonly eligibilityStatus: EligibilityStatus;
}

type PolicyMapDataMap = Map<string, PolicyMapData>;

export interface PolicyMap {
  readonly policyMap?: PolicyMapData;
}

// assumes single-sheet workbook
function getData(filePath: string): PolicyMapDataMap {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet, { defval: undefined });
  const map: PolicyMapDataMap = new Map();

  rows.forEach(row => {
    const {
      'OLA ID': applicationID,
      'Census Tract': censusTract,
      'Eligibility status for Opportunity Zones, as of 2018.': eligibilityStatus,
    } = row;

    const policyMapData: PolicyMapData = {
      ...row,
      censusTract,
      eligibilityStatus,
    };

    map.set(applicationID, policyMapData);
  });

  return map;
}

let POLICY_MAP_DATA_MAP: PolicyMapDataMap;

export async function init(path: string) {
  console.log('Loading Policy Map data...');
  POLICY_MAP_DATA_MAP = getData(path);
}

export function addPolicyMapData<T extends Application>(application: T): T & PolicyMap {
  const policyMap = POLICY_MAP_DATA_MAP.get(application.ApplicationId);

  return { ...application, policyMap };
}
