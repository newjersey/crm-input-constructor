const chalk = require('chalk');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const fs = require('fs');
const XLSX = require('xlsx');
const { getJsDateFromExcel } = require('excel-date-to-js');
const { utcToZonedTime, zonedTimeToUtc } = require('date-fns-tz');

const grantEins = fs.readFileSync('loans/grant-eins.json');
const GRANT_EINS = JSON.parse(grantEins);
const US_STATES = {
  ALABAMA: 'AL',
  AL: 'AL',
  ALASKA: 'AK',
  AK: 'AK',
  ARIZONA: 'AZ',
  AZ: 'AZ',
  ARKANSAS: 'AR',
  AR: 'AR',
  CALIFORNIA: 'CA',
  CA: 'CA',
  COLORADO: 'CO',
  CO: 'CO',
  CONNECTICUT: 'CT',
  CT: 'CT',
  DELAWARE: 'DE',
  DE: 'DE',
  FLORIDA: 'FL',
  FL: 'FL',
  GEORGIA: 'GA',
  GA: 'GA',
  HAWAII: 'HI',
  HI: 'HI',
  IDAHO: 'ID',
  ID: 'ID',
  ILLINOIS: 'IL',
  IL: 'IL',
  INDIANA: 'IN',
  IN: 'IN',
  IOWA: 'IA',
  IA: 'IA',
  KANSAS: 'KS',
  KS: 'KS',
  KENTUCKY: 'KY',
  KY: 'KY',
  LOUISIANA: 'LA',
  LA: 'LA',
  MAINE: 'ME',
  ME: 'ME',
  MARYLAND: 'MD',
  MD: 'MD',
  MASSACHUSETTS: 'MA',
  MA: 'MA',
  MICHIGAN: 'MI',
  MI: 'MI',
  MINNESOTA: 'MN',
  MN: 'MN',
  MISSISSIPPI: 'MS',
  MS: 'MS',
  MISSOURI: 'MO',
  MO: 'MO',
  MONTANA: 'MT',
  MT: 'MT',
  NEBRASKA: 'NE',
  NE: 'NE',
  NEVADA: 'NV',
  NV: 'NV',
  'NEW HAMPSHIRE': 'NH',
  NH: 'NH',
  'NEW JERSEY': 'NJ',
  NJ: 'NJ',
  NJ: 'NJ',
  'NEW MEXICO': 'NM',
  NM: 'NM',
  'NEW YORK': 'NY',
  NY: 'NY',
  'NORTH CAROLINA': 'NC',
  NC: 'NC',
  'NORTH DAKOTA': 'ND',
  ND: 'ND',
  OHIO: 'OH',
  OH: 'OH',
  OKLAHOMA: 'OK',
  OK: 'OK',
  OREGON: 'OR',
  OR: 'OR',
  PENNSYLVANIA: 'PA',
  PA: 'PA',
  'RHODE ISLAND': 'RI',
  RI: 'RI',
  'SOUTH CAROLINA': 'SC',
  SC: 'SC',
  'SOUTH DAKOTA': 'SD',
  SD: 'SD',
  TENNESSEE: 'TN',
  TN: 'TN',
  TEXAS: 'TX',
  TX: 'TX',
  UTAH: 'UT',
  UT: 'UT',
  VERMONT: 'VT',
  VT: 'VT',
  VIRGINIA: 'VA',
  VA: 'VA',
  WASHINGTON: 'WA',
  WA: 'WA',
  'WEST VIRGINIA': 'WV',
  WV: 'WV',
  WISCONSIN: 'WI',
  WI: 'WI',
  WYOMING: 'WY',
  WY: 'WY',
  'DISTRICT OF COLUMBIA': 'DC',
  DC: 'DC',
  'MARSHALL ISLANDS': 'MH',
  MH: 'MH',
  'ARMED FORCES AFRICA': 'AE',
  AE: 'AE',
  'ARMED FORCES AMERICAS': 'AA',
  AA: 'AA',
  'ARMED FORCES CANADA': 'AE',
  AE: 'AE',
  'ARMED FORCES EUROPE': 'AE',
  AE: 'AE',
  'ARMED FORCES MIDDLE EAST': 'AE',
  AE: 'AE',
  'ARMED FORCES PACIFIC': 'AP',
  AP: 'AP',
};

const optionDefinitions = [
  {
    name: 'src',
    type: String,
    defaultOption: true,
    description: '(REQUIRED) Source XLSX input file; see sample.xlsx',
  },
  {
    name: 'skip',
    alias: 's',
    type: Number,
    description: 'Number of applications to skip (default 0).',
  },
  {
    name: 'count',
    alias: 'n',
    type: Number,
    description: 'Total number of applications to include (default ∞).',
  },
  {
    name: 'out',
    alias: 'o',
    type: String,
    description:
      'Path to output file; suggest naming like ola_datas_100-skipping-5.json',
  },
  {
    name: 'pretty',
    alias: 'p',
    type: Boolean,
    description:
      'Format JSON nicely on screen (does not effect JSON lines in output file).',
  },
  {
    name: 'quiet',
    alias: 'q',
    type: Boolean,
    description: 'Do not print JSON to screen.',
  },
];

function printUsage() {
  const usage = commandLineUsage([
    {
      header: 'CRM Input Constructor',
      content:
        'This takes loan data from a XLSX input file and outputs corresponding single-line JSON objects for feeding to new OLA Datas records (JSON goes in the Application Data field; applicatoin ID goes in both the Name and Application ID fields; products_selected must be "Covid Small Business Emergency Assistance Loan"',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
    {
      content: 'Example: npm run loans loans/sample.xlsx -- -p',
    },
  ]);

  console.log(usage);
}

function main() {
  const options = commandLineArgs(optionDefinitions);
  const errors = [];

  if (options.src) {
    console.log(
      `Generating OLA Datas creation JSON for ${chalk.blue(
        options.count ? options.count : '∞'
      )} applications, skipping ${chalk.blue(
        options.skip || 0
      )}, from ${chalk.blue(options.src)}${
        options.out ? chalk.blue(' to ' + options.out) : ''
      }${options.quiet || '\n'}`
    );
  } else {
    printUsage();
    return;
  }

  const workbook = XLSX.readFile(options.src, {
    type: 'file',
    sheets: ['LoanApplication', 'ProposedUseOfLoanProceeds'],
  });

  const sheet = XLSX.utils
    .sheet_to_json(workbook.Sheets['LoanApplication'], { defval: null })
    .filter(r => r.Entry_DateCreated >= 43934.375) // 2020-04-13T13:00:00.000Z
    .sort((a, b) => a.Entry_DateSubmitted - b.Entry_DateSubmitted)
    .slice(options.skip, options.count && options.count + (options.skip || 0));

  const useOfFundsSheet = XLSX.utils.sheet_to_json(
    workbook.Sheets['ProposedUseOfLoanProceeds'],
    { defval: null }
  );

  const n = sheet.length;
  const cum = sheet
    .map(application => application.LoanAmountRequested)
    .reduce((a, x) => a + x, 0);

  const data = sheet.map(application => {
    try {
      return generateObject(decorate(application), useOfFundsSheet);
    } catch (e) {
      errors.push(application, e);
    }
  });

  const json = JSON.stringify(data);

  if (options.out) {
    fs.writeFile(options.out, json, function () {
      console.log(`Output written to ${chalk.blue(options.out)}`);
    });
  }

  if (!options.quiet) {
    console.log(options.pretty ? data : json);
  }

  if (errors.length) {
    console.log(
      chalk.bold.red(`\n${errors.length} applications threw errors:`)
    );
    errors.forEach(e => console.log(e));
  } else {
    console.log(
      `\n${chalk.green(n)} records generated successfully (${chalk.green(
        '$' + cum.toLocaleString()
      )} in requested funding).`
    );
  }
}

function bool(yesNo) {
  switch (yesNo) {
    case 'Yes':
    case 'TRUE':
      return true;
    case 'No':
    case 'FALSE':
      return false;
    default:
      throw new Error(`Cannot convert to boolean: ${yesNo}`);
  }
}

function decorate(application) {
  return application;
}

function taxClearance(status) {
  switch (status) {
    case 'Y':
      return 'Clear';
    case 'N':
      return 'Not Clear';
    case 'X':
      return 'Not Found';
    default:
      throw new Error(`Unexpected tax value: ${status}`);
  }
}

// given a string of fractional days since 01/01/1900, return milliseconds only for the day part (not time)
function formatDate(excelFloat) {
  const _date = date(excelFloat);

  _date.setHours(0, 0, 0, 0);

  return `\/Date(${_date.getTime()})\/`;
}

function date(excelFloat) {
  const excelFloatString = excelFloat.toString(10);

  // dumb getJsDateFromExcel API wants a string for some reason
  const utcDate = getJsDateFromExcel(excelFloatString);

  // dumb getJsDateFromExcel library returns local date as UTC
  return utcToZonedTime(utcDate, 'UTC');
}

function productStatusId(application) {
  if (bool(application['IMMEDIATE DECLINE'])) {
    return '{359B8B3E-65F7-E511-80DE-005056AD31F5}';
  } else {
    return '{A23854FF-59F7-E511-80DE-005056AD31F5}';
  }
}

function productSubStatusId(application) {
  if (bool(application['CLEAR'])) {
    return '{0FE1E76F-8359-E611-80D3-005056ADEF6F}';
  }
  if (bool(application['MANUAL REVIEW'])) {
    return '{29E1E76F-8359-E611-80D3-005056ADEF6F}';
  }
  if (bool(application['IMMEDIATE DECLINE'])) {
    return '{19E1E76F-8359-E611-80D3-005056ADEF6F}';
  }

  throw new Error('Unexpected state in productSubStatusId');
}

function monitoringStatus(application) {
  // If Approved: Completed
  // If Exception: In Planning
  // If Denied: Findings"

  if (bool(application['CLEAR'])) {
    return 'Completed';
  }
  if (bool(application['MANUAL REVIEW'])) {
    return 'In Planning';
  }
  if (bool(application['IMMEDIATE DECLINE'])) {
    return 'Findings';
  }

  throw new Error('Unexpected state in monitoringStatus');
}

function monitoringType(application) {
  // If Approved: External
  // If Exception: Desk Review
  // If Denied: External"

  if (bool(application['CLEAR'])) {
    return 'External';
  }
  if (bool(application['MANUAL REVIEW'])) {
    return 'Desk Review';
  }
  if (bool(application['IMMEDIATE DECLINE'])) {
    return 'External';
  }

  throw new Error('Unexpected state in monitoringType');
}

function monitoringFindings(application) {
  const findings = [];
  const FINDING_DEFINITIONS = [
    // IMMEDIATE DECLINE
    {
      trigger: 'Ineligible Entity Type',
      language: `Ineligible Entity Type: "${application.Business_EntityType}".`,
    },
    {
      trigger: 'Ineligible Founding Year',
      language: `Ineligible Founding Year: ${application.Business_YearEstablished}.`,
    },
    {
      trigger: 'Home Based w/o Commercial Location',
      language: `Applicant indicated that they both are a home-based business AND that they do not have a commercial location.`,
    },
    {
      trigger: 'Ineligible NAICS and Sector',
      language: `"Other" Sector specified and NAICS code is ineligible: ${application.NAICSCode}.`,
    },
    {
      trigger: 'BusinessDetails_GamblingActivities',
      language: `Debarment: Gambling Activities.`,
    },
    {
      trigger: 'BusinessDetails_AdultActivities',
      language: `Debarment: Adult Activities.`,
    },
    {
      trigger: 'BusinessDetails_SalessActivities',
      language: `Debarment: Sales Activities`,
    },
    {
      trigger: 'BusinessDetails_TransientMerchant',
      language: `Debarment: Transient Marchant`,
    },
    {
      trigger: 'BusinessDetails_OutdoorStorageCompany',
      language: `Debarment: Outdoor Storage Company`,
    },
    {
      trigger: 'BusinessDetails_NuisanceActivities',
      language: `Debarment: Nuisance Activities`,
    },
    {
      trigger: 'BusinessDetails_IllegalActivities',
      language: `Debarment: Illegal Activities`,
    },
    {
      trigger: 'Too Few FTE',
      language: `Too Few FTE Equivalents: ${application['Rounded FTE']} but should be at least 1.`,
    },
    {
      trigger: 'Too Many FTE',
      language: `Too Many FTE Equivalents: ${application['Rounded FTE']} but should be at most 10.`,
    },
    {
      trigger: 'EIN Missing from DOL and Taxation',
      language: `EIN is missing from both DOL and Taxation.`,
    },
    {
      trigger: 'DOL UI No-Go',
      language: `Applicant is on the DOL UI no-go list.`,
    },
    {
      trigger: 'DOL WHD No-Go',
      language: `Applicant is on the DOL WHD no-go list.`,
    },
    // revenues > $5M
    // if not >= 1 owner w/ 600+ FICO
    //

    // MANUAL REVIEW
    // taxation issue
    {
      trigger: 'Dup EIN',
      language: `EIN was found in more than one application.`,
    },
    {
      trigger: 'Dup Address',
      language: `Business address was found in more than one application.`,
    },
    {
      trigger: 'Home Based == Commercial Location',
      language: `Applicant specified "${application.ContactInformation_CommercialLocation}" to having a commercial location but "${application.BusinessDetails_HomeBasedBusiness}" to being a home-based business.`,
    },
    {
      trigger: 'Nonmatching NAICS and Sector (at least one eligible)',
      language: `Specified sector ("${application.Business_Services}") does not match specified NAICS code: ${application.NAICSCode} ("${application.NAICSCodeInfo_Industry_Label}").`,
    },
    {
      trigger: 'Unknown to Taxation xor DOL',
      language: bool(application['Known to DOL'])
        ? 'Business is on file with DOL but not Taxation.'
        : 'Business is on file with Taxation but not DOL.',
    },
    {
      trigger: 'Taxation Disagrees w/ NAICS',
      language: `Submitted NAICS code (${application.NAICSCode}) differs with that reported by Taxation: ${application['Taxation NAICS']}.`,
    },
    {
      trigger: 'Taxation Disagrees w/ Name',
      language: `Business name ("${
        application.ContactInformation_BusinessName
      }"${
        application.ContactInformation_DoingBusinessAsDBA
          ? ' DBA "' + application.ContactInformation_DoingBusinessAsDBA + '"'
          : ''
      }) is dissimilar to that on file with Taxation: "${
        application['Taxation Name']
      }".`,
    },
    {
      trigger: 'Missing WR-30',
      language: `No WR-30 data was found for applicant.`,
    },
    // keep these last, since they could include long text:
    {
      trigger: 'AdditionalBackgroundInformation_BackgroundQuestion1',
      language: `Additional information provided on background question #1 (convictions): "${application.AdditionalBackgroundInformation_BackgroundQuestionDetails1}"`,
    },
    {
      trigger: 'AdditionalBackgroundInformation_BackgroundQuestion2',
      language: `Additional information provided on background question #2 (denied licensure): "${application.AdditionalBackgroundInformation_BackgroundQuestionDetails2}"`,
    },
    {
      trigger: 'AdditionalBackgroundInformation_BackgroundQuestion3',
      language: `Additional information provided on background question #3 (public contractor subcontract ineligibility): "${application.AdditionalBackgroundInformation_BackgroundQuestionDetails3}"`,
    },
    {
      trigger: 'AdditionalBackgroundInformation_BackgroundQuestion4',
      language: `Additional information provided on background question #4 (violated the terms of a public agreement): "${application.AdditionalBackgroundInformation_BackgroundQuestionDetails4}"`,
    },
    {
      trigger: 'AdditionalBackgroundInformation_BackgroundQuestion5',
      language: `Additional information provided on background question #5 (injunction, order or lien): "${application.AdditionalBackgroundInformation_BackgroundQuestionDetails5}"`,
    },
    {
      trigger: 'AdditionalBackgroundInformation_BackgroundQuestion6',
      language: `Additional information provided on background question #6 (presently indicted): "${application.AdditionalBackgroundInformation_BackgroundQuestionDetails6}"`,
    },
  ];

  function addFinding(description) {
    findings.push(`(${findings.length + 1}) ${description}`);
  }

  FINDING_DEFINITIONS.forEach(obj => {
    if (bool(application[obj.trigger])) {
      addFinding(obj.language);
    }
  });

  return findings.length
    ? `${findings.length} Finding${
        findings.length > 1 ? 's' : ''
      }: ${findings.join('  ')}`
    : '';
}

function usStateCode(input) {
  if (
    input.trim().match(/(?:jersey)|(?:nj)/i) ||
    [
      '- PLEASE CHOOSE -',
      '`',
      '017',
      'ATLANTIC',
      'BERGEN',
      'BUILDING',
      'BURLINGTON',
      'CHOOSE ONE',
      'GLOUCESTER',
      'HUDSON',
      'HUNTERDON',
      'MERCER',
      'MIDDLESEX',
      'MONMOUTH',
      'MORRIS',
      'N',
      'OCEAN',
      'PASSAIC',
      'PRIMARY RESIDENCE',
      'SOMERSET',
      'SUSSEX',
      'UNION',
    ].includes(input.trim().toUpperCase())
  ) {
    return 'NJ';
  }

  const code = US_STATES[input.trim().toUpperCase()];

  if (!code) {
    throw Error(`Unknown US state: ${input}`);
  }

  return code;
}

function yesNo(bool) {
  return bool ? 'Yes' : 'No';
}

function ownershipStructure(input) {
  const result = {
    'Limited Liability Corporation (LLC)': 'Limited Liability Corporation',
    'C Corporation': 'C Corporation',
    'Subchapter S Corporation': 'S Corporation',
    'Sole Proprietership': 'Sole Proprietorship',
    Partnership: 'Partnership',
    'Other (estate, municipality, etc.)': 'Other',
    '501(c)(3) nonprofit': 'Not For Profit',
    '501(c)(4) nonprofit': 'Not For Profit',
    '501(c)(7) nonprofit': 'Not For Profit',
  }[input];

  if (!result) {
    throw new Error(`Unexpected entity type: ${input}`);
  }

  return result;
}

function useOfFundsValue(application, useOfFundsSheet, filterFun) {
  return useOfFundsSheet
    .filter(
      r =>
        r.LoanApplication_Id === application.LoanApplication_Id && filterFun(r)
    )
    .map(r => r.UseDetails_Amount)
    .reduce((a, b) => a + b, 0);
}

function useOfFundsDescription(application, useOfFundsSheet, filterFun) {
  return useOfFundsSheet
    .filter(
      r =>
        r.LoanApplication_Id === application.LoanApplication_Id && filterFun(r)
    )
    .map(
      r =>
        `${r.UseCategories_Category}: $${r.UseDetails_Amount.toLocaleString()}`
    )
    .join(', ');
}

function generateObject(application, useOfFundsSheet) {
  return {
    Account: {
      Name: application.Organization_OrganizationName.trim(),
      DoingBusinessAs: application.Organization_DoingBusinessAsDBA.trim(),
      Email: application.ContactInformation_AuthorizedRepresentative_Email.trim(),
      Telephone: application.ContactInformation_AuthorizedRepresentative_Phone.trim(),
      WebSiteURL: application.Organization_Website.trim(),
      YearEstablished: date(application.OrganizationDetails_DateEstablished)
        .getFullYear()
        .toString(),
      AnnualRevenue: {
        Value: application.OrganizationDetails_AnnualRevenues,
        ExtensionData: null,
      },
      TaxClearanceComments: 'Cleared', // TODO
      ACHNonCompliance: '',
      address2Line1: application.Organization_MailingAddress_Line1.trim(),
      address2Line2: application.Organization_MailingAddress_Line2.trim(),
      address2City: application.Organization_MailingAddress_City.trim(),
      address2Zip: application.Organization_MailingAddress_PostalCode.trim(),
      address2State: usStateCode(application.Organization_MailingAddress_State),
      address2County: '',
      address2Country: application.Organization_MailingAddress_Country.trim(),
      WomanOwned: yesNo(application.Designations_WomenOwnedBusiness),
      VeteranOwned: yesNo(application.Designations_VeteranOwnedBusiness),
      MinorityOwned: yesNo(application.Designations_MinorityOwnedBusiness),
      DisabilityOwned: yesNo(
        application.Designations_DisabledVeteranOwnedBusiness
      ),
      Comment: application.Designations_SmallBusiness
        ? `${application.Designations_SmallBusiness} as a small business.`
        : '',
    },
    Project: {
      StatusCode: 1,
      ProjectDescription: application.OrganizationDetails_CovidImpact.trim(),
    },
    Product: {
      DevelopmentOfficer: '',
      ServicingOfficerId: null,
      AppReceivedDate: formatDate(application.Entry_DateSubmitted),
      Amount: {
        Value: application.LoanAmountRequested,
        ExtensionData: null,
      },
      nol_total_NOL_benefit: null,
      nol_total_RD_benefit: null,
      benefit_allocation_factor: null,
      nol_prior_years_tax_credits_sold: null,
      ProductStatusId: '{892EF915-56F7-E511-80DE-005056AD31F5}', // TODO
      ProductSubStatusId: '{6261A645-D875-E611-80D5-005056ADEF6F}', // TODO
      ProductTypeId: '{32F439A1-5670-EA11-A811-001DD8018831}',
      LocatedInCommercialLocation:
        application.OrganizationDetails_PhysicalCommercialLocation,
      ProductDescription: application.OrganizationDetails_Description.trim(),
    },
    Underwriting: {
      salutation: '',
      firstName: application.ContactInformation_AuthorizedRepresentative_Name_First.trim(),
      middleName: '',
      lastName: application.ContactInformation_AuthorizedRepresentative_Name_Last.trim(),
      suffix: '',
      jobTitle: application.ContactInformation_AuthorizedRepresentative_Title.trim(),
      address1: application.Organization_PhysicalAddress_Line1.trim(),
      address2: application.Organization_PhysicalAddress_Line2.trim(),
      city: application.Organization_PhysicalAddress_City.trim(),
      zipcode: application.Organization_Geography_ZipCodeFirst5.trim(),
      telephone: application.ContactInformation_AuthorizedRepresentative_Phone,
      telephoneExt: '',
      email: application.ContactInformation_AuthorizedRepresentative_Email.trim(),
      organizationName: application.Organization_OrganizationName.trim(),
      knownAs: application.Organization_DoingBusinessAsDBA.trim(),
      ein: application.Organization_EIN.replace(/\D/g, ''),
      naicsCode: application.NAICSCode,
      ownershipStructure: ownershipStructure(
        application.Organization_EntityType
      ),
      applicantBackground: `${application.Organization_EntityType}: ${application.NAICSCodeInfo_Industry_Label}`,
      headquarterState: usStateCode(
        application.Organization_PhysicalAddress_State
      ),
      headquarterCountry: application.Organization_PhysicalAddress_Country,
      landAcquisitions: null,
      newBldgConstruction: null,
      acquisitionExistingBuilding: null,
      existingBldgRvnt: null,
      upgradeEquipment: {
        Value: 0,
        ExtensionData: null,
      },
      newEquipment: {
        Value: 0,
        ExtensionData: null,
      },
      usedEquipment: {
        Value: 0,
        ExtensionData: null,
      },
      engineerArchitechFees: {
        Value: 0,
        ExtensionData: null,
      },
      legalFees: null,
      accountingFees: null,
      financeFees: null,
      roadUtilitiesConst: {
        Value: 0,
        ExtensionData: null,
      },
      debtServiceReserve: null,
      constructionInterest: {
        Value: 0,
        ExtensionData: null,
      },
      refinancing: {
        Value: 0,
        ExtensionData: null,
      },
      workingCapital: {
        Value: 0,
        ExtensionData: null,
      },
      otherCost1: {
        Value: useOfFundsValue(
          application,
          useOfFundsSheet,
          r => r.UseCategories_Category === 'Payroll'
        ),
        ExtensionData: null,
      },
      otherCost2: {
        Value: useOfFundsValue(
          application,
          useOfFundsSheet,
          r =>
            r.UseCategories_Category === 'Rent' ||
            r.UseCategories_Category === 'Mortgage'
        ),
        ExtensionData: null,
      },
      otherCost3: {
        Value: useOfFundsValue(
          application,
          useOfFundsSheet,
          r =>
            !(
              r.UseCategories_Category === 'Payroll' ||
              r.UseCategories_Category === 'Rent' ||
              r.UseCategories_Category === 'Mortgage'
            )
        ),
        ExtensionData: null,
      },
      otherCost1Description: useOfFundsDescription(
        application,
        useOfFundsSheet,
        r => r.UseCategories_Category === 'Payroll'
      ),
      otherCost2Description: useOfFundsDescription(
        application,
        useOfFundsSheet,
        r =>
          r.UseCategories_Category === 'Rent' ||
          r.UseCategories_Category === 'Mortgage'
      ),
      otherCost3Description: useOfFundsDescription(
        application,
        useOfFundsSheet,
        r =>
          !(
            r.UseCategories_Category === 'Payroll' ||
            r.UseCategories_Category === 'Rent' ||
            r.UseCategories_Category === 'Mortgage'
          )
      ),
      counselFirmName: '',
      counselFirstName: '',
      counselLastName: '',
      counselStreetAddress1: '',
      counselStreetAddress2: '',
      counselCity: '',
      counselState: '',
      counselZipCode: '',
      counselPhoneNumber: '',
      counselEmailAddress: '',
      accountantFirmName: '',
      accountantFirstName: '',
      accountantLastName: '',
      accountantStreetAddress1: '',
      accountantStreetAddress2: '',
      accountantCity: '',
      accountantState: '',
      accountantZipCode: '',
      accountantPhoneNumber: '',
      accountantEmailAddress: '',
      totalCost: {
        Value: application.TotalFundsNeeded,
        ExtensionData: null,
      },
      applicationID: `CV19L${application.LoanApplication_Id}`,
      selectedProducts: 'Covid Small Business Emergency Assistance Loan',
      ReceivedPreiousFundingFromEDA: `CVSBGR: ${yesNo(
        GRANT_EINS.includes(application.Organization_EIN.replace(/\D/g, ''))
      )}, other NJEDA: ${
        application.OrganizationDetails_PreviousEDAAssistance
      }`,
      ReceivedPreiousFundingFromOtherthanEDA: '',
      TotalFullTimeEligibleJobs: '',
      NJFullTimeJobsAtapplication:
        application.OrganizationDetails_FullTimeEmployeesW2,
      PartTimeJobsAtapplication:
        application.OrganizationDetails_PartTimeEmployeesW2,
      softCosts: {
        Value: 0,
        ExtensionData: null,
      },
      relocationCosts: {
        Value: 0,
        ExtensionData: null,
      },
      securityCosts: {
        Value: 0,
        ExtensionData: null,
      },
      titleCosts: {
        Value: 0,
        ExtensionData: null,
      },
      surveyCosts: {
        Value: 0,
        ExtensionData: null,
      },
      marketAnalysisCosts: {
        Value: 0,
        ExtensionData: null,
      },
      developmentImpactCosts: {
        Value: 0,
        ExtensionData: null,
      },
      marketSiteCosts: {
        Value: 0,
        ExtensionData: null,
      },
      demolitionCosts: null,
      streetscapeCosts: null,
      remediationCosts: {
        Value: 0,
        ExtensionData: null,
      },
      redemptionPremiumCosts: null,
      installationMachineryCosts: null,
      totalProjectCost: null,
    },
    Location: {
      isRelocation: null,
      isExpansion: null,
      isStartup: false,
      address1Line1: application.Organization_PhysicalAddress_Line1.trim(),
      address1Line2: application.Organization_PhysicalAddress_Line2.trim(),
      address1City: application.NormalizedCity.trim(),
      address1Zip: application.Organization_Geography_ZipCodeFirst5.trim(),
      address1State: usStateCode(
        application.Organization_PhysicalAddress_State
      ),
      address1County: application.NormalizedCounty.trim(),
      address1Municipality: application.NormalizedMunicipality.trim(),
      address1Country: application.Organization_PhysicalAddress_Country,
      block: '',
      lot: '',
      congressionalDistrict: application.NormalizedCongDist.trim(),
      legislativeDistrict: application.NormalizedLegDist.trim(),
      censusTract: '',
      Comments: 'Not Home-Based Business',
    },
    FeeRequest: {
      receivedDate: null,
      receivedAmt: null,
      confirmationNum: '',
      productFeeAmount: null,
    },
    Monitoring: {
      Status: 'In Planning', // TODO
      MonitoringType: 'Desk Review', // TODO
      Findings: 'No Issues from Application', // TODO
      CompletionDate: formatDate(application.Entry_DateSubmitted),
      GeneralComments: `Other Workers (1099, seasonal, PEO): ${application.OrganizationDetails_AllOtherWorkers1099SeasonalPEOEtc}`,
    },
  };
}

/*
function generateObject_OLD(application) {
  return {
    Account: {
      Name: application.ContactInformation_BusinessName,
      DoingBusinessAs: application.ContactInformation_DoingBusinessAsDBA,
      Email: application.ContactInformation_Email,
      Telephone: application.ContactInformation_Phone,
      WebSiteURL: application.ContactInformation_Website,
      YearEstablished: application.Business_YearEstablished,
      AnnualRevenue: null,
      TaxClearanceComments: taxClearance(application['Taxation Status']),
      ACHNonCompliance: '',
    },
    Project: { StatusCode: 1 },
    Product: {
      DevelopmentOfficer: '',
      ServicingOfficerId: servicingOfficerId(application),
      AppReceivedDate: formatDate(new Date(application.Entry_DateSubmitted)),
      Amount: getAmount(application),
      nol_total_NOL_benefit: null,
      nol_total_RD_benefit: null,
      benefit_allocation_factor: null,
      nol_prior_years_tax_credits_sold: null,
      ProductStatusId: productStatusId(application),
      ProductSubStatusId: productSubStatusId(application),
      ProductTypeId: '{F1D0CF74-B26E-EA11-A811-001DD8018831}',
      LocatedInCommercialLocation:
        application.ContactInformation_CommercialLocation,
    },
    Underwriting: {
      salutation: '',
      firstName: application.ContactInformation_ContactName_First,
      middleName: '',
      lastName: application.ContactInformation_ContactName_Last,
      suffix: '',
      jobTitle: '',
      address1: application.ContactInformation_BusinessAddress_Line1,
      address2: application.ContactInformation_BusinessAddress_Line2,
      city: application.normalized_city.trim(),
      zipcode: application.ContactInformation_ZipFirst5.padStart(5, '0'),
      telephone: application.ContactInformation_Phone.split('x')[0].replace(
        /\D/g,
        ''
      ),
      telephoneExt: application.ContactInformation_Phone.split('x')[1] || null,
      email: application.ContactInformation_Email,
      organizationName: application.ContactInformation_BusinessName,
      knownAs: application.ContactInformation_DoingBusinessAsDBA,
      ein: application['Dashless EIN-9'],
      naicsCode: application.NAICSCode,
      ownershipStructure: '',
      applicantBackground: `${application.Business_EntityType} in ${application.Business_Services}: ${application.NAICSCodeInfo_Industry_Label}`,
      headquarterState: '',
      headquarterCountry: '',
      landAcquisitions: null,
      newBldgConstruction: null,
      acquisitionExistingBuilding: null,
      existingBldgRvnt: null,
      upgradeEquipment: {
        Value: 0,
        ExtensionData: null,
      },
      newEquipment: {
        Value: 0,
        ExtensionData: null,
      },
      usedEquipment: {
        Value: 0,
        ExtensionData: null,
      },
      engineerArchitechFees: {
        Value: 0,
        ExtensionData: null,
      },
      legalFees: null,
      accountingFees: null,
      financeFees: null,
      roadUtilitiesConst: {
        Value: 0,
        ExtensionData: null,
      },
      debtServiceReserve: null,
      constructionInterest: {
        Value: 0,
        ExtensionData: null,
      },
      refinancing: {
        Value: 0,
        ExtensionData: null,
      },
      workingCapital: {
        Value: 0,
        ExtensionData: null,
      },
      otherCost1: null,
      otherCost2: null,
      otherCost3: null,
      otherCost1Description: null,
      otherCost2Description: null,
      otherCost3Description: null,
      counselFirmName: '',
      counselFirstName: '',
      counselLastName: '',
      counselStreetAddress1: '',
      counselStreetAddress2: '',
      counselCity: '',
      counselState: '',
      counselZipCode: '',
      counselPhoneNumber: '',
      counselEmailAddress: '',
      accountantFirmName: '',
      accountantFirstName: '',
      accountantLastName: '',
      accountantStreetAddress1: '',
      accountantStreetAddress2: '',
      accountantCity: '',
      accountantState: '',
      accountantZipCode: '',
      accountantPhoneNumber: '',
      accountantEmailAddress: '',
      totalCost: {
        Value: 0,
        ExtensionData: null,
      },
      applicationID: `CV19G${application.appId}`,
      selectedProducts: 'Covid Small Business Emergency Assistance Grant',
      ReceivedPreiousFundingFromEDA: '',
      ReceivedPreiousFundingFromOtherthanEDA: '',
      TotalFullTimeEligibleJobs: application['Rounded FTE'],
      NJFullTimeJobsAtapplication: application.Business_FullTimeEmployeesW2,
      PartTimeJobsAtapplication: application.Business_PartTimeEmployeesW2,
      softCosts: {
        Value: 0,
        ExtensionData: null,
      },
      relocationCosts: {
        Value: 0,
        ExtensionData: null,
      },
      securityCosts: {
        Value: 0,
        ExtensionData: null,
      },
      titleCosts: {
        Value: 0,
        ExtensionData: null,
      },
      surveyCosts: {
        Value: 0,
        ExtensionData: null,
      },
      marketAnalysisCosts: {
        Value: 0,
        ExtensionData: null,
      },
      developmentImpactCosts: {
        Value: 0,
        ExtensionData: null,
      },
      marketSiteCosts: {
        Value: 0,
        ExtensionData: null,
      },
      demolitionCosts: null,
      streetscapeCosts: null,
      remediationCosts: {
        Value: 0,
        ExtensionData: null,
      },
      redemptionPremiumCosts: null,
      installationMachineryCosts: null,
      totalProjectCost: null,
    },
    Location: {
      isRelocation: null,
      isExpansion: null,
      isStartup: false,
      address1Line1: application.ContactInformation_BusinessAddress_Line1,
      address1Line2: application.ContactInformation_BusinessAddress_Line2,
      address1City: application.normalized_city.trim(),
      address1Zip: application.ContactInformation_ZipFirst5.padStart(5, '0'),
      address1State: 'NJ', // will always be NJ per input form
      address1County: application.county.trim(),
      address1Municipality: application.incmunc.trim(),
      block: '',
      lot: '',
      congressionalDistrict: application.congdist.trim(),
      legislativeDistrict: application.legdist.trim(),
      censusTract: '',
      Comments: `Home-Based Business: ${application.BusinessDetails_HomeBasedBusiness}`,
    },
    FeeRequest: {
      receivedDate: null,
      receivedAmt: null,
      confirmationNum: '',
      productFeeAmount: null,
    },
    Monitoring: {
      Status: monitoringStatus(application),
      MonitoringType: monitoringType(application),
      Findings: monitoringFindings(application),
      CompletionDate: bool(application['MANUAL REVIEW'])
        ? null
        : formatDate(new Date()),
    },
  };
}
*/

main();
