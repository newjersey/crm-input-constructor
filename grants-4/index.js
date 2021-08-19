"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require('chalk');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');
const applications_1 = require("./inputs/applications");
const decline_1 = require("./outputs/decline");
const dol_1 = require("./inputs/dol");
const dol_noein_1 = require("./inputs/dol-noein");
const child_care_1 = require("./inputs/child-care");
const eda_hold_list_1 = require("./inputs/eda-hold-list");
const dobvalidate_1 = require("./inputs/dobvalidate");
const dobvalidate_noein_1 = require("./inputs/dobvalidate-noein");
const duplicateEIN_1 = require("./inputs/duplicateEIN");
const duplicateAddress_1 = require("./inputs/duplicateAddress");
const sams_1 = require("./inputs/sams");
const taxation_1 = require("./inputs/taxation");
const wr30_1 = require("./inputs/wr30");
const options_1 = require("./options");
const duplicates_1 = require("./inputs/duplicates");
const ola_datas_1 = require("./outputs/ola-datas");
const helpers_1 = require("./outputs/helpers");
const findings_1 = require("./outputs/findings");
const ABC_1 = require("./inputs/ABC");
const review_1 = require("./outputs/review");
//import { addReviewNeededData, init as loadReviewNeededData } from './inputs/review-needed';
function map(applications, fn, message) {
    console.log(message);
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(applications.length, 0);
    const result = applications.map((application, index) => {
        bar.update(index + 1);
        try {
            return fn(application);
        }
        catch (e) {
            throw new Error(`\nError while ${message.toLowerCase().replace(/\./g, '')} to ${application.ApplicationId}: ${e.message}`);
        }
    });
    bar.stop();
    return result;
}
function writeFile(path, content, overwrite) {
    fs.writeFile(path, content, {
        encoding: 'utf8',
        mode: overwrite ? 0o600 : 0o400,
        flag: overwrite ? 'w' : 'wx',
    }, (err) => {
        if (err)
            throw err;
    });
}
async function main() {
    if (options_1.optionsSatisfied(options_1.options)) {
        options_1.printStartMessage(options_1.options);
    }
    else {
        options_1.printUsage();
        return;
    }
    const BASE_PATH = options_1.options.base;
    const OUTPUT_PATH = path.join(options_1.options.base, 'Output');
    await wr30_1.init(path.join(BASE_PATH, 'WR30', 'njeda crossmatch wage output file 7-16-2021.txt'), path.join(BASE_PATH, 'WR30', '20210716 FEIN Not Found.txt'));
    await child_care_1.init(path.join(BASE_PATH, 'DCF-DHS', 'DCF-DHS Centers FEIN Report 4.23.2021.xlsx'));
    await eda_hold_list_1.init(path.join(BASE_PATH, 'EDA Hold', 'NJEDA HOLD List 5-10-2021.xlsx'));
    await dobvalidate_1.init(path.join(BASE_PATH, 'DOB', 'Combined DOB for Console App As of 5-4-2021 7am wEIN_Latest BC 5-20-2021 - Phase4B Corrected 8-19-2021.csv'));
    await dobvalidate_noein_1.init(path.join(BASE_PATH, 'DOB', 'Combined DOB for Console App As of 5-4-2021 7am NO EIN.csv'));
    await sams_1.init(path.join(BASE_PATH, 'SAMS', 'SAM_Exclusions_Public_Extract_21123.CSV'));
    await taxation_1.init(path.join(BASE_PATH, 'Taxation', 'Phase 4b Tax Data 7-16-2021_Output PW NJEDA2021.xlsx'));
    await dol_1.init(path.join(BASE_PATH, 'DOL Lists', 'eda_all_active09172020_new.xlsx'), path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.23.2021.UID.xlsx'), path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.23.2021.WHD.xlsx'));
    await dol_noein_1.init(path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.23.2021.WHD_No_EIN.csv'));
    await ABC_1.init(path.join(BASE_PATH, 'ABC', 'EDA EO Violations Spreadsheet through 5.7.csv'));
    await duplicateEIN_1.init(path.join(BASE_PATH, 'DuplicateEINAddress', 'Duplicate EIN-Address Check-Grant4.csv'));
    await duplicateAddress_1.init(path.join(BASE_PATH, 'DuplicateEINAddress', 'Duplicate EIN-Address Check-Grant4.csv'));
    // apply data
    // Ugly number of variables, but makes type inference pick up the chained unions of generics.
    // I'm probably doing it wrong. Note that a map() chain here causes out-of-memory panics.
    const apps0 = applications_1.getApplications(path.join(BASE_PATH, 'Row from CRM_Portal', 'NJEDA MicroLoan Application-Grant4.xlsx'), //NJEDA Grant Application
    path.join(BASE_PATH, 'Row from CRM_Portal', 'Solicitud de Subsidio2.xlsx')).slice(0, options_1.options.count && options_1.options.count + (options_1.options.skip || 0));
    // Need 0 through the last application desired for duplicate checking. Don't need those skipped, thereafter.
    const apps1 = map(apps0, duplicates_1.addDuplicateData, '\nApplying duplicate data...').slice(options_1.options.skip, options_1.options.count && options_1.options.count + (options_1.options.skip || 0));
    const apps2 = map(apps1, dol_1.addDolData, 'Applying DOL data...');
    const apps3 = map(apps2, taxation_1.addTaxationData, 'Applying Taxation data...');
    const apps4 = map(apps3, sams_1.addSamsData, 'Applying SAMS data...');
    const apps5 = map(apps4, wr30_1.addWR30Data, 'Applying WR-30 data...');
    const apps6 = map(apps5, ABC_1.addABCData, 'Applying ABC data...');
    const apps7 = map(apps6, child_care_1.addChildCareData, 'Applying Child-Care data from DCF-DHS...');
    const apps8 = map(apps7, eda_hold_list_1.addEDAHoldListData, 'Applying EDA Hold List data...');
    const apps9 = map(apps8, dol_noein_1.addDOLNOEINData, 'Applying DOL WHD NO EIN NO GO data...');
    const apps10 = map(apps9, dobvalidate_1.addDOBValidationData, 'Applying Sister Agencies DOB data...');
    const apps11 = map(apps10, dobvalidate_noein_1.addDOBValidateNOEINData, 'Applying Sister Agencies DOB NO EIN data...');
    const apps12 = map(apps11, duplicateEIN_1.addDuplicateEINData, 'Applying Duplicate EIN data...');
    const apps13 = map(apps12, duplicateAddress_1.addDuplicateAddressData, 'Applying Duplicate Address data...');
    // indirection
    let decoratedApplications = apps13;
    // limit to language
    // NOTE: ApplicationSequenceID is generated prior to this step, and will therefore
    //       reflect the order of application submission (not the order of CRM entry).
    if (options_1.options.language) {
        decoratedApplications = decoratedApplications.filter(app => app.Language === options_1.options.language);
    }
    // debug
    if (options_1.options.debug) {
        console.dir(decoratedApplications, { depth: null });
    }
    // curry
    const generateFunc = (app) => ola_datas_1.generateOlaDatas(app, !!options_1.options.test);
    // generate
    const olaDatasArray = map(decoratedApplications, generateFunc, 'Generating OLADatas objects...');
    // generate reviews
    const reviewObjects = (map(decoratedApplications, review_1.generateReview, 'Generating review objects...').filter(r => { var _a; return (_a = r === null || r === void 0 ? void 0 : r.reasons) === null || _a === void 0 ? void 0 : _a.length; }));
    // generate declines
    const declineObjects = (map(decoratedApplications, decline_1.generateDecline, 'Generating decline objects...').filter(d => d));
    // print
    if (options_1.options.pretty) {
        console.dir(olaDatasArray, { depth: null });
    }
    // stats
    const stats = {};
    decoratedApplications
        .map(app => helpers_1.getDecision(app))
        .forEach(decision => {
        stats[decision] = (stats[decision] || 0) + 1;
    });
    console.log('\n', stats, '\n');
    const findings = decoratedApplications
        .map(app => findings_1.getFindings(app).map(finding => `(${chalk.bold(finding.severity)}) ${finding.name}`))
        .reduce((accum, appFindings) => {
        appFindings.forEach(finding => {
            accum[finding] = (accum[finding] || 0) + 1;
        });
        return accum;
    }, {});
    //console.log(findings);
    Object.keys(findings)
        .sort()
        .forEach(key => {
        console.log(`  ${chalk.yellow(findings[key].toString().padStart(5))} ${key}`);
    });
    // write
    if (options_1.options.out) {
        const n = options_1.options.count || 'all';
        const env = options_1.options.test ? 'TEST' : 'PROD';
        const base = `${env}-${n}-skipping-${options_1.options.skip || 0}${options_1.options.language ? `-${options_1.options.language}` : ''}${options_1.options.county ? `-${options_1.options.county}` : ''}`;
        const reviews = path.join(OUTPUT_PATH, `${base}-${reviewObjects.length}-REVIEW.json`);
        const declines = path.join(OUTPUT_PATH, `${base}-${declineObjects.length}-DECLINES.json`);
        const inputs = path.join(OUTPUT_PATH, `${base}-${decoratedApplications.length}-INPUTS.json`);
        const outputs = path.join(OUTPUT_PATH, `${base}-${decoratedApplications.length}-OUTPUTS.json`);
        const overwrite = !!options_1.options.force;
        console.log(`\nWriting JSON files:\
         \n  Declines: ${chalk.blue(declines)}\
         \n  Reviews: ${chalk.blue(reviews)}\
         \n  Inputs: ${chalk.blue(inputs)}\
         \n  Output: ${chalk.blue(outputs)}`);
        //         \n  Reviews: ${chalk.blue(reviews)}
        writeFile(reviews, JSON.stringify(reviewObjects), overwrite);
        writeFile(declines, JSON.stringify(declineObjects), overwrite);
        writeFile(inputs, JSON.stringify(decoratedApplications), overwrite);
        writeFile(outputs, JSON.stringify(olaDatasArray), overwrite);
    }
    // done
    console.log(`\nSuccessfully generated ${olaDatasArray.length} records.`);
}
main();
//# sourceMappingURL=index.js.map