"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGrantPhase1Data = exports.init = exports.ProductStatuses = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
var ProductStatuses;
(function (ProductStatuses) {
    ProductStatuses["Ended"] = "Ended";
    ProductStatuses["Closing"] = "Closing";
    ProductStatuses["Closed"] = "Closed";
    ProductStatuses["Underwriting"] = "Underwriting";
})(ProductStatuses = exports.ProductStatuses || (exports.ProductStatuses = {}));
var ProductSubStatuses;
(function (ProductSubStatuses) {
    ProductSubStatuses["Ended_Declined"] = "Declined";
    ProductSubStatuses["InProgress_ApplicationSubmitted"] = "Application Submitted";
    ProductSubStatuses["InProgress_ApplicationEDAReview"] = "Application EDA Review";
    ProductSubStatuses["InProgress_ApplicationCompanyRevision"] = "Application Company Revision";
    ProductSubStatuses["Closed_ComplianceMonitoring"] = "Compliance Monitoring";
    ProductSubStatuses["Closed_NonCompliance"] = "Non Compliance";
    ProductSubStatuses["Underwriting_ApprovalsinProcess"] = "Approvals in Process";
    ProductSubStatuses["Underwriting_IncompleteApplicationUWinProgress"] = "Incomplete Application-UW in Progress";
})(ProductSubStatuses || (ProductSubStatuses = {}));
// assumes single-sheet workbook
function getData(filePath) {
    const workbook = xlsx_1.default.readFile(filePath, { type: 'file' });
    const sheetName = Object.keys(workbook.Sheets)[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx_1.default.utils.sheet_to_json(sheet, { defval: undefined });
    const map = {};
    rows.forEach(row => {
        const { 'EIN (Applicant) (Account)': ein, ...rest } = row;
        // found a duplicate
        if (map[ein]) {
            const existing = map[ein];
            if (existing['Product Status'] === ProductStatuses.Ended ||
                rest['Product Status'] === ProductStatuses.Closing ||
                rest['Product Status'] === ProductStatuses.Closed) {
                map[ein] = rest;
            }
            else if (rest['Product Status'] === ProductStatuses.Ended ||
                existing['Product Status'] === ProductStatuses.Closing ||
                existing['Product Status'] === ProductStatuses.Closed) {
                // NOOP
            }
            else if (
            // neither is approved nor declined -- take the first one (oldest)
            parseInt(rest['OLA'].replace(/\D/g, ''), 10) <
                parseInt(existing['OLA'].replace(/\D/g, ''), 10)) {
                map[ein] = rest;
            }
        }
        else {
            map[ein] = rest;
        }
    });
    return map;
}
let GRANT_PHASE_1_DATA_MAP;
async function init(path) {
    console.log('Loading grant phase 1 data...');
    GRANT_PHASE_1_DATA_MAP = getData(path);
}
exports.init = init;
function addGrantPhase1Data(application) {
    const grantPhase1 = GRANT_PHASE_1_DATA_MAP[application.Business_TIN];
    return { ...application, grantPhase1 };
}
exports.addGrantPhase1Data = addGrantPhase1Data;
//# sourceMappingURL=grant-phase-1.js.map