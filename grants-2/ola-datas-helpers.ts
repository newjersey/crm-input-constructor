import * as types from './ola-datas-types';

export function getQuarterlyWageData(app: types.DecoratedApplication): types.QuarterlyWageData {
  if (app.wr30.notFound) {
    return {
      fteCount: null,
      quarterDesc: null,
    };
  }

  const DOLLARS_PER_HOUR = 10.0;
  const HOURS_PER_WEEK = 35.0;
  const WEEKS_PER_QUARTER = 13.0;
  const FTE_QUARTERLY_MIN_WAGE = DOLLARS_PER_HOUR * HOURS_PER_WEEK * WEEKS_PER_QUARTER;

  const year: number = Math.max(...app.wr30.wageRecords.map(record => record.Year));
  const quarter: number = Math.max(
    ...app.wr30.wageRecords.filter(record => record.Year === year).map(record => record.Quarter)
  );

  const fractionalFtes: number = app.wr30.wageRecords
    .filter(record => record.Year === year && record.Quarter === quarter)
    .map(record => Math.min(1, record.Dollars / FTE_QUARTERLY_MIN_WAGE))
    .reduce((sum, fraction) => sum + fraction, 0);

  const fteCount: number = Math.round(fractionalFtes);
  const quarterDesc: string = `Q${quarter} ${year}`;

  return {
    fteCount,
    quarterDesc,
  };
}
