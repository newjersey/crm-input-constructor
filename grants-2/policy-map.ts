import XLSX from 'xlsx';
import { Application } from './applications';

enum EligibilityStatus {
  Eligible_Contiguous = 'Eligible (Contiguous)',
  Eligible_LIC = 'Eligible (LIC)',
  Not_Eligible = 'Not Eligible',
}

interface Row {
  readonly 'Census Tract': number;
  readonly State: string;
  readonly 'FIPS Code': number;
  readonly 'Formatted FIPS': string;
  readonly 'Eligibility status for Qualified Opportunity Zones, as of 2018.': EligibilityStatus;
  readonly NJEDAGrantApplication8_Id: number;
  readonly Column4: string;
  readonly 'Submittal Id': number;
  readonly 'Business Name': string;
  readonly 'Street 1': string;
  readonly 'Street 2': string;
  readonly ContactInformation_Geography_Label: string;
  readonly Zip: number;
  readonly State_1: string;
}

interface PolicyMapData extends Row {
  readonly censusTract: number;
  readonly eligibilityStatus: EligibilityStatus;
}

type PolicyMapDataMap = Map<string, PolicyMapData>;

export interface PolicyMap {
  readonly policyMap: PolicyMapData;
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
      Column4: languageSequence,
      'Census Tract': censusTract,
      'Eligibility status for Qualified Opportunity Zones, as of 2018.': eligibilityStatus,
    } = row;

    const applicationID = languageSequence.replace(/(\w{2})-(\d+)/, 'CV19G$1$2');
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
  const applicationId = application.ApplicationId;

  if (!POLICY_MAP_DATA_MAP.has(applicationId)) {
    throw new Error(`Could not find Policy Map entry for application ${applicationId}`);
  }

  const policyMap: PolicyMapData = <PolicyMapData>POLICY_MAP_DATA_MAP.get(applicationId);

  return { ...application, policyMap };
}
