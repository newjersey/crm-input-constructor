"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWR30Data = exports.init = void 0;
const fs = require('fs');
const neatCsv = require('neat-csv');
const WR30_MAP = new Map();
const WR30_NOT_FOUND_EINS = new Set();
async function init(path, notFoundPath) {
    console.log('Loading WR-30 data...');
    const raw = fs.readFileSync(path);
    (await neatCsv(raw, {
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
    })).forEach((rawRecord) => {
        const ein = rawRecord.EIN14.substr(1, 9);
        if (!WR30_MAP.has(ein)) {
            WR30_MAP.set(ein, []);
        }
        const wageRecords = WR30_MAP.get(ein);
        const wageRecord = {
            Year: parseInt(rawRecord.Year, 10),
            Quarter: parseInt(rawRecord.Quarter, 10),
            Dollars: parseInt(rawRecord.Cents, 10) / 100,
        };
        wageRecords.push(wageRecord);
    });
    console.log('Loading WR-30 not-found data...');
    const list = fs.readFileSync(notFoundPath, 'utf8');
    list
        .split('\n')
        .map(line => line.substr(18, 9))
        .filter(str => !!str)
        .forEach(ein => WR30_NOT_FOUND_EINS.add(ein));
}
exports.init = init;
function addWR30Data(application) {
    const wr30 = {
        notFound: WR30_NOT_FOUND_EINS.has(application.Business_TIN),
        wageRecords: WR30_MAP.get(application.Business_TIN) || [],
    };
    //if (wr30.notFound && wr30.wageRecords.length) {
    //  throw new Error(`Application ${application.ApplicationId} is on the WR-30 not-found list but does have ${wr30.wageRecords.length} wage records.`);
    //}
    //if (!wr30.notFound && !wr30.wageRecords.length) {
    //  throw new Error(`Application ${application.ApplicationId} does't have any wage records but isn't on the WR-30 not-found list.`);
    //}
    return { ...application, wr30 };
}
exports.addWR30Data = addWR30Data;
//# sourceMappingURL=wr30.js.map