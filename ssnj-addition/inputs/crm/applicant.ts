const XLSX = require('xlsx');

export interface Applicant {
  readonly '(Do Not Modify) Product': string;
  readonly '(Do Not Modify) Row Checksum': string;
  readonly '(Do Not Modify) Modified On': number;
  readonly 'Product ID': string;
  readonly 'Product Type': string;
  readonly 'Product Status': string;
  readonly 'Product Sub Status': string;
  readonly 'Account Name (Applicant) (Account)': string;
  readonly 'OLA Application ID (Underwriting) (Underwriting)': string;
  readonly 'EIN (Applicant) (Account)': string;
}

function getApplicants(filePath: string): Applicant[] {
  console.log('Getting all applicants...');

  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheet = workbook.Sheets['Product Advanced Find View'];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}

export function makeGetApplicant(filePath: string) {
  const allApplicants = getApplicants(filePath);
  const getApplicant = (ein: string): Applicant => {
    const applicants = allApplicants.filter(a => a['EIN (Applicant) (Account)'] === ein);

    if (applicants.length < 1) {
      throw new Error(`Could not find applicant with EIN ${ein}.`);
    } else if (applicants.length > 1) {
      throw new Error(`Multiple applicants found with EIN ${ein}.`);
    } else {
      return applicants[0];
    }
  };

  return getApplicant;
}
