import { Application } from './applications';

interface DolData {
  readonly bar: number;
}

interface Dol {
  readonly dol: DolData;
}

export function addDolData<T extends Application>(application: T): T & Dol {
  const dol: DolData = {
    bar: 5
  };

  return { ...application, dol };
}
