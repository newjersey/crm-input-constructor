"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRows = exports.DOB_Purposes = exports.DOB_Status = exports.Capacities = exports.Designations = exports.EntityType = exports.YesNo = void 0;
const XLSX = require('xlsx');
var YesNo;
(function (YesNo) {
    YesNo["S\u00ED"] = "S\u00ED";
    YesNo["Yes"] = "Yes";
    YesNo["No"] = "No";
})(YesNo = exports.YesNo || (exports.YesNo = {}));
var EntryStatus;
(function (EntryStatus) {
    EntryStatus[EntryStatus["Incomplete"] = 0] = "Incomplete";
    EntryStatus[EntryStatus["Submitted"] = 1] = "Submitted";
    EntryStatus[EntryStatus["Reviewed"] = 2] = "Reviewed";
    EntryStatus[EntryStatus["Complete"] = 3] = "Complete";
})(EntryStatus || (EntryStatus = {}));
var EntityType;
(function (EntityType) {
    EntityType[EntityType["Other"] = 0] = "Other";
    EntityType[EntityType["Sole_Prop"] = 1] = "Sole_Prop";
    EntityType[EntityType["LLC"] = 2] = "LLC";
    EntityType[EntityType["SMLLC"] = 3] = "SMLLC";
    EntityType[EntityType["Partnership"] = 4] = "Partnership";
    EntityType[EntityType["C_Corp"] = 5] = "C_Corp";
    EntityType[EntityType["S_Corp"] = 6] = "S_Corp";
    EntityType[EntityType["Nonprofit_501c3"] = 7] = "Nonprofit_501c3";
    EntityType[EntityType["Nonprofit_501c4"] = 8] = "Nonprofit_501c4";
    EntityType[EntityType["Nonprofit_501c6"] = 9] = "Nonprofit_501c6";
    EntityType[EntityType["Nonprofit_501c7"] = 10] = "Nonprofit_501c7";
    EntityType[EntityType["Nonprofit_501c19"] = 11] = "Nonprofit_501c19";
    EntityType[EntityType["Nonprofit_Other"] = 12] = "Nonprofit_Other";
})(EntityType = exports.EntityType || (exports.EntityType = {}));
var Designations;
(function (Designations) {
    Designations[Designations["None"] = 0] = "None";
    Designations[Designations["Small_Business"] = 1] = "Small_Business";
    Designations[Designations["Minority_Owned"] = 2] = "Minority_Owned";
    Designations[Designations["Woman_Owned"] = 4] = "Woman_Owned";
    Designations[Designations["Veteran_Owned"] = 8] = "Veteran_Owned";
    Designations[Designations["Disabled_Owned"] = 16] = "Disabled_Owned";
})(Designations = exports.Designations || (exports.Designations = {}));
var Capacities;
(function (Capacities) {
    Capacities[Capacities["Less than 10%"] = 10] = "Less than 10%";
    Capacities[Capacities["25%"] = 25] = "25%";
    Capacities[Capacities["50%"] = 50] = "50%";
    Capacities[Capacities["75%"] = 75] = "75%";
    Capacities[Capacities["100%"] = 100] = "100%";
})(Capacities = exports.Capacities || (exports.Capacities = {}));
var DOB_Status;
(function (DOB_Status) {
    DOB_Status[DOB_Status["Approved"] = 1] = "Approved";
    DOB_Status[DOB_Status["In_Process"] = 2] = "In_Process";
    DOB_Status[DOB_Status["Declined"] = 3] = "Declined";
})(DOB_Status = exports.DOB_Status || (exports.DOB_Status = {}));
var DOB_Purposes;
(function (DOB_Purposes) {
    DOB_Purposes[DOB_Purposes["None"] = 0] = "None";
    DOB_Purposes[DOB_Purposes["Payroll"] = 1] = "Payroll";
    DOB_Purposes[DOB_Purposes["Rent_Mortgage"] = 2] = "Rent_Mortgage";
    DOB_Purposes[DOB_Purposes["Utilities"] = 4] = "Utilities";
    DOB_Purposes[DOB_Purposes["Inventory"] = 8] = "Inventory";
    DOB_Purposes[DOB_Purposes["Other"] = 16] = "Other";
})(DOB_Purposes = exports.DOB_Purposes || (exports.DOB_Purposes = {}));
// assumes single-sheet workbook
function getRows(filePath) {
    const workbook = XLSX.readFile(filePath, { type: 'file' });
    const sheetName = Object.keys(workbook.Sheets)[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: undefined });
    return rows;
}
exports.getRows = getRows;
//# sourceMappingURL=xlsx.js.map