const XLSX = require('xlsx');

export enum YesNo {
  Yes = 'Yes',
  No = 'No',
}

export interface RestaurantAddition {
  readonly SSNJRestaurantAddition_Id: string;
  readonly Welcome_InstructionsRead: YesNo;
  readonly Organization_BusinessName: string;
  readonly Organization_DoingBusinessAsDBA: string;
  readonly Organization_EIN: string;
  readonly Organization_Email: string;
  readonly ElectronicSignature_ElectronicSignatureAgreement: YesNo;
  readonly ElectronicSignature_AcceptTerms: YesNo;
  readonly ElectronicSignature_FullNameSignature: string;
  readonly Entry_Status: string;
  readonly Entry_DateCreated: number;
  readonly Entry_DateSubmitted: number;
  readonly Entry_DateUpdated: number;
}

function getRestaurantAdditions(filePath: string): RestaurantAddition[] {
  console.log('Getting all restaurant additions...');

  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheet = workbook.Sheets['SSNJRestaurantAddition'];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}

export function makeGetRestaurantAddition(filePath: string) {
  const allRestaurantAdditions = getRestaurantAdditions(filePath);
  const getRestaurantAddition = (entryNumber: string): RestaurantAddition => {
    const restaurantAdditions = allRestaurantAdditions.filter(
      ra => ra.SSNJRestaurantAddition_Id === entryNumber
    );

    if (restaurantAdditions.length < 1) {
      throw new Error(`Could not find restaurant addition with entry number ${entryNumber}`);
    } else if (restaurantAdditions.length > 1) {
      throw new Error(`Found multiple restaurant additions with entry number ${entryNumber}`);
    } else {
      return restaurantAdditions[0];
    }
  };

  return getRestaurantAddition;
}
