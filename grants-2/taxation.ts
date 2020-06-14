import { Application } from './applications';

interface TaxationData {
  readonly baz: number;
}

interface Taxation {
  readonly taxation: TaxationData;
}

export function addTaxationData(application: Application): Application & Taxation {
  const taxation: TaxationData = {
    baz: 5,
  }

  return { ...application, taxation };
}
