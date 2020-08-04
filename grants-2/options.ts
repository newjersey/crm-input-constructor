import { Languages } from './inputs/applications';

const chalk = require('chalk');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

export interface Options {
  readonly language?: Languages;
  readonly county?: string;
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
    name: 'language',
    alias: 'l',
    type: String,
    description: 'Limit to a language (English|Spanish)',
  },
  {
    name: 'county',
    alias: 'c',
    type: String,
    description: 'Limit to county (do not include "County")',
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
    description: 'Include extra data useful for debugging.',
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
        'This takes grant data from many input files (hard coded paths in index.ts) and outputs three JSON files: objects for feeding to new OLA Datas records, objects representing all raw input data, and objects used to send declinations.',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
    {
      content: 'Example: npm run grants-2 -- -n 10 -dtp -o /path/to/my/outputs/',
    },
  ]);

  console.log(usage);
}

export function printStartMessage(options: Options): void {
  console.log(
    `Generating OLA Datas creation JSON for ${chalk.blue(options.count ? options.count : 'all')}${
      options.language ? ` ${chalk.blue(options.language)}` : ''
    } applications, skipping ${chalk.blue(options.skip || 0)}, ${
      options.county ? `filtering to only include ${chalk.blue(`${options.county} County`)}, ` : ''
    }\n`
  );
}

export function optionsSatisfied(options: Options): boolean {
  // arbitrary -- assume that usage should be printed if no options are specified
  return Object.keys(options).length > 0;
}
