import * as types from './types';
import { EntityType } from '../inputs/applications';
import { CleanStatus as TaxationCleanStatus } from '../inputs/restaurants/taxation';
import { DecoratedRestaurant } from '../inputs/restaurants';

export function yesNo(test: boolean): types.YesNo {
  return test ? 'Yes' : 'No';
}

export function flag(test: boolean): types.Flag {
  return test ? 'Yes' : '';
}

export function value(number?: number | null): types.Value {
  if (number === null || typeof number === 'undefined') {
    return null;
  }

  const valueObject: types.ValueObject = {
    Value: number,
    ExtensionData: null,
  };

  return valueObject;
}

export function getQuarterlyWageData(restaurant: DecoratedRestaurant): types.QuarterlyWageData {
  if (restaurant.wr30.notFound) {
    return {
      fteCount: null,
      quarterDesc: null,
    };
  }

  const DOLLARS_PER_HOUR = 10.0;
  const HOURS_PER_WEEK = 35.0;
  const WEEKS_PER_QUARTER = 13.0;
  const FTE_QUARTERLY_MIN_WAGE = DOLLARS_PER_HOUR * HOURS_PER_WEEK * WEEKS_PER_QUARTER;

  const year: number = Math.max(...restaurant.wr30.wageRecords.map(record => record.Year));
  const quarter: number = Math.max(
    ...restaurant.wr30.wageRecords
      .filter(record => record.Year === year)
      .map(record => record.Quarter)
  );

  const fractionalFtes: number = restaurant.wr30.wageRecords
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

export function getFindings(restaurant: DecoratedRestaurant): string {
  const fteCount = getQuarterlyWageData(restaurant).fteCount;
  const wr30Desc = getQuarterlyWageData(restaurant).quarterDesc;
  let findings: string[] = [];

  if (restaurant.taxation['Clean Ind.'] === TaxationCleanStatus.Not_Found) {
    findings.push('Unknown to Taxation.');
  }

  if (restaurant.taxation['Clean Ind.'] === TaxationCleanStatus.Not_Clear) {
    findings.push(
      `Taxation not clear${
        restaurant.taxation['Taxation Response']
          ? ` (${restaurant.taxation['Taxation Response']})`
          : ''
      }.`
    );
  }

  if (!restaurant.dol.isActiveEmployer) {
    findings.push('Possibly not an active employer, according to DOL.');
  }

  if (!restaurant.dol.uidNoGo) {
    findings.push('Issue with DOL status (UI).');
  }

  if (!restaurant.dol.whdNoGo) {
    findings.push('Issue with DOL status (WH).');
  }

  if (fteCount == null) {
    findings.push(`Could not determine FTE count from WR-30 data.`);
  }

  if (fteCount && fteCount > 50) {
    findings.push(
      `More than 50 Full-Time Equivalent workers at time of application (${fteCount}) based on ${wr30Desc} WR-30.`
    );
  }

  return findings.join(' ');
}

export function getOwnershipStructure(app: types.DecoratedApplication): types.OwnershipStructures {
  const _value = app.Organization_EntityType;
  const map = new Map<EntityType, types.OwnershipStructures>([
    [EntityType['Sole Proprietorship'], types.OwnershipStructures.SoleProprietorship],
    [EntityType['Limited Liability Corporation (LLC)'], types.OwnershipStructures.LLC],
    [EntityType['C-Corporation'], types.OwnershipStructures.C_Corporation],
    [EntityType['S-Corporation'], types.OwnershipStructures.S_Corporation],
    [EntityType['501(c)(3) nonprofit'], types.OwnershipStructures.Nonprofit],
    [EntityType['Other (e.g. estate)'], types.OwnershipStructures.Other],
    [EntityType['Public entity (e.g. municipality)'], types.OwnershipStructures.Other],
  ]);

  const result: types.OwnershipStructures | undefined = map.get(_value);

  if (typeof result === 'undefined') {
    throw new Error(
      `Unknown ownership structure value ${_value} for application ${app.ApplicationId}`
    );
  }

  return result;
}
