const chalk = require('chalk');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');

import { getRestaurants, Restaurant, DecoratedRestaurant } from './inputs/restaurants';
import { addDolData, init as loadDolData } from './inputs/restaurants/dol';
import { addSamsData, init as loadSamsData } from './inputs/restaurants/sams';
import { addTaxationData, init as loadTaxationData } from './inputs/restaurants/taxation';
import { addWR30Data, init as loadWR30Data } from './inputs/restaurants/wr30';
import { options, optionsSatisfied, printStartMessage, printUsage } from './options';
import { generateOlaDatas } from './outputs/ola-datas';
import { NO_FINDINGS_STRING } from './outputs/helpers';

function map<T extends Restaurant, K>(entities: T[], fn: (entity: T) => K, message: string): K[] {
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
  await loadSamsData(path.join(BASE_PATH, 'SAMS', 'SAM_Exclusions_Public_Extract_21215.CSV'));
  await loadTaxationData(
    path.join(BASE_PATH, 'Taxation', 'EDA Sustain and Serve 2 - Tax Clearance Results.xlsx')
  );
  await loadWR30Data(
    path.join(BASE_PATH, 'WR30', 'njeda crossmatch wage output file 7-26-2021.txt'),
    path.join(BASE_PATH, 'WR30', '20210726 FEIN Not Found.txt')
  );
  await loadDolData(
    path.join(BASE_PATH, 'DOL Lists', 'Active-Emps-03302020.xlsx'),
    path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.23.2021.UID.xlsx'),
    path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.23.2021.WHD.xlsx')
  );

  // apply data
  // Ugly number of variables, but makes type inference pick up the chained unions of generics.
  // I'm probably doing it wrong. Note that a map() chain here causes out-of-memory panics.
  const restaurants0 = getRestaurants(
    path.join(BASE_PATH, 'Raw From CRM', 'SSNJ All Phase 2 Restaurants (old and new).xlsx')
  );

  const restaurants1 = map(restaurants0, addDolData, 'Applying DOL data...');
  const restaurants2 = map(restaurants1, addTaxationData, 'Applying Taxation data...');
  const restaurants3 = map(restaurants2, addSamsData, 'Applying SAMS data...');
  const restaurants4 = map(restaurants3, addWR30Data, 'Applying WR-30 data...');

  // indirection
  let decoratedRestaurants: DecoratedRestaurant[] = restaurants4;

  const olaDatas = generateOlaDatas(decoratedRestaurants);

  // print
  if (options.pretty) {
    console.dir(olaDatas, { depth: null });
  }

  // write
  if (options.out) {
    const base = `SSNJ-2-Restaurant-Findings`;
    const inputs: string = path.join(
      OUTPUT_PATH,
      `${base}-${decoratedRestaurants.length}-INPUTS.json`
    );
    const outputs: string = path.join(OUTPUT_PATH, `${base}-${olaDatas.length}.json`);
    const overwrite: boolean = !!options.force;

    console.log(
      `\nWriting JSON files:\
         \n  Inputs: ${chalk.blue(inputs)}\
         \n  Output: ${chalk.blue(outputs)}`
    );

    writeFile(inputs, JSON.stringify(decoratedRestaurants), overwrite);
    writeFile(outputs, JSON.stringify(olaDatas), overwrite);
  }

  // done
  console.log(
    `\nSuccessfully generated ${olaDatas.length} records (${
      olaDatas.filter(r => r.Findings !== NO_FINDINGS_STRING).length
    } with findings).`
  );
}

main();
