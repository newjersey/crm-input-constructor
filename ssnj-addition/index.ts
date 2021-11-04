// TODO: get PROD record ID for each applicant (Inputs_Addition)
// TODO: check for duplicates against existing PRDU records
// TODO: as input, min/max review numbers
// TODO: review existing input parameters for usefulness, update usage docs
// TODO: format output file names to include min/max review numbers
// TODO: add WR-30 calculation back in

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

import { getRestaurants } from './inputs/restaurants';
import { options, optionsSatisfied, printStartMessage, printUsage } from './options';
import { generateOlaDatas } from './outputs/ola-datas';

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

  const restaurants = getRestaurants(
    path.join(BASE_PATH, 'SSNJ Restaurant Addition Form.xlsx'),
    path.join(BASE_PATH, 'SSNJ Restaurant Addition Review.xlsx')
  );

  const olaDatas = generateOlaDatas(restaurants);

  // print
  if (options.pretty) {
    console.dir(olaDatas, { depth: null });
  }

  // write
  if (options.out) {
    const base = `SSNJ-Round${options.round || 'ALL'}`;
    const inputs: string = path.join(OUTPUT_PATH, `${base}-${restaurants.length}-INPUTS.json`);
    const outputs: string = path.join(
      OUTPUT_PATH,
      `${base}-Restaurants-${olaDatas.SSNJRestaurants.length}.json`
    );
    const overwrite: boolean = !!options.force;

    console.log(
      `\nWriting JSON files:\
         \n  Inputs: ${chalk.blue(inputs)}\
         \n  Output: ${chalk.blue(outputs)}`
    );

    writeFile(inputs, JSON.stringify(restaurants), overwrite);
    writeFile(outputs, JSON.stringify(olaDatas), overwrite);
  }

  // done
  console.log(`\nSuccessfully generated ${olaDatas.SSNJRestaurants.length} records.`);
}

main();
