const chalk = require('chalk');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');

import { Application, getApplications } from './inputs/applications';
import {
  Restaurant,
  getRestaurants,
  DecoratedRestaurant,
  makeAddRestaurants,
} from './inputs/restaurants';
import { DecoratedApplication, OlaDatas } from './outputs/types';
import { addDolData, init as loadDolData } from './inputs/restaurants/dol';
import { addSamsData, init as loadSamsData } from './inputs/restaurants/sams';
import { addTaxationData, init as loadTaxationData } from './inputs/restaurants/taxation';
import { addWR30Data, init as loadWR30Data } from './inputs/restaurants/wr30';
import { options, optionsSatisfied, printStartMessage, printUsage } from './options';
import { generateOlaDatas } from './outputs/ola-datas';
import { getQuarterlyWageData } from './outputs/helpers';

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
      throw new Error(`\nError while ${message.toLowerCase().replace(/\./g, '')}: ${e.message}`);
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
    path.join(BASE_PATH, 'WR30', 'njeda crossmatch wage output file 2-3-2021.txt'),
    path.join(BASE_PATH, 'WR30', '20210203 FEIN Not Found.txt')
  );
  await loadDolData(
    path.join(BASE_PATH, 'DOL Lists', 'Active-Emps-03302020.xlsx'),
    path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.30.2020.UID.xlsx'),
    path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.30.2020.WHD.xlsx')
  );

  // apply data
  // Ugly number of variables, but makes type inference pick up the chained unions of generics.
  // I'm probably doing it wrong. Note that a map() chain here causes out-of-memory panics.
  const restaurants0 = getRestaurants(path.join(BASE_PATH, 'Modified from Cognito', 'Master.xlsx'));

  const restaurants1 = map(restaurants0, addDolData, 'Applying DOL data...');
  const restaurants2 = map(restaurants1, addTaxationData, 'Applying Taxation data...');
  const restaurants3 = map(restaurants2, addSamsData, 'Applying SAMS data...');
  const restaurants4 = map(restaurants3, addWR30Data, 'Applying WR-30 data...');

  // indirection
  let decoratedRestaurants: DecoratedRestaurant[] = restaurants4;

  const applications = getApplications(
    path.join(BASE_PATH, 'Modified from Cognito', 'Master.xlsx')
  );

  // TODO
  const addRestaurants = makeAddRestaurants(decoratedRestaurants);
  let decoratedApplications: DecoratedApplication[] = map(
    applications,
    addRestaurants,
    'Adding restaurants to applications...'
  );

  // debug
  if (options.debug) {
    let tsv = `ID\tEIN\tName\tDBA`;

    [...decoratedApplications]
      .sort((a, b) => {
        if (a.Organization_BusinessName > b.Organization_BusinessName) {
          return 1;
        }
        if (a.Organization_BusinessName < b.Organization_BusinessName) {
          return -1;
        }
        return 0;
      })
      .forEach(application => {
        tsv += `\n${application.ApplicationId}\t${application.Organization_EIN}\t${application.Organization_BusinessName}\t${application.DBA}`;
        application.restaurants.forEach(restaurant => {
          tsv += `\n${restaurant.Inputs_RestaurantFormId}\t${restaurant.RestaurantInformation_EIN}\t${restaurant.RestaurantInformation_RestaurantName}\t${restaurant.RestaurantInformation_DBA}`;
        });
      });

    writeFile(path.join(OUTPUT_PATH, `ssnj.tsv`), tsv, true);
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
    writeFile(outputs, JSON.stringify(olaDatasArray), overwrite);
  }

  if (options.debug) {
    let wr30 = `ID\tEIN\tName\tDBA\tQ2\tQ3\tQ4\tApplication Date\tRestaurant Form Date\tRestaurant Review Date`;

    decoratedRestaurants.forEach(r => {
      const id = r.SSNJRestaurantForm_Id;
      const ein = r.RestaurantInformation_EIN;
      const name = r.RestaurantInformation_RestaurantName;
      const dba = r.RestaurantInformation_DBA;
      const q2 = getQuarterlyWageData(r, 2020, 2).fteCount;
      const q3 = getQuarterlyWageData(r, 2020, 3).fteCount;
      const q4 = getQuarterlyWageData(r, 2020, 4).fteCount;

      wr30 += `\n${id}\t${ein}\t${name}\t${dba}\t${q2}\t${q3}\t${q4}\t?\t${r.Entry_DateSubmitted}\t?`
    });

    writeFile(path.join(OUTPUT_PATH, `wr30.tsv`), wr30, true);
  }

  // done
  console.log(`\nSuccessfully generated ${olaDatasArray.length} records.`);
}

main();
