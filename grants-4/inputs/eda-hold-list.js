"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEDAHoldListData = exports.init = void 0;
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
let EDA_HOLD_LIST_EMPLOYER_EIN_SET = new Set();
async function init(EDAHoldListEmployersPath) {
    console.log('Loading EDA HOLD List...');
    getEins(EDAHoldListEmployersPath).forEach(ein => EDA_HOLD_LIST_EMPLOYER_EIN_SET.add(ein));
}
exports.init = init;
function addEDAHoldListData(application) {
    const EDAHoldList = {
        isEDAHoldListEmployer: EDA_HOLD_LIST_EMPLOYER_EIN_SET.has(application.Business_TIN.toString().trim()),
    };
    return { ...application, EDAHoldList };
}
exports.addEDAHoldListData = addEDAHoldListData;
//# sourceMappingURL=eda-hold-list.js.map