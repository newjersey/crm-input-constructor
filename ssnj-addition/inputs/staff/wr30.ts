const fs = require('fs');
const neatCsv = require('neat-csv');
import { Restaurant } from '../restaurants';

interface RawRecord {
  readonly SSN: string;
  readonly First: string;
  readonly Middle: string;
  readonly Last: string;
  readonly Ignore1: string;
  readonly Ignore2: string;
  readonly Ignore3: string;
  readonly Ignore4: string;
  readonly Year: string;
  readonly Quarter: string;
  readonly Cents: string;
  readonly Ignore5: string;
  readonly EIN14: string;
  readonly Ignore6: string;
  readonly Ignore7: string;
  readonly Ignore8: string;
  readonly Ignore9: string;
}

interface WageRecord {
  readonly Year: number;
  readonly Quarter: number;
  readonly Dollars: number;
}

interface WR30Data {
  readonly notFound: boolean;
  readonly wageRecords: WageRecord[];
}

export interface WR30 {
  readonly wr30: WR30Data;
}

const WR30_MAP = new Map<string, WageRecord[]>();
const WR30_NOT_FOUND_EINS = new Set<string>();

export async function makeAddWR30Data(path: string, notFoundPath: string) {
  console.log('Loading WR-30 data...');
  const raw: string = fs.readFileSync(path);

  (
    await neatCsv(raw, {
      strict: true,
      headers: [
        'SSN',
        'First',
        'Middle',
        'Last',
        'Ignore1',
        'Ignore2',
        'Ignore3',
        'Ignore4',
        'Year',
        'Quarter',
        'Cents',
        'Ignore5',
        'EIN14',
        'Ignore6',
        'Ignore7',
        'Ignore8',
        'Ignore9',
      ],
    })
  ).forEach((rawRecord: RawRecord) => {
    const ein = rawRecord.EIN14.substr(1, 9);

    if (!WR30_MAP.has(ein)) {
      WR30_MAP.set(ein, []);
    }

    const wageRecords: WageRecord[] = <WageRecord[]>WR30_MAP.get(ein);
    const wageRecord: WageRecord = {
      Year: parseInt(rawRecord.Year, 10),
      Quarter: parseInt(rawRecord.Quarter, 10),
      Dollars: parseInt(rawRecord.Cents, 10) / 100,
    };

    wageRecords.push(wageRecord);
  });

  console.log('Loading WR-30 not-found data...');
  const list: string = fs.readFileSync(notFoundPath, 'utf8');
  list
    .split('\n')
    .map(line => line.substr(17, 9))
    .filter(str => !!str)
    .forEach(ein => WR30_NOT_FOUND_EINS.add(ein));

  return function addWR30Data<T extends Restaurant>(restaurant: T): T & WR30 {
    const wr30: WR30Data = {
      notFound: WR30_NOT_FOUND_EINS.has(restaurant.form.RestaurantInformation_EIN),
      wageRecords: WR30_MAP.get(restaurant.form.RestaurantInformation_EIN) || [],
    };

    if (wr30.notFound && wr30.wageRecords.length) {
      throw new Error(
        `Restaurant ${restaurant.form.RestaurantInformation_EIN} is on the WR-30 not-found list but does have ${wr30.wageRecords.length} wage records.`
      );
    }

    if (!wr30.notFound && !wr30.wageRecords.length) {
      throw new Error(
        `Restaurant ${restaurant.form.RestaurantInformation_EIN} does't have any wage records but isn't on the WR-30 not-found list.`
      );
    }

    return { ...restaurant, wr30 };
  }
}
