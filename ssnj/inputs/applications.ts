import { getRows, Row } from './xlsx';

export { Designations, EntityType, YesNo } from './xlsx';

// TODO -- kill all readonly (replace with Readonly<T>)
export interface Application extends Row {
  readonly ApplicationId: string;
}

// I'm probably doing this wrong.
// Intermediary interfaces used while adding properties, ultipmately building to Application objects.
interface DecoratedRow extends Row {
  readonly ApplicationId: string;
}

export function getApplications(path: string): Application[] {
  console.log('Loading applications...');
  const rows: Row[] = getRows(path);

  const decoratedRows: DecoratedRow[] = rows.map(row =>
    Object.assign(row, {
      ApplicationId: `SSNJ${row["App Number"]}`,
    })
  );

  // add sequence number
  const applications: Application[] = decoratedRows.map((row, i) =>
    Object.assign(row)
  );

  return applications;
}
