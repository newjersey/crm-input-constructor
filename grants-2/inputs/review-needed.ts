import { Application } from "./applications";
import XLSX from "xlsx";

export interface ReviewNeededData {
  readonly email: string;
  readonly product: string;
}

export interface Row {
  readonly OLA: string;
  readonly Product: string;
  readonly "Email (Applicant) (Account)": string;
}

export interface ReviewNeeded {
  readonly reviewNeeded?: ReviewNeededData;
}

interface DataMap {
  [ApplicationId: string]: ReviewNeededData;
}

// assumes single-sheet workbook
function getData(filePath: string): DataMap {
  const workbook = XLSX.readFile(filePath, { type: "file" });
  const sheetName: string = Object.keys(workbook.Sheets)[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet, { defval: undefined });
  const map: DataMap = {};

  rows.forEach((row) => {
    const { OLA: applicationId, Product: product, "Email (Applicant) (Account)": email } = row;

    map[applicationId] = { email, product }
  });

  return map;
}

let DATA_MAP: DataMap;

export async function init(path: string) {
  console.log("Loading need-review data...");
  DATA_MAP = getData(path);
}

export function addReviewNeededData<T extends Application>(
  application: T
): T & ReviewNeeded {
  const reviewNeeded: ReviewNeededData = DATA_MAP[application.ApplicationId];

  return { ...application, reviewNeeded };
}
