"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChildCareData = exports.init = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
// assumes single-sheet workbook
function getEins(filePath) {
    const workbook = xlsx_1.default.readFile(filePath, { type: 'file' });
    const sheetName = Object.keys(workbook.Sheets)[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx_1.default.utils.sheet_to_json(sheet, { defval: undefined, header: 1 })
        .flat()
        .filter(ein => ein.toString().trim())
        .map(ein => ein.toString().trim());
}
let CHILD_CARE_EMPLOYER_EIN_SET = new Set();
async function init(childCareEmployersPath) {
    console.log('Loading Child Care Providers...');
    getEins(childCareEmployersPath).forEach(ein => CHILD_CARE_EMPLOYER_EIN_SET.add(ein));
}
exports.init = init;
function addChildCareData(application) {
    const childCare = {
        isChildCareEmployer: CHILD_CARE_EMPLOYER_EIN_SET.has(application.Business_TIN.toString().trim()),
    };
    return { ...application, childCare };
}
exports.addChildCareData = addChildCareData;
//# sourceMappingURL=ChildCare.js.map