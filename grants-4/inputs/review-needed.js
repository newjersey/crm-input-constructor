"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReviewNeededData = exports.init = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
// assumes single-sheet workbook
function getData(filePath) {
    const workbook = xlsx_1.default.readFile(filePath, { type: "file" });
    const sheetName = Object.keys(workbook.Sheets)[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx_1.default.utils.sheet_to_json(sheet, { defval: undefined });
    const map = {};
    rows.forEach((row) => {
        const { OLA: applicationId, Product: product, "Email (Applicant) (Account)": email } = row;
        map[applicationId] = { email, product };
    });
    return map;
}
let DATA_MAP;
async function init(path) {
    console.log("Loading need-review data...");
    DATA_MAP = getData(path);
}
exports.init = init;
function addReviewNeededData(application) {
    const reviewNeeded = DATA_MAP[application.ApplicationId];
    return { ...application, reviewNeeded };
}
exports.addReviewNeededData = addReviewNeededData;
//# sourceMappingURL=review-needed.js.map