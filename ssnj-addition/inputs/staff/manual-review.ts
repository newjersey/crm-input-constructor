const XLSX = require('xlsx');

export enum Eligibility {
  InReview = 'In Review',
  Eligible = 'Eligible',
  Ineligible = 'Ineligible',
}

interface RawManualReview {
  readonly 'Product Number ': string;
  readonly 'Grantee Name': string;
  readonly 'Company Name': string;
  readonly 'DBA (if different)': string;
  readonly EIN: string;
  readonly 'Eligibility Determination': string;
  readonly Findings: string | number | undefined;
}

export interface ManualReview extends RawManualReview {
  readonly Eligibility: Eligibility; // because spreadsheet is dirty
}

function cleanEligibility(eligibility: string): Eligibility {
  switch (eligibility.trim().toLowerCase()) {
    case Eligibility.InReview.toLowerCase():
      return Eligibility.InReview;
    case Eligibility.Eligible.toLowerCase():
    case 'eligibile':
      return Eligibility.Eligible;
    case Eligibility.Ineligible.toLowerCase():
      return Eligibility.Ineligible;
    default:
      throw new Error(`Unrecognized eligibility: ${eligibility}`);
  }
}

function getManualReviews(filePath: string): ManualReview[] {
  console.log('Getting all Manual Reviews...');

  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheet = workbook.Sheets['Sheet1'];
  const rawRows: RawManualReview[] = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  const rows: ManualReview[] = rawRows.map(rawRow => ({
    ...rawRow,
    Eligibility: cleanEligibility(rawRow['Eligibility Determination']),
  }));

  return rows;
}

export function makeGetManualReview(filePath: string) {
  const allManualReviews = getManualReviews(filePath);
  const getManualReview = (ein: string, productNumber: string): ManualReview => {
    const manualReviews = allManualReviews.filter(
      mr => mr.EIN.toString().trim() === ein && mr['Product Number '].trim() === productNumber
    );

    if (manualReviews.length < 1) {
      throw new Error(
        `Could not find manual review for EIN ${ein} and Product Number ${productNumber}`
      );
    } else if (manualReviews.length > 1) {
      throw new Error(
        `Found multiple manual reviews for EIN ${ein} and Product Number ${productNumber}`
      );
    } else {
      if (!manualReviews[0].EIN || !manualReviews[0]['Product Number ']) {
        throw new Error(
          `Missing EIN or PROD number for EIN ${manualReviews[0].EIN} and ${manualReviews[0]['Product Number ']}`
        );
      }
      return manualReviews[0];
    }
  };

  return getManualReview;
}
