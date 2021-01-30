const chalk = require('chalk');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');

import { Application, getApplications } from './inputs/applications';
import { Decision, DecoratedApplication, OlaDatas } from './outputs/types';
import { addDolData, init as loadDolData } from './inputs/dol';

import { addSamsData, init as loadSamsData } from './inputs/sams';
import { addTaxationData, init as loadTaxationData } from './inputs/taxation';
import { addWR30Data, init as loadWR30Data } from './inputs/wr30';
import { options, optionsSatisfied, printStartMessage, printUsage } from './options';
import { addDuplicateData } from './inputs/duplicates';
import { generateOlaDatas } from './outputs/ola-datas';
import { getDecision } from './outputs/helpers';
import { getFindings } from './outputs/findings';

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

function writeFile(_path: string, content: string, overwrite: boolean): void {
  fs.writeFile(
    _path,
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

  // load
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
  const apps3 = map(apps2, addTaxationData, 'Applying Taxation data...');
  const apps4 = map(apps3, addSamsData, 'Applying SAMS data...');
  const apps5 = map(apps4, addWR30Data, 'Applying WR-30 data...');

  // indirection
  let decoratedApplications: DecoratedApplication[] = apps5;

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
    const n = options.count || 'all';
    const env = options.test ? 'TEST' : 'PROD';
    const base = `${env}-${n}-skipping-${options.skip || 0}${
      options.language ? `-${options.language}` : ''
    }${options.ozonly ? '-OZ' : ''}${
      options.county ? `-${options.county.replace(/\W+/g, '_')}` : ''
    }`;
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
