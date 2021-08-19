"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPolicyMapData = exports.init = exports.EligibilityStatus = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
var EligibilityStatus;
(function (EligibilityStatus) {
    EligibilityStatus["Eligible"] = "Eligible";
    EligibilityStatus["Eligible_Contiguous"] = "Eligible (Contiguous)";
    EligibilityStatus["Eligible_LIC"] = "Eligible (LIC)";
    EligibilityStatus["Not_Eligible"] = "Not Eligible";
    EligibilityStatus["Not_Found"] = "Not Found";
    EligibilityStatus["NA"] = "N/A";
})(EligibilityStatus = exports.EligibilityStatus || (exports.EligibilityStatus = {}));
// assumes single-sheet workbook
function getData(filePath) {
    const workbook = xlsx_1.default.readFile(filePath, { type: 'file' });
    const sheetName = Object.keys(workbook.Sheets)[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx_1.default.utils.sheet_to_json(sheet, { defval: undefined });
    const map = new Map();
    rows.forEach(row => {
        const { 'OLA ID': applicationID, 'Census Tract': censusTract, 'Eligibility status for Opportunity Zones, as of 2018.': eligibilityStatus, } = row;
        const policyMapData = {
            ...row,
            censusTract,
            eligibilityStatus,
        };
        map.set(applicationID, policyMapData);
    });
    return map;
}
let POLICY_MAP_DATA_MAP;
async function init(path) {
    console.log('Loading Policy Map data...');
    POLICY_MAP_DATA_MAP = getData(path);
}
exports.init = init;
function addPolicyMapData(application) {
    const policyMap = POLICY_MAP_DATA_MAP.get(application.ApplicationId);
    return { ...application, policyMap };
}
exports.addPolicyMapData = addPolicyMapData;
//# sourceMappingURL=policy-map.js.map