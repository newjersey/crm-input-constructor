const chalk = require('chalk');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');

import { Application, getApplications } from './inputs/applications';
import { Restaurant, getRestaurants, DecoratedRestaurant } from './inputs/restaurants';
import { Decision, DecoratedApplication, OlaDatas } from './outputs/types';
import { addDolData, init as loadDolData } from './inputs/restaurants/dol';
import { addSamsData, init as loadSamsData } from './inputs/restaurants/sams';
import { addTaxationData, init as loadTaxationData } from './inputs/restaurants/taxation';
import { addWR30Data, init as loadWR30Data } from './inputs/restaurants/wr30';
import { options, optionsSatisfied, printStartMessage, printUsage } from './options';
import { generateOlaDatas } from './outputs/ola-datas';
import { getDecision } from './outputs/helpers';

function map<T extends Application | Restaurant, K>(
  entities: T[],
  fn: (entity: T) => K,
  message: string
): K[] {
  console.log(message);

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(entities.length, 0);

  const result = entities.map((entity: T, index: number) => {
    bar.update(index + 1);
    try {
      return fn(entity);
    } catch (e) {
      throw new Error(
        `\nError while ${message.toLowerCase().replace(/\./g, '')}: ${e.message}`
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
  await loadSamsData(path.join(BASE_PATH, 'SAMS', 'SAM_Exclusions_Public_Extract_21029.CSV'));
  await loadTaxationData(
    path.join(BASE_PATH, 'Taxation', 'EDA Sustain and Serve - Tax Clearance Results.xlsx')
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
  const restaurants0 = getRestaurants(
    path.join(BASE_PATH, 'Modified from Cognito', 'Master.xlsx'),
  );

  const restaurants1 = map(restaurants0, addDolData, 'Applying DOL data...');
  const restaurants2 = map(restaurants1, addTaxationData, 'Applying Taxation data...');
  const restaurants3 = map(restaurants2, addSamsData, 'Applying SAMS data...');
  // const restaurants4 = map(restaurants3, addWR30Data, 'Applying WR-30 data...');

  // indirection
  let decoratedRestaurants: DecoratedRestaurant[] = restaurants3;

  const applications = getApplications(
    path.join(BASE_PATH, 'Modified from Cognito', 'Master.xlsx'),
  );

  // TODO
  let decoratedApplications: DecoratedApplication[] = applications;

  // debug
  if (options.debug) {
    // console.dir(decoratedRestaurants.filter(dr => dr.sams.possibleMatches.length), { depth: null });
    console.dir(decoratedRestaurants, { depth: null });
  }
/*
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
*/
  // write
  if (options.out) {
    const env = options.test ? 'TEST' : 'PROD';
    const base = `${env}`;
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
    // writeFile(outputs, JSON.stringify(olaDatasArray), overwrite);
  }

  // done
  // console.log(`\nSuccessfully generated ${olaDatasArray.length} records.`);
}

main();
