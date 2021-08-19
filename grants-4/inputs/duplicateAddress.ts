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

interface DuplicateAddressRecord {
  readonly EIN: string;
  readonly ApplicationID: string;
  readonly ApplicantName: string;
  readonly StreetAddress12: string;
}

interface DuplicateAddressData {
  readonly DuplicateAddressRecords: DuplicateAddressRecord[];
  readonly DuplicateApplicationIDs: string;
}

export interface DuplicateAddress {
  readonly DuplicateAddress: DuplicateAddressData;
}

const DuplicateAddress_MAP = new Map<string, DuplicateAddressRecord[]>();

export async function init(path: string) {
  console.log('Loading Duplicate Address data...');
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
    const streetAddress12 = rawRecord.StreetAddress12?.toString().trim();
    if (!DuplicateAddress_MAP.has(streetAddress12.trim())) {
      DuplicateAddress_MAP.set(streetAddress12.trim(), []);
    }

    const DuplicateAddressRecords: DuplicateAddressRecord[] = <DuplicateAddressRecord[]>DuplicateAddress_MAP.get(streetAddress12.trim());
    const DuplicateAddressRecord: DuplicateAddressRecord = {
      EIN: rawRecord.EIN,
      ApplicationID: rawRecord.ApplicationID,
      ApplicantName: rawRecord.ApplicantName,
      StreetAddress12: rawRecord.StreetAddress12.trim()
    };

    DuplicateAddressRecords.push(DuplicateAddressRecord);

  });
}

export function addDuplicateAddressData<T extends Application>(application: T): T & DuplicateAddress {
  
  //console.log("Applicant EIN:" + application.Business_TIN);
  //console.log("Applicant Address:" + application.ContactInformation_PrimaryBusinessAddress_Line1?.toString().trim() + "," + 
  //(application.ContactInformation_PrimaryBusinessAddress_Line2 != null ?application.ContactInformation_PrimaryBusinessAddress_Line2.toString().trim() : ""));
  const DuplicateAddressRecords: DuplicateAddressRecord[] = <DuplicateAddressRecord[]>DuplicateAddress_MAP.get(
    (application.ContactInformation_PrimaryBusinessAddress_Line1?.toString().trim() + "," + (application.ContactInformation_PrimaryBusinessAddress_Line2 != null ?application.ContactInformation_PrimaryBusinessAddress_Line2.toString().trim() : "")).trim()
    ) || [];

  var DuplicateIDs: string = '';
  DuplicateAddressRecords.forEach(function (value) {
    DuplicateIDs += value.ApplicationID + ", ";
  });

  const DuplicateAddress: DuplicateAddressData = {
    DuplicateAddressRecords: DuplicateAddressRecords || [],
    DuplicateApplicationIDs: DuplicateIDs.trim()
  };

  console.log(DuplicateAddress);

  return { ...application, DuplicateAddress };
}
