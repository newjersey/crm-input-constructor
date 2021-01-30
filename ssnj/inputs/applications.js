"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplications = exports.Languages = void 0;
const xlsx_1 = require("./xlsx");
var xlsx_2 = require("./xlsx");
Object.defineProperty(exports, "Capacities", { enumerable: true, get: function () { return xlsx_2.Capacities; } });
Object.defineProperty(exports, "Designations", { enumerable: true, get: function () { return xlsx_2.Designations; } });
Object.defineProperty(exports, "DOB_Purposes", { enumerable: true, get: function () { return xlsx_2.DOB_Purposes; } });
Object.defineProperty(exports, "DOB_Status", { enumerable: true, get: function () { return xlsx_2.DOB_Status; } });
Object.defineProperty(exports, "EntityType", { enumerable: true, get: function () { return xlsx_2.EntityType; } });
Object.defineProperty(exports, "YesNo", { enumerable: true, get: function () { return xlsx_2.YesNo; } });
var Languages;
(function (Languages) {
    Languages["English"] = "English";
    Languages["Spanish"] = "Spanish";
})(Languages = exports.Languages || (exports.Languages = {}));
function getApplications(enPath, esPath) {
    console.log('Loading English applications...');
    const enRows = xlsx_1.getRows(enPath);
    console.log('Loading Spanish applications...');
    const esRows = xlsx_1.getRows(esPath);
    const decoratedEnRows = enRows.map(row => Object.assign(row, {
        ApplicationId: `CV19GEN${row.NJEDAGrantApplication8_Id}`,
        Language: Languages.English,
    }));
    const decoratedEsRows = esRows.map(row => Object.assign(row, {
        ApplicationId: `CV19GES${row.SolicitudDeSubsidio_Id}`,
        Language: Languages.Spanish,
    }));
    // merge and sort
    // NOTE: this sorts by submission time, then by application number, which means Spanish
    //       applications will preceded English given a tie on the submission time.
    // NOTE: we would not have to sort on the application number if we had more granual
    //       submission times, but Cognito only exports at the minute level.
    // prettier-ignore
    const allRows = [...decoratedEnRows, ...decoratedEsRows].sort((a, b) => a.Entry_DateSubmitted - b.Entry_DateSubmitted ||
        parseInt(a.NJEDAGrantApplication8_Id || a.SolicitudDeSubsidio_Id) -
            parseInt(b.NJEDAGrantApplication8_Id || b.SolicitudDeSubsidio_Id));
    // add sequence number
    const applications = allRows.map((row, i) => Object.assign(row, { Sequence: i + 1 }));
    return applications;
}
exports.getApplications = getApplications;
//# sourceMappingURL=applications.js.map