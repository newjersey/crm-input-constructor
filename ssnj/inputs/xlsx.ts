const XLSX = require('xlsx');

export enum YesNo {
  Yes = 'Yes',
  No = 'No',
}

enum EntryStatus {
  'Incomplete',
  'Submitted',
  'Reviewed',
  'Complete',
}

export enum EntityType {
  '501(c)(3) nonprofit' = '501(c)(3) nonprofit',
  'Public entity (e.g. municipality)' = 'Public entity (e.g. municipality)',
  'S-Corporation' = 'S-Corporation',
  'Other (e.g. estate)' = 'Other (e.g. estate)',
  'C-Corporation' = 'C-Corporation',
  'Limited Liability Corporation (LLC)' = 'Limited Liability Corporation (LLC)',
  'Sole Proprietorship' = 'Sole Proprietorship',
}

export enum Designations {
  None = 0,
  Small_Business = 1,
  Minority_Owned = 2,
  Woman_Owned = 4,
  Veteran_Owned = 8,
  Disabled_Owned = 16,
}

export interface Row {
  readonly SSNJGrantApplication_Id: string;
  readonly Welcome_InstructionsRead: 'Yes';
  readonly Eligibility_IsRestaurant: 'No';
  readonly Organization_BusinessName: string;
  readonly Organization_DoingBusinessAsDBA: string | '';
  readonly Organization_EntityType: EntityType;
  readonly Organization_EntityType_Value: number;
  readonly Organization_NonprofitClassification: '';
  readonly Organization_OtherEntityType: '' | 'NJ Non Profit Corp' | '501(c)(3) pending nonprofit';
  readonly Organization_EIN: string;
  readonly Organization_Website: string;
  readonly Organization_Religious: YesNo;
  readonly Organization_LobbyingPolitical: 'No';
  readonly NAICSCodeKnown: YesNo;
  readonly NAICSCode: string;
  readonly NAICSCodeInfo_Industry: string;
  readonly NAICSCodeInfo_Industry_Label: string;
  readonly NAICSCodeFinder_Sector: string;
  readonly NAICSCodeFinder_Industry: string;
  readonly NAICSCodeFinder_Industry_Label: string;
  readonly NAICSCodeVerification_ConfirmNAICSCode: 'Yes';
  readonly ThankYouForYourInterest_Regards: 'NJEDA';
  readonly OrganizationAddress_PhysicalAddress_Line1: string;
  readonly OrganizationAddress_PhysicalAddress_Line2: string;
  readonly OrganizationAddress_PhysicalAddress_City: string;
  readonly OrganizationAddress_PhysicalAddress_State: 'New Jersey';
  readonly OrganizationAddress_PhysicalAddress_PostalCode: string;
  readonly OrganizationAddress_MailingAddressSame: YesNo;
  readonly OrganizationAddress_MailingAddress_Line1: string;
  readonly OrganizationAddress_MailingAddress_Line2: string;
  readonly OrganizationAddress_MailingAddress_City: string;
  readonly OrganizationAddress_MailingAddress_State: 'New Jersey';
  readonly OrganizationAddress_MailingAddress_PostalCode: string;
  readonly AuthorizedRepresentitive_ContactName_First: string;
  readonly AuthorizedRepresentitive_ContactName_Last: string;
  readonly AuthorizedRepresentitive_Title: string;
  readonly AuthorizedRepresentitive_Phone: string;
  readonly AuthorizedRepresentitive_AlternatePhone: string;
  readonly AuthorizedRepresentitive_Email: string;
  readonly AuthorizedRepresentitive_EmailConfirm: string;
  readonly Capacity_Description: string;
  readonly Capacity_Activities: string;
  readonly GrantRequest_Meals: number;
  readonly GrantRequest_UnitCost: number;
  readonly GrantRequest_GrantRequest: number;
  readonly GrantRequest_GrantRequestConfirmation: 'Yes';
  readonly LegalQuestionnaire_BackgroundQuestion1: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails1: '';
  readonly LegalQuestionnaire_BackgroundQuestion2: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails2: '';
  readonly LegalQuestionnaire_BackgroundQuestion3: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails3: '';
  readonly LegalQuestionnaire_BackgroundQuestion4: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails4: '';
  readonly LegalQuestionnaire_BackgroundQuestion5: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails5: '';
  readonly LegalQuestionnaire_BackgroundQuestion6: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails6: '';
  readonly LegalQuestionnaire_BackgroundQuestion7: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails7: '';
  readonly LegalQuestionnaire_BackgroundQuestion8: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails8: '';
  readonly LegalQuestionnaire_BackgroundQuestion9: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails9: '';
  readonly LegalQuestionnaire_BackgroundQuestion10: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails10: '';
  readonly LegalQuestionnaire_BackgroundQuestion11: 'No';
  readonly LegalQuestionnaire_BackgroundQuestionDetails11: '';
  readonly CertificationAndRelease_LegalCertification1: 'Yes';
  readonly CertificationAndRelease_LegalCertification2: 'Yes';
  readonly CertificationOfApplication_Certification1: 'Yes';
  readonly CertificationOfApplication_Certification2: 'Yes';
  readonly CertificationOfApplication_Certification3: 'Yes';
  readonly CertificationOfApplication_Certification4: 'Yes';
  readonly CertificationOfApplication_Certification5: 'Yes';
  readonly CertificationOfApplication_Certification6: 'Yes';
  readonly CertificationOfApplication_Certification7: 'Yes';
  readonly CertificationOfApplication_Confirmation_AccurateAndTruthful: 'Yes';
  readonly CertificationOfApplication_Confirmation_TINConfirm: string;
  readonly ElectronicSignature_ElectronicSignatureAgreement: 'Yes';
  readonly ElectronicSignature_AcceptTerms: 'Yes';
  readonly ElectronicSignature_FullNameSignature: string;
  readonly Entry_Status: EntryStatus;
  readonly Entry_DateCreated: number;
  readonly Entry_DateSubmitted: number;
  readonly Entry_DateUpdated: number;
  readonly Religious: 'Religious affiliation.' | '';
  readonly Political: '';
  readonly 'Tax Clearance Uploaded': 'Missing tax clearance certificate.' | '';
  readonly 'Eligible NAICS': '';
  readonly 'History >= 3,000 Meals': string;
  readonly 'History >= $50,000': string;
  readonly 'Yes on Legal Questionnaire': '';
  readonly 'Any Reviewed Restaurants': 'No reviewed restaurants.' | '';
  readonly 'DOL UID Flag': 'DOL UID flag.' | '';
  readonly 'DOL WHD Flag': '';
  readonly Flags: string;
  readonly 'App Number': number;
  readonly Name: string;
  readonly DBA: string;
}

// assumes single-sheet workbook
export function getRows(filePath: string): Row[] {
  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });

  return rows;
}
