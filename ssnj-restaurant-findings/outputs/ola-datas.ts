const chalk = require('chalk');

import { OlaDatas } from './types';
import { getFindings } from './helpers';
import { DecoratedRestaurant } from '../inputs/restaurants';

export function generateOlaDatas(decoratedRestaurants: DecoratedRestaurant[]): OlaDatas {
  try {
    const olaDatas: OlaDatas = decoratedRestaurants.map(restaurant => ({
      ProductUserRecordId: restaurant["Product User ID"],
      njeda_projectuser: restaurant["(Do Not Modify) Project User"],
      EIN: restaurant["Employer Identification Number (EIN)"],
      BusinessName: restaurant.User,
      Findings: getFindings(restaurant),
    }));

    return olaDatas;
  } catch (e) {
    console.error(chalk.red(`Error found while generating OLA Datas:`));
    console.dir(e, { depth: null });

    throw e;
  }
}
