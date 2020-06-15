const fs = require('fs');
const neatCsv = require('neat-csv');
import { Application } from './applications';

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
  readonly wageRecords: WageRecord[];
  //  readonly OnNotFoundList: boolean;
}

interface WR30 {
  readonly wr30: WR30Data;
}

let WR30_MAP = new Map<string, WageRecord[]>();

export async function init(path: string) {
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
}

export function addWR30Data<T extends Application>(application: T): T & WR30 {
  const wr30: WR30Data = {
    wageRecords: WR30_MAP.get(application.Business_TIN) || []
  };

  return { ...application, wr30 };
}
