import { Application } from './applications';
import { normalize } from './address';

type ApplicationIDArray = string[];

const seenEins = new Map<string, ApplicationIDArray>();
const seenAddresses = new Map<string, ApplicationIDArray>();

interface DuplicateData {
  readonly byTin?: ApplicationIDArray;
  readonly byAddress?: ApplicationIDArray;
  readonly serializedAddress: string;
}

export interface Duplicates {
  readonly duplicates: DuplicateData;
}

// intentionally doesn't look at city/municipality/zip to ensure we flag as many as possible
function serializeAddress<T extends Application>(application: T): string {
  const line1: string = application.ContactInformation_PrimaryBusinessAddress_Line1;
  const line2: string = application.ContactInformation_PrimaryBusinessAddress_Line2;

  return normalize(`${line1} ${line2}`)
    .replace(/\W/g, '')
    .toUpperCase();
}

export function addDuplicateData<T extends Application>(application: T): T & Duplicates {
  const address: string = serializeAddress(application);

  // make a shallow copy of collections before adding to them
  const duplicates: DuplicateData = {
    byTin: seenEins.get(application.Business_TIN)?.slice(),
    byAddress: seenAddresses.get(address)?.slice(),
    serializedAddress: address, // to help with debugging
  };

  // init collections
  if (!seenEins.has(application.Business_TIN)) {
    seenEins.set(application.Business_TIN, []);
  }
  if (!seenAddresses.has(address)) {
    seenAddresses.set(address, []);
  }

  // add this application's data to collections
  seenEins.get(application.Business_TIN)?.push(application.ApplicationId);
  seenAddresses.get(address)?.push(application.ApplicationId);

  return { ...application, duplicates };
}
