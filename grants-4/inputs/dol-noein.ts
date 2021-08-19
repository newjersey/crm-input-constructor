const fs = require('fs');
const neatCsv = require('neat-csv');
const stringSimilarity = require('string-similarity');

import { Application } from './applications';
import { Taxation } from './taxation';

interface DOLNOEINRecord {
    readonly Name: string;
    readonly Name2: string;
    readonly CORPORATENAME: string;
    readonly FEDERALID: string;
    readonly ADDRESS: string;
    readonly CITYSTATEZIPCODE: string;
    readonly WHEMPID: string;
    readonly DOCKETAMOUNT: string;
    readonly WHTOTALOUTSTANDINGAMOUNT: string;
}

interface PosssibleMatches {
    readonly possibleMatches: DOLNOEINRecord[];
}

export interface DOLNOEIN {
    readonly DOLNOEIN: PosssibleMatches;
}

function shouldFlag(a: string, b: string): boolean {
    const TOLERANCE = 0.85;

    return (
        !!a?.trim() &&
        !!b?.trim() &&
        stringSimilarity.compareTwoStrings(a.trim().toUpperCase(), b.trim().toUpperCase()) >= TOLERANCE
    );
}

function isPossibleMatch<T extends Application & Taxation>(
    application: T,
    record: DOLNOEINRecord
): boolean {
    
    return (
        (shouldFlag(record.Name2, application.ContactInformation_BusinessName) ||
            shouldFlag(record.Name2, application.ContactInformation_DoingBusinessAsDBA)
            || shouldFlag(record.Name2, application.taxation['TAXREG Name'])
            )
    );
}

let DOL_NOEIN_RECORDS: DOLNOEINRecord[];

export async function init(path: string) {
    console.log('Loading DOL WHD NO EIN data...');
    const raw: string = fs.readFileSync(path);
    DOL_NOEIN_RECORDS = await neatCsv(raw);
}

export function addDOLNOEINData<T extends Application & Taxation>(application: T): T & DOLNOEIN {
    const possibleMatches: DOLNOEINRecord[] = DOL_NOEIN_RECORDS.filter(record =>
        isPossibleMatch(application, record)
    );

    const DOLNOEIN: PosssibleMatches = { possibleMatches };

    return { ...application, DOLNOEIN };
}
