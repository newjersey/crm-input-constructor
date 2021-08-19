const fs = require('fs');
const neatCsv = require('neat-csv');
const stringSimilarity = require('string-similarity');

import { Application } from './applications';
import { Taxation } from './taxation';

interface ABCExclusionRecord {
    readonly SNo: string;
    readonly AgencyNo: string;
    readonly Licensee: string;
    readonly LicenseeNo: string;
    readonly ABCorAdoption: string;
    readonly DateofVoilation: string;
    readonly NatureofVoilation: string;
    readonly ProposedChanges: string;
    readonly TotalPenalty: string;
    readonly Resolution: string;
}

interface PosssibleMatches {
    readonly possibleMatches: ABCExclusionRecord[];
}

export interface ABC {
    readonly ABC: PosssibleMatches;
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
    record: ABCExclusionRecord
): boolean {

    return (
        (shouldFlag(record.Licensee, application.ContactInformation_BusinessName) ||
            shouldFlag(record.Licensee, application.ContactInformation_DoingBusinessAsDBA)
            || shouldFlag(record.Licensee, application.taxation['TAXREG Name'])
            )
    );
}

let ABC_EXCLUSION_RECORDS: ABCExclusionRecord[];

export async function init(path: string) {
    console.log('Loading ABC data...');
    const raw: string = fs.readFileSync(path);
    ABC_EXCLUSION_RECORDS = await neatCsv(raw);
}

export function addABCData<T extends Application & Taxation>(application: T): T & ABC {
    const possibleMatches: ABCExclusionRecord[] = ABC_EXCLUSION_RECORDS.filter(record =>
        isPossibleMatch(application, record)
    );

    const ABC: PosssibleMatches = { possibleMatches };

    return { ...application, ABC };
}
