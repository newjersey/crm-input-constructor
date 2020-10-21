const chalk = require('chalk');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const fs = require('fs');
const XLSX = require('xlsx');

const SHEET_NAME = 'Sheet1';

const optionDefinitions = [
  {
    name: 'src',
    alias: 's',
    type: String,
    defaultOption: true,
    description: '(REQUIRED) Source CSV input file; see sample.csv',
  },
  {
    name: 'dir',
    alias: 'd',
    type: String,
    description: '(REQUIRED) Output directory',
  },
];

function printUsage() {
  const usage = commandLineUsage([
    {
      header: 'FICO Output Splitter',
      content:
        'This takes an XLSX file and produces N new files in the designated path, each corresponding to a row.',
    },
    {
      header: 'Options',
      optionList: optionDefinitions,
    },
    {
      content: 'Example: node loans/split-fico.js --src ~/Downloads/fico.xlsx --dir ~/Downloads/fico/',
    },
  ]);

  console.log(usage);
}

function main() {
  const options = commandLineArgs(optionDefinitions);

  if (!(options.src && options.dir)) {
    printUsage();
    return;
  }

  const workbook = XLSX.readFile(options.src, { type: 'file' });
  const worksheet = workbook.Sheets[SHEET_NAME];
  rows = XLSX.utils.sheet_to_json(worksheet);

  console.log(
    `Splitting ${chalk.blue(options.src)} into ${rows.length} spreadsheets in ${chalk.blue(options.dir)}`
  );

  rows.forEach(row => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([row]);
    const path = `${options.dir}/FICO_CV19L${row['CUSTOMER REFERENCE NUMBER']}.xlsx`;

    wb.SheetNames.push(SHEET_NAME);
    wb.Sheets[SHEET_NAME] = ws;

    XLSX.writeFile(wb, path);
  });
}

main();
