"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTaxationData = exports.init = exports.Flag = exports.CleanStatus = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
var CleanStatus;
(function (CleanStatus) {
    CleanStatus["Clear"] = "Y";
    CleanStatus["Not_Clear"] = "N";
    CleanStatus["Not_Found"] = "X";
})(CleanStatus = exports.CleanStatus || (exports.CleanStatus = {}));
var Flag;
(function (Flag) {
    Flag["True"] = "X";
    Flag["False"] = " ";
})(Flag = exports.Flag || (exports.Flag = {}));
// assumes single-sheet workbook
function getData(filePath) {
    const workbook = xlsx_1.default.readFile(filePath, { type: 'file' });
    const sheetName = Object.keys(workbook.Sheets)[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx_1.default.utils.sheet_to_json(sheet, { defval: undefined });
    const map = {};
    rows.forEach(row => {
        const { 'EDA ID': edaId, ...rest } = row;
        const applicationID = edaId.trim();
        map[applicationID] = rest;
    });
    //console.log(map);
    return map;
}
let TAXATION_DATA_MAP;
async function init(path) {
    console.log('Loading Taxation data...');
    TAXATION_DATA_MAP = getData(path);
}
exports.init = init;
function addTaxationData(application) {
    const taxation = TAXATION_DATA_MAP[application.ApplicationId];
    if (!taxation) {
        throw new Error(`Could not find taxation data for ${application.ApplicationId}`);
    }
    return { ...application, taxation };
}
exports.addTaxationData = addTaxationData;
//# sourceMappingURL=taxation.js.map