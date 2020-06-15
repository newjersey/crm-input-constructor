import { Application } from './applications';

interface GrantPhase1Data {
  readonly yak: number;
}

interface GrantPhase1 {
  readonly grantPhase1: GrantPhase1Data;
}

export function addGrantPhase1Data<T extends Application>(application: T): T & GrantPhase1 {
  const grantPhase1: GrantPhase1Data = {
    yak: 5,
  }

  return { ...application, grantPhase1 };
}
