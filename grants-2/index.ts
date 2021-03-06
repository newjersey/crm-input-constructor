const chalk = require('chalk');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');

import { Application, getApplications } from './inputs/applications';
import { Decision, DecoratedApplication, OlaDatas } from './outputs/types';
import { Decline, generateDecline } from './outputs/decline';
import { addDolData, init as loadDolData } from './inputs/dol';
import { addGrantPhase1Data, init as loadGrantPhse1Data } from './inputs/grant-phase-1';
import {
  addNonDeclinedEdaLoanData,
  init as loanNonDeclinedEdaLoanData,
} from './inputs/non-declined-loans';
import {
  addPolicyMapData,
  init as loadPolicyMapDada,
  EligibilityStatus as OZEligibilityStatus,
} from './inputs/policy-map';
import { addReviewNeededData, init as loadReviewNeededData } from './inputs/review-needed';
import { addSamsData, init as loadSamsData } from './inputs/sams';
import { addTaxationData, init as loadTaxationData } from './inputs/taxation';
import { addWR30Data, init as loadWR30Data } from './inputs/wr30';
import { options, optionsSatisfied, printStartMessage, printUsage } from './options';
import { addDuplicateData } from './inputs/duplicates';
import { addGeographyData } from './inputs/geography';
import { generateOlaDatas } from './outputs/ola-datas';
import { getDecision } from './outputs/helpers';
import { getFindings } from './outputs/findings';
import { Review, generateReview } from './outputs/review';

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

function isOz(app: DecoratedApplication) {
  return (
    app.policyMap?.eligibilityStatus === OZEligibilityStatus.Eligible ||
    app.policyMap?.eligibilityStatus === OZEligibilityStatus.Eligible_Contiguous ||
    app.policyMap?.eligibilityStatus === OZEligibilityStatus.Eligible_LIC
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

  // load
  await loadReviewNeededData(
    path.join(BASE_PATH, 'Review Needed', 'NJEDA Review List 8-27-2020 1-30pm.xlsx')
  );
  await loadGrantPhse1Data(
    path.join(BASE_PATH, 'Grant Phase 1', 'Phase 1 Statuses As Of 7-16-2020 5-10pm.xlsx')
  );
  await loanNonDeclinedEdaLoanData(
    path.join(BASE_PATH, 'Non-Declined Loans', 'Loan Data 6-19-2020 630pm.xlsx')
  );
  await loadPolicyMapDada(path.join(BASE_PATH, 'Policy Map', 'Policy Map Data 7-16-2020.xlsx'));
  await loadSamsData(path.join(BASE_PATH, 'SAMS', 'SAM_Exclusions_Public_Extract_20161.CSV'));
  await loadTaxationData(
    path.join(BASE_PATH, 'Taxation', 'EDA_PROD_P2_2ndBatch_Output_071520 COMBINED.xlsx')
  );
  await loadWR30Data(
    path.join(BASE_PATH, 'WR30', 'njeda crossmatch wage output file 7-10-2020 COMBINED.txt'),
    path.join(BASE_PATH, 'WR30', '20200709 FEIN Not Found COMBINED.txt')
  );
  await loadDolData(
    path.join(BASE_PATH, 'DOL Lists', 'Active-Emps-03302020.xlsx'),
    path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.30.2020.UID.xlsx'),
    path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.30.2020.WHD.xlsx')
  );

  // apply data
  // Ugly number of variables, but makes type inference pick up the chained unions of generics.
  // I'm probably doing it wrong. Note that a map() chain here causes out-of-memory panics.
  const apps0 = getApplications(
    path.join(BASE_PATH, 'Raw from Cognito', 'NJEDA Grant Application.xlsx'),
    path.join(BASE_PATH, 'Raw from Cognito', 'Solicitud de Subsidio.xlsx')
  ).slice(0, options.count && options.count + (options.skip || 0));

  // Need 0 through the last application desired for duplicate checking. Don't need those skipped, thereafter.
  const apps1 = map(apps0, addDuplicateData, '\nApplying duplicate data...').slice(
    options.skip,
    options.count && options.count + (options.skip || 0)
  );

  const apps2 = map(apps1, addDolData, 'Applying DOL data...');
  const apps3 = map(apps2, addGeographyData, 'Applying geography data...');
  const apps4 = map(apps3, addGrantPhase1Data, 'Applying grant phase 1 data...');
  const apps5 = map(apps4, addNonDeclinedEdaLoanData, 'Applying non-declined EDA Loan data...');
  const apps6 = map(apps5, addPolicyMapData, 'Applying Policy Map data...');
  const apps7 = map(apps6, addTaxationData, 'Applying Taxation data...');
  const apps8 = map(apps7, addSamsData, 'Applying SAMS data...');
  const apps9 = map(apps8, addWR30Data, 'Applying WR-30 data...');
  const apps10 = map(apps9, addReviewNeededData, 'Applying review-needed data...');

  // indirection
  let decoratedApplications: DecoratedApplication[] = apps10;

  // limit to county
  // NOTE: ApplicationSequenceID is generated prior to this step, and will therefore
  //       reflect the order of application submission (not the order of CRM entry).
  if (options.county) {
    decoratedApplications = decoratedApplications.filter(app =>
      options.county?.split(/\W+/)?.includes(app.geography.County)
    );
  }

  // limit to eligible opportunity zones
  // NOTE: ApplicationSequenceID is generated prior to this step, and will therefore
  //       reflect the order of application submission (not the order of CRM entry).
  if (options.ozonly) {
    decoratedApplications = decoratedApplications.filter(app => isOz(app));
  }

  // limit to non-opportunity-zone-eligible areas
  // NOTE: ApplicationSequenceID is generated prior to this step, and will therefore
  //       reflect the order of application submission (not the order of CRM entry).
  if (options.nooz) {
    decoratedApplications = decoratedApplications.filter(app => !isOz(app));
  }

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

  // counties
  console.log('\nCounties:');
  const counties = decoratedApplications
    .map(app => ({ [app.geography.County]: 1 }))
    .reduce((accum: { [county: string]: number }, currentValue: { [county: string]: number }) => {
      for (const [key, n] of Object.entries(currentValue)) {
        accum[key] = accum[key] ? accum[key] + n : n;
      }
      return accum;
    });
  Object.keys(counties)
    .sort()
    .forEach(key => {
      console.log(`  ${chalk.yellow(counties[key].toString().padStart(5))} ${key}`);
    });

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
    }${options.ozonly ? '-OZ' : ''}${
      options.county ? `-${options.county.replace(/\W+/g, '_')}` : ''
    }`;
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

    writeFile(reviews, JSON.stringify(reviewObjects), overwrite);
    writeFile(declines, JSON.stringify(declineObjects), overwrite);
    writeFile(inputs, JSON.stringify(decoratedApplications), overwrite);
    writeFile(outputs, JSON.stringify(olaDatasArray), overwrite);
  }

  // done
  console.log(`\nSuccessfully generated ${olaDatasArray.length} records.`);
}

main();
