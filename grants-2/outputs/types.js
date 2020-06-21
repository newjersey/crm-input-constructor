"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueYears = exports.MonitoringTypes = exports.MonitoringStatuses = exports.ProductSubStatuses = exports.ProductStatuses = exports.ServicingOfficersExternal = exports.ServicingOfficersES = exports.ServicingOfficersEN = exports.ProgramDescriptions = exports.PurposesOfFunds = exports.ProgramApprovals = exports.RemainOpenCapacities = exports.TaxationReportedTaxFilingValues = exports.OwnershipStructures = exports.EligibleOpportunityZoneValues = exports.TaxClearanceValues = exports.SmallBusinessStatuses = exports.Decision = void 0;
var Decision;
(function (Decision) {
    Decision["Approve"] = "Approve";
    Decision["Review"] = "Review";
    Decision["Decline"] = "Decline";
})(Decision = exports.Decision || (exports.Decision = {}));
var SmallBusinessStatuses;
(function (SmallBusinessStatuses) {
    SmallBusinessStatuses["Yes"] = "Small Business: Yes";
    SmallBusinessStatuses["No"] = "Small Business: No";
})(SmallBusinessStatuses = exports.SmallBusinessStatuses || (exports.SmallBusinessStatuses = {}));
var TaxClearanceValues;
(function (TaxClearanceValues) {
    TaxClearanceValues["Clear"] = "Clear";
    TaxClearanceValues["Not_Clear"] = "Not Clear";
    TaxClearanceValues["Not_Found"] = "Not Found";
})(TaxClearanceValues = exports.TaxClearanceValues || (exports.TaxClearanceValues = {}));
var EligibleOpportunityZoneValues;
(function (EligibleOpportunityZoneValues) {
    EligibleOpportunityZoneValues["Yes"] = "Yes";
    EligibleOpportunityZoneValues["No"] = "No";
    EligibleOpportunityZoneValues["Not_Found"] = "Not Found";
})(EligibleOpportunityZoneValues = exports.EligibleOpportunityZoneValues || (exports.EligibleOpportunityZoneValues = {}));
var OwnershipStructures;
(function (OwnershipStructures) {
    OwnershipStructures["SoleProprietorship"] = "Sole Proprietorship";
    OwnershipStructures["Partnership"] = "Partnership";
    OwnershipStructures["C_Corporation"] = "C Corporation";
    OwnershipStructures["S_Corporation"] = "S Corporation";
    OwnershipStructures["LLC"] = "Limited Liability Corporation";
    OwnershipStructures["Nonprofit"] = "Not For Profit";
    OwnershipStructures["Other"] = "Other";
})(OwnershipStructures = exports.OwnershipStructures || (exports.OwnershipStructures = {}));
var TaxationReportedTaxFilingValues;
(function (TaxationReportedTaxFilingValues) {
    TaxationReportedTaxFilingValues["Sole_Prop_SMLLC"] = "Sole Prop/SMLLC";
    TaxationReportedTaxFilingValues["Partnership"] = "Partnership";
    TaxationReportedTaxFilingValues["CBT"] = "CBT";
    TaxationReportedTaxFilingValues["None"] = "None";
})(TaxationReportedTaxFilingValues = exports.TaxationReportedTaxFilingValues || (exports.TaxationReportedTaxFilingValues = {}));
var RemainOpenCapacities;
(function (RemainOpenCapacities) {
    RemainOpenCapacities["Less than 10%"] = "Less than 10%";
    RemainOpenCapacities["25%"] = "25%";
    RemainOpenCapacities["50%"] = "50%";
    RemainOpenCapacities["75%"] = "75%";
    RemainOpenCapacities["100%"] = "100%";
})(RemainOpenCapacities = exports.RemainOpenCapacities || (exports.RemainOpenCapacities = {}));
var ProgramApprovals;
(function (ProgramApprovals) {
    ProgramApprovals["Approved"] = "Approved";
    ProgramApprovals["In_Process"] = "In Process";
    ProgramApprovals["Declined"] = "Declined";
})(ProgramApprovals = exports.ProgramApprovals || (exports.ProgramApprovals = {}));
var PurposesOfFunds;
(function (PurposesOfFunds) {
    PurposesOfFunds["Inventory"] = "Inventory";
    PurposesOfFunds["Payroll"] = "Payroll";
    PurposesOfFunds["Rent_Mortgage"] = "Rent/Mortgage";
    PurposesOfFunds["Utilities"] = "Utilities";
    PurposesOfFunds["Other"] = "Other";
})(PurposesOfFunds = exports.PurposesOfFunds || (exports.PurposesOfFunds = {}));
var ProgramDescriptions;
(function (ProgramDescriptions) {
    ProgramDescriptions["PPP"] = "Small Business Association Paycheck Protection Program (PPP)";
    ProgramDescriptions["EIDG"] = "Small Business Association Economic Injury Disaster Grant (EIDG)";
    ProgramDescriptions["EIDL"] = "Small Business Association Economic Injury Disaster Loan (EIDL)";
    ProgramDescriptions["CVSBLO"] = "NJEDA Small Business Emergency Loan Assistance";
    ProgramDescriptions["CVSBGR"] = "NJEDA Small Business Emergency Grant Assistance";
    ProgramDescriptions["Other"] = "Other";
})(ProgramDescriptions = exports.ProgramDescriptions || (exports.ProgramDescriptions = {}));
// export enum ServicingOfficersEN {
//   Alan_Finkelstein = '{B59042A9-D571-EA11-A811-001DD8018943}',
//   Cynthia_Goyes = '{DD23D309-E8F0-E911-A994-001DD800951B}',
//   David_Guarini = '{2EC826BD-D871-EA11-A811-001DD8018943}',
//   Fatou_Jobe = '{443765DC-9FD4-E911-A985-001DD800BA25}',
//   John_Costello = '{B0458690-F377-E911-A974-001DD80081AD}',
//   John_Stewart = '{EA13FBBD-F6A0-EA11-A811-001DD8018230}',
//   Laura_Diaz = '{A5D4CAEE-8143-EA11-A999-001DD8009F4B}',
//   Maggie_Peters = '{82F86EA9-2F6E-E711-8110-1458D04ECE60}',
//   Meera_Kumar = '{E77DB0AB-1115-EA11-A991-001DD800A749}',
//   Michael_Candella = '{006A7AEE-3B9C-E911-A97C-001DD800951B}',
//   Pamela_McGrew = '{03F90D62-DA71-EA11-A811-001DD8018943}',
//   Ricardo_Hernandez = '{9176B59B-DB71-EA11-A811-001DD8018943}',
//   Yoletta_Duthil = '{3E7536E2-DD71-EA11-A811-001DD8018943}',
// }
// export enum ServicingOfficersES {
//   Cynthia_Goyes = '{DD23D309-E8F0-E911-A994-001DD800951B}',
//   Ricardo_Hernandez = '{9176B59B-DB71-EA11-A811-001DD8018943}',
//   Laura_Diaz = '{A5D4CAEE-8143-EA11-A999-001DD8009F4B}',
// }
// export enum ServicingOfficersExternal {
//   Richard_Toro = '{834023BA-3ED6-E811-811B-1458D04E2F10}',
// }
// TEST values:
var ServicingOfficersEN;
(function (ServicingOfficersEN) {
    ServicingOfficersEN["BRUCE_TEST"] = "{FB3F23BA-3ED6-E811-811B-1458D04E2F10}";
})(ServicingOfficersEN = exports.ServicingOfficersEN || (exports.ServicingOfficersEN = {}));
var ServicingOfficersES;
(function (ServicingOfficersES) {
    ServicingOfficersES["BRUCE_TEST"] = "{FB3F23BA-3ED6-E811-811B-1458D04E2F10}";
})(ServicingOfficersES = exports.ServicingOfficersES || (exports.ServicingOfficersES = {}));
var ServicingOfficersExternal;
(function (ServicingOfficersExternal) {
    ServicingOfficersExternal["Richard_Toro"] = "{FB3F23BA-3ED6-E811-811B-1458D04E2F10}";
})(ServicingOfficersExternal = exports.ServicingOfficersExternal || (exports.ServicingOfficersExternal = {}));
var ProductStatuses;
(function (ProductStatuses) {
    ProductStatuses["Ended"] = "{359B8B3E-65F7-E511-80DE-005056AD31F5}";
    ProductStatuses["InProgress"] = "{892EF915-56F7-E511-80DE-005056AD31F5}";
    ProductStatuses["Closed"] = "{E86E3F33-65F7-E511-80DE-005056AD31F5}";
    ProductStatuses["Underwriting"] = "{A23854FF-59F7-E511-80DE-005056AD31F5}";
})(ProductStatuses = exports.ProductStatuses || (exports.ProductStatuses = {}));
var ProductSubStatuses;
(function (ProductSubStatuses) {
    ProductSubStatuses["Ended_Declined"] = "{19E1E76F-8359-E611-80D3-005056ADEF6F}";
    ProductSubStatuses["InProgress_ApplicationSubmitted"] = "{6261A645-D875-E611-80D5-005056ADEF6F}";
    ProductSubStatuses["InProgress_ApplicationEDAReview"] = "{16C93E7F-D875-E611-80D5-005056ADEF6F}";
    ProductSubStatuses["InProgress_ApplicationCompanyRevision"] = "{9D94196B-D875-E611-80D5-005056ADEF6F}";
    ProductSubStatuses["Closed_ComplianceMonitoring"] = "{17E1E76F-8359-E611-80D3-005056ADEF6F}";
    ProductSubStatuses["Closed_NonCompliance"] = "{2BE1E76F-8359-E611-80D3-005056ADEF6F}";
    ProductSubStatuses["Underwriting_ApprovalsinProcess"] = "{0FE1E76F-8359-E611-80D3-005056ADEF6F}";
    ProductSubStatuses["Underwriting_IncompleteApplicationUWinProgress"] = "{29E1E76F-8359-E611-80D3-005056ADEF6F}";
})(ProductSubStatuses = exports.ProductSubStatuses || (exports.ProductSubStatuses = {}));
var MonitoringStatuses;
(function (MonitoringStatuses) {
    MonitoringStatuses["Completed"] = "Completed";
    MonitoringStatuses["InPlanning"] = "In Planning";
    MonitoringStatuses["Findings"] = "Findings";
})(MonitoringStatuses = exports.MonitoringStatuses || (exports.MonitoringStatuses = {}));
var MonitoringTypes;
(function (MonitoringTypes) {
    MonitoringTypes["External"] = "External";
    MonitoringTypes["DeskReview"] = "Desk Review";
})(MonitoringTypes = exports.MonitoringTypes || (exports.MonitoringTypes = {}));
var RevenueYears;
(function (RevenueYears) {
    RevenueYears["_2018"] = "2018";
    RevenueYears["_2019"] = "2019";
})(RevenueYears = exports.RevenueYears || (exports.RevenueYears = {}));
