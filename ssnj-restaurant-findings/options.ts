const chalk = require('chalk');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

export interface Options {
  readonly base: string;
  readonly out?: boolean;
  readonly pretty?: boolean;
  readonly force?: boolean;
  readonly round?: number;
}

const optionDefinitions: object[] = [
  {
    name: 'base',
    alias: 'b',
    type: String,
    description: 'Base directory for inputs/outputs (required).',
  },
  {
    name: 'out',
    alias: 'o',
    type: Boolean,
    description: 'Whether or not to write output files.',
  },
  {
    name: 'pretty',
    alias: 'p',
    type: Boolean,
    description: 'Format JSON nicely on screen (does not effect JSON lines in output file).',
  },
  {
    name: 'force',
    alias: 'f',
    type: Boolean,
    description: 'Force overwrite of existing files (suggested only during development).',
  },
];

export const options: Options = commandLineArgs(optionDefinitions);

export function printUsage(): void {
  const usage = commandLineUsage([
    {
      header: 'CRM Input Constructor',
      content:
        'This takes grant application data from many input files (hard coded paths in index.ts) and outputs two JSON files: objects for feeding to new OLA Datas records, and objects representing all raw input data.',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
    {
      content: 'Example: npm run ssnj-restaurant-findings -- -dtpo -b /my/base/path/',
    },
  ]);

  console.log(usage);
}

export function printStartMessage(_options: Options): void {
  console.log(
    `Generating OLA Datas creation JSON from ${chalk.blue(_options.base)}\n`
  );
}

export function optionsSatisfied(_options: Options): boolean {
  return !!_options.base;
}
