"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require('chalk');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');
const applications_1 = require("./inputs/applications");
const decline_1 = require("./outputs/decline");
const dol_1 = require("./inputs/dol");
const grant_phase_1_1 = require("./inputs/grant-phase-1");
const non_declined_loans_1 = require("./inputs/non-declined-loans");
const policy_map_1 = require("./inputs/policy-map");
const review_needed_1 = require("./inputs/review-needed");
const sams_1 = require("./inputs/sams");
const taxation_1 = require("./inputs/taxation");
const wr30_1 = require("./inputs/wr30");
const options_1 = require("./options");
const duplicates_1 = require("./inputs/duplicates");
const geography_1 = require("./inputs/geography");
const ola_datas_1 = require("./outputs/ola-datas");
const helpers_1 = require("./outputs/helpers");
const findings_1 = require("./outputs/findings");
const review_1 = require("./outputs/review");
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
function isOz(app) {
    var _a, _b, _c;
    return (((_a = app.policyMap) === null || _a === void 0 ? void 0 : _a.eligibilityStatus) === policy_map_1.EligibilityStatus.Eligible ||
        ((_b = app.policyMap) === null || _b === void 0 ? void 0 : _b.eligibilityStatus) === policy_map_1.EligibilityStatus.Eligible_Contiguous ||
        ((_c = app.policyMap) === null || _c === void 0 ? void 0 : _c.eligibilityStatus) === policy_map_1.EligibilityStatus.Eligible_LIC);
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
    // load
    await review_needed_1.init(path.join(BASE_PATH, 'Review Needed', 'NJEDA Review List 8-27-2020 1-30pm.xlsx'));
    await grant_phase_1_1.init(path.join(BASE_PATH, 'Grant Phase 1', 'Phase 1 Statuses As Of 7-16-2020 5-10pm.xlsx'));
    await non_declined_loans_1.init(path.join(BASE_PATH, 'Non-Declined Loans', 'Loan Data 6-19-2020 630pm.xlsx'));
    await policy_map_1.init(path.join(BASE_PATH, 'Policy Map', 'Policy Map Data 7-16-2020.xlsx'));
    await sams_1.init(path.join(BASE_PATH, 'SAMS', 'SAM_Exclusions_Public_Extract_20161.CSV'));
    await taxation_1.init(path.join(BASE_PATH, 'Taxation', 'EDA_PROD_P2_2ndBatch_Output_071520 COMBINED.xlsx'));
    await wr30_1.init(path.join(BASE_PATH, 'WR30', 'njeda crossmatch wage output file 7-10-2020 COMBINED.txt'), path.join(BASE_PATH, 'WR30', '20200709 FEIN Not Found COMBINED.txt'));
    await dol_1.init(path.join(BASE_PATH, 'DOL Lists', 'Active-Emps-03302020.xlsx'), path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.30.2020.UID.xlsx'), path.join(BASE_PATH, 'DOL Lists', 'No.Go.List.3.30.2020.WHD.xlsx'));
    // apply data
    // Ugly number of variables, but makes type inference pick up the chained unions of generics.
    // I'm probably doing it wrong. Note that a map() chain here causes out-of-memory panics.
    const apps0 = applications_1.getApplications(path.join(BASE_PATH, 'Raw from Cognito', 'NJEDA Grant Application.xlsx'), path.join(BASE_PATH, 'Raw from Cognito', 'Solicitud de Subsidio.xlsx')).slice(0, options_1.options.count && options_1.options.count + (options_1.options.skip || 0));
    // Need 0 through the last application desired for duplicate checking. Don't need those skipped, thereafter.
    const apps1 = map(apps0, duplicates_1.addDuplicateData, '\nApplying duplicate data...').slice(options_1.options.skip, options_1.options.count && options_1.options.count + (options_1.options.skip || 0));
    const apps2 = map(apps1, dol_1.addDolData, 'Applying DOL data...');
    const apps3 = map(apps2, geography_1.addGeographyData, 'Applying geography data...');
    const apps4 = map(apps3, grant_phase_1_1.addGrantPhase1Data, 'Applying grant phase 1 data...');
    const apps5 = map(apps4, non_declined_loans_1.addNonDeclinedEdaLoanData, 'Applying non-declined EDA Loan data...');
    const apps6 = map(apps5, policy_map_1.addPolicyMapData, 'Applying Policy Map data...');
    const apps7 = map(apps6, taxation_1.addTaxationData, 'Applying Taxation data...');
    const apps8 = map(apps7, sams_1.addSamsData, 'Applying SAMS data...');
    const apps9 = map(apps8, wr30_1.addWR30Data, 'Applying WR-30 data...');
    const apps10 = map(apps9, review_needed_1.addReviewNeededData, 'Applying review-needed data...');
    // indirection
    let decoratedApplications = apps10;
    // limit to county
    // NOTE: ApplicationSequenceID is generated prior to this step, and will therefore
    //       reflect the order of application submission (not the order of CRM entry).
    if (options_1.options.county) {
        decoratedApplications = decoratedApplications.filter(app => { var _a, _b; return (_b = (_a = options_1.options.county) === null || _a === void 0 ? void 0 : _a.split(/\W+/)) === null || _b === void 0 ? void 0 : _b.includes(app.geography.County); });
    }
    // limit to eligible opportunity zones
    // NOTE: ApplicationSequenceID is generated prior to this step, and will therefore
    //       reflect the order of application submission (not the order of CRM entry).
    if (options_1.options.ozonly) {
        decoratedApplications = decoratedApplications.filter(app => isOz(app));
    }
    // limit to non-opportunity-zone-eligible areas
    // NOTE: ApplicationSequenceID is generated prior to this step, and will therefore
    //       reflect the order of application submission (not the order of CRM entry).
    if (options_1.options.nooz) {
        decoratedApplications = decoratedApplications.filter(app => !isOz(app));
    }
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
    const reviewObjects = (map(decoratedApplications, review_1.generateReview, 'Generating review objects...').filter(r => r));
    // generate declines
    const declineObjects = (map(decoratedApplications, decline_1.generateDecline, 'Generating decline objects...').filter(d => d));
    // print
    if (options_1.options.pretty) {
        console.dir(olaDatasArray, { depth: null });
    }
    // counties
    console.log('\nCounties:');
    const counties = decoratedApplications
        .map(app => ({ [app.geography.County]: 1 }))
        .reduce((accum, currentValue) => {
        for (const [key, n] of Object.entries(currentValue)) {
            accum[key] = accum[key] ? accum[key] + n : n;
        }
        return accum;
    });
    Object.keys(counties)
        .sort()
        .forEach(key => {
        console.log(`  ${chalk.yellow(counties[key].toString().padStart(5))} ${key}`);
    });
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
    Object.keys(findings)
        .sort()
        .forEach(key => {
        console.log(`  ${chalk.yellow(findings[key].toString().padStart(5))} ${key}`);
    });
    // write
    if (options_1.options.out) {
        const n = options_1.options.count || 'all';
        const env = options_1.options.test ? 'TEST' : 'PROD';
        const base = `${env}-${n}-skipping-${options_1.options.skip || 0}${options_1.options.language ? `-${options_1.options.language}` : ''}${options_1.options.ozonly ? '-OZ' : ''}${options_1.options.county ? `-${options_1.options.county.replace(/\W+/g, '_')}` : ''}`;
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