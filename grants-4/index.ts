const chalk = require('chalk');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');

import { Application, getApplications } from './inputs/applications';
import { Decision, DecoratedApplication, OlaDatas } from './outputs/types';
import { Decline, generateDecline } from './outputs/decline';
import { addDolData, init as loadDolData } from './inputs/dol';
import { addDOLNOEINData, init as loadDolNoEINData } from './inputs/dol-noein';
import { addChildCareData, init as loadChildCareData } from './inputs/child-care';
import { addEDAHoldListData, init as loadEDAHoldListData } from './inputs/eda-hold-list';
import { addDOBValidationData, init as loadDOBValidateData } from './inputs/dobvalidate';
import { addDOBValidateNOEINData, init as loadDOBValidateNoEINData } from './inputs/dobvalidate-noein';
import { addDuplicateEINData, init as loadDuplicateEINData } from './inputs/duplicateEIN';
import { addDuplicateAddressData, init as loadDuplicateAddressData } from './inputs/duplicateAddress';
import { addSamsData, init as loadSamsData } from './inputs/sams';
import { addTaxationData, init as loadTaxationData } from './inputs/taxation';
import { addWR30Data, init as loadWR30Data } from './inputs/wr30';
import { options, optionsSatisfied, printStartMessage, printUsage } from './options';

import { addDuplicateData } from './inputs/duplicates';
import { addGeographyData } from './inputs/geography';
import { generateOlaDatas } from './outputs/ola-datas';
import { getDecision } from './outputs/helpers';
import { getFindings } from './outputs/findings';
import { addABCData, init as loadABCData } from './inputs/ABC';
import { Review, generateReview } from './outputs/review';
//import { addReviewNeededData, init as loadReviewNeededData } from './inputs/review-needed';

function map<T extends Application, K>(
  applications: T[],
  fn: (application: T) => K,
  message: string
): K[] {
  console.log(message);

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(applications.length, 0);

  const result = applications.map((application: T, index: number) => {
    bar.update(index + 1);
    try {
      return fn(application);
    } catch (e) {
      throw new Error(
        `\nError while ${message.toLowerCase().replace(/\./g, '')} to ${
          application.ApplicationId
        }: ${e.message}`
      );
    }
  });

  bar.stop();

  return result;
}

function writeFile(path: string, content: string, overwrite: boolean): void {
  fs.writeFile(
    path,
    content,
    {
      encoding: 'utf8',
      mode: overwrite ? 0o600 : 0o400,
      flag: overwrite ? 'w' : 'wx',
    },
    (err?: Error) => {
      if (err) throw err;
    }
  );
}

async function main() {
  if (optionsSatisfied(options)) {
    printStartMessage(options);
  } else {
    printUsage();
    return;
  }

  const BASE_PATH = options.base;
  const OUTPUT_PATH = path.join(options.base, 'Output');

  await loadWR30Data(
    path.join(BASE_PATH, 'WR30', 'njeda crossmatch wage output file 7-16-2021.txt'),
    path.join(BASE_PATH, 'WR30', '20210716 FEIN Not Found.txt')
  );

  await loadChildCareData(
    path.join(BASE_PATH, 'DCF-DHS', 'DCF-DHS Centers FEIN Report 4.23.2021.xlsx')
  );

  await loadEDAHoldListData(
    path.join(BASE_PATH, 'EDA Hold', 'NJEDA HOLD List 5-10-2021.xlsx')
  );

  await loadDOBValidateData(
    path.join(BASE_PATH, 'DOB', 'Combined DOB for Console App As of 5-4-2021 7am wEIN_Latest BC 5-20-2021 - Phase4B Corrected 8-19-2021.csv')
  );

  await loadDOBValidateNoEINData(
    path.join(BASE_PATH, 'DOB', 'Combined DOB for Console App As of 5-4-2021 7am NO EIN.csv')
  );

  await loadSamsData(path.join(BASE_PATH, 'SAMS', 'SAM_Exclusions_Public_Extract_21123.CSV'));

  await loadTaxationData(
    path.join(BASE_PATH, 'Taxation', 'Phase 4b Tax Data 7-16-2021_Output PW NJEDA2021.xlsx')
  );
  
  await loadDolData(
    path.join(BASE_PATH, 'DOL Lists', 'eda_all_active09172020_new.xlsx'),
    path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.23.2021.UID.xlsx'),
    path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.23.2021.WHD.xlsx')
  );

  await loadDolNoEINData(
    path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.23.2021.WHD_No_EIN.csv')
  );
    

  await loadABCData(path.join(BASE_PATH, 'ABC', 'EDA EO Violations Spreadsheet through 5.7.csv'));

  await loadDuplicateEINData(
    path.join(BASE_PATH, 'DuplicateEINAddress', 'Duplicate EIN-Address Check-Grant4.csv')
  );

  await loadDuplicateAddressData(
    path.join(BASE_PATH, 'DuplicateEINAddress', 'Duplicate EIN-Address Check-Grant4.csv')
  );

  // apply data
  // Ugly number of variables, but makes type inference pick up the chained unions of generics.
  // I'm probably doing it wrong. Note that a map() chain here causes out-of-memory panics.
  const apps0 = getApplications(
    path.join(BASE_PATH, 'Row from CRM_Portal', 'NJEDA MicroLoan Application-Grant4.xlsx'),  //NJEDA Grant Application
    path.join(BASE_PATH, 'Row from CRM_Portal', 'Solicitud de Subsidio2.xlsx')
  ).slice(0, options.count && options.count + (options.skip || 0));

  // Need 0 through the last application desired for duplicate checking. Don't need those skipped, thereafter.
  const apps1 = map(apps0, addDuplicateData, '\nApplying duplicate data...').slice(
    options.skip,
    options.count && options.count + (options.skip || 0)
  );

  const apps2 = map(apps1, addDolData, 'Applying DOL data...');
  const apps3 = map(apps2, addTaxationData, 'Applying Taxation data...');
  const apps4 = map(apps3, addSamsData, 'Applying SAMS data...');
  const apps5 = map(apps4, addWR30Data, 'Applying WR-30 data...');
  const apps6 = map(apps5, addABCData, 'Applying ABC data...');
  const apps7 = map(apps6, addChildCareData, 'Applying Child-Care data from DCF-DHS...');
  const apps8 = map(apps7, addEDAHoldListData, 'Applying EDA Hold List data...');
  const apps9 = map(apps8, addDOLNOEINData, 'Applying DOL WHD NO EIN NO GO data...');
  const apps10 = map(apps9, addDOBValidationData, 'Applying Sister Agencies DOB data...');
  const apps11 = map(apps10, addDOBValidateNOEINData, 'Applying Sister Agencies DOB NO EIN data...');
  const apps12 = map(apps11, addDuplicateEINData, 'Applying Duplicate EIN data...');
  const apps13 = map(apps12, addDuplicateAddressData, 'Applying Duplicate Address data...');
  
  // indirection
  let decoratedApplications: DecoratedApplication[] = apps13;

  // limit to language
  // NOTE: ApplicationSequenceID is generated prior to this step, and will therefore
  //       reflect the order of application submission (not the order of CRM entry).
  if (options.language) {
    decoratedApplications = decoratedApplications.filter(app => app.Language === options.language);
  }

  // debug
  if (options.debug) {
    console.dir(decoratedApplications, { depth: null });
  }

  // curry
  const generateFunc = (app: DecoratedApplication) => generateOlaDatas(app, !!options.test);

  // generate
  const olaDatasArray: OlaDatas[] = map(
    decoratedApplications,
    generateFunc,
    'Generating OLADatas objects...'
    );
    // generate reviews
    const reviewObjects = <Review[]>(
        map(decoratedApplications, generateReview, 'Generating review objects...').filter(r => r?.reasons?.length)
    );

  // generate declines
  const declineObjects = <Decline[]>(
    map(decoratedApplications, generateDecline, 'Generating decline objects...').filter(d => d)
  );

  // print
  if (options.pretty) {
    console.dir(olaDatasArray, { depth: null });
  }

  // stats
  const stats: { [key in Decision]?: number } = {};
  decoratedApplications
    .map(app => getDecision(app))
    .forEach(decision => {
      stats[decision] = (stats[decision] || 0) + 1;
    });
  console.log('\n', stats, '\n');
  const findings: { [finding: string]: number } = decoratedApplications
    .map(app =>
      getFindings(app).map(finding => `(${chalk.bold(finding.severity)}) ${finding.name}`)
    )
    .reduce((accum: { [finding: string]: number }, appFindings) => {
      appFindings.forEach(finding => {
        accum[finding] = (accum[finding] || 0) + 1;
      });
      return accum;
    }, {});

    //console.log(findings);
  Object.keys(findings)
    .sort()
    .forEach(key => {
      console.log(`  ${chalk.yellow(findings[key].toString().padStart(5))} ${key}`);
    });

  // write
  if (options.out) {
    const n = options.count || 'all';
    const env = options.test ? 'TEST' : 'PROD';
    const base = `${env}-${n}-skipping-${options.skip || 0}${
      options.language ? `-${options.language}` : ''
          }${options.county ? `-${options.county}` : ''}`;
    const reviews: string = path.join(OUTPUT_PATH, `${base}-${reviewObjects.length}-REVIEW.json`);
    const declines: string = path.join(
      OUTPUT_PATH,
      `${base}-${declineObjects.length}-DECLINES.json`
    );
    const inputs: string = path.join(
      OUTPUT_PATH,
      `${base}-${decoratedApplications.length}-INPUTS.json`
    );
    const outputs: string = path.join(
      OUTPUT_PATH,
      `${base}-${decoratedApplications.length}-OUTPUTS.json`
    );
    const overwrite: boolean = !!options.force;

    console.log(
      `\nWriting JSON files:\
         \n  Declines: ${chalk.blue(declines)}\
         \n  Reviews: ${chalk.blue(reviews)}\
         \n  Inputs: ${chalk.blue(inputs)}\
         \n  Output: ${chalk.blue(outputs)}`
      );

      //         \n  Reviews: ${chalk.blue(reviews)}
    writeFile(reviews, JSON.stringify(reviewObjects), overwrite);
    writeFile(declines, JSON.stringify(declineObjects), overwrite);
    writeFile(inputs, JSON.stringify(decoratedApplications), overwrite);
    writeFile(outputs, JSON.stringify(olaDatasArray), overwrite);
  }

  // done
  console.log(`\nSuccessfully generated ${olaDatasArray.length} records.`);
}

main();
