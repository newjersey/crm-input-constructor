"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRows = exports.ChildCareExemptReason = exports.ChildCareLicense = exports.BusinessType = exports.DOB_Purposes = exports.DOB_Status = exports.Capacities = exports.Designations = exports.EntityType = exports.YesNo = void 0;
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
    EntityType[EntityType["Nonprofit_Organization"] = 13] = "Nonprofit_Organization";
    EntityType[EntityType["Limited_Partnership"] = 14] = "Limited_Partnership";
    EntityType[EntityType["General_Partnership"] = 15] = "General_Partnership";
    EntityType[EntityType["Government_Body"] = 16] = "Government_Body";
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
var BusinessType;
(function (BusinessType) {
    BusinessType[BusinessType["Restaurant (Food Services and Drinking Places)"] = 506340000] = "Restaurant (Food Services and Drinking Places)";
    BusinessType[BusinessType["Micro-Business"] = 506340001] = "Micro-Business";
    BusinessType[BusinessType["Small Business"] = 506340002] = "Small Business";
    BusinessType[BusinessType["Child Care Provider"] = 506340003] = "Child Care Provider";
})(BusinessType = exports.BusinessType || (exports.BusinessType = {}));
var ChildCareLicense;
(function (ChildCareLicense) {
    ChildCareLicense[ChildCareLicense["Yes"] = 506340000] = "Yes";
    ChildCareLicense[ChildCareLicense["No"] = 506340001] = "No";
    ChildCareLicense[ChildCareLicense["Exempt"] = 506340002] = "Exempt";
})(ChildCareLicense = exports.ChildCareLicense || (exports.ChildCareLicense = {}));
var ChildCareExemptReason;
(function (ChildCareExemptReason) {
    ChildCareExemptReason[ChildCareExemptReason["The business is not defined as a child care center by the Child Care Center Licensing Act, N.J.S.A. 30:5B-1 et seq."] = 506340000] = "The business is not defined as a child care center by the Child Care Center Licensing Act, N.J.S.A. 30:5B-1 et seq.";
    ChildCareExemptReason[ChildCareExemptReason["Programs operated by the board of education of a local public school district."] = 506340001] = "Programs operated by the board of education of a local public school district.";
    ChildCareExemptReason[ChildCareExemptReason["Kindergartens, pre-kindergarten programs, or child care centers that are operated by and are an integral part of, a private educational institution or system providing elementary education in grades kindergarten through sixth."] = 506340002] = "Kindergartens, pre-kindergarten programs, or child care centers that are operated by and are an integral part of, a private educational institution or system providing elementary education in grades kindergarten through sixth.";
    ChildCareExemptReason[ChildCareExemptReason["Centers or special classes operated primarily for religious instruction."] = 506340003] = "Centers or special classes operated primarily for religious instruction.";
    ChildCareExemptReason[ChildCareExemptReason["Programs of specialized activities or instruction for children that are not designed or intended for child care purposes, including, but not limited to: Boy Scouts, Girl Scouts, 4-H Clubs, Junior Achievement."] = 506340004] = "Programs of specialized activities or instruction for children that are not designed or intended for child care purposes, including, but not limited to: Boy Scouts, Girl Scouts, 4-H Clubs, Junior Achievement.";
    ChildCareExemptReason[ChildCareExemptReason["Homework or tutorial programs."] = 506340005] = "Homework or tutorial programs.";
    ChildCareExemptReason[ChildCareExemptReason["Youth camps required to be licensed under the Youth Camp Safety Act of New Jersey, pursuant to N.J.S.A. 26:12-1 et seq."] = 506340006] = "Youth camps required to be licensed under the Youth Camp Safety Act of New Jersey, pursuant to N.J.S.A. 26:12-1 et seq.";
    ChildCareExemptReason[ChildCareExemptReason["Regional schools operated by or under contract with the Department of Children and Families ."] = 506340007] = "Regional schools operated by or under contract with the Department of Children and Families .";
    ChildCareExemptReason[ChildCareExemptReason["Privately operated infant and preschool programs that are approved by the Department of Education to provide services exclusively to local school districts for children with disabilities, pursuant to N.J.S.A. 18A:46-1 et seq."] = 506340008] = "Privately operated infant and preschool programs that are approved by the Department of Education to provide services exclusively to local school districts for children with disabilities, pursuant to N.J.S.A. 18A:46-1 et seq.";
    ChildCareExemptReason[ChildCareExemptReason["None of the Above."] = 506340009] = "None of the Above.";
})(ChildCareExemptReason = exports.ChildCareExemptReason || (exports.ChildCareExemptReason = {}));
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