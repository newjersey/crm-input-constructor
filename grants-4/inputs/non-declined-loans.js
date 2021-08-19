"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNonDeclinedEdaLoanData = exports.init = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
// assumes single-sheet workbook
function getData(filePath) {
    const workbook = xlsx_1.default.readFile(filePath, { type: 'file' });
    const sheetName = Object.keys(workbook.Sheets)[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx_1.default.utils.sheet_to_json(sheet, { defval: undefined });
    const map = {};
    rows.forEach(row => {
        const { 'EIN (Applicant) (Account)': ein, ...rest } = row;
        map[ein] = rest;
    });
    return map;
}
let LOAN_DATA_MAP;
async function init(path) {
    console.log('Loading non-declined EDA Loan data...');
    LOAN_DATA_MAP = getData(path);
}
exports.init = init;
function addNonDeclinedEdaLoanData(application) {
    const nonDeclinedEdaLoan = LOAN_DATA_MAP[application.Business_TIN];
    return { ...application, nonDeclinedEdaLoan };
}
exports.addNonDeclinedEdaLoanData = addNonDeclinedEdaLoanData;
//# sourceMappingURL=non-declined-loans.js.map