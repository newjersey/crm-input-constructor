const fs = require('fs');
const neatCsv = require('neat-csv');
import { Console } from 'console';
import { Application } from './applications';

interface RawRecord {
  readonly ApplicationID : string;
  readonly ApplicantName : string;
  readonly StatusReason : string;
  readonly EIN : string;
  readonly StreetAddress: string;
  readonly StreetAddress2: string;
  readonly StreetAddress12: string;
  readonly City: string;
  readonly ZIP: string;
  readonly State: string;
  readonly County: string;
}

interface DuplicateEINRecord {
  readonly EIN: string;
  readonly ApplicationID: string;
  readonly ApplicantName: string;
}

interface DuplicateEINData {
  readonly DuplicateEINRecords: DuplicateEINRecord[];
  readonly DuplicateApplicationIDs: string;
}

export interface DuplicateEIN {
  readonly DuplicateEIN: DuplicateEINData;
}

const DuplicateEIN_MAP = new Map<string, DuplicateEINRecord[]>();

export async function init(path: string) {
  console.log('Loading Duplicate EIN data...');
  const raw: string = fs.readFileSync(path);

  (
    await neatCsv(raw, {
      strict: true,
      headers: [
        'ApplicationID',
        'ApplicantName',
        'StatusReason',
        'EIN',
        'StreetAddress',
        'StreetAddress2',
        'StreetAddress12',
        'City',
        'ZIP',
        'State',
        'County'
      ],
    })
  ).forEach((rawRecord: RawRecord) => {
    const ein = rawRecord.EIN.replace("'","");
    if (!DuplicateEIN_MAP.has(ein)) {
      DuplicateEIN_MAP.set(ein, []);
    }

    const DuplicateEINRecords: DuplicateEINRecord[] = <DuplicateEINRecord[]>DuplicateEIN_MAP.get(ein);
    const DuplicateEINRecord: DuplicateEINRecord = {
      EIN: rawRecord.EIN,
      ApplicationID: rawRecord.ApplicationID,
      ApplicantName: rawRecord.ApplicantName,
    };

    DuplicateEINRecords.push(DuplicateEINRecord);
  });
}

export function addDuplicateEINData<T extends Application>(application: T): T & DuplicateEIN {
  
  console.log("Applicant EIN:" + application.Business_TIN);
  const DuplicateEINRecords: DuplicateEINRecord[] = <DuplicateEINRecord[]>DuplicateEIN_MAP.get(application.Business_TIN.toString().trim()) || [];

  var DuplicateIDs: string = '';
  DuplicateEINRecords.forEach(function (value) {
    DuplicateIDs += value.ApplicationID + ", ";
  });

  const DuplicateEIN: DuplicateEINData = {
    DuplicateEINRecords: DuplicateEINRecords || [],
    DuplicateApplicationIDs: DuplicateIDs.trim()
  };

  console.log(DuplicateEIN);

  return { ...application, DuplicateEIN };
}
