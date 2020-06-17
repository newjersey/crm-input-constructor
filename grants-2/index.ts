const chalk = require('chalk');
const cliProgress = require('cli-progress');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

import { generateOlaDatas } from './ola-datas';
import { DecoratedApplication, OlaDatas } from './ola-datas-types';
import { addDolData, init as loadDolData } from './dol';
import { addGeographyData } from './geography';
import { addGrantPhase1Data, init as loadGrantPhse1Data } from './grant-phase-1';
import { addPolicyMapData, init as loadPolicyMapDada } from './policy-map';
import { options, printRunMessage } from './options';
import { Application, getApplications } from './applications';
import { addSamsData, init as loadSamsData } from './sams';
import { addTaxationData, init as loadTaxationData } from './taxation';
import { bool } from './util';
import { addWR30Data, init as loadWR30Data } from './wr30';

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
        `Error while ${message.toLowerCase().replace(/\./g, '')} to ${application.ApplicationId}: ${
          e.message
        }`
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
  printRunMessage();

  // load
  await loadGrantPhse1Data(`${BASE_PATH}/Grant Phase 1/Phase 1 Statuses As Of 6-13-2020 7am.xlsx`);
  await loadPolicyMapDada(`${BASE_PATH}/Policy Map/Policy Map First 20768 Apps v2.xlsx`);
  await loadSamsData(`${BASE_PATH}/SAMS/SAM_Exclusions_Public_Extract_20161.CSV`);
  await loadTaxationData(`${BASE_PATH}/Taxation/EDA_PROD_OUTPUT_PROJ2_V3_061219.xlsx`);
  await loadWR30Data(
    `${BASE_PATH}/WR30/njeda crossmatch wage output file 6-9-2020.txt`,
    `${BASE_PATH}/WR30/20200609 FEIN Not Found.txt`
  );
  await loadDolData(
    `${BASE_PATH}/DOL Lists/Active-Emps-03302020.xlsx`,
    `${BASE_PATH}/DOL Lists/No.Go.List.3.30.2020.UID.xlsx`,
    `${BASE_PATH}/DOL Lists/No.Go.List.3.30.2020.WHD.xlsx`
  );

  // apply
  // Ugly number of variables, but makes type inference pick up the chained unions of generics.
  // I'm probably doing it wrong. Note that a map() chain here causes out-of-memory panics.
  const apps0 = getApplications(options.en, options.es).slice(
    options.skip,
    options.count && options.count + (options.skip || 0)
  );
  const apps1 = map(apps0, addDolData, '\nApplying DOL data...');
  const apps2 = map(apps1, addGeographyData, 'Applying geography data...');
  const apps3 = map(apps2, addGrantPhase1Data, 'Applying grant phase 1 data...');
  const apps4 = map(apps3, addPolicyMapData, 'Applying Policy Map data...');
  const apps5 = map(apps4, addTaxationData, 'Applying Taxation data...');
  const apps6 = map(apps5, addSamsData, 'Applying SAMS data...');
  const apps7 = map(apps6, addWR30Data, 'Applying WR-30 data...');

  // abstract
  const decoratedApplications: DecoratedApplication[] = apps7;

  // debug
  if (options.debug) {
    console.dir(decoratedApplications, { depth: null });
  }

  // generate
  const olaDatasArray: OlaDatas[] = map(
    decoratedApplications,
    generateOlaDatas,
    'Generating OLADatas objects...'
  );

  // print
  if (options.pretty) {
    console.dir(olaDatasArray, { depth: null });
  }

  // write
  if (options.out) {
    const debug: string = `${options.out}-INPUTS.json`;
    const overwrite: boolean = !!options.force;

    console.log(
      `\nWriting JSON files:\
       \n  Inputs: ${chalk.blue(debug)}\
       \n  Output: ${chalk.blue(options.out)}`
    );

    writeFile(debug, JSON.stringify(decoratedApplications), overwrite);
    writeFile(options.out, JSON.stringify(olaDatasArray), overwrite);
  }

  // done
  console.log(`\nSuccessfully generated ${olaDatasArray.length} records.`);
}

main();
