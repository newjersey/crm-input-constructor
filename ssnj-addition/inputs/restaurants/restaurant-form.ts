const XLSX = require('xlsx');

export enum YesNo {
  Yes = 'Yes',
  No = 'No',
}

export interface RestaurantForm {
  readonly SSNJRestaurantAdditionForm_Id: string;
  readonly Inputs_Addition: string;
  readonly Inputs_Addition_Label: string;
  readonly Inputs_AdditionRequestNumber: number;
  readonly Inputs_RestaurantFormId: string;
  readonly Inputs_Checksum: number;
  readonly Inputs_ReviewCode: string;
  readonly Inputs_ReviewURL: string;
  readonly Inputs_ParentheticalDBA: string;
  readonly Inputs_DBA: string;
  readonly Inputs_RestaurantIndex: number;
  readonly Inputs_RestaurantName: string;
  readonly Inputs_RestaurantContact: string;
  readonly Inputs_RestaurantEmail: string;
  readonly Welcome_InstructionConfirmation: YesNo;
  readonly RestaurantInformation_RestaurantName: string;
  readonly RestaurantInformation_DBA: string;
  readonly RestaurantInformation_EIN: string;
  readonly RestaurantInformation_Website: string;
  readonly RestaurantInformation_PrimaryBusinessAddress_Line1: string;
  readonly RestaurantInformation_PrimaryBusinessAddress_Line2: string;
  readonly RestaurantInformation_PrimaryBusinessAddress_City: string;
  readonly RestaurantInformation_PrimaryBusinessAddress_State: string;
  readonly RestaurantInformation_PrimaryBusinessAddress_PostalCode: string;
  readonly RestaurantInformation_Designations: string;
  readonly RestaurantInformation_Designations_Value: number;
  readonly RestaurantInformation_OldEnough: YesNo;
  readonly ThankYouForYourInterest2_Regards: string;
  readonly AuthorizedRepresentative_Name_First: string;
  readonly AuthorizedRepresentative_Name_Last: string;
  readonly AuthorizedRepresentative_Title: string;
  readonly AuthorizedRepresentative_Email: string;
  readonly AuthorizedRepresentative_Phone: string;
  readonly AuthorizedRepresentative_AlternatePhone: string;
  readonly NAICSCodeKnown: YesNo;
  readonly NAICSCode: string;
  readonly NAICSCodeInfo_Industry: string;
  readonly NAICSCodeInfo_Industry_Label: string;
  readonly NAICSCodeFinder_Sector: string;
  readonly NAICSCodeFinder_Industry: string;
  readonly NAICSCodeFinder_Industry_Label: string;
  readonly NAICSCodeVerification_ConfirmNAICSCode: YesNo;
  readonly ThankYouForYourInterest_Regards: string;
  readonly COVID19HarmAttestation_NegativeImpacts: string;
  readonly COVID19HarmAttestation_Explanation: string;
  readonly DocumentUploads_IsSolePropOrSMLLC: YesNo;
  readonly ElectronicSignature_ElectronicSignatureAgreement: YesNo;
  readonly ElectronicSignature_AcceptTerms: YesNo;
  readonly ElectronicSignature_FullNameSignature: string;
  readonly Entry_Status: string;
  readonly Entry_DateCreated: number;
  readonly Entry_DateSubmitted: number;
  readonly Entry_DateUpdated: number;
}

function getRestaurantForms(filePath: string): RestaurantForm[] {
  console.log('Getting all restaurant forms...');

  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheet = workbook.Sheets['SSNJRestaurantAdditionForm'];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}

export function makeGetRestaurantForm(filePath: string) {
  const allRestaurantForms = getRestaurantForms(filePath);
  const getRestaurantForm = (entryNumber: string): RestaurantForm => {
    const restaurantForms = allRestaurantForms.filter(
      restaurantForm => restaurantForm.SSNJRestaurantAdditionForm_Id === entryNumber
    );

    if (restaurantForms.length < 1) {
      throw new Error(`Could not find restaurant form with entry number ${entryNumber}`);
    } else if (restaurantForms.length > 1) {
      throw new Error(`Found multiple restaurant form with entry number ${entryNumber}`);
    } else {
      return restaurantForms[0];
    }
  };

  return getRestaurantForm;
}
