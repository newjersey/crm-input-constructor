import { Application } from './applications';

interface SamsData {
  readonly qux: number;
}

interface Sams {
  readonly sams: SamsData;
}

export function addSamsData(application: Application): Application & Sams {
  const sams: SamsData = {
    qux: 5,
  }

  return { ...application, sams };
}
