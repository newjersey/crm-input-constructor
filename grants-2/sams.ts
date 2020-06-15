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

const SAMS_EXCLUSION_RECORDS: SamsExclusionRecord[] = []; // TODO: populate

function isPossibleMatch<T extends Application & Taxation>(
  application: T,
  record: SamsExclusionRecord
): boolean {
  // TODO -- identify matches
  return false;
}

export function addSamsData<T extends Application & Taxation>(application: T): T & Sams {
  const possibleMatches: SamsExclusionRecord[] = SAMS_EXCLUSION_RECORDS.filter(record =>
    isPossibleMatch(application, record)
  );

  const sams: PosssibleMatches = { possibleMatches };

  return { ...application, sams };
}
