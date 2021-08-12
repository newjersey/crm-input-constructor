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
  ProductUserRecordId: string;
  njeda_projectuser: string;
  EIN: string;
  BusinessName: string;
  Findings: string;
}

type SSNJRestaurants = SSNJRestaurant[];
export type OlaDatas = SSNJRestaurants;
