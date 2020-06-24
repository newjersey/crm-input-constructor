const chalk = require('chalk');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

export interface Options {
  readonly en: string;
  readonly es: string;
  readonly skip?: number;
  readonly count?: number;
  readonly out?: string;
  readonly pretty?: boolean;
  readonly debug?: boolean;
  readonly force?: boolean;
  readonly test?: boolean;
}

const optionDefinitions: object[] = [
  {
    name: 'en',
    type: String,
    description: '(REQUIRED) English source XLSX input file.',
  },
  {
    name: 'es',
    type: String,
    description: '(REQUIRED) Spanish source XLSX input file.',
  },
  {
    name: 'skip',
    alias: 's',
    type: Number,
    description: 'Number of applications to skip (default 0).',
  },
  {
    name: 'count',
    alias: 'n',
    type: Number,
    description: 'Total number of applications to include (default: all).',
  },
  {
    name: 'out',
    alias: 'o',
    type: String,
    description: 'Directory to hold output files.',
  },
  {
    name: 'pretty',
    alias: 'p',
    type: Boolean,
    description: 'Format JSON nicely on screen (does not effect JSON lines in output file).',
  },
  {
    name: 'debug',
    alias: 'd',
    type: Boolean,
    description: 'Include extra data useful ffor debugging.',
  },
  {
    name: 'force',
    alias: 'f',
    type: Boolean,
    description: 'Force overwrite of existing files (suggested only during development).',
  },
  {
    name: 'test',
    alias: 't',
    type: Boolean,
    description: 'If this run is meant for the CRM TEST environment (uses different entity IDs).',
  },
];

export const options: Options = commandLineArgs(optionDefinitions);

export function printUsage(): void {
  const usage = commandLineUsage([
    {
      header: 'CRM Input Constructor',
      content:
        'This takes grant data from two XLSX input files and outputs a corresponding JSON array of objects for feeding to new OLA Datas records.',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
    {
      content: 'Example: npm run grants-2 -- --en=grants/sample-en.csv --es=grants/sample-es.csv',
    },
  ]);

  console.log(usage);
}

export function printStartMessage(options: Options): void {
  console.log(
    `Generating OLA Datas creation JSON for ${chalk.blue(
      options.count ? options.count : 'all'
    )} applications, skipping ${chalk.blue(options.skip || 0)}, from:\
    \n  ${chalk.blue(options.en)}\
    \n  ${chalk.blue(options.es)}\n`
  );
}

export function optionsSatisfied(options: Options): boolean {
  return !!options.en && !!options.es;
}
