"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsSatisfied = exports.printStartMessage = exports.printUsage = exports.options = void 0;
const chalk = require('chalk');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const optionDefinitions = [
    {
        name: 'base',
        alias: 'b',
        type: String,
        description: 'Base directory for inputs/outputs (required).',
    },
    {
        name: 'language',
        alias: 'l',
        type: String,
        description: 'Limit to a language (English|Spanish).',
    },
    {
        name: 'county',
        alias: 'c',
        type: String,
        description: 'Limit to county (do not include "County"); can be a list.',
    },
    {
        name: 'ozonly',
        alias: 'z',
        type: Boolean,
        description: 'Limit to those in eligible Opportunity Zones.',
    },
    {
        name: 'nooz',
        alias: 'x',
        type: Boolean,
        description: 'Limit to those NOT in eligible Opportunity zones.',
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
exports.options = commandLineArgs(optionDefinitions);
function printUsage() {
    const usage = commandLineUsage([
        {
            header: 'CRM Input Constructor',
            content: 'This takes grant data from many input files (hard coded paths in index.ts) and outputs three JSON files: objects for feeding to new OLA Datas records, objects representing all raw input data, and objects used to send declinations.',
        },
        {
            header: 'Options',
            optionList: optionDefinitions,
        },
        {
            content: 'Example: npm run grants-2 -- -n 10 -dtpo -b /my/base/path/',
        },
    ]);
    console.log(usage);
}
exports.printUsage = printUsage;
function printStartMessage(options) {
    console.log(`Generating OLA Datas creation JSON for ${chalk.blue(options.count ? options.count : 'all')}${options.language ? ` ${chalk.blue(options.language)}` : ''} applications${(options.ozonly || options.nooz) ? ` which are ${chalk.blue(options.ozonly ? 'only' : 'not')} in eligible Opportunity Zones` : ''}, skipping ${chalk.blue(options.skip || 0)}, ${options.county ? `filtering to only include ${chalk.blue(`${options.county} County`)}, ` : ''}from ${chalk.blue(options.base)}\n`);
}
exports.printStartMessage = printStartMessage;
function optionsSatisfied(options) {
    return !!options.base;
}
exports.optionsSatisfied = optionsSatisfied;
//# sourceMappingURL=options.js.map