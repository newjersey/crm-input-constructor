"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDOBCheckData = exports.init = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
function getData(filePath) {
    const workbook = xlsx_1.default.readFile(filePath, { type: 'file' });
    const sheetName = Object.keys(workbook.Sheets)[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx_1.default.utils.sheet_to_json(sheet, { defval: undefined });
    //console.dir(rows);
    const map = {};
    rows.forEach(row => {
        const { 'EDA ID': edaId, ...rest } = row;
        const applicationID = edaId;
        map[applicationID] = rest;
    });
    //console.dir(map);
    return map;
}
let DOB_CHECK_MAP;
async function init(path) {
    console.log('Loading Sister Agencies DOB Data...');
    //console.dir(path);
    DOB_CHECK_MAP = getData(path);
}
exports.init = init;
function addDOBCheckData(application) {
    const dobCheck = DOB_CHECK_MAP[application.ApplicationId];
    return { ...application, dobCheck };
}
exports.addDOBCheckData = addDOBCheckData;
//# sourceMappingURL=dobcheck.js.map