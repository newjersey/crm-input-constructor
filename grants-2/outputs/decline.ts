import { Decision, DecoratedApplication, Finding_Decline } from './types';
import { getDecision } from './helpers';
import { getFindings } from './findings';

const { addDays, format } = require('date-fns');

export interface Decline {
  application_id: string;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  address1: string;
  address2: string;
  city_state_zip: string;
  reasons: string[];
  appeal_url: string;
}

const getReasons = (findings: Finding_Decline[]): string[] => {
  return findings.map(finding => finding.publicMessage);
};

const getAppealUrl = (app: DecoratedApplication, findings: Finding_Decline[]): string => {
  const entry = {
    ApplicationID: app.ApplicationId,
    EntityName: app.ContactInformation_BusinessName.trim().trim(),
    EIN: app.Business_TIN.trim(),
    NAICS: app.NAICSCode,
    YearFounded: app.Business_YearEstablished,
    Expiration: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    Email: app.ContactInformation_Email.trim(),
    Reasons: findings.map(finding => finding.slug),
  };

  const json = JSON.stringify(entry);
  const buffer = Buffer.from(json);
  const entryBase64 = buffer.toString('base64');

  return `https://forms.business.nj.gov/grant-2-appeal/?code=${entryBase64}`;
};

export const generateDecline = (app: DecoratedApplication): Decline | null => {
  if (getDecision(app) !== Decision.Decline) {
    return null;
  }
  const findings = <Finding_Decline[]>(
    getFindings(app).filter(finding => finding.severity === Decision.Decline)
  );
  const city_state_zip = `${app.geography.City.trim()}, ${app.ContactInformation_PrimaryBusinessAddress_State.trim()} ${app.ContactInformation_PrimaryBusinessAddress_PostalCode.padStart(
    5,
    '0'
  ).trim()}`;

  return {
    application_id: app.ApplicationId,
    email: app.ContactInformation_Email.trim(),
    first_name: app.ContactInformation_ContactName_First.trim(),
    last_name: app.ContactInformation_ContactName_Last.trim(),
    business_name: app.ContactInformation_BusinessName.trim(),
    address1: app.ContactInformation_PrimaryBusinessAddress_Line1.toUpperCase().trim(),
    address2: app.ContactInformation_PrimaryBusinessAddress_Line2.toUpperCase().trim(),
    city_state_zip,
    reasons: getReasons(findings),
    appeal_url: getAppealUrl(app, findings),
  };
};
