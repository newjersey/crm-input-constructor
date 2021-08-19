"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueYears = exports.MonitoringTypes = exports.MonitoringStatuses = exports.ProductSubStatuses = exports.ProductStatuses = exports.TEST_ServicingOfficersExternal = exports.TEST_ServicingOfficersES = exports.TEST_ServicingOfficersEN = exports.ServicingOfficersExternal = exports.ServicingOfficersES = exports.ServicingOfficersEN = exports.DOBPrograms = exports.ProgramDescriptions = exports.PurposesOfFunds = exports.ProgramApprovals = exports.RemainOpenCapacities = exports.TaxationReportedTaxFilingValues = exports.OwnershipStructures = exports.EligibleOpportunityZoneValues = exports.TaxClearanceValues = exports.SmallBusinessStatuses = exports.Decision = void 0;
var Decision;
(function (Decision) {
    Decision["Approve"] = "Approve";
    Decision["Review"] = "Review";
    Decision["Decline"] = "Decline";
    Decision["LegalReview"] = "LegalReview";
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
    OwnershipStructures["Government_Body"] = "Government Body";
    OwnershipStructures["Limited_Partnership"] = "Limited Partnership";
    OwnershipStructures["General_Partnership"] = "General Partnership";
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
    ProgramDescriptions["PPP2"] = "Small Business Association Paycheck Protection Program (PPP) Phase 2";
    ProgramDescriptions["EIDG"] = "Small Business Association Economic Injury Disaster Grant (EIDG)";
    ProgramDescriptions["EIDL"] = "Small Business Association Economic Injury Disaster Loan (EIDL)";
    ProgramDescriptions["CVSBLO"] = "NJEDA Small Business Emergency Loan Assistance";
    ProgramDescriptions["CVSBGR"] = "NJEDA Small Business Emergency Grant Assistance";
    ProgramDescriptions["CVSB2GR"] = "NJEDA Small Business Emergency Grant Assistance Phase 2";
    ProgramDescriptions["CVSB3GR"] = "NJEDA Small Business Emergency Grant Assistance Phase 3";
    ProgramDescriptions["CARES"] = "CARES Act Funding From Local County";
    ProgramDescriptions["NJHousing"] = "New Jersey Housing and Mortgage Finance Covid-19 Landlord Grant";
    ProgramDescriptions["NJRedevelopment"] = "New Jersey Redevelopment Authority Small Business Lease Emergency Assistance Grant Program";
    ProgramDescriptions["NJRedevelopment2"] = "New Jersey Redevelopment Authority Small Business Lease Emergency Assistance Grant Program Phase 2";
    ProgramDescriptions["Insurance"] = "Insurance Proceeds";
    ProgramDescriptions["Other"] = "Other";
    ProgramDescriptions["PPE"] = "NJEDA Personal Protective Equipment (PPE) Access Program Phase 1";
    ProgramDescriptions["PPE2"] = "NJEDA Personal Protective Equipment (PPE) Access Program Phase 2";
    ProgramDescriptions["SSNJ"] = "NJEDA Sustain and Serve";
})(ProgramDescriptions = exports.ProgramDescriptions || (exports.ProgramDescriptions = {}));
var DOBPrograms;
(function (DOBPrograms) {
    DOBPrograms["NJEDAPhase1"] = "NJEDA Phase 1";
    DOBPrograms["NJEDAPhase2"] = "NJEDA Phase 2";
    DOBPrograms["NJEDAPhase3"] = "NJEDA Phase 3";
    DOBPrograms["NJRAPhase1"] = "NJRA Phase 1";
    DOBPrograms["NJRAPhase2"] = "NJRA Phase 2";
    DOBPrograms["HMFAGrant"] = "HMFA Grant";
    DOBPrograms["NJEDASSNJ"] = "NJEDA SSNJ";
    DOBPrograms["NJEDAPPE"] = "NJEDA PPE";
    DOBPrograms["PPP"] = "SBA PPP";
    DOBPrograms["DHS"] = "DHS";
    DOBPrograms["DCA"] = "DCA";
    DOBPrograms["Arts"] = "Arts";
})(DOBPrograms = exports.DOBPrograms || (exports.DOBPrograms = {}));
var ServicingOfficersEN;
(function (ServicingOfficersEN) {
    ServicingOfficersEN["Steven_Bushar"] = "{AB7A919C-E612-EB11-A813-001DD801DF87}";
    ServicingOfficersEN["Daniela_Perez"] = "{00EEEAB0-45A4-EB11-B1AC-001DD801FC84}";
    //Christina_Dennis = '{29022887-4AA4-EB11-B1AC-001DD801FC84}',
    ServicingOfficersEN["Raiya_Jones"] = "{5D9B6812-49A4-EB11-B1AC-001DD801FC84}";
    ServicingOfficersEN["Dhruv_Parekh"] = "{DB7E4D44-6BB2-EA11-A812-001DD8018943}";
    ServicingOfficersEN["Susan_Gluchanicz"] = "{A24B5144-BE17-EB11-A813-001DD801DF87}";
    ServicingOfficersEN["Marshay_Monet"] = "{D917E2B3-4DA4-EB11-B1AC-001DD801FC84}";
    ServicingOfficersEN["Gina_Delia"] = "{14CE99C2-C117-EB11-A813-001DD801DF87}";
    ServicingOfficersEN["Cezary_Lukawski"] = "{09AF1D40-EE12-EB11-A813-001DD801DF87}";
    //Nicholas_Pezzolla = '{9BC855B4-50A4-EB11-B1AC-001DD801FC84}',
    ServicingOfficersEN["Yaritza_Lopez"] = "{C491EDF2-51A4-EB11-B1AC-001DD801FC84}";
    ServicingOfficersEN["Elayna_Alexander"] = "{B4180BCE-4912-EB11-A813-001DD801DF87}";
    ServicingOfficersEN["Dominique_Salmon"] = "{FDC6A4BC-4012-EB11-A813-001DD801DF87}";
    ServicingOfficersEN["Tawana_Martin"] = "{FC5F1E9D-4CA4-EB11-B1AC-001DD801FC84}";
    ServicingOfficersEN["David_Guarini"] = "{2EC826BD-D871-EA11-A811-001DD8018943}";
    ServicingOfficersEN["Pamela_McGrew"] = "{03F90D62-DA71-EA11-A811-001DD8018943}";
    ServicingOfficersEN["Ricardo_Hernandez"] = "{9176B59B-DB71-EA11-A811-001DD8018943}";
    ServicingOfficersEN["Yoletta_Duthil"] = "{3E7536E2-DD71-EA11-A811-001DD8018943}";
    //Joseph_McCall = '{1AAB7A9A-7B20-EB11-A813-001DD8018943}',
    ServicingOfficersEN["Gabriel_Calandri"] = "{AF791530-70B2-EA11-A812-001DD8018943}";
    ServicingOfficersEN["Alejandro_Rodriguez"] = "{B6DE34EA-CEB7-EA11-A812-001DD8018943}";
    ServicingOfficersEN["Jorge_Palacious"] = "{7B078F61-F7B4-EB11-8236-001DD802CA2E}";
    ServicingOfficersEN["Tammy_Sanchez"] = "{EDAE6340-F5B4-EB11-8236-001DD802CA2E}";
    ServicingOfficersEN["Jacqueline_Mullings"] = "{234023BA-3ED6-E811-811B-1458D04E2F10}";
    ServicingOfficersEN["Daniel_Wilkie"] = "{15FF6203-7FCF-EB11-BACF-001DD801CCC6}";
    ServicingOfficersEN["Karen_McGarrigle"] = "{C47E7740-8CCF-EB11-BACF-001DD801C05C}";
    ServicingOfficersEN["Laura_Diaz"] = "{A5D4CAEE-8143-EA11-A999-001DD8009F4B}";
    ServicingOfficersEN["Malika_ka_Ashley"] = "{1D456EAB-8DCF-EB11-BACF-001DD801C05C}";
    ServicingOfficersEN["Naimah_Marshall"] = "{AC7558BC-87CF-EB11-BACF-001DD801C05C}";
    ServicingOfficersEN["Sandra_Foresta"] = "{CE61DD63-25E3-EB11-BACB-001DD802D3C0}";
    ServicingOfficersEN["Taylor_Lee"] = "{3A6162EF-82CF-EB11-BACF-001DD801CCC6}";
})(ServicingOfficersEN = exports.ServicingOfficersEN || (exports.ServicingOfficersEN = {}));
var ServicingOfficersES;
(function (ServicingOfficersES) {
    ServicingOfficersES["Cynthia_Goyes"] = "{DD23D309-E8F0-E911-A994-001DD800951B}";
    ServicingOfficersES["Ricardo_Hernandez"] = "{9176B59B-DB71-EA11-A811-001DD8018943}";
    ServicingOfficersES["Laura_Diaz"] = "{A5D4CAEE-8143-EA11-A999-001DD8009F4B}";
})(ServicingOfficersES = exports.ServicingOfficersES || (exports.ServicingOfficersES = {}));
var ServicingOfficersExternal;
(function (ServicingOfficersExternal) {
    ServicingOfficersExternal["Richard_Toro"] = "{834023BA-3ED6-E811-811B-1458D04E2F10}";
})(ServicingOfficersExternal = exports.ServicingOfficersExternal || (exports.ServicingOfficersExternal = {}));
// TEST values:
var TEST_ServicingOfficersEN;
(function (TEST_ServicingOfficersEN) {
    TEST_ServicingOfficersEN["BRUCE_TEST"] = "{FB3F23BA-3ED6-E811-811B-1458D04E2F10}";
})(TEST_ServicingOfficersEN = exports.TEST_ServicingOfficersEN || (exports.TEST_ServicingOfficersEN = {}));
var TEST_ServicingOfficersES;
(function (TEST_ServicingOfficersES) {
    TEST_ServicingOfficersES["BRUCE_TEST"] = "{FB3F23BA-3ED6-E811-811B-1458D04E2F10}";
})(TEST_ServicingOfficersES = exports.TEST_ServicingOfficersES || (exports.TEST_ServicingOfficersES = {}));
var TEST_ServicingOfficersExternal;
(function (TEST_ServicingOfficersExternal) {
    TEST_ServicingOfficersExternal["Richard_Toro"] = "{FB3F23BA-3ED6-E811-811B-1458D04E2F10}";
})(TEST_ServicingOfficersExternal = exports.TEST_ServicingOfficersExternal || (exports.TEST_ServicingOfficersExternal = {}));
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
    MonitoringStatuses["InProgress"] = "In Progress";
    MonitoringStatuses["Findings"] = "Findings";
})(MonitoringStatuses = exports.MonitoringStatuses || (exports.MonitoringStatuses = {}));
var MonitoringTypes;
(function (MonitoringTypes) {
    MonitoringTypes["External"] = "External";
    MonitoringTypes["DeskReview"] = "Desk Review";
    MonitoringTypes["Resolution"] = "Resolution";
    MonitoringTypes["NewProductReview"] = "New Product Review";
})(MonitoringTypes = exports.MonitoringTypes || (exports.MonitoringTypes = {}));
var RevenueYears;
(function (RevenueYears) {
    RevenueYears["_2018"] = "2018";
    RevenueYears["_2019"] = "2019";
})(RevenueYears = exports.RevenueYears || (exports.RevenueYears = {}));
//# sourceMappingURL=types.js.map