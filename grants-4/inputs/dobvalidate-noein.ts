const fs = require('fs');
const neatCsv = require('neat-csv');
const stringSimilarity = require('string-similarity');

import { Application } from './applications';
import { Taxation } from './taxation';

interface DOBValidateNOEINRecord {
    readonly Program: string;
    readonly ApplicationID: string;
    readonly ApplicantName: string;
    readonly EIN: string;
    readonly Amount: number;
}

interface PosssibleMatches {
    readonly possibleMatches: DOBValidateNOEINRecord[];
}

export interface DOBValidateNoEIN {
    readonly DOBValidateNOEIN: PosssibleMatches;
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
    record: DOBValidateNOEINRecord
): boolean {
    
    return (
        (shouldFlag(record.ApplicantName, application.ContactInformation_BusinessName) ||
            shouldFlag(record.ApplicantName, application.ContactInformation_DoingBusinessAsDBA)
            || shouldFlag(record.ApplicantName, application.taxation['TAXREG Name'])
            )
    );
}

let DOBValidate_NOEIN_RECORDS: DOBValidateNOEINRecord[];

export async function init(path: string) {
    console.log('Loading DOB Validate NO EIN data...');
    const raw: string = fs.readFileSync(path);
    DOBValidate_NOEIN_RECORDS = await neatCsv(raw);
}

export function addDOBValidateNOEINData<T extends Application & Taxation>(application: T): T & DOBValidateNoEIN {
    const possibleMatches: DOBValidateNOEINRecord[] = DOBValidate_NOEIN_RECORDS.filter(record =>
        isPossibleMatch(application, record)
    );

    const DOBValidateNOEIN: PosssibleMatches = { possibleMatches };

    return { ...application, DOBValidateNOEIN };
}
