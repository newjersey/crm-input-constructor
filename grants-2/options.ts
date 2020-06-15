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
  readonly quiet?: boolean;
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
    description: 'Total number of applications to include (default ∞).',
  },
  {
    name: 'out',
    alias: 'o',
    type: String,
    description: 'Path to output file; suggest naming like ola_datas_100-skipping-5.json',
  },
  {
    name: 'pretty',
    alias: 'p',
    type: Boolean,
    description: 'Format JSON nicely on screen (does not effect JSON lines in output file).',
  },
  {
    name: 'quiet',
    alias: 'q',
    type: Boolean,
    description: 'Do not print JSON to screen.',
  },
];

const options: Options = commandLineArgs(optionDefinitions);

function printUsage(): void {
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

function printStartMessage(options: Options): void {
  console.log(
    `Generating OLA Datas creation JSON for ${chalk.blue(
      options.count ? options.count : '∞'
    )} applications, skipping ${chalk.blue(options.skip || 0)}, from:\n  ${chalk.blue(
      options.en
    )}\n  ${chalk.blue(options.es)}${options.out ? chalk.blue(' to ' + options.out) : ''}${
      options.quiet || '\n'
    }`
  );
}

function optionsSatisfied(options: Options): boolean {
  return !!options.en && !!options.es;
}

function printRunMessage() {
  if (optionsSatisfied(options)) {
    printStartMessage(options);
  } else {
    printUsage();
    return;
  }
}

export { options, printRunMessage };
