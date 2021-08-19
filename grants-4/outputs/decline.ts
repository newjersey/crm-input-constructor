import { Decision, DecoratedApplication, Finding_Decline } from './types';
import { getDecision } from './helpers';
import { getFindings } from './findings';
import { dateFromExcel } from '../util';

const { addDays, format } = require('date-fns');

export interface Decline {
  application_id: string;
  application_sequence_id: string;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  address1: string;
  address2: string;
  city_state_zip: string;
  reasons: string[];
  appeal_url: string;
  expiration: string;
}

const getReasons = (findings: Finding_Decline[]): string[] => {
  return findings.map(finding => finding.publicMessage);
};

const getAppealUrl = (app: DecoratedApplication, findings: Finding_Decline[]): string => {
  const entry = {
    ApplicationID: app.ApplicationId,
    EntityName: app.ContactInformation_BusinessName.trim().trim(),
    EntityType: app.Business_EntityType,
    EIN: app.Business_TIN.toString().trim(),
    NAICS: app.NAICSCode,
    YearFounded: dateFromExcel(<number>app.Business_DateEstablished).toLocaleDateString(),
    Expiration: format(addDays(new Date(), 9), 'yyyy-MM-dd'),
    Email: app.ContactInformation_Email.trim(),
    Reasons: findings.map(finding => finding.slug),

  };

  const json = JSON.stringify(entry);
  const buffer = Buffer.from(json);
  const entryBase64 = buffer.toString('base64');
  const encodedEntry = encodeURIComponent(entryBase64);

  return `https://forms.business.nj.gov/grant-4-appeal/?code=${encodedEntry}`;
};

export const generateDecline = (app: DecoratedApplication): Decline | null => {
  if (getDecision(app) !== Decision.Decline) {
    return null;
  }
  const findings = <Finding_Decline[]>(
    getFindings(app).filter(finding => finding.severity === Decision.Decline)
  );
  const city_state_zip = `${app.ContactInformation_Geography_Label}, NJ ${app.ContactInformation_ZipFirst5}`;

  return {
    application_id: app.ApplicationId,
    application_sequence_id: app.njeda_submittedordernumber,
    email: app.ContactInformation_Email.trim(),
    first_name: app.ContactInformation_ContactName_First.trim(),
    last_name: app.ContactInformation_ContactName_Last.trim(),
    business_name: app.ContactInformation_BusinessName.trim(),
    address1: (!!app.ContactInformation_PrimaryBusinessAddress_Line1) ? app.ContactInformation_PrimaryBusinessAddress_Line1.toUpperCase().trim() : '',
    address2: (!!app.ContactInformation_PrimaryBusinessAddress_Line2) ? app.ContactInformation_PrimaryBusinessAddress_Line2.toUpperCase().trim(): '',
    city_state_zip,
    reasons: getReasons(findings),
    appeal_url: getAppealUrl(app, findings),
    expiration: format(addDays(new Date(), 7), 'MM/dd/yyyy')
  };
};
