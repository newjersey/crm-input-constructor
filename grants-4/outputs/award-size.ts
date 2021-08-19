import { DecoratedApplication, DOBPrograms } from './types';
import {
    value,
    getQuarterlyWageHighestFTE,
} from './helpers';
import { bool, mround } from '../util';
import { ProgramDescriptions } from '../outputs/types';
import { isDobProgramApprovedOrInProgress } from '../outputs/helpers';
import { Console } from 'console';

const AMOUNT_PER_FTE = 1000;
const ABSOLUTE_MIN = 1000;
const ABSOLUTE_MAX = 10000;

export function highestFTE(app: DecoratedApplication): number {
    const isNumeric = (val: string): boolean => {
        return !isNaN(Number(val));
    }
    const highestFTE = isNumeric(app.njeda_highestqtrfulltimew2employees) ? Number(app.njeda_highestqtrfulltimew2employees) : 0;

    return highestFTE;
}

export function AwardBasis(app: DecoratedApplication): number {

    var size = 0;
    var highestQterFTEWR30 = Number(getQuarterlyWageHighestFTE(app).fteCount);
    size = (highestQterFTEWR30 > 25) ? 20000 : (highestQterFTEWR30 > 5 && highestQterFTEWR30 <= 25) ? 15000 : (highestQterFTEWR30 <= 5) ? 10000 : 0;

    return size;
}

export function unmetNeed(app: DecoratedApplication): number {
    
    var unrounded: number | undefined = (app.njeda_revisedbusinessfundingneeded > 0) ? app.njeda_revisedbusinessfundingneeded
        : (app.njeda_additionalbusinessfundingneeded) > 0 ? app.njeda_additionalbusinessfundingneeded : 0;

    if (unrounded >= 500 && unrounded <= 1000) {
        unrounded = 1000;
    }
    const rounded: number = mround(unrounded, 500);

    return Math.max(0, rounded);
}

export function awardSize(app: DecoratedApplication): number | null {
    const _unmetNeed: number | null = unmetNeed(app);

    if (_unmetNeed === null) {
        return null;
    }

    return Math.min(AwardBasis(app), _unmetNeed);
}

export function BusinessTypeChanged(app: DecoratedApplication): string {

    const program = (app.njeda_phase3businessprogramsrevised !== undefined) ? app.njeda_phase3businessprogramsrevised : app.njeda_phase3businessprogram;
    const isNumeric = (val: string): boolean => {
        return !isNaN(Number(val));
    }
    const highestFTE = isNumeric(app.njeda_highestqtrfulltimew2employees) ? Number(app.njeda_highestqtrfulltimew2employees) : 0;
    
    var FTE = (highestFTE !== 0) ? highestFTE
        : (app.njeda_revisedfulltimeemployeeslistedwr30 !== undefined) ? app.njeda_revisedfulltimeemployeeslistedwr30
            : (app.njeda_fulltimew2employeeslistedonwr30 !== undefined) ? app.njeda_fulltimew2employeeslistedonwr30
                : 0;

    //add the data from wr30 for highestQterFte
    var highestQterFTEWR30 = Number(getQuarterlyWageHighestFTE(app).fteCount);

    var businessType = '';

    // Small
    if (FTE > 5 && highestQterFTEWR30 <= 5 && program == 506340002) {
        businessType = "Business Type updated from Small Business to Micro Business based on WR-30 highest jobs count.";
    }

    // Micro
    if (FTE <= 5 && highestQterFTEWR30 > 5 && program == 506340001) {
        businessType = "Business Type updated from Micro Business to Small Business based on WR-30 highest jobs count.";
    }

    return businessType;
}

export function OtherFundingDescription(app: DecoratedApplication): string {

    const ppp = (app.DOBAffidavit_SBAPPP == "Yes" && (app.DOBAffidavit_SBAPPPDetails_Status == "Approved" || app.DOBAffidavit_SBAPPPDetails_Status == "In Process")
    && (!app.DOBAffidavit_SBAPPPDetails_Amount || app.DOBAffidavit_SBAPPPDetails_Amount == 0)) ? ProgramDescriptions.PPP : "";

    const ppp2 = (app.njeda_sbapaycheckprotectionprogramphase2 == "Yes" && (app.njeda_sbapppphase2status == "Approved" || app.njeda_sbapppphase2status == "In Process")
    && (!app.njeda_sbapppphase2approvedamt || app.njeda_sbapppphase2approvedamt == 0)) ? ProgramDescriptions.PPP2 : "";

    const eidg = (app.DOBAffidavit_SBAEIDG == "Yes" && (app.DOBAffidavit_SBAEIDGDetails_Status == "Approved" || app.DOBAffidavit_SBAEIDGDetails_Status == "In Process")
    && (!app.DOBAffidavit_SBAEIDGDetails_Amount || app.DOBAffidavit_SBAEIDGDetails_Amount == 0)) ? ProgramDescriptions.EIDG : "";

    const eidl = (app.DOBAffidavit_SBAEIDL == "Yes" && (app.DOBAffidavit_SBAEIDLDetails_Status == "Approved" || app.DOBAffidavit_SBAEIDLDetails_Status == "In Process")
    && (!app.DOBAffidavit_SBAEIDLDetails_Amount || app.DOBAffidavit_SBAEIDLDetails_Amount == 0)) ? ProgramDescriptions.EIDL : "";

    const loan = (app.DOBAffidavit_NJEDALoan == "Yes" && (app.DOBAffidavit_NJEDALoanDetails_Status == "Approved" || app.DOBAffidavit_NJEDALoanDetails_Status == "In Process")
    && (!app.DOBAffidavit_NJEDALoanDetails_Amount || app.DOBAffidavit_NJEDALoanDetails_Amount == 0)) ? ProgramDescriptions.CVSBLO : "";

    const grant = (app.DOBAffidavit_NJEDAGrant == "Yes" && (app.DOBAffidavit_NJEDAGrantDetails_Status == "Approved" || app.DOBAffidavit_NJEDAGrantDetails_Status == "In Process")
    && (!app.DOBAffidavit_NJEDAGrantDetails_Amount || app.DOBAffidavit_NJEDAGrantDetails_Amount == 0)) ? ProgramDescriptions.CVSBGR : "";

    const grant2 = (app.njeda_njedasbemergencygrantassistancephase2 == "Yes" && (app.njeda_njedasbemergencygrantassistancephase2stat == "Approved" || app.njeda_njedasbemergencygrantassistancephase2stat == "In Process")
    && (!app.njeda_sbemergencygrantphase2amountapproved || app.njeda_sbemergencygrantphase2amountapproved == 0)) ? ProgramDescriptions.CVSB2GR : "";

    const grant3 = (app.njeda_njedasbegrantassistancephase3 == "Yes" && (app.njeda_njedasbegrantassistphase3status == "Approved" || app.njeda_njedasbegrantassistphase3status == "In Process")
    && (!app.njeda_njedasbegrantassistphase3approvedamt || app.njeda_njedasbegrantassistphase3approvedamt == 0)) ? ProgramDescriptions.CVSB3GR : "";

    const CARES = (app.njeda_caresactfundingfromlocalcounty == "Yes" && (app.njeda_caresactfundingfromlocalcountystatus == "Approved" || app.njeda_caresactfundingfromlocalcountystatus == "In Process")
    && (!app.njeda_cafundingfromlocalcountyamtapproved || app.njeda_cafundingfromlocalcountyamtapproved == 0)) ? ProgramDescriptions.CARES : "";

    const NJHousing = (app.njeda_njhandmortgagefinancecovid19landlordgrant == "Yes" && (app.njeda_njhandmortgagefincovidlandlordgrantstatus == "Approved" || app.njeda_njhandmortgagefincovidlandlordgrantstatus == "In Process")
    && (!app.njeda_njhmorfincovidlandlordgrantamtapproved || app.njeda_njhmorfincovidlandlordgrantamtapproved == 0)) ? ProgramDescriptions.NJHousing : "";

    const NJRedevelopment = (app.njeda_njredevauthsbleaseemergassistgrantprogram == "Yes" && (app.njeda_njredevauthsbleaseemergastgrantprogstatus == "Approved" || app.njeda_njredevauthsbleaseemergastgrantprogstatus == "In Process")
    && (!app.njeda_redevauthsblemerastgrantprogamtapproved || app.njeda_redevauthsblemerastgrantprogamtapproved == 0)) ? ProgramDescriptions.NJRedevelopment : "";

    const NJRedevelopment2 = (app.njeda_njrasbleaseeagprogphase2 == "Yes" && (app.njeda_sbleaseemergassistgrantprogphase2status == "Approved" || app.njeda_sbleaseemergassistgrantprogphase2status == "In Process")
    && (!app.njeda_njrasbleaseeagprogphase2approvedamt || app.njeda_njrasbleaseeagprogphase2approvedamt == 0)) ? ProgramDescriptions.NJRedevelopment2 : "";

    const Insurance = (app.njeda_insuranceproceeds == "Yes" && (app.njeda_insuranceproceedsstatus == "Approved" || app.njeda_insuranceproceedsstatus == "In Process")
    && (!app.njeda_insuranceproceedsamountapproved || app.njeda_insuranceproceedsamountapproved == 0)) ? ProgramDescriptions.Insurance : "";

    const Other = (app.DOBAffidavit_OtherStateLocal == "Yes" && (app.njeda_otherprogramstatus == "Approved" || app.njeda_otherprogramstatus == "In Process")
    && (!app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess || app.DOBAffidavit_OtherStateLocalDetails_TotalAmountApprovedInProcess == 0)) ? ProgramDescriptions.Other : "";

    const PPE = (app.njeda_njpersonalppeaccessprogram == "Yes" && (app.njeda_njpersonalppeaprogramstatus == "Approved" || app.njeda_njpersonalppeaprogramstatus == "In Process")
    && (!app.njeda_njpersonalppeaprogramapprovedamt || app.njeda_njpersonalppeaprogramapprovedamt == 0)) ? ProgramDescriptions.PPE: "";

    const PPE2 = (app.njeda_njedasmbppeaccessprogphase2 == "Yes" && (app.njeda_njedasmbppeaccessprogphase2status == "Approved" || app.njeda_njedasmbppeaccessprogphase2status == "In Process")
    && (!app.njeda_njedasmbppeaccessprogphase2amount || app.njeda_njedasmbppeaccessprogphase2amount == 0)) ? ProgramDescriptions.PPE2 : "";

    const SSNJ = (app.njeda_njedasustainandserve == "Yes" && (app.njeda_njedasustainandservestatus == "Approved" || app.njeda_njedasustainandservestatus == "In Process")
    && (!app.njeda_njedasustainandserveapprovedamt || app.njeda_njedasustainandserveapprovedamt == 0)) ? ProgramDescriptions.SSNJ : "";

    return [ppp, ppp2, eidg, eidl, loan, grant, grant2, grant3, CARES, NJHousing, NJRedevelopment, NJRedevelopment2, Insurance, Other, PPE, PPE2, SSNJ]
                        .filter(s => s).join(', ');

  }

  export function OtherFundingAmountSBAPPP(app: DecoratedApplication): number {
    if (app.DOBValidation != null && app.DOBValidation.DOBAmounts.search(DOBPrograms.PPP) > 0) {
        const Amount = Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.PPP) + DOBPrograms.PPP.length
            , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.PPP + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.PPP) - DOBPrograms.PPP.length)));
        return Amount;
    }
    else {
        return -1;
    }
}

export function OtherFundingAmountNJEDAPhase1(app: DecoratedApplication): number {
    if (app.DOBValidation != null && app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPhase1) > 0) {
        const Amount = Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPhase1) + DOBPrograms.NJEDAPhase1.length
            , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.NJEDAPhase1 + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPhase1) - DOBPrograms.NJEDAPhase1.length)));
        return Amount;
    }
    else {
        return -1;
    }
}

export function OtherFundingAmountNJEDAPhase2(app: DecoratedApplication): number {
    if (app.DOBValidation != null && app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPhase2) > 0) {
        const Amount = Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPhase2) + DOBPrograms.NJEDAPhase2.length
            , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.NJEDAPhase2 + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPhase2) - DOBPrograms.NJEDAPhase2.length)));
        return Amount;
    }
    else {
        return -1;
    }
}

export function OtherFundingAmountNJEDAPhase3(app: DecoratedApplication): number {
    if (app.DOBValidation != null && app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPhase3) > 0) {
        const Amount = Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPhase3) + DOBPrograms.NJEDAPhase3.length
            , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.NJEDAPhase3 + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPhase3) - DOBPrograms.NJEDAPhase3.length)));
        return Amount;
    }
    else {
        return -1;
    }
}

export function OtherFundingAmountNJRA1orRA2(app: DecoratedApplication): number {
    if (app.DOBValidation != null &&
        (app.DOBValidation.DOBAmounts.search(DOBPrograms.NJRAPhase1) > 0 || app.DOBValidation.DOBAmounts.search(DOBPrograms.NJRAPhase2) > 0)) {
        const Amount =
            app.DOBValidation.DOBAmounts.search(DOBPrograms.NJRAPhase1) > 0 ?
            Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.NJRAPhase1) + DOBPrograms.NJRAPhase1.length
                    , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.NJRAPhase1 + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.NJRAPhase1) - DOBPrograms.NJRAPhase1.length)))
                : app.DOBValidation.DOBAmounts.search(DOBPrograms.NJRAPhase2) > 0 ?
                Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.NJRAPhase2) + DOBPrograms.NJRAPhase2.length
                        , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.NJRAPhase2 + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.NJRAPhase2) - DOBPrograms.NJRAPhase2.length)))
                    : 0;
        return Amount;
    }
    else {
        return -1;
    }
}

export function OtherFundingAmountHMFAGrant(app: DecoratedApplication): number {
    if (app.DOBValidation != null && app.DOBValidation.DOBAmounts.search(DOBPrograms.HMFAGrant) > 0) {
        const Amount = Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.HMFAGrant) + DOBPrograms.HMFAGrant.length
            , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.HMFAGrant + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.HMFAGrant) - DOBPrograms.HMFAGrant.length)));
        return Amount;
    }
    else {
        return -1;
    }
}

export function OtherFundingAmountNJEDASSNJ(app: DecoratedApplication): number {
    if (app.DOBValidation != null && app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDASSNJ) > 0) {
        const Amount = Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDASSNJ) + DOBPrograms.NJEDASSNJ.length
            , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.NJEDASSNJ + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDASSNJ) - DOBPrograms.NJEDASSNJ.length)));
        return Amount;
    }
    else {
        return -1;
    }
}

export function OtherFundingAmountNJEDAPPE(app: DecoratedApplication): number {
    if (app.DOBValidation != null && app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPPE) > 0) {
        const Amount = Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPPE) + DOBPrograms.NJEDAPPE.length
            , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.NJEDAPPE + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.NJEDAPPE) - DOBPrograms.NJEDAPPE.length)));
        return Amount;
    }
    else {
        return -1;
    }
}

export function OtherFundingAmountOther(app: DecoratedApplication): number {
    if (app.DOBValidation != null &&
        (app.DOBValidation.DOBFindings.includes(DOBPrograms.DCA)
            || app.DOBValidation.DOBFindings.includes(DOBPrograms.DHS)
            || app.DOBValidation.DOBFindings.includes(DOBPrograms.Arts))
    ) {
        const Amount =
            app.DOBValidation.DOBAmounts.search(DOBPrograms.DCA) > 0 ? Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.DCA) + DOBPrograms.DCA.length
                , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.DCA + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.DCA) - DOBPrograms.DCA.length)))
                : app.DOBValidation.DOBAmounts.search(DOBPrograms.DHS) > 0 ? Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.DHS) + DOBPrograms.DHS.length
                    , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.DHS + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.DHS) - DOBPrograms.DHS.length)))
                    : app.DOBValidation.DOBAmounts.search(DOBPrograms.Arts) > 0 ? Math.round(parseInt(app.DOBValidation.DOBAmounts.substr(app.DOBValidation.DOBAmounts.search(DOBPrograms.Arts) + DOBPrograms.Arts.length
                        , app.DOBValidation.DOBAmounts.indexOf(DOBPrograms.Arts + ",") - app.DOBValidation.DOBAmounts.search(DOBPrograms.Arts) - DOBPrograms.Arts.length)))
                        : 0;


        return Amount;
    }
    else {
        return -1;
    }
}

