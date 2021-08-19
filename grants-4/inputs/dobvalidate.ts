const fs = require('fs');
const neatCsv = require('neat-csv');
import { Console } from 'console';
import { Application } from './applications';

interface RawRecord {
  readonly Program : string;
  readonly ApplicationID : string;
  readonly ApplicantName : string;
  readonly EIN : string;
  readonly Amount : number;
}

interface DOBRecord {
  readonly EIN: string;
  readonly Program: string;
  readonly Amount: number;
}

interface DOBValidationData {
  readonly DOBRecords: DOBRecord[];
  readonly DOBFindings: string;
  readonly DOBAmounts: string;
}

export interface DOBValidation {
  readonly DOBValidation: DOBValidationData;
}

const DOBValidation_MAP = new Map<string, DOBRecord[]>();

export async function init(path: string) {
  console.log('Loading Sister Agencies DOB Validation data...');
  const raw: string = fs.readFileSync(path);

  (
    await neatCsv(raw, {
      strict: true,
      headers: [
        'Program',
        'ApplicationID',
        'ApplicantName',
        'EIN',
        'Amount'
      ],
    })
  ).forEach((rawRecord: RawRecord) => {
    const ein = rawRecord.EIN.replace("'","");
    if (!DOBValidation_MAP.has(ein)) {
      DOBValidation_MAP.set(ein, []);
    }

    const DOBRecords: DOBRecord[] = <DOBRecord[]>DOBValidation_MAP.get(ein);
    const DOBRecord: DOBRecord = {
      EIN: rawRecord.EIN,
      Program: rawRecord.Program,
      Amount: rawRecord.Amount,
    };

    DOBRecords.push(DOBRecord);

  });
}

export function addDOBValidationData<T extends Application>(application: T): T & DOBValidation {
  
  //console.log("Applicant EIN:" + application.Business_TIN);
  const DOBRecords: DOBRecord[] = <DOBRecord[]>DOBValidation_MAP.get(application.Business_TIN) || [];

  let i = 1;
  var DOBFindingsString: string = '';
  var DOBAmount: string = '';
  DOBRecords.forEach(function (value) {
    const Program: string = value.Program;
    const Amount: number = value.Amount;
    DOBFindingsString += " DOB " + (i++) + ": Program: " + Program + ", Amount: " + Amount + ",";
    DOBAmount += "Amounts: " + Program + Amount + Program +  ",";
  });

  const DOBValidation: DOBValidationData = {
    DOBRecords: DOBRecords || [],
    DOBFindings: DOBFindingsString,
    DOBAmounts: DOBAmount
  };

  //console.log(DOBValidation);

  return { ...application, DOBValidation };
}
