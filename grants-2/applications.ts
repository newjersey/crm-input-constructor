import { getRows, EnRow, EsRow, Row } from './xlsx';

export enum Languages {
  English = 'English',
  Spanish = 'Spanish',
}

export interface Application extends Row {
  readonly ApplicationId: string;
  readonly Language: Languages;
  readonly Sequence: number;
}

// I'm probably doing this wrong.
// Intermediary interfaces used while adding properties, ultipmately building to Application objects.
interface DecoratedEnRow extends EnRow {
  readonly ApplicationId: string;
  readonly Language: Languages;
}

interface DecoratedEsRow extends EsRow {
  readonly ApplicationId: string;
  readonly Language: Languages;
}

export function getApplications(enPath: string, esPath: string): Application[] {
  console.log('Loading English applications...');
  const enRows: EnRow[] = <EnRow[]>getRows(enPath);

  console.log('Loading Spanish applications...');
  const esRows: EsRow[] = <EsRow[]>getRows(esPath);

  const decoratedEnRows: DecoratedEnRow[] = enRows.map(row =>
    Object.assign(row, {
      ApplicationId: `CV19GEN${row.NJEDAGrantApplication8_Id}`,
      Language: Languages.English,
    })
  );

  const decoratedEsRows: DecoratedEsRow[] = esRows.map(row =>
    Object.assign(row, {
      ApplicationId: `CV19GES${row.SolicitudDeSubsidio_Id}`,
      Language: Languages.Spanish,
    })
  );

  // merge and sort
  // NOTE: this sorts by submission time, then by application number, which means Spanish
  //       applications will preceded English given a tie on the submission time.
  // NOTE: we would not have to sort on the application number if we had more granual
  //       submission times, but Cognito only exports at the minute level.
  // prettier-ignore
  const allRows: (DecoratedEnRow|DecoratedEsRow)[] = [...decoratedEnRows, ...decoratedEsRows].sort(
    (a, b) =>
      a.Entry_DateSubmitted - b.Entry_DateSubmitted ||
      parseInt((<DecoratedEnRow>a).NJEDAGrantApplication8_Id || (<DecoratedEsRow>a).SolicitudDeSubsidio_Id) -
      parseInt((<DecoratedEnRow>b).NJEDAGrantApplication8_Id || (<DecoratedEsRow>b).SolicitudDeSubsidio_Id)
  );

  // add sequence number
  const applications: Application[] = allRows.map((row, i) =>
    Object.assign(row, { Sequence: i + 1 })
  );

  return applications;
}
