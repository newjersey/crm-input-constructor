import { Application } from './applications';

interface WR30Data {
  readonly foo: number;
}

interface WR30 {
  readonly wr30: WR30Data;
}

export function addWR30Data<T extends Application>(application: T): T & WR30 {
  const wr30: WR30Data = {
    foo: 5,
  };

  return { ...application, wr30 };
}
