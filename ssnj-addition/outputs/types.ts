export enum TaxClearanceValues {
  Clear = 'Clear',
  Not_Clear = 'Not Clear',
  Not_Found = 'Not Found',
}

export enum OwnershipStructures {
  SoleProprietorship = 'Sole Proprietorship',
  Partnership = 'Partnership',
  C_Corporation = 'C Corporation',
  S_Corporation = 'S Corporation',
  LLC = 'Limited Liability Corporation',
  Nonprofit = 'Not For Profit',
  Other = 'Other',
}

export type Flag = 'Yes' | '';
export type YesNo = 'Yes' | 'No';
export type YesNoNA = 'Yes' | 'No' | 'N/A';
export type NullableNumber = number | null;
export type NullableString = string | null;

export interface QuarterlyWageData {
  fteCount: NullableNumber;
  quarterDesc: NullableString;
}

export interface ValueObject {
  Value: number;
  ExtensionData: null;
}

export type Value = ValueObject | null;

export interface SSNJRestaurant {
  ProductRecordId: string;
  Name: string;
  DoingBusinessAs: string;
  EIN: string;
  WebSiteURL: string;
  NAICS: string;
  SelfIdentifyAs: string;
  ExistsPriorFeb2020: YesNo;
  FirstName: string;
  LastName: string;
  Title: string;
  Phone: string;
  Cell: string;
  Email: string;
  address1Line1: string;
  address1Line2: string;
  address1City: string;
  address1Zip: string;
  address1State: string;
  address1County: string;
  address2Line1: string;
  address2Line2: string;
  address2City: string;
  address2Zip: string;
  address2State: string;
  address2County: string;
  NegativeImpacts: string;
  ExplainNegativeImpacts: string;
  TotalFTECountfromWR30: NullableNumber;
  Status: string; // TODO: make a code enum
  Findings: string;
}

type SSNJRestaurants = SSNJRestaurant[];

export interface OlaDatas {
  SSNJRestaurants: SSNJRestaurants;
}
