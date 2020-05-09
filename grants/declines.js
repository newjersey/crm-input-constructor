const chalk = require('chalk');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const csv = require('csv-parser');
const fs = require('fs');
const { addBusinessDays, format } = require('date-fns');

const optionDefinitions = [
  {
    name: 'src',
    alias: 's',
    type: String,
    defaultOption: true,
    description: '(REQUIRED) Source CSV input file; see sample.csv',
  },
  {
    name: 'min',
    type: Number,
    description: 'Lowest application ID to process, inclusive (default 0).',
  },
  {
    name: 'max',
    type: Number,
    description: 'Highest application ID to process, inclusive (default ∞).',
  },
  { name: 'county', type: String, description: 'Only include these counties.' },
  { name: 'not-county', type: String, description: 'Exclude these counties.' },
  {
    name: 'out',
    alias: 'o',
    type: String,
    description:
      'Path to output file; suggest naming like hard_declines_0-500.json',
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
      header: 'Hard-Decline JSON Constructor',
      content:
        'This takes grant data from a CSV input file and outputs a corresponding JSON array of objects for feeding to our Power Automate flow that sends decline emails.',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
    {
      content: 'Example: npm start sample.csv -- -p',
    },
  ]);

  console.log(usage);
}

function main() {
  const options = commandLineArgs(optionDefinitions);
  const writeStream = options.out && fs.createWriteStream(options.out);
  const errors = [];
  const dataArray = [];
  let n = 0;

  if (options.src) {
    console.log(
      chalk.bold(
        `Generating OLA Datas creation JSON for applications ${
          options.min || 0
        } through ${options.max ? options.max : '∞'} (inclusive) from ${
          options.src
        }${options.out ? ' to ' + options.out : ''}\n`
      )
    );
  } else {
    printUsage();
    return;
  }

  fs.createReadStream(options.src)
    .pipe(csv())
    .on('data', row => {
      if (
        bool(row['IMMEDIATE DECLINE']) &&
        (!options.min || parseInt(row.appId) >= parseInt(options.min)) &&
        (!options.max || parseInt(row.appId) <= parseInt(options.max)) &&
        (!options.county || options.county == row.county) &&
        (!options['not-county'] || options['not-county'] != row.county)
      ) {
        try {
          const data = generateObject(row);
          dataArray.push(data);

          if (!options.quiet && options.pretty) {
            console.log(data);
          }

          n++;
        } catch (e) {
          errors.push(e);
        }
      }
    })
    .on('end', () => {
      const json = JSON.stringify(dataArray);

      if (writeStream) {
        writeStream.write(json);
        writeStream.end();
      }

      if (!options.quiet && !options.pretty) {
        console.log(json);
      }

      if (errors.length) {
        console.log(
          chalk.bold.red(
            `\n${n} generated succesfully, ${errors.length} others had errors:`
          )
        );
        errors.forEach(e => console.log(e));
      } else {
        console.log(chalk.bold(`\n${n} records generated successfully.`));
      }
    });
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

function reasons(application, returnVal) {
  const FINDING_DEFINITIONS = [
    // IMMEDIATE DECLINE
    {
      slug: 'Entity',
      trigger: 'Ineligible Entity Type',
      language: `Entity is an ineligible entity type based on the Guidelines`,
    },
    {
      slug: 'Year',
      trigger: 'Ineligible Founding Year',
      language: `Entity was not in existence in the 4th quarter of 2019`,
    },
    {
      slug: 'Location',
      trigger: 'Home Based w/o Commercial Location',
      language: `Entity is a home-based entity without a physical commercial location`,
    },
    {
      slug: 'NAICS',
      trigger: 'Ineligible NAICS and Sector',
      language: `Entity is not in an eligible industry based on the Guidelines`,
    },
    {
      slug: 'Gambling',
      trigger: 'BusinessDetails_GamblingActivities',
      language: `Entity is considered an ineligible entity because it hosts gambling or gaming activities`,
    },
    {
      slug: 'Adult',
      trigger: 'BusinessDetails_AdultActivities',
      language: `Entity is considered an ineligible entity because it conducts or purveys “adult” activities, services, products or materials`,
    },
    {
      slug: 'Sales',
      trigger: 'BusinessDetails_SalessActivities',
      language: `Entity is considered an ineligible entity because it conducts auctions, bankruptcy sales, fire sales, “lost-our-lease,” “going-out-of-business,” or similar sales`,
    },
    {
      slug: 'Teansient',
      trigger: 'BusinessDetails_TransientMerchant',
      language: `Entity is considered an ineligible entity because it is a transient merchant ("peddler," "popup store," or "itinerant vendor")`,
    },
    {
      slug: 'Outdoor',
      trigger: 'BusinessDetails_OutdoorStorageCompany',
      language: `Entity is considered an ineligible entity becauseis it is an outdoor storage company`,
    },
    {
      slug: 'Nuisance',
      trigger: 'BusinessDetails_NuisanceActivities',
      language: `Entity is considered an ineligible entity because it conducts activities that may constitute a nuisance`,
    },
    {
      slug: 'Illegal',
      trigger: 'BusinessDetails_IllegalActivities',
      language: `Entity is considered an ineligible entity because it conducts business for an illegal purpose`,
    },
    {
      slug: 'LowFTE',
      trigger: 'Too Few FTE',
      language: `Entity did not have at least 1 full-time equivalent employee in the 4th Quarter of 2019, based on the calculation specified in the Guidelines`,
    },
    {
      slug: 'HighFTE',
      trigger: 'Too Many FTE',
      language: `Entity had ${application['Rounded FTE']} full-time equivalent employees in the 4th Quarter of 2019, based on the calculation specified in the Guidelines, which exceeds the maximum of 10 allowed for this program`,
    },
    {
      slug: 'EIN',
      trigger: 'EIN Missing from DOL and Taxation',
      language: `Entity is not registered to do business in the State`,
    },
    {
      slug: 'DOL',
      trigger: 'DOL UI No-Go',
      language: `Entity is not in good standing with the NJ Department of Labor and Workforce Development (Unemployment Insurance Division)`,
    },
    {
      slug: 'DOL',
      trigger: 'DOL WHD No-Go',
      language: `Entity is not in good standing with the NJ Department of Labor and Workforce Development (Wage and Hour Division)`,
    },
    {
      slug: 'WR30',
      trigger: 'Missing WR-30',
      language: `Entity did not file an Employer Report of Wages (WR-30) with the NJ Department of Labor and Workforce Development for the 4th Quarter of 2019`,
    },
  ];

  return FINDING_DEFINITIONS.filter(obj => bool(application[obj.trigger])).map(
    obj => obj[returnVal]
  );
}

function appeal_url(application) {
  const entry = {
    ApplicationID: `CV19G${application.appId}`,
    EntityName: businessNameWithDBA(application),
    EIN: application.Business_EIN,
    NAICS: application.NAICSCode,
    YearFounded: application.Business_YearEstablished,
    Expiration: format(addBusinessDays(new Date(), 3), 'yyyy-MM-dd'),
    Email: application.ContactInformation_Email,
    Reasons: reasons(application, 'slug'),
  };

  const json = JSON.stringify(entry);
  const buffer = Buffer.from(json);
  const entryBase64 = buffer.toString('base64');

  return `https://forms.business.nj.gov/grant-appeal/?code=${entryBase64}`;
}

function businessNameWithDBA(application) {
  return (
    application['Taxation Name'].trim() +
    (application.ContactInformation_DoingBusinessAsDBA.trim()
      ? ` (DBA ${application.ContactInformation_DoingBusinessAsDBA.trim()})`
      : '')
  );
}

const capitalize = s => {
  return s.trim().charAt(0).toUpperCase() + s.trim().slice(1);
};

function generateObject(application) {
  return {
    application_id: `CV19G${application.appId}`,
    email: application.ContactInformation_Email.trim(),
    first_name: capitalize(application.ContactInformation_ContactName_First),
    last_name: capitalize(application.ContactInformation_ContactName_Last),
    business_name: businessNameWithDBA(application),
    address1: application.ContactInformation_BusinessAddress_Line1.trim().toUpperCase(),
    address2: application.ContactInformation_BusinessAddress_Line2.trim().toUpperCase(),
    city_state_zip: `${application.normalized_city.trim()}, NJ ${application.ContactInformation_BusinessAddress_PostalCode.padStart(
      5,
      '0'
    ).trim()}`,
    reasons: reasons(application, 'language'),
    appeal_url: appeal_url(application),
  };
}

main();
