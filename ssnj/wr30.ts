// This assumes the input file is grouped by EIN -- seems to always be,
// but verify the output for EIN duplicates that need to be summed together.

import fs from 'fs';
import csv from 'csv-parser';

const DEBUG = false;
const CSV_DELIMITER = ',';
const FTE_ELIGIBILITY_THRESHOLD = 100;
const CSV_OUTPOUT_PATH = '/Users/ross/Downloads/wr30-output.csv';
const JSON_OUTPOUT_PATH = '/Users/ross/Downloads/wr30-output.json';
const INPUT_PATH =
  '/Users/ross/Downloads/njeda crossmatch wage output file Q 2 2020 FULL EIN List.csv';

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

const HEADERS = [
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
];

interface Company {
  ein?: string;
  fte?: number;
  eligible?: boolean;
}

function debug(str: unknown) {
  DEBUG && console.debug(str);
}

const csvWriteStream = fs.createWriteStream(CSV_OUTPOUT_PATH);
const jsonWriteStream = fs.createWriteStream(JSON_OUTPOUT_PATH);

function writeCsv(line: string): void {
  csvWriteStream.write(line + '\n');
}

function writeJson(line: string): void {
  jsonWriteStream.write(line + '\n');
}

function flushHeader(): void {
  debug('+++');
  writeCsv(['EIN', 'FTE', 'ELIGIBLE'].join(CSV_DELIMITER));
  writeJson('{');
}

let firstFlush = true;
function flushCompany(company: Company): void {
  const { ein, fte, eligible } = company;

  debug(company);
  writeCsv([ein, fte, eligible].join(CSV_DELIMITER));
  writeJson(
    (firstFlush ? ' ' : ',') +
      `${JSON.stringify(company.ein)}: ${JSON.stringify({ fte, eligible })}`
  );

  firstFlush = false;
}

function flushFooter(): void {
  debug('---');
  writeJson('}');
}

function closeFiles(): void {
  csvWriteStream.end();
  jsonWriteStream.end();
}

function getEin9(row: RawRecord): string {
  const ein9 = row.EIN14.match(/^0(\d{9})\d{5}$/)?.[1];

  if (!ein9) {
    throw new Error(`Null ein9 for row: ${JSON.stringify(row)}`);
  }

  return ein9;
}

function calcFte(row: RawRecord): number {
  const DOLLARS_PER_HOUR = 10.0;
  const HOURS_PER_WEEK = 35.0;
  const WEEKS_PER_QUARTER = 13.0;
  const FTE_QUARTERLY_MIN_WAGE: number = DOLLARS_PER_HOUR * HOURS_PER_WEEK * WEEKS_PER_QUARTER;

  const dollars: number = parseInt(row.Cents) / 100.0;
  const fte: number = dollars / FTE_QUARTERLY_MIN_WAGE;

  return Math.min(fte, 1);
}

const currentCompany: Company = {
  ein: undefined,
  fte: undefined,
  eligible: undefined,
};

function finalizeCurrentCompany({ nextEin }: { nextEin?: string } = {}): void {
  if (typeof currentCompany.ein !== 'undefined' && typeof currentCompany.fte !== 'undefined') {
    // calculate
    currentCompany.fte = Math.round(currentCompany.fte);
    currentCompany.eligible = currentCompany.fte <= FTE_ELIGIBILITY_THRESHOLD;

    // flush
    flushCompany(currentCompany);
  }

  // reset
  currentCompany.ein = nextEin;
  currentCompany.fte = 0;
  currentCompany.eligible = undefined;
}

function handleRow({ row, i }: { row: RawRecord; i: number }): void {
  const ein = getEin9(row);
  const fte = calcFte(row);

  // we've hit a company boundary
  if (ein !== currentCompany.ein) {
    finalizeCurrentCompany({ nextEin: ein });
  }

  currentCompany.fte = (currentCompany.fte as number) + fte;
}

async function parse({ path }: { path: string }): Promise<number> {
  return new Promise(async (resolve, reject) => {
    let i = 0;

    flushHeader();

    const fileStream = fs
      .createReadStream(path)
      .on('close', () => debug('fileStream close'))
      .on('data', () => debug('fileStream data'))
      .on('end', () => debug('fileStream end'))
      .on('error', () => debug('fileStream error'))
      .on('open', () => debug('fileStream open'))
      .on('pause', () => debug('fileStream pause'))
      .on('ready', () => debug('fileStream ready'))
      .on('resume', () => debug('fileStream resume'));

    const csvStream = fileStream
      .pipe(csv({ headers: HEADERS, strict: true }))
      .on('close', () => debug('csvStream close'))
      .on('error', () => debug('csvStream error'))
      .on('pause', () => debug('csvStream pause'))
      .on('resume', () => debug('csvStream resume'));

    csvStream
      .on('data', row => {
        debug('before row');
        csvStream.pause();
        handleRow({ row, i: i++ });
        csvStream.resume();
        debug('after row');
      })
      .on('end', () => {
        debug('csvStream end');
        finalizeCurrentCompany();
        flushFooter();
        closeFiles();
        resolve(i);
      });
  });
}

async function main(path: string) {
  const n = await parse({ path });
  console.log(`done: ${n} rows`);
}

main(INPUT_PATH);
