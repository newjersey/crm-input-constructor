const fs = require('fs');
const neatCsv = require('neat-csv');
const stringSimilarity = require('string-similarity');
import { Application } from './applications';
import { Taxation } from './taxation';

interface SamsExclusionRecord {
  readonly Classification: string;
  readonly Name: string;
  readonly Prefix: string;
  readonly First: string;
  readonly Middle: string;
  readonly Last: string;
  readonly Suffix: string;
  readonly 'Address 1': string;
  readonly 'Address 2': string;
  readonly 'Address 3': string;
  readonly 'Address 4': string;
  readonly City: string;
  readonly 'State / Province': string;
  readonly Country: string;
  readonly 'Zip Code': string;
  readonly DUNS: string;
  readonly 'Exclusion Program': string;
  readonly 'Excluding Agency': string;
  readonly 'CT Code': string;
  readonly 'Exclusion Type': string;
  readonly 'Additional Comments': string;
  readonly 'Active Date': string;
  readonly 'Termination Date': string;
  readonly 'Record Status': string;
  readonly 'Cross-Reference': string;
  readonly 'SAM Number': string;
  readonly CAGE: string;
  readonly NPI: string;
  readonly Creation_Date: string;
}

interface PosssibleMatches {
  readonly possibleMatches: SamsExclusionRecord[];
}

interface Sams {
  readonly sams: PosssibleMatches;
}

function shouldFlag(a: string, b: string): boolean {
  return (
    !!a &&
    !!a.trim() &&
    !!b &&
    !!b.trim() &&
    stringSimilarity.compareTwoStrings(a.trim().toUpperCase(), b.trim().toUpperCase()) >= 0.85
  );
}

function isPossibleMatch<T extends Application & Taxation>(
  application: T,
  record: SamsExclusionRecord
): boolean {
  return (
    shouldFlag(record.Name, application.ContactInformation_BusinessName) ||
    shouldFlag(record.Name, application.ContactInformation_DoingBusinessAsDBA) ||
    shouldFlag(record.Name, application.taxation['TAXREG Name'])
  );
}

let SAMS_EXCLUSION_RECORDS: SamsExclusionRecord[];

export async function init(path: string) {
  console.log('Loading SAMS data...');
  const raw: string = fs.readFileSync(path);
  SAMS_EXCLUSION_RECORDS = await neatCsv(raw);
}

export function addSamsData<T extends Application & Taxation>(application: T): T & Sams {
  const possibleMatches: SamsExclusionRecord[] = SAMS_EXCLUSION_RECORDS.filter(record =>
    isPossibleMatch(application, record)
  );

  const sams: PosssibleMatches = { possibleMatches };

  return { ...application, sams };
}
