const chalk = require('chalk');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');

import { Application, getApplications } from './inputs/applications';
import { Decision, DecoratedApplication, OlaDatas } from './outputs/types';
import { addDolData, init as loadDolData } from './inputs/dol';
import { addGrantPhase1Data, init as loadGrantPhse1Data } from './inputs/grant-phase-1';
import {
  addNonDeclinedEdaLoanData,
  init as loanNonDeclinedEdaLoanData,
} from './inputs/non-declined-loans';
import { addPolicyMapData, init as loadPolicyMapDada } from './inputs/policy-map';
import { addSamsData, init as loadSamsData } from './inputs/sams';
import { addTaxationData, init as loadTaxationData } from './inputs/taxation';
import { addWR30Data, init as loadWR30Data } from './inputs/wr30';
import { options, optionsSatisfied, printStartMessage, printUsage } from './options';

import { addDuplicateData } from './inputs/duplicates';
import { addGeographyData } from './inputs/geography';
import { generateOlaDatas } from './outputs/ola-datas';
import { getDecision } from './outputs/helpers';
import { getFindings } from './outputs/findings';

const BASE_PATH = '/Users/ross/NJEDA Grants Phase 2/First 5 hours';

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

  // load
  await loadGrantPhse1Data(`${BASE_PATH}/Grant Phase 1/Phase 1 Statuses As Of 6-13-2020 7am.xlsx`);
  await loanNonDeclinedEdaLoanData(
    `${BASE_PATH}/Non-Declined Loans/Loan Data 6-19-2020 630pm.xlsx`
  );
  await loadPolicyMapDada(`${BASE_PATH}/Policy Map/Policy Map First 20768 Apps v2.xlsx`);
  await loadSamsData(`${BASE_PATH}/SAMS/SAM_Exclusions_Public_Extract_20161.CSV`);
  await loadTaxationData(
    `${BASE_PATH}/Taxation/EDA_OUTPUT_PROJ2_wRELCHK_PROD_1stLeads_061820.xlsx`
  );
  await loadWR30Data(
    `${BASE_PATH}/WR30/njeda crossmatch wage output file 6-9-2020.txt`,
    `${BASE_PATH}/WR30/20200609 FEIN Not Found.txt`
  );
  await loadDolData(
    `${BASE_PATH}/DOL Lists/Active-Emps-03302020.xlsx`,
    `${BASE_PATH}/DOL Lists/No.Go.List.3.30.2020.UID.xlsx`,
    `${BASE_PATH}/DOL Lists/No.Go.List.3.30.2020.WHD.xlsx`
  );

  // apply data
  // Ugly number of variables, but makes type inference pick up the chained unions of generics.
  // I'm probably doing it wrong. Note that a map() chain here causes out-of-memory panics.
  const apps0 = getApplications(options.en, options.es).slice(
    0,
    options.count && options.count + (options.skip || 0)
  );

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

  // indirection
  const decoratedApplications: DecoratedApplication[] = apps9;

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
  Object.keys(findings)
    .sort()
    .forEach(key => {
      console.log(`  ${chalk.yellow(findings[key].toString().padStart(5))} ${key}`);
    });

  // write
  if (options.out) {
    const n = olaDatasArray.length;
    const env = options.test ? 'TEST' : 'PROD';
    const base = `${env}-${n}-skipping-${options.skip || 0}`;
    const inputs: string = path.join(options.out, `${base}-INPUTS.json`);
    const outputs: string = path.join(options.out, `${base}-OUTPUTS.json`);
    const overwrite: boolean = !!options.force;

    console.log(
      `\nWriting JSON files:\
         \n  Inputs: ${chalk.blue(inputs)}\
         \n  Output: ${chalk.blue(outputs)}`
    );

    writeFile(inputs, JSON.stringify(decoratedApplications), overwrite);
    writeFile(outputs, JSON.stringify(olaDatasArray), overwrite);
  }

  // done
  console.log(`\nSuccessfully generated ${olaDatasArray.length} records.`);
}

main();
