import * as types from './types';

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
