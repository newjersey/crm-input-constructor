"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDolData = exports.init = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
// assumes single-sheet workbook
function getEins(filePath) {
    const einRe = /\d-(\d{3})-(\d{3})-(\d{3})\/\d{3}-\d{2}/;
    const workbook = xlsx_1.default.readFile(filePath, { type: 'file' });
    const sheetName = Object.keys(workbook.Sheets)[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx_1.default.utils.sheet_to_json(sheet, { defval: undefined, header: 1 })
        .flat()
        .filter(ein => ein && ein.trim())
        .map(ein => ein.trim())
        .map(ein => ein.replace(einRe, '$1$2$3'));
}
let ACTIVE_EMPLOYER_EIN_SET = new Set();
let UID_NO_GO_EIN_SET = new Set();
let WHD_NO_GO_EIN_SET = new Set();
async function init(activeEmployersPath, uidNoGoPath, whdNoGoPath) {
    console.log('Loading DOL active employers...');
    getEins(activeEmployersPath).forEach(ein => ACTIVE_EMPLOYER_EIN_SET.add(ein));
    console.log('Loading DOL UID no-go list...');
    getEins(uidNoGoPath).forEach(ein => UID_NO_GO_EIN_SET.add(ein));
    console.log('Loading DOL WHD no-go list...');
    getEins(whdNoGoPath).forEach(ein => WHD_NO_GO_EIN_SET.add(ein));
}
exports.init = init;
function addDolData(application) {
    const dol = {
        isActiveEmployer: ACTIVE_EMPLOYER_EIN_SET.has(application.Business_TIN.trim()),
        uidNoGo: UID_NO_GO_EIN_SET.has(application.Business_TIN.trim()),
        whdNoGo: WHD_NO_GO_EIN_SET.has(application.Business_TIN.trim()),
    };
    return { ...application, dol };
}
exports.addDolData = addDolData;
//# sourceMappingURL=dol.js.map