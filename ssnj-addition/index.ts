// TODO: add WR-30 calculation back in

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

import { Restaurant, getRestaurants } from './inputs/restaurants';
import { options, optionsSatisfied, printStartMessage, printUsage } from './options';
import { generateOlaDatas } from './outputs/ola-datas';
import { getProductUsers } from './inputs/crm/product-user';

const BASE_PATH = options.base;
const OUTPUT_PATH = path.join(options.base, 'Output');

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

// catch duplicates within new additions
function flagInternalDuplicates(restaurants: Restaurant[]) {
  const seen = new Set<string>();

  restaurants.forEach(r => {
    const key = `Applicant: ${r.addition.Organization_EIN}, Restaurant: ${r.form.RestaurantInformation_EIN}`;

    if (seen.has(key)) {
      throw new Error(`Duplicate new applicant/restaurant pair: ${key}`);
    }

    seen.add(key);
  });
}

// catch duplicates between new additions and those already in CRM
function flagExternalDuplicates(restaurants: Restaurant[]) {
  const getCompositeKey = (prodId: string, restaurantEin: string) =>
    `Applicant: ${prodId}, Restaurant: ${restaurantEin}`;
  const prduPath = path.join(
    BASE_PATH,
    'Raw from CRM',
    'Product User Advanced Find View 11-4-2021 2-03-06 PM.xlsx'
  );
  const existing = new Set<string>(
    getProductUsers(prduPath).map(prdu =>
      getCompositeKey(prdu.Product, prdu['Employer Identification Number (EIN)'])
    )
  );

  restaurants.forEach(r => {
    const key = getCompositeKey(r.applicant['Product ID'], r.form.RestaurantInformation_EIN);

    if (existing.has(key)) {
      throw new Error(`New applicant/restaurant pair already in CRM: ${key}`);
    }

    existing.add(key);
  });
}

async function main() {
  if (optionsSatisfied(options)) {
    printStartMessage(options);
  } else {
    printUsage();
    return;
  }

  const min: number = options.min || 1;
  const max: number = options.max || Infinity;

  const restaurants = getRestaurants(
    path.join(BASE_PATH, 'Raw from CRM', 'Product Advanced Find View 11-4-2021 6-35-06 PM.xlsx'),
    path.join(BASE_PATH, 'Raw from Cognito', 'SSNJ Restaurant Addition.xlsx'),
    path.join(BASE_PATH, 'Raw from Cognito', 'SSNJ Restaurant Addition Form.xlsx'),
    path.join(BASE_PATH, 'Raw from Cognito', 'SSNJ Restaurant Addition Review.xlsx'),
    min,
    max
  );

  // catch dups
  flagInternalDuplicates(restaurants);
  flagExternalDuplicates(restaurants);

  // stringify
  const olaDatas = generateOlaDatas(restaurants);

  // print
  if (options.pretty) {
    console.dir(olaDatas, { depth: null });
  }

  // write
  if (options.out) {
    const base = `SSNJ2_Restaurant_Additions_${min}-${max}_${olaDatas.SSNJRestaurants.length}`;
    const inputs: string = path.join(OUTPUT_PATH, `${base}_INPUTS.json`);
    const outputs: string = path.join(OUTPUT_PATH, `${base}_OUTPUTS.json`);
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
  console.log(
    `\nSuccessfully generated ${olaDatas.SSNJRestaurants.length} records (from review entries ${min} to ${max}).`
  );
}

main();
