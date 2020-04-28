const chalk = require('chalk');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const fs = require('fs');
const XLSX = require('xlsx');
const { getJsDateFromExcel } = require('excel-date-to-js');
const { utcToZonedTime, zonedTimeToUtc } = require('date-fns-tz');

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
  const writeStream = options.out && fs.createWriteStream(options.out);
  const errors = [];

  if (options.src) {
    console.log(
      `Generating OLA Datas creation JSON for ${chalk.blue(
        options.count ? options.count : '∞'
      )} applications, skipping ${chalk.blue(
        options.skip || 0
      )}, from ${chalk.blue(options.src)}${
        options.out ? chalk.blue(' to ' + options.out) : ''
      }\n`
    );
  } else {
    printUsage();
    return;
  }

  const workbook = XLSX.readFile(options.src, {
    type: 'file',
    sheets: ['LoanApplication'],
  });

  const sheet = XLSX.utils
    .sheet_to_json(workbook.Sheets['LoanApplication'], { defval: null })
    .filter(r => r.Entry_DateCreated >= 43934.375) // 2020-04-13T13:00:00.000Z
    .sort((a, b) => a.Entry_DateSubmitted - b.Entry_DateSubmitted)
    .slice(options.skip, options.count && options.count + (options.skip || 0));

  const n = sheet.length;
  const cum = sheet
    .map(application => application.LoanAmountRequested)
    .reduce((a, x) => a + x, 0);

  const data = sheet.map(application => {
    try {
      return generateObject(application);
    } catch (e) {
      errors.push(e);
    }
  });

  const json = JSON.stringify(data);

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

let reviewersAssigned = 0;
function servicingOfficerId(application) {
  const RICHARD_TORO = '{834023BA-3ED6-E811-811B-1458D04E2F10}';
  const reviewers = [
    '{B59042A9-D571-EA11-A811-001DD8018943}',
    '{DD23D309-E8F0-E911-A994-001DD800951B}',
    '{2EC826BD-D871-EA11-A811-001DD8018943}',
    '{B0458690-F377-E911-A974-001DD80081AD}',
    '{03F90D62-DA71-EA11-A811-001DD8018943}',
    '{9176B59B-DB71-EA11-A811-001DD8018943}',
    // 834023BA-3ED6-E811-811B-1458D04E2F10
    '{3E7536E2-DD71-EA11-A811-001DD8018943}',
  ];

  if (bool(application['CLEAR'])) {
    return RICHARD_TORO;
  }
  if (bool(application['MANUAL REVIEW'])) {
    return reviewers[reviewersAssigned++ % reviewers.length];
  }
  if (bool(application['IMMEDIATE DECLINE'])) {
    return RICHARD_TORO;
  }

  throw new Error('Unexpected state in servicingOfficerId');
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

function getAmount(application) {
  const value = parseInt(
    application['Potential Award Size'].replace(/\D/g, ''),
    10
  );
  return value
    ? {
        Value: value,
        ExtensionData: null,
      }
    : null;
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

function generateObject(application) {
  return {
    Account: {
      Name: 'Covid5Loan',
      DoingBusinessAs: 'NA',
      Email: 'Covid5Loan@gmail.com',
      Telephone: '6097867121',
      WebSiteURL: 'https://www.Covid5Loan.com',
      YearEstablished: '2011',
      AnnualRevenue: null,
      TaxClearanceComments: 'Cleared',
      ACHNonCompliance: '',
      address2Line1: '11 American Blvd',
      address2Line2: '',
      address2City: 'Pennington',
      address2Zip: '08534',
      address2State: 'NJ',
      address2County: '',
      address2Country: '',
      WomanOwned: 'Yes',
      VeteranOwned: '',
      MinorityOwned: 'Yes',
      DisabilityOwned: '',
      Comment: 'Yes, It is Small Business',
    },
    Project: {
      StatusCode: 1,
      ProjectDescription: 'Describe negative impacts from COVID-19',
    },
    Product: {
      DevelopmentOfficer: '',
      ServicingOfficerId: null,
      AppReceivedDate: '/Date(1583125200000)/',
      Amount: {
        Value: 100000,
        ExtensionData: null,
      },
      nol_total_NOL_benefit: null,
      nol_total_RD_benefit: null,
      benefit_allocation_factor: null,
      nol_prior_years_tax_credits_sold: null,
      ProductStatusId: '{892EF915-56F7-E511-80DE-005056AD31F5}',
      ProductSubStatusId: '{6261A645-D875-E611-80D5-005056ADEF6F}',
      ProductTypeId: '{32F439A1-5670-EA11-A811-001DD8018831}',
      LocatedInCommercialLocation: 'Yes',
      ProductDescription:
        'Please provide a description of the business, including: the industry that the business falls within, the company background, and a description of the product or service the company offers.',
    },
    Underwriting: {
      salutation: 'Mr.',
      firstName: 'Covid5Loan',
      middleName: '',
      lastName: 'Covid5Loan',
      suffix: '',
      jobTitle: '',
      address1: '36 West State Street',
      address2: '',
      city: 'Trenton',
      zipcode: '08608',
      telephone: '7322136046',
      telephoneExt: '',
      email: 'Covid5Loan@eda.com',
      organizationName: 'Covid5Loan',
      knownAs: '',
      ein: '822977799',
      naicsCode: '423430',
      ownershipStructure: 'Limited Liability Corporation',
      applicantBackground: '',
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
      otherCost1: {
        Value: 10000,
        ExtensionData: null,
      },
      otherCost2: {
        Value: 20000,
        ExtensionData: null,
      },
      otherCost3: {
        Value: 70000,
        ExtensionData: null,
      },
      otherCost1Description: 'Payroll: 10000',
      otherCost2Description: 'Rent: 5000 & Mortgage: 15000',
      otherCost3Description:
        'Taxes: 20,000, Utilites: 10,000, Inventory: 10,000, Other Cost: 30,000',
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
        Value: 100000,
        ExtensionData: null,
      },
      applicationID: 'CV19L05',
      selectedProducts: 'Covid Small Business Emergency Assistance Loan',
      ReceivedPreiousFundingFromEDA: 'Not received from EDA',
      ReceivedPreiousFundingFromOtherthanEDA: '',
      TotalFullTimeEligibleJobs: '',
      NJFullTimeJobsAtapplication: '20',
      PartTimeJobsAtapplication: '80',
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
      address1Line1: '36 West State Street',
      address1Line2: '',
      address1City: 'Trenton City',
      address1Zip: '08608',
      address1State: 'NJ',
      address1County: '',
      address1Municipality: '',
      address1Country: '',
      block: '',
      lot: '',
      congressionalDistrict: '',
      legislativeDistrict: '',
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
      Status: 'In Planning',
      MonitoringType: 'Desk Review',
      Findings: 'No Issues from Application',
      CompletionDate: '/Date(1583125200000)/',
      GeneralComments: 'OtherWorkers (1099,seasonal,PEO): 30',
    },
  };
}

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

main();
